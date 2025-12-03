// listing detail page tests
import { test, expect } from '@playwright/test';

test.describe('Listings - Detail Page', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  const listingCards = 'a[href^="/listings/"]';
  const detailPageUrl = /\/listings\/[^/]+$/;

  async function navigateToFirstListing(page: any) {
    await page.goto('/listings');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Loading listings...')).not.toBeVisible({ timeout: 10000 });
    
    const count = await page.locator(listingCards).count();
    if (count === 0) return false;
    
    await page.locator(listingCards).first().click();
    await page.waitForURL(detailPageUrl);
    await page.waitForLoadState('networkidle');
    return true;
  }

  test('DETAIL_01: displays all listing information', async ({ page }) => {
    const hasListings = await navigateToFirstListing(page);
    if (!hasListings) {
      test.skip(true, 'No listings available to view');
      return;
    }
    
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/\$\d+\.\d{2}/)).toBeVisible();
    await expect(page.getByText(/new|like new|good|fair|poor/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /description/i })).toBeVisible();
    await expect(page.getByText(/location/i).first()).toBeVisible();
    await expect(page.getByText(/seller information/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /back/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /interested/i })).toBeVisible();
  });

  test('DETAIL_02: shows 404 for non-existent listing', async ({ page }) => {
    await page.goto('/listings/non-existent-listing-id-12345');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText(/listing not found/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/could not load listing details/i)).toBeVisible();
    
    const backButton = page.getByRole('button', { name: /back to listings/i });
    await expect(backButton).toBeVisible();
    
    await backButton.click();
    await expect(page).toHaveURL('/listings');
  });

  test('navigates back to listings page', async ({ page }) => {
    const hasListings = await navigateToFirstListing(page);
    if (!hasListings) {
      test.skip(true, 'No listings available');
      return;
    }
    
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page).toHaveURL('/listings');
  });

  test('displays images when listing has media', async ({ page }) => {
    await page.goto('/listings');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Loading listings...')).not.toBeVisible({ timeout: 10000 });
    
    const listingsWithImages = page.locator(listingCards).filter({
      has: page.locator('img[src*="supabase"]')
    });
    
    if (await listingsWithImages.count() === 0) {
      test.skip(true, 'No listings with images available');
      return;
    }
    
    await listingsWithImages.first().click();
    await page.waitForURL(detailPageUrl);
    
    await expect(page.locator('img').first()).toBeVisible();
  });

  test('shows placeholder when listing has no media', async ({ page }) => {
    await page.goto('/listings');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Loading listings...')).not.toBeVisible({ timeout: 10000 });
    
    const listingsWithoutImages = page.locator(listingCards).filter({
      has: page.getByText(/no image/i)
    });
    
    if (await listingsWithoutImages.count() === 0) {
      test.skip(true, 'All listings have images');
      return;
    }
    
    await listingsWithoutImages.first().click();
    await page.waitForURL(detailPageUrl);
    
    await expect(page.getByText(/no images available/i)).toBeVisible();
  });
});
