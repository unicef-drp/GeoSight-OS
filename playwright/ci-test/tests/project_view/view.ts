import { expect, test } from '@playwright/test';

// URL That we need to check
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('View project', () => {
  const assert = async (
    page, assertLogs
  ) => {
    let lastLayers = null
    let lastLog = null
    let lastLogLabel = null
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
    });

    // Check initial state
    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();
    const layer1 = 'Sample Indicator A'
    const layer2 = 'Dynamic Layer based on a list of interventions'
    await expect(page.getByLabel(layer1)).toBeVisible();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
    await expect(page.locator('.MapLegend')).toBeVisible();
    await expect(page.getByLabel(layer1)).toBeChecked();
    await expect(page.getByLabel(layer2)).not.toBeChecked();
    await page.locator('#simple-tab-1 svg').click();
    await expect(page.locator('.MapLegendSection')).toHaveCount(0);
    await page.locator('#simple-tab-1 svg').click();
    await expect(page.locator('.MapLegendSection')).toHaveCount(1);

    // Check widgets
    await expect(page.locator('.widget__title').nth(0)).toContainText('Total of Sample indicator A');
    await expect(page.locator('.widget__title').nth(1)).toContainText('Total of Dynamic Layer');
    await expect(page.locator('.widget__title').nth(2)).toContainText('Time Chart by Entity');
    await expect(page.locator('.widget__title').nth(3)).toContainText('Time Chart by Indicator');
    await expect(page.locator('.widget__title').nth(4)).toContainText('Value by Geom Code');
    await expect(page.locator('.widget__sw__content').nth(0)).toContainText('895');
    await expect(page.locator('.widget__sw__content').nth(1)).toContainText('978.5');
    await expect(page.locator('.widget__sgw').nth(0).locator('.widget__time_series__row_inner').nth(0)).toContainText('Mudug');
    await expect(page.locator('.widget__sgw').nth(0).locator('.widget__time_series__row_inner').nth(1)).toContainText('Nugaal');
    await expect(page.locator('.widget__sgw').nth(0).locator('.widget__time_series__row_inner').nth(2)).toContainText('Sanaag');
    await expect(page.locator('.widget__sgw').nth(1).locator('.widget__time_series__row_inner').nth(0)).toContainText('Sample Indicator A');
    await expect(page.locator('.widget__sgw').nth(1).locator('.widget__time_series__row_inner').nth(1)).toContainText('Sample Indicator B');
    await expect(page.locator('.widget__sgw').nth(1).locator('.widget__time_series__row_inner').nth(2)).toContainText('Sample Indicator C');
    await expect(page.locator('.widget__sgw').nth(2).locator('.widget__sgw__row').nth(0).locator('td').nth(0)).toContainText('SOM_0009_V1');
    await expect(page.locator('.widget__sgw').nth(2).locator('.widget__sgw__row').nth(0).locator('td').nth(1)).toContainText('96');
    await expect(page.locator('.widget__sgw').nth(2).locator('.widget__sgw__row').nth(1).locator('td').nth(0)).toContainText('SOM_0012_V1');
    await expect(page.locator('.widget__sgw').nth(2).locator('.widget__sgw__row').nth(1).locator('td').nth(1)).toContainText('94');

    // Check the label
    await expect(page.locator('.widget__sw__content').nth(1)).toContainText('978.5');
    await expect(lastLogLabel).toEqual("Awdal,SOM_0001_V1,2020-01-01,60 - 80,61,Bakool,SOM_0002_V1,2020-01-01,60 - 80,78,Banadir,SOM_0003_V1,2020-01-01,20 - 40,30,Bari,SOM_0004_V1,2020-01-01,0 - 20,11,Bay,SOM_0005_V1,2020-01-01,20 - 40,40,Hiraan,SOM_0008_V1,2020-01-01,20 - 40,32,Lower Juba,SOM_0009_V1,2020-01-01,80 - 100,96,Lower Shabelle,SOM_0010_V1,2020-01-01,40 - 60,59,Galgaduud,SOM_0006_V1,2020-01-01,0 - 20,10,Gedo,SOM_0007_V1,2020-01-01,20 - 40,40,Middle Juba,SOM_0011_V1,2020-01-01,60 - 80,74,Middle Shabelle,SOM_0012_V1,2020-01-01,80 - 100,94,Mudug,SOM_0013_V1,2020-01-01,60 - 80,63,Nugaal,SOM_0014_V1,2020-01-01,60 - 80,68,Sanaag,SOM_0015_V1,2020-01-01,0 - 20,14,Sool,SOM_0016_V1,2020-01-01,20 - 40,35,Togdheer,SOM_0017_V1,2020-01-01,80 - 100,89,Woqooyi Galbeed,SOM_0018_V1,2020-01-01,0 - 20,1");
    await page.getByRole('tab', { name: 'Filters' }).click();
    lastLogLabel = null
    await page.getByRole('button', { name: 'Indicator A above X% Delete' }).getByRole('checkbox').check();
    await expect(page.locator('.widget__sw__content').nth(1)).toContainText('562');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await expect(lastLogLabel).toEqual("Awdal,SOM_0001_V1,2020-01-01,60 - 80,61,Bakool,SOM_0002_V1,2020-01-01,60 - 80,78,Lower Juba,SOM_0009_V1,2020-01-01,80 - 100,96,Middle Juba,SOM_0011_V1,2020-01-01,60 - 80,74,Middle Shabelle,SOM_0012_V1,2020-01-01,80 - 100,94,Mudug,SOM_0013_V1,2020-01-01,60 - 80,63,Nugaal,SOM_0014_V1,2020-01-01,60 - 80,68,Togdheer,SOM_0017_V1,2020-01-01,80 - 100,89");
    await expect(lastLayers.includes("reference-layer-fill-0,reference-layer-outline-0")).toBeTruthy();
    await page.getByRole('button', { name: 'Indicator A above X% Delete' }).getByRole('checkbox').uncheck();
    await page.getByRole('tab', { name: 'Layers' }).click();

    // --------------------------------
    // Check multi reference layer
    // --------------------------------
    await expect(page.locator('.ReferenceLayerLevelSelected')).toContainText('Admin Level 1')
    const kenyaLayer = 'Kenya Indicator A'
    await page.getByLabel(kenyaLayer).click();
    await expect(page.locator('.ReferenceLayerLevelSelected')).toContainText('Level 1')
    await expect(lastLog).toEqual(assertLogs[0]);
    await expect(lastLogLabel).toEqual("Mombasa,KEN_0028_V1,2025-01-01,3.00 - 4.00,4,Murang'A,KEN_0029_V1,2025-01-01,2.00 - 3.00,3,Nairobi,KEN_0030_V1,2025-01-01,1.00 - 2.00,2,Nakuru,KEN_0031_V1,2025-01-01,1.00 - 2.00,1,Nandi,KEN_0032_V1,2025-01-01,1.00 - 2.00,2,Narok,KEN_0033_V1,2025-01-01,2.00 - 3.00,3,Nyamira,KEN_0034_V1,2025-01-01,1.00 - 2.00,2,Nyandarua,KEN_0035_V1,2025-01-01,5.00 - 6.00,6,Nyeri,KEN_0036_V1,2025-01-01,1.00 - 2.00,1,Samburu,KEN_0037_V1,2025-01-01,7.00 - 8.00,8,Siaya,KEN_0038_V1,2025-01-01,2.00 - 3.00,3,Taita Taveta,KEN_0039_V1,2025-01-01,3.00 - 4.00,4,Tana River,KEN_0040_V1,2025-01-01,1.00 - 2.00,1,Tharaka-Nithi,KEN_0041_V1,2025-01-01,1.00 - 2.00,2,Trans Nzoia,KEN_0042_V1,2025-01-01,2.00 - 3.00,3,Turkana,KEN_0043_V1,2025-01-01,7.00 - 8.00,8,Uasin Gishu,KEN_0044_V1,2025-01-01,2.00 - 3.00,3,Vihiga,KEN_0045_V1,2025-01-01,3.00 - 4.00,4,Wajir,KEN_0046_V1,2025-01-01,2.00 - 3.00,3,West Pokot,KEN_0047_V1,2025-01-01,1.00 - 2.00,1,Baringo,KEN_0001_V1,2025-01-01,1.00 - 2.00,1,Bomet,KEN_0002_V1,2025-01-01,1.00 - 2.00,2,Bungoma,KEN_0003_V1,2025-01-01,1.00 - 2.00,1,Busia,KEN_0004_V1,2025-01-01,1.00 - 2.00,2,Elgeyo-Marakwet,KEN_0005_V1,2025-01-01,2.00 - 3.00,3,Embu,KEN_0006_V1,2025-01-01,5.00 - 6.00,6,Garissa,KEN_0007_V1,2025-01-01,6.00 - 7.00,7,Homa Bay,KEN_0008_V1,2025-01-01,3.00 - 4.00,4,Isiolo,KEN_0009_V1,2025-01-01,4.00 - 5.00,5,Kajiado,KEN_0010_V1,2025-01-01,2.00 - 3.00,3,Kakamega,KEN_0011_V1,2025-01-01,3.00 - 4.00,4,Kericho,KEN_0012_V1,2025-01-01,6.00 - 7.00,7,Kiambu,KEN_0013_V1,2025-01-01,5.00 - 6.00,6,Kilifi,KEN_0014_V1,2025-01-01,7.00 - 8.00,8,Kirinyaga,KEN_0015_V1,2025-01-01,1.00 - 2.00,1,Kisii,KEN_0016_V1,2025-01-01,1.00 - 2.00,2,Kisumu,KEN_0017_V1,2025-01-01,1.00 - 2.00,1,Kitui,KEN_0018_V1,2025-01-01,1.00 - 2.00,2,Kwale,KEN_0019_V1,2025-01-01,2.00 - 3.00,3,Laikipia,KEN_0020_V1,2025-01-01,3.00 - 4.00,4,Lamu,KEN_0021_V1,2025-01-01,2.00 - 3.00,3,Machakos,KEN_0022_V1,2025-01-01,1.00 - 2.00,2,Makueni,KEN_0023_V1,2025-01-01,1.00 - 2.00,1,Mandera,KEN_0024_V1,2025-01-01,1.00 - 2.00,2,Marsabit,KEN_0025_V1,2025-01-01,2.00 - 3.00,3,Meru,KEN_0026_V1,2025-01-01,3.00 - 4.00,4,Migori,KEN_0027_V1,2025-01-01,4.00 - 5.00,5");

    // Chart
    const layer3 = 'Pie Chart layer'
    await page.getByLabel(layer3).click();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer3);
    await expect(page.getByLabel(layer3)).toBeChecked();
    await expect(page.locator('[id="01da401b-09fc-4910-baa1-d42bdba5235a-chart"]')).toHaveCSS("height", "40px");
    await expect(page.locator('[id="01da401b-09fc-4910-baa1-d42bdba5235a-chart"]')).toHaveCSS("width", "40px");

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

    // ---------------------------------
    // Related Table Layer
    // ---------------------------------
    await page.getByLabel(layer2).click();
    await expect(page.getByLabel(layer1)).not.toBeChecked();
    await expect(page.getByLabel(layer2)).toBeChecked();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer2);

    // Click the slicer
    await page.getByRole('combobox', { name: 'Select 1 option' }).click();
    await page.getByRole('option', { name: 'Blank' }).click();
    await expect(lastLog).toEqual(assertLogs[1]);

    await page.getByRole('option', { name: 'HEALTH' }).click();
    await expect(lastLog).toEqual(assertLogs[2]);

    await page.getByRole('option', { name: 'EDU' }).click();
    await expect(lastLog).toEqual(assertLogs[3]);

    await page.getByRole('option', { name: 'WASH' }).click();
    await expect(lastLog).toEqual(assertLogs[4]);

    await expect(page.getByLabel(layer1)).not.toBeChecked();
    await expect(page.getByLabel(layer2)).toBeChecked();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer2);

    // Check if it just have 2 value
    await page.getByRole('spinbutton').first().fill('990');
    await expect(page.locator('.IndicatorLegendSection .IndicatorLegendRowName').nth(0)).toContainText('994');
    await expect(page.locator('.IndicatorLegendSection .IndicatorLegendRowName').nth(1)).toContainText('991');
    await expect(page.locator('.IndicatorLegendSection .IndicatorLegendRowName').nth(2)).toContainText('No data');

    // ----------------------------------------------------------------------------
    // CHECK TOOLS VISIBILITY
    // ----------------------------------------------------------------------------
    await expect(page.getByTitle('Start Measurement')).toBeVisible();
    await expect(page.getByTitle('Turn on compare Layers')).toBeVisible();
    await expect(page.getByTitle('3D layer')).toBeVisible();
    await expect(page.getByTitle('Zonal Analysis')).toBeHidden();
    await page.getByTitle('Start Measurement').click();
    await expect(page.getByText('Measure distances and areas')).toBeVisible();

    // COMPARE
    await page.getByTitle('Turn on compare Layers').click();
    await page.getByLabel(kenyaLayer).click();
    await expect(lastLayers.includes("reference-layer-fill-0,reference-layer-outline-0,reference-layer-fill-1,reference-layer-outline-1")).toBeTruthy();
    await page.getByLabel(kenyaLayer).click();
    await page.getByTitle('Turn off compare Layers').click();

    // Embed
    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByTitle('Get embed code').click();
    await page.getByRole('button', { name: 'Generate' }).click();
    await page.waitForTimeout(3000);
    const embedUrl = await page.locator('.modal--footer input').inputValue()
    await expect(embedUrl.includes('http://localhost:2000/embed/')).toBeTruthy();

    // Got to embed page
    await page.goto(embedUrl);
    await delay(2000)
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByLabel(layer1)).toBeVisible();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
    await expect(page.getByLabel(layer1)).toBeChecked();
    await expect(page.getByLabel(layer2)).not.toBeChecked();
  }

  // A use case tests scenarios
  test('View project with latest ucode', async ({ page }) => {
    await page.goto('/admin/project/demo-geosight-project/edit');
    await page.getByPlaceholder('Select 1 option').click();
    await page.getByRole('option', { name: 'Latest ucode' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.getByText('Configuration has been saved!');
    await assert(
      page,
      [
        "KEN_0001_V1,KEN_0002_V1,KEN_0003_V1,KEN_0004_V1,KEN_0005_V1,KEN_0006_V1,KEN_0007_V1,KEN_0008_V1,KEN_0009_V1,KEN_0010_V1,KEN_0011_V1,KEN_0012_V1,KEN_0013_V1,KEN_0014_V1,KEN_0015_V1,KEN_0016_V1,KEN_0017_V1,KEN_0018_V1,KEN_0019_V1,KEN_0020_V1,KEN_0021_V1,KEN_0022_V1,KEN_0023_V1,KEN_0024_V1,KEN_0025_V1,KEN_0026_V1,KEN_0027_V1,KEN_0028_V1,KEN_0029_V1,KEN_0030_V1,KEN_0031_V1,KEN_0032_V1,KEN_0033_V1,KEN_0034_V1,KEN_0035_V1,KEN_0036_V1,KEN_0037_V1,KEN_0038_V1,KEN_0039_V1,KEN_0040_V1,KEN_0041_V1,KEN_0042_V1,KEN_0043_V1,KEN_0044_V1,KEN_0045_V1,KEN_0046_V1,KEN_0047_V1",
        "SOM_0001_0001_V1",
        "SOM_0001_0001_V1,SOM_0001_0002_V1,SOM_0001_0003_V1,SOM_0001_0004_V1,SOM_0002_0001_V1,SOM_0002_0002_V1,SOM_0004_0001_V1,SOM_0004_0002_V1,SOM_0004_0003_V1,SOM_0004_0004_V1,SOM_0004_0005_V1,SOM_0004_0006_V1,SOM_0006_0001_V1,SOM_0006_0002_V1,SOM_0006_0003_V1,SOM_0006_0004_V1,SOM_0006_0005_V1,SOM_0007_0001_V1,SOM_0007_0002_V1,SOM_0007_0003_V1,SOM_0007_0004_V1,SOM_0007_0005_V1,SOM_0009_0001_V1,SOM_0009_0002_V1,SOM_0009_0003_V1,SOM_0009_0004_V1,SOM_0010_0001_V1,SOM_0010_0002_V1,SOM_0010_0007_V1,SOM_0011_0001_V1,SOM_0011_0002_V1,SOM_0011_0003_V1,SOM_0012_0001_V1,SOM_0012_0002_V1,SOM_0012_0003_V1,SOM_0012_0004_V1,SOM_0013_0001_V1,SOM_0013_0002_V1,SOM_0014_0002_V1,SOM_0014_0003_V1,SOM_0015_0001_V1,SOM_0015_0002_V1,SOM_0015_0003_V1,SOM_0016_0001_V1,SOM_0017_0002_V1,SOM_0017_0003_V1,SOM_0017_0004_V1,SOM_0018_0001_V1,SOM_0018_0002_V1,SOM_0018_0003_V1",
        "SOM_0002_0002_V1,SOM_0002_0003_V1,SOM_0002_0004_V1,SOM_0002_0005_V1,SOM_0003_0001_V1,SOM_0004_0006_V1,SOM_0005_0001_V1,SOM_0005_0002_V1,SOM_0005_0003_V1,SOM_0005_0004_V1,SOM_0007_0005_V1,SOM_0007_0006_V1,SOM_0008_0001_V1,SOM_0008_0002_V1,SOM_0008_0003_V1,SOM_0010_0002_V1,SOM_0010_0003_V1,SOM_0010_0004_V1,SOM_0010_0005_V1,SOM_0010_0006_V1,SOM_0013_0002_V1,SOM_0013_0003_V1,SOM_0013_0004_V1,SOM_0013_0005_V1,SOM_0014_0001_V1,SOM_0016_0001_V1,SOM_0016_0002_V1,SOM_0016_0003_V1,SOM_0016_0004_V1,SOM_0017_0001_V1",
        "SOM_0001_0001_V1,SOM_0001_0002_V1,SOM_0002_0001_V1,SOM_0002_0003_V1,SOM_0002_0005_V1,SOM_0003_0001_V1,SOM_0004_0001_V1,SOM_0004_0002_V1,SOM_0004_0005_V1,SOM_0005_0001_V1,SOM_0005_0003_V1,SOM_0005_0004_V1,SOM_0006_0001_V1,SOM_0006_0002_V1,SOM_0006_0003_V1,SOM_0006_0004_V1,SOM_0006_0005_V1,SOM_0007_0001_V1,SOM_0007_0004_V1,SOM_0007_0006_V1,SOM_0008_0002_V1,SOM_0008_0003_V1,SOM_0009_0001_V1,SOM_0009_0002_V1,SOM_0010_0001_V1,SOM_0010_0003_V1,SOM_0010_0005_V1,SOM_0010_0006_V1,SOM_0010_0007_V1,SOM_0011_0001_V1,SOM_0011_0002_V1,SOM_0011_0003_V1,SOM_0012_0001_V1,SOM_0012_0002_V1,SOM_0013_0001_V1,SOM_0013_0003_V1,SOM_0013_0005_V1,SOM_0014_0001_V1,SOM_0014_0002_V1,SOM_0014_0003_V1,SOM_0015_0003_V1,SOM_0016_0002_V1,SOM_0016_0004_V1,SOM_0017_0001_V1,SOM_0017_0002_V1,SOM_0017_0003_V1,SOM_0017_0004_V1,SOM_0018_0001_V1,SOM_0018_0002_V1,SOM_0018_0003_V1"

      ]
    )
  });
  // A use case tests scenarios
  test('View project with concept uuid', async ({ page }) => {
    await page.goto('/admin/project/demo-geosight-project/edit');
    await page.getByPlaceholder('Select 1 option').click();
    await page.getByRole('option', { name: 'Concept uuid' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.getByText('Configuration has been saved!');
    await assert(
      page,
      [
        "001cef03-40c3-4951-8ed7-5687072c2b2e,0ceb38ff-315b-4507-8a3e-0ad8e10cc119,108f50cf-dfda-45dc-ac04-c0e05c328303,10add79a-827c-4579-88de-284d66e57b58,119b2238-4a3c-4a14-978c-27504c9e6bfc,1277d45e-e940-4737-a742-92bf7eb1a804,16a80b96-679c-4f6c-a2ff-5f3a15cb1d28,2598cf3f-aa2b-49d4-b6b3-ecfa949e387a,27297028-fad8-476e-a844-4a302d0351bf,28888757-2504-4749-948c-6da82982432e,2976b7cb-d296-4f23-9ac9-c2b8e4aa5395,35ff463d-1f06-4c06-9aeb-4b52ea4d149c,3881132a-255a-4200-a83f-30e775ce5a07,40d5eb01-f739-431b-89d3-c5a66c9e4527,59b1eda5-79c9-4594-948f-b69788f63041,5c4d6805-99d6-406c-83d7-5e06ac07f534,5ce5943e-6988-4bd8-982e-ea8f1dacd3a8,62b85235-833d-4ff8-a8a2-8a02e5ffccb5,6d519cb6-cb1d-4f3d-9df3-d33680a797cf,6d872747-ad06-490e-8605-953ec67bde0c,72dd3fa3-8d5a-4cb9-bbac-22591be95a7f,7946c65a-e5c9-4707-8386-0bc12e12231b,90ad8b28-6b2a-4f18-8ad1-443e3cb35f6c,917a71d2-e8ef-406b-9edc-3284c1549807,91bb4f12-2412-4f7e-b0be-fa83eb8c18f5,96e0dca1-c546-44c1-a2cb-c21e2f3ebf1a,97635a9b-3e3b-48d9-ad44-8b28e5910654,9a8bc945-094f-4c66-a7f7-463399f6dc19,9cfab798-623a-472e-85a9-8486cf7e81ef,a1b333c0-2d1b-4e1d-9966-1d5c7ea9d203,ae3b5025-33e6-45ac-89b3-3350df490db5,b0723ced-37e5-40ab-acee-e8425fd86308,b4b364fc-0b17-4197-a8de-8c23de0c20cb,b65f2ef0-c01b-4cda-b76b-a5575383aa83,b7e6c8d1-6e7e-4b0d-b149-d6dc6a793cbb,c1bd5689-8eb7-40bf-94c7-f3622f267081,c4bc5799-8299-408a-890a-d295ec0cc03d,c9c9faa7-598f-498c-aae6-36dd573d5761,cb3c2177-da83-4a2c-9981-5338b90121b5,d0b88eff-9f29-43c5-b3e8-0e94d197e441,d243b586-429a-4de3-8713-e13ca058a96d,e76e2a73-e17f-4452-90bb-1d31a371dda6,f54b92a9-09a7-4ed2-9e2d-ceb25a3dc58d,f6a52657-0942-4856-a665-b5a544a332fc,f7db615a-07f9-4695-8ad3-78360cbbbbc9,fa41300a-61fd-4bd3-8da9-b1b726221d1e,fff93f32-a507-4fc0-8182-53d7e7f51545",
        "998e50ae-d1c4-48fa-8357-4dcbe3574517",
        "01fd5c8f-c457-4b58-b760-cdfab5377515,0463e18b-9180-4d79-8650-1b97622f8106,073bf6b0-6836-4eac-b64c-3fbcdea250e7,20f81ec5-8f1b-4056-b885-6560011cb8a8,2773ed37-6fff-4e4f-b104-73883ab81fcf,2f2b8f57-1b17-4be2-94c4-a4150dadd3ec,354a10c0-7be6-40ee-9377-2ec7708a04d2,38e54299-07cb-4f45-ad46-66bd24e5ca52,3d8230d5-45b7-433d-a3cf-fc9d6f1868a0,405e9a6b-97b4-4fd0-a273-089b2fe478ea,424f4c39-bd47-4bf6-ba61-a9edc5316506,47c4ab94-ae76-4b07-888e-eef43fa6441a,48f88505-edb2-4cf6-86f2-8acce809af31,4a1fab6c-6e80-4cf5-a96f-fe72dd222c71,4a84545d-1106-4689-849a-658650ce0bc2,4e0f8c32-2b51-429a-afa0-7dfea57b380e,598882e1-a549-4f44-aaa8-e423e089008a,67180f2b-c20c-40fb-9a85-13552030d79c,6bddaec7-83a1-4da5-9d37-8a32bc925e64,6ee97f02-b800-49fe-b73a-f55c1b57ed27,75c01c2c-fdc4-4bdf-88e2-f79b935ebcd6,7bc8f9c0-7bf6-4873-b6ea-39beccb3e20c,82241b2d-5339-43cd-980e-d49205536c4c,8323739b-392c-4268-8fd5-46d1fbf18e5d,8f437731-fa0a-4b59-ba75-ac58bea05531,90b303dc-c37b-440d-b05f-cb99ce52c73e,921c006e-4b3e-4483-af5c-7d5eb92c0c45,9862d9bb-d5a9-4eb6-b91e-98acc5a95484,998e50ae-d1c4-48fa-8357-4dcbe3574517,9e6b0956-fd2d-403b-8752-b13993cb1cdb,a0fe3caa-57b4-4a0a-9f6d-abadc50770e3,b0942108-c200-4f03-b302-895c7e0d6877,b0a64777-4a60-43c6-bd8d-2a486b5d46c4,b1660c4a-aa48-4fcb-9b3e-b6c507b3a450,b1d27efa-bfc2-4a93-99da-cac93faba80b,b57fdfe7-240a-48da-b050-26244e0fd5d4,b6312173-48eb-428d-9a54-3511c9e6a10e,cc0748d8-e0a0-4cbe-a230-77dfdbcda220,cc44d9f4-7d21-4666-b0c1-2893a03ff80c,ce1d3979-c51f-41cf-aed7-deb2ac59fc32,d1b527f5-b7d8-477e-b4e7-725527bdcbc0,d354ddb3-c351-45fa-a244-87ef339a282b,d928d4bc-d444-46a4-85ac-a64898841554,ee210c3e-6eec-4e90-a760-d78ef5aa73a2,ef59c37d-29a6-4972-bc97-e53024df23f1,f187b219-d4df-4831-84a3-886fde91b1e3,f9cc24d3-40da-429b-a568-f02016d75131,fab5edae-3df3-4f74-97bc-1d0afb5fc885,fce3a5a3-5cf0-423c-949a-d32384fa9579,fd693d32-653a-4f6f-9908-a1b7d81ffaf0",
        "01fbc793-6079-4340-81e3-9ed9b699caa2,021f18bd-3ada-4225-b86a-a8230e7eb26a,0296f796-2e6c-420c-a497-f74266c121d7,02ef3c1a-a9a1-43c6-8b35-1f67954b7106,0706661e-ecf5-4ea3-b5bc-40440dde5737,0cca4f52-2c68-49c7-91a8-a1788b5370e0,105a530e-add7-48ed-b4c1-ce88ac3133e7,10d98045-046f-42a6-94ce-6aaa52faa991,1ddb6ad8-5651-4a20-bf70-f256335ee80a,2698e715-18bb-47f4-b81c-cdadbdf3f142,405e9a6b-97b4-4fd0-a273-089b2fe478ea,4a84545d-1106-4689-849a-658650ce0bc2,4a988acc-6e08-404c-9ab2-73bd2bda06df,58f04e3a-28c4-4754-84c0-345467550961,598882e1-a549-4f44-aaa8-e423e089008a,5b747066-341a-43ec-9993-9d03bf1cfd2c,66c9b5ee-3315-45e6-8361-f1b93455e86d,6f02fd37-83d5-4638-b078-6d0282114560,71b3b2da-4857-4c90-9683-e5056d80fb02,8146eb81-6722-4918-8d9d-61395da58469,8801e277-d8bd-41c1-8260-f96a5210be74,8b1f017c-76cb-4d43-bbc1-5817a7c8b7fb,9862d9bb-d5a9-4eb6-b91e-98acc5a95484,b0a64777-4a60-43c6-bd8d-2a486b5d46c4,b1b237cc-208e-4c1e-83ea-2f66de4f4656,b3888c7d-ff67-4901-844d-f294c0baa69b,de18312f-e653-4377-a3fe-a22466cc684e,f37df583-fb31-459f-8f2a-b14d4529f2e8,fab5edae-3df3-4f74-97bc-1d0afb5fc885,fef7f284-9926-464e-b6ae-87a7a889ebe3",
        "01fbc793-6079-4340-81e3-9ed9b699caa2,01fd5c8f-c457-4b58-b760-cdfab5377515,021f18bd-3ada-4225-b86a-a8230e7eb26a,0296f796-2e6c-420c-a497-f74266c121d7,02ef3c1a-a9a1-43c6-8b35-1f67954b7106,0463e18b-9180-4d79-8650-1b97622f8106,0706661e-ecf5-4ea3-b5bc-40440dde5737,0cca4f52-2c68-49c7-91a8-a1788b5370e0,105a530e-add7-48ed-b4c1-ce88ac3133e7,10d98045-046f-42a6-94ce-6aaa52faa991,1ddb6ad8-5651-4a20-bf70-f256335ee80a,20f81ec5-8f1b-4056-b885-6560011cb8a8,2698e715-18bb-47f4-b81c-cdadbdf3f142,2773ed37-6fff-4e4f-b104-73883ab81fcf,2f2b8f57-1b17-4be2-94c4-a4150dadd3ec,38e54299-07cb-4f45-ad46-66bd24e5ca52,3d8230d5-45b7-433d-a3cf-fc9d6f1868a0,424f4c39-bd47-4bf6-ba61-a9edc5316506,47c4ab94-ae76-4b07-888e-eef43fa6441a,48f88505-edb2-4cf6-86f2-8acce809af31,4a1fab6c-6e80-4cf5-a96f-fe72dd222c71,4a988acc-6e08-404c-9ab2-73bd2bda06df,4e0f8c32-2b51-429a-afa0-7dfea57b380e,58f04e3a-28c4-4754-84c0-345467550961,66c9b5ee-3315-45e6-8361-f1b93455e86d,67180f2b-c20c-40fb-9a85-13552030d79c,6ee97f02-b800-49fe-b73a-f55c1b57ed27,6f02fd37-83d5-4638-b078-6d0282114560,75c01c2c-fdc4-4bdf-88e2-f79b935ebcd6,7bc8f9c0-7bf6-4873-b6ea-39beccb3e20c,8323739b-392c-4268-8fd5-46d1fbf18e5d,8801e277-d8bd-41c1-8260-f96a5210be74,8b1f017c-76cb-4d43-bbc1-5817a7c8b7fb,8f437731-fa0a-4b59-ba75-ac58bea05531,90b303dc-c37b-440d-b05f-cb99ce52c73e,921c006e-4b3e-4483-af5c-7d5eb92c0c45,998e50ae-d1c4-48fa-8357-4dcbe3574517,a0fe3caa-57b4-4a0a-9f6d-abadc50770e3,b0942108-c200-4f03-b302-895c7e0d6877,b1b237cc-208e-4c1e-83ea-2f66de4f4656,b1d27efa-bfc2-4a93-99da-cac93faba80b,b6312173-48eb-428d-9a54-3511c9e6a10e,cc44d9f4-7d21-4666-b0c1-2893a03ff80c,d354ddb3-c351-45fa-a244-87ef339a282b,d928d4bc-d444-46a4-85ac-a64898841554,ee210c3e-6eec-4e90-a760-d78ef5aa73a2,ef59c37d-29a6-4972-bc97-e53024df23f1,f187b219-d4df-4831-84a3-886fde91b1e3,f37df583-fb31-459f-8f2a-b14d4529f2e8,f9cc24d3-40da-429b-a568-f02016d75131"
      ]
    )
  });
});