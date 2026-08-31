import { pool } from '../config/database.js';
import { insertNotification } from '../utils/notify.js';
import { logAudit, listAuditLogs } from '../utils/audit.js';
import { statusLabel } from './transfers.controller.js';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

/** Liste de tous les virements avec recherche/filtres par statut. */
export async function listAllTransfers(req, res) {
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
    createdAt: t.created_at?.toISOString?.() || t.created_at,
  })) });
}

/** Action admin sur un virement bloqué : autoriser, suspendre, refuser, rembourser. */
export async function decideTransfer(req, res) {
  const { id } = req.params;
  const { decision, reason, actionRequired } = req.body; // authorize | refuse | suspend | release

  if (!['authorize', 'refuse', 'suspend', 'release'].includes(decision)) {
    return res.status(400).json({ error: 'Décision invalide' });
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

    let newStatus;
    let note = `Décision admin: ${decision}`;
    switch (decision) {
      case 'authorize':
        newStatus = 'executed';
        note = 'Autorisé par l\'administrateur';
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

    // Si refusé ou suspendu après débit, pas de remboursement automatique sauf demande explicite.
    // release/authorize -> exécuté (déjà débité).
    const history = [...(tx.decision_history || [])];
    history.push({ status: newStatus, at: new Date().toISOString(), by: req.userRole || 'admin', note, reason: reason || null });

    await cli.query(
      `UPDATE transactions SET status = $1, reason = $2, action_required = $3, decision_history = $4
       WHERE id = $5`,
      [newStatus, reason || (newStatus === 'suspended' ? tx.reason : null) || null,
       actionRequired || (newStatus === 'suspended' ? tx.action_required : null) || null,
       JSON.stringify(history), id],
    );

    // Notification client
    let notifTitle, notifMsg;
    if (newStatus === 'executed') {
      notifTitle = 'Virement autorisé';
      notifMsg = `Votre virement de ${fmt(tx.amount)} a été autorisé et exécuté.`;
    } else if (newStatus === 'refused') {
      notifTitle = 'Virement refusé';
      notifMsg = `Votre virement de ${fmt(tx.amount)} a été refusé. ${reason || ''}`;
    } else {
      notifTitle = 'Virement suspendu';
      notifMsg = `Votre virement de ${fmt(tx.amount)} est suspendu. ${reason || ''}`;
    }
    await insertNotification(cli, tx.user_id, notifTitle, notifMsg);

    await logAudit({
      actorId: req.userId,
      actorRole: req.userRole,
      action: `transfer_${decision}`,
      entityType: 'transaction',
      entityId: id,
      oldValue: { status: before },
      newValue: { status: newStatus, reason: reason || null },
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
    if (!['refused', 'suspended', 'verifying', 'failed'].includes(tx.status)) {
      await cli.query('ROLLBACK');
      return res.status(400).json({ error: 'Seul un virement non exécuté peut être remboursé' });
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
