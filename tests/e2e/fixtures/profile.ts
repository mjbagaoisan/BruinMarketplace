import { Page, expect } from '@playwright/test';

// Profile page test helpers for Playwright end-to-end testing

export async function goToProfileSettings(page: Page): Promise<void> {
  await page.goto('/profile/settings');
  await page.waitForLoadState('networkidle');
}

export async function waitForProfileLoad(page: Page): Promise<void> {
  await expect(page.getByText('Loading Profile Information...')).not.toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('heading', { name: /profile settings/i })).toBeVisible();
}

export async function fillMajor(page: Page, major: string): Promise<void> {
  const majorField = page.getByRole('textbox').nth(1);
  await majorField.clear();
  await majorField.fill(major);
}

export async function fillClassYear(page: Page, year: string): Promise<void> {
  const classYearField = page.locator('input[type="number"]');
  await classYearField.clear();
  await classYearField.fill(year);
}

export async function toggleMajorVisibility(page: Page): Promise<void> {
  const checkbox = page.locator('input[type="checkbox"]').first();
  await checkbox.click();
}

export async function toggleClassYearVisibility(page: Page): Promise<void> {
  const checkbox = page.locator('input[type="checkbox"]').nth(1);
  await checkbox.click();
}

export async function clickSaveChanges(page: Page): Promise<void> {
  await page.getByRole('button', { name: /save changes/i }).click();
}

export async function waitForSaveComplete(page: Page): Promise<void> {
  await expect(page.getByRole('button', { name: /saving/i })).toBeVisible({ timeout: 5000 }).catch(() => {});
  await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible({ timeout: 10000 });
}

export async function uploadAvatar(page: Page, filePath: string): Promise<void> {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);
}

export async function getMajorValue(page: Page): Promise<string> {
  const majorField = page.getByRole('textbox').nth(1);
  return await majorField.inputValue();
}

export async function getClassYearValue(page: Page): Promise<string> {
  const classYearField = page.locator('input[type="number"]');
  return await classYearField.inputValue();
}

export async function isMajorVisible(page: Page): Promise<boolean> {
  const checkbox = page.locator('input[type="checkbox"]').first();
  return await checkbox.isChecked();
}

export async function isClassYearVisible(page: Page): Promise<boolean> {
  const checkbox = page.locator('input[type="checkbox"]').nth(1);
  return await checkbox.isChecked();
}

export async function getSaveMessage(page: Page): Promise<string | null> {
  const message = page.locator('p.text-red-600');
  if (await message.isVisible()) {
    return await message.textContent();
  }
  return null;
}
