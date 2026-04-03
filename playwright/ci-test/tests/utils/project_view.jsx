import { expect } from "@playwright/test";

// URL That we need to check
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const assert = async (page, assertLogs) => {
  let lastLayers = null
  let lastVisibleLayers = null
  let lastLog = null
  let lastLogLabel = null
  let lastSearchEntity = null
  page.on('console', msg => {
    if (msg.text().indexOf('VALUED_GEOM:') !== -1) {
      try {
        lastLog = msg.text().replace('VALUED_GEOM:', '')
      } catch (e) {
        console.log(e)

      }
    }
    if (msg.text().indexOf('LABEL_GEOM:') !== -1) {
      try {
        lastLogLabel = msg.text().replace('LABEL_GEOM:', '')
      } catch (e) {
        console.log(e)

      }
    }
    if (msg.text().indexOf('LAYERS:') !== -1) {
      try {
        lastLayers = msg.text().replace('LAYERS:', '')
      } catch (e) {
        console.log(e)

      }
    }
    if (msg.text().indexOf('LAYERS-VISIBLE:') !== -1) {
      try {
        lastVisibleLayers = msg.text().replace('LAYERS-VISIBLE:', '')
      } catch (e) {
        console.log(e)

      }
    }
    if (msg.text().indexOf('SEARCH_GEOMETRY_INPUT:') !== -1) {
      try {
        lastSearchEntity = msg.text().replace('SEARCH_GEOMETRY_INPUT:', '')
      } catch (e) {
        console.log(e)

      }
    }
  });

  // ------------------------------------------------------------
  // Check search
  // ------------------------------------------------------------
  await page.goto('/project/demo-geosight-project');
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('combobox', { name: 'Search Geography Entity' }).click();
  await page.getByRole('option', { name: 'Banadir Admin Level' }).click();
  await expect(lastSearchEntity).toEqual("45.20831299,1.96833061,45.60608431,2.18504432");
  await page.getByRole('option', { name: 'Gedo Admin Level' }).click();
  await expect(lastSearchEntity).toEqual("40.994317,1.23272177,43.14093018,4.30793036");
  const input = page.locator('.SearchGeometry');
  await input.click();
  await input.locator('input').fill('');
  await input.type('Sanaag');
  await delay(1000)
  await page.waitForSelector('.SearchGeometryOption');
  expect(await page.locator('.SearchGeometryOption').count()).toBe(1);
  await expect(page.getByRole('option', { name: 'Sanaag Admin Level' })).toBeVisible();

  // ------------------------------------------------------------
  // Check initial state
  // ------------------------------------------------------------
  await page.goto('/project/demo-geosight-project');
  await page.getByRole('button', { name: 'Close' }).click();

  // Check the info
  await expect(page.locator('#indicator-tab-panel .LayerName').nth(1)).toHaveText('Sample Indicator A');
  await page.locator('#indicator-tab-panel .LayerInfoIcon').first().hover()
  await expect(page.locator('#simple-popover > .MuiPaper-root > .LayerInfoPopover > .LayerInfoPopover > div')).toHaveCount(5);
  await expect(page.locator('#simple-popover > .MuiPaper-root > .LayerInfoPopover > .LayerInfoPopover > div').nth(0)).toHaveText('Sample Indicator A');
  await expect(page.locator('#simple-popover > .MuiPaper-root > .LayerInfoPopover > .LayerInfoPopover > div').nth(1)).toHaveText('Last Update: 2020-01-01 00:00:00');
  await expect(page.locator('#simple-popover > .MuiPaper-root > .LayerInfoPopover > .LayerInfoPopover > div').nth(2)).toHaveText('Description: This is the description for the sample indicator A. It is only for GeoSight demo purposes.');
  await expect(page.locator('#simple-popover > .MuiPaper-root > .LayerInfoPopover > .LayerInfoPopover > div').nth(3)).toHaveText('Source: Sample Source');
  await expect(page.locator('#simple-popover > .MuiPaper-root > .LayerInfoPopover > .LayerInfoPopover > div').nth(4)).toHaveText('Unit: Percentage');

  // Check layer
  const layer1 = 'Sample Indicator A'
  const layer2 = 'Dynamic Layer based on a list of interventions'
  await expect(page.getByLabel(layer1)).toBeVisible();
  await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
  await expect(page.locator('.MapLegend')).toBeVisible();
  await expect(page.getByLabel(layer1)).toBeChecked();
  await expect(page.getByLabel(layer2)).not.toBeChecked();
  await page.locator('#simple-tab-indicator svg').click();
  await expect(page.locator('.MapLegendSection')).toHaveCount(0);
  await page.locator('#simple-tab-indicator svg').click();
  await expect(page.locator('.MapLegendSection')).toHaveCount(1);

  // Check transparency
  await expect(page.locator('#indicator-tab-panel.layers-panel .Transparency .MuiSlider-valueLabelLabel').getByText('100', { exact: true })).toBeVisible();

  // ------------------------------------------------------------
  // Check drilldown
  // ------------------------------------------------------------
  await page.getByRole('region', { name: 'Map' }).click({
    position: {
      x: 575,
      y: 359
    }
  });
  await expect(page.locator('.maplibregl-popup-content-main').locator('.popup-content').nth(0).locator('td').nth(0)).toContainText('SOM_TEST_IND_A');
  await expect(page.locator('.maplibregl-popup-content-main').locator('.popup-content').nth(0).locator('td').nth(1)).toContainText('40');

  await expect(page.locator('.maplibregl-popup-content-main').locator('.popup-content').nth(1).locator('tr').nth(0).locator('td').nth(0)).toContainText('Awdal');
  await expect(page.locator('.maplibregl-popup-content-main').locator('.popup-content').nth(1).locator('tr').nth(0).locator('td').nth(1)).toContainText('61');
  await expect(page.locator('.maplibregl-popup-content-main').locator('.popup-content').nth(1).locator('tr').nth(0).locator('td').nth(2)).toContainText('2020-01-01');
  await expect(page.locator('.maplibregl-popup-content-main').locator('.popup-content').nth(1).locator('tr').nth(1).locator('td').nth(0)).toContainText('Bakool');
  await expect(page.locator('.maplibregl-popup-content-main').locator('.popup-content').nth(1).locator('tr').nth(1).locator('td').nth(1)).toContainText('78');
  await expect(page.locator('.maplibregl-popup-content-main').locator('.popup-content').nth(1).locator('tr').nth(1).locator('td').nth(2)).toContainText('2020-01-01');

  await page.getByTitle('Sample Indicator B').click();
  await delay(1000)
  await page.getByRole('region', { name: 'Map' }).click({
    position: {
      x: 575,
      y: 359
    }
  });
  await expect(page.locator('.maplibregl-popup-content-main').locator('.popup-content').nth(0).locator('tr').nth(0).locator('td').nth(0)).toContainText('SOM_TEST_IND_A');
  await expect(page.locator('.maplibregl-popup-content-main').locator('.popup-content').nth(0).locator('tr').nth(0).locator('td').nth(1)).toContainText('40');
  await expect(page.locator('.maplibregl-popup-content-main').locator('.popup-content').nth(0).locator('tr').nth(1).locator('td').nth(0)).toContainText('SOM_TEST_IND_B');
  await expect(page.locator('.maplibregl-popup-content-main').locator('.popup-content').nth(0).locator('tr').nth(1).locator('td').nth(1)).toContainText('13');

  await page.getByTitle('Test Indicator C').click();
  await delay(1000)
  await page.getByRole('region', { name: 'Map' }).click({
    position: {
      x: 575,
      y: 359
    }
  });
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(0).locator('td').nth(0)).toContainText('Indicator');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(0).locator('td').nth(1)).toContainText('Sample Indicator C');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(1).locator('td').nth(0)).toContainText('Value');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(1).locator('td').nth(1)).toContainText('9');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(2).locator('td').nth(0)).toContainText('Label');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(2).locator('td').nth(1)).toContainText('91');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(3).locator('td').nth(0)).toContainText('Date');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(3).locator('td').nth(1)).toContainText('2021-12-31T00:00:00+00:00');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(6).locator('td').nth(0)).toContainText('Concept uuid');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(6).locator('td').nth(1)).toContainText('30052d36-45bb-46b2-83c8-63d642c22fb8');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(7).locator('td').nth(0)).toContainText('Geom code');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(7).locator('td').nth(1)).toContainText('SOM_0007_V1');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(8).locator('td').nth(0)).toContainText('Name');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(8).locator('td').nth(1)).toContainText('Gedo');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(9).locator('td').nth(0)).toContainText('Description');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(9).locator('td').nth(1)).toContainText('SUM of 6 records (from level 2)');

  await page.getByText('Kenya Indicator A').click();
  await delay(1000)
  await page.getByRole('region', { name: 'Map' }).click({
    position: {
      x: 532,
      y: 400
    }
  });
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(0).locator('td').nth(0)).toContainText('Indicator');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(0).locator('td').nth(1)).toContainText('Kenya Indicator A');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(1).locator('td').nth(0)).toContainText('Value');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(1).locator('td').nth(1)).toContainText('3');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(2).locator('td').nth(0)).toContainText('Label');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(2).locator('td').nth(1)).toContainText('2.00 - 3.00');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(3).locator('td').nth(0)).toContainText('Date');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(3).locator('td').nth(1)).toContainText('2025-01-01T00:00:00+00:00');
  await expect(page.locator('.maplibregl-popup-content-main').locator('tr').nth(4)).toBeHidden();

  // ------------------------------------------------------------
  // LABEL
  // ------------------------------------------------------------
  const layerB = 'Sample Indicator B'
  await delay(1000)
  await expect(lastVisibleLayers.includes("indicator-label")).toBeTruthy();
  await page.locator('[title="Hide map labels"] svg').click();
  await delay(1000)
  await expect(lastVisibleLayers.includes("indicator-label")).not.toBeTruthy();
  await page.getByLabel(layerB).click();
  await delay(1000)
  await expect(lastVisibleLayers.includes("indicator-label")).not.toBeTruthy();
  await page.getByLabel(layer1).click();
  await delay(1000)
  await expect(lastVisibleLayers.includes("indicator-label")).not.toBeTruthy();
  await page.locator('[title="Show map labels"] svg').click();
  await delay(1000)
  await expect(lastVisibleLayers.includes("indicator-label")).toBeTruthy();

  // ------------------------------------------------------------
  // LEVEL 1
  // ------------------------------------------------------------
  await expect(page.locator('.ReferenceLayerLevelSelected')).toContainText('Admin Level 1')
  // Check widgets
  await expect(page.locator('.widget__title').nth(0)).toContainText('Total of Sample indicator A');
  await expect(page.locator('.widget__title').nth(1)).toContainText('Total of Dynamic Layer');
  await expect(page.locator('.widget__title').nth(2)).toContainText('Time Chart by Entity');
  await expect(page.locator('.widget__title').nth(3)).toContainText('Time Chart by Indicator');
  await expect(page.locator('.widget__title').nth(4)).toContainText('Value by Indicator');
  await expect(page.locator('.widget__title').nth(5)).toContainText('Value by Geom Code');

  // Widget 1
  await expect(page.locator('.widget__content').nth(0)).toContainText('895');

  // Widget 2
  await expect(page.locator('.widget__content').nth(1)).toContainText('978.5');

  // Widget 3
  await expect(page.locator('.widget__content').nth(2).locator('.ReactSelect__single-value').first()).toContainText('Sample Indicator A');
  await expect(page.locator('.widget__content').nth(2).locator('.widget__time_series__row_inner').nth(0)).toContainText('Mudug');
  await expect(page.locator('.widget__content').nth(2).locator('.widget__time_series__row_inner').nth(1)).toContainText('Nugaal');
  await expect(page.locator('.widget__content').nth(2).locator('.widget__time_series__row_inner').nth(2)).toContainText('Sanaag');

  // Widget 4
  await expect(page.locator('.widget__content').nth(3).locator('.widget__time_series__row_inner').nth(0)).toContainText('Sample Indicator A');
  await expect(page.locator('.widget__content').nth(3).locator('.widget__time_series__row_inner').nth(1)).toContainText('Sample Indicator B');
  await expect(page.locator('.widget__content').nth(3).locator('.widget__time_series__row_inner').nth(2)).toContainText('Sample Indicator C');

  // Widget 5
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(0).locator('td').nth(0)).toContainText('Sample Indicator A');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(0).locator('td').nth(1)).toContainText('895');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(1).locator('td').nth(0)).toContainText('Sample Indicator B');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(1).locator('td').nth(1)).toContainText('1,062');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(2).locator('td').nth(0)).toContainText('Sample Indicator C');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(2).locator('td').nth(1)).toContainText('1,638');

  // Widget 6
  await expect(page.locator('.widget__content').nth(5).locator('tbody tr').nth(0).locator('td').nth(0)).toContainText('Lower Juba');
  await expect(page.locator('.widget__content').nth(5).locator('tbody tr').nth(0).locator('td').nth(1)).toContainText('96');
  await expect(page.locator('.widget__content').nth(5).locator('tbody tr').nth(1).locator('td').nth(0)).toContainText('Middle Shabelle');
  await expect(page.locator('.widget__content').nth(5).locator('tbody tr').nth(1).locator('td').nth(1)).toContainText('94');

  // Check the label
  await expect(page.locator('.widget__content').nth(1)).toContainText('978.5');
  await delay(1000)
  await expect(lastLogLabel).toEqual("Awdal,SOM_0001_V1,2020-01-01,60 - 80,61,Bakool,SOM_0002_V1,2020-01-01,60 - 80,78,Banadir,SOM_0003_V1,2020-01-01,20 - 40,30,Bari,SOM_0004_V1,2020-01-01,0 - 20,11,Bay,SOM_0005_V1,2020-01-01,20 - 40,40,Galgaduud,SOM_0006_V1,2020-01-01,0 - 20,10,Gedo,SOM_0007_V1,2020-01-01,20 - 40,40,Hiraan,SOM_0008_V1,2020-01-01,20 - 40,32,Lower Juba,SOM_0009_V1,2020-01-01,80 - 100,96,Lower Shabelle,SOM_0010_V1,2020-01-01,40 - 60,59,Middle Juba,SOM_0011_V1,2020-01-01,60 - 80,74,Middle Shabelle,SOM_0012_V1,2020-01-01,80 - 100,94,Mudug,SOM_0013_V1,2020-01-01,60 - 80,63,Nugaal,SOM_0014_V1,2020-01-01,60 - 80,68,Sanaag,SOM_0015_V1,2020-01-01,0 - 20,14,Sool,SOM_0016_V1,2020-01-01,20 - 40,35,Togdheer,SOM_0017_V1,2020-01-01,80 - 100,89,Woqooyi Galbeed,SOM_0018_V1,2020-01-01,0 - 20,1");
  await page.getByRole('tab', { name: 'Filters' }).click();
  lastLogLabel = null
  await page.getByRole('button', { name: 'Indicator A above X% Delete' }).getByRole('checkbox').check();
  await expect(page.locator('.widget__content').nth(1)).toContainText('562');
  await delay(1000)
  await expect(lastLogLabel).toEqual("Awdal,SOM_0001_V1,2020-01-01,60 - 80,61,Bakool,SOM_0002_V1,2020-01-01,60 - 80,78,Lower Juba,SOM_0009_V1,2020-01-01,80 - 100,96,Middle Juba,SOM_0011_V1,2020-01-01,60 - 80,74,Middle Shabelle,SOM_0012_V1,2020-01-01,80 - 100,94,Mudug,SOM_0013_V1,2020-01-01,60 - 80,63,Nugaal,SOM_0014_V1,2020-01-01,60 - 80,68,Togdheer,SOM_0017_V1,2020-01-01,80 - 100,89");
  await expect(lastLayers.includes("reference-layer-fill-0,reference-layer-outline-0")).toBeTruthy();
  await page.getByRole('button', { name: 'Indicator A above X% Delete' }).getByRole('checkbox').uncheck();
  await page.getByRole('tab', { name: 'Layers' }).click();

  // ------------------------------------------------------------
  // LEVEL 0
  // ------------------------------------------------------------
  await page.hover('.ReferenceLayerLevelSelected')
  await page.locator('.ReferenceLayerLevelOption').getByText('Admin Level 0').click()
  await expect(page.locator('.ReferenceLayerLevelSelected')).toContainText('Admin Level 0')
  // Check widgets
  await expect(page.locator('.widget__title').nth(0)).toContainText('Total of Sample indicator A');
  await expect(page.locator('.widget__title').nth(1)).toContainText('Total of Dynamic Layer');
  await expect(page.locator('.widget__title').nth(2)).toContainText('Time Chart by Entity');
  await expect(page.locator('.widget__title').nth(3)).toContainText('Time Chart by Indicator');
  await expect(page.locator('.widget__title').nth(4)).toContainText('Value by Indicator');
  await expect(page.locator('.widget__title').nth(5)).toContainText('Value by Geom Code');

  // Widget 1
  await expect(page.locator('.widget__content').nth(0)).toContainText('77');

  // Widget 2
  await expect(page.locator('.widget__content').nth(1)).toContainText('72.5');

  // Widget 3
  await expect(page.locator('.widget__content').nth(2).locator('.ReactSelect__single-value').first()).toContainText('Sample Indicator A');
  await expect(page.locator('.widget__content').nth(2).locator('.widget__time_series__row_inner').nth(0)).toContainText('Mudug');
  await expect(page.locator('.widget__content').nth(2).locator('.widget__time_series__row_inner').nth(1)).toContainText('Nugaal');
  await expect(page.locator('.widget__content').nth(2).locator('.widget__time_series__row_inner').nth(2)).toContainText('Sanaag');

  // Widget 4
  await expect(page.locator('.widget__content').nth(3).locator('.widget__time_series__row_inner').nth(0)).toContainText('Sample Indicator A');
  await expect(page.locator('.widget__content').nth(3).locator('.widget__time_series__row_inner').nth(1)).toContainText('Sample Indicator B');
  await expect(page.locator('.widget__content').nth(3).locator('.widget__time_series__row_inner').nth(2)).toContainText('Sample Indicator C');

  // Widget 5
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(0).locator('td').nth(0)).toContainText('Sample Indicator A');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(0).locator('td').nth(1)).toContainText('77');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(1).locator('td').nth(0)).toContainText('Sample Indicator B');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(1).locator('td').nth(1)).toContainText('68');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(2).locator('td').nth(0)).toContainText('Sample Indicator C');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(2).locator('td').nth(1)).toContainText('5,175');

  // Widget 6
  await expect(page.locator('.widget__content').nth(5).locator('tbody tr').nth(0).locator('td').nth(0)).toContainText('Somalia');
  await expect(page.locator('.widget__content').nth(5).locator('tbody tr').nth(0).locator('td').nth(1)).toContainText('77');

  // Check the label
  await delay(1000)
  await expect(lastLogLabel).toEqual("Somalia,SOM_V1,2020-01-01,60 - 80,77");

  // ------------------------------------------------------------
  // LEVEL 2
  // ------------------------------------------------------------
  await page.hover('.ReferenceLayerLevelSelected')
  await page.locator('.ReferenceLayerLevelOption').getByText('Admin Level 2').click()
  await expect(page.locator('.ReferenceLayerLevelSelected')).toContainText('Admin Level 2')
  // Check widgets
  await expect(page.locator('.widget__title').nth(0)).toContainText('Total of Sample indicator A');
  await expect(page.locator('.widget__title').nth(1)).toContainText('Total of Dynamic Layer');
  await expect(page.locator('.widget__title').nth(2)).toContainText('Time Chart by Entity');
  await expect(page.locator('.widget__title').nth(3)).toContainText('Time Chart by Indicator');
  await expect(page.locator('.widget__title').nth(4)).toContainText('Value by Indicator');
  await expect(page.locator('.widget__title').nth(5)).toContainText('Value by Geom Code');

  // Widget 1
  await expect(page.locator('.widget__content').nth(0)).toContainText('3,656');

  // Widget 2
  await expect(page.locator('.widget__content').nth(1)).toContainText('3,778.5');

  // Widget 3
  await expect(page.locator('.widget__content').nth(2).locator('.ReactSelect__single-value').first()).toContainText('Sample Indicator A');
  await expect(page.locator('.widget__content').nth(2).locator('.widget__time_series__row_inner').nth(0)).toContainText('Mudug');
  await expect(page.locator('.widget__content').nth(2).locator('.widget__time_series__row_inner').nth(1)).toContainText('Nugaal');
  await expect(page.locator('.widget__content').nth(2).locator('.widget__time_series__row_inner').nth(2)).toContainText('Sanaag');

  // Widget 4
  await expect(page.locator('.widget__content').nth(3).locator('.widget__time_series__row_inner').nth(0)).toContainText('Sample Indicator A');
  await expect(page.locator('.widget__content').nth(3).locator('.widget__time_series__row_inner').nth(1)).toContainText('Sample Indicator B');
  await expect(page.locator('.widget__content').nth(3).locator('.widget__time_series__row_inner').nth(2)).toContainText('Sample Indicator C');

  // Widget 5
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(0).locator('td').nth(0)).toContainText('Sample Indicator A');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(0).locator('td').nth(1)).toContainText('3,656');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(1).locator('td').nth(0)).toContainText('Sample Indicator B');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(1).locator('td').nth(1)).toContainText('3,901');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(2).locator('td').nth(0)).toContainText('Sample Indicator C');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(2).locator('td').nth(1)).toContainText('3,537');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(3).locator('td').nth(0)).toContainText('Sample Indicator D');
  await expect(page.locator('.widget__content').nth(4).locator('tbody tr').nth(3).locator('td').nth(1)).toContainText('3,731');

  // Widget 6
  await expect(page.locator('.widget__content').nth(5).locator('tbody tr').nth(0).locator('td').nth(0)).toContainText('Kismaayo');
  await expect(page.locator('.widget__content').nth(5).locator('tbody tr').nth(0).locator('td').nth(1)).toContainText('98');
  await expect(page.locator('.widget__content').nth(5).locator('tbody tr').nth(1).locator('td').nth(0)).toContainText('Kurtunwaarey');
  await expect(page.locator('.widget__content').nth(5).locator('tbody tr').nth(1).locator('td').nth(1)).toContainText('96');

  // Check the label
  await expect(page.locator('.widget__content').nth(1)).toContainText('3,778.5');
  await delay(1000)
  await expect(lastLogLabel).toEqual("Baki,SOM_0001_0001_V1,2020-01-01,0 - 20,1,Borama,SOM_0001_0002_V1,2020-01-01,40 - 60,51,Lughaye,SOM_0001_0003_V1,2020-01-01,80 - 100,91,Zeylac,SOM_0001_0004_V1,2020-01-01,80 - 100,82,Ceel Barde,SOM_0002_0001_V1,2020-01-01,20 - 40,22,Rab Dhuure,SOM_0002_0002_V1,2020-01-01,40 - 60,54,Tayeeglow,SOM_0002_0003_V1,2020-01-01,40 - 60,59,Waajid,SOM_0002_0004_V1,2020-01-01,80 - 100,94,Xudur,SOM_0002_0005_V1,2020-01-01,20 - 40,21,Banadir,SOM_0003_0001_V1,2020-01-01,20 - 40,36,Bandarbeyla,SOM_0004_0001_V1,2020-01-01,40 - 60,50,Bossaso,SOM_0004_0002_V1,2020-01-01,0 - 20,16,Caluula,SOM_0004_0003_V1,2020-01-01,60 - 80,67,Iskushuban,SOM_0004_0004_V1,2020-01-01,40 - 60,48,Qandala,SOM_0004_0005_V1,2020-01-01,20 - 40,40,Qardho,SOM_0004_0006_V1,2020-01-01,40 - 60,50,Baydhaba,SOM_0005_0001_V1,2020-01-01,0 - 20,15,Buur Hakaba,SOM_0005_0002_V1,2020-01-01,0 - 20,2,Diinsoor,SOM_0005_0003_V1,2020-01-01,20 - 40,35,Qansax Dheere,SOM_0005_0004_V1,2020-01-01,40 - 60,47,Cabudwaaq,SOM_0006_0001_V1,2020-01-01,40 - 60,44,Cadaado,SOM_0006_0002_V1,2020-01-01,20 - 40,33,Ceel Buur,SOM_0006_0003_V1,2020-01-01,0 - 20,19,Ceel Dheer,SOM_0006_0004_V1,2020-01-01,60 - 80,70,Dhuusamarreeb,SOM_0006_0005_V1,2020-01-01,60 - 80,80,Baardheere,SOM_0007_0001_V1,2020-01-01,20 - 40,23,Belet Xaawo,SOM_0007_0002_V1,2020-01-01,0 - 20,18,Ceel Waaq,SOM_0007_0003_V1,2020-01-01,80 - 100,94,Doolow,SOM_0007_0004_V1,2020-01-01,20 - 40,25,Garbahaarey,SOM_0007_0005_V1,2020-01-01,20 - 40,40,Luuq,SOM_0007_0006_V1,2020-01-01,80 - 100,84,Belet Weyne,SOM_0008_0001_V1,2020-01-01,40 - 60,51,Bulo Burto,SOM_0008_0002_V1,2020-01-01,0 - 20,15,Jalalaqsi,SOM_0008_0003_V1,2020-01-01,60 - 80,79,Afmadow,SOM_0009_0001_V1,2020-01-01,0 - 20,7,Badhaadhe,SOM_0009_0002_V1,2020-01-01,80 - 100,87,Jamaame,SOM_0009_0003_V1,2020-01-01,40 - 60,57,Kismaayo,SOM_0009_0004_V1,2020-01-01,80 - 100,98,Afgooye,SOM_0010_0001_V1,2020-01-01,20 - 40,25,Baraawe,SOM_0010_0002_V1,2020-01-01,60 - 80,63,Kurtunwaarey,SOM_0010_0003_V1,2020-01-01,80 - 100,96,Marka,SOM_0010_0004_V1,2020-01-01,80 - 100,94,Qoryooley,SOM_0010_0005_V1,2020-01-01,40 - 60,57,Sablaale,SOM_0010_0006_V1,2020-01-01,40 - 60,60,Wanla Weyn,SOM_0010_0007_V1,2020-01-01,0 - 20,7,Bu'Aale,SOM_0011_0001_V1,2020-01-01,80 - 100,94,Jilib,SOM_0011_0002_V1,2020-01-01,60 - 80,72,Saakow,SOM_0011_0003_V1,2020-01-01,60 - 80,71,Adan Yabaal,SOM_0012_0001_V1,2020-01-01,40 - 60,55,Balcad,SOM_0012_0002_V1,2020-01-01,20 - 40,29,Cadale,SOM_0012_0003_V1,2020-01-01,60 - 80,62,Jowhar,SOM_0012_0004_V1,2020-01-01,60 - 80,75,Gaalkacyo,SOM_0013_0001_V1,2020-01-01,0 - 20,2,Galdogob,SOM_0013_0002_V1,2020-01-01,80 - 100,93,Hobyo,SOM_0013_0003_V1,2020-01-01,80 - 100,91,Jariiban,SOM_0013_0004_V1,2020-01-01,60 - 80,65,Xarardheere,SOM_0013_0005_V1,2020-01-01,0 - 20,12,Burtinle,SOM_0014_0001_V1,2020-01-01,0 - 20,14,Eyl,SOM_0014_0002_V1,2020-01-01,40 - 60,46,Garoowe,SOM_0014_0003_V1,2020-01-01,60 - 80,67,Ceel Afweyn,SOM_0015_0001_V1,2020-01-01,40 - 60,53,Ceerigaabo,SOM_0015_0002_V1,2020-01-01,20 - 40,39,Laasqoray,SOM_0015_0003_V1,2020-01-01,20 - 40,28,Caynabo,SOM_0016_0001_V1,2020-01-01,60 - 80,65,Laas Caanood,SOM_0016_0002_V1,2020-01-01,40 - 60,42,Taleex,SOM_0016_0003_V1,2020-01-01,0 - 20,19,Xudun,SOM_0016_0004_V1,2020-01-01,20 - 40,37,Burco,SOM_0017_0001_V1,2020-01-01,20 - 40,27,Buuhoodle,SOM_0017_0002_V1,2020-01-01,20 - 40,36,Owdweyne,SOM_0017_0003_V1,2020-01-01,40 - 60,47,Sheikh,SOM_0017_0004_V1,2020-01-01,20 - 40,40,Berbera,SOM_0018_0001_V1,2020-01-01,80 - 100,81,Gebiley,SOM_0018_0002_V1,2020-01-01,40 - 60,53,Hargeysa,SOM_0018_0003_V1,2020-01-01,20 - 40,34");
  await page.getByRole('tab', { name: 'Filters' }).click();
  lastLogLabel = null
  await page.getByRole('button', { name: 'Indicator A above X% Delete' }).getByRole('checkbox').check();
  await expect(page.locator('.widget__content').nth(1)).toContainText('1,674.5');
  await delay(1000)
  await expect(lastLogLabel).toEqual("Lughaye,SOM_0001_0003_V1,2020-01-01,80 - 100,91,Zeylac,SOM_0001_0004_V1,2020-01-01,80 - 100,82,Waajid,SOM_0002_0004_V1,2020-01-01,80 - 100,94,Caluula,SOM_0004_0003_V1,2020-01-01,60 - 80,67,Ceel Dheer,SOM_0006_0004_V1,2020-01-01,60 - 80,70,Dhuusamarreeb,SOM_0006_0005_V1,2020-01-01,60 - 80,80,Ceel Waaq,SOM_0007_0003_V1,2020-01-01,80 - 100,94,Luuq,SOM_0007_0006_V1,2020-01-01,80 - 100,84,Jalalaqsi,SOM_0008_0003_V1,2020-01-01,60 - 80,79,Badhaadhe,SOM_0009_0002_V1,2020-01-01,80 - 100,87,Kismaayo,SOM_0009_0004_V1,2020-01-01,80 - 100,98,Baraawe,SOM_0010_0002_V1,2020-01-01,60 - 80,63,Kurtunwaarey,SOM_0010_0003_V1,2020-01-01,80 - 100,96,Marka,SOM_0010_0004_V1,2020-01-01,80 - 100,94,Bu'Aale,SOM_0011_0001_V1,2020-01-01,80 - 100,94,Jilib,SOM_0011_0002_V1,2020-01-01,60 - 80,72,Saakow,SOM_0011_0003_V1,2020-01-01,60 - 80,71,Cadale,SOM_0012_0003_V1,2020-01-01,60 - 80,62,Jowhar,SOM_0012_0004_V1,2020-01-01,60 - 80,75,Galdogob,SOM_0013_0002_V1,2020-01-01,80 - 100,93,Hobyo,SOM_0013_0003_V1,2020-01-01,80 - 100,91,Jariiban,SOM_0013_0004_V1,2020-01-01,60 - 80,65,Garoowe,SOM_0014_0003_V1,2020-01-01,60 - 80,67,Caynabo,SOM_0016_0001_V1,2020-01-01,60 - 80,65,Berbera,SOM_0018_0001_V1,2020-01-01,80 - 100,81");
  await expect(lastLayers.includes("reference-layer-fill-0,reference-layer-outline-0")).toBeTruthy();
  await page.getByRole('button', { name: 'Indicator A above X% Delete' }).getByRole('checkbox').uncheck();
  await page.getByRole('tab', { name: 'Layers' }).click();

  // --------------------------------
  // Check multi reference layer
  // --------------------------------
  await page.hover('.ReferenceLayerLevelSelected')
  await page.locator('.ReferenceLayerLevelOption').getByText('Admin Level 1').click()
  await expect(page.locator('.ReferenceLayerLevelSelected')).toContainText('Admin Level 1 ')
  const kenyaLayer = 'Kenya Indicator A'
  await page.getByLabel(kenyaLayer).click();
  await expect(page.locator('.ReferenceLayerLevelSelected')).toContainText('Level 1')
  await delay(1000)
  await expect(lastLog).toEqual(assertLogs[0]);
  await delay(1000)
  await expect(lastLogLabel).toEqual("Baringo,KEN_0001_V1,2025-01-01,1.00 - 2.00,1,Bomet,KEN_0002_V1,2025-01-01,1.00 - 2.00,2,Bungoma,KEN_0003_V1,2025-01-01,1.00 - 2.00,1,Busia,KEN_0004_V1,2025-01-01,1.00 - 2.00,2,Elgeyo-Marakwet,KEN_0005_V1,2025-01-01,2.00 - 3.00,3,Embu,KEN_0006_V1,2025-01-01,5.00 - 6.00,6,Garissa,KEN_0007_V1,2025-01-01,6.00 - 7.00,7,Homa Bay,KEN_0008_V1,2025-01-01,3.00 - 4.00,4,Isiolo,KEN_0009_V1,2025-01-01,4.00 - 5.00,5,Kajiado,KEN_0010_V1,2025-01-01,2.00 - 3.00,3,Kakamega,KEN_0011_V1,2025-01-01,3.00 - 4.00,4,Kericho,KEN_0012_V1,2025-01-01,6.00 - 7.00,7,Kiambu,KEN_0013_V1,2025-01-01,5.00 - 6.00,6,Kilifi,KEN_0014_V1,2025-01-01,7.00 - 8.00,8,Kirinyaga,KEN_0015_V1,2025-01-01,1.00 - 2.00,1,Kisii,KEN_0016_V1,2025-01-01,1.00 - 2.00,2,Kisumu,KEN_0017_V1,2025-01-01,1.00 - 2.00,1,Kitui,KEN_0018_V1,2025-01-01,1.00 - 2.00,2,Kwale,KEN_0019_V1,2025-01-01,2.00 - 3.00,3,Laikipia,KEN_0020_V1,2025-01-01,3.00 - 4.00,4,Lamu,KEN_0021_V1,2025-01-01,2.00 - 3.00,3,Machakos,KEN_0022_V1,2025-01-01,1.00 - 2.00,2,Makueni,KEN_0023_V1,2025-01-01,1.00 - 2.00,1,Mandera,KEN_0024_V1,2025-01-01,1.00 - 2.00,2,Marsabit,KEN_0025_V1,2025-01-01,2.00 - 3.00,3,Meru,KEN_0026_V1,2025-01-01,3.00 - 4.00,4,Migori,KEN_0027_V1,2025-01-01,4.00 - 5.00,5,Mombasa,KEN_0028_V1,2025-01-01,3.00 - 4.00,4,Murang'A,KEN_0029_V1,2025-01-01,2.00 - 3.00,3,Nairobi,KEN_0030_V1,2025-01-01,1.00 - 2.00,2,Nakuru,KEN_0031_V1,2025-01-01,1.00 - 2.00,1,Nandi,KEN_0032_V1,2025-01-01,1.00 - 2.00,2,Narok,KEN_0033_V1,2025-01-01,2.00 - 3.00,3,Nyamira,KEN_0034_V1,2025-01-01,1.00 - 2.00,2,Nyandarua,KEN_0035_V1,2025-01-01,5.00 - 6.00,6,Nyeri,KEN_0036_V1,2025-01-01,1.00 - 2.00,1,Samburu,KEN_0037_V1,2025-01-01,7.00 - 8.00,8,Siaya,KEN_0038_V1,2025-01-01,2.00 - 3.00,3,Taita Taveta,KEN_0039_V1,2025-01-01,3.00 - 4.00,4,Tana River,KEN_0040_V1,2025-01-01,1.00 - 2.00,1,Tharaka-Nithi,KEN_0041_V1,2025-01-01,1.00 - 2.00,2,Trans Nzoia,KEN_0042_V1,2025-01-01,2.00 - 3.00,3,Turkana,KEN_0043_V1,2025-01-01,7.00 - 8.00,8,Uasin Gishu,KEN_0044_V1,2025-01-01,2.00 - 3.00,3,Vihiga,KEN_0045_V1,2025-01-01,3.00 - 4.00,4,Wajir,KEN_0046_V1,2025-01-01,2.00 - 3.00,3,West Pokot,KEN_0047_V1,2025-01-01,1.00 - 2.00,1");

  // Chart
  const layer3 = 'Pie Chart layer'
  await page.getByLabel(layer3).click();
  await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer3);
  await expect(page.getByLabel(layer3)).toBeChecked();
  const element = page.locator('[id="01da401b-09fc-4910-baa1-d42bdba5235a-chart"]')
  await expect(element).toHaveCSS("height", "40px");
  await expect(element).toHaveCSS("width", "40px");
  const parent = element.locator('..').locator('..').locator('..');
  await expect(parent).toHaveClass("maplibregl-popup maplibregl-popup-anchor-center");
  await expect(parent).toHaveCSS("height", "40px");
  await expect(parent).toHaveCSS("width", "40px");

  // Pin layer, checking the style should be pin
  const layer4 = 'Pins Indicator Layer'
  await page.getByLabel(layer4).click();
  await expect(page.locator('.MapLegendSectionTitle').nth(0)).toContainText('Sample Indicator A');
  await expect(page.locator('.MapLegendSectionTitle').nth(1)).toContainText('Sample Indicator B');
  await expect(page.locator('.MapLegendSectionTitle').nth(2)).toContainText('Sample Indicator C');
  await expect(page.locator('.MapLegendSectionTitle').nth(3)).toContainText('Sample Indicator D');
  await expect(page.getByLabel(layer4)).toBeChecked();

  const pin1 = await page.locator('[id="01da401b-09fc-4910-baa1-d42bdba5235a-pin"] .pin').nth(0)
  await expect(page.locator('[id="01da401b-09fc-4910-baa1-d42bdba5235a-pin"]')).toHaveCSS('display', 'flex');
  {
    const parent = page.locator('[id="01da401b-09fc-4910-baa1-d42bdba5235a-pin"]').locator('..').locator('..');
    await expect(parent).toHaveCSS('width', '109px');
    await expect(parent).toHaveCSS('height', '36px');
  }
  await expect(pin1).toHaveAttribute('title', 'Test/Sample Indicator A (SOM_TEST_IND_A) - 96');
  await expect(pin1).toHaveCSS('background-color', 'rgb(215, 48, 39)');
  await expect(pin1).toHaveCSS('height', '30px');
  await expect(pin1).toHaveCSS('width', '30px');
  await expect(pin1).toHaveCSS('border-radius', '50%');
  const pin2 = await page.locator('[id="01da401b-09fc-4910-baa1-d42bdba5235a-pin"] .pin').nth(1)
  await expect(pin2).toHaveAttribute('title', 'Test/Sample Indicator B (SOM_TEST_IND_B) - 54');
  await expect(pin2).toHaveCSS('background-color', 'rgb(255, 255, 191)');
  await expect(pin2).toHaveCSS('height', '30px');
  await expect(pin2).toHaveCSS('width', '30px');
  await expect(pin2).toHaveCSS('border-radius', '50%');
  const pin3 = await page.locator('[id="01da401b-09fc-4910-baa1-d42bdba5235a-pin"] .pin').nth(2)
  await expect(pin3).toHaveAttribute('title', 'Test/Sample Indicator C (SOM_TEST_IND_C) - 91');
  await expect(pin3).toHaveCSS('background-color', 'rgb(237, 248, 251)');
  await expect(pin3).toHaveCSS('height', '30px');
  await expect(pin3).toHaveCSS('width', '30px');
  await expect(pin3).toHaveCSS('border-radius', '50%');

  // ----------------------------------------------------------------------------
  // DYNAMIC LAYER
  // ----------------------------------------------------------------------------
  const dynamicLayer = 'Dynamic Layer'
  await page.getByRole('radio', { name: dynamicLayer, exact: true }).click();
  await expect(page.getByLabel(layer1)).not.toBeChecked();
  await expect(page.getByLabel(layer2)).not.toBeChecked();
  await delay(1000)
  await expect(page.locator('.MapLegendSectionTitle')).toContainText(dynamicLayer);
  const slider0 = page.locator('.IndicatorLayerMiddleConfig .WhereConfigurationQuery').nth(0).locator('.MuiInputSlider');
  const slider1 = page.locator('.IndicatorLayerMiddleConfig .WhereConfigurationQuery').nth(1).locator('.MuiInputSlider');
  const slider2 = page.locator('.IndicatorLayerMiddleConfig .WhereConfigurationQuery').nth(2).locator('.MuiInputSlider');
  await expect(slider0).toBeVisible();
  await expect(slider1).toBeVisible();
  await expect(slider2).toBeVisible();

  let box0 = await slider0.boundingBox();
  await page.mouse.click(box0.x + box0.width / 2, box0.y + box0.height / 2);
  await expect(page.locator('.widget__content').nth(1)).toContainText('978.5');
  let box1 = await slider1.boundingBox();
  await page.mouse.click(box1.x + box1.width / 2, box1.y + box1.height / 2);
  await expect(page.locator('.widget__content').nth(1)).toContainText('922.84');
  let box2 = await slider2.boundingBox();
  await page.mouse.click(box2.x + box2.width / 2, box2.y + box2.height / 2);
  await expect(page.locator('.widget__content').nth(1)).toContainText('978.5');

  // ---------------------------------
  // Related Table Layer
  // ---------------------------------
  await page.getByLabel(layer2).click();
  await expect(page.getByLabel(layer1)).not.toBeChecked();
  await expect(page.getByLabel(layer2)).toBeChecked();
  await delay(1000)
  await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer2);

  // Click the slicer
  await page.locator('#RelatedTableLayerMiddleConfigReal .SelectWithSearchInput').click();
  await page.getByRole('option', { name: 'Blank' }).click();
  await expect(lastLog).toEqual(assertLogs[1]);

  await page.locator('#RelatedTableLayerMiddleConfigReal .MultipleSelectWithSearch').click();
  await expect(page.getByRole('option', { name: 'Partner A' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Partner B' })).not.toBeVisible();
  await expect(page.getByRole('option', { name: 'Partner C' })).not.toBeVisible();

  await page.locator('#RelatedTableLayerMiddleConfigReal .SelectWithSearchInput').click();
  await page.getByRole('option', { name: 'HEALTH' }).click();
  await expect(lastLog).toEqual(assertLogs[2]);

  await page.locator('#RelatedTableLayerMiddleConfigReal .MultipleSelectWithSearch').click();
  await expect(page.getByRole('option', { name: 'Partner A' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Partner B' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Partner C' })).toBeVisible();

  await page.locator('#RelatedTableLayerMiddleConfigReal .SelectWithSearchInput').click();
  await page.getByRole('option', { name: 'WASH' }).click();
  await expect(lastLog).toEqual(assertLogs[4]);

  await page.locator('#RelatedTableLayerMiddleConfigReal .MultipleSelectWithSearch').click();
  await expect(page.getByRole('option', { name: 'Partner A' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Partner B' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Partner C' })).toBeVisible();

  await page.locator('#RelatedTableLayerMiddleConfigReal .SelectWithSearchInput').click();
  await page.getByRole('option', { name: 'EDU' }).click();
  await expect(lastLog).toEqual(assertLogs[3]);

  await page.locator('#RelatedTableLayerMiddleConfigReal .MultipleSelectWithSearch').click();
  await expect(page.getByRole('option', { name: 'Partner A' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Partner B' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Partner C' })).toBeVisible();

  // Reset
  await page.locator('.ResetFilterQuery svg').click();
  await expect(lastLog).toEqual(assertLogs[4]);

  await expect(page.getByLabel(layer1)).not.toBeChecked();
  await expect(page.getByLabel(layer2)).toBeChecked();
  await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer2);

  // Check if it just have 2 value
  await page.getByRole('spinbutton').first().fill('990');
  await expect(page.locator('.IndicatorLegendSection .IndicatorLegendRowName').nth(0)).toContainText('994');
  await expect(page.locator('.IndicatorLegendSection .IndicatorLegendRowName').nth(1)).toContainText('991');
  await expect(page.locator('.IndicatorLegendSection .IndicatorLegendRowName').nth(2)).toContainText('No data');
  await page.getByRole('spinbutton').first().fill('0');

  // ----------------------------------------------------------------------------
  // CHECK TOOLS VISIBILITY
  // ----------------------------------------------------------------------------
  await expect(page.getByTitle('Start Measurement')).toBeVisible();
  await expect(page.getByTitle('Turn on compare Layers')).toBeVisible();
  await expect(page.getByTitle('3D layer')).toBeVisible();
  await expect(page.getByTitle('Zonal Analysis')).toBeHidden();
  await page.getByTitle('Start Measurement').click();
  await expect(page.getByText('Measure distances and areas')).toBeVisible();
  await page.getByTitle('Start Measurement').click();

  // COMPARE
  await expect(page.locator('.MapLegendSectionTitle').nth(0)).toContainText('Dynamic Layer based on a list of interventions')
  await expect(page.locator('.MapLegendSectionTitle').nth(1)).toBeHidden()
  await expect(page.locator('#indicator-tab-panel .MuiCheckbox-root:visible')).toHaveCount(0);
  await expect(page.locator('#indicator-tab-panel .MuiRadio-root:visible')).toHaveCount(10);
  await page.getByTitle('Turn on compare Layers').click();
  await expect(page.locator('#indicator-tab-panel .MuiCheckbox-root:visible')).toHaveCount(10);
  await expect(page.locator('#indicator-tab-panel .MuiRadio-root:visible')).toHaveCount(0);
  await page.getByLabel(kenyaLayer).click();
  await delay(1000)
  await expect(lastLayers.includes("reference-layer-fill-0,reference-layer-outline-0,reference-layer-fill-1,reference-layer-outline-1")).toBeTruthy();
  await expect(page.locator('.MapLegendSectionTitle').nth(0)).toContainText('Dynamic Layer based on a list of interventions (Outline)')
  await expect(page.locator('.MapLegendSectionTitle').nth(1)).toContainText('Kenya Indicator A (Inner)')
  await page.getByLabel(kenyaLayer).click();
  await page.getByTitle('Turn off compare Layers').click();
  await expect(page.locator('#indicator-tab-panel .MuiCheckbox-root:visible')).toHaveCount(0);
  await expect(page.locator('#indicator-tab-panel .MuiRadio-root:visible')).toHaveCount(10);
  await expect(page.locator('.MapLegendSectionTitle').nth(0)).toContainText('Dynamic Layer based on a list of interventions')
  await expect(page.locator('.MapLegendSectionTitle').nth(1)).toBeHidden()

  // ------------------------------------------------
  // Check the filter inputs behaviour
  // ------------------------------------------------
  await page.getByLabel(layer2).click();
  await page.locator('.WhereConfigurationQuery .MuiTextField-root').first().click()
  await expect(page.locator('.WhereConfigurationQuery .MuiTextField-root').first().locator('input')).toHaveAttribute('placeholder', 'All selected');
  await page.getByRole('option', { name: 'Partner A' }).click();
  await expect(page.locator('.WhereConfigurationQuery .MuiTextField-root').first().locator('input')).toHaveAttribute('placeholder', '2 selected');
  await page.getByRole('option', { name: 'Partner B' }).click();
  await expect(page.locator('.WhereConfigurationQuery .MuiTextField-root').first().locator('.MuiChip-label')).toContainText('Partner C');
  await expect(page.locator('.WhereConfigurationQuery .MuiTextField-root').first().locator('input')).toHaveAttribute('placeholder', '');
  await expect(page.locator('.WhereConfigurationQuery .MuiTextField-root').first().locator('input')).toHaveValue('');
  await page.getByRole('option', { name: 'Partner C' }).click();
  await expect(page.locator('.WhereConfigurationQuery .MuiTextField-root').first().locator('input')).toHaveAttribute('placeholder', '');
  await page.getByRole('option', { name: 'Select all' }).click();
  await expect(page.locator('.WhereConfigurationQuery .MuiTextField-root').first().locator('input')).toHaveAttribute('placeholder', 'All selected');
  await page.getByRole('option', { name: 'Select all' }).click();
  await expect(page.locator('.WhereConfigurationQuery .MuiTextField-root').first().locator('input')).toHaveAttribute('placeholder', '');
  await page.getByRole('option', { name: 'Partner C' }).click();
  await expect(page.locator('.WhereConfigurationQuery .MuiTextField-root').first().locator('.MuiChip-label')).toContainText('Partner C');
  await expect(page.locator('.WhereConfigurationQuery .MuiTextField-root').first().locator('input')).toHaveAttribute('placeholder', '');
  await expect(page.locator('.WhereConfigurationQuery .MuiTextField-root').first().locator('input')).toHaveValue('');

  // ------------------------------------------------------------
  // CONTEXT LAYER
  // ------------------------------------------------------------
  await page.getByRole('tab', { name: 'Layers', exact: true }).click();
  await page.getByRole('tab', { name: 'Context Layers' }).click();
  await page.locator('.LayerInfoIcon').first().waitFor({ state: 'visible' })
  await page.locator('.LayerInfoIcon').first().hover()
  await expect(page.locator('#simple-popover > .MuiPaper-root > .LayerInfoPopover > .LayerInfoPopover > div')).toHaveCount(3);
  await expect(page.locator('#simple-popover > .MuiPaper-root > .LayerInfoPopover > .LayerInfoPopover > div').nth(0)).toHaveText('Somalia sample context layer');
  await expect(page.locator('#simple-popover > .MuiPaper-root > .LayerInfoPopover > .LayerInfoPopover > div').nth(1)).toHaveText('Description: Somalia sample context layer');
  await expect(page.locator('#simple-popover > .MuiPaper-root > .LayerInfoPopover > .LayerInfoPopover > div').nth(2)).toHaveText('Source: Source of somalia sample');
}