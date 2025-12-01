import { test, expect } from '@playwright/test';
import { logout, isAuthenticated, clearAuth } from '../fixtures';

test.describe('Authentication - Logout Flow', () => {
  
  test.use({ 
    storageState: 'tests/e2e/.auth/user.json',
  });

  test.beforeEach(async ({ page }) => {
    const authenticated = await isAuthenticated(page);
    if (!authenticated) {
      test.skip(true, 'No authentication state available. Please login first.');
    }
  });

  test('AUTH_04: should successfully logout and clear auth token', async ({ page }) => {
    await page.goto('/listings');
    
    let authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(true);
    
    await expect(page).toHaveURL('/listings');
    
    await logout(page);
    
    await expect(page).toHaveURL('/');
    
    authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(false);
    
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === 'auth_token');
    expect(authCookie).toBeUndefined();
  });

  test('should not be able to access protected routes after logout', async ({ page }) => {
    await page.goto('/listings');
    
    await logout(page);
    
    await page.goto('/listings');
    
    await page.waitForURL('/login', { timeout: 10000 });
    await expect(page).toHaveURL('/login');
  });

  test('should clear user context after logout', async ({ page }) => {
    await page.goto('/listings');
    
    await expect(page.getByText(/browse listings/i)).toBeVisible();
    
    await logout(page);
    
    await page.goto('/');
    
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(false);
  });
});

test.describe('Authentication - Logout API', () => {
  
  test.use({ 
    storageState: 'tests/e2e/.auth/user.json',
  });

  test('should successfully call logout API endpoint', async ({ page }) => {
    await page.goto('/listings');
    
    const response = await page.request.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      headers: {
        'Cookie': (await page.context().cookies())
          .map(c => `${c.name}=${c.value}`)
          .join('; '),
      },
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});

test.describe('Authentication - Logout Without Auth', () => {
  
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should handle logout when not authenticated', async ({ page }) => {
    const response = await page.request.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`);
    
    expect(response.status()).toBe(200);
  });
});
