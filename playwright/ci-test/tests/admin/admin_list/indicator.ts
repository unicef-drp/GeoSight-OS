import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/indicators/'

test.describe('Indicator list admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  const duplicate = async (page, index) => {
    await page.goto('/admin/indicators/318/edit#General');
    await page.locator('#Form #id_name').fill(`Sample Indicator A A${index}`);
    await page.locator('#Form #id_description').fill(`Sample_Indicator_A_A${index}`);
    await page.locator('#Form #id_shortcode').fill(`SOM_TEST_IND_A_A${index}`);
    await page.getByRole('button', { name: 'Save As' }).click();
  }

  const testFunction = async (originalPage, page) => {
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–15 of 15');

    // Check search
    await page.getByPlaceholder('Search Indicator').fill('B');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    // Search by new project
    await page.getByPlaceholder('Search Indicator').fill('Sample Indicator A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–11 of 11');
    await page.getByPlaceholder('Search Indicator').fill('Sample_Indicator_A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');
    await page.getByPlaceholder('Search Indicator').fill('SOM_TEST_IND_A_A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');

    // Check pagination();
    await page.getByPlaceholder('Search Indicator').fill('');
    await page.getByLabel('25').click();
    await originalPage.getByRole('option', {
      name: '10',
      exact: true
    }).click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Kenya Indicator A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 15');
    await page.getByLabel('Go to next page').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Sample Indicator A A8');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('11–15 of 15');

    // Orders
    await page.getByLabel('Go to previous page').click();
    await page.getByLabel('Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Sample Indicator D');
    await page.getByLabel('Name').click();
    await page.getByLabel('Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Kenya Indicator A');
  }

  test('Test list functions', async ({ page }) => {
    // Create new data();
    for (let i = 0; i < 10; i++) {
      await duplicate(page, i)
    }

    // ----------------------------------
    // Check list admin
    // ----------------------------------
    await page.goto(_url);
    await testFunction(page, page)

    // ----------------------------------
    // Test Single Selection
    // ----------------------------------
    await page.goto('/admin/importer/#Attributes');
    await page.locator('.IndicatorSetting .InputControl').click()
    await expect(page.locator('.ModalDataSelector')).toBeVisible()
    await testFunction(page, page.locator('.ModalDataSelector'))

    // Select
    await page.locator('.MuiDataGrid-row').nth(2).click();
    await expect(page.locator('.ModalDataSelector')).toBeHidden()
    await expect(page.locator('.IndicatorSetting .InputControl .MuiInputBase-input')).toHaveValue('Sample Indicator A A0')

    // ----------------------------------
    // Test Filter Selection
    // ----------------------------------
    await page.goto('/admin/dataset/dataset');
    await page.locator('.FilterControl').nth(0).click();
    await expect(page.locator('.ModalDataSelector')).toBeVisible()
    await testFunction(page, page.locator('.ModalDataSelector'))
    await page.getByPlaceholder('Search Indicator').fill('SOM_TEST_IND_A_A');
    await expect(page.locator('.ModalDataSelector').locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');
    await page.getByPlaceholder('Search Indicator').fill('');
    await expect(page.locator('.ModalDataSelector').locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 15');

    // Check Show Selected
    await delay(500)
    await page.locator('.ModalDataSelector').locator('.MuiDataGrid-row').nth(0).click();
    await page.locator('.ModalDataSelector').locator('.MuiDataGrid-row').nth(1).click();
    await page.locator('.ModalDataSelector').locator('.MuiDataGrid-row').nth(2).click();
    await page.locator('.ModalDataSelector').locator('.MuiDataGrid-row').nth(3).click();
    await page.locator('.ModalDataSelector').getByRole('button', { name: 'Show selected' }).click();
    await expect(page.locator('.ModalDataSelector').locator('.MuiTablePagination-displayedRows').first()).toContainText('1–4 of 4');
    await page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(2).click();
    await expect(page.locator('.ModalDataSelector').locator('.MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');
    await page.locator('.ModalDataSelector').getByRole('button', { name: 'Show selected' }).click();
    await expect(page.locator('.ModalDataSelector').locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 15');
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(0)).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(1)).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(2)).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(3)).toBeHidden();

    // Select
    await page.locator('.ModalDataSelector').getByRole('button', { name: 'Update Selection' }).click()
    await expect(page.locator('.ModalDataSelector').locator('.ModalDataSelector')).toBeHidden()
    await expect(page.locator('.FilterControl').nth(0).locator('input')).toHaveValue('3 selected');

    // ----------------------------------
    // Test Project Selection
    // ----------------------------------
    await page.goto('/admin/project/create');
    await page.locator('.DashboardFormHeader').getByText('Indicators').click();
    await page.getByRole('button', { name: 'Add Indicator' }).click();
    await expect(page.locator('.ModalDataSelector')).toBeVisible()
    await testFunction(page, page.locator('.ModalDataSelector'))

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
    await expect(page.locator('.ModalDataSelector').locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 15');
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(0)).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(1)).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(2)).toBeHidden();

    // Select
    await page.locator('.ModalDataSelector').getByRole('button', { name: 'Update Selection' }).click()
    await expect(page.locator('.ModalDataSelector').locator('.ModalDataSelector')).toBeHidden()
    await expect(page.getByText('Kenya Indicator A').first()).toBeVisible();
    await expect(page.getByText('Sample Indicator A').first()).toBeVisible();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');

    // ------------------------------------------------------
    // DELETE THE CREATED INDICATORS
    // ------------------------------------------------------
    await page.goto(_url);
    // Delete per row
    await page.getByPlaceholder('Search Indicator').fill('Sample Indicator A A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');
    await page.locator('.MuiDataGrid-row').nth(0).getByTestId('MoreVertIcon').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete Sample Indicator A A0?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–9 of 9');

    // Delete all
    await page.getByLabel('Select all rows').check();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete 9 indicators?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');

    // Reload
    await page.reload();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–5 of 5');
  })
})