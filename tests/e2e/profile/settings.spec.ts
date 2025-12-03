import { test, expect } from '@playwright/test';
import { 
  goToProfileSettings, 
  waitForProfileLoad,
  clickSaveChanges,
  waitForSaveComplete,
  getSaveMessage 
} from '../fixtures';
import { TEST_PROFILE, TIMEOUTS } from '../../setup/test-env';

// profile settings tests

test.describe('Profile Settings - Page Load & UI', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });


  test('PROFILE_01: name field is disabled and shows user name', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const nameInput = page.locator('input[disabled]').first();
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toBeDisabled();
    const nameValue = await nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);
  });

});

test.describe('Profile Settings - Major Field', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test('PROFILE_02: can enter and clear major field', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const majorInput = page.locator('input:not([disabled]):not([type="number"]):not([type="file"]):not([type="checkbox"])').first();
    await majorInput.clear();
    await majorInput.fill(TEST_PROFILE.major);
    await expect(majorInput).toHaveValue(TEST_PROFILE.major);
    await majorInput.clear();
    await expect(majorInput).toHaveValue('');
  });

});

test.describe('Profile Settings - Class Year Field', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test('PROFILE_03: can enter valid class year', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const classYearInput = page.locator('input[type="number"]');
    await classYearInput.clear();
    await classYearInput.fill(TEST_PROFILE.classYear);
    await expect(classYearInput).toHaveValue(TEST_PROFILE.classYear);
  });

});

test.describe('Profile Settings - Visibility Toggles', () => {
  
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test('PROFILE_04: can toggle major visibility', async ({ page }) => {
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

  test('PROFILE_05: can toggle class year visibility', async ({ page }) => {
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

  test('PROFILE_06: changes persist after page reload', async ({ page }) => {
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

  test('PROFILE_07: avatar upload input accepts image files', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const fileInput = page.locator('input[type="file"]');
    const acceptAttr = await fileInput.getAttribute('accept');
    expect(acceptAttr).toBe('image/*');
  });

  test('PROFILE_08: avatar preview container is visible', async ({ page }) => {
    await goToProfileSettings(page);
    await waitForProfileLoad(page);
    
    const avatarContainer = page.locator('label.rounded-full');
    await expect(avatarContainer).toBeVisible();
    const avatarImg = avatarContainer.locator('img');
    await expect(avatarImg).toBeVisible();
  });
});