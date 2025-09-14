// playwright.config.ts - E2E Testing Configuration for Tauri Desktop App
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['github'], // GitHub Actions integration
    ['list'] // Console output
  ],
  use: {
    // Tauri app runs on localhost during development
    baseURL: 'http://localhost:1420',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Tauri-specific settings
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    // Healthcare data protection - no sensitive data in traces
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    // Desktop testing - Tauri runs on Chromium
    {
      name: 'tauri-desktop',
      use: {
        ...devices['Desktop Chrome'],
        // Tauri-specific viewport for healthcare workflows
        viewport: { width: 1440, height: 900 },
      },
    },
    
    // Cross-browser testing for web components
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile viewport testing for responsive design
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],

  webServer: {
    command: 'npm run tauri dev',
    url: 'http://localhost:1420',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Test environment variables
      NODE_ENV: 'test',
      TAURI_ENV: 'test',
      // Disable telemetry in tests
      TAURI_CONFIG_NO_BUNDLE_UPDATER: 'true',
    },
  },

  // Global test configuration
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',

  // Test matching patterns
  testMatch: [
    'tests/e2e/**/*.spec.ts',
    'tests/e2e/**/*.test.ts',
  ],

  // Output directories
  outputDir: 'test-results/artifacts',
  
  // Expect configuration for healthcare app reliability
  expect: {
    // Screenshots comparison threshold
    threshold: 0.2,
    // Animation handling
    toHaveScreenshot: { mode: 'css', animations: 'disabled' },
    toMatchScreenshot: { mode: 'css', animations: 'disabled' },
  },
});