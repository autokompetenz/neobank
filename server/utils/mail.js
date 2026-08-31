import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@prestiter.it';
const SITE_NAME = 'Prestiter';
const SITE_URL = process.env.SITE_URL || 'https://prestiter.it';

function baseLayout(title, content) {
  return `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F9FB;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FB;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <tr><td style="background:linear-gradient(135deg,#0056B3,#003d7a);padding:32px 40px;text-align:center;">
        <div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:1px;">${SITE_NAME}</div>
      </td></tr>
      <tr><td style="padding:36px 40px;">
        <h2 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#1A1A2E;">${title}</h2>
        ${content}
      </td></tr>
      <tr><td style="padding:20px 40px 28px;border-top:1px solid rgba(0,0,0,0.06);text-align:center;">
        <p style="margin:0;font-size:12px;color:#636373;line-height:1.6;">
          ${SITE_NAME} S.p.A. &mdash; Via Corsica 57, 86039 Termoli (CB)<br>
          <a href="${SITE_URL}" style="color:#0056B3;">${SITE_URL}</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function sendMail(to, subject, html) {
  if (!process.env.SMTP_USER) {
    console.warn('[mail] SMTP_USER not configured — skipping email to', to);
    return;
  }
  try {
    await transporter.sendMail({ from: `"${SITE_NAME}" <${FROM}>`, to, subject, html });
    console.log(`[mail] Sent to ${to}: ${subject}`);
  } catch (err) {
    console.error(`[mail] Failed to send to ${to}:`, err.message);
  }
}

export async function sendWelcomeEmail(to, name) {
  const html = baseLayout('Benvenuto su ' + SITE_NAME + ' !', `
    <p style="font-size:15px;color:#4A4A5A;line-height:1.7;margin:0 0 16px;">Ciao <strong>${name}</strong>,</p>
    <p style="font-size:15px;color:#4A4A5A;line-height:1.7;margin:0 0 16px;">Il tuo account è stato creato con successo. Benvenuto nella nostra community !</p>
    <p style="font-size:15px;color:#4A4A5A;line-height:1.7;margin:0 0 24px;">Per utilizzare tutti i servizi, completa la verifica del tuo account dall'area personale.</p>
    <a href="${SITE_URL}/login" style="display:inline-block;padding:14px 32px;background:#0056B3;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Accedi al mio account</a>
  `);
  await sendMail(to, `Benvenuto su ${SITE_NAME} !`, html);
}

export async function sendStatusEmail(to, name, title, message) {
  const html = baseLayout(title, `
    <p style="font-size:15px;color:#4A4A5A;line-height:1.7;margin:0 0 16px;">Ciao <strong>${name}</strong>,</p>
    <p style="font-size:15px;color:#4A4A5A;line-height:1.7;margin:0 0 16px;">${message}</p>
    <a href="${SITE_URL}/login" style="display:inline-block;padding:14px 32px;background:#0056B3;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Vai al mio account</a>
  `);
  await sendMail(to, `${SITE_NAME} — ${title}`, html);
}

export async function sendActivityEmail(to, name, title, message) {
  const html = baseLayout(title, `
    <p style="font-size:15px;color:#4A4A5A;line-height:1.7;margin:0 0 16px;">Ciao <strong>${name}</strong>,</p>
    <p style="font-size:15px;color:#4A4A5A;line-height:1.7;margin:0 0 24px;">${message}</p>
    <a href="${SITE_URL}/login" style="display:inline-block;padding:14px 32px;background:#0056B3;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Vai al mio account</a>
  `);
  await sendMail(to, `${SITE_NAME} — ${title}`, html);
}
