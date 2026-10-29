// Jobs (public listing + admin editor) and candidate applications.

import { query, one, transaction } from '../db.js';
import { fail, only, str, email, phone, url, stringList, slugify, oneOf, ipHash } from '../http.js';
import { storeResume } from '../files.js';
import { rateLimit } from '../auth.js';

export const JOB_STATUSES = ['draft', 'open', 'closed'];
export const APPLICATION_STATUSES = ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'];

const jobPayload = (row, admin = false) => ({
  id: row.slug,
  title: row.title,
  department: row.department,
  location: row.location,
  type: row.employment_type,
  summary: row.summary,
  responsibilities: row.responsibilities,
  qualifications: row.qualifications,
  ...(admin ? { dbId: row.id, status: row.status, sortOrder: row.sort_order, applications: row.applications ?? 0, updatedAt: row.updated_at } : {})
});

export const listOpenJobs = async () =>
  (await query("SELECT * FROM jobs WHERE status = 'open' ORDER BY sort_order, created_at")).map((row) => jobPayload(row));

export async function getOpenJob(slug) {
  const row = await one("SELECT * FROM jobs WHERE slug = $1 AND status = 'open'", [slug]);
  if (!row) fail(404, 'not_found', 'This role is not open right now.');
  return jobPayload(row);
}

export const listJobsAdmin = async () => (await query(
  `SELECT j.*, (SELECT count(*)::int FROM job_applications a WHERE a.job_id = j.id) AS applications
     FROM jobs j ORDER BY j.sort_order, j.created_at`
)).map((row) => jobPayload(row, true));

export async function getJobAdmin(slug) {
  const row = await one('SELECT * FROM jobs WHERE slug = $1', [slug]);
  if (!row) fail(404, 'not_found', 'No job with that address.');
  return jobPayload(row, true);
}

export async function saveJob(body, slug) {
  const data = only(body, ['title', 'department', 'location', 'type', 'summary', 'responsibilities', 'qualifications', 'status', 'sortOrder']);
  const title = str(data, 'title', 120, { required: true, label: 'Job title' });
  const values = [
    title,
    str(data, 'department', 120, { label: 'Team' }) || '',
    str(data, 'location', 120, { label: 'Location' }) || '',
    str(data, 'type', 60, { label: 'Work type' }) || '',
    str(data, 'summary', 600, { label: 'Summary' }) || '',
    JSON.stringify(stringList(data.responsibilities, { maxItems: 20, maxLength: 400 })),
    JSON.stringify(stringList(data.qualifications, { maxItems: 20, maxLength: 400 })),
    oneOf(data.status, JOB_STATUSES, 'draft'),
    Number.isInteger(data.sortOrder) ? Math.max(0, Math.min(data.sortOrder, 9999)) : 0
  ];
  if (values[7] === 'open' && !values[4]) fail(422, 'validation_failed', 'Add a summary before opening the role.', { field: 'summary' });

  if (slug) {
    const row = await one(
      `UPDATE jobs SET title = $1, department = $2, location = $3, employment_type = $4, summary = $5, responsibilities = $6,
              qualifications = $7, status = $8, sort_order = $9, updated_at = now() WHERE slug = $10 RETURNING *`,
      [...values, slug]
    );
    if (!row) fail(404, 'not_found', 'No job with that address.');
    return jobPayload(row, true);
  }
  return transaction(async (db) => {
    const root = slugify(title, 'role');
    let next = root;
    for (let n = 2; await db.one('SELECT 1 FROM jobs WHERE slug = $1', [next]); n++) next = `${root}-${n}`;
    const row = await db.one(
      `INSERT INTO jobs (title, department, location, employment_type, summary, responsibilities, qualifications, status, sort_order, slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [...values, next]
    );
    return jobPayload(row, true);
  });
}

export async function removeJob(slug) {
  const rows = await query('DELETE FROM jobs WHERE slug = $1 RETURNING id', [slug]);
  if (!rows.length) fail(404, 'not_found', 'No job with that address.');
}

// ---------------------------------------------------------- applications
const EXPERIENCE = ['0–1 years', '1–3 years', '3–5 years', '5+ years'];
const NOTICE = ['Immediate', '15 days', '30 days', '60 days', '90 days or more'];
const PREFERRED = ['Open to locations across India', 'Prefer my current city', 'Open to relocation'];

export async function submitApplication(req, { fields, file }) {
  // honeypot: real visitors never see or fill this field
  if (fields.nickname) return { id: null };
  // a loose cap on every attempt, and a strict one on applications actually stored
  await rateLimit(`apply-attempt:${ipHash(req)}`, { limit: 30, windowSeconds: 3600, message: 'Too many attempts. Please try again later.' });

  const job = await one("SELECT id, title FROM jobs WHERE slug = $1 AND status = 'open'", [String(fields.job || '')]);
  if (!job) fail(422, 'validation_failed', 'This role is no longer accepting applications.', { field: 'job' });
  if (fields.consent !== 'yes') fail(422, 'validation_failed', 'Please confirm the consent checkbox.', { field: 'consent' });

  const values = {
    first: str(fields, 'firstName', 80, { required: true, label: 'First name' }),
    last: str(fields, 'lastName', 80, { required: true, label: 'Last name' }),
    email: email(fields, 'email', { label: 'Email address' }),
    phone: phone(fields, 'phone', { required: true }),
    location: str(fields, 'currentLocation', 120, { required: true, label: 'Current location' }),
    preferred: oneOf(fields.preferredLocation, PREFERRED, null),
    experience: oneOf(fields.experience, EXPERIENCE, null),
    employer: str(fields, 'employer', 120, { label: 'Current employer' }),
    notice: oneOf(fields.noticePeriod, NOTICE, null),
    skills: str(fields, 'skills', 600, { required: true, label: 'Key skills' }),
    portfolio: url(fields, 'portfolio', { label: 'Portfolio or LinkedIn' })
  };
  await rateLimit(`apply:${ipHash(req)}`, { limit: 5, windowSeconds: 3600, message: 'You have sent several applications recently. Please try again later.' });
  const resumeId = await storeResume(file);
  const row = await one(
    `INSERT INTO job_applications (job_id, job_title, first_name, last_name, email, phone, current_location, preferred_location,
        experience, employer, notice_period, skills, portfolio_url, resume_file_id, ip_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`,
    [job.id, job.title, values.first, values.last, values.email, values.phone, values.location, values.preferred,
      values.experience, values.employer, values.notice, values.skills, values.portfolio, resumeId, ipHash(req)]
  );
  return { id: row.id };
}

const applicationPayload = (row) => ({
  id: row.id,
  jobTitle: row.job_title,
  jobSlug: row.job_slug,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  phone: row.phone,
  currentLocation: row.current_location,
  preferredLocation: row.preferred_location || '',
  experience: row.experience || '',
  employer: row.employer || '',
  noticePeriod: row.notice_period || '',
  skills: row.skills,
  portfolio: row.portfolio_url || '',
  resume: row.resume_file_id ? { name: row.resume_name, size: row.resume_size } : null,
  status: row.status,
  notes: row.notes || '',
  createdAt: row.created_at
});

export async function listApplications(params) {
  const where = [];
  const args = [];
  const status = params.get('status');
  if (APPLICATION_STATUSES.includes(status)) { args.push(status); where.push(`a.status = $${args.length}`); }
  const job = params.get('job');
  if (job) { args.push(job); where.push(`j.slug = $${args.length}`); }
  const rows = await query(
    `SELECT a.*, j.slug AS job_slug, f.original_name AS resume_name, f.size_bytes AS resume_size
       FROM job_applications a LEFT JOIN jobs j ON j.id = a.job_id LEFT JOIN files f ON f.id = a.resume_file_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY a.created_at DESC LIMIT 500`,
    args
  );
  return rows.map(applicationPayload);
}

export async function updateApplication(id, body) {
  const data = only(body, ['status', 'notes']);
  const row = await one(
    `UPDATE job_applications SET status = coalesce($1, status), notes = CASE WHEN $2::boolean THEN $3 ELSE notes END
      WHERE id = $4 RETURNING id, status, notes`,
    [APPLICATION_STATUSES.includes(data.status) ? data.status : null, 'notes' in data, str(data, 'notes', 4000), id]
  );
  if (!row) fail(404, 'not_found', 'No application with that number.');
  return { id: row.id, status: row.status, notes: row.notes || '' };
}

export async function removeApplication(id) {
  // the resume goes with the application
  const row = await one('DELETE FROM job_applications WHERE id = $1 RETURNING resume_file_id', [id]);
  if (!row) fail(404, 'not_found', 'No application with that number.');
  if (row.resume_file_id) await query('DELETE FROM files WHERE id = $1', [row.resume_file_id]);
}

export async function resumeFor(id) {
  const row = await one(
    `SELECT f.original_name, f.mime_type, f.data FROM job_applications a JOIN files f ON f.id = a.resume_file_id WHERE a.id = $1`,
    [id]
  );
  if (!row) fail(404, 'not_found', 'No resume for that application.');
  return row;
}
