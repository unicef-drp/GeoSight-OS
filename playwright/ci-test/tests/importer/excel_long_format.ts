import { expect, test } from '@playwright/test';
import { createIndicator, deleteIndicator } from "../utils/indicator"
import path from "path";

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('Test excel long format', () => {

  test('Test Indicator Value', async ({ page }) => {
    const indicatorName = 'Long format'
    // Create indicator
    const editUrl = await createIndicator(page, indicatorName)
    const parts = editUrl.split("/");
    const id = parts[parts.indexOf("indicator") + 1];

    // Import
    await page.goto('/admin/importer/#General');

    // ATTRIBUTES
    await page.getByText('Attributes').click();

    // File chooser
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('input[type="file"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, 'sample_data', 'long_format.xlsx'));

    // Select indicator
    await page.getByPlaceholder('Select Indicator').click();
    await page.getByRole('cell', { name: indicatorName }).click();

    // Select view
    await page.getByText('Reference Layer & Time').click();
    await page.getByPlaceholder('Select View').click();
    await page.getByRole('cell', { name: 'Kenya', exact: true }).click();
    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait process
    await expect(page.locator('.StatusSection .BoxText')).toContainText('Success', { timeout: 60000 });

    // Check data
    await page.getByRole('button', { name: 'See the data' }).click();
    await page.getByRole('button', { name: 'Select all 47 data.' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.MuiDataGrid-cell svg[data-testid="CheckIcon"]').nth(1)).toBeVisible();

    await page.goto('/admin/dataset/?indicators=' + id)
    await expect(page.locator('.MuiTablePagination-displayedRows')).toContainText('1–25 of 47')

    // Delete indicator
    await deleteIndicator(page, editUrl)
  });
})