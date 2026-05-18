import { expect, test } from '@playwright/test';
import {
  deleteProject,
  editProject,
  saveAsProject,
  saveProject,
  viewProject
} from "../../utils/project";
import { BASE_URL } from "../../variables";

const sdmxConfig = async (page: any) => {
  // Select SDMX Config
  await page.locator('.SDMX-Tab').getByText('SDMX Config').click();
  await page.locator('.SDMX-Content section').nth(2).locator('.ReactSelect__input-container').click();
  await page.getByRole('option', { name: 'Example SDMX [1]' }).click();

  // Select Agency
  await page.locator('.SDMX-Content section').nth(4).locator('.ReactSelect__input-container').click();
  await page.getByRole('option', { name: 'Example Kenya Country Office' }).click();
  await page.locator('.SDMX-Content section').nth(5).locator('.ReactSelect__input-container').click();
  await expect(page.getByText('No options', { exact: true })).toBeVisible();

  await page.locator('.SDMX-Content section').nth(4).locator('.ReactSelect__input-container').click();
  await page.getByRole('option', { name: 'Example Somalia Country' }).click();

  // Select Dataflow 2
  await page.locator('.SDMX-Content section').nth(5).locator('.ReactSelect__input-container').click();
  await page.getByRole('option', { name: 'Data 2 [DATA_2]' }).click();
  await expect(page.getByText('No dataflow version found', { exact: true })).toBeVisible();

  // Select Dataflow 3
  await page.locator('.SDMX-Content section').nth(5).locator('.ReactSelect__input-container').click();
  await page.getByRole('option', { name: 'Data 3 [DATA_3]' }).click();
  await page.locator('.SDMX-Content section').nth(6).locator('.ReactSelect__input-container').click();
  await page.getByRole('option', { name: 'Version 1.0 [1.0]' }).click();
  await page.locator('.SDMX-Tab').getByText('Filter Dimensions').click();
  await expect(page.getByText('No dimensions found', { exact: true })).toBeVisible();

  // Select Dataflow
  await page.locator('.SDMX-Tab').getByText('SDMX Config').click();
  await page.locator('.SDMX-Content section').nth(5).locator('.ReactSelect__input-container').click();
  await page.getByRole('option', { name: 'Data 1 [DATA_1]' }).click();

  // Select Dataflow version
  await page.locator('.SDMX-Content section').nth(6).locator('.ReactSelect__input-container').click();
  await page.getByRole('option', { name: 'Version 1.0 [1.0]' }).click();

  // Check SDMX indicator layer
  await page.getByText('Data Preview', { exact: true }).click();
  await expect(page.getByText('1–20 of 108')).toBeVisible();
  await expect(page.locator('.MuiDataGrid-columnHeaders').nth(0).locator('.MuiDataGrid-columnHeader').nth(0)).toHaveText("REF_AREA");
  await expect(page.locator('.MuiDataGrid-columnHeaders').nth(0).locator('.MuiDataGrid-columnHeader').nth(1)).toHaveText("REF_NAME");
  await expect(page.locator('.MuiDataGrid-columnHeaders').nth(0).locator('.MuiDataGrid-columnHeader').nth(2)).toHaveText("INDICATOR");
  await expect(page.locator('.MuiDataGrid-columnHeaders').nth(0).locator('.MuiDataGrid-columnHeader').nth(3)).toHaveText("TIME_PERIOD");
  await expect(page.locator('.MuiDataGrid-columnHeaders').nth(0).locator('.MuiDataGrid-columnHeader').nth(4)).toHaveText("OBS_VALUE");

  await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(0)).toHaveText("SOM_V1");
  await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toHaveText("Somalia");
  await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(2)).toHaveText("A");
  await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(3)).toHaveText("2020-01-01");
  await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(4)).toHaveText("10");

  // Do the dimensions
  await page.locator('.IndicatorLayerConfig .TabPrimary').getByText('General').nth(0).click();
  await page.locator('.SDMX-Tab').getByText('Filter Dimensions').click();
  await page.locator('.DimensionDropdown__input-container').first().click();
  await page.getByRole('option', { name: 'SOM_0001_V1 (Awdal)' }).click();
  await page.getByText('Data Preview', { exact: true }).click();
  await expect(page.getByText('1–6 of 6')).toBeVisible();
  await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(0)).toHaveText("SOM_0001_V1");
  await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toHaveText("Awdal");
  await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(2)).toHaveText("A");
  await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(3)).toHaveText("2020-01-01");
  await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(4)).toHaveText("2");

  // Do the dimensions
  await page.locator('.IndicatorLayerConfig .TabPrimary').getByText('General').nth(0).click();
  await page.locator('.SDMX-Tab').getByText('Filter Dimensions').click();
  await page.locator('div:nth-child(2) > .MuiFormControl-root > .DimensionDropdown > .DimensionDropdown__control > .DimensionDropdown__value-container > .DimensionDropdown__input-container').click();
  await page.getByRole('option', { name: '(Level 1)' }).click();
  await page.locator('div:nth-child(3) > .MuiFormControl-root > .DimensionDropdown > .DimensionDropdown__control > .DimensionDropdown__value-container > .DimensionDropdown__input-container').click();
  await page.getByRole('option', { name: 'B (Indicator B)' }).click();

  // Check auto data
  await page.locator('.IndicatorLayerConfig .TabPrimary').getByText('General').nth(0).click();
  await page.locator('.SDMX-Tab').getByText('Layer Metadata').click();
  await expect(page.locator('.LayerNameInput')).toHaveValue("SDMX Layer");
  await expect(page.locator('.LayerSourceInput')).toHaveValue("Example Somalia Country Office");

  // Update other config
  await page.locator('.IndicatorLayerConfig .TabPrimary').getByText('General').nth(0).click();
  await page.locator('.SDMX-Tab').getByText('Data Config').click();
  await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(4).locator('.ReactSelect__single-value')).toHaveText("REF_AREA");
  await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(5).locator('.ReactSelect__single-value')).toHaveText("OBS_VALUE");
  await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(6).locator('.ReactSelect__single-value')).toHaveText("SUM");
  await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(7).locator('.ReactSelect__single-value')).toHaveText("TIME_PERIOD");
  await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(8).locator('.ReactSelect__single-value')).toHaveText("Date (YYYY-MM-DD)");

  // Preview data
  await page.getByText('Data Preview', { exact: true }).click();
  await expect(page.getByText('1–2 of 2')).toBeVisible();
  await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(0)).toHaveText("SOM_0001_V1");
  await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toHaveText("Awdal");
  await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(2)).toHaveText("B");
  await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(3)).toHaveText("2020-01-01");
  await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(4)).toHaveText("10");

  // Update style
  await page.getByText('Style', { exact: true }).first().click();
  await page.locator('div:nth-child(2) > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').first().click();
  await page.getByRole('option', { name: 'Dynamic quantitative style.' }).click();

  await expect(page.getByText('Apply Changes')).toBeEnabled()
  await page.getByText('Apply Changes').click()
}
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

    await editProject(page, name);

    // Add SDMX indicator layer
    await page.getByText('Indicator Layers (10)').click();
    await page.getByRole('button', { name: 'Add Indicator Layer' }).click();
    await page.getByText('SDMX Indicators LayerCreate').click();
    await sdmxConfig(page);

    await expect(page.locator('.SortableTree li').last()).toHaveText('SDMX LayerSDMX Config');
    await expect(page.locator('.SortableTree li').last().locator('.OtherActionIndicator')).toHaveText('SDMX');

    // Check the edit one
    await saveProject(page);

    // Preview
    await page.goto(`/admin/project/`);
    await page.waitForURL(`${BASE_URL}/admin/project/`);
    await expect(page.locator('.AdminContentHeader-Left')).toHaveText('Projects');

    await editProject(page, name);
    await page.getByText('Indicator Layers (11)').click();
    await page.locator('span').filter({ hasText: 'SDMX Config' }).getByRole('button').click();
    await page.getByText('Data Preview', { exact: true }).click();
    await expect(page.getByText('1–2 of 2')).toBeVisible();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(0)).toHaveText("SOM_0001_V1");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toHaveText("Awdal");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(2)).toHaveText("B");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(3)).toHaveText("2020-01-01");
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(4)).toHaveText("10");

    await page.locator('.IndicatorLayerConfig .TabPrimary').getByText('General').nth(0).click();
    await page.locator('.SDMX-Tab').getByText('SDMX Config').click();
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').first().locator('.ReactSelect__single-value')).toHaveText("Example SDMX [1]");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(1).locator('.ReactSelect__single-value')).toHaveText("Example Somalia Country Office [EXAMPLE_SOMALIA_CO]");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(2).locator('.ReactSelect__single-value')).toHaveText("Data 1 [DATA_1]");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(3).locator('.ReactSelect__single-value')).toHaveText("Version 1.0 [1.0]");
    await page.locator('.SDMX-Tab').getByText('Filter Dimensions').click();
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .DimensionDropdown').nth(0).locator('.DimensionDropdown__multi-value__label')).toHaveText("SOM_0001_V1 (Awdal)");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .DimensionDropdown').nth(1).locator('.DimensionDropdown__multi-value__label')).toHaveText("1 (Level 1)");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .DimensionDropdown').nth(2).locator('.DimensionDropdown__multi-value__label')).toHaveText("B (Indicator B)");
    await page.locator('.SDMX-Tab').getByText('Data Config').click();
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(4).locator('.ReactSelect__single-value')).toHaveText("REF_AREA");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(5).locator('.ReactSelect__single-value')).toHaveText("OBS_VALUE");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(6).locator('.ReactSelect__single-value')).toHaveText("SUM");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(7).locator('.ReactSelect__single-value')).toHaveText("TIME_PERIOD");
    await expect(page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(8).locator('.ReactSelect__single-value')).toHaveText("Date (YYYY-MM-DD)");

    // Preview
    await viewProject(page, name);
    await page.getByRole('button', { name: 'Close' }).click();
    await page.locator('.layers-tab').getByText('SDMX Layer').click();
    await expect(page.locator('.MapLegendSectionTitle')).toHaveText('SDMX Layer');
    await expect(page.locator('.IndicatorLegendRow').nth(0).locator('.IndicatorLegendRowName')).toHaveText('8');
    await expect(page.locator('.IndicatorLegendRow').nth(1).locator('.IndicatorLegendRowName')).toHaveText('No data');


    // --------------------------------------------------------------------
    // Delete project
    // --------------------------------------------------------------------
    await deleteProject(page, name)
  })
  test('SDMX Indicator Layer on Live', async ({ page }, testInfo) => {
    // --------------------------------------------------------------------
    // Create project
    // --------------------------------------------------------------------
    const name = 'Demo GeoSight Project SDMX Indicator Layer'

    // --------------------------------------------------------------------
    // Delete default project
    // --------------------------------------------------------------------
    await deleteProject(page, name)
    await saveAsProject(page, 'Demo GeoSight Project', name)

    await editProject(page, name);

    await page.getByText('Tools').click();
    await page.getByRole('listitem').filter({ hasText: "Sdmx layer" }).getByRole('img').click();
    await saveProject(page);

    await viewProject(page, name);
    await page.getByRole('button', { name: 'Close' }).click();

    await page.getByTitle('Create SDMX layer').click();
    await sdmxConfig(page);

    await page.locator('.layers-tab').getByText('SDMX Layer').click();
    await expect(page.locator('.MapLegendSectionTitle')).toHaveText('SDMX Layer');
    await expect(page.locator('.IndicatorLegendRow').nth(0).locator('.IndicatorLegendRowName')).toHaveText('8');
    await expect(page.locator('.IndicatorLegendRow').nth(1).locator('.IndicatorLegendRowName')).toHaveText('No data');

    // Check the on click
    await page.getByRole('region', { name: 'Map' }).click({
      position: {
        x: 634,
        y: 104
      }
    });
    await expect(page.locator('.maplibregl-popup-content-main .content .tr').nth(0).locator('td').nth(1)).toHaveText("SDMX Layer")
    await expect(page.locator('.maplibregl-popup-content-main .content .tr').nth(1).locator('td').nth(1)).toHaveText("8")
    await expect(page.locator('.maplibregl-popup-content-main .content .tr').nth(2).locator('td').nth(1)).toHaveText("8")
    await expect(page.locator('.maplibregl-popup-content-main .content .tr').nth(3).locator('td').nth(1)).toHaveText("2021-01-01T00:00:00+00:00")

    // Remove dimension
    await page.locator('.layers-tab').locator('[data-testid="EditIcon"]').click()
    await page.locator('.TabPrimary').getByText('General').nth(0).click();
    await page.locator('.SDMX-Tab').getByText('Filter Dimensions').click();
    await page.locator('.DimensionContainer').last().locator('.DimensionDropdown__multi-value__remove').first().click();
    await page.getByText('Apply Changes').click();
    await expect(page.locator('.IndicatorLegendRow').nth(0).locator('.IndicatorLegendRowName')).toHaveText('18');
    await expect(page.locator('.IndicatorLegendRow').nth(1).locator('.IndicatorLegendRowName')).toHaveText('No data');

    // Change to average
    await page.locator('.layers-tab').locator('[data-testid="EditIcon"]').click()
    await page.locator('.SDMX-Tab').getByText('Data Config').click();
    await page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(6).locator('.ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'AVG' }).click();
    await expect(page.locator('.MuiDataGrid-columnHeaders').nth(0).locator('.MuiDataGrid-columnHeader').nth(0)).toHaveText("REF_AREA");
    await page.getByText('Apply Changes').click();

    await page.locator('.layers-tab').getByText('SDMX Layer').click();
    await expect(page.locator('.MapLegendSectionTitle')).toHaveText('SDMX Layer');
    await expect(page.locator('.IndicatorLegendRow').nth(0).locator('.IndicatorLegendRowName')).toHaveText('6');
    await expect(page.locator('.IndicatorLegendRow').nth(1).locator('.IndicatorLegendRowName')).toHaveText('No data');

    // Change to count
    await page.locator('.layers-tab').locator('[data-testid="EditIcon"]').click()
    await page.locator('.SDMX-Tab').getByText('Data Config').click();
    await page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(6).locator('.ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'COUNT', exact: true }).click();
    await expect(page.locator('.MuiDataGrid-columnHeaders').nth(0).locator('.MuiDataGrid-columnHeader').nth(0)).toHaveText("REF_AREA");
    await page.getByText('Apply Changes').click();

    await page.locator('.layers-tab').getByText('SDMX Layer').click();
    await expect(page.locator('.MapLegendSectionTitle')).toHaveText('SDMX Layer');
    await expect(page.locator('.IndicatorLegendRow').nth(0).locator('.IndicatorLegendRowName')).toHaveText('3');
    await expect(page.locator('.IndicatorLegendRow').nth(1).locator('.IndicatorLegendRowName')).toHaveText('No data');

    // Change to min
    await page.locator('.layers-tab').locator('[data-testid="EditIcon"]').click()
    await page.locator('.SDMX-Tab').getByText('Data Config').click();
    await page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(6).locator('.ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'MIN' }).click();
    await expect(page.locator('.MuiDataGrid-columnHeaders').nth(0).locator('.MuiDataGrid-columnHeader').nth(0)).toHaveText("REF_AREA");
    await page.getByText('Apply Changes').click();

    await page.locator('.layers-tab').getByText('SDMX Layer').click();
    await expect(page.locator('.MapLegendSectionTitle')).toHaveText('SDMX Layer');
    await expect(page.locator('.IndicatorLegendRow').nth(0).locator('.IndicatorLegendRowName')).toHaveText('1');
    await expect(page.locator('.IndicatorLegendRow').nth(1).locator('.IndicatorLegendRowName')).toHaveText('No data');

    // Change to max
    await page.locator('.layers-tab').locator('[data-testid="EditIcon"]').click()
    await page.locator('.SDMX-Tab').getByText('Data Config').click();
    await page.locator('.SDMXIndicatorLayerConfig .BasicForm .ReactSelect').nth(6).locator('.ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'MAX' }).click();
    await expect(page.locator('.MuiDataGrid-columnHeaders').nth(0).locator('.MuiDataGrid-columnHeader').nth(0)).toHaveText("REF_AREA");
    await page.getByText('Apply Changes').click();

    await page.locator('.layers-tab').getByText('SDMX Layer').click();
    await expect(page.locator('.MapLegendSectionTitle')).toHaveText('SDMX Layer');
    await expect(page.locator('.IndicatorLegendRow').nth(0).locator('.IndicatorLegendRowName')).toHaveText('9');
    await expect(page.locator('.IndicatorLegendRow').nth(1).locator('.IndicatorLegendRowName')).toHaveText('No data');

    // --------------------------------------------------------------------
    // On live
    // --------------------------------------------------------------------
    await deleteProject(page, name)
  })
});