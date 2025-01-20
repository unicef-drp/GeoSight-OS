import { expect, test } from '@playwright/test';

const _url = '/admin/basemap/'

test.describe('Test filter in basemap admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  test('Test multiple filters', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Basemap Name' }).click();
    await page.getByRole('textbox', { name: 'Basemap Name' }).fill('osm');
    await page.getByRole('textbox', { name: 'Description' }).click();
    await page.getByRole('textbox', { name: 'Description' }).fill('descr');
    await page.getByRole('textbox', { name: 'Category' }).click();
    await page.getByRole('textbox', { name: 'Category' }).fill('test');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('OSM');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Category' }).click();
    await page.getByRole('textbox', { name: 'Category' }).fill('');
    await page.getByRole('textbox', { name: 'Created By' }).fill('adm');
    await page.getByRole('textbox', { name: 'Modified By' }).fill('adm');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('OSM');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);
  });

  test('Test created date', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Created At (from)').fill('2025-01-16');
    await page.getByLabel('Created At (to)').click();
    await page.getByLabel('Created At (to)').fill('2025-01-16');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Test OSM');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Created At (from)').click();
    await page.getByLabel('Created At (from)').fill('2025-01-01');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Test OSM');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);
  });

  test('Test modified date', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Modified At (from)').fill('2025-01-19');
    await page.getByLabel('Modified At (to)').click();
    await page.getByLabel('Modified At (to)').fill('2025-01-19');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Mapbox Satellite');
    await expect(page.getByRole('grid')).toContainText('OSM');
    await expect(page.getByRole('grid')).toContainText('Test OSM');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(3);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Modified At (from)').click();
    await page.getByLabel('Modified At (from)').fill('2025-01-14');
    await page.getByLabel('Modified At (to)').click();
    await page.getByLabel('Modified At (to)').fill('2025-01-14');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Open Topo Map');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);
  });

})