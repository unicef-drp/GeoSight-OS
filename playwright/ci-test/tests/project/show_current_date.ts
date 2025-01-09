import { expect, test } from '@playwright/test';

// URL That we need to check
const timeout = 2000;

test.describe('View project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/project/demo-geosight-project');
  });

  // A use case tests scenarios
  test('Show current date', async ({ page }) => {
    // Check initial state
    await page.getByRole('button', { name: 'Close' }).click();

    // ----------------------------------------------------------------------------
    // CURRENT DATE TOOLBAR
    // ----------------------------------------------------------------------------
    // Check current date info is changed based on clicked project date
    await expect(page.locator('.CurrentDate')).toContainText('<=2026-02-17');
    await page.getByTitle('Show global time configuration').click();
    await page.locator('div:nth-child(2) > .ReactSelect > .ReactSelect__control > .ReactSelect__indicators > .DropdownIndicator > svg').first().click();
    await page.getByRole('option', { name: '09-' }).click();
    await expect(page.locator('.CurrentDate')).toContainText('<=2023-09-30');
    await page.getByLabel('Show last known value in range').uncheck();
    await expect(page.locator('.CurrentDate')).toContainText('2023-09-30');
    await page.getByLabel('Show last known value in range').check();
  });
});