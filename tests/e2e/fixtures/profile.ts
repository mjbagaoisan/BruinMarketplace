// profile page helpers
import { Page, expect } from '@playwright/test';

export async function goToProfileSettings(page: Page): Promise<void> {
  await page.goto('/profile/settings');
  await page.waitForLoadState('networkidle');
}

export async function waitForProfileLoad(page: Page): Promise<void> {
  await expect(page.getByText('Loading Profile Information...')).not.toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('heading', { name: /profile settings/i })).toBeVisible();
}

export async function clickSaveChanges(page: Page): Promise<void> {
  await page.getByRole('button', { name: /save changes/i }).click();
}

export async function waitForSaveComplete(page: Page): Promise<void> {
  await expect(page.getByRole('button', { name: /saving/i })).toBeVisible({ timeout: 5000 }).catch(() => {});
  await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible({ timeout: 10000 });
}
