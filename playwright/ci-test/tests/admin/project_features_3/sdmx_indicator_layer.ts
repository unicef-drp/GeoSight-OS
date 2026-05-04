import { expect, test } from '@playwright/test';
import { deleteProject, saveAsProject, editProject } from "../../utils/project";
import { BASE_URL } from "../../variables";

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

    // Update other config
    await expect(page.getByText('Apply Changes')).toBeDisabled()
    await page.getByText('General').nth(1).click();
    await page.locator('.LayerNameInput').fill('SMDX Indicator Layer');

    await page.locator('div:nth-child(7) > .MuiFormControl-root > .ReactSelect > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'GEO_CODE' }).click();
    await page.locator('div:nth-child(8) > div > div > .MuiFormControl-root > .ReactSelect > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'VALUE' }).click();
    await page.locator('div:nth-child(8) > div:nth-child(2) > div > .MuiFormControl-root > .ReactSelect > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'SUM' }).click();
    await page.locator('.MuiGrid-root > .MuiFormControl-root > .ReactSelect > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'DATE' }).click();
    await page.locator('div:nth-child(2) > .MuiFormControl-root > .ReactSelect > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'Year (YYYY) - will be' }).click();

    await expect(page.getByText('Apply Changes')).toBeEnabled()
    await page.locator('.SaveButton-Section button').click()
    await expect(page.locator('.SortableTree li').last()).toHaveText('SMDX Indicator LayerSDMX Config');
    await expect(page.locator('.SortableTree li').last().locator('.OtherActionIndicator')).toHaveText('SDMX');

    // Check the edit one
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Configuration has been saved!')).toBeVisible();

    // Preview
    await page.goto(`/admin/project/`);
    await page.waitForURL(`${BASE_URL}/admin/project/`);
    await expect(page.locator('.AdminContentHeader-Left')).toHaveText('Projects');

    // Preview
    await page.goto(`/admin/project/`);
    await page.waitForURL(`${BASE_URL}/admin/project/`);
    await expect(page.locator('.AdminContentHeader-Left')).toHaveText('Projects');

    await editProject(page, name);
    await page.getByText('Indicator Layers (11)').click();
    await page.locator('span').filter({ hasText: 'SDMX Config' }).getByRole('button').click();
    await page.getByText('Data', { exact: true }).click();
    await expect(page.getByText('1–2 of 2')).toBeVisible();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(0)).toHaveText("SOM_0001_V1");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toHaveText("Awdal");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(2)).toHaveText("B");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(3)).toHaveText("2020-01-01");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(4)).toHaveText("35.4");

    await page.getByText('General').nth(1).click();
    await expect(page.locator('.LayerNameInput')).toHaveValue('SMDX Indicator Layer');
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').first().locator('.ReactSelect__single-value')).toHaveText("Example SDMX [1]");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(1).locator('.ReactSelect__single-value')).toHaveText("Example Somalia Country Office [EXAMPLE_SOMALIA_CO]");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(2).locator('.ReactSelect__single-value')).toHaveText("Data 1 [DATA_1]");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(3).locator('.ReactSelect__single-value')).toHaveText("Version 1.0 [1.0]");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .DimensionDropdown').nth(0).locator('.DimensionDropdown__multi-value__label')).toHaveText("SOM_0001_V1 (Awdal)");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .DimensionDropdown').nth(1).locator('.DimensionDropdown__multi-value__label')).toHaveText("1 (Level 1)");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .DimensionDropdown').nth(2).locator('.DimensionDropdown__multi-value__label')).toHaveText("B (Indicator B)");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(4).locator('.ReactSelect__single-value')).toHaveText("GEO_CODE");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(5).locator('.ReactSelect__single-value')).toHaveText("VALUE");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(6).locator('.ReactSelect__single-value')).toHaveText("SUM");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(7).locator('.ReactSelect__single-value')).toHaveText("DATE");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(8).locator('.ReactSelect__single-value')).toHaveText("Year (YYYY) - will be translated into YYYY-01-01");

    // --------------------------------------------------------------------
    // Delete project
    // --------------------------------------------------------------------
    await deleteProject(page, name)
  })
});