import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/dataset/data-access#groups'

test.describe('Data access groups admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });
  test('Test list functions', async ({ page }) => {

    await expect(page.getByRole('button', { name: 'Share to groups' })).toBeVisible();
    await page.getByRole('button', { name: 'Share to groups' }).click();

    // Indicators
    await page.getByRole('textbox').first().click();
    await page.getByRole('cell', {
      name: 'Sample Indicator A',
      exact: true
    }).click();
    await page.getByRole('cell', {
      name: 'Sample Indicator B',
      exact: true
    }).click();
    await page.getByRole('cell', {
      name: 'Sample Indicator C',
      exact: true
    }).first().click();
    await page.getByRole('cell', {
      name: 'Sample Indicator D',
      exact: true
    }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();

    // Dataset
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('cell', { name: 'Somalia', exact: true }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();

    // Groups
    await page.getByRole('textbox').nth(2).click();
    await page.getByRole('cell', { name: 'Group 1', exact: true }).click();
    await page.getByRole('cell', { name: 'Group 2', exact: true }).click();
    await page.getByRole('cell', { name: 'unicef', exact: true }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();

    // Apply changes
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await expect(page.getByRole('grid').first()).toContainText('Sample Indicator A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–12 of 12');
    await expect(page.locator('.MuiDataGrid-row .MuiSelect-nativeInput').nth(0)).toHaveValue('Read');

    // Check pagination();
    await page.getByLabel('25').click();
    await page.getByRole('option', { name: '10', exact: true }).click();
    await expect(page.getByRole('grid').first()).toContainText('Sample Indicator A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 12');
    await page.getByLabel('Go to next page').click();
    await expect(page.getByRole('grid').first()).toContainText('Sample Indicator D');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('11–12 of 12');

    // Orders
    await page.reload();
    await page.getByLabel('Indicator').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Sample Indicator D');
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(3)).toContainText('unicef');
    await page.getByLabel('Group').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(3)).toContainText('Group 1');

    // Filters
    await page.reload();
    await page.getByRole('textbox').first().click();
    await page.getByRole('cell', { name: 'Group 2', exact: true }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–4 of 4');
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(3)).toContainText('Group 2');
    await page.getByRole('textbox').nth(1).click();
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
    await page.getByRole('option', { name: 'None' }).click();
    await page.locator('.MuiDataGrid-row').nth(1).getByRole('combobox').click();
    await page.getByRole('option', { name: 'None' }).click();
    await page.reload();
    await expect(page.locator('.MuiDataGrid-row .MuiSelect-nativeInput').nth(0)).toHaveValue('None');
    await expect(page.locator('.MuiDataGrid-row .MuiSelect-nativeInput').nth(1)).toHaveValue('None');

    // Change role in batch
    await page.locator('.MuiDataGrid-cellCheckbox').first().click();
    await page.locator('div:nth-child(2) > .MuiDataGrid-cellCheckbox').click();
    await page.locator('div:nth-child(3) > .MuiDataGrid-cellCheckbox').click();
    await page.getByRole('button', { name: 'Change permission' }).click();
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Write' }).click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await page.reload();
    await expect(page.locator('.MuiDataGrid-row .MuiSelect-nativeInput').nth(0)).toHaveValue('Write');
    await expect(page.locator('.MuiDataGrid-row .MuiSelect-nativeInput').nth(1)).toHaveValue('Write');
    await expect(page.locator('.MuiDataGrid-row .MuiSelect-nativeInput').nth(2)).toHaveValue('Write');

    // Delete per row
    await page.locator('.MuiDataGrid-row').nth(0).getByTestId('MoreVertIcon').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete 1 group data access?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–11 of 11');

    // Delete batch
    await page.locator('.MuiDataGrid-cellCheckbox').first().click();
    await page.locator('div:nth-child(2) > .MuiDataGrid-cellCheckbox').click();
    await page.locator('div:nth-child(3) > .MuiDataGrid-cellCheckbox').click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete 3 group data accesses?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–8 of 8');

    // Delete all
    await page.getByLabel('Select all rows').check();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete 8 group data accesses?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');
  });
})