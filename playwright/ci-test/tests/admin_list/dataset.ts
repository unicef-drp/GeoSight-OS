import { expect, test } from '@playwright/test';

const _url = '/admin/dataset/dataset/'

test.describe('Dataset list admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });


  test('Test list functions', async ({ page }) => {
    // Check list
    await page.goto(_url);

    // Test ungroup by admin level
    await page.getByLabel('Group all admin levels').uncheck();
    await expect(page.locator('.MuiDataGrid-row')).toHaveCount(11);
    await page.getByLabel('Group all admin levels').check();
    await expect(page.locator('.MuiDataGrid-row')).toHaveCount(5);

    // Check indicator filter
    await page.getByRole('textbox').first().click();
    await page.getByRole('cell', { name: 'Sample Indicator A', exact: true }).click();
    await page.getByRole('cell', { name: 'Sample Indicator B', exact: true }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();
    await expect(page.locator('.MuiDataGrid-row')).toHaveCount(2);
    await page.getByRole('textbox').first().click();
    await page.getByRole('button', { name: 'Clear selection.' }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();
    await expect(page.locator('.MuiDataGrid-row')).toHaveCount(5);

    // Test Filter by level
    await page.getByPlaceholder('Filter by Level(s)').click();
    await page.getByRole('option', { name: '0' }).getByRole('checkbox').check();
    await expect(page.locator('.MuiDataGrid-row')).toHaveCount(3);
    await page.getByRole('option', { name: '0' }).getByRole('checkbox').uncheck();
    await expect(page.locator('.MuiDataGrid-row')).toHaveCount(5);

    // Test sort
    await page.getByText('Indicator', { exact: true }).click();
    await page.getByText('Indicator', { exact: true }).click();
    await expect(
      page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)
    ).toContainText('Sample Indicator D');
    await page.getByText('Indicator', { exact: true }).click();
    await expect(
      page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)
    ).toContainText('Sample Indicator A');
  });
})