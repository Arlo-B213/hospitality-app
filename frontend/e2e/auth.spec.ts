import { test, expect } from '@playwright/test';

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test.user@pride-training.test';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
const TEST_USER_FIRST_NAME = process.env.TEST_USER_FIRST_NAME || 'Test';
const TEST_USER_LAST_NAME = process.env.TEST_USER_LAST_NAME || 'User';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear browser storage before each test
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());
  });

  test('should register a new user', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');

    // Wait for registration form to be visible
    await page.locator('text=Sign Up').waitFor({ state: 'visible', timeout: 5000 });

    // Fill in registration form
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const firstNameInput = page.locator('input[placeholder*="First"]');
    const lastNameInput = page.locator('input[placeholder*="Last"]');

    await emailInput.fill(TEST_USER_EMAIL);
    await firstNameInput.fill(TEST_USER_FIRST_NAME);
    await lastNameInput.fill(TEST_USER_LAST_NAME);
    await passwordInput.fill(TEST_USER_PASSWORD);

    // Submit form
    const submitButton = page.locator('button:has-text("Sign Up")');
    await submitButton.click();

    // Verify redirect to login or dashboard
    await page.waitForURL(/\/(login|dashboard)/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/(login|dashboard)/);
  });

  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Wait for login form
    await page.locator('text=Log In').waitFor({ state: 'visible', timeout: 5000 });

    // Fill in login form
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await emailInput.fill(TEST_USER_EMAIL);
    await passwordInput.fill(TEST_USER_PASSWORD);

    // Submit form
    const submitButton = page.locator('button:has-text("Log In")');
    await submitButton.click();

    // Wait for navigation to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');

    // Verify JWT token is stored
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('should reject login with invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Wait for login form
    await page.locator('text=Log In').waitFor({ state: 'visible', timeout: 5000 });

    // Fill in login form with wrong password
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await emailInput.fill(TEST_USER_EMAIL);
    await passwordInput.fill('WrongPassword123!');

    // Submit form
    const submitButton = page.locator('button:has-text("Log In")');
    await submitButton.click();

    // Wait for error message
    await page.locator('text=/Invalid.*credentials|Login failed/i').waitFor({ state: 'visible', timeout: 5000 });

    // Verify still on login page
    expect(page.url()).toContain('/login');
  });

  test('should access protected route when logged in', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(TEST_USER_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_USER_PASSWORD);
    await page.locator('button:has-text("Log In")').click();

    // Wait for dashboard to load
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Verify we can access dashboard
    await page.goto('/dashboard');
    expect(page.url()).toContain('/dashboard');

    // Verify dashboard content loads
    await page.locator('text=/Dashboard|Evaluations/i').waitFor({ state: 'visible', timeout: 5000 });
  });

  test('should redirect to login when accessing protected route without token', async ({ page }) => {
    // Try to access dashboard without logging in
    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    // Should be redirected to login
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(TEST_USER_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_USER_PASSWORD);
    await page.locator('button:has-text("Log In")').click();

    // Wait for dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout")').or(page.locator('text=/Log Out|Sign Out/i')).first();
    await logoutButton.click();

    // Should be redirected to login
    await page.waitForURL(/\/(login|home)/, { timeout: 10000 });

    // Verify token is cleared
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

  test('should maintain JWT token across page reloads', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(TEST_USER_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_USER_PASSWORD);
    await page.locator('button:has-text("Log In")').click();

    // Wait for dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Get token
    const tokenBeforeReload = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenBeforeReload).toBeTruthy();

    // Reload page
    await page.reload();

    // Wait for dashboard to load again
    await page.locator('text=/Dashboard|Evaluations/i').waitFor({ state: 'visible', timeout: 5000 });

    // Verify token is still there
    const tokenAfterReload = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenAfterReload).toBe(tokenBeforeReload);

    // Verify still on dashboard
    expect(page.url()).toContain('/dashboard');
  });
});
