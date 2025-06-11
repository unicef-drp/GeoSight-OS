import { expect, test } from '@playwright/test';
import path from "path";

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('Test excel wide format', () => {

  test('Test Related Table', async ({ page }) => {
    const name = 'Wide format'
    // Import
    await page.goto('/admin/importer/#General');

    // General
    await page.locator('#Form').getByText('Related Tables').click();
    await page.getByLabel('Excel Wide Format').check();

    // ATTRIBUTES
    await page.getByText('Attributes').click();

    // File chooser
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('input[type="file"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, 'sample_data', 'long_format.xlsx'));

    // Name RT
    await page.locator('div').filter({ hasText: /^Related table name$/ }).getByRole('textbox').fill(name);

    // Submit
    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait process
    await expect(page.locator('.StatusSection .BoxText')).toContainText('Success', { timeout: 60000 });

    // Check data
    await page.getByRole('button', { name: 'See the data' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows')).toContainText('1–47 of 47')

    // Check on RT level
    await page.locator('.SideNavigation').getByRole('link', { name: 'Related Tables' }).click();
    await page.getByPlaceholder('Search Related Table').fill('Wide format');
    await expect(page.getByRole('grid')).toContainText('1–1 of 1');
    await page.getByLabel('Browse data').click();
    await expect(page.locator('.MuiTablePagination-displayedRows')).toContainText('1–47 of 47')

    // Delete RT
    await page.locator('.SideNavigation').getByRole('link', { name: 'Related Tables' }).click();
    await page.getByPlaceholder('Search Related Table').fill(name);
    await expect(page.getByRole('grid')).toContainText('1–1 of 1');
    await page.getByLabel('More').click();
    await page.getByRole('menuitem', { name: 'Delete' }).locator('div').click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByRole('grid')).toContainText('0–0 of 0');
  });
})