// /api/v1 router. Used by the Vercel function (api/router.js) and by the Vite
// dev server, so local and production run the same code.

import { query, one } from './db.js';
import { HttpError, fail, sendJson, readJson, readMultipart, email, ipHash, isUuid } from './http.js';
import {
  currentSession, requireAuth, requireCsrf, startSession, endSession, rateLimit, hitCount,
  verifyPassword, hashPassword, burnPasswordCheck, passwordProblem
} from './auth.js';
import { MAX_UPLOAD_BYTES, storePublicFile, sendFile } from './files.js';
import * as clients from './routes/clients.js';
import * as careers from './routes/careers.js';
import * as enquiries from './routes/enquiries.js';
import * as pages from './routes/pages.js';
import * as push from './push.js';
import * as users from './routes/users.js';

const LOGIN_WINDOW = 15 * 60;

/** Browsers always send Origin on cross-site POSTs; refuse any that is not us. */
function checkOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  let originHost = null;
  try { originHost = new URL(origin).host; } catch { /* malformed */ }
  if (originHost !== host) fail(403, 'forbidden_origin', 'Requests from other sites are not accepted.');
}

const id = (value) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) fail(404, 'not_found', 'Not found.');
  return n;
};

const me = (session) => ({ user: { name: session.name, email: session.email, role: session.role }, csrfToken: session.csrf_token });

async function login(req, res) {
  const body = await readJson(req);
  const address = email(body, 'email', { label: 'Email' });
  const password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';
  const ipKey = `login-fail:ip:${ipHash(req)}`;
  const emailKey = `login-fail:email:${address}`;
  if ((await hitCount(ipKey, LOGIN_WINDOW)) >= 10 || (await hitCount(emailKey, LOGIN_WINDOW)) >= 5) {
    fail(429, 'rate_limited', 'Too many sign-in attempts. Wait 15 minutes and try again.');
  }
  const user = await one('SELECT id, name, email, role, password_hash FROM admin_users WHERE email = $1 AND is_active', [address]);
  const ok = user ? await verifyPassword(password, user.password_hash) : (await burnPasswordCheck(password), false);
  if (!ok) {
    await rateLimit(ipKey, { limit: Infinity, windowSeconds: LOGIN_WINDOW });
    await rateLimit(emailKey, { limit: Infinity, windowSeconds: LOGIN_WINDOW });
    fail(401, 'invalid_credentials', 'That email and password did not match.');
  }
  const csrfToken = await startSession(req, res, user.id);
  return { user: { name: user.name, email: user.email, role: user.role }, csrfToken };
}

async function changePassword(req, session) {
  const body = await readJson(req);
  const user = await one('SELECT password_hash FROM admin_users WHERE id = $1', [session.user_id]);
  if (!(await verifyPassword(String(body.currentPassword || ''), user.password_hash))) {
    fail(422, 'validation_failed', 'Your current password is not correct.', { field: 'currentPassword' });
  }
  const problem = passwordProblem(body.newPassword);
  if (problem) fail(422, 'validation_failed', problem, { field: 'newPassword' });
  await query('UPDATE admin_users SET password_hash = $1 WHERE id = $2', [await hashPassword(body.newPassword), session.user_id]);
  // sign out every other session for this account
  await query('DELETE FROM admin_sessions WHERE user_id = $1 AND id <> $2', [session.user_id, session.id]);
  return { ok: true };
}

async function stats() {
  const row = await one(`SELECT
      (SELECT count(*)::int FROM enquiries WHERE status = 'new') AS new_enquiries,
      (SELECT count(*)::int FROM enquiries) AS enquiries,
      (SELECT count(*)::int FROM job_applications WHERE status = 'new') AS new_applications,
      (SELECT count(*)::int FROM job_applications) AS applications,
      (SELECT count(*)::int FROM jobs WHERE status = 'open') AS open_jobs,
      (SELECT count(*)::int FROM jobs) AS jobs,
      (SELECT count(*)::int FROM clients) AS clients,
      (SELECT count(*)::int FROM case_studies WHERE status = 'published') AS published`);
  return {
    newEnquiries: row.new_enquiries, enquiries: row.enquiries, newApplications: row.new_applications, applications: row.applications,
    openJobs: row.open_jobs, jobs: row.jobs, clients: row.clients, published: row.published, drafts: row.clients - row.published
  };
}

async function route(req, res, method, parts, params) {
  const [a, b, c, d] = parts;
  const ok = (data, status = 200) => sendJson(res, status, { data });

  if (method !== 'GET' && method !== 'HEAD') checkOrigin(req);

  // ------------------------------------------------------------ public
  if (a === 'taxonomies' && !b && method === 'GET') return ok(await clients.taxonomies());
  if (a === 'clients' && !b && method === 'GET') return sendJson(res, 200, await clients.listPublic(params));
  if (a === 'clients' && b && !c && method === 'GET') return ok(await clients.getBySlug(b, false));
  if (a === 'jobs' && !b && method === 'GET') return ok(await careers.listOpenJobs());
  if (a === 'jobs' && b && !c && method === 'GET') return ok(await careers.getOpenJob(b));
  if (a === 'pages' && !b && method === 'GET') return ok(await pages.listPublished());
  if (a === 'pages' && b && !c && method === 'GET') return ok(await pages.getPublished(b));

  if (a === 'media' && b && !c && method === 'GET') {
    const file = isUuid(b) ? await one('SELECT original_name, mime_type, data FROM files WHERE id = $1 AND is_public', [b]) : null;
    if (!file) fail(404, 'not_found', 'File not found.');
    return sendFile(res, file, { cache: 'public, max-age=86400' });
  }

  if (a === 'enquiries' && !b && method === 'POST') return ok(await enquiries.submitEnquiry(req, await readJson(req, 32 * 1024)), 201);
  if (a === 'applications' && !b && method === 'POST') {
    const form = await readMultipart(req, { maxFileBytes: MAX_UPLOAD_BYTES });
    return ok(await careers.submitApplication(req, form), 201);
  }

  // -------------------------------------------------------------- auth
  if (a === 'auth') {
    if (b === 'login' && method === 'POST') return ok(await login(req, res));
    if (b === 'logout' && method === 'POST') { await endSession(req, res); return ok({ ok: true }); }
    if (b === 'me' && method === 'GET') { const session = await currentSession(req); return ok(session ? me(session) : null); }
    if (b === 'password' && method === 'POST') {
      const session = await requireAuth(req);
      requireCsrf(req, session);
      return ok(await changePassword(req, session));
    }
  }

  // ------------------------------------------------------------- admin
  if (a === 'admin') {
    const session = await requireAuth(req);
    if (method !== 'GET') requireCsrf(req, session);
    const userId = session.user_id;

    // HR: careers plus read-only enquiries. Team accounts: admins only.
    if (session.role === 'hr' && !((b === 'stats' && method === 'GET') || b === 'applications' || b === 'jobs'
      || (b === 'enquiries' && method === 'GET'))) {
      fail(403, 'forbidden', 'Your account does not have access to this section.');
    }
    if (b === 'users') {
      if (session.role !== 'admin') fail(403, 'forbidden', 'Only admins can manage team accounts.');
      if (!c && method === 'GET') return ok(await users.listUsers());
      if (!c && method === 'POST') return ok(await users.createUser(await readJson(req)), 201);
      if (c && method === 'PATCH') return ok(await users.updateUser(userId, id(c), await readJson(req)));
    }

    if (b === 'stats' && method === 'GET') return ok(await stats());

    if (b === 'uploads' && !c && method === 'POST') {
      const { file } = await readMultipart(req, { maxFileBytes: MAX_UPLOAD_BYTES, maxFields: 0 });
      return ok(await storePublicFile(file, userId), 201);
    }

    if (b === 'clients') {
      if (!c && method === 'GET') return ok(await clients.listAdmin());
      if (!c && method === 'POST') return ok(await clients.getBySlug(await clients.save(await readJson(req, 1024 * 1024), null, userId), true), 201);
      if (c && !d && method === 'GET') return ok(await clients.getBySlug(c, true));
      if (c && !d && method === 'PUT') return ok(await clients.getBySlug(await clients.save(await readJson(req, 1024 * 1024), c, userId), true));
      if (c && !d && method === 'DELETE') { await clients.remove(c); return ok({ ok: true }); }
      if (c && d === 'status' && method === 'POST') return ok(await clients.setStatus(c, (await readJson(req)).status, userId));
    }

    if (b === 'jobs') {
      if (!c && method === 'GET') return ok(await careers.listJobsAdmin());
      if (!c && method === 'POST') return ok(await careers.saveJob(await readJson(req), null), 201);
      if (c && method === 'GET') return ok(await careers.getJobAdmin(c));
      if (c && method === 'PUT') return ok(await careers.saveJob(await readJson(req), c));
      if (c && method === 'DELETE') { await careers.removeJob(c); return ok({ ok: true }); }
    }

    if (b === 'pages') {
      if (!c && method === 'GET') return ok(await pages.listAdmin());
      if (c && !d && method === 'GET') return ok(await pages.getAdmin(c));
      if (c && !d && method === 'PUT') return ok(await pages.save(c, await readJson(req, 128 * 1024), userId));
    }

    if (b === 'push') {
      if (c === 'devices' && !d && method === 'GET') return ok(await push.listDevices(userId));
      if (c === 'devices' && !d && method === 'POST') return ok(await push.registerDevice(req, userId, await readJson(req, 16 * 1024)), 201);
      if (c === 'devices' && d && method === 'PATCH') return ok(await push.updateDevice(userId, id(d), await readJson(req)));
      if (c === 'devices' && d && method === 'DELETE') { await push.removeDevice(userId, id(d)); return ok({ ok: true }); }
      if (c === 'test' && method === 'POST') return ok(await push.sendTest(userId));
    }

    if (b === 'enquiries') {
      if (!c && method === 'GET') return ok(await enquiries.listEnquiries(params));
      if (c && method === 'PATCH') return ok(await enquiries.updateEnquiry(id(c), await readJson(req)));
      if (c && method === 'DELETE') { await enquiries.removeEnquiry(id(c)); return ok({ ok: true }); }
    }

    if (b === 'applications') {
      if (!c && method === 'GET') return ok(await careers.listApplications(params));
      if (c && d === 'resume' && method === 'GET') return sendFile(res, await careers.resumeFor(id(c)), { download: true });
      if (c && !d && method === 'PATCH') return ok(await careers.updateApplication(id(c), await readJson(req)));
      if (c && !d && method === 'DELETE') { await careers.removeApplication(id(c)); return ok({ ok: true }); }
    }
    fail(404, 'not_found', 'Unknown admin endpoint.');
  }

  fail(404, 'not_found', 'Unknown endpoint.');
}

export async function handle(req, res) {
  const parsed = new URL(req.url, 'http://localhost');
  // Vercel rewrites /api/v1/<path> to /api/router?__path=<path>
  const path = parsed.searchParams.get('__path') ?? parsed.pathname.replace(/^.*?\/api\/v1\/?/, '');
  const parts = path.split('/').filter(Boolean).map((part) => decodeURIComponent(part));
  try {
    await route(req, res, req.method, parts, parsed.searchParams);
  } catch (error) {
    if (error instanceof HttpError) {
      return sendJson(res, error.status, { error: { code: error.code, message: error.message, ...error.extra } });
    }
    // never send driver messages, queries or stack traces to the client
    console.error('[api]', req.method, path, error);
    return sendJson(res, 500, { error: { code: 'server_error', message: 'Something went wrong. Please try again.' } });
  }
}

