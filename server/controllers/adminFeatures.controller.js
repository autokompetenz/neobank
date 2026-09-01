import { pool } from '../config/database.js';
import { insertNotification } from '../utils/notify.js';
import { logAudit, listAuditLogs } from '../utils/audit.js';
import { statusLabel } from './transfers.controller.js';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

/** Liste de tous les virements avec recherche/filtres par statut. */
export async function listAllTransfers(req, res) {
  try {
    const { status, q, clientId } = req.query;
    const conditions = [];
    const params = [];
    const add = (c, v) => { params.push(v); conditions.push(`$${params.length} ${c}`); };

    conditions.push(`t.type IN ('transfer','external_transfer')`);
    if (status) add('t.status =', status);
    if (clientId) add('t.user_id =', clientId);
    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(t.external_account_holder ILIKE $${params.length} OR
        t.label ILIKE $${params.length} OR t.reference ILIKE $${params.length} OR
        CAST(t.amount AS TEXT) ILIKE $${params.length} OR u.name ILIKE $${params.length} OR
        u.email ILIKE $${params.length})`);
    }

    const sql = `SELECT t.*, u.name AS client_name, u.email AS client_email
                 FROM transactions t JOIN users u ON t.user_id = u.id
                 WHERE ${conditions.join(' AND ')}
                 ORDER BY t.created_at DESC LIMIT 300`;
    const r = await pool.query(sql, params);
    res.json({ transfers: r.rows.map((t) => ({
      id: t.id,
      clientId: t.user_id,
      clientName: t.client_name,
      clientEmail: t.client_email,
      reference: t.reference,
      label: t.label,
      amount: Number(t.amount),
      status: t.status,
      statusLabel: statusLabel(t.status),
      externalAccountHolder: t.external_account_holder,
      externalIban: t.external_iban,
      externalBic: t.external_bic,
      bankName: t.bank_name,
      reason: t.reason,
      actionRequired: t.action_required,
      decisionHistory: t.decision_history,
      fees: Number(t.fees || 0),
      createdAt: t.created_at?.toISOString?.() || t.created_at,
    })) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des virements' });
  }
}

/** Action admin sur un virement bloqué : autoriser, suspendre, refuser, rembourser. */
export async function decideTransfer(req, res) {
  const { id } = req.params;
  const { decision, reason, actionRequired } = req.body; // authorize | refuse | suspend | release
  const fees = Number(req.body.fees);

  if (!['authorize', 'refuse', 'suspend', 'release', 'request_fees'].includes(decision)) {
    return res.status(400).json({ error: 'Décision invalide' });
  }
  if (!Number.isFinite(fees)) {
    return res.status(400).json({ error: 'Frais invalide' });
  }

  const cli = await pool.connect();
  try {
    await cli.query('BEGIN');
    const existing = await cli.query(
      `SELECT * FROM transactions WHERE id = $1 AND type IN ('transfer','external_transfer') FOR UPDATE`,
      [id],
    );
    if (existing.rowCount === 0) {
      await cli.query('ROLLBACK');
      return res.status(404).json({ error: 'Virement introuvable' });
    }
    const tx = existing.rows[0];
    const before = tx.status;

    // Paiement de frais demandé par NEOBANK : on ne valide pas directement, on
    // passe le virement en attente de paiement (suspended) et le client devra
    // payer les frais pour que le virement soit libéré.
    const feesPending = (fees > 0 && decision !== 'refuse') || decision === 'request_fees';
    let newStatus;
    let note = `Décision admin: ${decision}`;
    const finalStates = ['executed', 'refused'];
    switch (decision) {
      case 'request_fees':
        newStatus = 'suspended';
        note = reason || (fees > 0 ? `Frais NEOBANK de ${fmt(fees)} à payer` : 'Frais NEOBANK à payer avant exécution');
        break;
      case 'authorize':
        newStatus = feesPending ? 'suspended' : 'executed';
        note = feesPending ? (reason || 'Frais NEOBANK à payer avant exécution') : 'Autorisé par l\'administrateur';
        break;
      case 'refuse':
        newStatus = 'refused';
        note = 'Refusé par l\'administrateur';
        break;
      case 'suspend':
        newStatus = 'suspended';
        note = reason || 'Suspendu par l\'administrateur';
        break;
      case 'release':
        newStatus = 'executed';
        note = 'Vérification complétée, virement libéré';
        break;
    }

    // Ne pas re-décider un virement déjà dans un état final (ex: re-refuser un exécuté).
    if (finalStates.includes(before) && before !== newStatus) {
      await cli.query('ROLLBACK');
      return res.status(400).json({ error: 'Ce virement est déjà dans un état final, aucune décision possible' });
    }

    // Si refusé ou suspendu après débit, pas de remboursement automatique sauf demande explicite.
    // release/authorize -> exécuté (déjà débité).
    const history = [...(tx.decision_history || [])];
    const historyNote = feesPending ? (reason || 'Frais NEOBANK à payer') : note;
    history.push({ status: newStatus, at: new Date().toISOString(), by: req.userRole || 'admin', note: historyNote, reason: reason || null, fees: feesPending ? fees : null });

    const newReason = feesPending
      ? (reason || `Frais NEOBANK de ${fmt(fees)} à payer avant exécution du virement.`)
      : (reason || (newStatus === 'suspended' ? tx.reason : null) || null);
    const newActionRequired = feesPending
      ? `Paiement des frais de retrait de ${fmt(fees)} requis pour libérer votre virement.`
      : (actionRequired || (newStatus === 'suspended' ? tx.action_required : null) || null);

    await cli.query(
      `UPDATE transactions SET status = $1, reason = $2, action_required = $3, decision_history = $4, fees = $5
       WHERE id = $6`,
      [newStatus, newReason, newActionRequired,
       JSON.stringify(history), feesPending ? fees : 0, id],
    );

    // Notification client
    let notifTitle, notifMsg;
    if (newStatus === 'executed') {
      notifTitle = 'Virement autorisé';
      notifMsg = `Votre virement de ${fmt(tx.amount)} a été autorisé et exécuté.`;
    } else if (newStatus === 'refused') {
      notifTitle = 'Virement refusé';
      notifMsg = `Votre virement de ${fmt(tx.amount)} a été refusé. ${newReason || ''}`;
    } else if (feesPending) {
      notifTitle = 'Frais de retrait requis';
      notifMsg = `Des frais NEOBANK de ${fmt(fees)} sont requis pour libérer votre virement de ${fmt(tx.amount)}. ${newReason || ''}`;
    } else {
      notifTitle = 'Virement suspendu';
      notifMsg = `Votre virement de ${fmt(tx.amount)} est suspendu. ${newReason || ''}`;
    }
    await insertNotification(cli, tx.user_id, notifTitle, notifMsg);

    await logAudit({
      actorId: req.userId,
      actorRole: req.userRole,
      action: `transfer_${decision}`,
      entityType: 'transaction',
      entityId: id,
      oldValue: { status: before },
      newValue: { status: newStatus, fees: feesPending ? fees : null, reason: newReason || null },
      meta: { amount: Number(tx.amount), clientId: tx.user_id },
    });

    await cli.query('COMMIT');
    res.json({ ok: true, status: newStatus });
  } catch (e) {
    await cli.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    cli.release();
  }
}

/** Rembourser le montant d'un virement bloqué/refusé vers le solde client. */
export async function refundTransfer(req, res) {
  const { id } = req.params;
  const cli = await pool.connect();
  try {
    await cli.query('BEGIN');
    const existing = await cli.query(
      `SELECT * FROM transactions WHERE id = $1 AND type IN ('transfer','external_transfer') FOR UPDATE`,
      [id],
    );
    if (existing.rowCount === 0) {
      await cli.query('ROLLBACK');
      return res.status(404).json({ error: 'Virement introuvable' });
    }
    const tx = existing.rows[0];

    // Empêcher le double remboursement / la création de monnaie : seuls les états
    // non-exécutés ET non-déjà-refusés peuvent être remboursés, une seule fois.
    if (!['suspended', 'verifying', 'failed'].includes(tx.status)) {
      await cli.query('ROLLBACK');
      return res.status(400).json({ error: 'Seul un virement non exécuté et non remboursé peut être remboursé' });
    }
    if (Array.isArray(tx.decision_history) && tx.decision_history.some((h) => h.status === 'refused' && h.note === 'Virement remboursé au solde client')) {
      await cli.query('ROLLBACK');
      return res.status(400).json({ error: 'Ce virement a déjà été remboursé' });
    }

    // Créditer le solde
    await cli.query(`UPDATE users SET balance = balance + $1 WHERE id = $2`, [tx.amount, tx.user_id]);
    const history = [...(tx.decision_history || [])];
    history.push({ status: 'refused', at: new Date().toISOString(), by: req.userRole || 'admin', note: 'Virement remboursé au solde client' });
    await cli.query(`UPDATE transactions SET status = 'refused', decision_history = $1 WHERE id = $2`, [JSON.stringify(history), id]);

    await insertNotification(cli, tx.user_id, 'Virement remboursé',
      `Votre virement de ${fmt(tx.amount)} a été remboursé sur votre solde.`);
    await logAudit({
      actorId: req.userId,
      actorRole: req.userRole,
      action: 'transfer_refund',
      entityType: 'transaction',
      entityId: id,
      oldValue: { status: tx.status },
      newValue: { status: 'refused', refunded: Number(tx.amount) },
    });

    await cli.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await cli.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    cli.release();
  }
}

/** Liste du journal d'audit (admin). */
export async function getAuditLogs(req, res) {
  try {
    const logs = await listAuditLogs({
      limit: Number(req.query.limit) || 200,
      actorId: req.query.actorId,
      entityType: req.query.entityType,
      action: req.query.action,
      q: req.query.q,
    });
    res.json({ logs });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/** Permet de consulter/gérer les rôles admin des utilisateurs. */
export async function listAdminUsers(req, res) {
  try {
    const r = await pool.query(
      `SELECT id, name, email, role, admin_role, status, created_at FROM users WHERE role = 'admin' ORDER BY created_at ASC`,
    );
    res.json({ admins: r.rows.map((u) => ({
      id: u.id, name: u.name, email: u.email, role: u.role,
      adminRole: u.admin_role, status: u.status, createdAt: u.created_at?.toISOString?.() || u.created_at,
    })) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function setAdminRole(req, res) {
  // Défense en profondeur : seul un superadmin peut attribuer des rôles admin.
  if (req.userRole !== 'superadmin') {
    return res.status(403).json({ error: 'Accès refusé : seul un superadmin peut gérer les rôles' });
  }
  const { id } = req.params;
  const { adminRole } = req.body;
  if (!['superadmin', 'compliance', 'finance', 'support'].includes(adminRole)) {
    return res.status(400).json({ error: 'Rôle invalide' });
  }
  try {
    const existing = await pool.query(`SELECT admin_role FROM users WHERE id = $1 AND role = 'admin'`, [id]);
    if (existing.rowCount === 0) return res.status(404).json({ error: 'Admin introuvable' });
    const before = existing.rows[0].admin_role;
    await pool.query(`UPDATE users SET admin_role = $1 WHERE id = $2`, [adminRole, id]);
    await logAudit({
      actorId: req.userId,
      actorRole: req.userRole,
      action: 'admin_set_role',
      entityType: 'user',
      entityId: id,
      oldValue: { adminRole: before },
      newValue: { adminRole },
    });
    res.json({ ok: true, adminRole });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
