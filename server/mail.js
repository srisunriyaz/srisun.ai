// Admin email notifications over SMTP. Settings come only from server-side
// environment variables (Vercel project settings / .env.local), never the bundle:
//   SMTP_HOST, SMTP_PORT (465 = TLS, otherwise STARTTLS), SMTP_USER, SMTP_PASS,
//   SMTP_FROM (defaults to SMTP_USER), NOTIFY_EMAIL (defaults to hello@srisun.ai).

import nodemailer from 'nodemailer';

let transport;
const getTransport = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT) || 587;
  transport ??= nodemailer.createTransport({
    host: SMTP_HOST, port, secure: port === 465, requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 10000
  });
  return transport;
};

export const mailConfigured = () => Boolean(getTransport());

/** Sends one message; resolves to true when the SMTP server accepted it. */
export async function sendAdminMail({ subject, text, replyTo }) {
  const smtp = getTransport();
  if (!smtp) { console.warn('[mail] SMTP is not configured; notification skipped:', subject); return false; }
  try {
    await smtp.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.NOTIFY_EMAIL || 'hello@srisun.ai',
      replyTo, subject, text
    });
    return true;
  } catch (error) {
    console.error('[mail] notification failed:', error.message);
    return false;
  }
}
