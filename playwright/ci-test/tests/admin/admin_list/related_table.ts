import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/related-table/'

test.describe('Related table list admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  const duplicate = async (page, index) => {
    await page.goto('/django-admin/geosight_data/relatedtable/add/');
    await page.locator('#id_name').fill(`Generated A${index}`);
    await page.locator('#id_description').fill(`Generated_A${index}`);
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.getByRole('button', { name: 'Save', exact: true }).click();
  }

  const testFunction = async (originalPage, page) => {
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–11 of 11');

    // Check search
    await page.getByPlaceholder('Search related table').fill('A2');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    // Search by new object
    await page.getByPlaceholder('Search related table').fill('Generated A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');
    await page.getByPlaceholder('Search related table').fill('Generated_A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');


    // Check pagination();
    await page.getByPlaceholder('Search related table').fill('');
    await page.getByLabel('25').click();
    await originalPage.getByRole('option', {
      name: '10',
      exact: true
    }).click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Generated A0');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 11');
    await page.getByLabel('Go to next page').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('RRR');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('11–11 of 11');

    // Orders
    await page.getByLabel('Go to previous page').click();
    await page.getByLabel('Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('RRR');
    await page.getByLabel('Name').click();
    await page.getByLabel('Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Generated A0');
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
    await page.getByText('Related Table Format').click();
    await page.getByText('Attributes').click();
    await page.getByPlaceholder('Select Related Table').click();
    await expect(page.locator('.ModalDataSelector')).toBeVisible()
    await testFunction(page, page.locator('.ModalDataSelector'))
    await page.getByPlaceholder('Search related table').fill('Generated_A');
    await expect(page.locator('.ModalDataSelector').locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');
    await page.getByPlaceholder('Search related table').fill('');
    await expect(page.locator('.ModalDataSelector').locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 11');

    // Select
    await page.locator('.MuiDataGrid-row').nth(1).click();
    await expect(page.locator('.ModalDataSelector')).toBeHidden()
    await expect(page.getByPlaceholder('Select Related Table')).toHaveValue('Generated A1');

    // ----------------------------------
    // Test Project Selection
    // ----------------------------------
    await page.goto('/admin/project/create');
    await page.getByRole('textbox', { name: 'Select View' }).click();
    await page.getByText('Local', { exact: true }).click();
    await page.getByRole('cell', { name: 'Somalia', exact: true }).click();
    await page.locator('.DashboardFormHeader').getByText('Related Tables').click();
    await page.getByRole('button', { name: 'Add Related Table' }).click();
    await expect(page.locator('.ModalDataSelector')).toBeVisible()

    // Check Show Selected
    await delay(500)
    await page.locator('.ModalDataSelector').locator('.MuiDataGrid-row').nth(0).click();
    await page.locator('.ModalDataSelector').locator('.MuiDataGrid-row').nth(1).click();
    await page.locator('.ModalDataSelector').locator('.MuiDataGrid-row').nth(2).click();
    await page.locator('.ModalDataSelector').locator('.MuiDataGrid-row').nth(3).click();
    await page.locator('.ModalDataSelector').getByRole('button', { name: 'Show selected' }).click();
    await expect(page.locator('.ModalDataSelector').locator('.MuiTablePagination-displayedRows').first()).toContainText('1–4 of 4');
    await page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(2).click();
    await page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(2).click();
    await expect(page.locator('.ModalDataSelector').locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');
    await page.locator('.ModalDataSelector').getByRole('button', { name: 'Show selected' }).click();
    await expect(page.locator('.ModalDataSelector').locator('.MuiTablePagination-displayedRows').first()).toContainText('1–11 of 11');
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(0)).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(1)).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(2)).toBeHidden();

    // Select
    await page.locator('.ModalDataSelector').getByRole('button', { name: 'Update Selection' }).click()
    await expect(page.locator('.ModalDataSelector').locator('.ModalDataSelector')).toBeHidden()
    await expect(page.getByText('Generated A0').first()).toBeVisible();
    await expect(page.getByText('Generated A1').first()).toBeVisible();

    // ------------------------------------------------------
    // DELETE THE CREATED
    // ------------------------------------------------------
    // Delete per row
    await page.goto(_url);
    await page.getByPlaceholder('Search related table').fill('Generated A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');
    await page.locator('.MuiDataGrid-row').nth(0).getByTestId('MoreVertIcon').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete Generated A0?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–9 of 9');

    // Delete all
    await page.getByLabel('Select all rows').check();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete 9 related tables?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');

    // Reload
    await page.reload();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');
  });
})