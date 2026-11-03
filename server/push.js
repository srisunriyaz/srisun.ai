// Firebase Cloud Messaging (HTTP v1) push alerts for signed-in admins.
// The service account lives only in the FIREBASE_SERVICE_ACCOUNT environment
// variable (the whole JSON); it is never sent to the browser or stored in Git.
// Payloads carry no visitor details: just a title, a short line and a link.

import { createSign } from 'node:crypto';
import { query, one } from './db.js';
import { fail, str } from './http.js';

let account;
const serviceAccount = () => {
  if (account !== undefined) return account;
  try { account = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || 'null'); } catch { account = null; }
  if (account && !(account.client_email && account.private_key && account.project_id)) account = null;
  return account;
};

export const pushConfigured = () => Boolean(serviceAccount());

let cachedToken = null;
async function accessToken() {
  if (cachedToken && cachedToken.expires > Date.now() + 60_000) return cachedToken.value;
  const sa = serviceAccount();
  const b64 = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600
  })}`;
  const assertion = `${unsigned}.${createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url')}`;
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    signal: AbortSignal.timeout(8000)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`token request failed (${response.status})`);
  cachedToken = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}

// Tokens FCM reports as gone or malformed are deleted; other failures are kept and recorded.
const DEAD_TOKEN = new Set(['UNREGISTERED', 'INVALID_ARGUMENT', 'NOT_FOUND', 'SENDER_ID_MISMATCH']);

async function sendTo(device, { title, body, path }, token) {
  const url = new URL(path, device.origin).href;
  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${serviceAccount().project_id}/messages:send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: { token: device.token, data: { title, body, url }, webpush: { headers: { Urgency: 'high', TTL: '86400' } } } }),
    signal: AbortSignal.timeout(8000)
  });
  if (response.ok) {
    await query('UPDATE push_devices SET last_sent_at = now(), last_error = NULL WHERE id = $1', [device.id]);
    return 'sent';
  }
  const error = (await response.json().catch(() => null))?.error;
  const code = error?.details?.find((item) => item.errorCode)?.errorCode || error?.status || String(response.status);
  if (DEAD_TOKEN.has(code)) { await query('DELETE FROM push_devices WHERE id = $1', [device.id]); return 'removed'; }
  await query('UPDATE push_devices SET last_error = $1 WHERE id = $2', [`${code}: ${error?.message || ''}`.slice(0, 300), device.id]);
  return 'failed';
}

/** Sends to every enabled device of active admins (or one user's). Never throws. */
export async function notifyAdmins(message, { userId = null } = {}) {
  const result = { sent: 0, failed: 0, removed: 0 };
  if (!pushConfigured()) { console.warn('[push] FIREBASE_SERVICE_ACCOUNT is not set; push skipped'); return result; }
  try {
    const devices = await query(
      `SELECT d.* FROM push_devices d JOIN admin_users u ON u.id = d.user_id
        WHERE d.enabled AND u.is_active AND u.role <> 'hr' AND ($1::int IS NULL OR d.user_id = $1)`, [userId]);
    if (!devices.length) return result;
    const token = await accessToken();
    const outcomes = await Promise.allSettled(devices.map((device) => sendTo(device, message, token)));
    outcomes.forEach((outcome) => { result[outcome.status === 'fulfilled' ? outcome.value : 'failed'] += 1; });
    if (result.failed) console.error('[push] some deliveries failed', result);
  } catch (error) {
    console.error('[push] notification failed:', error.message);
  }
  return result;
}

// ------------------------------------------------------------ admin routes
const devicePayload = (row) => ({
  id: row.id, tokenTail: row.token.slice(-12), label: row.label || 'Browser', origin: row.origin, enabled: row.enabled,
  lastError: row.last_error || '', lastSentAt: row.last_sent_at, lastSeenAt: row.last_seen_at, createdAt: row.created_at
});

export async function listDevices(userId) {
  const rows = await query('SELECT * FROM push_devices WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return { configured: pushConfigured(), devices: rows.map(devicePayload) };
}

/** Registers or refreshes a token. A token is unique, so re-registering just updates it. */
export async function registerDevice(req, userId, body) {
  const token = str(body, 'token', 4096, { required: true, label: 'Token' });
  if (!/^[\w:.-]{20,}$/.test(token)) fail(422, 'validation_failed', 'That device token is not valid.');
  const origin = req.headers.origin || `https://${req.headers['x-forwarded-host'] || req.headers.host}`;
  if (!/^https:\/\/[\w.-]+(:\d+)?$/.test(origin) && !/^http:\/\/localhost(:\d+)?$/.test(origin)) fail(422, 'validation_failed', 'Unsupported site address.');
  const previous = str(body, 'previousToken', 4096);
  if (previous && previous !== token) await query('DELETE FROM push_devices WHERE token = $1 AND user_id = $2', [previous, userId]);
  const row = await one(
    `INSERT INTO push_devices (user_id, token, label, origin) VALUES ($1, $2, $3, $4)
     ON CONFLICT (token) DO UPDATE SET user_id = EXCLUDED.user_id, label = EXCLUDED.label, origin = EXCLUDED.origin,
       last_seen_at = now()
     RETURNING *`,
    [userId, token, str(body, 'label', 80), origin]
  );
  return devicePayload(row);
}

export async function updateDevice(userId, id, body) {
  const row = await one('UPDATE push_devices SET enabled = $1 WHERE id = $2 AND user_id = $3 RETURNING *', [body.enabled === true, id, userId]);
  if (!row) fail(404, 'not_found', 'No such device.');
  return devicePayload(row);
}

export async function removeDevice(userId, id) {
  const rows = await query('DELETE FROM push_devices WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
  if (!rows.length) fail(404, 'not_found', 'No such device.');
}

export async function sendTest(userId) {
  if (!pushConfigured()) fail(503, 'push_not_configured', 'Push notifications are not configured on the server yet.');
  const result = await notifyAdmins({ title: 'Srisun admin', body: 'Test notification. Push alerts are working on this device.', path: '/admin/enquiries' }, { userId });
  if (!result.sent) fail(502, 'push_failed', result.removed ? 'This device is no longer registered. Turn notifications on again.' : 'No enabled device accepted the notification.');
  return result;
}
