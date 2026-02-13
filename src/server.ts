/**
 * Node.js HTTP server entrypoint.
 * Uses @hono/node-server to run the Hono app on a standard Node.js server.
 * This file is only used for local development and self-hosted deployments.
 * For Vercel, use the serverless handler export in api/index.ts instead.
 *
 * Environment variables are loaded automatically via the --env-file=.env
 * flag in the "dev" and "start" scripts (Node.js 20.6+ feature).
 *
 * @author Nayan Das <https://github.com/nayandas69>
 */

import { serve } from '@hono/node-server';
import app from './app.js';

/** Port to listen on (defaults to 3000) */
const port = Number(process.env['PORT'] || 3000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`GitHub Profile Card API running on http://localhost:${port}`);
});
