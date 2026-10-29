// File checks and storage. The type is decided from the file's own bytes, never
// from the browser's Content-Type or the file name alone.

import { one } from './db.js';
import { fail } from './http.js';

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;   // Vercel functions accept ~4.5 MB bodies

const startsWith = (buffer, bytes, offset = 0) => bytes.every((byte, i) => buffer[offset + i] === byte);

export function sniff(buffer, filename = '') {
  const name = filename.toLowerCase();
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return { mime: 'image/jpeg', kind: 'image' };
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: 'image/png', kind: 'image' };
  if (startsWith(buffer, [0x47, 0x49, 0x46, 0x38])) return { mime: 'image/gif', kind: 'image' };
  if (startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)) return { mime: 'image/webp', kind: 'image' };
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d])) return { mime: 'application/pdf', kind: 'pdf' };
  // .docx is a zip with a word/ part; .doc is an OLE2 compound file
  if (startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]) && name.endsWith('.docx') && buffer.includes('word/')) {
    return { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', kind: 'docx' };
  }
  if (startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]) && name.endsWith('.doc')) return { mime: 'application/msword', kind: 'doc' };
  return null;
}

const safeName = (filename) => String(filename || 'file').replace(/[^\w.\- ]+/g, '_').slice(-120) || 'file';

/** Admin uploads for the site: images and case-study PDFs. SVG is refused (it can carry script). */
export async function storePublicFile(file, userId) {
  if (!file?.buffer?.length) fail(400, 'no_file', 'No file was received.');
  const type = sniff(file.buffer, file.filename);
  if (!type || !['image', 'pdf'].includes(type.kind)) fail(415, 'upload_rejected', 'Only JPEG, PNG, WebP, GIF and PDF files are accepted.');
  const row = await one(
    `INSERT INTO files (kind, is_public, original_name, mime_type, size_bytes, data, uploaded_by)
     VALUES ($1, TRUE, $2, $3, $4, $5, $6) RETURNING id`,
    [type.kind, safeName(file.filename), type.mime, file.buffer.length, file.buffer, userId]
  );
  return { id: row.id, url: `/api/v1/media/${row.id}`, kind: type.kind, name: safeName(file.filename) };
}

/** Candidate resumes: PDF or Word only, private. */
export async function storeResume(file) {
  if (!file?.buffer?.length) fail(422, 'validation_failed', 'Attach your resume.', { field: 'resume' });
  const type = sniff(file.buffer, file.filename);
  if (!type || !['pdf', 'docx', 'doc'].includes(type.kind)) {
    fail(415, 'upload_rejected', 'Your resume must be a PDF or Word document (.pdf, .doc, .docx).', { field: 'resume' });
  }
  const row = await one(
    `INSERT INTO files (kind, is_public, original_name, mime_type, size_bytes, data)
     VALUES ('resume', FALSE, $1, $2, $3, $4) RETURNING id`,
    [safeName(file.filename), type.mime, file.buffer.length, file.buffer]
  );
  return row.id;
}

/** Streams a stored file with headers that stop it being rendered as a page. */
export function sendFile(res, row, { download = false, cache = 'no-store' } = {}) {
  const inline = !download && row.mime_type.startsWith('image/');
  res.statusCode = 200;
  res.setHeader('Content-Type', row.mime_type);
  res.setHeader('Content-Length', row.data.length);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox");
  res.setHeader('Cache-Control', cache);
  res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${safeName(row.original_name)}"`);
  res.end(row.data);
}
