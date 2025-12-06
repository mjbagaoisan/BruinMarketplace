/*
AI-Assisted Code (E2E Test Edge Cases)

Prompt: What filter combination scenarios should I test for a listings 
browse page with multiple filter dropdowns?

Additional Notes: I wrote the individual filter tests. AI suggested testing 
multiple filters at once and checking that selecting All actually resets 
the filter state.
*/
// browse and filter listings tests
import { test, expect, Page } from '@playwright/test';

test.describe('Listings - Browse', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  // Match only listing detail links (numeric IDs), not nav links like /listings/me
  const listingCards = 'a[href*="/listings/"]:not([href="/listings/me"])';
  const conditionSelect = (page: Page) => page.getByRole('combobox').nth(0);
  const locationSelect = (page: Page) => page.getByRole('combobox').nth(1);
  const categorySelect = (page: Page) => page.getByRole('combobox').nth(2);
  
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
    
    const listingCount = await page.locator(listingCards).count();
    if (listingCount === 0) {
      await expect(page.getByText(/no listings (available|found)/i)).toBeVisible({ timeout: 5000 });
      return;
    }
    
    await expect(page.locator(listingCards).first()).toBeVisible();
    await expect(page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible();
  });

  test('BROWSE_02: filters by condition', async ({ page }) => {
    await waitForListingsToLoad(page);
    const initialCount = await page.locator(listingCards).count();
    if (initialCount === 0) {
      test.skip(true, 'No listings to filter');
      return;
    }
    
    await conditionSelect(page).click();
    await page.getByRole('option', { name: /like new/i }).click();
    
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    const filteredCount = await page.locator(listingCards).count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('BROWSE_03: filters by location', async ({ page }) => {
    await waitForListingsToLoad(page);
    const initialCount = await page.locator(listingCards).count();
    if (initialCount === 0) {
      test.skip(true, 'No listings to filter');
      return;
    }
    
    await locationSelect(page).click();
    await page.getByRole('option', { name: /the hill/i }).click();
    
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    const filteredCount = await page.locator(listingCards).count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('BROWSE_04: filters by category', async ({ page }) => {
    await waitForListingsToLoad(page);
    const initialCount = await page.locator(listingCards).count();
    if (initialCount === 0) {
      test.skip(true, 'No listings to filter');
      return;
    }
    
    await categorySelect(page).click();
    await page.getByRole('option', { name: /electronics/i }).click();
    
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    const filteredCount = await page.locator(listingCards).count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('BROWSE_06: combines multiple filters', async ({ page }) => {
    await waitForListingsToLoad(page);
    const initialCount = await page.locator(listingCards).count();
    if (initialCount === 0) {
      test.skip(true, 'No listings to filter');
      return;
    }
    
    await conditionSelect(page).click();
    await page.getByRole('option', { name: /good/i }).click();
    await page.waitForTimeout(300);
    
    await locationSelect(page).click();
    await page.getByRole('option', { name: /the hill/i }).click();
    await page.waitForTimeout(300);
    
    await categorySelect(page).click();
    await page.getByRole('option', { name: /textbooks/i }).click();
    
    await page.waitForLoadState('networkidle');
    
    const filteredCount = await page.locator(listingCards).count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('resets filter when selecting "All" option', async ({ page }) => {
    await waitForListingsToLoad(page);
    const trigger = conditionSelect(page);
    
    await trigger.click();
    await page.getByRole('option', { name: /^new$/i }).click();
    await expect(trigger).toContainText(/new/i);
    
    await trigger.click();
    await page.getByRole('option', { name: /^conditions$/i }).click();
    await expect(trigger).toContainText(/conditions/i);
  });
});
