// End-to-end API checks: access control, CSRF, origin checks, validation,
// upload sniffing, rate limits, and the enquiry → admin and application → admin
// flows. Everything it creates is deleted again at the end.
//
//   ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/api-test.mjs http://localhost:5173
//   … node scripts/api-test.mjs https://srisun-website.vercel.app --prod
//
// --prod skips the checks that would exhaust your own IP's rate limits.
import { randomBytes } from 'node:crypto';

const origin = (process.argv[2] || 'http://localhost:5173').replace(/\/$/, '');
const prod = process.argv.includes('--prod');
const API = `${origin}/api/v1`;
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  -> ${detail}`}`); };

let cookie = '';
let csrf = '';
async function call(method, path, { body, form, headers = {}, auth = true, token = csrf, raw = false } = {}) {
  const init = { method, headers: { Origin: origin, ...headers } };
  if (auth && cookie) init.headers.Cookie = cookie;
  if (auth && token && method !== 'GET') init.headers['X-CSRF-Token'] = token;
  if (body !== undefined) { init.headers['Content-Type'] ??= 'application/json'; init.body = typeof body === 'string' ? body : JSON.stringify(body); }
  if (form) init.body = form;
  const response = await fetch(API + path, init);
  if (raw) return response;
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: response.status, json, headers: response.headers };
}

const pdf = () => new Blob([Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n')], { type: 'application/pdf' });
function application(overrides = {}, file = pdf(), filename = 'resume.pdf') {
  const form = new FormData();
  const fields = { job: 'hr-executive', firstName: 'Test', lastName: 'Applicant', email: 'test.applicant@example.com', phone: '+91 90000 00000', currentLocation: 'Chennai, Tamil Nadu', skills: 'Automated test — please ignore', consent: 'yes', ...overrides };
  for (const [key, value] of Object.entries(fields)) if (value !== undefined) form.set(key, value);
  if (file) form.set('resume', file, filename);
  return form;
}

// ------------------------------------------------------------ public reads
{
  const list = await call('GET', '/clients?per_page=100', { auth: false });
  check('public client list loads', list.status === 200 && list.json.data.length > 0, list.status);
  check('no draft case study is exposed publicly', list.json.data.every((c) => !c.caseStudy || c.caseStudy.status === 'published'));
  const injected = await call('GET', `/clients?q=${encodeURIComponent("' OR 1=1 --")}`, { auth: false });
  check('SQL injection in search is treated as text', injected.status === 200 && injected.json.data.length === 0, injected.status);
  const slug = await call('GET', `/clients/${encodeURIComponent("x'; DROP TABLE clients; --")}`, { auth: false });
  check('SQL injection in slug returns 404', slug.status === 404, slug.status);
  const media = await call('GET', '/media/..%2F..%2Fetc%2Fpasswd', { auth: false });
  check('path traversal on media returns 404', media.status === 404, media.status);
  const jobs = await call('GET', '/jobs', { auth: false });
  check('open jobs list loads', jobs.status === 200 && jobs.json.data.length > 0, jobs.status);
  check('public job data has no internal fields', jobs.json.data.every((j) => !('status' in j) && !('dbId' in j)));
}

// ---------------------------------------------------------- access control
for (const [method, path] of [
  ['GET', '/admin/stats'], ['GET', '/admin/enquiries'], ['GET', '/admin/applications'], ['GET', '/admin/applications/1/resume'],
  ['GET', '/admin/jobs'], ['POST', '/admin/jobs'], ['GET', '/admin/clients'], ['DELETE', '/admin/clients/fine-deco-tiles'],
  ['PATCH', '/admin/enquiries/1'], ['POST', '/admin/uploads'], ['POST', '/auth/password'], ['GET', '/admin/pages'], ['PUT', '/admin/pages/privacy-policy']
]) {
  const response = await call(method, path, { auth: false, body: method === 'GET' ? undefined : {} });
  check(`${method} ${path} without a session is refused`, response.status === 401, response.status);
}
{
  const forged = await call('GET', '/admin/stats', { auth: false, headers: { Cookie: `__Host-srisun_admin=${'a'.repeat(64)}; srisun_admin=${'a'.repeat(64)}` } });
  check('forged session cookie is refused', forged.status === 401, forged.status);
}

// ------------------------------------------------------------------ login
{
  const fake = `nobody-${randomBytes(4).toString('hex')}@example.com`;
  const wrong = await call('POST', '/auth/login', { auth: false, body: { email: fake, password: 'not-the-password-1' } });
  check('wrong credentials are refused with a generic message', wrong.status === 401 && /did not match/.test(wrong.json?.error?.message), wrong.status);
  if (!prod) {
    let last = null;
    for (let i = 0; i < 5; i++) last = await call('POST', '/auth/login', { auth: false, body: { email: fake, password: 'not-the-password-1' } });
    check('repeated failed logins for one email are rate limited', last.status === 429, last.status);
  }
  const ok = await call('POST', '/auth/login', { auth: false, body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  check('admin can sign in', ok.status === 200 && ok.json?.data?.csrfToken, ok.status);
  const setCookie = ok.headers.get('set-cookie') || '';
  cookie = setCookie.split(';')[0];
  csrf = ok.json?.data?.csrfToken || '';
  check('session cookie is HttpOnly and SameSite=Strict', /HttpOnly/i.test(setCookie) && /SameSite=Strict/i.test(setCookie), setCookie.replace(/=[a-f0-9]{64}/, '=…'));
  if (origin.startsWith('https')) check('session cookie is Secure and __Host- prefixed', /;\s*Secure/i.test(setCookie) && setCookie.startsWith('__Host-'), setCookie.replace(/=[a-f0-9]{64}/, '=…'));
  const stats = await call('GET', '/admin/stats');
  check('signed-in admin can read stats', stats.status === 200, stats.status);
}

// --------------------------------------------------- csrf + origin checks
{
  const noToken = await call('POST', '/admin/jobs', { body: { title: 'x' }, token: '' });
  check('admin write without CSRF token is refused', noToken.status === 419, noToken.status);
  const badToken = await call('POST', '/admin/jobs', { body: { title: 'x' }, token: 'f'.repeat(64) });
  check('admin write with a wrong CSRF token is refused', badToken.status === 419, badToken.status);
  const crossSite = await call('POST', '/admin/jobs', { body: { title: 'x' }, headers: { Origin: 'https://evil.example' } });
  check('cross-site POST is refused', crossSite.status === 403, crossSite.status);
  const crossEnquiry = await call('POST', '/enquiries', { auth: false, body: { name: 'x', email: 'x@example.com', message: 'x' }, headers: { Origin: 'https://evil.example' } });
  check('cross-site public form POST is refused', crossEnquiry.status === 403, crossEnquiry.status);
  const notJson = await call('POST', '/enquiries', { auth: false, body: 'name=x', headers: { 'Content-Type': 'text/plain' } });
  check('non-JSON enquiry body is refused', notJson.status === 415, notJson.status);
}

// ------------------------------------------------------------------- jobs
let jobSlug = null;
{
  const created = await call('POST', '/admin/jobs', { body: { title: 'Test Role (automated)', summary: 'Temporary role created by the test suite.', responsibilities: ['One'], qualifications: ['Two'], status: 'draft', dbId: 1, slug: 'hijack' } });
  jobSlug = created.json?.data?.id;
  check('admin can create a job', created.status === 201 && jobSlug, created.status);
  check('job slug cannot be mass-assigned', jobSlug && jobSlug !== 'hijack');
  const hidden = await call('GET', `/jobs/${jobSlug}`, { auth: false });
  check('draft job is hidden from the public', hidden.status === 404, hidden.status);
  const opened = await call('PUT', `/admin/jobs/${jobSlug}`, { body: { ...created.json.data, status: 'open' } });
  check('admin can publish a job', opened.status === 200 && opened.json.data.status === 'open', opened.status);
  const visible = await call('GET', `/jobs/${jobSlug}`, { auth: false });
  check('published job is public', visible.status === 200, visible.status);
  const blank = await call('POST', '/admin/jobs', { body: { title: '   ' } });
  check('job without a title is rejected', blank.status === 422, blank.status);
}

// ------------------------------------------------------------- enquiries
{
  const missing = await call('POST', '/enquiries', { auth: false, body: { name: 'Test', email: 'test@example.com' } });
  check('enquiry without a message is rejected', missing.status === 422 && missing.json.error.field === 'message', missing.status);
  const badEmail = await call('POST', '/enquiries', { auth: false, body: { name: 'Test', email: 'not-an-email', message: 'Hi' } });
  check('enquiry with an invalid email is rejected', badEmail.status === 422 && badEmail.json.error.field === 'email', badEmail.status);
  const tooLong = await call('POST', '/enquiries', { auth: false, body: { name: 'Test', email: 'test@example.com', message: 'x'.repeat(5000) } });
  check('over-long enquiry message is rejected', tooLong.status === 422, tooLong.status);
  const xss = '<script>alert(1)</script><img src=x onerror=alert(1)>';
  const sent = await call('POST', '/enquiries', { auth: false, body: { name: 'Automated Test', email: 'test@example.com', company: 'Test Co', topic: 'General enquiry', message: `Test message, please ignore. ${xss}`, status: 'closed', id: 1 } });
  check('valid enquiry is accepted', sent.status === 201 && sent.json.data.id, sent.status);
  const list = await call('GET', '/admin/enquiries');
  const mine = list.json?.data?.find((item) => item.id === sent.json?.data?.id);
  check('enquiry reaches the admin inbox', Boolean(mine));
  check('enquiry status cannot be set by the sender', mine?.status === 'new', mine?.status);
  check('markup is stored as plain text (rendered escaped by React)', mine?.message.includes(xss));
  const updated = await call('PATCH', `/admin/enquiries/${mine?.id}`, { body: { status: 'closed', notes: 'Handled by test', email: 'changed@example.com' } });
  check('admin can update enquiry status and notes', updated.status === 200 && updated.json.data.status === 'closed' && updated.json.data.notes === 'Handled by test', updated.status);
  check('enquiry contact details cannot be changed by mass assignment', updated.json?.data?.email === 'test@example.com');
  const honeypot = await call('POST', '/enquiries', { auth: false, body: { name: 'Bot', email: 'bot@example.com', message: 'spam', nickname: 'filled' } });
  const after = await call('GET', '/admin/enquiries');
  check('honeypot submissions are dropped silently', honeypot.status === 201 && !after.json.data.some((item) => item.email === 'bot@example.com'), honeypot.status);
  const removed = await call('DELETE', `/admin/enquiries/${mine?.id}`);
  check('admin can delete an enquiry', removed.status === 200, removed.status);
}

// ---------------------------------------------------------- applications
{
  const noResume = await call('POST', '/applications', { auth: false, form: application({}, null) });
  check('application without a resume is rejected', noResume.status === 422 && noResume.json.error.field === 'resume', noResume.status);
  const fakePdf = await call('POST', '/applications', { auth: false, form: application({}, new Blob(['MZ this is really an exe']), 'resume.pdf') });
  check('file named .pdf that is not a PDF is rejected', fakePdf.status === 415, fakePdf.status);
  const html = await call('POST', '/applications', { auth: false, form: application({}, new Blob(['<html><script>alert(1)</script></html>'], { type: 'application/pdf' }), 'cv.html') });
  check('HTML upload is rejected', html.status === 415, html.status);
  const big = await call('POST', '/applications', { auth: false, form: application({}, new Blob([Buffer.concat([Buffer.from('%PDF-'), Buffer.alloc(4.2 * 1024 * 1024)])]), 'big.pdf') });
  check('resume over 4 MB is rejected', big.status === 413, big.status);
  const closedJob = await call('POST', '/applications', { auth: false, form: application({ job: 'no-such-role' }) });
  check('application to a closed or unknown job is rejected', closedJob.status === 422, closedJob.status);
  const noConsent = await call('POST', '/applications', { auth: false, form: application({ consent: undefined }) });
  check('application without consent is rejected', noConsent.status === 422, noConsent.status);
  const badUrl = await call('POST', '/applications', { auth: false, form: application({ portfolio: 'javascript:alert(1)' }) });
  check('javascript: portfolio link is rejected', badUrl.status === 422 && badUrl.json.error.field === 'portfolio', badUrl.status);

  const sent = await call('POST', '/applications', { auth: false, form: application({ job: jobSlug, portfolio: 'https://example.com/portfolio' }) });
  check('valid application is accepted', sent.status === 201 && sent.json.data.id, sent.status);
  const id = sent.json?.data?.id;
  const list = await call('GET', `/admin/applications?job=${jobSlug}`);
  const mine = list.json?.data?.find((item) => item.id === id);
  check('application reaches the admin with its resume', Boolean(mine?.resume), list.status);
  const anonymous = await call('GET', `/admin/applications/${id}/resume`, { auth: false, raw: true });
  check('resume cannot be downloaded without signing in', anonymous.status === 401, anonymous.status);
  const download = await call('GET', `/admin/applications/${id}/resume`, { raw: true });
  const bytes = Buffer.from(await download.arrayBuffer());
  check('admin can download the resume as an attachment', download.status === 200 && /attachment/.test(download.headers.get('content-disposition')) && bytes.subarray(0, 5).toString() === '%PDF-', download.status);
  check('resume download is served with nosniff and a sandbox CSP', download.headers.get('x-content-type-options') === 'nosniff' && /sandbox/.test(download.headers.get('content-security-policy')));
  const updated = await call('PATCH', `/admin/applications/${id}`, { body: { status: 'shortlisted', notes: 'Test note' } });
  check('admin can update application status and notes', updated.status === 200 && updated.json.data.status === 'shortlisted', updated.status);
  const bogus = await call('PATCH', `/admin/applications/${id}`, { body: { status: 'superuser' } });
  check('unknown application status is ignored', bogus.status === 200 && bogus.json.data.status === 'shortlisted', bogus.json?.data?.status);
  const removed = await call('DELETE', `/admin/applications/${id}`);
  const gone = await call('GET', `/admin/applications/${id}/resume`, { raw: true });
  check('deleting an application also deletes its resume', removed.status === 200 && gone.status === 404, `${removed.status}/${gone.status}`);
}

// ----------------------------------------------------------- policy pages
{
  const slug = 'abuse-policy';
  const original = await call('GET', `/admin/pages/${slug}`);
  check('admin can read a policy page', original.status === 200 && original.json.data.path === '/legal/abuse-policy', original.status);
  const before = original.json.data;
  const empty = await call('PUT', `/admin/pages/${slug}`, { body: { title: before.title, summary: before.summary, body: '', status: 'published' } });
  check('a policy page cannot be published without text', empty.status === 422 && empty.json.error.field === 'body', empty.status);
  const marker = `Test paragraph ${randomBytes(3).toString('hex')}`;
  const published = await call('PUT', `/admin/pages/${slug}`, { body: { title: before.title, summary: 'Test summary.', body: `## Test heading\n\n${marker}\n\n- First point\n- <script>alert(1)</script>`, status: 'published', path: '/hijack', slug: 'hijack' } });
  check('admin can publish policy text', published.status === 200 && published.json.data.status === 'published', published.status);
  check('page path cannot be mass-assigned', published.json?.data?.path === '/legal/abuse-policy');
  const live = await call('GET', `/pages/${slug}`, { auth: false });
  check('published policy text is public straight away', live.status === 200 && live.json.data.body.includes(marker), live.status);
  check('public page data has no draft status field', live.status === 200 && !('status' in live.json.data));
  const draft = await call('PUT', `/admin/pages/${slug}`, { body: { title: before.title, summary: before.summary, body: before.body, status: 'draft' } });
  const hidden = await call('GET', `/pages/${slug}`, { auth: false });
  check('unpublished policy text is hidden from the public', draft.status === 200 && hidden.status === 404, `${draft.status}/${hidden.status}`);
  // put the page back exactly as it was
  const restored = await call('PUT', `/admin/pages/${slug}`, { body: { title: before.title, summary: before.summary, body: before.body, status: before.status } });
  check('policy page restored after the test', restored.status === 200 && restored.json.data.status === before.status, restored.status);
  const unknown = await call('PUT', '/admin/pages/no-such-page', { body: { title: 'x' } });
  check('unknown policy page returns 404', unknown.status === 404, unknown.status);
}

// --------------------------------------------------------------- uploads
{
  const svg = new FormData();
  svg.set('file', new Blob(['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'], { type: 'image/svg+xml' }), 'logo.svg');
  const response = await call('POST', '/admin/uploads', { form: svg });
  check('SVG upload is rejected (can carry script)', response.status === 415, response.status);
}

// ------------------------------------------------------- form rate limit
if (!prod) {
  let last = null;
  for (let i = 0; i < 6 && last?.status !== 429; i++) {
    last = await call('POST', '/enquiries', { auth: false, body: { name: 'Rate Test', email: 'rate.test@example.com', message: 'Rate limit test, please ignore.' } });
  }
  check('more than 5 enquiries an hour from one visitor are rate limited', last.status === 429, last.status);
  const list = await call('GET', '/admin/enquiries');
  for (const item of list.json.data.filter((row) => row.email === 'rate.test@example.com')) await call('DELETE', `/admin/enquiries/${item.id}`);
}

// -------------------------------------------------------------- cleanup
{
  const closed = await call('PUT', `/admin/jobs/${jobSlug}`, { body: { title: 'Test Role (automated)', summary: 'x', status: 'closed' } });
  const hidden = await call('GET', `/jobs/${jobSlug}`, { auth: false });
  check('closed job is hidden from the public', closed.status === 200 && hidden.status === 404, `${closed.status}/${hidden.status}`);
  const removed = await call('DELETE', `/admin/jobs/${jobSlug}`);
  check('admin can delete a job', removed.status === 200, removed.status);
  const out = await call('POST', '/auth/logout');
  const after = await call('GET', '/admin/stats');
  check('sign out ends the session server-side', out.status === 200 && after.status === 401, `${out.status}/${after.status}`);
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
