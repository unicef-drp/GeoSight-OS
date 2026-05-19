import { expect, test } from '@playwright/test';


test.describe('Dataset list admin', () => {


  test('From dataset', async ({ page }) => {
    // Kenya data
    await page.goto('/admin/dataset/dataset');
    await page.getByRole('row', { name: 'Select row Kenya Indicator A Kenya 0,1 2025-01-01 2025-01-01' }).getByRole('link').click();
    await expect(page.getByRole('grid')).toContainText('1–25 of 49');
    await page.getByRole('button', { name: 'Go to next page' }).click();
    await expect(page.locator('.ResourceRow').nth(0).locator('.MuiDataGrid-cell').nth(4)).toContainText('KEN_0026_V1');
    await expect(page.locator('.ResourceRow').nth(0).locator('.MuiDataGrid-cell').nth(6).locator('input')).toHaveValue('4');

    await page.locator('.MuiDataGrid-virtualScroller').evaluate(el => el.scrollTo(0, el.scrollHeight));

    await expect(page.locator('.ResourceRow').nth(10).locator('.MuiDataGrid-cell').nth(4)).toContainText('KEN_V1');
    await expect(page.locator('.ResourceRow').nth(10).locator('.MuiDataGrid-cell').nth(6).locator('input')).toHaveValue('1');
    await expect(page.locator('.ResourceRow').nth(11).locator('.MuiDataGrid-cell').nth(4)).toContainText('KEN_V2');
    await expect(page.locator('.ResourceRow').nth(11).locator('.MuiDataGrid-cell').nth(6).locator('input')).toHaveValue('10');

    await page.goto('/admin/dataset/dataset');
    await page.getByRole('row', { name: 'Select row Sample Indicator A' }).getByRole('link').click();
    await expect(page.getByRole('grid')).toContainText('1–25 of 372');

    // Do a filter
    // Test filter by country
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('cell', { name: 'Somalia' }).click();
    await page.getByRole('cell', { name: 'KEN_V1', exact: true }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();
    await expect(page.getByRole('grid')).toContainText('0–0 of 0');
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('cell', { name: 'Somalia' }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();
    await expect(page.getByRole('grid')).toContainText('1–25 of 372');
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('button', { name: 'Clear selection' }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();
    await expect(page.getByRole('grid')).toContainText('1–25 of 372');

    // Try remove it
    await page.locator('.FilterControl').nth(2).click();
    await page.getByLabel('Remove 2').click();
    await page.getByLabel('Remove 1').click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('1–4 of 4');
  });

  test('From indicators', async ({ page }) => {
    await page.goto('/admin/indicators');
    await page.getByRole('row', { name: 'Select row Sample Indicator C' }).getByLabel('Browse data').click();
    await expect(page.getByRole('grid')).toContainText('93');
    await page.getByRole('link', { name: 'Browse data' }).click();
    await expect(page.getByRole('grid')).toContainText('1–25 of 93');
    await page.locator('.FilterControl').nth(2).click();
    await page.getByLabel('Remove 1').click();
    await page.getByLabel('Remove 2').click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('grid')).toContainText('1–1 of 1');
  });
})