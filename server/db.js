// Database access over Neon's serverless driver. Single statements go over
// HTTP (no connection to keep alive between invocations); transactions open a
// short-lived WebSocket pool that is closed again before the response ends.

import { neon, Pool } from '@neondatabase/serverless';

const url = () => {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error('DATABASE_URL is not set');
  return value;
};

let http = null;

/** query('SELECT … WHERE id = $1', [id]) → rows */
export async function query(text, params = []) {
  http ??= neon(url());
  return http.query(text, params);
}

export async function one(text, params = []) {
  return (await query(text, params))[0] ?? null;
}

/** Runs fn(client) inside BEGIN/COMMIT; client.q has the same shape as query. */
export async function transaction(fn) {
  const pool = new Pool({ connectionString: url() });
  const client = await pool.connect();
  const q = async (text, params = []) => (await client.query(text, params)).rows;
  try {
    await client.query('BEGIN');
    const result = await fn({ q, one: async (text, params) => (await q(text, params))[0] ?? null });
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
