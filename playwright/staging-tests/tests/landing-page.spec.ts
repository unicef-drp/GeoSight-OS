import { test, expect } from '@playwright/test';

test.use({
  storageState: 'auth.json'
});

test('test', async ({ page }) => {
  await page.goto('https://staging-geosight.unitst.org/');
  await page.getByRole('banner').getByRole('link', { name: 'Logo' }).click();
  await page.getByRole('link', { name: 'GeoSight', exact: true }).click();
  await page.getByRole('combobox').first().click();
  await page.locator('.IconStart > div').click();
  await page.getByPlaceholder('Select 1 option').click();
  await page.getByRole('link', { name: 'GeoSight Sample Project for Senegal' }).click();
  await page.getByRole('link', { name: 'Logo' }).click();
  await page.getByRole('button', { name: 'Hide this banner' }).click();
  await page.getByRole('button', { name: 'Show banner' }).click();
  await page.getByRole('main').getByRole('link', { name: 'Logo' }).click();
  await page.getByText('Version 1.26.0').click();
  await page.getByRole('banner').getByRole('link').nth(3).click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Visit our Documentation' }).click();
  const page1 = await page1Promise;
});