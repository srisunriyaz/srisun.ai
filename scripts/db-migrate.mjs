// Applies database/pg/*.sql in order. Every statement is idempotent.
import './env.mjs';
import { readdir, readFile } from 'node:fs/promises';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL });
try {
  for (const file of (await readdir('database/pg')).filter((name) => name.endsWith('.sql')).sort()) {
    await pool.query(await readFile(`database/pg/${file}`, 'utf8'));
    console.log(`applied ${file}`);
  }
} finally {
  await pool.end();
}
