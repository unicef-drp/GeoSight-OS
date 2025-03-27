import { expect, test } from '@playwright/test';
import { createIndicator, deleteIndicator } from "../utils/indicator"
import path from "path";

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('Test excel long format', () => {

  test('Test Indicator Value: Use default aggregation from indicator', async ({ page }) => {
    const indicatorName = 'Long format use default aggregation from indicator'
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
    await expect(page.locator('.StatusSection .BoxText')).toContainText('Success', { timeout: 60000 });

    // Check data
    await page.getByRole('button', { name: 'See the data' }).click();
    await page.getByRole('button', { name: 'Select all 48 data.' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.MuiDataGrid-cell svg[data-testid="CheckIcon"]').nth(1)).toBeVisible();

    await page.goto('/admin/dataset/?indicators=' + id)
    await delay(1000)
    await expect(page.locator('.AdminContentHeader-Left')).toContainText('Data Browser')
    await expect(page.locator('.MuiTablePagination-displayedRows')).toContainText('1–25 of 48')
    await page.locator('.FilterControl').nth(3).click();
    await page.locator('#react-select-2-input').fill('KEN_V1');
    await page.locator('#react-select-2-input').press('Enter');
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.locator('.ResourceRow').nth(0).locator('.MuiInputBase-input').nth(0)).toHaveValue('47')

    // Delete indicator
    await deleteIndicator(page, editUrl)
  });

  test('Test Indicator Value: Use custom aggregations', async ({ page }) => {
    const indicatorName = 'Long format use custom aggregations'
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
    await page.locator(`[data-id="${id}"]`).click();

    // Aggregations
    await delay(1000)
    await page.getByText('Aggregations', { exact: true }).click();
    await page.getByLabel('Aggregate up to level').click();
    await page.getByText('Use custom aggregations').click();
    await page.locator('.InputInLine > div > .MuiFormControl-root > .ReactSelect > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'SUM' }).click();

    // Select view
    await delay(1000)
    await page.getByText('Reference Layer & Time').click();
    await page.getByPlaceholder('Select View').click();
    await page.getByRole('cell', { name: 'Kenya', exact: true }).click();

    // Submit
    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait process
    await expect(page.locator('.StatusSection .BoxText')).toContainText('Success', { timeout: 60000 });

    // Check data
    await page.getByRole('button', { name: 'See the data' }).click();
    await page.getByRole('button', { name: 'Select all 48 data.' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.MuiDataGrid-cell svg[data-testid="CheckIcon"]').nth(1)).toBeVisible();

    await page.goto('/admin/dataset/?indicators=' + id)
    await delay(1000)
    await expect(page.locator('.AdminContentHeader-Left')).toContainText('Data Browser')
    await expect(page.locator('.MuiTablePagination-displayedRows')).toContainText('1–25 of 48')
    await page.locator('.FilterControl').nth(3).click();
    await page.locator('#react-select-2-input').fill('KEN_V1');
    await page.locator('#react-select-2-input').press('Enter');
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.locator('.ResourceRow').nth(0).locator('.MuiInputBase-input').nth(0)).toHaveValue('153')

    // Delete indicator
    await deleteIndicator(page, editUrl)
  });
})