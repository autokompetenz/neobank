import { sendStatusEmail, sendActivityEmail } from './mail.js';

export async function insertNotification(client, userId, title, message) {
  await client.query(
    `INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)`,
    [userId, title, message]
  );
  sendEmailInBackground(userId, title, message);
}

async function sendEmailInBackground(userId, title, message) {
  try {
    const { pool } = await import('../config/database.js');
    const r = await pool.query(`SELECT name, email FROM users WHERE id = $1`, [userId]);
    if (r.rowCount === 0) return;
    const { name, email } = r.rows[0];
    if (!email) return;
    await sendStatusEmail(email, name, title, message);
  } catch (err) {
    console.error('[notify] Email send failed for user', userId, err.message);
  }
}
