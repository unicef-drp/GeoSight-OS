import { expect, test } from '@playwright/test';

const _url = '/admin/indicators/'

class AdminListPage {
  constructor(page: any) {
    this.page = page;
    this.dataGridRow = this.page.locator('.MuiDataGrid-row');
  }
}

test.describe('Test filter in indicator admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  test('Test multiple filters', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByRole('textbox', { name: 'Name' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill('ample');
    await page.getByRole('textbox', { name: 'Shortcode' }).click();
    await page.getByRole('textbox', { name: 'Shortcode' }).fill('ind');
    await page.getByRole('textbox', { name: 'Category' }).click();
    await page.getByRole('textbox', { name: 'Category' }).fill('oup');
    await page.getByRole('textbox', { name: 'Created By' }).click();
    await page.getByRole('textbox', { name: 'Created By' }).fill('admin');
    await page.getByRole('textbox', { name: 'Modified By' }).click();
    await page.getByRole('textbox', { name: 'Modified By' }).fill('eat');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Sample Indicator B');
    await expect(page.getByRole('grid')).toContainText('Sample Indicator C');
    await expect(page.getByRole('grid')).toContainText('Sample Indicator D');

    const dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(3);
  });

  test('Test created date', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Created At (from)').fill('2025-01-01');
    await page.getByLabel('Created At (to)').click();
    await page.getByLabel('Created At (to)').fill('2025-01-20');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Sample Indicator A A0');
    await expect(page.getByRole('grid')).toContainText('Sample Indicator A A1');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(2);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Created At (from)').click();
    await page.getByLabel('Created At (from)').fill('2025-01-19');
    await page.getByLabel('Created At (from)').click();
    await page.getByLabel('Created At (from)').fill('');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Sample Indicator A A0');
    await expect(page.getByRole('grid')).toContainText('Sample Indicator A A1');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(2);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Created At (from)').click();
    await page.getByLabel('Created At (from)').fill('2023-07-27');
    await page.getByLabel('Created At (from)').click();
    await page.getByLabel('Created At (from)').fill('2023-07-27');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Sample Indicator C');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);
  });

  test('Test modified date', async ({ page }) => {
    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Modified At (from)').fill('2025-01-11');
    await page.getByLabel('Modified At (to)').click();
    await page.getByLabel('Modified At (to)').fill('2025-01-15');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Sample Indicator A');
    let dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.getByLabel('Modified At (from)').click();
    await page.getByLabel('Modified At (from)').fill('2025-01-14');
    await page.getByLabel('Modified At (to)').click();
    await page.getByLabel('Modified At (to)').fill('2025-01-14');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('Sample Indicator A');
    dataGridRow = page.locator('.MuiDataGrid-row');
    await expect(dataGridRow).toHaveCount(1);
  });

})