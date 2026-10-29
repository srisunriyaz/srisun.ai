// Build-time snapshot of public data, read straight from the database:
//   public/data/clients.json  — fallback for the client pages if /api is unreachable
//   src/generated/jobs.json   — open roles, used to prerender the careers pages
//   src/generated/pages.json  — published policy pages, used to prerender them
// Only public queries are used, so drafts, unpublished pages and closed roles
// never end up here.
// If the database is unreachable, the previous snapshot is kept unchanged.
import './env.mjs';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { listPublic, taxonomies } from '../server/routes/clients.js';
import { listOpenJobs } from '../server/routes/careers.js';
import { listPublished } from '../server/routes/pages.js';
import { slugify } from '../server/http.js';
import { openRoles } from '../src/careersData.js';

const jobsFile = 'src/generated/jobs.json';
const pagesFile = 'src/generated/pages.json';
await mkdir('public/data', { recursive: true });
await mkdir('src/generated', { recursive: true });

try {
  const [{ data: clients }, tax, jobs, pages] = await Promise.all([listPublic(new URLSearchParams('per_page=100')), taxonomies(), listOpenJobs(), listPublished()]);
  await writeFile('public/data/clients.json', JSON.stringify({ generatedAt: new Date().toISOString(), taxonomies: tax, clients }), 'utf8');
  await writeFile(jobsFile, JSON.stringify(jobs, null, 2), 'utf8');
  await writeFile(pagesFile, JSON.stringify(pages, null, 2), 'utf8');
  console.log(`Snapshot: ${clients.length} clients, ${jobs.length} open roles, ${pages.length} published pages.`);
} catch (error) {
  console.warn(`Snapshot kept as is: database not reachable (${error.message}).`);
  if (!existsSync(pagesFile)) await writeFile(pagesFile, '[]', 'utf8');
  if (!existsSync(jobsFile)) {
    await writeFile(jobsFile, JSON.stringify(openRoles.map((role) => ({ id: slugify(role.title), ...role })), null, 2), 'utf8');
  }
}
