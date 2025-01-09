import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/context-layer/'

test.describe('Dashboard list admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  test('Test list functions', async ({ page }) => {
    // Create new data();
    await page.goto('/admin/context-layer/create#General');
    await page.locator('#Form #id_name').fill('Context Layer A1');
    await page.locator('.ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'Test' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await page.goto('/admin/context-layer/create#General');
    await page.locator('#Form #id_name').fill('Context Layer A2');
    await page.locator('.ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'Test' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    // Check list
    await page.goto(_url);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–4 of 4');

    // Check search
    await page.getByPlaceholder('Search Context Layer').fill('A2');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    // Search by new object
    await page.getByPlaceholder('Search Context Layer').fill('Context Layer A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');


    // Check pagination();
    await page.getByPlaceholder('Search Context Layer').fill('');
    await page.getByLabel('25').click();
    await page.getByRole('option', { name: '2', exact: true }).click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Context Layer A1');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 4');
    await page.getByLabel('Go to next page').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Somalia sample context layer');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('3–4 of 4');

    // Orders
    await page.getByLabel('Go to previous page').click();
    await page.getByLabel('Context Layer Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Somalia sample context layer 2');
    await page.getByLabel('Context Layer Name').click();
    await page.getByLabel('Context Layer Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Context Layer A1');

    // Delete per row
    await page.reload();
    await page.getByPlaceholder('Search Context Layer').fill('Context Layer A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');
    await page.locator('.MuiDataGrid-row').nth(0).getByTestId('MoreVertIcon').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure you want to delete : Context Layer A1?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    // Delete all
    await page.getByLabel('Select all rows').check();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete 1 context layer?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');

    // Reload
    await page.reload();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');
  });
})