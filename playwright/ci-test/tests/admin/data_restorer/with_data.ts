import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('Restore data', () => {
  // A use case tests scenarios
  test('Restore data', async ({ page }) => {
    await page.goto('/admin/project/');
    await delay(1000)
    await expect(page.locator('.DataRestorerModal')).toBeHidden();
  });
});