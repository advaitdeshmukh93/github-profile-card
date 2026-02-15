/**
 * Tests for the GitHub API service.
 * Uses Vitest mocking to avoid real API calls during testing.
 * Each test uses vi.resetModules() + dynamic import() to get a fresh
 * module instance that picks up the mocked process.env and fetch.
 *
 * @author Nayan Das <https://github.com/nayandas69>
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* -------------------------------------------------- */
/*  Helper: build a mock GitHub GraphQL API response   */
/* -------------------------------------------------- */
function mockGitHubResponse(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      user: {
        login: 'octocat',
        name: 'The Octocat',
        avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
        bio: 'GitHub mascot',
        pronouns: null,
        twitterUsername: null,
        openPRs: { totalCount: 5 },
        closedPRs: { totalCount: 10 },
        mergedPRs: { totalCount: 20 },
        openIssues: { totalCount: 3 },
        closedIssues: { totalCount: 7 },
        contributionsCollection: { totalCommitContributions: 500 },
        repositories: {
          totalCount: 8,
          pageInfo: { hasNextPage: false, endCursor: null },
          nodes: [
            {
              stargazers: { totalCount: 100 },
              languages: {
                edges: [
                  {
                    size: 5000,
                    node: { name: 'TypeScript', color: '#3178c6' },
                  },
                  {
                    size: 3000,
                    node: { name: 'JavaScript', color: '#f1e05a' },
                  },
                ],
              },
            },
            {
              stargazers: { totalCount: 50 },
              languages: {
                edges: [
                  {
                    size: 2000,
                    node: { name: 'TypeScript', color: '#3178c6' },
                  },
                ],
              },
            },
          ],
        },
        ...overrides,
      },
    },
  };
}

/* -------------------------------------------------- */
/*  Test suite                                         */
/* -------------------------------------------------- */
describe('getProfileData', () => {
  beforeEach(() => {
    // Reset module registry so each test gets a fresh import
    vi.resetModules();

    // Clear Upstash vars to avoid Redis in tests
    delete process.env['UPSTASH_REDIS_REST_URL'];
    delete process.env['UPSTASH_REDIS_REST_TOKEN'];
    delete process.env['KV_REST_API_URL'];
    delete process.env['KV_REST_API_TOKEN'];
  });

  /* ---------------------------------------------- */
  /*  Token validation                               */
  /* ---------------------------------------------- */
  it('throws when GITHUB_TOKEN is missing', async () => {
    // Make sure token is NOT set
    delete process.env['GITHUB_TOKEN'];

    const { getProfileData } = await import('../src/services/github');

    await expect(getProfileData('octocat')).rejects.toThrow('GITHUB_TOKEN');
  });

  /* ---------------------------------------------- */
  /*  Successful fetch + data structuring            */
  /* ---------------------------------------------- */
  it('fetches and structures profile data correctly', async () => {
    // Set token BEFORE importing so getHeaders() finds it
    process.env['GITHUB_TOKEN'] = 'ghp_test_token_1234567890';

    // Mock fetch: first call = GraphQL, second call = avatar download
    const mockResponse = mockGitHubResponse();
    let callCount = 0;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // GraphQL API response
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockResponse),
          });
        }
        // Avatar fetch response (small fake PNG)
        return Promise.resolve(
          new Response(new Uint8Array([137, 80, 78, 71]), {
            headers: { 'content-type': 'image/png' },
          })
        );
      })
    );

    const { getProfileData } = await import('../src/services/github');
    const data = await getProfileData('octocat');

    // Verify user profile shape
    expect(data.user.login).toBe('octocat');
    expect(data.user.name).toBe('The Octocat');
    expect(data.user.bio).toBe('GitHub mascot');

    // Verify aggregated stats: 100 + 50 = 150 stars
    expect(data.stats.stars).toBe(150);
    expect(data.stats.repos).toBe(8);
    // PRs: 5 + 10 + 20 = 35
    expect(data.stats.prs).toBe(35);
    // Issues: 3 + 7 = 10
    expect(data.stats.issues).toBe(10);
    expect(data.stats.commits).toBe(500);

    // Verify language aggregation (TypeScript: 5000 + 2000 = 7000, JS: 3000)
    expect(data.languages.length).toBeGreaterThanOrEqual(1);
    const ts = data.languages.find((l) => l.name === 'TypeScript');
    expect(ts).toBeDefined();
    expect(ts!.size).toBe(7000);
  });

  /* ---------------------------------------------- */
  /*  API error handling                             */
  /* ---------------------------------------------- */
  it('handles GitHub API errors gracefully', async () => {
    // Set token so we get past the token check
    process.env['GITHUB_TOKEN'] = 'ghp_test_token_1234567890';

    // Mock fetch to return a 401 authentication error
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Bad credentials'),
      })
    );

    const { getProfileData } = await import('../src/services/github');

    // Expect the specific authentication error message
    await expect(getProfileData('octocat')).rejects.toThrow('GitHub API authentication failed');
  });

  /* ---------------------------------------------- */
  /*  Rate limit error handling                      */
  /* ---------------------------------------------- */
  it('handles rate limit errors gracefully', async () => {
    // Set token so we get past the token check
    process.env['GITHUB_TOKEN'] = 'ghp_test_token_1234567890';

    // Mock fetch to return a 403 rate limit error
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: () => Promise.resolve('API rate limit exceeded'),
      })
    );

    const { getProfileData } = await import('../src/services/github');

    // Expect the specific rate limit error message
    await expect(getProfileData('octocat')).rejects.toThrow(
      'GitHub API rate limit exceeded or access forbidden'
    );
  });

  /* ---------------------------------------------- */
  /*  User not found handling                        */
  /* ---------------------------------------------- */
  it('handles user not found errors', async () => {
    // Set token so we get past the token check
    process.env['GITHUB_TOKEN'] = 'ghp_test_token_1234567890';

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { user: null } }),
      })
    );

    const { getProfileData } = await import('../src/services/github');

    await expect(getProfileData('nonexistent')).rejects.toThrow('User not found');
  });
});
