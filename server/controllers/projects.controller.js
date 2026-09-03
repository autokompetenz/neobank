import { pool } from '../config/database.js';
import { insertNotification } from './notify.js';
import { logAudit } from './audit.js';

const STATUSES = ['nouveau', 'en_analyse', 'informations_requises', 'documents_recus', 'en_cours', 'termine', 'refuse'];

const toApplication = (row) => ({
  id: row.id,
  userId: row.user_id,
  projectType: row.project_type,
  amount: row.amount ? Number(row.amount) : null,
  monthlyIncome: row.monthly_income ? Number(row.monthly_income) : null,
  employmentStatus: row.employment_status,
  country: row.country,
  fullName: row.full_name,
  phone: row.phone,
  resume: row.resume || {},
  status: row.status,
  advisorId: row.advisor_id,
  internalNotes: row.internal_notes || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toDocument = (row) => ({
  id: row.id,
  filename: row.filename,
  mimetype: row.mimetype,
  size: row.size,
  url: row.url,
  status: row.status,
  createdAt: row.created_at,
});

const toMessage = (row) => ({
  id: row.id,
  senderId: row.sender_id,
  senderRole: row.sender_role,
  message: row.message,
  isRead: row.is_read,
  createdAt: row.created_at,
});

// Soumission d'une demande de projet (clients connectés)
export async function submitApplication(req, res) {
  const { projectType, amount, monthlyIncome, employmentStatus, country, fullName, phone, resume } = req.body || {};
  if (!projectType) return res.status(400).json({ error: 'Type de projet requis' });
  try {
    const r = await pool.query(
      `INSERT INTO applications
         (user_id, project_type, amount, monthly_income, employment_status, country, full_name, phone, resume, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'nouveau')
       RETURNING *`,
      [req.userId, projectType, amount || null, monthlyIncome || null, employmentStatus || '', country || '', fullName || '', phone || '', resume || {}],
    );
    const app = toApplication(r.rows[0]);
    await insertNotification(req.userId, 'Demande reçue', 'Votre projet a bien été enregistré. Notre équipe va l’analyser rapidement.');
    await logAudit({ actorId: req.userId, actorRole: 'client', action: 'application_create', entityType: 'application', entityId: app.id, newValue: { projectType, amount }, meta: {} });
    res.status(201).json({ application: app });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur lors de la soumission' });
  }
}

export async function getMyApplications(req, res) {
  try {
    const r = await pool.query(
      `SELECT a.*, u.display_name AS advisor_name
       FROM applications a
       LEFT JOIN users u ON u.id = a.advisor_id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [req.userId],
    );
    res.json({ applications: r.rows.map((row) => ({ ...toApplication(row), advisorName: row.advisor_name })) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur de chargement' });
  }
}

export async function getApplication(req, res) {
  const { id } = req.params;
  try {
    const r = await pool.query(
      `SELECT a.*, u.display_name AS advisor_name
       FROM applications a
       LEFT JOIN users u ON u.id = a.advisor_id
       WHERE a.id = $1`,
      [id],
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'Dossier introuvable' });
    const app = r.rows[0];
    if (app.user_id !== req.userId && req.userRole !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
    const docs = await pool.query(`SELECT * FROM application_documents WHERE application_id = $1 ORDER BY created_at`, [id]);
    const msgs = await pool.query(`SELECT * FROM application_messages WHERE application_id = $1 ORDER BY created_at`, [id]);
    res.json({
      application: { ...toApplication(app), advisorName: app.advisor_name },
      documents: docs.rows.map(toDocument),
      messages: msgs.rows.map(toMessage),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur de chargement' });
  }
}

// Upload de document (métadonnées ; stockage serveur de fichiers en production)
export async function addDocument(req, res) {
  const { id } = req.params;
  const { filename, mimetype, size, url } = req.body || {};
  if (!filename) return res.status(400).json({ error: 'Nom de fichier requis' });
  try {
    const app = await pool.query(`SELECT * FROM applications WHERE id = $1`, [id]);
    if (app.rowCount === 0) return res.status(404).json({ error: 'Dossier introuvable' });
    if (app.rows[0].user_id !== req.userId && req.userRole !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
    const r = await pool.query(
      `INSERT INTO application_documents (application_id, uploader_id, filename, mimetype, size, url, status)
       VALUES ($1,$2,$3,$4,$5,$6,'en_attente') RETURNING *`,
      [id, req.userId, filename, mimetype || '', size || 0, url || ''],
    );
    res.status(201).json({ document: toDocument(r.rows[0]) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur lors de l’ajout du document' });
  }
}

export async function listDocuments(req, res) {
  const { id } = req.params;
  try {
    const r = await pool.query(`SELECT * FROM application_documents WHERE application_id = $1 ORDER BY created_at`, [id]);
    res.json({ documents: r.rows.map(toDocument) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur de chargement' });
  }
}

export async function sendMessage(req, res) {
  const { id } = req.params;
  const { message } = req.body || {};
  if (!message || !message.trim()) return res.status(400).json({ error: 'Message requis' });
  try {
    const app = await pool.query(`SELECT * FROM applications WHERE id = $1`, [id]);
    if (app.rowCount === 0) return res.status(404).json({ error: 'Dossier introuvable' });
    const isClient = app.rows[0].user_id === req.userId;
    if (!isClient && req.userRole !== 'admin' && app.rows[0].advisor_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const r = await pool.query(
      `INSERT INTO application_messages (application_id, sender_id, sender_role, message, is_read)
       VALUES ($1,$2,$3,$4,false) RETURNING *`,
      [id, req.userId, isClient ? 'client' : 'conseiller', message.trim()],
    );
    const otherId = isClient ? app.rows[0].advisor_id : app.rows[0].user_id;
    if (otherId) await insertNotification(otherId, isClient ? 'Nouveau message' : 'Nouveau message du conseiller', message.trim());
    res.status(201).json({ message: toMessage(r.rows[0]) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur lors de l’envoi' });
  }
}

export async function markMessagesRead(req, res) {
  const { id } = req.params;
  try {
    await pool.query(
      `UPDATE application_messages SET is_read = true
       WHERE application_id = $1 AND sender_id <> $2`,
      [id, req.userId],
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Erreur' });
  }
}

// ---- Admin ----
export async function listAllApplications(req, res) {
  try {
    const r = await pool.query(
      `SELECT a.*, u.display_name AS client_name, u.email AS client_email,
              ad.display_name AS advisor_name
       FROM applications a
       LEFT JOIN users u ON u.id = a.user_id
       LEFT JOIN users ad ON ad.id = a.advisor_id
       ORDER BY a.created_at DESC`,
    );
    const apps = r.rows.map((row) => ({
      ...toApplication(row),
      clientName: row.client_name,
      clientEmail: row.client_email,
      advisorName: row.advisor_name,
    }));
    const counts = {};
    for (const s of STATUSES) counts[s] = apps.filter((a) => a.status === s).length;
    res.json({ applications: apps, counts });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur de chargement' });
  }
}

export async function decideApplication(req, res) {
  const { id } = req.params;
  const { status, note, advisorId } = req.body || {};
  if (status && !STATUSES.includes(status)) return res.status(400).json({ error: 'Statut invalide' });
  try {
    const app = await pool.query(`SELECT * FROM applications WHERE id = $1`, [id]);
    if (app.rowCount === 0) return res.status(404).json({ error: 'Dossier introuvable' });
    const tx = app.rows[0];
    let internalNotes = tx.internal_notes || [];
    if (note) {
      internalNotes = [...internalNotes, { by: req.userId, at: new Date().toISOString(), note }];
    }
    const r = await pool.query(
      `UPDATE applications SET status = COALESCE($2, status), advisor_id = COALESCE($3, advisor_id),
              internal_notes = $4, updated_at = now()
       WHERE id = $1 RETURNING *`,
      [id, status || null, advisorId || null, JSON.stringify(internalNotes)],
    );
    const newStatus = status || tx.status;
    if (['termine', 'refuse', 'en_analyse', 'informations_requises', 'documents_recus', 'en_cours'].includes(newStatus) && newStatus !== tx.status) {
      await insertNotification(tx.user_id, 'Votre dossier a été mis à jour', statusLabelFr(newStatus));
    }
    await logAudit({ actorId: req.userId, actorRole: req.userRole || 'admin', action: 'application_decide', entityType: 'application', entityId: id, newValue: { status: newStatus }, meta: { clientId: tx.user_id } });
    res.json({ application: toApplication(r.rows[0]) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
}

function statusLabelFr(status) {
  const map = {
    nouveau: 'Nouveau', en_analyse: 'En analyse', informations_requises: 'Informations requises',
    documents_recus: 'Documents reçus', en_cours: 'En cours', termine: 'Terminé', refuse: 'Refusé',
  };
  return map[status] || status;
}