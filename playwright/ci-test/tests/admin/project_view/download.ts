import { expect, test } from '@playwright/test';
import xlsx from 'xlsx';
import fs from 'fs';

test.describe('Download feature project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();
  });

  const expectExcel = async (expected, received) => {
    const rowReceived = { ...received }
    rowReceived.Value = "" + received.Value
    await expect(expected).toStrictEqual(rowReceived);
  }

  // A use case tests scenarios
  test('Download feature project with current date', async ({ page }) => {
    const output = [
      {
        GeographyCode: 'SOM_V1',
        GeographyName: 'Somalia',
        GeographyLevel: 'Admin Level 0',
        IndicatorCode: 'SOM_TEST_IND_A',
        IndicatorName: 'Sample Indicator A',
        Value: 77,
        Date: '2020-01-01'
      },
      {
        GeographyCode: 'SOM_0001_V1',
        GeographyName: 'Awdal',
        GeographyLevel: 'Admin Level 1',
        IndicatorCode: 'SOM_TEST_IND_A',
        IndicatorName: 'Sample Indicator A',
        Value: 61,
        Date: '2020-01-01'
      },
      {
        GeographyCode: 'SOM_0002_V1',
        GeographyName: 'Bakool',
        GeographyLevel: 'Admin Level 1',
        IndicatorCode: 'SOM_TEST_IND_A',
        IndicatorName: 'Sample Indicator A',
        Value: 78,
        Date: '2020-01-01'
      }
    ]
    await page.getByTitle('Download Data').click();
    await page.getByLabel('Admin Level 0').check();
    await page.getByLabel('Admin Level 2').check();
    let downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    let download = await downloadPromise;
    let filePath = await download.path();
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    await expectExcel(jsonData[0], output[0])
    await expectExcel(jsonData[1], output[1])
    await expectExcel(jsonData[2], output[2])

    // GEOJSON
    await page.getByRole('combobox', { name: 'Select 1 option' }).nth(1).click();
    await page.getByRole('option', { name: 'Geojson' }).click();

    downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    download = await downloadPromise;
    filePath = await download.path();
    const geojsonText = fs.readFileSync(filePath, 'utf8');

    // Parse it into a JS object
    const geojson = JSON.parse(geojsonText);
    const compare = async function (first, second) {
      for (const field of Object.keys(second)) {
        await expect(first[field]).toEqual(second[field]);
      }
    }
    await compare(geojson.features[0].properties, output[0])
    await compare(geojson.features[1].properties, output[1])
    await compare(geojson.features[2].properties, output[2])
  })

  // A use case tests scenarios
  test('Download feature project with all history', async ({ page }) => {
    const output = [
      {
        GeographyCode: 'SOM_V1',
        GeographyName: 'Somalia',
        GeographyLevel: 'Admin Level 0',
        IndicatorCode: 'SOM_TEST_IND_A',
        IndicatorName: 'Sample Indicator A',
        Value: 77,
        Date: '2020-01-01'
      },
      {
        GeographyCode: 'SOM_V1',
        GeographyName: 'Somalia',
        GeographyLevel: 'Admin Level 0',
        IndicatorCode: 'SOM_TEST_IND_A',
        IndicatorName: 'Sample Indicator A',
        Value: 90,
        Date: '2015-01-01'
      },
      {
        GeographyCode: 'SOM_V1',
        GeographyName: 'Somalia',
        GeographyLevel: 'Admin Level 0',
        IndicatorCode: 'SOM_TEST_IND_A',
        IndicatorName: 'Sample Indicator A',
        Value: 86,
        Date: '2010-01-01'
      },
      {
        GeographyCode: 'SOM_V1',
        GeographyName: 'Somalia',
        GeographyLevel: 'Admin Level 0',
        IndicatorCode: 'SOM_TEST_IND_A',
        IndicatorName: 'Sample Indicator A',
        Value: 50,
        Date: '2000-01-01'
      },
      {
        GeographyCode: 'SOM_0001_0001_V1',
        GeographyName: 'Baki',
        GeographyLevel: 'Admin Level 2',
        IndicatorCode: '',
        IndicatorName: 'Dynamic Layer based on a list of interventions',
        Value: 178,
        Date: '2020-01-01T00:00:00+00:00'
      },
      {
        GeographyCode: 'SOM_0001_0002_V1',
        GeographyName: 'Borama',
        GeographyLevel: 'Admin Level 2',
        IndicatorCode: '',
        IndicatorName: 'Dynamic Layer based on a list of interventions',
        Value: 159,
        Date: '2010-01-01T00:00:00+00:00'
      },
      {
        GeographyCode: 'SOM_0001_0002_V1',
        GeographyName: 'Borama',
        GeographyLevel: 'Admin Level 2',
        IndicatorCode: '',
        IndicatorName: 'Dynamic Layer based on a list of interventions',
        Value: 594,
        Date: '2020-01-01T00:00:00+00:00'
      }
    ]
    await page.getByTitle('Download Data').click();
    await page.getByLabel('Admin Level 0').check();
    await page.getByLabel('Admin Level 2').check();
    await page.getByRole('row', { name: 'Dynamic Layer based on a list' }).getByRole('checkbox').check();
    await page.locator('#simple-popover div').filter({ hasText: 'Time filter' }).nth(4).click();
    await page.getByPlaceholder('Select 1 option').nth(4).click();
    await page.getByRole('option', { name: 'All history' }).click();
    let downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    let download = await downloadPromise;
    let filePath = await download.path();
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    await expectExcel(jsonData[0], output[3])
    await expectExcel(jsonData[1], output[2])
    await expectExcel(jsonData[2], output[1])
    await expectExcel(jsonData[3], output[0])
    await expectExcel(jsonData[372], output[4])
    await expectExcel(jsonData[373], output[5])
    await expectExcel(jsonData[374], output[6])

    // GEOJSON
    await page.getByRole('combobox', { name: 'Select 1 option' }).nth(1).click();
    await page.getByRole('option', { name: 'Geojson' }).click();

    downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    download = await downloadPromise;
    filePath = await download.path();
    const geojsonText = fs.readFileSync(filePath, 'utf8');

    // Parse it into a JS object
    const geojson = JSON.parse(geojsonText);
    const compare = async function (first, second) {
      for (const field of Object.keys(second)) {
        await expect(first[field]).toEqual(second[field]);
      }
    }
    await compare(geojson.features[0].properties, output[3])
    await compare(geojson.features[1].properties, output[2])
    await compare(geojson.features[2].properties, output[1])
    await compare(geojson.features[3].properties, output[0])
    await compare(geojson.features[372].properties, output[4])
    await compare(geojson.features[373].properties, output[5])
    await compare(geojson.features[374].properties, output[6])
  })
})