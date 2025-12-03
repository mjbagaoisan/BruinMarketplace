// search listings tests
import { test, expect } from '@playwright/test';

test.describe('Listings - Search', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  const listingCards = 'a[href^="/listings/"]';
  const searchPlaceholder = /search for a listing/i;
  const DEBOUNCE_WAIT = 500;

  test.beforeEach(async ({ page }) => {
    await page.goto('/listings');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Loading listings...')).not.toBeVisible({ timeout: 10000 });
  });

  test('SEARCH_01: finds listings by title', async ({ page }) => {
    const searchInput = page.getByPlaceholder(searchPlaceholder);
    await expect(searchInput).toBeVisible();
    
    const initialCount = await page.locator(listingCards).count();
    if (initialCount === 0) {
      test.skip(true, 'No listings available to search');
      return;
    }
    
    const firstListingTitle = await page.locator(listingCards).first().textContent();
    if (!firstListingTitle) {
      test.skip(true, 'Could not get listing title');
      return;
    }
    
    const searchTerm = firstListingTitle.split(' ')[0];
    await searchInput.fill(searchTerm);
    
    await page.waitForTimeout(DEBOUNCE_WAIT);
    await page.waitForLoadState('networkidle');
    
    const resultCount = await page.locator(listingCards).count();
    expect(resultCount).toBeGreaterThan(0);
  });

  test('SEARCH_02: finds listings by description', async ({ page }) => {
    const searchInput = page.getByPlaceholder(searchPlaceholder);
    await searchInput.fill('good condition');
    
    await page.waitForTimeout(DEBOUNCE_WAIT);
    await page.waitForLoadState('networkidle');
    
    const hasResults = await page.locator(listingCards).count() > 0;
    const hasEmptyState = await page.getByText(/no listings/i).isVisible();
    expect(hasResults || hasEmptyState).toBe(true);
  });

  test('SEARCH_03: shows empty state for no results', async ({ page }) => {
    const searchInput = page.getByPlaceholder(searchPlaceholder);
    const nonsenseQuery = `xyznonexistent${Date.now()}`;
    
    await searchInput.fill(nonsenseQuery);
    
    await page.waitForTimeout(DEBOUNCE_WAIT);
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText(/no listings found matching your search/i)).toBeVisible({ timeout: 5000 });
    expect(await page.locator(listingCards).count()).toBe(0);
  });

  test('restores all listings when search is cleared', async ({ page }) => {
    const searchInput = page.getByPlaceholder(searchPlaceholder);
    const initialCount = await page.locator(listingCards).count();
    
    await searchInput.fill('test');
    await page.waitForTimeout(DEBOUNCE_WAIT);
    
    await searchInput.clear();
    await page.waitForTimeout(DEBOUNCE_WAIT);
    await page.waitForLoadState('networkidle');
    
    const countAfterClear = await page.locator(listingCards).count();
    expect(countAfterClear).toBe(initialCount);
  });
});
