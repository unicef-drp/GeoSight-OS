import { expect, test } from '@playwright/test';

const _url = '/admin/style/'

test.describe('Test filter in style admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  test('Test multiple filters', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Style Name' }).click();
    await page.getByRole('textbox', { name: 'Style Name' }).fill('sty');
    await page.getByRole('textbox', { name: 'Style Name' }).press('Tab');
    await page.getByRole('textbox', { name: 'Description' }).fill('desc');
    await page.getByRole('textbox', { name: 'Description' }).press('Tab');
    await page.getByRole('textbox', { name: 'Category' }).fill('gr');
    await page.getByRole('textbox', { name: 'Category' }).press('Tab');
    await page.getByRole('textbox', { name: 'Style type' }).fill('quan');
    await page.getByRole('textbox', { name: 'Created By' }).click();
    await page.getByRole('textbox', { name: 'Created By' }).fill('dmi');
    await page.getByRole('textbox', { name: 'Modified By' }).click();
    await page.getByRole('textbox', { name: 'Modified By' }).fill('ato');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Style_1');
    await expect(page.getByRole('grid')).toContainText('Style_2');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(2);
  });

  test('Test created date', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Created At (from)').fill('2025-01-01');
    await page.getByLabel('Created At (to)').click();
    await page.getByLabel('Created At (to)').fill('2025-01-31');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Style_1');
    await expect(page.getByRole('grid')).toContainText('Style_4');
    await expect(page.getByRole('grid')).toContainText('Test 0');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(3);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Created At (from)').click();
    await page.getByLabel('Created At (from)').fill('2025-01-01');
    await page.getByLabel('Created At (to)').click();
    await page.getByLabel('Created At (to)').fill('2025-01-01');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Test 0');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);
  });

  test('Test modified date', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Modified At (from)').fill('2025-01-01');
    await page.getByLabel('Modified At (to)').click();
    await page.getByLabel('Modified At (to)').fill('2025-01-10');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Style_1');
    await expect(page.getByRole('grid')).toContainText('Style_2');
    await expect(page.getByRole('grid')).toContainText('Style_3');
    await expect(page.getByRole('grid')).toContainText('Style_4');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(4);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Modified At (from)').click();
    await page.getByLabel('Modified At (from)').fill('2025-01-05');
    await page.getByLabel('Modified At (to)').click();
    await page.getByLabel('Modified At (to)').fill('2025-01-05');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Style_4');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);
  });

})