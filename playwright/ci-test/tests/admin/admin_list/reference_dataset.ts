import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/basemap/'

test.describe('Reference dataset selector admin', () => {

  const duplicate = async (page, index) => {
    const name = `Dataset A${index}`
    // Create country
    await page.goto('/django-admin/geosight_georepo/entity/add/');
    await page.locator('#id_geom_id').fill(name);
    await page.locator('#id_name').fill(name);
    await page.locator('#id_admin_level').fill('0');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Create reference dataset
    await page.goto('/django-admin/geosight_reference_dataset/referencedataset/add/');
    await page.locator('#id_identifier').fill(name);
    await page.locator('#id_name').fill(name);
    await page.locator('#id_in_georepo').click();

    // Filter it
    const value = await page.locator('#id_countries_from option').filter(
      { hasText: name }
    ).first().getAttribute('value');
    await page.locator('#id_countries_from').selectOption({ value: value });
    await page.getByRole('link', { name: 'Choose', exact: true }).click();
    await expect(page.locator('#id_countries_to')).toContainText(name)
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.getByRole('button', { name: 'Save', exact: true }).click();
  }

  const testFunction = async (originalPage, page, resourceName = 'View') => {
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–12 of 12');

    // Check search
    await page.getByPlaceholder('Search ' + resourceName).fill('A2');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    // Search by new object
    await page.getByPlaceholder('Search ' + resourceName).fill('Dataset A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 10');


    // Check pagination();
    await page.getByPlaceholder('Search ' + resourceName).fill('');
    await page.getByLabel('25').click();
    await originalPage.getByRole('option', {
      name: '10',
      exact: true
    }).click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Dataset A0');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 12');
    await page.getByLabel('Go to next page').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Kenya');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('11–12 of 12');

    // Orders
    await page.getByLabel('Go to previous page').click();
    await page.getByLabel('Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Somalia');
    await page.getByLabel('Name').click();
    await page.getByLabel('Name').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Dataset A0');
  }

  test('Test selections', async ({ page }) => {
    // Create new data();
    for (let i = 0; i < 10; i++) {
      await duplicate(page, i)
    }

    // ----------------------------------
    // Test Single Selection
    // ----------------------------------
    await page.goto('/admin/importer/#Reference%20Layer%20&%20Time');
    await page.getByPlaceholder('Select View').click();
    await expect(page.locator('.ModalDataSelector')).toBeVisible()
    await testFunction(page, page.locator('.ModalDataSelector'))

    // Select
    await page.locator('.MuiDataGrid-row').nth(0).click();
    await expect(page.locator('.ModalDataSelector')).toBeHidden()
    await expect(page.getByPlaceholder('Select View')).toHaveValue('Dataset A0')
    await page.getByText('Specific Level').click();
    await page.locator('.SelectWithList').nth(1).click();
    await expect(page.getByRole('option', { name: 'ucode' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'concept_uuid' })).toBeVisible();

    // ----------------------------------
    // Test Filter Selection
    // ----------------------------------
    await page.goto('/admin/dataset/dataset');
    await page.locator('.FilterControl').nth(1).click();
    await expect(page.locator('.ModalDataSelector')).toBeVisible()
    await testFunction(page, page.locator('.ModalDataSelector'), 'Country')

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
    await expect(page.locator('.ModalDataSelector').locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 12');
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(0)).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(1)).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(2)).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'Unselect row' }).nth(3)).toBeHidden();

    // Select
    await page.locator('.ModalDataSelector').getByRole('button', { name: 'Update Selection' }).click()
    await expect(page.locator('.ModalDataSelector').locator('.ModalDataSelector')).toBeHidden()
    await expect(page.locator('.FilterControl').nth(1).locator('input')).toHaveValue('3 selected');

    // ----------------------------------
    // Delete all
    // ----------------------------------
    // Delete all entity
    await page.goto('/django-admin/geosight_georepo/entity/');
    await page.locator('#searchbar').fill('Dataset A');
    await page.getByText('Search').click();
    await page.locator('#action-toggle').click();
    await page.locator('select[name="action"]').selectOption('delete_selected');
    await page.getByRole('button', { name: 'Go' }).click()
    await page.getByRole('button', { name: 'Yes, I’m sure' }).click()

    // Delete all reference dataset
    await page.goto('/django-admin/geosight_reference_dataset/referencedataset/');
    await page.locator('#searchbar').fill('Dataset A');
    await page.getByText('Search').click();
    await page.locator('#action-toggle').click();
    await page.locator('select[name="action"]').selectOption('delete_selected');
    await page.getByRole('button', { name: 'Go' }).click()
    await page.getByRole('button', { name: 'Yes, I’m sure' }).click()
  });
})