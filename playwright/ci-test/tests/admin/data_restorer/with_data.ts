import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('Restore data', () => {
  // A use case tests scenarios
  test('Restore data', async ({ page }) => {
    await page.goto('/admin/project/');
    await expect(page.locator('.DataRestorerModal')).toBeVisible();

    // We do test the skip restoring first
    await page.getByText('Skip restoring data').click()
    await page.getByText('Confirm').click()
    await expect(page.locator('.DataRestorerModal')).toBeHidden();
    await page.reload();
    await delay(1000)
    await expect(page.locator('.DataRestorerModal')).toBeHidden();

    // Check the demo data
    await page.goto('/admin/basemap/');
    await expect(page.locator('.AdminContentHeader-Left a')).toContainText('Basemaps');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');

    await page.goto('/admin/indicators/');
    await expect(page.locator('.AdminContentHeader-Left a')).toContainText('Indicators');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–5 of 5');

    await page.goto('/admin/context-layer/');
    await expect(page.locator('.AdminContentHeader-Left a')).toContainText('Context Layers');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');

    await page.goto('/admin/project/');
    await expect(page.locator('.AdminContentHeader-Left a')).toContainText('Projects');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    await page.goto('/admin/style/');
    await expect(page.locator('.AdminContentHeader-Left a')).toContainText('Styles');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    await page.goto('/admin/related-table/');
    await expect(page.locator('.AdminContentHeader-Left a')).toContainText('Related Tables');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    await page.goto('/admin/dataset/dataset/');
    await expect(page.locator('.AdminContentHeader-Left a')).toContainText('Data Browser');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–5 of 5');

    // enable on the admin
    await page.goto('/django-admin/geosight_data_restorer/preferences/1/change/');
    await page.getByText('Enable request', { exact: true }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Do again
    await page.goto('/admin/project/');
    await expect(page.locator('.DataRestorerModal')).toBeVisible();
    await page.locator('.DataRestorerModal__option').nth(0).locator('button').click();
    await page.getByText('Confirm').click()

    await expect(page.locator('.DataRestorerModal')).toBeHidden({ timeout: 5 * 60 * 1000 });

    // Check the data
    await page.goto('/admin/basemap/');
    await expect(page.locator('.AdminContentHeader-Left a')).toContainText('Basemaps');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');

    await page.goto('/admin/indicators/');
    await expect(page.locator('.AdminContentHeader-Left a')).toContainText('Indicators');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–6 of 6');

    await page.goto('/admin/context-layer/');
    await expect(page.locator('.AdminContentHeader-Left a')).toContainText('Context Layers');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');

    await page.goto('/admin/project/');
    await expect(page.locator('.AdminContentHeader-Left a')).toContainText('Projects');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');

    await page.goto('/admin/style/');
    await expect(page.locator('.AdminContentHeader-Left a')).toContainText('Styles');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    await page.goto('/admin/related-table/');
    await expect(page.locator('.AdminContentHeader-Left a')).toContainText('Related Tables');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    await page.goto('/admin/dataset/dataset/');
    await expect(page.locator('.AdminContentHeader-Left a')).toContainText('Data Browser');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–25 of 181');
  });
});