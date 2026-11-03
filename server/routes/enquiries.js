// Contact-form enquiries.

import { query, one } from '../db.js';
import { fail, only, str, email, phone, oneOf, ipHash } from '../http.js';
import { rateLimit } from '../auth.js';
import { sendAdminMail } from '../mail.js';
import { notifyAdmins } from '../push.js';

export const ENQUIRY_STATUSES = ['new', 'in_progress', 'closed'];
const TOPICS = ['Technology consulting', 'Website or application', 'Software and automation', 'General enquiry'];

export async function submitEnquiry(req, body) {
  const data = only(body, ['name', 'email', 'phone', 'company', 'topic', 'message', 'page', 'nickname']);
  if (data.nickname) return { id: null };          // honeypot
  await rateLimit(`enquiry-attempt:${ipHash(req)}`, { limit: 30, windowSeconds: 3600, message: 'Too many attempts. Please try again later.' });

  const page = str(data, 'page', 200);
  const values = [
    str(data, 'name', 120, { required: true, label: 'Your name' }),
    email(data, 'email', { label: 'Work email' }),
    phone(data, 'phone'),
    str(data, 'company', 160, { label: 'Company' }),
    oneOf(data.topic, TOPICS, null),
    str(data, 'message', 4000, { required: true, label: 'Your message' }),
    page && page.startsWith('/') ? page : null,
    ipHash(req)
  ];
  // a repeated click or resubmission of the same message is not stored twice
  const duplicate = await one(
    `SELECT id FROM enquiries WHERE lower(email) = lower($1) AND message = $2 AND created_at > now() - interval '24 hours' LIMIT 1`,
    [values[1], values[5]]
  );
  if (duplicate) fail(409, 'duplicate', 'We have already received this message and will get back to you soon.');
  // only messages that pass validation count towards the strict limit
  await rateLimit(`enquiry:${ipHash(req)}`, { limit: 5, windowSeconds: 3600, message: 'You have sent several messages recently. Please try again later.' });
  const row = await one(
    `INSERT INTO enquiries (name, email, phone, company, topic, message, page, ip_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    values
  );
  // The enquiry is already saved; a mail failure is logged, not shown to the visitor.
  const [name, address, phoneNo, company, topic, message, fromPage] = values;
  // Push carries no visitor details; the admin opens the enquiry to read them.
  const pushed = notifyAdmins({ title: `New enquiry #${row.id}`, body: topic || 'General enquiry', path: `/admin/enquiries?open=${row.id}` });
  await sendAdminMail({
    subject: `New enquiry #${row.id} from ${name.replace(/\s+/g, ' ')}`,
    replyTo: address,
    text: [
      `Name: ${name}`, `Email: ${address}`, `Phone: ${phoneNo || '-'}`, `Company: ${company || '-'}`,
      `Enquiry type: ${topic || 'General enquiry'}`, `Page: ${fromPage || '-'}`, '', message, '',
      'Open it in the admin: https://srisun-website.vercel.app/admin/enquiries'
    ].join('\n')
  });
  await pushed;
  return { id: row.id };
}

const payload = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone || '',
  company: row.company || '',
  topic: row.topic || '',
  message: row.message,
  page: row.page || '',
  status: row.status,
  notes: row.notes || '',
  createdAt: row.created_at
});

export async function listEnquiries(params) {
  const status = params.get('status');
  const rows = ENQUIRY_STATUSES.includes(status)
    ? await query('SELECT * FROM enquiries WHERE status = $1 ORDER BY created_at DESC LIMIT 500', [status])
    : await query('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 500');
  return rows.map(payload);
}

export async function updateEnquiry(id, body) {
  const data = only(body, ['status', 'notes']);
  const row = await one(
    `UPDATE enquiries SET status = coalesce($1, status), notes = CASE WHEN $2::boolean THEN $3 ELSE notes END
      WHERE id = $4 RETURNING *`,
    [ENQUIRY_STATUSES.includes(data.status) ? data.status : null, 'notes' in data, str(data, 'notes', 4000), id]
  );
  if (!row) fail(404, 'not_found', 'No enquiry with that number.');
  return payload(row);
}

export async function removeEnquiry(id) {
  const rows = await query('DELETE FROM enquiries WHERE id = $1 RETURNING id', [id]);
  if (!rows.length) fail(404, 'not_found', 'No enquiry with that number.');
}
