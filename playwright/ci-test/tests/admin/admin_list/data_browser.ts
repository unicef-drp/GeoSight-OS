import { expect, test } from '@playwright/test';


test.describe('Dataset list admin', () => {


  test('From dataset', async ({ page }) => {
    await page.goto('/admin/dataset/dataset');
    await page.getByRole('row', { name: 'Select row Sample Indicator A' }).getByRole('link').click();
    await expect(page.getByRole('grid')).toContainText('1–25 of 372');

    // Do a filter
    // Test filter by country
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('cell', { name: 'Somalia' }).click();
    await page.getByRole('cell', { name: 'Kenya' }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();
    await expect(page.getByRole('grid')).toContainText('0–0 of 0');
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('cell', { name: 'Somalia' }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();
    await expect(page.getByRole('grid')).toContainText('1–25 of 372');
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('button', { name: 'Clear selection.' }).click();
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