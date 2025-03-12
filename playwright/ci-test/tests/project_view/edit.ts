import { expect, test } from '@playwright/test';

// URL That we need to check
const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('View edit project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/admin/project/demo-geosight-project/edit');
  });

  // A use case tests scenarios
  test('Edit project', async ({ page }) => {
    // Check popup config
    await page.getByText('Indicator Layers (10)').click();
    await page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('button').nth(1).click();
    await page.getByText('Popup', { exact: true }).click();
    await expect(page.locator('.preview .popup-content').nth(0).locator('td').nth(0)).toContainText('SOM_TEST_IND_A')
    await expect(page.locator('.preview .popup-content').nth(0).locator('td').nth(1)).toContainText('77')
    await expect(page.locator('.preview .popup-content').nth(1).locator('td').nth(0)).toContainText('Average:')
    await expect(page.locator('.preview .popup-content').nth(1).locator('td').nth(1)).toContainText('NaN')
    await page.locator('div:nth-child(2) > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'Admin Level 1' }).click();
    await expect(page.locator('.preview .popup-content').nth(0).locator('td').nth(0)).toContainText('SOM_TEST_IND_A')
    await expect(page.locator('.preview .popup-content').nth(0).locator('td').nth(1)).toContainText('61')
    await expect(page.locator('.preview .popup-content').nth(1).locator('tr').nth(0).locator('td').nth(0)).toContainText('Bakool')
    await expect(page.locator('.preview .popup-content').nth(1).locator('tr').nth(0).locator('td').nth(1)).toContainText('78')
    await expect(page.locator('.preview .popup-content').nth(1).locator('tr').nth(0).locator('td').nth(2)).toContainText('2020-01-01')
    await expect(page.locator('.preview .popup-content').nth(1).locator('tr').nth(1).locator('td').nth(0)).toContainText('Banadir')
    await expect(page.locator('.preview .popup-content').nth(1).locator('tr').nth(1).locator('td').nth(1)).toContainText('30')
    await expect(page.locator('.preview .popup-content').nth(1).locator('tr').nth(1).locator('td').nth(2)).toContainText('2020-01-01')
  });
});