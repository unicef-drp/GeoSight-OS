import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/style/'

test.describe('Style list admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  const duplicate = async (page, index) => {
    await page.goto('/admin/style/create#General');
    await page.locator('#Form #id_name').fill(`Generated A${index}`);
    await page.locator('#id_group').first().click();
    await page.getByRole('option', { name: 'Generic' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
  }

  test('Test list functions', async ({ page }) => {
    // Create new data();
    for (let i = 0; i < 10; i++) {
      await duplicate(page, i)
    }

    // Check list
    await page.goto(_url);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–11 of 11');

    // Check search
    await page.getByPlaceholder('Search style').fill('A2');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    // Search by new object
    await page.getByPlaceholder('Search style').fill('Generated A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');


    // Check pagination();
    await page.getByPlaceholder('Search style').fill('');
    await page.getByLabel('25').click();
    await page.getByRole('option', { name: '10', exact: true }).click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Generated A0');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 11');
    await page.getByLabel('Go to next page').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Generic style with 5 classes for 0-100 range (float, diverging colors, red-green)');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('11–11 of 11');

    // Orders
    await page.getByLabel('Go to previous page').click();
    await page.getByLabel('Style Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Generic style with 5 classes for 0-100 range (float, diverging colors, red-green)');
    await page.getByLabel('Style Name').click();
    await page.getByLabel('Style Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Generated A0');

    // Delete per row
    await page.reload();
    await page.getByPlaceholder('Search style').fill('Generated A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');
    await page.locator('.MuiDataGrid-row').nth(0).getByTestId('MoreVertIcon').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete Generated A0?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–9 of 9');

    // Delete all
    await page.getByLabel('Select all rows').check();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete 9 styles?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');

    // Reload
    await page.reload();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');
  });
})