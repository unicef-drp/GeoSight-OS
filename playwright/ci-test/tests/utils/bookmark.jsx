import { expect } from "@playwright/test";

export const layer1 = 'Sample Indicator A'
export const layer2 = 'Sample Indicator B'
export const kenyaLayer = 'Kenya Indicator A'
export const contextLayer = 'Somalia sample context layer'

export const selection = async (page) => {
  // Change the context layers
  await page.getByRole('tab', { name: 'Context Layers' }).click();
  await page.getByLabel(contextLayer).click();
  await page.getByRole('tab', { name: 'Indicators' }).click();

  // Check the label
  await page.getByLabel(layer2).click();
  await page.getByTitle('Turn on compare Layers').click();
  await page.getByLabel(kenyaLayer).click();
  await page.getByRole('tab', { name: 'Filters' }).click();
  await page.getByRole('button', { name: 'Indicator A above X% Delete' }).getByRole('checkbox').check();
  await page.getByRole('tab', { name: 'Layers' }).click();

  // Update indicator layer transparency
  const slider = await page.locator('#simple-tabpanel-1.layers-panel .Transparency .MuiSlider-root');
  await slider.evaluate(el => el.scrollIntoView({
    behavior: 'auto',
    block: 'center'
  }));
  await page.waitForTimeout(100);
  const box = await slider.boundingBox();

  if (box) {
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    await page.mouse.click(x, y);
  }
  await expect(page.locator('#simple-tabpanel-1.layers-panel .Transparency .MuiSlider-valueLabelLabel').getByText('50', { exact: true })).toBeVisible();
}

export const defaultCheck = async (page) => {
  await expect(page.locator('#simple-tabpanel-1.layers-panel .Transparency .MuiSlider-valueLabelLabel').getByText('100', { exact: true })).toBeVisible();
  await expect(page.getByTitle('Turn on compare Layers')).toBeVisible();
  await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
  await expect(page.getByLabel(layer1)).toBeChecked();
  await expect(page.getByLabel(layer2)).not.toBeChecked();
  await expect(page.getByLabel(kenyaLayer)).not.toBeChecked();

  // Check widgets
  await expect(page.locator('.widget__title').nth(0)).toContainText('Total of Sample indicator A');
  await expect(page.locator('.widget__title').nth(1)).toContainText('Total of Dynamic Layer');
  await expect(page.locator('.widget__title').nth(2)).toContainText('Time Chart by Entity');
  await expect(page.locator('.widget__title').nth(3)).toContainText('Time Chart by Indicator');
  await expect(page.locator('.widget__title').nth(4)).toContainText('Value by Geom Code');
  await expect(page.locator('.widget__sw__content').nth(0)).toContainText('895');
  await expect(page.locator('.widget__sw__content').nth(1)).toContainText('978.5');
  await expect(page.locator('.widget__sgw').nth(0).locator('.ReactSelect__single-value').first()).toContainText('Sample Indicator A');
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

  // Check context layers
  await page.getByRole('tab', { name: 'Context Layers' }).click();
  await expect(page.getByLabel(contextLayer)).not.toBeChecked();
  await expect(page.getByText('Sample ArcGIS layer')).not.toBeVisible();
  await page.getByRole('tab', { name: 'Indicators' }).click();
}

export const defaultBookmark = async (page) => {
  await expect(page.locator('#simple-tabpanel-1.layers-panel .Transparency .MuiSlider-valueLabelLabel').getByText('50', { exact: true })).toBeVisible();
  await expect(page.getByLabel(layer1)).not.toBeChecked();
  await expect(page.getByLabel(layer2)).toBeChecked();
  await expect(page.getByLabel(kenyaLayer)).toBeChecked();
  let titles = await page.locator('.MapLegendSectionTitle').allTextContents();
  titles = titles.map(content => content.replace(' (Outline)', '').replace(' (Inner)', ''))
  await expect(titles).toContain(layer2);
  await expect(titles).toContain(kenyaLayer);

  // Check widgets
  await expect(page.locator('.widget__title').nth(0)).toContainText('Total of Sample indicator A');
  await expect(page.locator('.widget__title').nth(1)).toContainText('Total of Dynamic Layer');
  await expect(page.locator('.widget__title').nth(2)).toContainText('Time Chart by Entity');
  await expect(page.locator('.widget__title').nth(3)).toContainText('Time Chart by Indicator');
  await expect(page.locator('.widget__title').nth(4)).toContainText('Value by Geom Code');
  await expect(page.locator('.widget__sw__content').nth(0)).toContainText('623');
  await expect(page.locator('.widget__sw__content').nth(1)).toContainText('562');
  const values = await page.locator('.widget__sgw').nth(0).locator('.ReactSelect__single-value').first().allTextContents();
  await expect([layer2, kenyaLayer]).toContain(values[0]);
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

  // Check context layers
  await page.getByRole('tab', { name: 'Context Layers' }).click();
  await expect(page.getByLabel(contextLayer)).toBeChecked();
  await expect(page.getByText('Sample ArcGIS layer')).toBeVisible();
  await page.getByRole('tab', { name: 'Indicators' }).click();
}