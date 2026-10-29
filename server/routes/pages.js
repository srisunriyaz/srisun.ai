// Editable policy pages: public reads return published pages only.

import { query, one } from '../db.js';
import { fail, only, str, oneOf } from '../http.js';

const payload = (row, admin = false) => ({
  slug: row.slug,
  path: row.path,
  title: row.title,
  summary: row.summary,
  body: row.body,
  updatedAt: row.updated_at,
  ...(admin ? { status: row.status } : {})
});

export const listPublished = async () =>
  (await query("SELECT * FROM site_pages WHERE status = 'published' ORDER BY sort_order")).map((row) => payload(row));

export async function getPublished(slug) {
  const row = await one("SELECT * FROM site_pages WHERE slug = $1 AND status = 'published'", [slug]);
  if (!row) fail(404, 'not_found', 'This page has not been published.');
  return payload(row);
}

export const listAdmin = async () => (await query('SELECT * FROM site_pages ORDER BY sort_order')).map((row) => payload(row, true));

export async function getAdmin(slug) {
  const row = await one('SELECT * FROM site_pages WHERE slug = $1', [slug]);
  if (!row) fail(404, 'not_found', 'No page with that address.');
  return payload(row, true);
}

export async function save(slug, body, userId) {
  const data = only(body, ['title', 'summary', 'body', 'status']);
  const status = oneOf(data.status, ['draft', 'published'], 'draft');
  const text = str(data, 'body', 60000, { label: 'Page text' }) || '';
  if (status === 'published' && !text) fail(422, 'validation_failed', 'Add the page text before publishing.', { field: 'body' });
  const row = await one(
    `UPDATE site_pages SET title = $1, summary = $2, body = $3, status = $4, updated_by = $5, updated_at = now()
      WHERE slug = $6 RETURNING *`,
    [str(data, 'title', 120, { required: true, label: 'Title' }), str(data, 'summary', 400, { label: 'Summary' }) || '', text, status, userId, slug]
  );
  if (!row) fail(404, 'not_found', 'No page with that address.');
  return payload(row, true);
}
