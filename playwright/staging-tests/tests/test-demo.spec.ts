import { test, expect } from '@playwright/test';

test.use({
  storageState: 'auth.json'
});

test('test', async ({ page }) => {
  await page.goto('https://staging-geosight.unitst.org/');
  await page.locator('div').filter({ hasText: 'GeoSight is an open-source' }).nth(3).click();
  await expect(page.getByRole('banner').getByRole('link', { name: 'Logo' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'GeoSight', exact: true })).toBeVisible();
  await expect(page.locator('div').filter({ hasText: 'GeoSight is an open-source' }).nth(3)).toBeVisible();
  await expect(page.getByRole('paragraph')).toContainText('GeoSight is an open-source web geospatial data platform developed by UNICEF for easy data visualization and analysis. It is specifically designed to simplify the creation of online maps for visualizing multiple indicators at a subnational level to support evidence-based decision-making for better results for children.');
  await expect(page.getByRole('link', { name: 'Demo GeoSight Project This is' })).toBeVisible();
  await page.getByRole('link', { name: 'Demo GeoSight Project This is' }).click();
  await expect(page.locator('div').filter({ hasText: 'Project Overview' }).nth(3)).toBeVisible();
  await expect(page.locator('body')).toContainText('This is a sample description of the GeoSight Demo Project using some custom markdown styling. The project showcases the various GeoSight functionalities, e.g. Single and Multi-Indicator Layers, Dynamic Layers, Indicator Layers created on Related Tables etc. The dashboard has been created for demonstration purposes only using random/mockup data.');
  await expect(page.locator('body')).toContainText('This is test');
  await expect(page.locator('body')).toContainText('Do not show this again!');
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByLabel('Map', { exact: true })).toBeVisible();
  await expect(page.getByText('Sample Indicator A83.00 - 99.')).toBeVisible();
  await page.getByLabel('Map', { exact: true }).click({
    position: {
      x: 710,
      y: 70
    }
  });
  await expect(page.locator('#map div').filter({ hasText: 'Ceerigaabo' }).nth(4)).toBeVisible();
  await expect(page.getByRole('rowgroup')).toContainText('Sample Indicator A');
  await expect(page.getByRole('cell', { name: '33' })).toBeVisible();
  await page.getByLabel('Close popup').click();
  await page.getByLabel('Map', { exact: true }).click({
    position: {
      x: 731,
      y: 263
    }
  });
  await expect(page.locator('#map div').filter({ hasText: 'Hobyo' }).nth(4)).toBeVisible();
  await expect(page.getByRole('rowgroup')).toContainText('Sample Indicator A');
  await expect(page.getByRole('cell', { name: '42' })).toBeVisible();
  await page.getByLabel('Close popup').click();
  await expect(page.locator('.widget__fill').first()).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Time WidgetAwdal \(SOMA_SOM_0001_V1\)Sample Indicator A$/ }).nth(1)).toBeVisible();
  await page.locator('section').filter({ hasText: 'Sample Indicator A83.00 - 99.' }).locator('canvas').click({
    position: {
      x: 259,
      y: 16
    }
  });
  await expect(page.locator('section').filter({ hasText: 'Sample Indicator A83.00 - 99.' }).locator('canvas')).toBeVisible();
  await page.locator('.ReactSelect__input-container').first().click();
  await page.getByRole('option', { name: 'Bakool (SOMA_SOM_0002_V1)' }).click();
  await expect(page.locator('section').filter({ hasText: 'Sample Indicator A83.00 - 99.' }).locator('canvas')).toBeVisible();
  await page.getByText('Sample Indicator B').click();
});