import { expect, test } from '@playwright/test';
import { deleteProject, saveAsProject } from "../../utils/project";

test.describe('SDMX Indicator Layer', () => {
  test('SDMX Indicator Layer', async ({ page }, testInfo) => {
    // --------------------------------------------------------------------
    // Create project
    // --------------------------------------------------------------------
    const name = 'Demo GeoSight Project SDMX Indicator Layer'

    // --------------------------------------------------------------------
    // Delete default project
    // --------------------------------------------------------------------
    await deleteProject(page, name)
    await saveAsProject(page, 'Demo GeoSight Project', name)

    // Add SDMX indicator layer
    await page.getByText('Indicator Layers (10)').click();
    await page.getByRole('button', { name: 'Add Indicator Layer' }).click();
    await page.getByText('SDMX Indicators LayerCreate').click();

    // Select SDMX Config
    await page.locator('.BasicFormSection > .MuiFormControl-root > .ReactSelect > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'Example SDMX [1]' }).click();

    // Select Agency
    await page.locator('section:nth-child(4) > .MuiFormControl-root > .ReactSelect > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'Example Kenya Country Office' }).click();
    await page.locator('section:nth-child(5) > .MuiFormControl-root > .ReactSelect > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').click();
    await expect(page.getByText('No options', { exact: true })).toBeVisible();

    await page.locator('section:nth-child(4) > .MuiFormControl-root > .ReactSelect > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'Example Somalia Country' }).click();

    // Select Dataflow
    await page.locator('section:nth-child(5) > .MuiFormControl-root > .ReactSelect > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'Data 1 [DATA_1]' }).click();

    // Select Dataflow version
    await page.locator('section:nth-child(6) > .MuiFormControl-root > .ReactSelect > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'Version 1.0 [1.0]' }).click();

    // Check SDMX indicator layer
    await page.getByText('Data', { exact: true }).click();
    await expect(page.getByText('1–20 of 108')).toBeVisible();
    await expect(page.locator('.MuiDataGrid-columnHeaders').nth(0).locator('.MuiDataGrid-columnHeader').nth(0)).toHaveText("GEO_CODE");
    await expect(page.locator('.MuiDataGrid-columnHeaders').nth(0).locator('.MuiDataGrid-columnHeader').nth(1)).toHaveText("GEO_NAME");
    await expect(page.locator('.MuiDataGrid-columnHeaders').nth(0).locator('.MuiDataGrid-columnHeader').nth(2)).toHaveText("INDICATOR");
    await expect(page.locator('.MuiDataGrid-columnHeaders').nth(0).locator('.MuiDataGrid-columnHeader').nth(3)).toHaveText("DATE");
    await expect(page.locator('.MuiDataGrid-columnHeaders').nth(0).locator('.MuiDataGrid-columnHeader').nth(4)).toHaveText("VALUE");

    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(0)).toHaveText("SOM_V1");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toHaveText("Somalia");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(2)).toHaveText("A");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(3)).toHaveText("2020-01-01");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(4)).toHaveText("72.4");

    // Do the dimensions
    await page.getByText('General').nth(1).click();
    await page.locator('.DimensionDropdown__input-container').first().click();
    await page.getByRole('option', { name: 'SOM_0001_V1 (Awdal)' }).click();
    await page.getByText('Data', { exact: true }).click();
    await expect(page.getByText('1–6 of 6')).toBeVisible();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(0)).toHaveText("SOM_0001_V1");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toHaveText("Awdal");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(2)).toHaveText("A");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(3)).toHaveText("2020-01-01");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(4)).toHaveText("68.1");

    // Do the dimensions
    await page.getByText('General').nth(1).click();
    await page.locator('div:nth-child(2) > .MuiFormControl-root > .DimensionDropdown > .DimensionDropdown__control > .DimensionDropdown__value-container > .DimensionDropdown__input-container').click();
    await page.getByRole('option', { name: '(Level 1)' }).click();
    await page.locator('div:nth-child(3) > .MuiFormControl-root > .DimensionDropdown > .DimensionDropdown__control > .DimensionDropdown__value-container > .DimensionDropdown__input-container').click();
    await page.getByRole('option', { name: 'B (Indicator B)' }).click();
    await page.getByText('Data', { exact: true }).click();
    await expect(page.getByText('1–2 of 2')).toBeVisible();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(0)).toHaveText("SOM_0001_V1");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toHaveText("Awdal");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(2)).toHaveText("B");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(3)).toHaveText("2020-01-01");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(4)).toHaveText("35.4");

    // --------------------------------------------------------------------
    // Delete project
    // --------------------------------------------------------------------
    await deleteProject(page, name)
  })
});