import { test, expect } from '@playwright/test';

test.use({
  storageState: 'auth.json'
});

test('test', async ({ page }) => {
  await page.goto('https://staging-geosight.unitst.org/');
  await page.getByRole('link', { name: 'GeoSight Sample Project for Senegal' }).click();
  await page.getByRole('button', { name: 'Admin panel' }).click();
  await page.getByRole('link', { name: 'Indicators' }).click();
  await page.getByRole('link', { name: 'Context Layers' }).click();
  await page.getByRole('link', { name: 'Basemaps' }).click();
  await page.getByRole('link', { name: 'Styles' }).click();
  await page.getByRole('link', { name: 'Data Management' }).click();
  await page.getByRole('link', { name: 'Data Browser' }).click();
  await page.getByRole('link', { name: 'Related Tables' }).click();
  await page.getByRole('link', { name: 'Data Access' }).click();
  await page.getByRole('link', { name: 'Users and groups' }).click();
  await page.getByRole('link', { name: 'Access Request' }).click();
  await page.getByRole('link', { name: 'View all dashboard(s)' }).click();
});