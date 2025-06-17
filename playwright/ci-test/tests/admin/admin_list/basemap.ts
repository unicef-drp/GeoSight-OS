import { expect, test } from '@playwright/test';
import { checkPermission, editPermission } from "../../utils/permission";

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/basemap/'

const defaultPermission = {
  public_access: 'None',
  users: [],
  groups: []
}
const newPermission = {
  public_access: 'Read',
  users: ['contributor'],
  groups: ['Group 1']
}

test.describe('Basemap list admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  const duplicate = async (page, index) => {
    await page.goto('/admin/basemap/create#General');
    await page.locator('#Form #id_name').fill(`Basemap A${index}`);
    await page.locator('#Form #id_url').fill(`Test`);
    await page.locator('#id_group').first().click();
    await page.getByRole('option', { name: 'Test' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
  }

  test('Test list functions', async ({ page }) => {
    // Create new data();
    for (let i = 0; i < 10; i++) {
      await duplicate(page, i)
    }

    // Check list
    await page.goto(_url);

    // Edit permission
    await editPermission(page, 1, newPermission);
    await checkPermission(page, 1, newPermission);
    await page.goto(_url);
    await editPermission(page, 1, defaultPermission);
    await checkPermission(page, 1, defaultPermission);
    await page.goto(_url);

    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–13 of 13');

    // Check search
    await page.getByPlaceholder('Search Basemap').fill('A2');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    // Search by new object
    await page.getByPlaceholder('Search Basemap').fill('Basemap A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');


    // Check pagination();
    await page.getByPlaceholder('Search Basemap').fill('');
    await page.getByLabel('25').click();
    await page.getByRole('option', { name: '10', exact: true }).click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Basemap A0');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 13');
    await page.getByLabel('Go to next page').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Mapbox Satellite');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('11–13 of 13');

    // Orders
    await page.getByLabel('Go to previous page').click();
    await page.getByLabel('Basemap Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('OSM');
    await page.getByLabel('Basemap Name').click();
    await page.getByLabel('Basemap Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Basemap A0');

    // Check Show Selected
    await page.reload();
    await delay(500)
    await page.locator('div:nth-child(3) > .MuiDataGrid-cellCheckbox').click();
    await page.locator('div:nth-child(4) > .MuiDataGrid-cellCheckbox').click();
    await page.locator('div:nth-child(5) > .MuiDataGrid-cellCheckbox').click();
    await page.locator('div:nth-child(6) > .MuiDataGrid-cellCheckbox').click();
    await page.getByRole('button', { name: 'Show selected' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–4 of 4');
    await page.getByRole('cell', { name: 'Unselect row' }).first().click();
    await page.getByRole('cell', { name: 'Unselect row' }).first().click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');
    await page.getByRole('button', { name: 'Show selected' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–13 of 13');
    await expect(page.getByRole('cell', { name: 'Unselect row' }).nth(0)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Unselect row' }).nth(1)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Unselect row' }).nth(2)).toBeHidden();

    // Delete per row
    await page.reload();
    await page.getByPlaceholder('Search Basemap').fill('Basemap A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');
    await page.locator('.MuiDataGrid-row').nth(0).getByTestId('MoreVertIcon').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete Basemap A0?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–9 of 9');

    // Delete all
    await page.getByLabel('Select all rows').check();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete 9 basemaps?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');

    // Reload
    await page.reload();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');
  });
})