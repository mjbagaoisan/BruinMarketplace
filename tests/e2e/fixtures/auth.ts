/*
AI-Assisted Code (Test Fixtures)

Prompt: What are best practices for Playwright test fixtures to handle 
authentication state and cleanup between tests?

Additional Notes: I wrote the basic helper functions. AI suggested clearing 
both cookies and localStorage/sessionStorage, and wrapping the storage clearing 
in a try-catch for when the page context isn't fully loaded yet.
*/
// auth helpers for e2e tests
import { Page, expect } from '@playwright/test';

export async function isAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some(cookie => cookie.name === 'auth_token');
}

export async function logout(page: Page): Promise<void> {
  await page.goto('/listings');
  
  await page.getByRole('button', { name: /account/i }).click();
  
  await page.getByRole('button', { name: /logout/i }).click();
  
  // AuthGate shows "Login Required" in-place instead of redirecting to /login
  await expect(page.getByText(/login required/i)).toBeVisible({ timeout: 10000 });
  
  const cookies = await page.context().cookies();
  const hasAuthToken = cookies.some(cookie => cookie.name === 'auth_token');
  expect(hasAuthToken).toBe(false);
}

// clear cookies and storage for clean state
export async function clearAuth(page: Page): Promise<void> {
  await page.context().clearCookies();
  
  try {
    const url = page.url();
    if (url && !url.startsWith('about:')) {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
  } catch (error) {
  }
}

export async function goToLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await expect(page).toHaveURL('/login');
}
