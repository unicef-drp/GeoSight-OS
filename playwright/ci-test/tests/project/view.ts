import { expect, test } from '@playwright/test';

// URL That we need to check
const timeout = 2000;

test.describe('View project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/project/demo-geosight-project');
  });

  // A use case tests scenarios
  test('View project', async ({ page }) => {
    let lastLog = null
    page.on('console', msg => {
      if (msg.text().indexOf('VALUED_GEOM:') !== -1) {
        try {
          lastLog = msg.text().replace('VALUED_GEOM:', '')
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
    await expect(page.getByLabel(layer1)).toBeChecked();
    await expect(page.getByLabel(layer2)).not.toBeChecked();

    // Check widgets
    await expect(page.locator('.widget__sw__content')).toContainText('895');

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
    // CHECK TOOLS
    // ----------------------------------------------------------------------------
    await page.getByTitle('Start Measurement').click();
    await expect(page.getByText('Measure distances and areas')).toBeVisible();
    await page.getByTitle('Zonal Analysis').click();
    await expect(page.getByText('Extract zonal statistic')).toBeVisible();

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
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByLabel(layer1)).toBeVisible();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
    await expect(page.getByLabel(layer1)).toBeChecked();
    await expect(page.getByLabel(layer2)).not.toBeChecked();
  });
});