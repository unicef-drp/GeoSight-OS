import { expect, test } from '@playwright/test';

test.describe('Check Project View Navbar', () => {
  // A use case tests scenarios
  test('Check Navbar Production', async ({ page }) => {
    await page.goto('/django-admin/core/sitepreferences/1/change/');
    await page.getByLabel('Site type:').selectOption('Production');
    await page.getByLabel('Georepo api key level 1:').fill('aa');
    await page.getByLabel('Georepo api key level 4:').fill('aa');
    await page.getByRole('button', { name: 'Save and continue editing' }).click();

    await page.goto('/project/demo-geosight-project');

    // Check initial state
    await page.getByRole('button', { name: 'Close' }).click();
    const headerLink = page.locator('a.NavHeaderLink');
    await expect(headerLink).toHaveText('GeoSight')

    await expect(page.locator('.Nav-Production')).toHaveCSS("background-color", 'rgb(28, 171, 226)');
  });

    // A use case tests scenarios
  test('Check Navbar Staging', async ({ page }) => {
    await page.goto('/django-admin/core/sitepreferences/1/change/');
    await page.getByLabel('Site type:').selectOption('Staging');
    await page.getByLabel('Georepo api key level 1:').fill('aa');
    await page.getByLabel('Georepo api key level 4:').fill('aa');
    await page.getByRole('button', { name: 'Save and continue editing' }).click();

    await page.goto('/project/demo-geosight-project');
    // Check initial state
    await page.getByRole('button', { name: 'Close' }).click();
    const headerLink = page.locator('a.NavHeaderLink');
    await expect(headerLink).toHaveText('GeoSight Staging')

    await expect(page.locator('.Nav-Staging')).toHaveCSS("background-color", 'rgb(255, 0, 0)');
  });

});