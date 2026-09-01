import { pool } from '../config/database.js';
import { insertNotification } from '../utils/notify.js';
import { toTransactionRow } from '../utils/serialize.js';
import { secureCode } from '../utils/secure.js';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

function assertCanOperate(row) {
  return (
    row.account_verified &&
    row.status !== 'suspended' &&
    row.status !== 'blocked' &&
    row.status !== 'pending'
  );
}

async function getEnabledRules() {
  const r = await pool.query(`SELECT * FROM transfer_rules WHERE enabled = true`);
  return r.rows;
}

/** Montant total des transfers déjà exécutés/autorités aujourd'hui (par type transfer). */
async function getTodayTransferred(userId) {
  const r = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
       FROM transactions
      WHERE user_id = $1 AND type IN ('transfer','external_transfer')
        AND status IN ('executed','authorized','completed')
        AND created_at::date = CURRENT_DATE`,
    [userId],
  );
  return Number(r.rows[0].total);
}

async function isNewBeneficiaryForUser(userId, iban) {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  const r = await pool.query(
    `SELECT 1 FROM transactions
      WHERE user_id = $1 AND type IN ('transfer','external_transfer')
        AND status IN ('executed','authorized','completed')
        AND UPPER(REPLACE(COALESCE(external_iban,''),' ','')) = $2
      LIMIT 1`,
    [userId, clean],
  );
  return r.rowCount === 0;
}

/**
 * Évalue les règles actives pour un virement.
 * Retourne: { status, rulesApplied: [], reason, actionRequired }
 * - 'executed'   : aucune règle bloquante -> virement exécuté
 * - 'verifying'  : au moins une règle passée en 'verifying'
 * - 'suspended'  : au moins une règle passée en 'suspended'
 */
async function evaluateRules({ userId, amount, iban, kycStatus, accountVerified }) {
  const rules = await getEnabledRules();
  const applied = [];
  let worst = 'executed';
  let reason = null;
  let actionRequired = null;

  const apply = (rule, hit) => {
    applied.push({ key: rule.key, name: rule.name, param: hit });
    if (rule.action === 'suspended') {
      worst = 'suspended';
      reason = reason || rule.reason || rule.name;
      actionRequired = actionRequired || rule.action_required || null;
    } else if (rule.action === 'verifying' && worst !== 'suspended') {
      worst = 'verifying';
      reason = reason || rule.reason || rule.name;
      actionRequired = actionRequired || rule.action_required || null;
    }
  };

  for (const rule of rules) {
    switch (rule.key) {
      case 'amount_threshold': {
        const threshold = Number(rule.params?.threshold || 0);
        if (threshold > 0 && amount > threshold) apply(rule, { amount, threshold });
        break;
      }
      case 'new_beneficiary': {
        if (await isNewBeneficiaryForUser(userId, iban)) apply(rule, {});
        break;
      }
      case 'unusual_activity': {
        // Heuristique simple : nombreux virements récents en peu de temps
        const recent = await pool.query(
          `SELECT COUNT(*) AS cnt FROM transactions
            WHERE user_id = $1 AND type IN ('transfer','external_transfer')
              AND created_at > NOW() - INTERVAL '2 hours'`,
          [userId],
        );
        if (Number(recent.rows[0].cnt) >= 5) apply(rule, { recentCount: Number(recent.rows[0].cnt) });
        break;
      }
      case 'low_verification': {
        if (kycStatus !== 'approved' || !accountVerified) apply(rule, { kycStatus, accountVerified });
        break;
      }
      case 'daily_limit': {
        const dailyLimit = Number(rule.params?.daily_limit || 0);
        const today = await getTodayTransferred(userId);
        if (dailyLimit > 0 && today + amount > dailyLimit) apply(rule, { today, dailyLimit });
        break;
      }
      default:
        break;
    }
  }

  return { status: worst, rulesApplied: applied, reason, actionRequired };
}

/**
 * Crée un virement (externe). Le montant est placé sous séquestre selon les règles.
 * Dès la création, on débite le compte (le solde "disponible" baisse) et on crée
 * une transaction avec le statut décidé par les règles. Un virement bloqué peut
 * ensuite être exécuté automatiquement après vérification, ou annulé (remboursé).
 */
export async function createTransfer(req, res) {
  const { accountHolder, iban, bic, bankName, amount: amt, label, beneficiaryId } = req.body;
  const amount = Number(amt);

  if (!accountHolder?.trim() || !iban?.trim() || !bic?.trim() || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Informations du bénéficiaire et montant requis' });
  }
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();

  const cli = await pool.connect();
  try {
    await cli.query('BEGIN');
    const me = await cli.query(`SELECT * FROM users WHERE id = $1 FOR UPDATE`, [req.userId]);
    if (me.rowCount === 0) throw new Error('not_found');
    if (!assertCanOperate(me.rows[0])) {
      await cli.query('ROLLBACK');
      return res.status(403).json({ error: 'Virement non autorisé. Le compte doit être actif et vérifié.' });
    }
    const bal = Number(me.rows[0].balance);
    if (bal < amount) {
      await cli.query('ROLLBACK');
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    // Enregistrer le bénéficiaire s'il est nouveau et qu'on le souhaite
    if (beneficiaryId) {
      const b = await cli.query(
        `SELECT id FROM beneficiaries WHERE id = $1 AND user_id = $2`,
        [beneficiaryId, req.userId],
      );
      if (b.rowCount === 0) {
        await cli.query('ROLLBACK');
        return res.status(400).json({ error: 'Bénéficiaire introuvable' });
      }
    }

    // Évaluation des règles
    const evalResult = await evaluateRules({
      userId: req.userId,
      amount,
      iban: cleanIban,
      kycStatus: me.rows[0].kyc_status,
      accountVerified: me.rows[0].account_verified,
    });

    const status = evalResult.status; // executed | verifying | suspended
    const reference = 'VIR' + Date.now().toString(36).toUpperCase() + secureCode(3);
    const lbl = label?.trim() || `Virement vers ${accountHolder.trim()}`;

    // Débiter le compte (le montant part en séquestre, quel que soit le statut)
    await cli.query(`UPDATE users SET balance = balance - $1 WHERE id = $2`, [amount, req.userId]);

    const txResult = await cli.query(
      `INSERT INTO transactions
         (user_id, type, amount, status, label, reference,
          external_iban, external_bic, external_account_holder, bank_name,
          reason, action_required, decision_history)
       VALUES ($1, 'external_transfer', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [req.userId, amount, status, lbl, reference,
       cleanIban, bic.trim().toUpperCase(), accountHolder.trim(), bankName?.trim() || null,
       evalResult.reason, evalResult.actionRequired,
       JSON.stringify([{ status, at: new Date().toISOString(), by: 'system', note: 'Création' }])],
    );

    const tx = txResult.rows[0];

    // Notifications selon le statut
    if (status === 'executed') {
      await insertNotification(cli, req.userId, 'Virement exécuté', `Votre virement de ${fmt(amount)} vers ${accountHolder.trim()} a été exécuté.`);
    } else if (status === 'verifying') {
      await insertNotification(cli, req.userId, 'Virement en vérification', `Votre virement de ${fmt(amount)} nécessite une vérification. ${evalResult.reason || ''}`);
    } else {
      await insertNotification(cli, req.userId, 'Virement suspendu', `Votre virement de ${fmt(amount)} est suspendu. ${evalResult.reason || ''}`);
    }

    await cli.query('COMMIT');
    const after = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.userId]);
    res.json({
      transfer: toTransfer(tx),
      account: toAccountSimple(after.rows[0]),
      message: messageForStatus(status),
    });
  } catch (e) {
    await cli.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    cli.release();
  }
}

/** Le client confirme la vérification -> la transaction passe de verifying à executed. */
export async function confirmVerification(req, res) {
  const { id } = req.params;
  const cli = await pool.connect();
  try {
    await cli.query('BEGIN');
    const r = await cli.query(
      `SELECT * FROM transactions WHERE id = $1 AND user_id = $2 AND status = 'verifying' FOR UPDATE`,
      [id, req.userId],
    );
    if (r.rowCount === 0) {
      await cli.query('ROLLBACK');
      return res.status(404).json({ error: 'Virement introuvable ou pas en vérification' });
    }
    const tx = r.rows[0];

    // Re-évaluer les règles avec les données utilisateur ACTUELLES (kyc_status et
    // account_verified vivent sur users, pas sur transactions). Sans cette lecture,
    // ces valeurs seraient undefined et la règle 'low_verification' se déclencherait
    // systématiquement, bloquant tous les virements en 'suspended'.
    const me = await cli.query(
      `SELECT kyc_status, account_verified FROM users WHERE id = $1`,
      [req.userId],
    );
    const up = me.rows[0] || { kyc_status: null, account_verified: false };

    const evalResult = await evaluateRules({
      userId: req.userId,
      amount: Number(tx.amount),
      iban: tx.external_iban,
      kycStatus: up.kyc_status,
      accountVerified: up.account_verified,
    });

    const finalStatus = evalResult.status === 'suspended' ? 'suspended' : 'executed';
    const history = [...(tx.decision_history || [])];
    history.push({ status: finalStatus, at: new Date().toISOString(), by: 'client', note: 'Vérification complétée' });

    await cli.query(
      `UPDATE transactions SET status = $1, reason = $2, action_required = $3, decision_history = $4 WHERE id = $5`,
      [finalStatus, evalResult.reason, evalResult.actionRequired, JSON.stringify(history), id],
    );

    if (finalStatus === 'executed') {
      await insertNotification(cli, req.userId, 'Virement exécuté', `Votre virement de ${fmt(tx.amount)} a été confirmé et exécuté.`);
    } else {
      await insertNotification(cli, req.userId, 'Virement suspendu', `Votre virement reste suspendu. ${evalResult.reason || ''}`);
    }

    await cli.query('COMMIT');
    const after = await pool.query(`SELECT * FROM transactions WHERE id = $1`, [id]);
    res.json({ transfer: toTransfer(after.rows[0]) });
  } catch (e) {
    await cli.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    cli.release();
  }
}

/** Le client paie les frais de retrait NEOBANK demandés par l'admin -> libère le virement. */
export async function payTransferFees(req, res) {
  const { id } = req.params;
  const cli = await pool.connect();
  try {
    await cli.query('BEGIN');
    const r = await cli.query(
      `SELECT * FROM transactions WHERE id = $1 AND user_id = $2 AND type IN ('transfer','external_transfer') FOR UPDATE`,
      [id, req.userId],
    );
    if (r.rowCount === 0) {
      await cli.query('ROLLBACK');
      return res.status(404).json({ error: 'Virement introuvable' });
    }
    const tx = r.rows[0];
    const fees = Number(tx.fees || 0);

    if (tx.status !== 'suspended' || fees <= 0) {
      await cli.query('ROLLBACK');
      return res.status(400).json({ error: 'Aucun frais de retrait en attente pour ce virement' });
    }

    const me = await cli.query(`SELECT * FROM users WHERE id = $1 FOR UPDATE`, [req.userId]);
    const bal = Number(me.rows[0].balance);
    if (bal < fees) {
      await cli.query('ROLLBACK');
      return res.status(400).json({ error: `Solde insuffisant pour régler les frais de ${fmt(fees)}` });
    }

    // Débiter les frais du solde client et libérer le virement
    await cli.query(`UPDATE users SET balance = balance - $1 WHERE id = $2`, [fees, req.userId]);
    const history = [...(tx.decision_history || [])];
    history.push({ status: 'executed', at: new Date().toISOString(), by: 'client', note: `Frais NEOBANK de ${fmt(fees)} payés, virement libéré`, fees });
    await cli.query(
      `UPDATE transactions SET status = 'executed', fees = $1, action_required = NULL, decision_history = $2 WHERE id = $3`,
      [fees, JSON.stringify(history), id],
    );

    await insertNotification(cli, req.userId, 'Frais payés - virement exécuté',
      `Les frais NEOBANK de ${fmt(fees)} ont été réglés. Votre virement de ${fmt(tx.amount)} est exécuté.`);

    await cli.query('COMMIT');
    const after = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.userId]);
    res.json({ transfer: toTransfer({ ...tx, status: 'executed', fees }), account: toAccountSimple(after.rows[0]) });
  } catch (e) {
    await cli.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    cli.release();
  }
}

export async function getMyTransfers(req, res) {
  try {
    const r = await pool.query(
      `SELECT * FROM transactions
        WHERE user_id = $1 AND type IN ('transfer','external_transfer')
        ORDER BY created_at DESC LIMIT 100`,
      [req.userId],
    );
    res.json({ transfers: r.rows.map(toTransfer) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function getTransfer(req, res) {
  try {
    const r = await pool.query(
      `SELECT * FROM transactions WHERE id = $1 AND user_id = $2 AND type IN ('transfer','external_transfer')`,
      [req.params.id, req.userId],
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'Virement introuvable' });
    res.json({ transfer: toTransfer(r.rows[0]) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

function toTransfer(row) {
  return {
    ...toTransactionRow(row),
    reference: row.reference,
    externalIban: row.external_iban,
    externalBic: row.external_bic,
    externalAccountHolder: row.external_account_holder,
    bankName: row.bank_name,
    reason: row.reason,
    actionRequired: row.action_required,
    decisionHistory: row.decision_history,
    fees: Number(row.fees || 0),
    statusLabel: statusLabel(row.status),
  };
}

function toAccountSimple(row) {
  return { id: row.id, balance: Number(row.balance), currency: 'EUR', iban: row.iban, bic: row.bic };
}

function messageForStatus(status) {
  if (status === 'executed') return 'Virement exécuté avec succès.';
  if (status === 'verifying') return 'Virement en cours de vérification.';
  return 'Virement suspendu. Consultez le motif pour agir.';
}

export function statusLabel(status) {
  const map = {
    pending: 'En attente',
    verifying: 'En vérification',
    suspended: 'Suspendu',
    authorized: 'Autorisé',
    executed: 'Exécuté',
    refused: 'Refusé',
    completed: 'Exécuté',
    failed: 'Échoué',
  };
  return map[status] || status;
}
