import { Page, expect } from '@playwright/test';
import { TEST_ENV } from '../../setup/test-env';

/**
 * Authentication helper functions for E2E tests
 */

/**
 * Check if user is authenticated by verifying auth_token cookie exists
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some(cookie => cookie.name === 'auth_token');
}

/**
 * Wait for authentication to complete
 * Checks for auth_token cookie and redirect to expected page
 */
export async function waitForAuth(page: Page, expectedUrl?: string): Promise<void> {
  // Wait for auth_token cookie to be set
  await page.waitForFunction(() => {
    return document.cookie.includes('auth_token');
  }, { timeout: 30000 });

  // If expected URL provided, wait for navigation
  if (expectedUrl) {
    await page.waitForURL(expectedUrl, { timeout: 10000 });
  }
}

/**
 * Logout helper - clears auth cookies
 */
export async function logout(page: Page): Promise<void> {
  // Navigate to a page with the Header component (which has logout button)
  await page.goto('/listings');
  
  // Click Account dropdown
  await page.getByRole('button', { name: /account/i }).click();
  
  // Click Logout button
  await page.getByRole('button', { name: /logout/i }).click();
  
  // Wait for redirect to login
  await page.waitForURL('/login', { timeout: 10000 });
  
  // Verify auth_token cookie is cleared
  const cookies = await page.context().cookies();
  const hasAuthToken = cookies.some(cookie => cookie.name === 'auth_token');
  expect(hasAuthToken).toBe(false);
}

/**
 * Clear all cookies and storage
 */
export async function clearAuth(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Navigate to login page
 */
export async function goToLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await expect(page).toHaveURL('/login');
}

/**
 * Check if user is on login page
 */
export async function isOnLoginPage(page: Page): Promise<boolean> {
  return page.url().includes('/login');
}

/**
 * IMPORTANT: Google OAuth E2E Testing Note
 * 
 * For full E2E OAuth tests, you have two options:
 * 
 * 1. Manual Testing Approach (Recommended for now):
 *    - Run tests in headed mode: npm run test:e2e:headed
 *    - Manually complete Google OAuth flow when prompted
 *    - Tests will continue after authentication
 * 
 * 2. Automated OAuth (Advanced):
 *    - Use Playwright's authentication storage
 *    - Perform OAuth once, save auth state
 *    - Reuse saved state in subsequent tests
 *    - See: https://playwright.dev/docs/auth
 * 
 * Example of saving auth state:
 * 
 * // In a setup script:
 * const context = await browser.newContext();
 * const page = await context.newPage();
 * // ... perform OAuth login manually or with test credentials
 * await context.storageState({ path: 'tests/e2e/.auth/user.json' });
 * 
 * // In tests:
 * const context = await browser.newContext({ 
 *   storageState: 'tests/e2e/.auth/user.json' 
 * });
 */

/**
 * Load saved authentication state (if available)
 * This allows reusing authentication across tests without re-authenticating
 */
export const AUTH_STATE_PATH = 'tests/e2e/.auth/user.json';

/**
 * Helper to check if auth state file exists
 */
export async function hasAuthState(): Promise<boolean> {
  try {
    const fs = await import('fs/promises');
    await fs.access(AUTH_STATE_PATH);
    return true;
  } catch {
    return false;
  }
}
