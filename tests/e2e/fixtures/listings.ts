import { Page, expect } from '@playwright/test';
import { TEST_ENV, TEST_LISTING } from '../../setup/test-env';
import path from 'path';

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

export async function createListing(
  page: Page, 
  options: CreateListingOptions
): Promise<string | null> {
  await page.getByRole('button', { name: /sell item/i }).click();
  
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText(/create a listing/i)).toBeVisible();
  
  await page.getByLabel(/title/i).fill(options.title);
  await page.getByLabel(/price/i).fill(options.price);
  
  if (options.description) {
    await page.getByLabel(/description/i).fill(options.description);
  }
  
  await page.getByRole('combobox', { name: /preferred payment/i }).click();
  await page.getByRole('option', { name: new RegExp(options.preferred_payment || 'venmo', 'i') }).click();
  
  await page.getByRole('combobox', { name: /category/i }).click();
  await page.getByRole('option', { name: new RegExp(options.category, 'i') }).click();
  
  await page.getByRole('combobox', { name: /condition/i }).click();
  await page.getByRole('option', { name: new RegExp(options.condition, 'i') }).click();
  
  await page.getByRole('combobox', { name: /location/i }).click();
  await page.getByRole('option', { name: new RegExp(options.location, 'i') }).click();
  
  if (options.uploadImages) {
    await uploadTestImage(page);
  }
  
  await page.getByRole('button', { name: /^post$/i }).click();
  
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });
  
  await page.waitForTimeout(1000);
  
  const listingCard = page.locator(`text=${options.title}`).first();
  if (await listingCard.isVisible()) {
    const link = await listingCard.locator('..').locator('..').getAttribute('href');
    if (link) {
      const id = link.split('/').pop();
      return id || null;
    }
  }
  
  return null;
}

export async function uploadTestImage(page: Page): Promise<void> {
  const testImagePath = path.join(process.cwd(), 'public', 'BruinLogo.svg');
  
  // File input is a technical element - CSS selector is appropriate here
  const fileInput = page.locator('input[type="file"]');
  
  await fileInput.setInputFiles(testImagePath);
  
  await page.waitForTimeout(500);
}

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

async function getCookieHeader(page: Page): Promise<string> {
  const cookies = await page.context().cookies();
  return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}

export async function goToListings(page: Page): Promise<void> {
  await page.goto('/listings');
  await expect(page).toHaveURL('/listings');
}

export async function searchListings(page: Page, query: string): Promise<void> {
  const searchInput = page.getByPlaceholder(/search/i);
  await searchInput.fill(query);
  
  await page.waitForTimeout(1000);
}

export async function applyFilter(
  page: Page,
  filterType: 'condition' | 'location' | 'category',
  value: string
): Promise<void> {
  const filterMap = {
    condition: /condition/i,
    location: /location/i,
    category: /categor/i,
  };
  
  const trigger = page.getByRole('combobox').filter({ hasText: filterMap[filterType] });
  await trigger.click();
  
  await page.getByRole('option', { name: new RegExp(value, 'i') }).click();
  
  await page.waitForTimeout(500);
}

export async function clearFilters(page: Page): Promise<void> {
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

export async function getListingCount(page: Page): Promise<number> {
  // Technical pattern for counting listing links - CSS selector is appropriate
  const listings = page.locator('a[href^="/listings/"]');
  return await listings.count();
}

export async function clickListing(page: Page, title: string): Promise<void> {
  await page.getByText(title).click();
  await page.waitForURL(/\/listings\/[^/]+$/);
}

export async function verifyListingExists(page: Page, title: string): Promise<boolean> {
  const listing = page.getByText(title);
  return await listing.isVisible();
}

export async function cleanupTestListings(page: Page): Promise<void> {
  // Technical pattern for finding test listings - CSS selector is appropriate
  await goToListings(page);
  
  await searchListings(page, '[TEST]');
  
  const testListings = page.locator('a[href^="/listings/"]').filter({ 
    hasText: /\[TEST\]/ 
  });
  
  const count = await testListings.count();
  
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
