import { test, expect } from '@playwright/test';
import { generateTestListingTitle } from '../fixtures/test-data';

// API-level delete tests since there's no delete button in the UI yet
test.describe('Listings - Delete (API)', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  async function getAuthCookieHeader(page: any) {
    const cookies = await page.context().cookies();
    return cookies.map((c: any) => `${c.name}=${c.value}`).join('; ');
  }

  async function createTestListing(page: any, title: string) {
    await page.goto('/listings');
    await page.waitForLoadState('networkidle');
    
    await page.locator('button').filter({ has: page.locator('svg') }).last().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.getByLabel(/title/i).fill(title);
    await page.locator('input[name="price"]').fill('10');
    
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: /cash/i }).click();
    
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: /other/i }).click();
    
    await page.getByRole('combobox').nth(2).click();
    await page.getByRole('option', { name: /fair/i }).click();
    
    await page.getByRole('combobox').nth(3).click();
    await page.getByRole('option', { name: /off-campus/i }).click();
    
    await page.getByRole('button', { name: /^post$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15000 });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
  }

  test('DELETE_01: deletes own listing', async ({ page, request }) => {
    const uniqueTitle = generateTestListingTitle();
    await createTestListing(page, uniqueTitle);
    
    const listingLink = page.locator(`a[href^="/listings/"]`).filter({ hasText: uniqueTitle });
    await expect(listingLink).toBeVisible({ timeout: 10000 });
    
    const href = await listingLink.getAttribute('href');
    const listingId = href?.split('/').pop();
    expect(listingId).toBeTruthy();
    
    const cookieHeader = await getAuthCookieHeader(page);
    const deleteResponse = await request.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${listingId}`,
      { headers: { 'Cookie': cookieHeader } }
    );
    expect(deleteResponse.status()).toBe(204);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(uniqueTitle)).not.toBeVisible({ timeout: 5000 });
  });

  test('DELETE_02: returns 403 when deleting another user\'s listing', async ({ page, request }) => {
    await page.goto('/listings');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Loading listings...')).not.toBeVisible({ timeout: 10000 });
    
    const cookieHeader = await getAuthCookieHeader(page);
    
    const listingsResponse = await request.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/listings`,
      { headers: { 'Cookie': cookieHeader } }
    );
    const listings = await listingsResponse.json();
    
    if (!Array.isArray(listings) || listings.length === 0) {
      test.skip(true, 'No listings available to test');
      return;
    }
    
    const meResponse = await request.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
      { headers: { 'Cookie': cookieHeader } }
    );
    const currentUserId = (await meResponse.json()).user?.id;
    
    const otherUserListing = listings.find((l: any) => l.user_id !== currentUserId);
    if (!otherUserListing) {
      test.skip(true, 'All listings belong to current user');
      return;
    }
    
    const deleteResponse = await request.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${otherUserListing.id}`,
      { headers: { 'Cookie': cookieHeader } }
    );
    
    expect(deleteResponse.status()).toBe(403);
    const errorData = await deleteResponse.json();
    expect(errorData.error).toMatch(/do not own|not allowed/i);
  });

  test('returns 404 for non-existent listing', async ({ page, request }) => {
    await page.goto('/listings');
    const cookieHeader = await getAuthCookieHeader(page);
    
    const deleteResponse = await request.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/listings/non-existent-id-12345`,
      { headers: { 'Cookie': cookieHeader } }
    );
    
    expect(deleteResponse.status()).toBe(404);
  });

  test('returns 401 without authentication', async ({ request }) => {
    const deleteResponse = await request.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/listings/any-id`
    );
    expect(deleteResponse.status()).toBe(401);
  });
});
