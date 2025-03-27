import { expect, test } from '@playwright/test';
import xlsx from 'xlsx';

test.describe('Download feature project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();
  });

  // A use case tests scenarios
  test('Download feature project with current date', async ({ page }) => {
    await page.getByTitle('Download Data').click();
    await page.getByLabel('Admin Level 0').check();
    await page.getByLabel('Admin Level 2').check();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    let download = await downloadPromise;
    let filePath = await download.path();
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    await expect(jsonData[0]).toStrictEqual({
      GeographyCode: 'SOM_V1',
      GeographyName: 'Somalia',
      GeographyLevel: 'Admin Level 0',
      IndicatorCode: 'SOM_TEST_IND_A',
      IndicatorName: 'Sample Indicator A',
      Value: '77',
      Date: '2020-01-01'
    });
    await expect(jsonData[1]).toStrictEqual({
      GeographyCode: 'SOM_0001_V1',
      GeographyName: 'Awdal',
      GeographyLevel: 'Admin Level 1',
      IndicatorCode: 'SOM_TEST_IND_A',
      IndicatorName: 'Sample Indicator A',
      Value: '61',
      Date: '2020-01-01'
    });
    await expect(jsonData[2]).toStrictEqual({
      GeographyCode: 'SOM_0002_V1',
      GeographyName: 'Bakool',
      GeographyLevel: 'Admin Level 1',
      IndicatorCode: 'SOM_TEST_IND_A',
      IndicatorName: 'Sample Indicator A',
      Value: '78',
      Date: '2020-01-01'
    });

    // TODO:
    //  We need to fix
    // await expect(jsonData[93]).toStrictEqual({
    //   GeographyCode: 'SOM_0001_0001_V1',
    //   GeographyName: 'Baki',
    //   GeographyLevel: 'Admin Level 2',
    //   IndicatorCode: '',
    //   IndicatorName: 'Dynamic Layer based on a list of interventions',
    //   Value: '178',
    //   Date: '2020-01-01T00:00:00+00:00'
    // });
    // await expect(jsonData[94]).toStrictEqual({
    //   GeographyCode: 'SOM_0001_0002_V1',
    //   GeographyName: 'Borama',
    //   GeographyLevel: 'Admin Level 2',
    //   IndicatorCode: '',
    //   IndicatorName: 'Dynamic Layer based on a list of interventions',
    //   Value: '376.5',
    //   Date: '2020-01-01T00:00:00+00:00'
    // });
    // await expect(jsonData[95]).toStrictEqual({
    //   GeographyCode: 'SOM_0002_0001_V1',
    //   GeographyName: 'Ceel Barde',
    //   GeographyLevel: 'Admin Level 2',
    //   IndicatorCode: '',
    //   IndicatorName: 'Dynamic Layer based on a list of interventions',
    //   Value: '687',
    //   Date: '2020-01-01T00:00:00+00:00'
    // });
  })

  // A use case tests scenarios
  test('Download feature project with all history', async ({ page }) => {
    await page.getByTitle('Download Data').click();
    await page.getByLabel('Admin Level 0').check();
    await page.getByLabel('Admin Level 2').check();
    await page.getByRole('row', { name: 'Dynamic Layer based on a list' }).getByRole('checkbox').check();
    await page.locator('#simple-popover div').filter({ hasText: 'Time filter' }).nth(4).click();
    await page.getByPlaceholder('Select 1 option').nth(4).click();
    await page.getByRole('option', { name: 'All history' }).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    let download = await downloadPromise;
    let filePath = await download.path();
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    await expect(jsonData[0]).toStrictEqual({
      GeographyCode: 'SOM_V1',
      GeographyName: 'Somalia',
      GeographyLevel: 'Admin Level 0',
      IndicatorCode: 'SOM_TEST_IND_A',
      IndicatorName: 'Sample Indicator A',
      Value: '77',
      Date: '2020-01-01'
    });
    await expect(jsonData[1]).toStrictEqual({
      GeographyCode: 'SOM_V1',
      GeographyName: 'Somalia',
      GeographyLevel: 'Admin Level 0',
      IndicatorCode: 'SOM_TEST_IND_A',
      IndicatorName: 'Sample Indicator A',
      Value: '90',
      Date: '2015-01-01'
    });
    await expect(jsonData[2]).toStrictEqual({
      GeographyCode: 'SOM_V1',
      GeographyName: 'Somalia',
      GeographyLevel: 'Admin Level 0',
      IndicatorCode: 'SOM_TEST_IND_A',
      IndicatorName: 'Sample Indicator A',
      Value: '86',
      Date: '2010-01-01'
    });
    await expect(jsonData[3]).toStrictEqual({
      GeographyCode: 'SOM_V1',
      GeographyName: 'Somalia',
      GeographyLevel: 'Admin Level 0',
      IndicatorCode: 'SOM_TEST_IND_A',
      IndicatorName: 'Sample Indicator A',
      Value: '50',
      Date: '2000-01-01'
    });
    await expect(jsonData[372]).toStrictEqual({
      GeographyCode: 'SOM_0001_0001_V1',
      GeographyName: 'Baki',
      GeographyLevel: 'Admin Level 2',
      IndicatorCode: '',
      IndicatorName: 'Dynamic Layer based on a list of interventions',
      Value: '178',
      Date: '2020-01-01T00:00:00+00:00'
    });
    await expect(jsonData[373]).toStrictEqual({
      GeographyCode: 'SOM_0001_0002_V1',
      GeographyName: 'Borama',
      GeographyLevel: 'Admin Level 2',
      IndicatorCode: '',
      IndicatorName: 'Dynamic Layer based on a list of interventions',
      Value: '159',
      Date: '2010-01-01T00:00:00+00:00'
    });
    await expect(jsonData[374]).toStrictEqual({
      GeographyCode: 'SOM_0001_0002_V1',
      GeographyName: 'Borama',
      GeographyLevel: 'Admin Level 2',
      IndicatorCode: '',
      IndicatorName: 'Dynamic Layer based on a list of interventions',
      Value: '594',
      Date: '2020-01-01T00:00:00+00:00'
    });
  })
})