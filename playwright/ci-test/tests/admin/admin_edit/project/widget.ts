import { expect, test } from '@playwright/test';

// URL That we need to check
const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('View edit project widget', () => {
  test('Edit widget', async ({ page }) => {
    let onRun = null
    let onFinish = null
    page.on('console', msg => {
      if (msg.text().indexOf('WIDGET_CONFIG:') !== -1) {
        try {
          const log = msg.text().replace('WIDGET_CONFIG:', '')
          if (log) {
            onRun = log
          }
        } catch (e) {
          console.log(e)

        }
      }
      if (msg.text().indexOf('WIDGET_FINISH:') !== -1) {
        try {
          const log = msg.text().replace('WIDGET_FINISH:', '')
          if (log) {
            onFinish = log
          }
        } catch (e) {
          console.log(e)

        }
      }
    });

    // --------------------------------------------------------------------
    // Check filter is hidden or not
    await page.goto('/admin/project/demo-geosight-project/edit');
    await page.getByText('Widgets (5)').click();
    await page.getByRole('button', { name: 'Add Widget' }).click();
    await expect(onRun).toEqual(`{"name":"","description":"","type":"GenericSummaryWidget","config":{"seriesType":"None","indicators":[],"indicatorsType":"Predefined list","indicatorsPaletteColor":0,"geographicalUnit":[],"geographicalUnitType":"Predefined list","geographicalUnitPaletteColor":0,"dateTimeType":"Sync with dashboard","dateTimeConfig":{"minDateFilter":null,"maxDateFilter":null,"interval":"Daily"},"aggregation":{"method":"SUM","decimalPlace":0,"useDecimalPlace":false,"useAutoUnits":false},"sort":{"field":"Name","method":"Ascending","topN":0,"useTopN":false}}}`)
    await page.getByRole('textbox', { name: 'Widget name' }).fill('This is widget');
    await page.getByRole('textbox', { name: 'Widget description' }).fill('This is description');
    await expect(onRun).toEqual(`{"name":"This is widget","description":"This is description","type":"GenericSummaryWidget","config":{"seriesType":"None","indicators":[],"indicatorsType":"Predefined list","indicatorsPaletteColor":0,"geographicalUnit":[],"geographicalUnitType":"Predefined list","geographicalUnitPaletteColor":0,"dateTimeType":"Sync with dashboard","dateTimeConfig":{"minDateFilter":null,"maxDateFilter":null,"interval":"Daily"},"aggregation":{"method":"SUM","decimalPlace":0,"useDecimalPlace":false,"useAutoUnits":false},"sort":{"field":"Name","method":"Ascending","topN":0,"useTopN":false}}}`)

    await expect(page.getByText('Sort by')).not.toBeVisible();
    await page.getByText('Indicators', { exact: true }).nth(2).click();
    await expect(onRun).toEqual(`{"name":"This is widget","description":"This is description","type":"GenericSummaryWidget","config":{"seriesType":"Indicators","indicators":[],"indicatorsType":"Predefined list","indicatorsPaletteColor":0,"geographicalUnit":[],"geographicalUnitType":"Predefined list","geographicalUnitPaletteColor":0,"dateTimeType":"Sync with dashboard","dateTimeConfig":{"minDateFilter":null,"maxDateFilter":null,"interval":"Daily"},"aggregation":{"method":"SUM","decimalPlace":0,"useDecimalPlace":false,"useAutoUnits":false},"sort":{"field":"Name","method":"Ascending","topN":0,"useTopN":false}}}`)
    await expect(page.getByText('Sort by')).toBeVisible();

    await page.locator('label').filter({ hasText: 'Decimal places' }).locator('span').first().click();
    await page.locator('div').filter({ hasText: /^SUMMINMAXAVGCOUNTCOUNT_UNIQUEDecimal placesAuto units$/ }).getByRole('spinbutton').click();
    await page.locator('div').filter({ hasText: /^SUMMINMAXAVGCOUNTCOUNT_UNIQUEDecimal placesAuto units$/ }).getByRole('spinbutton').fill('2');
    await page.getByRole('radio', { name: 'COUNT', exact: true }).check();
    await page.getByText('Auto units').click();

    await expect(onRun).toEqual(`{"name":"This is widget","description":"This is description","type":"GenericSummaryWidget","config":{"seriesType":"Indicators","indicators":[],"indicatorsType":"Predefined list","indicatorsPaletteColor":0,"geographicalUnit":[],"geographicalUnitType":"Predefined list","geographicalUnitPaletteColor":0,"dateTimeType":"Sync with dashboard","dateTimeConfig":{"minDateFilter":null,"maxDateFilter":null,"interval":"Daily"},"aggregation":{"method":"COUNT","decimalPlace":2,"useDecimalPlace":true,"useAutoUnits":true},"sort":{"field":"Name","method":"Ascending","topN":0,"useTopN":false}}}`)

    await page.locator('label').filter({ hasText: 'Top N' }).getByTestId('CheckBoxOutlineBlankIcon').click();
    await page.getByText('Descending').click();
    await page.getByText('Value', { exact: true }).click();
    await page.locator('div').filter({ hasText: /^NameCodeValueAscendingDescendingTop N$/ }).getByRole('spinbutton').click();
    await page.locator('div').filter({ hasText: /^NameCodeValueAscendingDescendingTop N$/ }).getByRole('spinbutton').fill('3');
    await expect(onRun).toEqual(`{"name":"This is widget","description":"This is description","type":"GenericSummaryWidget","config":{"seriesType":"Indicators","indicators":[],"indicatorsType":"Predefined list","indicatorsPaletteColor":0,"geographicalUnit":[],"geographicalUnitType":"Predefined list","geographicalUnitPaletteColor":0,"dateTimeType":"Sync with dashboard","dateTimeConfig":{"minDateFilter":null,"maxDateFilter":null,"interval":"Daily"},"aggregation":{"method":"COUNT","decimalPlace":2,"useDecimalPlace":true,"useAutoUnits":true},"sort":{"field":"Value","method":"Descending","topN":3,"useTopN":true}}}`)
  })
});