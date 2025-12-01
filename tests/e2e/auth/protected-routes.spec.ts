import { test, expect } from '@playwright/test';
import { clearAuth, isAuthenticated } from '../fixtures';

test.describe('Authentication - Protected Routes', () => {
  
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('AUTH_03: should redirect to login when accessing /listings without auth', async ({ page }) => {
    await page.goto('/listings');
    
    await page.waitForURL('/login', { timeout: 10000 });
    
    await expect(page).toHaveURL('/login');
    
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(false);
    
    await expect(page.getByText(/welcome/i)).toBeVisible();
    await expect(page.getByText(/sign in with google/i)).toBeVisible();
  });

  test('should redirect to login when accessing /home without auth', async ({ page }) => {
    await page.goto('/home');
    
    await page.waitForURL('/login', { timeout: 10000 });
    
    await expect(page).toHaveURL('/login');
    
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(false);
  });

  test('should allow access to public routes without auth', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveURL('/');
    
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(false);
  });
});

test.describe('Authentication - API Protection', () => {
  
  test('should return 401 when calling protected API without auth', async ({ request }) => {
    const response = await request.get(`${process.env.NEXT_PUBLIC_API_URL}/api/listings`);
    
    expect(response.status()).toBe(401);
  });

  test('should return 401 when calling /me endpoint without auth', async ({ request }) => {
    const response = await request.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`);
    
    expect(response.status()).toBe(401);
  });

  test('should return 401 when creating listing without auth', async ({ request }) => {
    const response = await request.post(`${process.env.NEXT_PUBLIC_API_URL}/api/listings`, {
      data: {
        title: 'Test Listing',
        price: 50,
        condition: 'good',
        category: 'textbooks',
        location: 'hill',
        status: 'active',
      },
    });
    
    expect(response.status()).toBe(401);
  });
});
