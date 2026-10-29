// Prints row counts and any resume files no longer linked to an application.
import './env.mjs';
import { one } from '../server/db.js';
console.log(await one(`SELECT
  (SELECT count(*)::int FROM enquiries) AS enquiries,
  (SELECT count(*)::int FROM job_applications) AS applications,
  (SELECT count(*)::int FROM jobs) AS jobs,
  (SELECT count(*)::int FROM jobs WHERE status = 'open') AS open_jobs,
  (SELECT count(*)::int FROM clients) AS clients,
  (SELECT count(*)::int FROM admin_users) AS admins,
  (SELECT count(*)::int FROM admin_sessions) AS sessions,
  (SELECT count(*)::int FROM files f WHERE f.kind = 'resume' AND NOT EXISTS (SELECT 1 FROM job_applications a WHERE a.resume_file_id = f.id)) AS orphan_resumes`));
