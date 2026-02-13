/**
 * Vercel Serverless Function entrypoint.
 * Exports the Hono app's fetch handler so Vercel can invoke it
 * as an Edge or Node.js serverless function.
 *
 * Environment variables are automatically available on Vercel
 * (set them in your Vercel project settings).
 *
 * @author Nayan Das <https://github.com/nayandas69>
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import { getProfileData, renderCard } from '../src/services/index.js';
import { themes } from '../src/utils/themes.js';

// Create the Hono app instance
const app = new Hono();

// Enable CORS so cards can be embedded anywhere
app.use('*', cors());

// GET / - API information and available themes listing
app.get('/', (c) => {
  return c.json({
    name: 'GitHub Profile Card API',
    version: '0.1.0',
    author: 'Nayan Das (https://github.com/nayandas69)',
    usage: 'GET /card/:username',
    themes: Object.keys(themes),
    repository: 'https://github.com/nayandas69/github-profile-card',
  });
});

// GET /card/:username - Generates and returns an SVG profile card
app.get('/card/:username', async (c) => {
  try {
    const username = c.req.param('username');
    const query = c.req.query();

    const fields = query['fields']
      ? new Set(
          query['fields']
            .split(',')
            .map((v) => v.trim().toLowerCase())
            .filter(Boolean)
        )
      : null;

    const includeLanguages =
      !fields || fields.has('all') || fields.has('languages') || fields.has('langs');

    const data = await getProfileData(username, { includeLanguages });

    const svg = renderCard(data.user, data.stats, data.languages, {
      theme: query['theme'],
      title_color: query['title_color'],
      text_color: query['text_color'],
      icon_color: query['icon_color'],
      bg_color: query['bg_color'],
      border_color: query['border_color'],
      hide_border: query['hide_border'] === 'true',
      compact: query['compact'] === 'true',
    });

    return c.body(svg, 200, {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=0, s-maxage=1800, stale-while-revalidate=1800',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return c.json({ error: message }, 404);
  }
});

// GET /health - Simple health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export the Hono app as a Vercel serverless handler
export default handle(app);
