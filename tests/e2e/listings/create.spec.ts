import { test, expect } from '@playwright/test';
import { generateTestListingTitle } from '../fixtures/test-data';

test.describe('Listings - Create', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  async function openCreateDialog(page: any) {
    await page.locator('button').filter({ has: page.locator('svg') }).last().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  }

  async function fillRequiredFields(page: any, title: string, price: string) {
    await page.getByLabel(/title/i).fill(title);
    await page.locator('input[name="price"]').fill(price);
    
    await page.getByRole('combobox').filter({ hasText: '' }).first().click();
    await page.getByRole('option', { name: /venmo/i }).click();
    
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: /textbooks/i }).click();
    
    await page.getByRole('combobox').nth(2).click();
    await page.getByRole('option', { name: /good/i }).click();
    
    await page.getByRole('combobox').nth(3).click();
    await page.getByRole('option', { name: /the hill/i }).click();
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/listings');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Loading listings...')).not.toBeVisible({ timeout: 10000 });
  });

  test('CREATE_01: creates listing with required fields', async ({ page }) => {
    const uniqueTitle = generateTestListingTitle();
    
    await openCreateDialog(page);
    await expect(page.getByText(/create a listing/i)).toBeVisible();
    
    await fillRequiredFields(page, uniqueTitle, '25');
    await page.getByLabel(/description/i).fill('Test listing created by E2E test');
    
    await page.getByRole('button', { name: /^post$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15000 });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 10000 });
  });

  test('CREATE_02: creates listing with image upload', async ({ page }) => {
    const uniqueTitle = generateTestListingTitle();
    
    await openCreateDialog(page);
    
    await page.getByLabel(/title/i).fill(uniqueTitle);
    await page.locator('input[name="price"]').fill('50');
    
    await page.locator('input[type="file"]').setInputFiles('public/BruinLogo.svg');
    await page.waitForTimeout(500);
    await expect(page.getByText(/bruinlogo/i)).toBeVisible();
    
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: /cash/i }).click();
    
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: /electronics/i }).click();
    
    await page.getByRole('combobox').nth(2).click();
    await page.getByRole('option', { name: /like-new/i }).click();
    
    await page.getByRole('combobox').nth(3).click();
    await page.getByRole('option', { name: /on-campus/i }).click();
    
    await page.getByRole('button', { name: /^post$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 20000 });
  });

  test('CREATE_03: blocks submission without title', async ({ page }) => {
    await openCreateDialog(page);
    
    await fillRequiredFields(page, '', '25');
    await page.getByRole('button', { name: /^post$/i }).click();
    
    const titleInput = page.getByLabel(/title/i);
    const failsValidation = await titleInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(failsValidation).toBe(true);
    
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('CREATE_04: rejects negative price', async ({ page }) => {
    const uniqueTitle = generateTestListingTitle();
    
    await openCreateDialog(page);
    await fillRequiredFields(page, uniqueTitle, '-10');
    await page.getByRole('button', { name: /^post$/i }).click();
    
    await expect(page.getByText(/price must be.*greater than 0/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('closes dialog on cancel', async ({ page }) => {
    await openCreateDialog(page);
    await page.getByLabel(/title/i).fill('Test Title');
    await page.getByRole('button', { name: /cancel/i }).click();
    
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('removes uploaded file when clicking X', async ({ page }) => {
    await openCreateDialog(page);
    
    await page.locator('input[type="file"]').setInputFiles('public/BruinLogo.svg');
    await page.waitForTimeout(500);
    await expect(page.getByText(/bruinlogo/i)).toBeVisible();
    
    await page.locator('button').filter({ has: page.locator('svg.lucide-x') }).click();
    await expect(page.getByText(/bruinlogo/i)).not.toBeVisible();
  });
});
