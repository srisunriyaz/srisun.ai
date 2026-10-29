// Clients and case studies: public reads plus the admin editor.

import { query, one, transaction } from '../db.js';
import { fail, only, str, url, stringList, slugify, oneOf, isUuid } from '../http.js';

const media = (id) => (id ? `/api/v1/media/${id}` : '');

const SELECT = `
  SELECT c.*, cs.client_id AS cs_id, cs.status, cs.published_at, cs.title, cs.seo_title, cs.meta_description,
         cs.keywords, cs.og_title, cs.og_description, cs.summary, cs.executive_summary, cs.about_client,
         cs.challenge, cs.solution, cs.services, cs.technologies, cs.metrics, cs.timeline, cs.images,
         cs.results, cs.conclusion, cs.testimonial, cs.hero_file_id, cs.pdf_file_id, pf.original_name AS pdf_name
    FROM clients c
    LEFT JOIN case_studies cs ON cs.client_id = c.id
    LEFT JOIN files pf ON pf.id = cs.pdf_file_id`;

function caseStudy(row) {
  return {
    status: row.status,
    publishedAt: row.published_at,
    title: row.title || '',
    seoTitle: row.seo_title || '',
    metaDescription: row.meta_description || '',
    keywords: row.keywords || '',
    ogTitle: row.og_title || '',
    ogDescription: row.og_description || '',
    summary: row.summary || '',
    heroImage: media(row.hero_file_id),
    heroMediaId: row.hero_file_id,
    pdfMediaId: row.pdf_file_id,
    executiveSummary: row.executive_summary || '',
    aboutClient: row.about_client || '',
    challenge: row.challenge || '',
    solution: row.solution || '',
    services: row.services || [],
    technologies: row.technologies || [],
    metrics: row.metrics || [],
    results: row.results || '',
    conclusion: row.conclusion || '',
    testimonial: row.testimonial || null,
    timeline: row.timeline || [],
    images: (row.images || []).map((image) => ({ src: media(image.fileId), alt: image.alt || '', mediaId: image.fileId })),
    pdf: row.pdf_file_id ? { name: row.pdf_name || 'Case study.pdf', src: media(row.pdf_file_id) } : null
  };
}

/** Drafts are only ever included for admin callers. */
export function clientPayload(row, admin) {
  const published = row.status === 'published';
  return {
    id: row.slug,
    name: row.name,
    website: row.website_url || '',
    logo: row.logo_file_id ? media(row.logo_file_id) : row.logo_path || '',
    logoMediaId: row.logo_file_id,
    description: row.description || '',
    industry: row.industries[0] || '',
    industries: row.industries,
    solutions: row.solutions,
    tags: row.tags,
    published,
    caseStudy: row.cs_id && (admin || published) ? caseStudy(row) : null
  };
}

export async function taxonomies() {
  const rows = await query('SELECT kind, name FROM taxonomies ORDER BY sort_order, name');
  return {
    industries: rows.filter((row) => row.kind === 'industry').map((row) => row.name),
    solutions: rows.filter((row) => row.kind === 'solution').map((row) => row.name)
  };
}

export async function listPublic(params) {
  const where = [];
  const args = [];
  const q = String(params.get('q') || '').trim().slice(0, 100);
  const list = (key) => String(params.get(key) || '').split(',').map((item) => item.trim()).filter(Boolean).slice(0, 20);
  if (q) { args.push(`%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`); where.push(`c.name ILIKE $${args.length}`); }
  const industries = list('industries');
  const solutions = list('solutions');
  if (industries.length) { args.push(industries); where.push(`c.industries && $${args.length}::text[]`); }
  if (solutions.length) { args.push(solutions); where.push(`c.solutions && $${args.length}::text[]`); }
  const perPage = Math.min(Math.max(parseInt(params.get('per_page'), 10) || 60, 1), 100);
  const page = Math.max(parseInt(params.get('page'), 10) || 1, 1);
  const filter = where.length ? ` WHERE ${where.join(' AND ')}` : '';

  const [{ total }] = await query(`SELECT count(*)::int AS total FROM clients c${filter}`, args);
  const rows = await query(`${SELECT}${filter} ORDER BY c.sort_order, c.name LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`, args);
  return { data: rows.map((row) => clientPayload(row, false)), meta: { total, page, perPage } };
}

export async function getBySlug(slug, admin) {
  const row = await one(`${SELECT} WHERE c.slug = $1`, [slug]);
  if (!row) fail(404, 'not_found', 'No client with that address.');
  return clientPayload(row, admin);
}

export const listAdmin = async () => (await query(`${SELECT} ORDER BY c.sort_order, c.name`)).map((row) => clientPayload(row, true));

const fileId = (value) => (isUuid(value) ? value : null);

async function uniqueSlug(db, base) {
  const root = slugify(base, 'client');
  for (let n = 1; ; n++) {
    const slug = n === 1 ? root : `${root}-${n}`;
    if (!(await db.one('SELECT 1 FROM clients WHERE slug = $1', [slug]))) return slug;
  }
}

export async function save(body, slug, userId) {
  const data = only(body, ['name', 'website', 'description', 'logoMediaId', 'industry', 'industries', 'solutions', 'tags', 'caseStudy']);
  const name = str(data, 'name', 190, { required: true, label: 'Client name' });
  const website = url(data, 'website', { label: 'Website URL' });
  const description = str(data, 'description', 1000, { label: 'Card description' });
  const known = await taxonomies();
  const industries = stringList(data.industries ?? (data.industry ? [data.industry] : [])).filter((item) => known.industries.includes(item));
  const solutions = stringList(data.solutions).filter((item) => known.solutions.includes(item));
  const tags = stringList(data.tags, { maxItems: 20, maxLength: 60 });

  return transaction(async (db) => {
    let client;
    if (slug) {
      client = await db.one(
        `UPDATE clients SET name = $1, website_url = $2, description = $3, logo_file_id = $4, industries = $5, solutions = $6, tags = $7, updated_at = now()
          WHERE slug = $8 RETURNING id, slug`,
        [name, website, description, fileId(data.logoMediaId), industries, solutions, tags, slug]
      );
      if (!client) fail(404, 'not_found', 'No client with that address.');
    } else {
      client = await db.one(
        `INSERT INTO clients (slug, name, website_url, description, logo_file_id, industries, solutions, tags, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, (SELECT coalesce(max(sort_order), 0) + 1 FROM clients)) RETURNING id, slug`,
        [await uniqueSlug(db, name), name, website, description, fileId(data.logoMediaId), industries, solutions, tags]
      );
    }
    if (data.caseStudy && typeof data.caseStudy === 'object') await saveCaseStudy(db, client.id, data.caseStudy, userId);
    return client.slug;
  });
}

async function saveCaseStudy(db, clientId, input, userId) {
  const data = only(input, [
    'title', 'seoTitle', 'metaDescription', 'keywords', 'ogTitle', 'ogDescription', 'summary', 'executiveSummary',
    'aboutClient', 'challenge', 'solution', 'services', 'technologies', 'metrics', 'results', 'conclusion',
    'testimonial', 'timeline', 'images', 'heroMediaId', 'pdfMediaId', 'status'
  ]);
  const long = (key) => str(data, key, 5000);
  const metrics = (Array.isArray(data.metrics) ? data.metrics : []).slice(0, 12)
    .map((m) => ({ value: str(m || {}, 'value', 40) || '', label: str(m || {}, 'label', 120) || '', caption: str(m || {}, 'caption', 200) || '' }))
    .filter((m) => m.value || m.label);
  const timeline = (Array.isArray(data.timeline) ? data.timeline : []).slice(0, 20)
    .map((t) => ({ stage: str(t || {}, 'stage', 120) || '', title: str(t || {}, 'title', 190) || '', detail: str(t || {}, 'detail', 1000) || '' }))
    .filter((t) => t.stage);
  const images = (Array.isArray(data.images) ? data.images : []).slice(0, 30)
    .filter((image) => isUuid(image?.mediaId)).map((image) => ({ fileId: image.mediaId, alt: str(image, 'alt', 255) || '' }));
  const quote = data.testimonial && typeof data.testimonial === 'object' ? str(data.testimonial, 'quote', 1000) : null;
  const testimonial = quote ? { quote, author: str(data.testimonial, 'author', 120) || '', role: str(data.testimonial, 'role', 120) || '' } : null;
  const status = oneOf(data.status, ['draft', 'published'], 'draft');

  await db.q(
    `INSERT INTO case_studies (client_id, status, published_at, title, seo_title, meta_description, keywords, og_title, og_description,
        summary, executive_summary, about_client, challenge, solution, services, technologies, metrics, timeline, images,
        results, conclusion, testimonial, hero_file_id, pdf_file_id, updated_by, updated_at)
     VALUES ($1, $2::text, CASE WHEN $2::text = 'published' THEN now() END, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, now())
     ON CONFLICT (client_id) DO UPDATE SET
        status = EXCLUDED.status,
        published_at = CASE WHEN EXCLUDED.status = 'published' THEN coalesce(case_studies.published_at, now()) END,
        title = EXCLUDED.title, seo_title = EXCLUDED.seo_title, meta_description = EXCLUDED.meta_description,
        keywords = EXCLUDED.keywords, og_title = EXCLUDED.og_title, og_description = EXCLUDED.og_description,
        summary = EXCLUDED.summary, executive_summary = EXCLUDED.executive_summary, about_client = EXCLUDED.about_client,
        challenge = EXCLUDED.challenge, solution = EXCLUDED.solution, services = EXCLUDED.services,
        technologies = EXCLUDED.technologies, metrics = EXCLUDED.metrics, timeline = EXCLUDED.timeline,
        images = EXCLUDED.images, results = EXCLUDED.results, conclusion = EXCLUDED.conclusion,
        testimonial = EXCLUDED.testimonial, hero_file_id = EXCLUDED.hero_file_id, pdf_file_id = EXCLUDED.pdf_file_id,
        updated_by = EXCLUDED.updated_by, updated_at = now()`,
    [
      clientId, status, str(data, 'title', 190), str(data, 'seoTitle', 190), str(data, 'metaDescription', 320),
      str(data, 'keywords', 500), str(data, 'ogTitle', 190), str(data, 'ogDescription', 320), str(data, 'summary', 2000),
      long('executiveSummary'), long('aboutClient'), long('challenge'), long('solution'),
      JSON.stringify(stringList(data.services)), JSON.stringify(stringList(data.technologies)), JSON.stringify(metrics),
      JSON.stringify(timeline), JSON.stringify(images), long('results'), long('conclusion'),
      testimonial ? JSON.stringify(testimonial) : null, fileId(data.heroMediaId), fileId(data.pdfMediaId), userId
    ]
  );
}

export async function setStatus(slug, status, userId) {
  if (!['draft', 'published'].includes(status)) fail(422, 'validation_failed', 'Status must be draft or published.');
  const client = await one('SELECT id FROM clients WHERE slug = $1', [slug]);
  if (!client) fail(404, 'not_found', 'No client with that address.');
  await query(
    `INSERT INTO case_studies (client_id, status, published_at, updated_by) VALUES ($1, $2::text, CASE WHEN $2::text = 'published' THEN now() END, $3)
     ON CONFLICT (client_id) DO UPDATE SET status = EXCLUDED.status, updated_by = EXCLUDED.updated_by, updated_at = now(),
       published_at = CASE WHEN EXCLUDED.status = 'published' THEN coalesce(case_studies.published_at, now()) END`,
    [client.id, status, userId]
  );
  return { status };
}

export async function remove(slug) {
  const rows = await query('DELETE FROM clients WHERE slug = $1 RETURNING id', [slug]);
  if (!rows.length) fail(404, 'not_found', 'No client with that address.');
}
