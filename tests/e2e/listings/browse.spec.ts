import { test, expect } from '@playwright/test';

test.describe('Listings - Browse', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  const listingCards = 'a[href^="/listings/"]';
  
  async function waitForListingsToLoad(page: any) {
    await expect(page.getByText('Loading listings...')).not.toBeVisible({ timeout: 10000 });
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/listings');
    await page.waitForLoadState('networkidle');
  });

  test('BROWSE_01: displays listings grid when authenticated', async ({ page }) => {
    await expect(page).toHaveURL('/listings');
    await waitForListingsToLoad(page);
    
    const hasListings = await page.locator(listingCards).count() > 0;
    const hasEmptyState = await page.getByText(/no listings/i).isVisible();
    
    expect(hasListings || hasEmptyState).toBe(true);
    
    if (hasListings) {
      await expect(page.locator(listingCards).first()).toBeVisible();
      await expect(page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible();
    }
  });

  test('BROWSE_02: filters by condition', async ({ page }) => {
    await waitForListingsToLoad(page);
    const initialCount = await page.locator(listingCards).count();
    
    await page.getByRole('combobox').filter({ hasText: /condition/i }).click();
    await page.getByRole('option', { name: /like new/i }).click();
    
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    const filteredCount = await page.locator(listingCards).count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('BROWSE_03: filters by location', async ({ page }) => {
    await waitForListingsToLoad(page);
    const initialCount = await page.locator(listingCards).count();
    
    await page.getByRole('combobox').filter({ hasText: /location/i }).click();
    await page.getByRole('option', { name: /the hill/i }).click();
    
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    const filteredCount = await page.locator(listingCards).count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('BROWSE_04: filters by category', async ({ page }) => {
    await waitForListingsToLoad(page);
    const initialCount = await page.locator(listingCards).count();
    
    await page.getByRole('combobox').filter({ hasText: /categor/i }).click();
    await page.getByRole('option', { name: /electronics/i }).click();
    
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    const filteredCount = await page.locator(listingCards).count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('BROWSE_06: combines multiple filters', async ({ page }) => {
    await waitForListingsToLoad(page);
    const initialCount = await page.locator(listingCards).count();
    
    await page.getByRole('combobox').filter({ hasText: /condition/i }).click();
    await page.getByRole('option', { name: /good/i }).click();
    await page.waitForTimeout(300);
    
    await page.getByRole('combobox').filter({ hasText: /location/i }).click();
    await page.getByRole('option', { name: /the hill/i }).click();
    await page.waitForTimeout(300);
    
    await page.getByRole('combobox').filter({ hasText: /categor/i }).click();
    await page.getByRole('option', { name: /textbooks/i }).click();
    
    await page.waitForLoadState('networkidle');
    
    const filteredCount = await page.locator(listingCards).count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('resets filter when selecting "All" option', async ({ page }) => {
    await waitForListingsToLoad(page);
    const initialCount = await page.locator(listingCards).count();
    
    await page.getByRole('combobox').filter({ hasText: /condition/i }).click();
    await page.getByRole('option', { name: /new$/i }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('combobox').filter({ hasText: /condition/i }).click();
    await page.getByRole('option', { name: /^conditions$/i }).click();
    await page.waitForLoadState('networkidle');
    
    const countAfterReset = await page.locator(listingCards).count();
    expect(countAfterReset).toBe(initialCount);
  });
});
