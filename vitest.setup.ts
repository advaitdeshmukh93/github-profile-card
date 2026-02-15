/**
 * Vitest setup file for global test configuration.
 * Runs before all tests to set up mocks, fixtures, and teardown handlers.
 */

import { beforeAll, afterEach, vi } from 'vitest';

/* ----------------------------------------- */
/*  Global test timeout (prevents hanging)   */
/* ----------------------------------------- */
vi.setConfig({ testTimeout: 10000 });

/* ----------------------------------------- */
/*  Snapshot of original environment         */
/* ----------------------------------------- */
const originalEnv = { ...process.env };
const originalFetch = global.fetch;

/* ----------------------------------------- */
/*  Reset environment after each test        */
/* ----------------------------------------- */
afterEach(() => {
  // Restore original environment variables
  process.env = { ...originalEnv };

  // Clear all vi.fn() mocks
  vi.clearAllMocks();

  // Restore global fetch if it was mocked
  if (global.fetch !== originalFetch) {
    global.fetch = originalFetch;
  }

  // Clear module cache to prevent test isolation issues
  vi.resetModules();
});

/* ----------------------------------------- */
/*  Global error handlers                    */
/* ----------------------------------------- */
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection in tests:', reason);
});
