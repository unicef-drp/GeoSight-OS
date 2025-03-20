import { expect, test } from '@playwright/test';
import { defaultBookmark, selection } from '../utils/bookmark'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('Embed project', () => {
  test('Test embed project', async ({ page }) => {
    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();

    // --------------------------------------------
    // Selection
    await selection(page)
    await defaultBookmark(page)

    // Embed
    await page.getByTitle('Get embed code').click();
    await page.getByRole('button', { name: 'Generate' }).click();
    await page.waitForTimeout(3000);
    const embedUrl = await page.locator('.modal--footer input').inputValue()
    await expect(embedUrl.includes('/embed/')).toBeTruthy();

    // Got to embed page
    await page.goto(embedUrl);
    await page.getByRole('button', { name: 'Close' }).click();
    await defaultBookmark(page)

    // Check the test
    await expect(page.getByRole('tab', {
      name: 'Layers',
      exact: true
    })).toBeVisible();
    await expect(page.getByRole('tab', {
      name: 'Filters',
      exact: true
    })).toBeVisible();
    await expect(page.locator('.RightContent')).toBeVisible();
    await expect(page.locator('#map')).toBeVisible();
  });

  test('Test embed project 2', async ({ page }) => {
    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();

    // --------------------------------------------
    // Selection
    await selection(page)
    await defaultBookmark(page)

    // Embed
    await page.getByTitle('Get embed code').click();
    await page.getByText('Layer Tab').click();
    await page.getByText('Widget Tab').click();

    await page.getByRole('button', { name: 'Generate' }).click();
    await page.waitForTimeout(3000);
    const embedUrl = await page.locator('.modal--footer input').inputValue()
    await expect(embedUrl.includes('/embed/')).toBeTruthy();

    // Got to embed page
    await page.goto(embedUrl);
    await page.getByRole('button', { name: 'Close' }).click();

    // Check the test
    await expect(page.getByRole('tab', {
      name: 'Layers',
      exact: true
    })).not.toBeVisible();
    await expect(page.getByRole('tab', {
      name: 'Filters',
      exact: true
    })).toBeVisible();
    await expect(page.locator('.RightContent')).not.toBeVisible();
    await expect(page.locator('#map')).toBeVisible();
  });

  test('Test embed project 3', async ({ page }) => {
    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();

    // --------------------------------------------
    // Selection
    await selection(page)
    await defaultBookmark(page)

    // Embed
    await page.getByTitle('Get embed code').click();
    await page.getByText('Filter Tab').click();
    await page.getByText('Map', { exact: true }).click();

    await page.getByRole('button', { name: 'Generate' }).click();
    await page.waitForTimeout(3000);
    const embedUrl = await page.locator('.modal--footer input').inputValue()
    await expect(embedUrl.includes('/embed/')).toBeTruthy();

    // Got to embed page
    await page.goto(embedUrl);
    await page.getByRole('button', { name: 'Close' }).click();

    // Check the test
    await expect(page.getByRole('tab', {
      name: 'Layers',
      exact: true
    })).toBeVisible();
    await expect(page.getByRole('tab', {
      name: 'Filters',
      exact: true
    })).not.toBeVisible();
    await expect(page.locator('.RightContent')).toBeVisible();
    await expect(page.locator('#map')).not.toBeVisible();
  });
});