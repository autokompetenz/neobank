import { pool } from '../config/database.js';
import { logAudit } from '../utils/audit.js';

function normalize(row) {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    enabled: row.enabled,
    params: row.params,
    action: row.action,
    reason: row.reason,
    actionRequired: row.action_required,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    updatedAt: row.updated_at?.toISOString?.() || row.updated_at,
  };
}

export async function listRules(req, res) {
  try {
    const r = await pool.query(`SELECT * FROM transfer_rules ORDER BY created_at ASC`);
    res.json({ rules: r.rows.map(normalize) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function updateRule(req, res) {
  const { id } = req.params;
  const { enabled, params, action, reason, action_required, name, description } = req.body;

  try {
    const existing = await pool.query(`SELECT * FROM transfer_rules WHERE id = $1`, [id]);
    if (existing.rowCount === 0) return res.status(404).json({ error: 'Règle introuvable' });
    const before = existing.rows[0];

    const r = await pool.query(
      `UPDATE transfer_rules SET
         enabled = COALESCE($1, enabled),
         params = COALESCE($2, params),
         action = COALESCE($3, action),
         reason = COALESCE($4, reason),
         action_required = COALESCE($5, action_required),
         name = COALESCE(NULLIF($6,''), name),
         description = COALESCE($7, description),
         updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [enabled ?? null,
       params ? JSON.stringify(params) : null,
       action ?? null,
       reason ?? null,
       action_required ?? null,
       name ?? '',
       description ?? null,
       id],
    );

    await logAudit({
      actorId: req.userId,
      actorRole: req.userRole,
      action: 'rule_update',
      entityType: 'transfer_rule',
      entityId: id,
      oldValue: { enabled: before.enabled, params: before.params, action: before.action },
      newValue: { enabled: r.rows[0].enabled, params: r.rows[0].params, action: r.rows[0].action },
    });

    res.json({ rule: normalize(r.rows[0]) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function toggleRule(req, res) {
  const { id } = req.params;
  try {
    const existing = await pool.query(`SELECT * FROM transfer_rules WHERE id = $1`, [id]);
    if (existing.rowCount === 0) return res.status(404).json({ error: 'Règle introuvable' });
    const before = existing.rows[0];
    const r = await pool.query(
      `UPDATE transfer_rules SET enabled = NOT enabled, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id],
    );
    await logAudit({
      actorId: req.userId,
      actorRole: req.userRole,
      action: 'rule_toggle',
      entityType: 'transfer_rule',
      entityId: id,
      oldValue: { enabled: before.enabled },
      newValue: { enabled: r.rows[0].enabled },
    });
    res.json({ rule: normalize(r.rows[0]) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
