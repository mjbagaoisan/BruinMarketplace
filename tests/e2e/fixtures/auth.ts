// auth helpers for e2e tests
import { Page, expect } from '@playwright/test';
import { TEST_ENV } from '../../setup/test-env';

export async function isAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some(cookie => cookie.name === 'auth_token');
}

export async function waitForAuth(page: Page, expectedUrl?: string): Promise<void> {
  await page.waitForFunction(() => {
    return document.cookie.includes('auth_token');
  }, { timeout: 30000 });

  if (expectedUrl) {
    await page.waitForURL(expectedUrl, { timeout: 10000 });
  }
}

export async function logout(page: Page): Promise<void> {
  await page.goto('/listings');
  
  await page.getByRole('button', { name: /account/i }).click();
  
  await page.getByRole('button', { name: /logout/i }).click();
  
  await page.waitForURL('/login', { timeout: 10000 });
  
  const cookies = await page.context().cookies();
  const hasAuthToken = cookies.some(cookie => cookie.name === 'auth_token');
  expect(hasAuthToken).toBe(false);
}

// clear cookies and storage for clean state
export async function clearAuth(page: Page): Promise<void> {
  await page.context().clearCookies();
  
  try {
    const url = page.url();
    if (url && !url.startsWith('about:')) { // cant access storage on about:blank
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

export async function isOnLoginPage(page: Page): Promise<boolean> {
  return page.url().includes('/login');
}

// playwright reuses this to skip login
export const AUTH_STATE_PATH = 'tests/e2e/.auth/user.json';

export async function hasAuthState(): Promise<boolean> {
  try {
    const fs = await import('fs/promises');
    await fs.access(AUTH_STATE_PATH);
    return true;
  } catch {
    return false;
  }
}
