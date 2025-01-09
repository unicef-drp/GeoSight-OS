import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/indicators/'

test.describe('Dashboard list admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  test('Test list functions', async ({ page }) => {
    // Create new data();
    await page.goto('/admin/indicators/318/edit#General');
    await page.locator('#Form #id_name').fill('Sample Indicator A A1');
    await page.locator('#Form #id_shortcode').fill('SOM_TEST_IND_A_A1');
    await page.getByRole('button', { name: 'Save As' }).click();

    await page.goto('/admin/indicators/318/edit#General');
    await page.locator('#Form #id_name').fill('Sample Indicator A A2');
    await page.locator('#Form #id_shortcode').fill('SOM_TEST_IND_A_A2');
    await page.getByRole('button', { name: 'Save As' }).click();

    // Check list
    await page.goto(_url);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–6 of 6');

    // Check search
    await page.getByPlaceholder('Search Indicator').fill('B');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    // Search by new project
    await page.getByPlaceholder('Search Indicator').fill('Sample Indicator A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');


    // Check pagination();
    await page.getByPlaceholder('Search Indicator').fill('');
    await page.getByLabel('25').click();
    await page.getByRole('option', { name: '2', exact: true }).click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Sample Indicator A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 6');
    await page.getByLabel('Go to next page').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Sample Indicator A A2');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('3–4 of 6');

    // Orders
    await page.getByLabel('Go to previous page').click();
    await page.getByLabel('Indicator Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Sample Indicator D');
    await page.getByLabel('Indicator Name').click();
    await page.getByLabel('Indicator Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Sample Indicator A');

    // Delete per row
    await page.reload();
    await page.getByPlaceholder('Search Indicator').fill('Sample Indicator A A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');
    await page.locator('.MuiDataGrid-row').nth(0).getByTestId('MoreVertIcon').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure you want to delete : Sample Indicator A A1?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    // Delete all
    await page.getByLabel('Select all rows').check();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete 1 indicator?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');

    // Reload
    await page.reload();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–4 of 4');
  });
})