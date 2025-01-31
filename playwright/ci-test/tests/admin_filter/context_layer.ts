import { expect, test } from '@playwright/test';

const _url = '/admin/context-layer/'

test.describe('Test filter in context layer admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  test('Test multiple filters', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Context Layer Name' }).click();
    await page.getByRole('textbox', { name: 'Context Layer Name' }).fill('lay');
    await page.getByRole('textbox', { name: 'Description' }).click();
    await page.getByRole('textbox', { name: 'Description' }).fill('desc');
    await page.getByRole('textbox', { name: 'Category' }).click();
    await page.getByRole('textbox', { name: 'Category' }).fill('test');
    await page.getByRole('textbox', { name: 'Layer type' }).click();
    await page.getByRole('textbox', { name: 'Layer type' }).fill('geo');
    await page.getByRole('textbox', { name: 'Created By' }).click();
    await page.getByRole('textbox', { name: 'Created By' }).fill('admin');
    await page.getByRole('textbox', { name: 'Modified By' }).click();
    await page.getByRole('textbox', { name: 'Modified By' }).fill('creator');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Context Layer A1');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Layer type' }).click();
    await page.getByRole('textbox', { name: 'Layer type' }).press('ControlOrMeta+a');
    await page.getByRole('textbox', { name: 'Layer type' }).fill('');
    await page.getByRole('textbox', { name: 'Modified By' }).dblclick();
    await page.getByRole('textbox', { name: 'Modified By' }).fill('admin');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Context Layer A3');
    await expect(page.getByRole('grid')).toContainText('Context Layer A4');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(2);
  });

  test('Test created date', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Created At (from)').click();
    await page.getByLabel('Created At (from)').fill('2025-01-01');
    await page.getByLabel('Created At (to)').click();
    await page.getByLabel('Created At (to)').fill('2025-01-02');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Context Layer A0');
    await expect(page.getByRole('grid')).toContainText('Context Layer A2');
    await expect(page.getByRole('grid')).toContainText('Context Layer A3');
    await expect(page.getByRole('grid')).toContainText('Context Layer A4');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(4);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Created At (to)').click();
    await page.getByLabel('Created At (from)').click();
    await page.getByLabel('Created At (from)').fill('2025-01-02');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Context Layer A4');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);
  });

  test('Test modified date', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Created At (from)').click();
    await page.getByLabel('Modified At (from)').fill('2025-01-03');
    await page.getByLabel('Modified At (to)').click();
    await page.getByLabel('Modified At (to)').fill('2025-01-05');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Context Layer A3');
    await expect(page.getByRole('grid')).toContainText('Context Layer A4');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(2);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Modified At (to)').click();
    await page.getByLabel('Modified At (to)').fill('2025-01-03');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Context Layer A3');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);
  });

  test('Test filters persist', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Modified By' }).click();
    await page.getByRole('textbox', { name: 'Modified By' }).fill('creat');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await page.getByRole('button', { name: 'Sort' }).click();
    await page.getByRole('button', { name: 'Create New Context Layer' }).click();
    await page.getByRole('link', { name: 'Context Layers' }).nth(1).click();
    await expect(page.locator('.MuiDataGrid-row')).toHaveCount(3);
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Context Layer A2');
    await expect(page.locator('.MuiDataGrid-row').nth(1).locator('.MuiDataGrid-cell').nth(1)).toContainText('Context Layer A1');
    await expect(page.locator('.MuiDataGrid-row').nth(2).locator('.MuiDataGrid-cell').nth(1)).toContainText('Context Layer A0');
  });

})