import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In development the /api/v1 router (server/app.js) runs inside the Vite dev
// server, so the frontend stays same-origin and the code path is the one the
// Vercel function uses in production.
const devApi = () => ({
  name: 'srisun-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/v1', async (req, res) => {
      req.url = `/api/v1${req.url}`;
      const { handle } = await server.ssrLoadModule('/server/app.js');
      await handle(req, res);
    });
  },
});

export default defineConfig(({ mode }) => {
  // server-side secrets (DATABASE_URL) from .env.local; never exposed to the bundle
  Object.assign(process.env, { ...loadEnv(mode, process.cwd(), ''), ...process.env });
  return { plugins: [react(), devApi()] };
});
