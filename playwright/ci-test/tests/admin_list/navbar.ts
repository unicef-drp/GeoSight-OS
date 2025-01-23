import { expect, test } from '@playwright/test';

test.describe('Check Admin Navbar', () => {
  // A use case tests scenarios
  test('Check Navbar Production', async ({ page }) => {
    await page.goto('/django-admin/core/sitepreferences/1/change/');
    await page.getByLabel('Site type:').selectOption('Production');
    await page.getByLabel('Georepo api key level 1:').fill('aa');
    await page.getByLabel('Georepo api key level 4:').fill('aa');
    await page.getByRole('button', { name: 'Save and continue editing' }).click();

    await page.goto('/admin/indicators/');

    // Check initial state
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

    await page.goto('/admin/indicators/');
    // Check initial state
    const headerLink = page.locator('a.NavHeaderLink');
    await expect(headerLink).toHaveText('GeoSight Staging')
    await expect(page.locator('a.NavHeaderLink span')).toHaveCSS('display', 'none');
    await expect(page.locator('a.NavHeaderLink span')).toHaveText('Staging');

    await expect(page.locator('.Nav-Staging')).toHaveCSS("background-color", 'rgb(255, 0, 0)');
  });

});