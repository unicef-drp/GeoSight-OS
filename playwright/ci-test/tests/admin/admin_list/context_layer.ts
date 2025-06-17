import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/context-layer/'

test.describe('Context layer list admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  const duplicate = async (page, index) => {
    await page.goto('/admin/context-layer/create#General');
    await page.locator('#Form #id_name').fill(`Context Layer A${index}`);
    await page.locator('.ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'Test' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
  }

  const testFunction = async (originalPage, page) => {
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–12 of 12');

    // Check search
    await page.getByPlaceholder('Search Context Layer').fill('A2');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    // Search by new object
    await page.getByPlaceholder('Search Context Layer').fill('Context Layer A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');


    // Check pagination();
    await page.getByPlaceholder('Search Context Layer').fill('');
    await page.getByLabel('25').click();
    await originalPage.getByRole('option', {
      name: '10',
      exact: true
    }).click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Context Layer A0');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 12');
    await page.getByLabel('Go to next page').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Somalia healthsites');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('11–12 of 12');

    // Orders
    await page.getByLabel('Go to previous page').click();
    await page.getByLabel('Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Somalia sample context layer');
    await page.getByLabel('Name').click();
    await page.getByLabel('Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Context Layer A0');
  }

  test('Test list functions', async ({ page }) => {
    // Create new data();
    for (let i = 0; i < 10; i++) {
      await duplicate(page, i)
    }

    // ----------------------------------
    // Check list
    // ----------------------------------
    await page.goto(_url);
    await testFunction(page, page)

    // ----------------------------------
    // Test Single Selection
    // ----------------------------------
    await page.goto('/admin/importer/#General');
    await page.getByText('Vector Context Layer Format').click();
    await page.getByText('Attributes').click();
    await page.getByPlaceholder('Select Context Layer').click();
    await expect(page.locator('.ModalDataSelector')).toBeVisible()
    await testFunction(page, page.locator('.ModalDataSelector'))

    // Select
    await page.locator('.MuiDataGrid-row').nth(1).click();
    await expect(page.locator('.ModalDataSelector')).toBeHidden()
    await expect(page.getByPlaceholder('Select Context Layer')).toHaveValue('Context Layer A1');

    // ----------------------------------
    // Test Project Selection
    // ----------------------------------
    await page.goto('/admin/project/create');
    await page.locator('.DashboardFormHeader').getByText('Context Layers').click();
    await page.getByRole('button', { name: 'Add Context Layer' }).click();
    await expect(page.locator('.ModalDataSelector')).toBeVisible()
    await testFunction(page, page.locator('.ModalDataSelector'))

    // Check Show Selected
    await delay(500)
    await page.locator('.ModalDataSelector').locator('.MuiDataGrid-row').nth(0).click();
    await page.locator('.ModalDataSelector').locator('.MuiDataGrid-row').nth(1).click();
    await page.locator('.ModalDataSelector').locator('.MuiDataGrid-row').nth(2).click();
    await page.locator('.ModalDataSelector').locator('.MuiDataGrid-row').nth(3).click();
    await page.getByRole('button', { name: 'Show selected' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–4 of 4');
    await page.getByRole('cell', { name: 'Unselect row' }).nth(2).click();
    await page.getByRole('cell', { name: 'Unselect row' }).nth(2).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');
    await page.getByRole('button', { name: 'Show selected' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 12');
    await expect(page.getByRole('cell', { name: 'Unselect row' }).nth(0)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Unselect row' }).nth(1)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Unselect row' }).nth(2)).toBeHidden();

    // Select
    await page.locator('.ModalDataSelector').getByRole('button', { name: 'Update Selection' }).click()
    await expect(page.locator('.ModalDataSelector').locator('.ModalDataSelector')).toBeHidden()
    await expect(page.getByText('Context Layer A0 Config')).toBeVisible();
    await expect(page.getByText('Context Layer A1 Config')).toBeVisible();

    // ------------------------------------------------------
    // DELETE THE CREATED
    // ------------------------------------------------------
    await page.goto(_url);
    await page.getByPlaceholder('Search Context Layer').fill('Context Layer A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');
    await page.locator('.MuiDataGrid-row').nth(0).getByTestId('MoreVertIcon').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete Context Layer A0?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–9 of 9');

    // Delete all
    await page.getByLabel('Select all rows').check();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete 9 context layers?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');

    // Reload
    await page.reload();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');
  });
})