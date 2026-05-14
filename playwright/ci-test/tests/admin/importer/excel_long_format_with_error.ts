import { expect, test } from '@playwright/test';
import { createIndicator, deleteIndicator } from "../../utils/indicator"
import path from "path";

const fs = require('fs');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('Test excel long format with error data', () => {

  test('Test Indicator Value: Error data', async ({ page }) => {
    const indicatorName = 'Long format with error data'
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
    await fileChooser.setFiles(path.join(__dirname, 'sample_data', 'long_format_with_non_exist.xlsx'));

    // Select indicator
    await page.getByPlaceholder('Select Indicator').click();
    await page.locator(`[data-id="${id}"]`).click();

    // Select view
    await page.getByText('Reference Layer & Time').click();
    await page.getByPlaceholder('Select View').click();
    await page.getByRole('cell', { name: 'Kenya', exact: true }).click();

    // Aggregations
    await page.getByText('Aggregations').click();
    await page.getByLabel('Aggregate up to level').click();

    // Submit
    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait process
    await expect(page.locator('.StatusSection .BoxText')).toContainText('Failed', { timeout: 60000 });

    // Check data
    await page.getByRole('button', { name: 'See the data' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows')).toHaveText("1–1 of 1");
    await expect(page.locator('.ResourceRow').first().locator('.MuiDataGrid-cell').nth(4)).toHaveClass("CellError MuiDataGrid-cell--withRenderer MuiDataGrid-cell MuiDataGrid-cell--textLeft");

    // Delete indicator
    await deleteIndicator(page, editUrl)
  });
})