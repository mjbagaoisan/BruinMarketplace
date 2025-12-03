// login flow tests
import { test, expect } from '@playwright/test';
import { goToLogin, isAuthenticated, clearAuth } from '../fixtures';

test.describe('Authentication - Login Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  // requires manual google login - cant automate oauth
  test('AUTH_01: should successfully login with valid UCLA email via Google OAuth', async ({ page }) => {
    await goToLogin(page);
    
    await expect(page.getByText(/welcome/i)).toBeVisible();
    await expect(page.getByText(/sign in with google/i)).toBeVisible();
    
    const googleButton = page.getByRole('button', { name: /sign in with google/i });
    await expect(googleButton).toBeVisible();
    
    await googleButton.click();
    
    console.log('\nWaiting for manual login completion...');
    console.log(' Please select your @ucla.edu account in the browser\n');
    
    await page.waitForURL(/\/callback\?success=true/, { timeout: 60000 });
    
    await page.waitForURL('/home', { timeout: 10000 });
    
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(true);
    
    await expect(page).toHaveURL('/home');
    
    await expect(page.getByText(/login required/i)).not.toBeVisible();
    
    console.log('Login successful!\n');
  });

  // test that non-ucla emails get rejected
  test('AUTH_02: should reject login with non-UCLA email domain', async ({ page }) => {
    await goToLogin(page);
    
    await page.getByRole('button', { name: /sign in with google/i }).click();
    
    console.log('\n Waiting for manual Google OAuth with non-UCLA email...');
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
