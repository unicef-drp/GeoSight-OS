import { expect, test } from '@playwright/test';
import { BASE_URL } from "../../variables";

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/project/'

test.describe('Dashboard list admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  // A use case tests scenarios
  test('Duplicate project', async ({ page }) => {
    // --------------------------------------------------------------
    // CREATE PROJECT WITH OVERRIDE CONFIG
    // --------------------------------------------------------------
    await page.locator('.MuiButtonBase-root[data-id="demo-geosight-project"]').click();
    await page.getByRole('menuitem', { name: 'Duplicate' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.getByRole('link', {
      name: 'Demo GeoSight Project 1',
      exact: true
    }).click();

    const editUrl = `${BASE_URL}/admin/project/demo-geosight-project-1/edit`
    await page.waitForURL(editUrl)
    await expect(page.getByPlaceholder('Example: Afghanistan Risk')).toHaveValue('Demo GeoSight Project 1');

    // --------------------------------------------------------------
    // CHECK PREVIEW
    // --------------------------------------------------------------
    await page.getByRole('button', { name: 'Live Preview' }).click();
    const layer1 = 'Sample Indicator A'
    const layer2 = 'Sample Indicator B'
    await expect(page.getByLabel(layer1)).toBeVisible();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
    await expect(page.getByLabel(layer1)).toBeChecked();
    await expect(page.getByLabel(layer2)).not.toBeChecked();

    // ------------------------------------
    // DELETE PROJECT
    // ------------------------------------
    await page.goto(editUrl);
    await page.locator('.MoreActionIcon').click();
    await page.locator('.MuiMenu-root .MuiButtonBase-root .error').click();
    await expect(page.locator('.modal--content ')).toContainText(`Are you sure want to delete Demo GeoSight Project 1?`);
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForURL(`${BASE_URL}/admin/project/`);
    await expect(page.getByText('Create New Project')).toBeVisible();
    await expect(page.getByText('Demo GeoSight Project 1')).toBeHidden();
  });

  const duplicate = async (page, text) => {
    // Duplicate
    await page.locator('.MuiDataGrid-row').nth(0).locator('.MoreActionIcon').click();
    await page.getByText('Duplicate').click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText(text);
  }

  test('Test list functions', async ({ page }) => {

    // Check search
    await page.getByPlaceholder('Search Project').fill('Demo GeoSight Project');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    // Duplicate
    await page.locator('.MuiDataGrid-row').nth(0).getByLabel('More').click();
    await page.getByText('Duplicate').click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');

    // Search by new project
    await page.getByPlaceholder('Search Project').fill('Demo GeoSight Project 1');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    // Duplicate
    await duplicate(page, '1–2 of 2')
    await duplicate(page, '1–3 of 3')
    await duplicate(page, '1–4 of 4')
    await duplicate(page, '1–5 of 5')
    await duplicate(page, '1–6 of 6')
    await duplicate(page, '1–7 of 7')
    await duplicate(page, '1–8 of 8')
    await duplicate(page, '1–9 of 9')
    await duplicate(page, '1–10 of 10')
    await duplicate(page, '1–11 of 11')
    await duplicate(page, '1–12 of 12')

    // Check Show Selected
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
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–12 of 12');
    await expect(page.getByRole('cell', { name: 'Unselect row' }).nth(0)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Unselect row' }).nth(1)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Unselect row' }).nth(2)).toBeHidden();

    // Check pagination();
    await page.reload();
    await page.getByPlaceholder('Search Project').fill('Demo GeoSight Project 1');
    await page.getByLabel('25').click();
    await page.getByRole('option', { name: '10', exact: true }).click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Demo GeoSight Project');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 12');
    await page.getByLabel('Go to next page').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Demo GeoSight Project 1');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('11–12 of 12');

    // Orders
    await page.getByLabel('Project Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Demo GeoSight Project 1 1');
    await page.getByLabel('Project Name').click();
    await page.getByLabel('Project Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Demo GeoSight Project 1 8');

    // Delete batch
    await page.locator('.MuiDataGrid-cellCheckbox').first().click();
    await page.locator('div:nth-child(2) > .MuiDataGrid-cellCheckbox').click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete 2 projects?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');

    // Delete all
    await page.getByLabel('Select all rows').check();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete 10 projects?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');
  });
})