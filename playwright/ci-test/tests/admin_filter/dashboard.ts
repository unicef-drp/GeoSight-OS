import { expect, test } from '@playwright/test';

const _url = '/admin/project/'

test.describe('Test filter in project admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  test('Test multiple filters', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Project Name' }).click();
    await page.getByRole('textbox', { name: 'Project Name' }).fill('shbo');
    await page.getByRole('textbox', { name: 'Description' }).click();
    await page.getByRole('textbox', { name: 'Description' }).fill('escr');
    await page.getByRole('textbox', { name: 'Category' }).click();
    await page.getByRole('textbox', { name: 'Category' }).fill('omali');
    await page.getByRole('textbox', { name: 'Created By' }).click();
    await page.getByRole('textbox', { name: 'Created By' }).fill('admin');
    await page.getByRole('textbox', { name: 'Created At (from)' }).click();
    await page.getByRole('textbox', { name: 'Created At (from)' }).fill('2025-01-01');
    await page.getByRole('textbox', { name: 'Created At (to)' }).click();
    await page.getByRole('textbox', { name: 'Created At (to)' }).fill('2025-01-01');
    await page.getByRole('textbox', { name: 'Modified At (from)' }).click();
    await page.getByRole('textbox', { name: 'Modified At (from)' }).fill('2025-01-02');
    await page.getByRole('textbox', { name: 'Modified At (to)' }).click();
    await page.getByRole('textbox', { name: 'Modified At (to)' }).fill('2025-01-02');
    await page.getByRole('textbox', { name: 'Modified By' }).click();
    await page.getByRole('textbox', { name: 'Modified By' }).fill('admin');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Dashboard B');
    const dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);
  });

  test('Test created date', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Created At (from)').fill('2025-01-01');
    await page.getByLabel('Created At (to)').click();
    await page.getByLabel('Created At (to)').fill('2025-01-10');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Dashboard B');
    await expect(page.getByRole('grid')).toContainText('Dashboard C');
    await expect(page.getByRole('grid')).toContainText('Dashboard D');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(3);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Created At (from)').click();
    await page.getByLabel('Created At (from)').fill('2025-01-05');
    await page.getByLabel('Created At (to)').click();
    await page.getByLabel('Created At (to)').fill('');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Dashboard D');
    await expect(page.getByRole('grid')).toContainText('Dashboard A');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(2);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Created At (from)').click();
    await page.getByLabel('Created At (from)').fill('');
    await page.getByLabel('Created At (to)').click();
    await page.getByLabel('Created At (to)').fill('2025-01-02');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Dashboard B');
    await expect(page.getByRole('grid')).toContainText('Dashboard C');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(2);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Created At (from)').click();
    await page.getByLabel('Created At (from)').fill('2025-01-02');
    await page.getByLabel('Created At (to)').click();
    await page.getByLabel('Created At (to)').fill('2025-01-02');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Dashboard C');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);
  });

  test('Test modified date', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Modified At (from)').click();
    await page.getByLabel('Modified At (from)').fill('2025-01-01');
    await page.getByLabel('Modified At (to)').click();
    await page.getByLabel('Modified At (to)').fill('2025-01-10');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Dashboard B');
    await expect(page.getByRole('grid')).toContainText('Dashboard C');
    await expect(page.getByRole('grid')).toContainText('Dashboard D');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(3);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Modified At (from)').click();
    await page.getByLabel('Modified At (from)').fill('2025-01-05');
    await page.getByLabel('Modified At (to)').click();
    await page.getByLabel('Modified At (to)').fill('');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Dashboard A');
    await expect(page.getByRole('grid')).toContainText('Dashboard D');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(2);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Modified At (from)').click();
    await page.getByLabel('Modified At (from)').fill('');
    await page.getByLabel('Modified At (to)').click();
    await page.getByLabel('Modified At (to)').fill('2025-01-02');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Dashboard B');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Modified At (from)').click();
    await page.getByLabel('Modified At (from)').fill('2025-01-03');
    await page.getByLabel('Modified At (to)').click();
    await page.getByLabel('Modified At (to)').fill('2025-01-03');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Dashboard C');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);
  });

  test('Test filters persist', async ({ page }) => {
    await page.getByRole('button', { name: 'Sort' }).click();
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Category' }).click();
    await page.getByRole('textbox', { name: 'Category' }).fill('afr');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await page.getByRole('button', { name: 'Create New Project' }).click();
    await page.getByRole('link', { name: 'Projects' }).click();
    await expect(page.locator('.MuiDataGrid-row')).toHaveCount(2);
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Dashboard D');
    await expect(page.locator('.MuiDataGrid-row').nth(1).locator('.MuiDataGrid-cell').nth(1)).toContainText('Dashboard C');
  });

})