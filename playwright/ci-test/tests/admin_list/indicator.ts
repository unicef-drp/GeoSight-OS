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
    await page.locator('#Form #id_shortcode').fill(`SOM_TEST_IND_A_A${index}`);
    await page.getByRole('button', { name: 'Save As' }).click();
  }

  test('Test list functions', async ({ page }) => {
    // Create new data();
    for (let i = 0; i < 10; i++) {
      await duplicate(page, i)
    }

    // Check list
    await page.goto(_url);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–14 of 14');

    // Check search
    await page.getByPlaceholder('Search Indicator').fill('B');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    // Search by new project
    await page.getByPlaceholder('Search Indicator').fill('Sample Indicator A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–11 of 11');

    // Check pagination();
    await page.getByPlaceholder('Search Indicator').fill('');
    await page.getByLabel('25').click();
    await page.getByRole('option', { name: '10', exact: true }).click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Sample Indicator A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 14');
    await page.getByLabel('Go to next page').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Sample Indicator A A9');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('11–14 of 14');

    // Orders
    await page.getByLabel('Go to previous page').click();
    await page.getByLabel('Indicator Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Sample Indicator D');
    await page.getByLabel('Indicator Name').click();
    await page.getByLabel('Indicator Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Sample Indicator A');

    // ------------------------------------------------------
    // DATA ACCESS FOR PUBLIC
    // ------------------------------------------------------
    await page.goto('/admin/dataset/data-access#generals')
    await expect(page.getByRole('grid').first()).toContainText('Sample Indicator A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–14 of 14');
    await expect(page.locator('.MuiDataGrid-row .MuiSelect-nativeInput').nth(0)).toHaveValue('None');

    // Orders
    await page.getByLabel('Indicator').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Sample Indicator D');

    // Filters
    await page.reload();
    await page.getByRole('textbox').first().click();
    await page.getByRole('cell', {
      name: 'Sample Indicator A',
      exact: true
    }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Sample Indicator A');

    // Change role per row
    await page.reload();
    await page.locator('.MuiDataGrid-row').nth(0).getByRole('combobox').click();
    await page.getByRole('option', { name: 'Read' }).click();
    await page.locator('.MuiDataGrid-row').nth(1).getByRole('combobox').click();
    await page.getByRole('option', { name: 'Read' }).click();
    await page.reload();
    await expect(page.locator('.MuiDataGrid-row .MuiSelect-nativeInput').nth(0)).toHaveValue('Read');
    await expect(page.locator('.MuiDataGrid-row .MuiSelect-nativeInput').nth(1)).toHaveValue('Read');

    // Change role in batch
    await page.locator('.MuiDataGrid-cellCheckbox').first().click();
    await page.locator('div:nth-child(2) > .MuiDataGrid-cellCheckbox').click();
    await page.locator('div:nth-child(3) > .MuiDataGrid-cellCheckbox').click();
    await page.getByRole('button', { name: 'Change permission' }).click();
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'None' }).click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await page.reload();
    await expect(page.locator('.MuiDataGrid-row .MuiSelect-nativeInput').nth(0)).toHaveValue('None');
    await expect(page.locator('.MuiDataGrid-row .MuiSelect-nativeInput').nth(1)).toHaveValue('None');
    await expect(page.locator('.MuiDataGrid-row .MuiSelect-nativeInput').nth(2)).toHaveValue('None');


    // ------------------------------------------------------
    // DELETE THE CREATED INDICATORS
    // ------------------------------------------------------
    await page.goto(_url);
    // Delete per row
    await page.getByPlaceholder('Search Indicator').fill('Sample Indicator A A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');
    await page.locator('.MuiDataGrid-row').nth(0).getByTestId('MoreVertIcon').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure you want to delete : Sample Indicator A A0?');
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
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–4 of 4');
  })
})