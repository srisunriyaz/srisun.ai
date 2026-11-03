// Team accounts, managed by admins: add people, change role, deactivate, reset password.

import { query, one } from '../db.js';
import { fail, only, str, email, oneOf } from '../http.js';
import { hashPassword, passwordProblem } from '../auth.js';

export const ROLES = ['admin', 'editor', 'hr'];

const payload = (row) => ({
  id: row.id, name: row.name, email: row.email, role: row.role, active: row.is_active,
  lastLoginAt: row.last_login_at, createdAt: row.created_at
});

export async function listUsers() {
  return (await query('SELECT * FROM admin_users ORDER BY is_active DESC, role, name')).map(payload);
}

export async function createUser(body) {
  const data = only(body, ['name', 'email', 'role', 'password']);
  const name = str(data, 'name', 120, { required: true, label: 'Name' });
  const address = email(data, 'email', { label: 'Email' }).toLowerCase();
  const role = oneOf(data.role, ROLES, null);
  if (!role) fail(422, 'validation_failed', 'Choose a role.', { field: 'role' });
  const problem = passwordProblem(data.password);
  if (problem) fail(422, 'validation_failed', problem, { field: 'password' });
  if (await one('SELECT id FROM admin_users WHERE email = $1', [address])) fail(409, 'duplicate', 'An account with this email already exists.', { field: 'email' });
  return payload(await one(
    'INSERT INTO admin_users (name, email, role, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, address, role, await hashPassword(data.password)]
  ));
}

export async function updateUser(selfId, id, body) {
  const data = only(body, ['name', 'role', 'active', 'password']);
  const current = await one('SELECT * FROM admin_users WHERE id = $1', [id]);
  if (!current) fail(404, 'not_found', 'No such account.');
  if (id === selfId && (('role' in data && data.role !== current.role) || data.active === false)) {
    fail(422, 'validation_failed', 'You cannot change your own role or deactivate yourself.');
  }
  const role = 'role' in data ? oneOf(data.role, ROLES, null) : current.role;
  if (!role) fail(422, 'validation_failed', 'Choose a role.', { field: 'role' });
  const active = 'active' in data ? data.active === true : current.is_active;
  // keep at least one active admin
  if (current.role === 'admin' && current.is_active && (role !== 'admin' || !active)) {
    const { count } = await one("SELECT count(*)::int AS count FROM admin_users WHERE role = 'admin' AND is_active");
    if (count <= 1) fail(422, 'validation_failed', 'There must be at least one active admin.');
  }
  let hash = current.password_hash;
  if (data.password) {
    const problem = passwordProblem(data.password);
    if (problem) fail(422, 'validation_failed', problem, { field: 'password' });
    hash = await hashPassword(data.password);
  }
  const row = await one(
    'UPDATE admin_users SET name = $1, role = $2, is_active = $3, password_hash = $4 WHERE id = $5 RETURNING *',
    ['name' in data ? str(data, 'name', 120, { required: true, label: 'Name' }) : current.name, role, active, hash, id]
  );
  // a new password, role change or deactivation signs that person out everywhere
  if (data.password || role !== current.role || !active) await query('DELETE FROM admin_sessions WHERE user_id = $1', [id]);
  return payload(row);
}
