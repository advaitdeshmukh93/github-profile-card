/**
 * GitHub GraphQL API client and data fetcher.
 * Fetches user profile, stats, and top languages with multi-layer caching
 * (in-memory + Upstash Redis) and request deduplication.
 *
 * @author Nayan Das <https://github.com/nayandas69>
 */

import type { ProfileData, LanguageStat } from '../types/index.js';

/* ---------- Auth ---------- */

/** Builds authorization headers for the GitHub GraphQL API */
function getHeaders(): Record<string, string> {
  const token = process.env['GITHUB_TOKEN'];
  if (!token) throw new Error('GITHUB_TOKEN is missing. Set it in your .env file.');

  return {
    Authorization: `bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'github-profile-card',
  };
}

/* ---------- GraphQL Queries ---------- */

/**
 * Full query that includes language breakdown per repository.
 * Used when the caller wants language stats on the card.
 */
const QUERY_WITH_LANGS = `
query userInfo($login: String!, $cursor: String, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    login
    name
    avatarUrl
    bio
    pronouns
    twitterUsername
    openPRs: pullRequests(states: OPEN) { totalCount }
    closedPRs: pullRequests(states: CLOSED) { totalCount }
    mergedPRs: pullRequests(states: MERGED) { totalCount }
    openIssues: issues(states: OPEN) { totalCount }
    closedIssues: issues(states: CLOSED) { totalCount }
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {direction: DESC, field: STARGAZERS}, after: $cursor) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        stargazers { totalCount }
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { color name } }
        }
      }
    }
  }
}`;

/** Lighter query that skips language data for faster responses */
const QUERY_NO_LANGS = `
query userInfo($login: String!, $cursor: String, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    login
    name
    avatarUrl
    bio
    pronouns
    twitterUsername
    openPRs: pullRequests(states: OPEN) { totalCount }
    closedPRs: pullRequests(states: CLOSED) { totalCount }
    mergedPRs: pullRequests(states: MERGED) { totalCount }
    openIssues: issues(states: OPEN) { totalCount }
    closedIssues: issues(states: CLOSED) { totalCount }
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {direction: DESC, field: STARGAZERS}, after: $cursor) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        stargazers { totalCount }
      }
    }
  }
}`;

/* ---------- Cache Layer ---------- */

/** Cache TTL: 30 minutes (matches the CDN s-maxage) */
const CACHE_TTL_SECONDS = 30 * 60;

/** Maximum number of in-flight requests to prevent memory bloat */
const MAX_IN_FLIGHT_REQUESTS = 100;

/** In-memory cache entry with expiry and optional in-flight promise */
interface CacheEntry {
  expiresAt: number;
  value?: ProfileData;
  inFlight?: Promise<ProfileData>;
}

/** In-memory LRU-style cache map */
const cache = new Map<string, CacheEntry>();

/** Counter for in-flight requests */
let inFlightCount = 0;

/** Options for controlling what data to fetch */
interface FetchOptions {
  includeLanguages?: boolean;
}

/* ---------- Upstash Redis (optional) ---------- */

// Read Upstash credentials from environment (supports both naming conventions)
const redisUrl = process.env['UPSTASH_REDIS_REST_URL'] || process.env['KV_REST_API_URL'] || '';
const redisToken =
  process.env['UPSTASH_REDIS_REST_TOKEN'] || process.env['KV_REST_API_TOKEN'] || '';

/** Lazy-loaded Redis singleton (null if credentials are missing) */
let redisPromise: Promise<import('@upstash/redis').Redis | null> | null = null;

/**
 * Returns an Upstash Redis client, or null if credentials aren't configured.
 * The import is dynamic so the app works fine without Upstash in dev mode.
 */
async function getRedis(): Promise<import('@upstash/redis').Redis | null> {
  if (!redisUrl || !redisToken) return null;

  if (!redisPromise) {
    redisPromise = import('@upstash/redis')
      .then((mod) => new mod.Redis({ url: redisUrl, token: redisToken }))
      .catch((err) => {
        console.error('Failed to initialize Redis:', err instanceof Error ? err.message : err);
        return null;
      });
  }

  return redisPromise;
}

/* ---------- Avatar Helper ---------- */

/**
 * Downloads a GitHub avatar and converts it to a base64 data URL.
 * This allows the avatar to be embedded directly in the SVG
 * so the card works in contexts that don't support external images.
 */
async function fetchAvatarDataUrl(url: string): Promise<string | null> {
  try {
    // Request a smaller 96px version for better performance
    const sizedUrl = `${url}${url.includes('?') ? '&' : '?'}s=96`;
    const res = await fetch(sizedUrl, {
      headers: { 'User-Agent': 'github-profile-card' },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!res.ok) {
      console.warn(`Avatar fetch failed: ${res.status} for ${url}`);
      return null;
    }

    const contentType = res.headers.get('content-type') || 'image/png';
    const bytes = await res.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (err) {
    console.warn('Avatar fetch error:', err instanceof Error ? err.message : err);
    return null;
  }
}

/* ---------- Cache Helpers ---------- */

/** Reads from the in-memory cache (returns null if expired or missing) */
function getCache(cacheKey: string): ProfileData | null {
  const entry = cache.get(cacheKey);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    cache.delete(cacheKey);
    return null;
  }

  return entry.value ?? null;
}

/** Writes a value into the in-memory cache */
function setCache(cacheKey: string, value: ProfileData): void {
  cache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000,
    value,
  });
}

/* ---------- Main Fetch Function ---------- */

/**
 * Fetches a GitHub user's profile data including stats and top languages.
 * Implements a 3-tier caching strategy:
 *   1. In-memory cache (fastest, per-instance)
 *   2. Upstash Redis (shared across instances, optional)
 *   3. Live GitHub GraphQL API (fallback, paginates all repos)
 *
 * Also deduplicates concurrent requests for the same user to prevent
 * hammering the GitHub API when multiple cards load simultaneously.
 */
export async function getProfileData(
  username: string,
  opts: FetchOptions = {}
): Promise<ProfileData> {
  const includeLanguages = opts.includeLanguages ?? true;
  const cacheKey = `${username}:${includeLanguages ? 'langs' : 'nolangs'}`;

  /* --- Layer 1: In-memory cache --- */
  const cached = getCache(cacheKey);
  if (cached) return cached;

  /* --- Layer 2: Upstash Redis --- */
  const redis = await getRedis();
  if (redis) {
    try {
      const redisValue = await redis.get<ProfileData>(`profile:${cacheKey}`);
      if (redisValue) {
        setCache(cacheKey, redisValue);
        return redisValue;
      }
    } catch (err) {
      console.warn('Redis get error:', err instanceof Error ? err.message : err);
      // Redis failure is non-fatal; fall through to API
    }
  }

  /* --- Deduplicate in-flight requests --- */
  const existing = cache.get(cacheKey);
  if (existing?.inFlight) return existing.inFlight;

  /* --- Check in-flight request limit --- */
  if (inFlightCount >= MAX_IN_FLIGHT_REQUESTS) {
    throw new Error('Too many concurrent requests. Please try again later.');
  }

  /* --- Layer 3: Live GitHub GraphQL API --- */
  inFlightCount++;
  const inFlight = (async (): Promise<ProfileData> => {
    try {
      // Build date range for contribution stats (current year)
      const now = new Date();
      const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0));
      const from = yearStart.toISOString();
      const to = now.toISOString();

      let hasNextPage = true;
      let cursor: string | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let user: any = null;
      let totalStars = 0;
      const langMap = includeLanguages ? new Map<string, { size: number; color: string }>() : null;
      let pageCount = 0;
      const maxPages = 10; // Prevent runaway pagination

      // Paginate through all repositories to get complete data
      while (hasNextPage && pageCount < maxPages) {
        pageCount++;

        const res = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            query: includeLanguages ? QUERY_WITH_LANGS : QUERY_NO_LANGS,
            variables: { login: username, cursor, from, to },
          }),
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (!res.ok) {
          const text = await res.text();
          if (res.status === 401) {
            throw new Error('GitHub API authentication failed (401)');
          }
          if (res.status === 403) {
            throw new Error('GitHub API rate limit exceeded or access forbidden (403)');
          }
          throw new Error(`GitHub API error (${res.status}): ${text.slice(0, 100)}`);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body = (await res.json()) as any;

        if (body.errors?.length) {
          const msg =
            body.errors
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((e: any) => e.message)
              .filter(Boolean)
              .join(' | ') || 'GitHub API error';
          throw new Error(msg);
        }

        if (!body.data?.user) throw new Error('User not found');

        // Store user data from first page only
        if (!user) user = body.data.user;

        const repos = body.data.user.repositories;
        const nodes = repos.nodes || [];

        // Aggregate stars and language data across all repos
        for (const repo of nodes) {
          totalStars += repo.stargazers.totalCount;

          if (langMap) {
            const edges = repo.languages?.edges || [];
            for (const edge of edges) {
              if (!edge.node || !edge.size) continue;
              const current = langMap.get(edge.node.name);
              if (current) {
                current.size += edge.size;
              } else {
                langMap.set(edge.node.name, {
                  size: edge.size,
                  color: edge.node.color || '#ccc',
                });
              }
            }
          }
        }

        hasNextPage = repos.pageInfo.hasNextPage;
        cursor = repos.pageInfo.endCursor;
        if (nodes.length === 0) hasNextPage = false;
      }

      // Sort languages by size (descending) and take top 5
      const languages: LanguageStat[] = langMap
        ? Array.from(langMap.entries())
            .sort((a, b) => b[1].size - a[1].size)
            .slice(0, 5)
            .map(([name, d]) => ({ name, size: d.size, color: d.color }))
        : [];

      // Fetch and embed the avatar as a base64 data URL
      const avatarDataUrl = await fetchAvatarDataUrl(user.avatarUrl);

      const profile: ProfileData = {
        user: {
          login: user.login,
          name: user.name,
          avatarUrl: user.avatarUrl,
          avatarDataUrl,
          bio: user.bio,
          pronouns: user.pronouns,
          twitter: user.twitterUsername,
        },
        stats: {
          stars: totalStars,
          repos: user.repositories.totalCount,
          prs:
            (user.openPRs?.totalCount || 0) +
            (user.closedPRs?.totalCount || 0) +
            (user.mergedPRs?.totalCount || 0),
          issues: (user.openIssues?.totalCount || 0) + (user.closedIssues?.totalCount || 0),
          commits: user.contributionsCollection?.totalCommitContributions || 0,
        },
        languages,
      };

      // Populate both cache layers
      setCache(cacheKey, profile);
      if (redis) {
        try {
          await redis.set(`profile:${cacheKey}`, profile, {
            ex: CACHE_TTL_SECONDS,
          });
        } catch (err) {
          console.warn('Redis set error:', err instanceof Error ? err.message : err);
          // Non-fatal: Redis write failure doesn't break the response
        }
      }

      return profile;
    } catch (err) {
      // Clear cache entry on failure so next request retries
      cache.delete(cacheKey);
      throw err;
    } finally {
      inFlightCount--;
    }
  })();

  // Store the in-flight promise so concurrent requests share it
  cache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000,
    inFlight,
  });

  return inFlight;
}
