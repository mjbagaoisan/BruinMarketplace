// listing helpers for e2e tests
import { Page, expect } from '@playwright/test';
import { TEST_ENV } from '../../setup/test-env';
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

// exact match regex - escapes special chars
function regexFromLabel(label: string): RegExp {
  return new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
}

async function clickOption(page: Page, label: string): Promise<void> {
  await page.getByRole('option', { name: regexFromLabel(label) }).click();
}

// convert api values to ui labels (like_new -> Like-new)
function getPreferredPaymentLabel(value?: string): string {
  const normalized = (value || 'venmo').toLowerCase();
  const labels: Record<string, string> = {
    zelle: 'Zelle',
    cash: 'Cash',
    venmo: 'Venmo',
    other: 'Other',
  };
  return labels[normalized] ?? normalized;
}

function getCategoryLabel(value: string): string {
  const labels: Record<string, string> = {
    textbooks: 'Textbooks',
    electronics: 'Electronics',
    furniture: 'Furniture',
    parking: 'Parking',
    clothing: 'Clothing',
    tickets: 'Tickets',
    other: 'Other',
  };
  return labels[value] ?? value;
}

function getConditionLabel(value: string): string {
  const labels: Record<string, string> = {
    new: 'New',
    like_new: 'Like-new',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
  };
  return labels[value] ?? value;
}

function getLocationLabel(value: string): string {
  const labels: Record<string, string> = {
    hill: 'The Hill',
    univ_apps: 'University Apartments',
    on_campus: 'On-Campus',
    off_campus: 'Off-Campus',
  };
  return labels[value] ?? value;
}

// create listing through ui, returns listing id
export async function createListing(
  page: Page, 
  options: CreateListingOptions
): Promise<string | null> {
  const createButton = page.locator('div.fixed button:has(svg.lucide-plus)');
  await expect(createButton).toBeVisible({ timeout: 15000 });
  await createButton.click();
  
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText(/create a listing/i)).toBeVisible();
  
  await page.locator('input[name="title"]').fill(options.title);
  await page.locator('input[name="price"]').fill(options.price);
  
  if (options.description) {
    await page.locator('textarea[name="description"]').fill(options.description);
  }
  
  // select dropdowns by position in form
  const dialog = page.getByRole('dialog');
  const comboboxes = dialog.getByRole('combobox');
  
  await comboboxes.nth(0).click(); // preferred payment
  await clickOption(page, getPreferredPaymentLabel(options.preferred_payment));
  
  await comboboxes.nth(1).click(); // category
  await clickOption(page, getCategoryLabel(options.category));
  
  await comboboxes.nth(2).click(); // condition
  await clickOption(page, getConditionLabel(options.condition));
  
  await comboboxes.nth(3).click(); // location
  await clickOption(page, getLocationLabel(options.location));
  
  if (options.uploadImages) {
    await uploadTestImage(page);
  }
  
  // get listing id from api response
  const responsePromise = page.waitForResponse(
    (resp) => resp.url().includes('/api/listings') && resp.request().method() === 'POST'
  );
  
  await page.getByRole('button', { name: /^post$/i }).click();
  
  const response = await responsePromise;
  
  if (!response.ok()) {
    const errorBody = await response.text().catch(() => 'Unable to read response');
    console.error(`createListing API error: ${response.status()} - ${errorBody}`);
    return null;
  }
  
  const data = await response.json();
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });
  return data.id || null;
}

export async function uploadTestImage(page: Page): Promise<void> {
  const testImagePath = path.join(process.cwd(), 'public', '39717e342e8eadd12055eb24442c0e22.jpg'); // replace with any image
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testImagePath);
  await expect(page.getByText('39717e342e8eadd12055eb24442c0e22.jpg')).toBeVisible({ timeout: 5000 }); // replace with any image
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

// open the actions menu (edit, mark sold) for a listing
export async function openMyListingActions(page: Page, title: string): Promise<void> {
  // close any open menus first
  const openMenu = page.getByRole('menu');
  if (await openMenu.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape');
    await expect(openMenu).not.toBeVisible({ timeout: 2000 });
  }
  
  await expect(page.locator('[data-slot="card"]').first()).toBeVisible({ timeout: 15000 });
  
  const cardWithTitle = page.locator('[data-slot="card"]').filter({ hasText: title }).first();
  await expect(cardWithTitle).toBeVisible({ timeout: 10000 });
  
  const actionsButton = cardWithTitle.locator('button[aria-label="Listing actions"]');
  await expect(actionsButton).toBeVisible({ timeout: 5000 });
  await actionsButton.click({ force: true });
  
  await expect(page.getByRole('menu')).toBeVisible({ timeout: 5000 });
}


