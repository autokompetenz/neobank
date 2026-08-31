import { pool } from '../config/database.js';

/**
 * Enregistre une action dans le journal d'audit.
 * Les journaux ne peuvent pas être supprimés silencieusement :
 * il n'existe aucun endpoint de suppression des audit_logs.
 */
export async function logAudit({
  actorId = null,
  actorRole = '',
  action,
  entityType = '',
  entityId = '',
  oldValue = null,
  newValue = null,
  meta = {},
  ip = '',
}) {
  try {
    // IP fictive pour le prototype si absente
    const fakeIp = ip || `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    await pool.query(
      `INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, old_value, new_value, meta, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [actorId, actorRole, action, entityType, entityId,
       oldValue ? JSON.stringify(oldValue) : null,
       newValue ? JSON.stringify(newValue) : null,
       JSON.stringify(meta || {}),
       fakeIp],
    );
  } catch (e) {
    console.error('[audit] logAudit error:', e.message);
  }
}

export async function listAuditLogs({ limit = 200, actorId, entityType, action, q } = {}) {
  const conditions = [];
  const params = [];
  const add = (c, v) => { params.push(v); conditions.push(`$${params.length} ${c}`); };

  if (actorId) add('actor_id =', actorId);
  if (entityType) add('entity_type =', entityType);
  if (action) add('action ILIKE', `%${action}%`);
  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(action ILIKE $${params.length} OR entity_type ILIKE $${params.length} OR
      CAST(old_value AS TEXT) ILIKE $${params.length} OR CAST(new_value AS TEXT) ILIKE $${params.length})`);
  }

  let sql = `SELECT al.*, u.name AS actor_name, u.email AS actor_email
             FROM audit_logs al
             LEFT JOIN users u ON al.actor_id = u.id`;
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY al.created_at DESC LIMIT $' + (params.length + 1);
  params.push(limit);

  const r = await pool.query(sql, params);
  return r.rows.map(toAuditLogRow);
}

export function toAuditLogRow(row) {
  return {
    id: row.id,
    actorId: row.actor_id,
    actorName: row.actor_name,
    actorEmail: row.actor_email,
    actorRole: row.actor_role,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    oldValue: row.old_value,
    newValue: row.new_value,
    meta: row.meta,
    ip: row.ip,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
  };
}
