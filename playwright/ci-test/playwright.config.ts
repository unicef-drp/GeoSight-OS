import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Run tests in files in parallel */
  timeout: 120 * 1000,
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    baseURL: 'http://localhost:2000',
    actionTimeout: 20_000,
    navigationTimeout: 30_000
  },

  outputDir: 'playwright-results',

  /* Configure projects for major browsers */
  projects: [
    // Admin project
    {
      name: 'admin-setup',
      testDir: './tests/admin',
      testMatch: /.*\.setup\.ts/
    },
    {
      name: 'admin-chromium',
      testDir: './tests/admin',
      testMatch: /.*\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Use prepared auth state.
        storageState: 'states/.auth/admin.json',
      },
      dependencies: ['admin-setup'],
    },
    // Contributor project
    {
      name: 'contributor-setup',
      testDir: './tests/contributor',
      testMatch: /.*\.setup\.ts/
    },
    {
      name: 'contributor-chromium',
      testDir: './tests/contributor',
      testMatch: /.*\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Use prepared auth state.
        storageState: 'states/.auth/contributor.json',
      },
      dependencies: ['contributor-setup'],
    },
    // Creator project
    {
      name: 'creator-setup',
      testDir: './tests/creator',
      testMatch: /.*\.setup\.ts/
    },
    {
      name: 'creator-chromium',
      testDir: './tests/creator',
      testMatch: /.*\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Use prepared auth state.
        storageState: 'states/.auth/creator.json',
      },
      dependencies: ['creator-setup'],
    },
  ],
});