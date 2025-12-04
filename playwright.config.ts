import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/setup/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: 'html',
  timeout: 60000,

  use: {
    baseURL: process.env.FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: false,

    // bypass google oauth "browser not secure" problem
    launchOptions: {
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-infobars',
        '--disable-extensions',
        '--start-maximized',
        '--window-size=1280,720'
      ]
    },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  // use to test different browsers
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
