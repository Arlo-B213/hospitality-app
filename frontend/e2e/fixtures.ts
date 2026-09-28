import { test as base, expect, Page } from '@playwright/test';

/**
 * Test fixtures for E2E tests
 * Provides authenticated page and other utilities
 */

export type TestFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
};

/**
 * Custom test with authentication fixtures
 */
export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login as regular user
    const email = process.env.TEST_USER_EMAIL || 'test.user@pride-training.test';
    const password = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

    await page.goto('/login');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button:has-text("Log In")').click();

    // Wait for dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Use the page in tests
    await use(page);

    // Cleanup: logout
    try {
      const logoutButton = page.locator('button:has-text("Logout")').first();
      if (await logoutButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await logoutButton.click();
      }
    } catch {
      // Logout might fail, that's ok
    }
  },

  adminPage: async ({ page }, use) => {
    // Login as admin
    const email = process.env.TEST_ADMIN_EMAIL || 'admin@pride-training.test';
    const password = process.env.TEST_ADMIN_PASSWORD || 'AdminPassword123!';

    await page.goto('/login');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button:has-text("Log In")').click();

    // Wait for dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Use the page in tests
    await use(page);

    // Cleanup
    try {
      const logoutButton = page.locator('button:has-text("Logout")').first();
      if (await logoutButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await logoutButton.click();
      }
    } catch {
      // Logout might fail
    }
  },
});

/**
 * Helper functions for common test operations
 */

export async function waitForElement(page: Page, selector: string, timeout = 5000) {
  await page.locator(selector).waitFor({ state: 'visible', timeout });
}

export async function fillForm(page: Page, fields: Record<string, string>) {
  for (const [selector, value] of Object.entries(fields)) {
    const input = page.locator(selector).first();
    if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
      await input.fill(value);
    }
  }
}

export async function selectOption(page: Page, selector: string, value: string) {
  const select = page.locator(selector).first();
  if (await select.isVisible()) {
    await select.selectOption(value);
  }
}

export async function clickButton(page: Page, text: string | RegExp) {
  const button = page.locator('button').filter({ hasText: text }).first();
  if (await button.isVisible()) {
    await button.click();
  }
}

export async function getErrorMessage(page: Page): Promise<string | null> {
  const errorElement = page.locator('[role="alert"], .error, .alert-error, text=/error/i').first();

  if (await errorElement.isVisible({ timeout: 2000 }).catch(() => false)) {
    return await errorElement.textContent();
  }

  return null;
}

export async function getSuccessMessage(page: Page): Promise<string | null> {
  const successElement = page.locator('[role="status"], .success, .alert-success, text=/success|saved/i').first();

  if (await successElement.isVisible({ timeout: 2000 }).catch(() => false)) {
    return await successElement.textContent();
  }

  return null;
}

/**
 * Test data generators
 */

export function generateTestUser() {
  const timestamp = Date.now();
  return {
    email: `test.user.${timestamp}@pride-training.test`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: `User${timestamp}`,
  };
}

export function generateNewHire() {
  const timestamp = Date.now();
  return {
    email: `newhire.${timestamp}@pride-training.test`,
    firstName: 'NewHire',
    lastName: `Test${timestamp}`,
    position: 'Software Engineer',
    department: 'Engineering',
  };
}

export function generateEvaluation() {
  return {
    technicalSkill: 4,
    problemSolving: 4,
    communication: 5,
    teamwork: 4,
    initiative: 3,
    decisionMaking: 4,
    leadership: 3,
    comments: 'This is a test evaluation comment',
  };
}
