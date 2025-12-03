// edit listing tests
import { test, expect, Page } from '@playwright/test';
import { createListing, openMyListingActions, deleteListingViaAPI } from '../fixtures/listings';
import { generateTestListingTitle } from '../fixtures/test-data';
import path from 'path';

test.describe('Listings - Edit', () => {
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  let createdListingId: string | null = null;

  // cleanup test listings after each test
  test.afterEach(async ({ page }) => {
    if (createdListingId) {
      try {
        await deleteListingViaAPI(page, createdListingId);
      } catch (e) {}
      createdListingId = null;
    }
  });

  test('EDIT_01: happy path - update title, price, description', async ({ page }) => {
    await page.goto('/listings');
    const originalTitle = generateTestListingTitle();
    const newTitle = `${originalTitle} (Edited)`;
    
    createdListingId = await createListing(page, {
      title: originalTitle,
      price: '100',
      condition: 'good',
      category: 'electronics',
      location: 'on_campus',
      description: 'Original description'
    });
    expect(createdListingId).toBeTruthy();

    await page.goto('/listings/me');
    await expect(page.getByText(originalTitle)).toBeVisible();

    await openMyListingActions(page, originalTitle);
    await page.getByRole('menuitem', { name: /edit listing/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.locator('input[name="title"]').fill(newTitle);
    await page.locator('input[name="price"]').fill('150');
    await page.locator('textarea[name="description"]').fill('Updated description');
    
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15000 });

    // reload to verify changes persisted
    await page.reload();
    await expect(page.getByText(newTitle)).toBeVisible();
    await expect(page.getByText('$150')).toBeVisible();
  });

  test('EDIT_02: form validation - requires title and price', async ({ page }) => {
    await page.goto('/listings');
    const title = generateTestListingTitle();
    createdListingId = await createListing(page, {
      title,
      price: '50',
      condition: 'like_new',
      category: 'textbooks',
      location: 'hill'
    });

    await page.goto('/listings/me');
    await openMyListingActions(page, title);
    await page.getByRole('menuitem', { name: /edit listing/i }).click();

    const titleInput = page.locator('input[name="title"]');
    await titleInput.fill('');
    await page.getByRole('button', { name: /save changes/i }).click();

    // check browser validation triggered
    const isInvalid = await titleInput.evaluate((el: HTMLInputElement) => {
      el.reportValidity();
      return !el.validity.valid;
    });
    expect(isInvalid).toBe(true);
    
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('EDIT_03: media management - remove existing and upload new', async ({ page }) => {
    await page.goto('/listings');
    const title = generateTestListingTitle();
    createdListingId = await createListing(page, {
      title,
      price: '20',
      condition: 'fair',
      category: 'other',
      location: 'off_campus',
      uploadImages: true
    });

    await page.goto('/listings/me');
    await openMyListingActions(page, title);
    await page.getByRole('menuitem', { name: /edit listing/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    
    // wait for existing media to load then delete it
    const deleteBtn = page.locator('ul.space-y-2 li button').first();
    await expect(deleteBtn).toBeVisible({ timeout: 10000 });
    await deleteBtn.click();
    await expect(page.locator('ul.space-y-2 li')).toHaveCount(0);

    // upload new image
    const testImagePath = path.join(process.cwd(), 'public', 'BruinLogo.svg');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    await expect(page.getByText('BruinLogo.svg')).toBeVisible();

    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('EDIT_04: cancel discards changes', async ({ page }) => {
    await page.goto('/listings');
    const title = generateTestListingTitle();
    createdListingId = await createListing(page, {
      title,
      price: '10',
      condition: 'new',
      category: 'clothing',
      location: 'univ_apps'
    });

    await page.goto('/listings/me');
    await openMyListingActions(page, title);
    await page.getByRole('menuitem', { name: /edit listing/i }).click();

    await page.locator('input[name="title"]').fill('Should Not Save');
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // reopen and verify changes were discarded
    await openMyListingActions(page, title);
    await page.getByRole('menuitem', { name: /edit listing/i }).click();
    await expect(page.locator('input[name="title"]')).toHaveValue(title);
  });

});
