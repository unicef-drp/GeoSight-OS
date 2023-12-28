import { expect, test } from '@playwright/test';

test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('');
  });

  // A use case tests scenarios
  test('Page Loaded', async ({ page }) => {
    await page.waitForSelector('.Home', { timeout: 2000 });
    await expect(page.getByText('Admin panel')).toBeVisible();
  })
});