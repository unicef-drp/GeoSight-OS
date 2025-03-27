import { expect, test } from '@playwright/test';
import { createIndicator, deleteIndicator } from "../utils/indicator"
import path from "path";

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('Test excel long format', () => {

  test('Test Indicator Value: Use latest value', async ({ page }) => {
    const indicatorName = 'Long format latest value'
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
    await fileChooser.setFiles(path.join(__dirname, 'sample_data', 'long_format_with_multiple_value.xlsx'));

    // Select indicator
    await page.getByPlaceholder('Select Indicator').click();
    await page.locator(`[data-id="${id}"]`).click();

    // Select view
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
    await expect(page.locator('.MuiTablePagination-displayedRows')).toContainText('1–25 of 47')
    await page.locator('.FilterControl').nth(3).click();
    await page.locator('#react-select-2-input').fill('KEN_0002_V1');
    await page.locator('#react-select-2-input').press('Enter');
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.locator('.ResourceRow').nth(0).locator('.MuiInputBase-input').nth(0)).toHaveValue('5')

    await page.goto('/admin/dataset/?indicators=' + id)
    await expect(page.locator('.MuiTablePagination-displayedRows')).toContainText('1–25 of 47')
    await page.locator('.FilterControl').nth(3).click();
    await page.locator('#react-select-2-input').fill('KEN_0001_V1');
    await page.locator('#react-select-2-input').press('Enter');
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.locator('.ResourceRow').nth(0).locator('.MuiInputBase-input').nth(0)).toHaveValue('2')

    // Delete indicator
    await deleteIndicator(page, editUrl)
  });

  test('Test Indicator Value: Use default aggregation from indicator', async ({ page }) => {
    const indicatorName = 'Long format multiple value use default aggregation from indicator'
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
    await fileChooser.setFiles(path.join(__dirname, 'sample_data', 'long_format_with_multiple_value.xlsx'));

    // Select indicator
    await page.getByPlaceholder('Select Indicator').click();
    await page.locator(`[data-id="${id}"]`).click();

    // Select view
    await page.getByText('Reference Layer & Time').click();
    await page.getByPlaceholder('Select View').click();
    await page.getByRole('cell', { name: 'Kenya', exact: true }).click();

    // Aggregations
    await page.getByText('Aggregations').click();
    await page.getByLabel('Aggregate', { exact: true }).click();

    // Submit
    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait process
    await expect(page.locator('.StatusSection .BoxText')).toContainText('Success', { timeout: 60000 });

    // Check data
    await page.getByRole('button', { name: 'See the data' }).click();
    await page.getByRole('button', { name: 'Select all 47 data.' }).click();
    await expect(page.locator('.MuiDataGrid-cellContent').getByText('COUNT of 2 records (from multiple values)')).toHaveCount(1)
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.MuiDataGrid-cell svg[data-testid="CheckIcon"]').nth(1)).toBeVisible();

    await page.goto('/admin/dataset/?indicators=' + id)
    await expect(page.locator('.MuiTablePagination-displayedRows')).toContainText('1–25 of 47')
    await page.locator('.FilterControl').nth(3).click();
    await page.locator('#react-select-2-input').fill('KEN_0002_V1');
    await page.locator('#react-select-2-input').press('Enter');
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.locator('.ResourceRow').nth(0).locator('.MuiInputBase-input').nth(0)).toHaveValue('1')

    await page.goto('/admin/dataset/?indicators=' + id)
    await expect(page.locator('.MuiTablePagination-displayedRows')).toContainText('1–25 of 47')
    await page.locator('.FilterControl').nth(3).click();
    await page.locator('#react-select-2-input').fill('KEN_0001_V1');
    await page.locator('#react-select-2-input').press('Enter');
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.locator('.ResourceRow').nth(0).locator('.MuiInputBase-input').nth(0)).toHaveValue('2')

    // Delete indicator
    await deleteIndicator(page, editUrl)
  });

  test('Test Indicator Value: Use custom aggregations', async ({ page }) => {
    const indicatorName = 'Long format multiple value use custom aggregations'
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
    await fileChooser.setFiles(path.join(__dirname, 'sample_data', 'long_format_with_multiple_value.xlsx'));

    // Select indicator
    await page.getByPlaceholder('Select Indicator').click();
    await page.locator(`[data-id="${id}"]`).click();

    // Aggregations
    await delay(1000)
    await page.getByText('Aggregations', { exact: true }).click();
    await page.getByLabel('Aggregate', { exact: true }).click();
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
    await page.getByRole('button', { name: 'Select all 47 data.' }).click();
    await expect(page.locator('.MuiDataGrid-cellContent').getByText('SUM of 2 records (from multiple values)')).toHaveCount(1)
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.MuiDataGrid-cell svg[data-testid="CheckIcon"]').nth(1)).toBeVisible();

    await page.goto('/admin/dataset/?indicators=' + id)
    await expect(page.locator('.MuiTablePagination-displayedRows')).toContainText('1–25 of 47')
    await page.locator('.FilterControl').nth(3).click();
    await page.locator('#react-select-2-input').fill('KEN_0002_V1');
    await page.locator('#react-select-2-input').press('Enter');
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.locator('.ResourceRow').nth(0).locator('.MuiInputBase-input').nth(0)).toHaveValue('5')

    await page.goto('/admin/dataset/?indicators=' + id)
    await expect(page.locator('.MuiTablePagination-displayedRows')).toContainText('1–25 of 47')
    await page.locator('.FilterControl').nth(3).click();
    await page.locator('#react-select-2-input').fill('KEN_0001_V1');
    await page.locator('#react-select-2-input').press('Enter');
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.locator('.ResourceRow').nth(0).locator('.MuiInputBase-input').nth(0)).toHaveValue('6')

    // Delete indicator
    await deleteIndicator(page, editUrl)
  });
})