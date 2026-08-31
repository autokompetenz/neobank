import { pool } from '../config/database.js';
import { logAudit } from '../utils/audit.js';

const EUR_RE = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;

function normalize(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    iban: row.iban,
    bic: row.bic,
    bankName: row.bank_name,
    isInternal: row.is_internal,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
  };
}

export async function listBeneficiaries(req, res) {
  try {
    const r = await pool.query(
      `SELECT * FROM beneficiaries WHERE user_id = $1 ORDER BY name ASC`,
      [req.userId],
    );
    res.json({ beneficiaries: r.rows.map(normalize) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function createBeneficiary(req, res) {
  const { name, iban, bic, bankName } = req.body;
  if (!name?.trim() || !iban?.trim() || !bic?.trim()) {
    return res.status(400).json({ error: 'Nom, IBAN et BIC requis' });
  }
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  if (!EUR_RE.test(cleanIban)) {
    return res.status(400).json({ error: 'Format IBAN invalide' });
  }
  try {
    const r = await pool.query(
      `INSERT INTO beneficiaries (user_id, name, iban, bic, bank_name)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, name.trim(), cleanIban, bic.trim().toUpperCase(), bankName?.trim() || ''],
    );
    res.status(201).json({ beneficiary: normalize(r.rows[0]) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function updateBeneficiary(req, res) {
  const { id } = req.params;
  const { name, iban, bic, bankName } = req.body;
  try {
    const existing = await pool.query(
      `SELECT * FROM beneficiaries WHERE id = $1 AND user_id = $2`,
      [id, req.userId],
    );
    if (existing.rowCount === 0) return res.status(404).json({ error: 'Bénéficiaire introuvable' });

    const row = existing.rows[0];
    const cleanIban = (iban ?? row.iban).replace(/\s/g, '').toUpperCase();
    if (!EUR_RE.test(cleanIban)) return res.status(400).json({ error: 'Format IBAN invalide' });

    const r = await pool.query(
      `UPDATE beneficiaries SET
         name = COALESCE(NULLIF($1,''), name),
         iban = $2,
         bic = COALESCE(NULLIF($3,''), bic),
         bank_name = COALESCE($4, bank_name)
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [name ?? '', cleanIban, bic ?? '', bankName ?? null, id, req.userId],
    );
    await logAudit({ actorId: req.userId, action: 'beneficiary_update', entityType: 'beneficiary', entityId: id });
    res.json({ beneficiary: normalize(r.rows[0]) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function deleteBeneficiary(req, res) {
  const { id } = req.params;
  try {
    const r = await pool.query(
      `DELETE FROM beneficiaries WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.userId],
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'Bénéficiaire introuvable' });
    await logAudit({ actorId: req.userId, action: 'beneficiary_delete', entityType: 'beneficiary', entityId: id });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
