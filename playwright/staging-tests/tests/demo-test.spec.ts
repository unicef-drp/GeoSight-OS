import { test, expect } from '@playwright/test';

test.use({
  storageState: 'auth.json'
});

test('test', async ({ page }) => {
  await page.goto('https://staging-geosight.unitst.org/');
  await expect(page.getByRole('paragraph')).toContainText('GeoSight is an open-source web geospatial data platform developed by UNICEF for easy data visualization and analysis. It is specifically designed to simplify the creation of online maps for visualizing multiple indicators at a subnational level to support evidence-based decision-making for better results for children.');
  await expect(page.getByRole('link', { name: 'Demo GeoSight Project This is' })).toBeVisible();
  await page.getByRole('link', { name: 'Demo GeoSight Project This is' }).click();
  await expect(page.getByText('Project Overview')).toBeVisible();
  await expect(page.locator('body')).toContainText('This is a sample description of the GeoSight Demo Project using some custom markdown styling. The project showcases the various GeoSight functionalities, e.g. Single and Multi-Indicator Layers, Dynamic Layers, Indicator Layers created on Related Tables etc. The dashboard has been created for demonstration purposes only using random/mockup data.');
  await expect(page.locator('body')).toContainText('This is test');
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByPlaceholder('Search Indicators')).toBeEmpty();
  await page.getByLabel('Map', { exact: true }).click({
    position: {
      x: 791,
      y: 142
    }
  });
  await expect(page.locator('#map div').filter({ hasText: 'Qardho' }).nth(4)).toBeVisible();
  await expect(page.getByRole('cell', { name: '68', exact: true })).toBeVisible();
  await page.getByLabel('Close popup').click();
  await page.getByLabel('Map', { exact: true }).click({
    position: {
      x: 713,
      y: 280
    }
  });
  await expect(page.locator('#map div').filter({ hasText: 'Hobyo' }).nth(4)).toBeVisible();
  await expect(page.getByRole('rowgroup')).toContainText('42');
  await page.getByLabel('Close popup').click();
  await page.getByLabel('Map', { exact: true }).click({
    position: {
      x: 609,
      y: 332
    }
  });
  await expect(page.locator('#map div').filter({ hasText: 'Belet Weyne' }).nth(4)).toBeVisible();
  await expect(page.getByRole('rowgroup')).toContainText('79');
  await page.getByLabel('Close popup').click();
  await expect(page.getByText('Sample Indicator A83.00 - 99.')).toBeVisible();
  await page.locator('section').filter({ hasText: 'Sample Indicator A83.00 - 99.' }).locator('canvas').click({
    position: {
      x: 241,
      y: 23
    }
  });
  await page.locator('section').filter({ hasText: 'Sample Indicator A83.00 - 99.' }).locator('canvas').click({
    position: {
      x: 179,
      y: 55
    }
  });
  await page.locator('section').filter({ hasText: 'Sample Indicator A83.00 - 99.' }).locator('canvas').click({
    position: {
      x: 259,
      y: 15
    }
  });
  await page.locator('section').filter({ hasText: 'Sample Indicator A83.00 - 99.' }).locator('canvas').click({
    position: {
      x: 33,
      y: 131
    }
  });
  await page.getByTitle('Reset tilt. Hold left Ctrl').click();
  await page.getByTitle('Reset tilt. Hold left Ctrl').click();
  await page.getByPlaceholder('Search Geography Entity').click();
  await page.getByPlaceholder('Search Geography Entity').fill('somalia');
  await page.getByRole('option', { name: 'Somalia Country' }).click();
  await page.locator('.MuiInputAdornment-root').click();
  await page.getByPlaceholder('Search Geography Entity').click();
  await page.getByPlaceholder('Search Geography Entity').fill('somalia');
  await page.getByRole('option', { name: 'Somalia Country' }).click();
});