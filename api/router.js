// Vercel serverless entry point for /api/v1/* (see the rewrite in vercel.json).
import { handle } from '../server/app.js';

export default function handler(req, res) {
  return handle(req, res);
}

// Body parsing is done by the router itself (JSON size limits, multipart uploads).
export const config = { api: { bodyParser: false } };
