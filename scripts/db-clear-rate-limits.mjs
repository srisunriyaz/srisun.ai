// Clears rate-limit counters (e.g. after running the test suite locally).
import './env.mjs';
import { query } from '../server/db.js';
const rows = await query('DELETE FROM rate_limits RETURNING key');
console.log(`cleared ${rows.length} counters`);
