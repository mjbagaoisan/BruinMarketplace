import { test, expect } from '@playwright/test';
import { goToLogin, waitForAuth, isAuthenticated, clearAuth } from '../fixtures';
import { TEST_ENV } from '../../setup/test-env';

test.describe('Authentication - Login Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('AUTH_01: should successfully login with valid UCLA email via Google OAuth', async ({ page }) => {
    await goToLogin(page);
    
    await expect(page.getByText(/welcome/i)).toBeVisible();
    await expect(page.getByText(/sign in with google/i)).toBeVisible();
    
    const googleButton = page.getByRole('button', { name: /sign in with google/i });
    await expect(googleButton).toBeVisible();
    
    await googleButton.click();
    
    // Manual OAuth required: Google OAuth cannot be automated in headless mode
    // Tests wait for user to complete authentication in the browser
    console.log('\nWaiting for manual login completion...');
    console.log(' Please select your @ucla.edu account in the browser\n');
    
    await page.waitForURL(/\/callback\?success=true/, { timeout: 60000 });
    
    await page.waitForURL('/home', { timeout: 10000 });
    
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(true);
    
    await expect(page).toHaveURL('/home');
    
    await expect(page.getByText(/browse listings/i)).toBeVisible();
    
    console.log('Login successful!\n');
  });

  test('AUTH_02: should reject login with non-UCLA email domain', async ({ page }) => {
    await goToLogin(page);
    
    await page.getByRole('button', { name: /sign in with google/i }).click();
    
    // Test domain validation by attempting login with non-UCLA email
    console.log('\n⏳ Waiting for manual Google OAuth with non-UCLA email...');
    console.log('   Please select a NON-UCLA email account (e.g., @gmail.com)\n');
    
    await page.waitForURL(/\/login\?error=/, { timeout: 60000 });
    
    const url = page.url();
    expect(url).toContain('error=invalid_domain');
    
    await expect(page).toHaveURL(/\/login/);
    
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(false);
    
    console.log('Non-UCLA email correctly rejected\n');
  });
});

test.describe('Authentication - Login Page UI', () => {
  
  test('should display login page elements correctly', async ({ page }) => {
    await goToLogin(page);
    
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
    
    await expect(page.getByText(/login.*create your account/i)).toBeVisible();
    
    const googleButton = page.getByRole('button', { name: /sign in with google/i });
    await expect(googleButton).toBeVisible();
    
    const googleLogo = page.getByAltText(/google/i);
    await expect(googleLogo).toBeVisible();
    
    const backButton = page.getByRole('link', { name: /back/i });
    await expect(backButton).toBeVisible();
    
    await expect(page.getByText(/terms of service/i)).toBeVisible();
    await expect(page.getByText(/privacy policy/i)).toBeVisible();
  });

  test('should navigate back to home from login page', async ({ page }) => {
    await goToLogin(page);
    
    await page.getByRole('link', { name: /back/i }).click();
    
    await expect(page).toHaveURL('/');
  });
});
