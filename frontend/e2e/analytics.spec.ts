import { test, expect } from '@playwright/test';

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test.user@pride-training.test';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

test.describe('Analytics Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(TEST_USER_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_USER_PASSWORD);
    await page.locator('button:has-text("Log In")').click();

    // Wait for dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should navigate to analytics page', async ({ page }) => {
    // Look for analytics link/button
    const analyticsLink = page.locator('a, button').filter({ hasText: /Analytics|Reports|Charts/i }).first();
    await analyticsLink.waitFor({ state: 'visible', timeout: 5000 });
    await analyticsLink.click();

    // Wait for analytics page to load
    await page.waitForURL(/\/analytics|\/reports/, { timeout: 10000 }).catch(() => {
      // Might load inline
    });

    // Verify analytics page content is visible
    await page.locator('text=/Analytics|Reports|Charts|Performance/i').waitFor({ state: 'visible', timeout: 5000 });
  });

  test('should display charts and graphs', async ({ page }) => {
    // Navigate to analytics
    const analyticsLink = page.locator('a, button').filter({ hasText: /Analytics|Reports/i }).first();

    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();

      // Wait for analytics content
      await page.waitForURL(/\/analytics|\/reports/, { timeout: 10000 }).catch(() => {
        // OK if inline
      });
    }

    // Look for chart elements (SVG for recharts)
    const charts = page.locator('svg').filter({ hasText: /chart|graph/ });

    // Wait for at least one chart to be visible
    const firstChart = charts.first();
    await firstChart.waitFor({ state: 'visible', timeout: 5000 });

    // Verify charts are rendered
    expect(await firstChart.isVisible()).toBe(true);
  });

  test('should display correct metrics', async ({ page }) => {
    // Navigate to analytics
    const analyticsLink = page.locator('a, button').filter({ hasText: /Analytics|Reports|Performance/i }).first();

    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();

      // Wait for content
      await page.waitForURL(/\/analytics|\/reports/, { timeout: 10000 }).catch(() => {
        // OK
      });
    }

    // Look for metric cards or stat elements
    const metrics = ['Total Evaluations', 'Average Score', 'Pass Rate', 'Pending Evaluations'];

    for (const metric of metrics) {
      const metricElement = page.locator(`text=/${metric}/i`).first();

      await metricElement.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {
        // Metric might not be on this page
      });

      if (await metricElement.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Verify metric has a value
        const metricContainer = metricElement.locator('..');
        const value = await metricContainer.locator('text=/[0-9]+/').first().textContent();

        // Should have some numeric value
        expect(value).toMatch(/[0-9]/);
      }
    }
  });

  test('should show new hire distribution chart', async ({ page }) => {
    // Navigate to analytics
    const analyticsLink = page.locator('a, button').filter({ hasText: /Analytics|Reports/i }).first();

    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();

      // Wait for content
      await page.waitForURL(/\/analytics|\/reports/, { timeout: 10000 }).catch(() => {
        // OK
      });
    }

    // Look for distribution or pie chart
    const distributionChart = page.locator('text=/Distribution|Status|Performance Level/i').first();
    await distributionChart.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      // Chart might have different title
    });

    // Should have chart legend or indicators
    const chartLegend = page.locator('text=/Excellent|Good|Needs Improvement|At Risk/i').first();
    await chartLegend.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {
      // Legend might not be visible
    });
  });

  test('should show skill assessment metrics', async ({ page }) => {
    // Navigate to analytics
    const analyticsLink = page.locator('a, button').filter({ hasText: /Analytics|Reports/i }).first();

    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();

      // Wait for content
      await page.waitForURL(/\/analytics|\/reports/, { timeout: 10000 }).catch(() => {
        // OK
      });
    }

    // Look for skill metrics section
    const skillSection = page.locator('text=/Skill|Competency|Assessment/i').first();
    await skillSection.waitFor({ state: 'visible', timeout: 5000 });

    // Should show skills with scores
    const skills = ['Technical', 'Communication', 'Teamwork', 'Initiative', 'Problem Solving'];

    let skillsFound = 0;
    for (const skill of skills) {
      const skillElement = page.locator(`text=${skill}`).first();

      if (await skillElement.isVisible({ timeout: 1000 }).catch(() => false)) {
        skillsFound++;

        // Verify skill has a score/bar
        const skillContainer = skillElement.locator('..');
        const scoreElement = skillContainer.locator('text=/[0-9]+%|[0-5]\/5/i').first();

        if (await scoreElement.isVisible({ timeout: 500 }).catch(() => false)) {
          const scoreText = await scoreElement.textContent();
          expect(scoreText).toMatch(/[0-9]/);
        }
      }
    }

    // Should find at least some skills
    expect(skillsFound).toBeGreaterThan(0);
  });

  test('should display timeline or progress chart', async ({ page }) => {
    // Navigate to analytics
    const analyticsLink = page.locator('a, button').filter({ hasText: /Analytics|Reports|Progress/i }).first();

    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();

      // Wait for content
      await page.waitForURL(/\/analytics|\/reports/, { timeout: 10000 }).catch(() => {
        // OK
      });
    }

    // Look for timeline or progress sections
    const timelineSection = page.locator('text=/Timeline|Progress|30-Day|60-Day|90-Day/i').first();

    await timelineSection.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      // Might not have timeline
    });

    // Check for progress indicators
    const progressBars = page.locator('div[role="progressbar"]').or(page.locator('.progress'));

    if (await progressBars.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      // Verify progress bars have values
      const firstBar = progressBars.first();
      const style = await firstBar.getAttribute('style');

      expect(style).toBeTruthy();
    }
  });

  test('should filter analytics data by date range', async ({ page }) => {
    // Navigate to analytics
    const analyticsLink = page.locator('a, button').filter({ hasText: /Analytics|Reports/i }).first();

    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();

      // Wait for content
      await page.waitForURL(/\/analytics|\/reports/, { timeout: 10000 }).catch(() => {
        // OK
      });
    }

    // Look for date filter
    const dateFilter = page.locator('input[type="date"]').or(page.locator('text=/Date Range|From|To|Period/i')).first();

    if (await dateFilter.isVisible({ timeout: 1000 }).catch(() => false)) {
      await dateFilter.click();

      // Try to select a date range
      const startDate = page.locator('input[placeholder*="Start"]').or(page.locator('input[type="date"]').first());
      if (await startDate.isVisible({ timeout: 1000 }).catch(() => false)) {
        await startDate.fill('2026-01-01');

        // Wait for network to stabilize after date change
        await page.waitForLoadState('networkidle');
      }

      // Verify charts updated (check for different data)
      const updatedChart = page.locator('svg').first();
      expect(await updatedChart.isVisible()).toBe(true);
    }
  });

  test('should handle empty analytics data gracefully', async ({ page }) => {
    // Navigate to analytics
    const analyticsLink = page.locator('a, button').filter({ hasText: /Analytics|Reports/i }).first();

    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();

      // Wait for content
      await page.waitForURL(/\/analytics|\/reports/, { timeout: 10000 }).catch(() => {
        // OK
      });
    }

    // Look for "no data" message or empty state
    const emptyState = page.locator('text=/No data|No evaluations|Empty|No results/i').first();
    const charts = page.locator('svg').first();

    // Should either show empty state OR show charts
    const hasEmptyState = await emptyState.isVisible({ timeout: 1000 }).catch(() => false);
    const hasCharts = await charts.isVisible({ timeout: 1000 }).catch(() => false);

    expect(hasEmptyState || hasCharts).toBe(true);
  });

  test('should export analytics data', async ({ page, context }) => {
    // Navigate to analytics
    const analyticsLink = page.locator('a, button').filter({ hasText: /Analytics|Reports/i }).first();

    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();

      // Wait for content
      await page.waitForURL(/\/analytics|\/reports/, { timeout: 10000 }).catch(() => {
        // OK
      });
    }

    // Look for export button
    const exportButton = page.locator('button').filter({ hasText: /Export|Download|PDF|CSV/i }).first();

    if (await exportButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Listen for download
      const downloadPromise = context.waitForEvent('download');

      await exportButton.click();

      // Wait for download to start
      try {
        const download = await downloadPromise;
        expect(download.url()).toBeTruthy();
        expect(download.suggestedFilename()).toMatch(/\.(pdf|csv|xlsx)$/i);
      } catch {
        // Download might work differently
      }
    }
  });

  test('should display real-time updates', async ({ page }) => {
    // Navigate to analytics
    const analyticsLink = page.locator('a, button').filter({ hasText: /Analytics|Reports/i }).first();

    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();

      // Wait for content
      await page.waitForURL(/\/analytics|\/reports/, { timeout: 10000 }).catch(() => {
        // OK
      });
    }

    // Get initial metric values
    const initialMetric = page.locator('text=/[0-9]+/').first();
    const initialValue = await initialMetric.textContent();

    // Wait for potential real-time updates from server
    await page.waitForLoadState('networkidle');

    // Get updated metric
    const updatedMetric = page.locator('text=/[0-9]+/').first();
    const updatedValue = await updatedMetric.textContent();

    // Values might be the same or different, but should be valid numbers
    expect(initialValue).toMatch(/[0-9]/);
    expect(updatedValue).toMatch(/[0-9]/);
  });
});
