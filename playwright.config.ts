import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.local' });

export default defineConfig({
  testDir: './tests/e2e',
  
  // Global setup
  globalSetup: './tests/setup/global-setup.ts',
  
  // Run tests in files in parallel
  fullyParallel: true, // Enable parallel test execution for better performance
  
  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Optimize workers for parallel execution
  workers: process.env.CI ? 2 : 4, // Enable parallelism while managing resource usage
  
  // Reporter to use
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL for navigation
    baseURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    
    // Run in headed mode by default for easier manual OAuth flows
    headless: false,
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Timeout for each action
    actionTimeout: 10000,
   // Added this because of browser security issues 
    launchOptions: {
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-web-security',
        '--disable-infobars',
        '--disable-extensions',
        '--start-maximized',
        '--window-size=1280,720',
      ],
    },
  },

  // Configure projects for major browsers
  projects: [
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
  ],



  // Global timeout
  timeout: 100000,
  
  // Expect timeout
  expect: {
    timeout: 5000,
  },
});
