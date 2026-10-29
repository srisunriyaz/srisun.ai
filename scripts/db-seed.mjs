// One-time seed: taxonomies, the original job openings, clients (from a JSON
// export of the old MySQL database) and an admin account.
//
//   node scripts/db-seed.mjs [path/to/mysql-export.json]
//   ADMIN_EMAIL=… ADMIN_PASSWORD=… ADMIN_NAME=… node scripts/db-seed.mjs   (creates or resets that admin)
//
// Tables that already have rows are left alone, so re-running never duplicates.
import './env.mjs';
import { readFile } from 'node:fs/promises';
import { query, one, transaction } from '../server/db.js';
import { hashPassword, passwordProblem } from '../server/auth.js';
import { slugify } from '../server/http.js';
import { openRoles } from '../src/careersData.js';

const parseList = (value) => { try { return JSON.parse(value || '[]'); } catch { return []; } };
const exportFile = process.argv[2];

if (!(await one('SELECT 1 FROM jobs LIMIT 1'))) {
  for (const [index, role] of openRoles.entries()) {
    await query(
      `INSERT INTO jobs (slug, title, department, location, employment_type, summary, responsibilities, qualifications, status, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open', $9)`,
      [slugify(role.title), role.title, role.department, role.location, role.type, role.summary,
        JSON.stringify(role.responsibilities), JSON.stringify(role.qualifications), index]
    );
  }
  console.log(`jobs: ${openRoles.length} seeded`);
}

if (exportFile && !(await one('SELECT 1 FROM clients LIMIT 1'))) {
  const d = JSON.parse(await readFile(exportFile, 'utf8'));
  const byId = (rows) => new Map(rows.map((row) => [row.id, row]));
  const industries = byId(d.industries);
  const solutions = byId(d.solutions);
  const tags = byId(d.service_tags);
  await transaction(async (db) => {
    for (const row of d.industries) await db.q("INSERT INTO taxonomies (kind, name, sort_order) VALUES ('industry', $1, $2) ON CONFLICT DO NOTHING", [row.name, row.sort_order]);
    for (const row of d.solutions) await db.q("INSERT INTO taxonomies (kind, name, sort_order) VALUES ('solution', $1, $2) ON CONFLICT DO NOTHING", [row.name, row.sort_order]);
    for (const c of d.clients) {
      const names = (rows, key, lookup) => rows.filter((row) => row.client_id === c.id).map((row) => lookup.get(row[key])?.name).filter(Boolean);
      const created = await db.one(
        `INSERT INTO clients (slug, name, website_url, description, logo_path, industries, solutions, tags, sort_order, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [c.slug, c.name, c.website_url, c.description, c.logo_path, names(d.client_industries, 'industry_id', industries),
          names(d.client_solutions, 'solution_id', solutions), names(d.client_tags, 'tag_id', tags), c.sort_order, c.created_at]
      );
      const cs = d.case_studies.find((row) => row.client_id === c.id);
      if (!cs) continue;
      const timeline = d.case_study_timeline.filter((row) => row.case_study_id === cs.id)
        .map((row) => ({ stage: row.stage, title: row.title || '', detail: row.detail || '' }));
      await db.q(
        `INSERT INTO case_studies (client_id, status, published_at, title, seo_title, meta_description, keywords, og_title, og_description,
            summary, executive_summary, about_client, challenge, solution, services, technologies, metrics, timeline, results,
            conclusion, testimonial, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
        [created.id, cs.status, cs.published_at, cs.title, cs.seo_title, cs.meta_description, cs.keywords, cs.og_title, cs.og_description,
          cs.summary, cs.executive_summary, cs.about_client, cs.challenge, cs.solution, JSON.stringify(parseList(cs.services)),
          JSON.stringify(parseList(cs.technologies)), JSON.stringify(parseList(cs.metrics)), JSON.stringify(timeline), cs.results,
          cs.conclusion, cs.testimonial_quote ? JSON.stringify({ quote: cs.testimonial_quote, author: cs.testimonial_author || '', role: cs.testimonial_role || '' }) : null,
          cs.updated_at]
      );
    }
  });
  console.log(`clients: ${d.clients.length} imported`);
}

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = 'Srisun Admin' } = process.env;
if (ADMIN_EMAIL && ADMIN_PASSWORD) {
  const problem = passwordProblem(ADMIN_PASSWORD);
  if (problem) throw new Error(`ADMIN_PASSWORD: ${problem}`);
  await query(
    `INSERT INTO admin_users (email, name, password_hash, role) VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, is_active = TRUE`,
    [ADMIN_EMAIL.toLowerCase(), ADMIN_NAME, await hashPassword(ADMIN_PASSWORD)]
  );
  await query('DELETE FROM admin_sessions WHERE user_id = (SELECT id FROM admin_users WHERE email = $1)', [ADMIN_EMAIL.toLowerCase()]);
  console.log(`admin: ${ADMIN_EMAIL.toLowerCase()} ready`);
}
