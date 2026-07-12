import { defineConfig } from '@playwright/test';

// Local test config — runs on your Mac, costs zero Claude tokens.
//   npm run test:e2e            headless, exit-code pass/fail
//   npm run test:e2e -- --ui    Playwright's time-travel UI
// Auto-starts the Vite dev server; reuses one if already running.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'tests/__report__', open: 'never' }]],
  outputDir: 'tests/__results__',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    // The phone is the primary target — portrait, touch, retina.
    {
      name: 'phone-portrait',
      use: { browserName: 'chromium', viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    },
    {
      name: 'desktop',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 720 } },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
