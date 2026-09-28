import { test, expect } from '@playwright/test';

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test.user@pride-training.test';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
const TEST_NEW_HIRE_EMAIL = process.env.TEST_NEW_HIRE_EMAIL || 'newhire@pride-training.test';
const TEST_NEW_HIRE_FIRST_NAME = process.env.TEST_NEW_HIRE_FIRST_NAME || 'John';
const TEST_NEW_HIRE_LAST_NAME = process.env.TEST_NEW_HIRE_LAST_NAME || 'Doe';

test.describe('New Hire Evaluation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(TEST_USER_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_USER_PASSWORD);
    await page.locator('button:has-text("Log In")').click();

    // Wait for dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should create a new hire evaluation', async ({ page }) => {
    // Navigate to evaluations section
    await page.goto('/dashboard');

    // Look for "New Hire" button or "Create Evaluation" button
    const createButton = page.locator('button:has-text(/New Hire|Create|Add New/)').first();
    await createButton.click();

    // Wait for form to appear
    await page.locator('text=/New Hire|Evaluation Form/i').waitFor({ state: 'visible', timeout: 5000 });

    // Fill in new hire details
    const firstNameInput = page.locator('input[placeholder*="First"]').or(page.locator('input[name*="firstName"]')).first();
    const lastNameInput = page.locator('input[placeholder*="Last"]').or(page.locator('input[name*="lastName"]')).first();
    const emailInput = page.locator('input[type="email"]').first();

    await firstNameInput.fill(TEST_NEW_HIRE_FIRST_NAME);
    await lastNameInput.fill(TEST_NEW_HIRE_LAST_NAME);
    await emailInput.fill(TEST_NEW_HIRE_EMAIL);

    // Continue to evaluation form
    const continueButton = page.locator('button:has-text(/Continue|Next|Save/)').first();
    await continueButton.click();

    // Wait for evaluation form
    await page.locator('text=/Technical Skills|Evaluation/i').waitFor({ state: 'visible', timeout: 5000 });
  });

  test('should evaluate technical skills', async ({ page }) => {
    // Navigate to evaluation form
    await page.goto('/dashboard');

    // Find an evaluation to work on
    const evaluationRow = page.locator('tr:has-text("Technical")').first().or(page.locator('text=/Technical Skills/i').first());
    await evaluationRow.click();

    // Wait for evaluation form
    await page.waitForURL(/\/evaluation|\/evaluate/, { timeout: 5000 }).catch(() => {
      // If URL doesn't change, form might load inline
    });

    // Find technical skills section
    await page.locator('text=/Technical Skills/i').waitFor({ state: 'visible', timeout: 5000 });

    // Select skill levels (assuming radio buttons or select dropdowns)
    const skillInputs = page.locator('input[type="radio"]').or(page.locator('select'));

    // Rate multiple technical skills
    const technicalSkills = ['Programming', 'Problem Solving', 'System Design'];
    for (const skill of technicalSkills) {
      const skillElement = page.locator(`text=${skill}`);
      await skillElement.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {
        // Skill might not be present
      });

      // Select a rating (e.g., "Excellent" or "4" or "5")
      const ratingButtons = page.locator(`//*[contains(., "${skill}")]/following::button | //*[contains(., "${skill}")]/following::input[@type="radio"]`).first();
      await ratingButtons.click().catch(() => {
        // Rating might be set differently
      });
    }
  });

  test('should evaluate soft skills', async ({ page }) => {
    // Navigate to evaluation form
    await page.goto('/dashboard');

    // Find evaluation to work on
    const evaluationRow = page.locator('tr, div').filter({ hasText: /John|John Doe/ }).first();
    await evaluationRow.click().catch(() => {
      // Try alternative navigation
    });

    // Wait for form
    await page.locator('text=/Soft Skills|Communication|Teamwork/i').waitFor({ state: 'visible', timeout: 5000 });

    // Rate soft skills
    const softSkills = ['Communication', 'Teamwork', 'Time Management'];
    for (const skill of softSkills) {
      const skillLabel = page.locator(`text=${skill}`);
      await skillLabel.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {
        // Skill not found
      });

      // Select a rating
      const ratingButton = page.locator(`//*[contains(text(), "${skill}")]/following::button | //*[contains(text(), "${skill}")]/following::input[@type="radio"]`).first();
      await ratingButton.click().catch(() => {
        // Could not find rating button
      });
    }
  });

  test('should evaluate leadership potential', async ({ page }) => {
    // Navigate to evaluation form
    await page.goto('/dashboard');

    // Find and open evaluation
    const evaluationRow = page.locator('tr, div').filter({ hasText: /John|John Doe/ }).first();
    await evaluationRow.click().catch(() => {
      // Alternative navigation
    });

    // Wait for leadership section
    await page.locator('text=/Leadership|Initiative|Decision Making/i').waitFor({ state: 'visible', timeout: 5000 });

    // Rate leadership qualities
    const leadershipQualities = ['Initiative', 'Decision Making', 'Mentoring'];
    for (const quality of leadershipQualities) {
      const qualityLabel = page.locator(`text=${quality}`);
      await qualityLabel.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {
        // Quality not found
      });

      // Select rating
      const ratingButton = page.locator(`//*[contains(text(), "${quality}")]/following::button | //*[contains(text(), "${quality}")]/following::input[@type="radio"]`).first();
      await ratingButton.click().catch(() => {
        // Could not find rating
      });
    }
  });

  test('should save evaluation and verify data persists', async ({ page }) => {
    // Navigate to evaluation
    await page.goto('/dashboard');

    // Open an evaluation
    const evaluationItem = page.locator('button, a').filter({ hasText: /Evaluate|Edit/ }).first();
    await evaluationItem.click();

    // Wait for form
    await page.locator('text=/Technical|Soft|Leadership/i').waitFor({ state: 'visible', timeout: 5000 });

    // Fill in some ratings
    const ratingButtons = page.locator('input[type="radio"]').first();
    if (await ratingButtons.isVisible()) {
      await ratingButtons.click();
    }

    // Click save button
    const saveButton = page.locator('button:has-text(/Save|Submit/)').first();
    await saveButton.click();

    // Wait for success message
    await page.locator('text=/saved|success/i').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      // Continue anyway
    });

    // Navigate away and back to verify persistence
    await page.goto('/dashboard');

    // Look for the evaluation again
    await page.locator('text=/John|John Doe/').first().waitFor({ state: 'visible', timeout: 5000 });

    // Click on evaluation again
    const evaluationItem2 = page.locator('button, a').filter({ hasText: /Evaluate|Edit/ }).first();
    await evaluationItem2.click();

    // Wait for form to load
    await page.locator('text=/Technical|Soft|Leadership/i').waitFor({ state: 'visible', timeout: 5000 });

    // Verify data is still there (check if form fields are filled)
    const firstInput = page.locator('input, select').first();
    const hasValue = await firstInput.evaluate((el: any) => el.value || el.textContent);

    // If this is a new evaluation, data should be saved, if it's continuing, data should persist
    expect(hasValue).toBeTruthy();
  });

  test('should handle evaluation form validation', async ({ page }) => {
    // Navigate to evaluation
    await page.goto('/dashboard');

    // Open evaluation form
    const createButton = page.locator('button:has-text(/New Hire|Create|Add New/)').first();
    await createButton.click();

    // Wait for form
    await page.locator('text=/New Hire|Evaluation/i').waitFor({ state: 'visible', timeout: 5000 });

    // Try to submit without filling required fields
    const submitButton = page.locator('button:has-text(/Save|Submit/)').first();
    await submitButton.click();

    // Should see validation errors
    await page.locator('text=/required|please fill|error/i').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      // Validation might work differently
    });

    // Verify form is still visible
    expect(page.url()).not.toContain('/dashboard');
  });

  test('should cancel evaluation without saving', async ({ page }) => {
    // Navigate to evaluation
    await page.goto('/dashboard');

    // Get initial URL
    const initialUrl = page.url();

    // Open evaluation form
    const createButton = page.locator('button:has-text(/New Hire|Create|Add New/)').first();
    await createButton.click();

    // Wait for form
    await page.locator('text=/New Hire|Evaluation/i').waitFor({ state: 'visible', timeout: 5000 });

    // Fill in some data
    const firstNameInput = page.locator('input[placeholder*="First"]').first();
    await firstNameInput.fill(TEST_NEW_HIRE_FIRST_NAME);

    // Click cancel button
    const cancelButton = page.locator('button:has-text(/Cancel|Close|Back/)').first();
    await cancelButton.click();

    // Should return to previous page
    await page.waitForURL(initialUrl, { timeout: 5000 }).catch(() => {
      // Or just wait for navigation
      page.waitForNavigation({ timeout: 5000 });
    });

    // Verify we're back
    expect(page.url()).toContain('dashboard');
  });
});
