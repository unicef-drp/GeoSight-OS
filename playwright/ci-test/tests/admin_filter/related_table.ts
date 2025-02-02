import { expect, test } from '@playwright/test';

const _url = '/admin/related-table/'

test.describe('Test filter in related table admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  test('Test multiple filters', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Related Table Name' }).click();
    await page.getByRole('textbox', { name: 'Related Table Name' }).fill('rela');
    await page.getByRole('textbox', { name: 'Created At (from)' }).click();
    await page.getByRole('textbox', { name: 'Created At (from)' }).fill('2025-01-01');
    await page.getByRole('textbox', { name: 'Created At (to)' }).click();
    await page.getByRole('textbox', { name: 'Created At (to)' }).fill('2025-01-02');
    await page.getByRole('textbox', { name: 'Created By' }).click();
    await page.getByRole('textbox', { name: 'Created By' }).fill('admin');
    await page.getByRole('textbox', { name: 'Modified At (from)' }).click();
    await page.getByRole('textbox', { name: 'Modified At (from)' }).fill('2025-01-19');
    await page.getByRole('textbox', { name: 'Modified At (to)' }).click();
    await page.getByRole('textbox', { name: 'Modified At (to)' }).fill('2025-01-19');
    await page.getByRole('textbox', { name: 'Modified By' }).click();
    await page.getByRole('textbox', { name: 'Modified By' }).fill('creator');

    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Related Table 2');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);
  });

  test('Test created date', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Created At (from)' }).click();
    await page.getByRole('textbox', { name: 'Created At (from)' }).fill('2025-01-01');
    await page.getByRole('textbox', { name: 'Created At (to)' }).click();
    await page.getByRole('textbox', { name: 'Created At (to)' }).fill('2025-01-03');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Related Table 1');
    await expect(page.getByRole('grid')).toContainText('Related Table 2');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(2);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Created At (from)' }).click();
    await page.getByRole('textbox', { name: 'Created At (from)' }).fill('2025-01-02');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Related Table 1');
    await expect(page.getByRole('grid')).toContainText('Related Table 2');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(2);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Created At (to)' }).click();
    await page.getByRole('textbox', { name: 'Created At (to)' }).fill('2025-01-02');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Related Table 1');
    await expect(page.getByRole('grid')).toContainText('Related Table 2');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(2);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Created At (from)' }).click();
    await page.getByRole('textbox', { name: 'Created At (from)' }).fill('2025-01-04');
    await page.getByRole('textbox', { name: 'Created At (to)' }).click();
    await page.getByRole('textbox', { name: 'Created At (to)' }).fill('2025-01-04');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Related Table 3');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);
  });

  test('Test modified date', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Modified At (from)' }).fill('2025-01-19');
    await page.getByRole('textbox', { name: 'Modified At (to)' }).click();
    await page.getByRole('textbox', { name: 'Modified At (to)' }).fill('2025-01-19');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Related Table 1');
    await expect(page.getByRole('grid')).toContainText('Related Table 2');
    await expect(page.getByRole('grid')).toContainText('Related Table 3');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(3);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Modified At (from)' }).click();
    await page.getByRole('textbox', { name: 'Modified At (from)' }).fill('2025-01-01');
    await page.getByRole('textbox', { name: 'Modified At (to)' }).click();
    await page.getByRole('textbox', { name: 'Modified At (to)' }).fill('2025-01-01');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(0);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Modified At (to)' }).click();
    await page.getByRole('textbox', { name: 'Modified At (to)' }).fill('');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Related Table 1');
    await expect(page.getByRole('grid')).toContainText('Related Table 2');
    await expect(page.getByRole('grid')).toContainText('Related Table 3');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(3);
  });

})