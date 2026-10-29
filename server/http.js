// Request/response helpers shared by every route. Errors are thrown as
// HttpError and turned into the JSON error shape in one place (app.js).

import { createHash } from 'node:crypto';
import Busboy from 'busboy';

export class HttpError extends Error {
  constructor(status, code, message, extra = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

export const fail = (status, code, message, extra) => { throw new HttpError(status, code, message, extra); };

export function sendJson(res, status, payload, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
  res.end(JSON.stringify(payload));
}

export function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const index = part.indexOf('=');
    if (index > 0) out[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return out;
}

export function clientIp(req) {
  return String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '')
    .split(',')[0].trim();
}

/** IPs are stored only as a salted hash: enough for rate limits, not identifying. */
export function ipHash(req) {
  const salt = createHash('sha256').update(process.env.DATABASE_URL || '').digest('hex');
  return createHash('sha256').update(`${salt}:${clientIp(req)}`).digest('hex').slice(0, 32);
}

const readRaw = (req, limit) => new Promise((resolve, reject) => {
  // Vercel may hand over an already-buffered body
  if (Buffer.isBuffer(req.rawBody)) return resolve(req.rawBody);
  const chunks = [];
  let size = 0;
  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > limit) {
      reject(new HttpError(413, 'too_large', 'The request is too large.'));
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });
  req.on('end', () => resolve(Buffer.concat(chunks)));
  req.on('error', reject);
});

export async function readJson(req, limit = 256 * 1024) {
  if (!String(req.headers['content-type'] || '').includes('application/json')) {
    fail(415, 'unsupported_media_type', 'Send the request as JSON.');
  }
  const raw = await readRaw(req, limit);
  if (!raw.length) return {};
  try {
    const value = JSON.parse(raw.toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch {
    return fail(400, 'invalid_json', 'The request body is not valid JSON.');
  }
}

/** Multipart with at most one file; the file is kept in memory (≤ maxFileBytes). */
export function readMultipart(req, { maxFileBytes, maxFields = 30, fieldLimit = 10000 }) {
  return new Promise((resolve, reject) => {
    let parser;
    try {
      parser = Busboy({ headers: req.headers, limits: { files: 1, fileSize: maxFileBytes, fields: maxFields, fieldSize: fieldLimit } });
    } catch {
      reject(new HttpError(415, 'unsupported_media_type', 'Send the form as multipart/form-data.'));
      return;
    }
    const fields = {};
    let file = null;
    let failed = null;
    parser.on('field', (name, value, info) => {
      if (info.valueTruncated) failed ??= new HttpError(422, 'validation_failed', `The field "${name}" is too long.`, { field: name });
      fields[name] = value;
    });
    parser.on('file', (name, stream, info) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('limit', () => { failed ??= new HttpError(413, 'upload_too_large', `The file is larger than ${Math.round(maxFileBytes / 1048576)} MB.`); });
      stream.on('end', () => { file = { field: name, filename: info.filename || 'file', buffer: Buffer.concat(chunks) }; });
    });
    parser.on('filesLimit', () => { failed ??= new HttpError(422, 'validation_failed', 'Attach only one file.'); });
    parser.on('error', () => reject(new HttpError(400, 'invalid_form', 'The form could not be read.')));
    parser.on('close', () => (failed ? reject(failed) : resolve({ fields, file })));
    if (Buffer.isBuffer(req.rawBody)) parser.end(req.rawBody);
    else req.pipe(parser);
  });
}

// ---------------------------------------------------------------- validation
/** Whitelists the keys a request may set: blocks mass assignment. */
export const only = (data, keys) => Object.fromEntries(keys.filter((key) => key in data).map((key) => [key, data[key]]));

// strips control characters except tab/newline
const clean = (value) => String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();

export function str(data, key, max, { required = false, label = key } = {}) {
  const value = clean(data[key]);
  if (!value) {
    if (required) fail(422, 'validation_failed', `${label} is required.`, { field: key });
    return null;
  }
  if (value.length > max) fail(422, 'validation_failed', `${label} must be ${max} characters or fewer.`, { field: key });
  return value;
}

export function email(data, key, { required = true, label = 'Email' } = {}) {
  const value = str(data, key, 190, { required, label });
  if (value && !/^[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[a-z]{2,}$/i.test(value)) {
    fail(422, 'validation_failed', `${label} is not a valid email address.`, { field: key });
  }
  return value ? value.toLowerCase() : null;
}

export function url(data, key, { label = 'URL' } = {}) {
  const value = str(data, key, 500, { label });
  if (!value) return null;
  let parsed;
  try { parsed = new URL(value); } catch { parsed = null; }
  if (!parsed || !['http:', 'https:'].includes(parsed.protocol)) {
    fail(422, 'validation_failed', `${label} must start with http:// or https://.`, { field: key });
  }
  return parsed.toString();
}

export function phone(data, key, { required = false, label = 'Phone number' } = {}) {
  const value = str(data, key, 40, { required, label });
  if (value && !/^[+()\d\s.-]{6,40}$/.test(value)) fail(422, 'validation_failed', `${label} can only contain digits, spaces and + ( ) - .`, { field: key });
  return value;
}

export function oneOf(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

export function stringList(value, { maxItems = 40, maxLength = 300 } = {}) {
  if (!Array.isArray(value)) return [];
  const out = [];
  for (const item of value) {
    const text = clean(item);
    if (text && text.length <= maxLength && !out.includes(text)) out.push(text);
    if (out.length >= maxItems) break;
  }
  return out;
}

export function slugify(value, fallback = 'item') {
  const slug = String(value || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug.slice(0, 80) || fallback;
}

export const isUuid = (value) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
