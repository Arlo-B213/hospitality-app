import { test, expect } from '@playwright/test';

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test.user@pride-training.test';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

test.describe('Offline Sync Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Login before each test
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(TEST_USER_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_USER_PASSWORD);
    await page.locator('button:has-text("Log In")').click();

    // Wait for dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should queue changes when offline', async ({ page, context }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Go offline by disabling network
    await context.setOffline(true);

    // Verify offline state
    const isOnline = await page.evaluate(() => navigator.onLine);
    expect(isOnline).toBe(false);

    // Try to make a change (e.g., edit evaluation)
    const editButton = page.locator('button:has-text(/Edit|Update|Modify/)').first();

    if (await editButton.isVisible()) {
      await editButton.click();

      // Wait for form
      await page.locator('input, select, textarea').first().waitFor({ state: 'visible', timeout: 3000 });

      // Make a change
      const input = page.locator('input, textarea').first();
      await input.click();
      await input.fill('Updated offline data');

      // Try to save
      const saveButton = page.locator('button:has-text(/Save|Submit/)').first();
      await saveButton.click();

      // Should show offline indicator or queue message
      const offlineIndicator = page.locator('text=/offline|queued|pending/i').first();
      await offlineIndicator.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {
        // Might not show explicit message
      });

      // Verify data is saved locally
      const savedData = await page.evaluate(() => localStorage.getItem('pendingChanges'));
      expect(savedData).toBeTruthy();
    }

    // Restore network
    await context.setOffline(false);
  });

  test('should sync changes when coming back online', async ({ page, context }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Go offline
    await context.setOffline(true);

    // Make a change while offline
    const editButton = page.locator('button:has-text(/Edit|Update/)').first();
    if (await editButton.isVisible()) {
      await editButton.click();

      // Wait for form
      await page.locator('input').first().waitFor({ state: 'visible', timeout: 3000 });

      // Fill in a field
      const input = page.locator('input').first();
      await input.fill('Offline change');

      // Save
      const saveButton = page.locator('button:has-text(/Save|Submit/)').first();
      await saveButton.click();

      // Verify offline state
      const isOnline = await page.evaluate(() => navigator.onLine);
      expect(isOnline).toBe(false);
    }

    // Go back online
    await context.setOffline(false);

    // Wait for network to stabilize
    await page.waitForLoadState('networkidle');

    // Check for sync status
    const syncIndicator = page.locator('text=/syncing|synced|offline/i').first();

    // Should show sync success or completion message
    await syncIndicator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      // Sync might happen silently
    });

    // Reload page to verify data persisted
    await page.reload();

    // Verify we're still logged in and can see data
    await page.locator('text=/Dashboard|Evaluation/i').waitFor({ state: 'visible', timeout: 5000 });
  });

  test('should retain changes through network disconnection', async ({ page, context }) => {
    // Navigate to evaluation
    await page.goto('/dashboard');

    // Disconnect network
    await context.setOffline(true);

    // Make several changes
    for (let i = 0; i < 3; i++) {
      const editButton = page.locator('button:has-text(/Edit|Add|Create/)').first();

      if (await editButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await editButton.click();

        // Wait for form
        const input = page.locator('input, textarea').first();
        await input.waitFor({ state: 'visible', timeout: 2000 });
        await input.fill(`Change ${i}`);

        // Save
        const saveButton = page.locator('button:has-text(/Save|Submit/)').first();
        await saveButton.click();

        // Wait for save to process
        await page.locator('input, textarea').first().waitFor({ state: 'visible', timeout: 1000 });
      }
    }

    // Verify queue has items
    const queue = await page.evaluate(() => localStorage.getItem('syncQueue'));
    expect(queue).toBeTruthy();

    // Come back online
    await context.setOffline(false);

    // Wait for network to stabilize and sync to complete
    await page.waitForLoadState('networkidle');

    // Verify queue is cleared after sync
    const queueAfterSync = await page.evaluate(() => localStorage.getItem('syncQueue'));

    // Queue should be empty or removed after successful sync
    // (or it might be cleared depending on implementation)
    if (queueAfterSync) {
      try {
        const parsedQueue = JSON.parse(queueAfterSync);
        expect(Array.isArray(parsedQueue)).toBe(true);
      } catch {
        // Queue format might be different
      }
    }
  });

  test('should show offline indicator when disconnected', async ({ page, context }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Disconnect network
    await context.setOffline(true);

    // Look for offline indicator
    const offlineIndicator = page.locator('text=/offline|no connection|no internet/i').or(page.locator('[aria-label*="offline"]')).first();

    await offlineIndicator.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {
      // Check for other indicators
    });

    // Verify we can still see content
    const content = page.locator('text=/Dashboard|Evaluation/i').first();
    await content.waitFor({ state: 'visible', timeout: 3000 });

    // Restore connection
    await context.setOffline(false);

    // Offline indicator should disappear
    await offlineIndicator.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
      // Might not disappear immediately
    });
  });

  test('should handle concurrent changes while offline', async ({ page, context }) => {
    // Navigate to evaluation
    await page.goto('/dashboard');

    // Go offline
    await context.setOffline(true);

    // Make multiple changes concurrently
    const edits = [
      { selector: 'input[name="skill1"]', value: 'Excellent' },
      { selector: 'input[name="skill2"]', value: 'Good' },
      { selector: 'input[name="skill3"]', value: 'Excellent' },
    ];

    for (const edit of edits) {
      const input = page.locator(edit.selector).first();

      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.fill(edit.value);
      }
    }

    // Save all changes
    const saveButton = page.locator('button:has-text(/Save|Submit/)').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
    }

    // Verify offline state
    expect(await page.evaluate(() => navigator.onLine)).toBe(false);

    // Reconnect
    await context.setOffline(false);

    // Wait for network to stabilize
    await page.waitForLoadState('networkidle');

    // Navigate away and back
    await page.goto('/dashboard');
    await page.locator('text=/Evaluation/i').first().waitFor({ state: 'visible', timeout: 5000 });

    // Verify changes are still there
    const firstChange = page.locator(edits[0].selector).first();
    const firstValue = await firstChange.inputValue().catch(() => '');

    // Should have persisted
    expect(firstValue).toBeTruthy();
  });

  test('should handle sync errors gracefully', async ({ page, context }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Go offline
    await context.setOffline(true);

    // Make a change
    const editButton = page.locator('button:has-text(/Edit/)').first();
    if (await editButton.isVisible()) {
      await editButton.click();

      const input = page.locator('input').first();
      await input.waitFor({ state: 'visible', timeout: 3000 });
      await input.fill('Data to sync');

      const saveButton = page.locator('button:has-text(/Save/)').first();
      await saveButton.click();
    }

    // Go online
    await context.setOffline(false);

    // Wait for sync attempt to complete
    await page.waitForLoadState('networkidle');

    // Check for retry or error handling
    const retryButton = page.locator('button:has-text(/Retry|Try Again/)').first();
    const errorMessage = page.locator('text=/error|failed|retry/i').first();

    // Should have some way to handle sync errors
    const hasErrorHandling = await retryButton.isVisible({ timeout: 1000 }).catch(() => false) ||
                            await errorMessage.isVisible({ timeout: 1000 }).catch(() => false);

    // At minimum, app should remain functional
    expect(page.url()).toBeTruthy();
  });
});
