/**
 * Hono application definition.
 * Defines all HTTP routes for the GitHub Profile Card API.
 * Separated from the server entrypoint so it can be imported
 * for testing or deployed as a serverless function.
 *
 * @author Nayan Das <https://github.com/nayandas69>
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getProfileData, renderCard } from './services/index.js';
import { themes } from './utils/themes.js';

/** Create the Hono app instance */
const app = new Hono();

/* --- Middleware --- */

// Enable CORS so cards can be embedded anywhere
app.use('*', cors());

/* --- Routes --- */

/**
 * GET /
 * API information and available themes listing.
 */
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

/**
 * GET /card/:username
 * Generates and returns an SVG profile card for the given GitHub username.
 *
 * Query parameters:
 *   - theme: Theme name (e.g. "github_dark", "dracula")
 *   - title_color, text_color, icon_color, bg_color, border_color: Hex colors (without #)
 *   - hide_border: "true" to remove the card border
 *   - compact: "true" to hide bio, pronouns, twitter, and language labels
 *   - fields: Comma-separated list ("languages", "stats", "all")
 */
app.get('/card/:username', async (c) => {
  try {
    const username = c.req.param('username');
    const query = c.req.query();

    // Parse optional fields filter
    const fields = query['fields']
      ? new Set(
          query['fields']
            .split(',')
            .map((v) => v.trim().toLowerCase())
            .filter(Boolean)
        )
      : null;

    // Determine if we need to fetch language data
    const includeLanguages =
      !fields || fields.has('all') || fields.has('languages') || fields.has('langs');

    // Fetch profile data (with multi-layer caching)
    const data = await getProfileData(username, { includeLanguages });

    // Render the SVG card with optional theme/color overrides
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

    // Return SVG with aggressive caching headers
    return c.body(svg, 200, {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=0, s-maxage=1800, stale-while-revalidate=1800',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return c.json({ error: message }, 404);
  }
});

/**
 * GET /health
 * Simple health check endpoint for monitoring and uptime pings.
 */
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
