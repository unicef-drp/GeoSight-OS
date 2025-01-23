import { expect, test } from '@playwright/test';

test.describe('Check Project View Navbar', () => {
  // A use case tests scenarios
  test('Check Navbar Production', async ({ page }) => {
    await page.goto('/django-admin/core/sitepreferences/1/change/');
    await page.getByLabel('Site type:').selectOption('Production');
    await page.getByRole('button', { name: 'Save and continue editing' }).click();

    await page.goto('/project/demo-geosight-project');

    // Check initial state
    await page.getByRole('button', { name: 'Close' }).click();
    const headerLink = page.locator('a.NavHeaderLink');
    await expect(headerLink).toHaveText('GeoSight')

    const navBar = page.locator('.Nav-Production');
    // Check the CSS property
    const backgroundColor = await navBar.evaluate((element) =>
      window.getComputedStyle(element).getPropertyValue('background-color')
    );

    // Assert the background color (adjust the expected value)
    expect(backgroundColor).toBe('rgb(28, 171, 226)');
  });

    // A use case tests scenarios
  test('Check Navbar Staging', async ({ page }) => {
    await page.goto('/django-admin/core/sitepreferences/1/change/');
    await page.getByLabel('Site type:').selectOption('Staging');
    await page.getByRole('button', { name: 'Save and continue editing' }).click();

    await page.goto('/project/demo-geosight-project');
    // Check initial state
    await page.getByRole('button', { name: 'Close' }).click();
    const headerLink = page.locator('a.NavHeaderLink');
    await expect(headerLink).toHaveText('GeoSight Staging')

    const navBar = page.locator('.Nav-Staging');
    // Check the CSS property
    const backgroundColor = await navBar.evaluate((element) =>
      window.getComputedStyle(element).getPropertyValue('background-color')
    );

    // Assert the background color (adjust the expected value)
    expect(backgroundColor).toBe('rgb(255, 0, 0)');
  });

});