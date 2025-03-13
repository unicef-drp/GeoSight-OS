import { expect, test } from '@playwright/test';

// URL That we need to check
const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('View project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/project/demo-geosight-project');
  });

  // A use case tests scenarios
  test('View project', async ({ page }) => {
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
    });

    // Check initial state
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
    await expect(lastLogLabel).toEqual("SOM_0001_V1,61,SOM_0002_V1,78,SOM_0003_V1,30,SOM_0004_V1,11,SOM_0005_V1,40,SOM_0008_V1,32,SOM_0009_V1,96,SOM_0010_V1,59,SOM_0006_V1,10,SOM_0007_V1,40,SOM_0011_V1,74,SOM_0012_V1,94,SOM_0013_V1,63,SOM_0014_V1,68,SOM_0015_V1,14,SOM_0016_V1,35,SOM_0017_V1,89,SOM_0018_V1,1");
    await page.getByRole('tab', { name: 'Filters' }).click();
    lastLogLabel = null
    await page.getByRole('button', { name: 'Indicator A above X% Delete' }).getByRole('checkbox').check();
    await expect(page.locator('.widget__sw__content').nth(1)).toContainText('562');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await expect(lastLogLabel).toEqual("SOM_0001_V1,61,SOM_0002_V1,78,SOM_0009_V1,96,SOM_0011_V1,74,SOM_0012_V1,94,SOM_0013_V1,63,SOM_0014_V1,68,SOM_0017_V1,89");
    await page.getByRole('button', { name: 'Indicator A above X% Delete' }).getByRole('checkbox').uncheck();
    await page.getByRole('tab', { name: 'Layers' }).click();

    // --------------------------------
    // Check multi reference layer
    // --------------------------------
    await expect(page.locator('.ReferenceLayerLevelSelected')).toContainText('Admin Level 1')
    const kenyaLayer = 'Kenya Indicator A'
    await page.getByLabel(kenyaLayer).click();
    await expect(page.locator('.ReferenceLayerLevelSelected')).toContainText('Level 1')
    await expect(lastLog).toEqual("KEN_0001_V1,KEN_0002_V1,KEN_0003_V1,KEN_0004_V1,KEN_0005_V1,KEN_0006_V1,KEN_0007_V1,KEN_0008_V1,KEN_0009_V1,KEN_0010_V1,KEN_0011_V1,KEN_0012_V1,KEN_0013_V1,KEN_0014_V1,KEN_0015_V1,KEN_0016_V1,KEN_0017_V1,KEN_0018_V1,KEN_0019_V1,KEN_0020_V1,KEN_0021_V1,KEN_0022_V1,KEN_0023_V1,KEN_0024_V1,KEN_0025_V1,KEN_0026_V1,KEN_0027_V1,KEN_0028_V1,KEN_0029_V1,KEN_0030_V1,KEN_0031_V1,KEN_0032_V1,KEN_0033_V1,KEN_0034_V1,KEN_0035_V1,KEN_0036_V1,KEN_0037_V1,KEN_0038_V1,KEN_0039_V1,KEN_0040_V1,KEN_0041_V1,KEN_0042_V1,KEN_0043_V1,KEN_0044_V1,KEN_0045_V1,KEN_0046_V1,KEN_0047_V1");
    await expect(lastLogLabel).toEqual("KEN_0028_V1,4,KEN_0029_V1,3,KEN_0030_V1,2,KEN_0031_V1,1,KEN_0032_V1,2,KEN_0033_V1,3,KEN_0034_V1,2,KEN_0035_V1,6,KEN_0036_V1,1,KEN_0037_V1,8,KEN_0038_V1,3,KEN_0039_V1,4,KEN_0040_V1,1,KEN_0041_V1,2,KEN_0042_V1,3,KEN_0043_V1,8,KEN_0044_V1,3,KEN_0045_V1,4,KEN_0046_V1,3,KEN_0047_V1,1,KEN_0001_V1,1,KEN_0002_V1,2,KEN_0003_V1,1,KEN_0004_V1,2,KEN_0005_V1,3,KEN_0006_V1,6,KEN_0007_V1,7,KEN_0008_V1,4,KEN_0009_V1,5,KEN_0010_V1,3,KEN_0011_V1,4,KEN_0012_V1,7,KEN_0013_V1,6,KEN_0014_V1,8,KEN_0015_V1,1,KEN_0016_V1,2,KEN_0017_V1,1,KEN_0018_V1,2,KEN_0019_V1,3,KEN_0020_V1,4,KEN_0021_V1,3,KEN_0022_V1,2,KEN_0023_V1,1,KEN_0024_V1,2,KEN_0025_V1,3,KEN_0026_V1,4,KEN_0027_V1,5");

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
    await expect(lastLog).toEqual("SOM_0001_0001_V1");

    await page.getByRole('option', { name: 'HEALTH' }).click();
    await expect(lastLog).toEqual("SOM_0001_0001_V1,SOM_0001_0002_V1,SOM_0001_0003_V1,SOM_0001_0004_V1,SOM_0002_0001_V1,SOM_0002_0002_V1,SOM_0004_0001_V1,SOM_0004_0002_V1,SOM_0004_0003_V1,SOM_0004_0004_V1,SOM_0004_0005_V1,SOM_0004_0006_V1,SOM_0006_0001_V1,SOM_0006_0002_V1,SOM_0006_0003_V1,SOM_0006_0004_V1,SOM_0006_0005_V1,SOM_0007_0001_V1,SOM_0007_0002_V1,SOM_0007_0003_V1,SOM_0007_0004_V1,SOM_0007_0005_V1,SOM_0009_0001_V1,SOM_0009_0002_V1,SOM_0009_0003_V1,SOM_0009_0004_V1,SOM_0010_0001_V1,SOM_0010_0002_V1,SOM_0010_0007_V1,SOM_0011_0001_V1,SOM_0011_0002_V1,SOM_0011_0003_V1,SOM_0012_0001_V1,SOM_0012_0002_V1,SOM_0012_0003_V1,SOM_0012_0004_V1,SOM_0013_0001_V1,SOM_0013_0002_V1,SOM_0014_0002_V1,SOM_0014_0003_V1,SOM_0015_0001_V1,SOM_0015_0002_V1,SOM_0015_0003_V1,SOM_0016_0001_V1,SOM_0017_0002_V1,SOM_0017_0003_V1,SOM_0017_0004_V1,SOM_0018_0001_V1,SOM_0018_0002_V1,SOM_0018_0003_V1");

    await page.getByRole('option', { name: 'EDU' }).click();
    await expect(lastLog).toEqual("SOM_0002_0002_V1,SOM_0002_0003_V1,SOM_0002_0004_V1,SOM_0002_0005_V1,SOM_0003_0001_V1,SOM_0004_0006_V1,SOM_0005_0001_V1,SOM_0005_0002_V1,SOM_0005_0003_V1,SOM_0005_0004_V1,SOM_0007_0005_V1,SOM_0007_0006_V1,SOM_0008_0001_V1,SOM_0008_0002_V1,SOM_0008_0003_V1,SOM_0010_0002_V1,SOM_0010_0003_V1,SOM_0010_0004_V1,SOM_0010_0005_V1,SOM_0010_0006_V1,SOM_0013_0002_V1,SOM_0013_0003_V1,SOM_0013_0004_V1,SOM_0013_0005_V1,SOM_0014_0001_V1,SOM_0016_0001_V1,SOM_0016_0002_V1,SOM_0016_0003_V1,SOM_0016_0004_V1,SOM_0017_0001_V1");

    await page.getByRole('option', { name: 'WASH' }).click();
    await expect(lastLog).toEqual("SOM_0001_0001_V1,SOM_0001_0002_V1,SOM_0002_0001_V1,SOM_0002_0003_V1,SOM_0002_0005_V1,SOM_0003_0001_V1,SOM_0004_0001_V1,SOM_0004_0002_V1,SOM_0004_0005_V1,SOM_0005_0001_V1,SOM_0005_0003_V1,SOM_0005_0004_V1,SOM_0006_0001_V1,SOM_0006_0002_V1,SOM_0006_0003_V1,SOM_0006_0004_V1,SOM_0006_0005_V1,SOM_0007_0001_V1,SOM_0007_0004_V1,SOM_0007_0006_V1,SOM_0008_0002_V1,SOM_0008_0003_V1,SOM_0009_0001_V1,SOM_0009_0002_V1,SOM_0010_0001_V1,SOM_0010_0003_V1,SOM_0010_0005_V1,SOM_0010_0006_V1,SOM_0010_0007_V1,SOM_0011_0001_V1,SOM_0011_0002_V1,SOM_0011_0003_V1,SOM_0012_0001_V1,SOM_0012_0002_V1,SOM_0013_0001_V1,SOM_0013_0003_V1,SOM_0013_0005_V1,SOM_0014_0001_V1,SOM_0014_0002_V1,SOM_0014_0003_V1,SOM_0015_0003_V1,SOM_0016_0002_V1,SOM_0016_0004_V1,SOM_0017_0001_V1,SOM_0017_0002_V1,SOM_0017_0003_V1,SOM_0017_0004_V1,SOM_0018_0001_V1,SOM_0018_0002_V1,SOM_0018_0003_V1");

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

    // ----------------------------------------------------------------------------
    // BOOKMARK
    // ----------------------------------------------------------------------------
    // Create bookmark with Dynamic Layer as default
    await page.getByTitle('Bookmark').locator('a').click();
    await page.getByRole('button', { name: 'Save As...' }).click();
    await page.getByLabel('Bookmark Name').fill('Bookmark 1');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByLabel(layer1)).not.toBeChecked();
    await expect(page.getByLabel(layer2)).toBeChecked();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer2);

    // Click default on bookmark
    await page.getByText('Default').click();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
    await expect(page.getByLabel(layer1)).toBeChecked();
    await expect(page.getByLabel(layer2)).not.toBeChecked();

    // Click Bookmark Sample Indicator B
    await page.getByText('Bookmark 1').click();
    await expect(page.getByLabel(layer1)).not.toBeChecked();
    await expect(page.getByLabel(layer2)).toBeChecked();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer2);

    // Delete the bookmark and it will back to default
    page.once('dialog', async dialog => {
      // Verify Dialog Message
      await expect(dialog.message()).toContain(`Are you sure you want to delete Bookmark 1?`);

      //Click on OK Button
      await dialog.accept();
    });
    await page.locator('.Bookmark  .DeleteIcon').click();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
    await expect(page.getByLabel(layer1)).toBeChecked();
    await expect(page.getByLabel(layer2)).not.toBeChecked();

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
  });
});