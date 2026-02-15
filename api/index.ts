/**
 * Vercel Serverless Function entrypoint.
 * Re-exports the Hono app from src/app.ts so Vercel can invoke it
 * as an Edge or Node.js serverless function.
 *
 * Environment variables are automatically available on Vercel
 * (set them in your Vercel project settings).
 *
 * @author Nayan Das <https://github.com/nayandas69>
 */

import { handle } from 'hono/vercel';
import app from '../src/app.js';

// Export the Hono app as a Vercel serverless handler
export default handle(app);
