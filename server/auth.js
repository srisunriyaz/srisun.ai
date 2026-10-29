// Passwords (scrypt), server-side sessions, CSRF and rate limiting.

import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { query, one } from './db.js';
import { fail, parseCookies, ipHash } from './http.js';

const scrypt = promisify(scryptCb);
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 96 * 1024 * 1024 };
export const SESSION_COOKIE = '__Host-srisun_admin';
const DEV_COOKIE = 'srisun_admin';        // __Host- requires https; local dev is http
const SESSION_HOURS = 8;

const isHttps = (req) => (req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
const cookieName = (req) => (isHttps(req) ? SESSION_COOKIE : DEV_COOKIE);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, N, r, p, salt, hash] = String(stored || '').split('$');
  if (scheme !== 'scrypt' || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const key = await scrypt(password, Buffer.from(salt, 'base64'), expected.length, { N: +N, r: +r, p: +p, maxmem: SCRYPT.maxmem });
  return timingSafeEqual(key, expected);
}

// a valid hash to compare against when the email is unknown, so both paths cost the same
let dummyHash = null;
export async function burnPasswordCheck(password) {
  dummyHash ??= await hashPassword(randomBytes(12).toString('hex'));
  await verifyPassword(password, dummyHash);
}

export function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < 12) return 'Use at least 12 characters.';
  if (password.length > 200) return 'Use 200 characters or fewer.';
  if (!/[a-z]/i.test(password) || !/\d/.test(password)) return 'Use letters and at least one number.';
  return null;
}

// ------------------------------------------------------------------ sessions
export async function currentSession(req) {
  if (req._session !== undefined) return req._session;
  const token = parseCookies(req)[cookieName(req)] || '';
  req._session = null;
  if (/^[a-f0-9]{64}$/.test(token)) {
    req._session = await one(
      `SELECT s.id, s.csrf_token, u.id AS user_id, u.email, u.name, u.role
         FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id
        WHERE s.id = $1 AND s.expires_at > now() AND u.is_active`,
      [sha256(token)]
    );
  }
  return req._session;
}

export async function requireAuth(req) {
  const session = await currentSession(req);
  if (!session) fail(401, 'unauthenticated', 'Sign in to continue.');
  return session;
}

export function requireCsrf(req, session) {
  const sent = String(req.headers['x-csrf-token'] || '');
  const expected = Buffer.from(session.csrf_token);
  if (sent.length !== expected.length || !timingSafeEqual(Buffer.from(sent), expected)) {
    fail(419, 'csrf_failed', 'Your session has expired. Reload the page and try again.');
  }
}

const cookie = (req, value, maxAge) => [
  `${cookieName(req)}=${value}`, 'Path=/', `Max-Age=${maxAge}`, 'HttpOnly', 'SameSite=Strict', ...(isHttps(req) ? ['Secure'] : [])
].join('; ');

export async function startSession(req, res, userId) {
  const token = randomBytes(32).toString('hex');
  const csrf = randomBytes(32).toString('hex');
  await query(
    `INSERT INTO admin_sessions (id, user_id, csrf_token, ip_hash, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5, now() + make_interval(hours => $6))`,
    [sha256(token), userId, csrf, ipHash(req), String(req.headers['user-agent'] || '').slice(0, 255), SESSION_HOURS]
  );
  await query('UPDATE admin_users SET last_login_at = now() WHERE id = $1', [userId]);
  await query('DELETE FROM admin_sessions WHERE expires_at < now()');
  res.setHeader('Set-Cookie', cookie(req, token, SESSION_HOURS * 3600));
  return csrf;
}

export async function endSession(req, res) {
  const token = parseCookies(req)[cookieName(req)] || '';
  if (/^[a-f0-9]{64}$/.test(token)) await query('DELETE FROM admin_sessions WHERE id = $1', [sha256(token)]);
  res.setHeader('Set-Cookie', cookie(req, '', 0));
}

// ------------------------------------------------------------- rate limiting
/** Counts a hit in a fixed window; throws 429 once `limit` is exceeded. */
export async function rateLimit(key, { limit, windowSeconds, message = 'Too many attempts. Please wait and try again.' }) {
  const row = await one(
    `INSERT INTO rate_limits (key, bucket, hits)
     VALUES ($1, to_timestamp(floor(extract(epoch FROM now()) / $2) * $2), 1)
     ON CONFLICT (key, bucket) DO UPDATE SET hits = rate_limits.hits + 1
     RETURNING hits`,
    [key, windowSeconds]
  );
  if (Math.random() < 0.02) await query("DELETE FROM rate_limits WHERE bucket < now() - interval '1 day'");
  if (row.hits > limit) fail(429, 'rate_limited', message);
}

/** Read-only check, used for failed-login counters. */
export async function hitCount(key, windowSeconds) {
  const row = await one(
    `SELECT hits FROM rate_limits WHERE key = $1 AND bucket = to_timestamp(floor(extract(epoch FROM now()) / $2) * $2)`,
    [key, windowSeconds]
  );
  return row?.hits ?? 0;
}
