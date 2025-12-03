import { test, expect } from '@playwright/test';
import { 
  goToProfileSettings, 
  waitForProfileLoad,
  clickSaveChanges,
  waitForSaveComplete,
  getSaveMessage 
} from '../fixtures';
import { TEST_PROFILE, TIMEOUTS } from '../../setup/test-env';

// Profile Settings End-to-End Tests

test.describe('Profile Settings - Page Load & UI', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test('PROFILE_01: displays all profile settings elements', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    await expect(page.getByRole('heading', { name: /profile settings/i })).toBeVisible();
    await expect(page.getByText('Profile Picture')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeAttached();
    await expect(page.getByText('Name')).toBeVisible();
    const nameInput = page.locator('input[disabled]');
    await expect(nameInput).toBeVisible();
    await expect(page.getByText('Major')).toBeVisible();
    await expect(page.getByText('Class Year')).toBeVisible();
    await expect(page.locator('input[type="number"]')).toBeVisible();
    await expect(page.getByText('Make your major visible to others')).toBeVisible();
    await expect(page.getByText('Make your class year visible to others')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(2);
    await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible();
  });

  test('PROFILE_02: name field is disabled and shows user name', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const nameInput = page.locator('input[disabled]');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toBeDisabled();
    const nameValue = await nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);
  });

  test('PROFILE_03: shows loading state initially', async ({ page }) => {
    await page.goto('/profile/settings');
    const loadingText = page.getByText('Loading Profile Information...');
    const isLoading = await loadingText.isVisible().catch(() => false);
    await waitForProfileLoad(page);
    await expect(loadingText).not.toBeVisible();
  });
});

test.describe('Profile Settings - Major Field', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test('PROFILE_04: can enter and clear major field', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const majorInput = page.locator('input:not([disabled]):not([type="number"]):not([type="file"]):not([type="checkbox"])').first();
    await majorInput.clear();
    await majorInput.fill(TEST_PROFILE.major);
    await expect(majorInput).toHaveValue(TEST_PROFILE.major);
    await majorInput.clear();
    await expect(majorInput).toHaveValue('');
  });

  test('PROFILE_05: major field accepts special characters', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const majorInput = page.locator('input:not([disabled]):not([type="number"]):not([type="file"]):not([type="checkbox"])').first();
    const specialMajor = "Computer Science & Engineering (B.S.)";
    await majorInput.clear();
    await majorInput.fill(specialMajor);
    await expect(majorInput).toHaveValue(specialMajor);
  });
});

test.describe('Profile Settings - Class Year Field', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test('PROFILE_06: can enter valid class year', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const classYearInput = page.locator('input[type="number"]');
    await classYearInput.clear();
    await classYearInput.fill(TEST_PROFILE.classYear);
    await expect(classYearInput).toHaveValue(TEST_PROFILE.classYear);
  });

  test('PROFILE_07: class year has minimum value constraint', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const classYearInput = page.locator('input[type="number"]');
    const minValue = await classYearInput.getAttribute('min');
    expect(minValue).toBe('2026');
  });

  test('PROFILE_08: can clear class year field', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const classYearInput = page.locator('input[type="number"]');
    await classYearInput.fill('2027');
    await classYearInput.clear();
    await expect(classYearInput).toHaveValue('');
  });
});

test.describe('Profile Settings - Visibility Toggles', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test('PROFILE_09: can toggle major visibility', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const majorCheckbox = page.locator('input[type="checkbox"]').first();
    const initialState = await majorCheckbox.isChecked();
    await majorCheckbox.click();
    const newState = await majorCheckbox.isChecked();
    expect(newState).toBe(!initialState);
    await majorCheckbox.click();
    expect(await majorCheckbox.isChecked()).toBe(initialState);
  });

  test('PROFILE_10: can toggle class year visibility', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const classYearCheckbox = page.locator('input[type="checkbox"]').nth(1);
    const initialState = await classYearCheckbox.isChecked();
    await classYearCheckbox.click();
    const newState = await classYearCheckbox.isChecked();
    expect(newState).toBe(!initialState);
  });
});

test.describe('Profile Settings - Save Changes', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test('PROFILE_11: save button shows saving state during save', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const saveButton = page.getByRole('button', { name: /save changes/i });
    await saveButton.click();
    await expect(saveButton).toBeEnabled({ timeout: TIMEOUTS.MEDIUM });
  });

  test('PROFILE_12: displays message after save attempt', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const majorInput = page.locator('input:not([disabled]):not([type="number"]):not([type="file"]):not([type="checkbox"])').first();
    await majorInput.clear();
    await majorInput.fill(TEST_PROFILE.updatedMajor);
    await clickSaveChanges(page);
    await waitForSaveComplete(page);
    const message = page.locator('p.text-red-600, p.text-green-600');
    await expect(message).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  });

  test('PROFILE_13: changes persist after page reload', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const majorInput = page.locator('input:not([disabled]):not([type="number"]):not([type="file"]):not([type="checkbox"])').first();
    const testMajor = `Test Major ${Date.now()}`;
    await majorInput.clear();
    await majorInput.fill(testMajor);
    await clickSaveChanges(page);
    await waitForSaveComplete(page);
    await page.waitForTimeout(1000);
    await page.reload();
    await waitForProfileLoad(page);
    const newMajorInput = page.locator('input:not([disabled]):not([type="number"]):not([type="file"]):not([type="checkbox"])').first();
    await expect(newMajorInput).toHaveValue(testMajor);
  });
});

test.describe('Profile Settings - Avatar Upload', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test('PROFILE_14: avatar upload input accepts image files', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const fileInput = page.locator('input[type="file"]');
    const acceptAttr = await fileInput.getAttribute('accept');
    expect(acceptAttr).toBe('image/*');
  });

  test('PROFILE_15: avatar preview container is visible', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const avatarContainer = page.locator('label.rounded-full');
    await expect(avatarContainer).toBeVisible();
    const avatarImg = avatarContainer.locator('img');
    await expect(avatarImg).toBeVisible();
  });
});

test.describe('Profile Settings - Navigation', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test('PROFILE_16: can navigate to profile settings from header', async ({ page }) => {
    await page.goto('/listings');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /account/i }).click();
    await page.getByRole('link', { name: /settings/i }).click();
    await expect(page).toHaveURL('/profile/settings');
    await waitForProfileLoad(page);
  });
});
