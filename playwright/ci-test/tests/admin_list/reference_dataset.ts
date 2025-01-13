import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/basemap/'

test.describe('Reference dataset selector admin', () => {

  const duplicate = async (page, index) => {
    await page.goto('/django-admin/geosight_reference_dataset/referencedataset/add/');
    await page.locator('#id_identifier').fill(`Dataset A${index}`);
    await page.locator('#id_name').fill(`Dataset A${index}`);
    await page.locator('#id_in_georepo').click();
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.getByRole('button', { name: 'Save', exact: true }).click();
  }

  test('Test single selection', async ({ page }) => {
    // Create new data();
    for (let i = 0; i < 10; i++) {
      await duplicate(page, i)
    }

    // Check list
    await page.goto('/admin/project/create');
    await page.locator('.ReferenceDatasetSection').click()
    await expect(page.locator('.ModalDataSelector')).toBeVisible()
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('1–11 of 11');

    // Check search
    await page.getByPlaceholder('Search View').fill('A2');
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    // Search by new object
    await page.getByPlaceholder('Search View').fill('Dataset A');
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');


    // Check pagination();
    await page.getByPlaceholder('Search View').fill('');
    await page.locator('.ModalDataSelector').getByLabel('25').click();
    await page.getByRole('option', { name: '10', exact: true }).click();
    await expect(page.locator('.ModalDataSelector .MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Dataset A0');
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('1–10 of 11');
    await page.locator('.ModalDataSelector').getByLabel('Go to next page').click();
    await expect(page.locator('.ModalDataSelector .MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Somalia');
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('11–11 of 11');

    // Orders
    await page.locator('.ModalDataSelector').getByLabel('Go to previous page').click();
    await page.locator('.ModalDataSelector').getByLabel('Name').click();
    await expect(page.locator('.ModalDataSelector .MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Somalia');
    await page.locator('.ModalDataSelector').getByLabel('Name').click();
    await page.locator('.ModalDataSelector').getByLabel('Name').click();
    await expect(page.locator('.ModalDataSelector .MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Dataset A0');

    // Select
    await page.locator('.ModalDataSelector .MuiDataGrid-row').nth(0).click();
    await expect(page.locator('.ModalDataSelector')).toBeHidden()
    await expect(page.locator('.ReferenceDatasetSection .MuiInputBase-input')).toHaveValue('Dataset A0')

    // Delete all
    await page.goto('/django-admin/geosight_reference_dataset/referencedataset/');
    await page.locator('#searchbar').fill('Dataset A');
    await page.getByText('Search').click();
    await page.locator('#action-toggle').click();
    await page.getByLabel('Action: \n  ---------\n\n  Delete selected reference datasets\n\n  Update meta\n\n  Syn').selectOption('delete_selected');
    await page.getByRole('button', { name: 'Go' }).click()
    await page.getByRole('button', { name: 'Yes, I’m sure' }).click()
  });
})