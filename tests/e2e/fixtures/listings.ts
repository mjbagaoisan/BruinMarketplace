import { Page, expect } from '@playwright/test';
import { TEST_ENV, TEST_LISTING } from '../../setup/test-env';
import path from 'path';

/**
 * Listing helper functions for E2E tests
 */

export interface CreateListingOptions {
  title: string;
  price: string;
  description?: string;
  condition: string;
  category: string;
  location: string;
  preferred_payment?: string;
  uploadImages?: boolean;
}

/**
 * Create a listing through the UI
 */
export async function createListing(
  page: Page, 
  options: CreateListingOptions
): Promise<string | null> {
  // Click "Sell Item" button in header
  await page.getByRole('button', { name: /sell item/i }).click();
  
  // Wait for dialog to open
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText(/create a listing/i)).toBeVisible();
  
  // Fill in the form
  await page.getByLabel(/title/i).fill(options.title);
  await page.getByLabel(/price/i).fill(options.price);
  
  if (options.description) {
    await page.getByLabel(/description/i).fill(options.description);
  }
  
  // Select dropdowns
  await page.getByRole('combobox', { name: /preferred payment/i }).click();
  await page.getByRole('option', { name: new RegExp(options.preferred_payment || 'venmo', 'i') }).click();
  
  await page.getByRole('combobox', { name: /category/i }).click();
  await page.getByRole('option', { name: new RegExp(options.category, 'i') }).click();
  
  await page.getByRole('combobox', { name: /condition/i }).click();
  await page.getByRole('option', { name: new RegExp(options.condition, 'i') }).click();
  
  await page.getByRole('combobox', { name: /location/i }).click();
  await page.getByRole('option', { name: new RegExp(options.location, 'i') }).click();
  
  // Upload images if requested
  if (options.uploadImages) {
    await uploadTestImage(page);
  }
  
  // Submit the form
  await page.getByRole('button', { name: /^post$/i }).click();
  
  // Wait for dialog to close
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });
  
  // Wait a bit for the listing to be created
  await page.waitForTimeout(1000);
  
  // Try to find the newly created listing on the page
  const listingCard = page.locator(`text=${options.title}`).first();
  if (await listingCard.isVisible()) {
    // Extract listing ID from the link
    const link = await listingCard.locator('..').locator('..').getAttribute('href');
    if (link) {
      const id = link.split('/').pop();
      return id || null;
    }
  }
  
  return null;
}

/**
 * Upload a test image to the listing form
 */
export async function uploadTestImage(page: Page): Promise<void> {
  // Create a test image file path
  const testImagePath = path.join(process.cwd(), 'public', 'BruinLogo.svg');
  
  // Find the file input (it's hidden in the dropzone)
  const fileInput = page.locator('input[type="file"]');
  
  // Upload the file
  await fileInput.setInputFiles(testImagePath);
  
  // Wait for preview to appear
  await page.waitForTimeout(500);
}

/**
 * Delete a listing by ID through the API
 * This is a cleanup helper, not testing the delete UI
 */
export async function deleteListingViaAPI(
  page: Page,
  listingId: string
): Promise<void> {
  const response = await page.request.delete(
    `${TEST_ENV.API_URL}/api/listings/${listingId}`,
    {
      headers: {
        'Cookie': await getCookieHeader(page),
      },
    }
  );
  
  expect(response.status()).toBe(204);
}

/**
 * Get all cookies as a header string
 */
async function getCookieHeader(page: Page): Promise<string> {
  const cookies = await page.context().cookies();
  return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}

/**
 * Navigate to listings page
 */
export async function goToListings(page: Page): Promise<void> {
  await page.goto('/listings');
  await expect(page).toHaveURL('/listings');
}

/**
 * Search for a listing
 */
export async function searchListings(page: Page, query: string): Promise<void> {
  // Find the search input
  const searchInput = page.getByPlaceholder(/search/i);
  await searchInput.fill(query);
  
  // Wait for debounced search to complete
  await page.waitForTimeout(1000);
}

/**
 * Apply a filter
 */
export async function applyFilter(
  page: Page,
  filterType: 'condition' | 'location' | 'category',
  value: string
): Promise<void> {
  // Find the filter dropdown by its label
  const filterMap = {
    condition: /condition/i,
    location: /location/i,
    category: /categor/i,
  };
  
  const trigger = page.getByRole('combobox').filter({ hasText: filterMap[filterType] });
  await trigger.click();
  
  // Select the option
  await page.getByRole('option', { name: new RegExp(value, 'i') }).click();
  
  // Wait for filter to apply
  await page.waitForTimeout(500);
}

/**
 * Clear all filters
 */
export async function clearFilters(page: Page): Promise<void> {
  // Click each filter and select "All"
  const filters = ['condition', 'location', 'category'];
  
  for (const filter of filters) {
    const trigger = page.getByRole('combobox').filter({ 
      hasText: new RegExp(filter, 'i') 
    });
    
    if (await trigger.isVisible()) {
      await trigger.click();
      await page.getByRole('option', { name: /all|conditions|locations|categories/i }).first().click();
      await page.waitForTimeout(300);
    }
  }
}

/**
 * Get listing count on the page
 */
export async function getListingCount(page: Page): Promise<number> {
  const listings = page.locator('a[href^="/listings/"]');
  return await listings.count();
}

/**
 * Click on a listing by title
 */
export async function clickListing(page: Page, title: string): Promise<void> {
  await page.getByText(title).click();
  await page.waitForURL(/\/listings\/[^/]+$/);
}

/**
 * Verify listing appears in the grid
 */
export async function verifyListingExists(page: Page, title: string): Promise<boolean> {
  const listing = page.getByText(title);
  return await listing.isVisible();
}

/**
 * Clean up all test listings (listings with [TEST] prefix)
 * This should be called in afterAll hooks
 */
export async function cleanupTestListings(page: Page): Promise<void> {
  // Navigate to listings page
  await goToListings(page);
  
  // Search for test listings
  await searchListings(page, '[TEST]');
  
  // Get all test listing links
  const testListings = page.locator('a[href^="/listings/"]').filter({ 
    hasText: /\[TEST\]/ 
  });
  
  const count = await testListings.count();
  
  // Delete each test listing via API
  for (let i = 0; i < count; i++) {
    const href = await testListings.nth(i).getAttribute('href');
    if (href) {
      const id = href.split('/').pop();
      if (id) {
        try {
          await deleteListingViaAPI(page, id);
        } catch (error) {
          console.log(`Failed to delete test listing ${id}:`, error);
        }
      }
    }
  }
}
