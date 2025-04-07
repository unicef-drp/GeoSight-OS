import { expect, test } from '@playwright/test';

import { defaultBookmark, defaultCheck, selection } from '../../utils/bookmark'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('Bookmark', () => {

  test('Test bookmark project', async ({ page }) => {
    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();

    // --------------------------------------------
    // Selection
    await selection(page)

    // --------------------------------------------
    // Create bookmark
    await page.getByTitle('Bookmark').locator('a').click();
    await page.getByRole('button', { name: 'Save As...' }).click();
    await page.getByLabel('Bookmark Name').fill('Bookmark 1');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.locator('.MuiBackdrop-root').first().click();
    await defaultBookmark(page)

    // --------------------------------------------
    // Click default on bookmark
    await page.getByTitle('Bookmark').locator('a').click();
    await page.getByText('Default').click();
    await page.locator('.MuiBackdrop-root').first().click();
    await defaultCheck(page)

    // --------------------------------------------
    // Click Bookmark Sample Indicator B
    await page.getByTitle('Bookmark').locator('a').click();
    await page.getByText('Bookmark 1').click();
    await page.locator('.MuiBackdrop-root').first().click();
    await defaultBookmark(page)

    // Delete the bookmark and it will back to default
    page.once('dialog', async dialog => {
      // Verify Dialog Message
      await expect(dialog.message()).toContain(`Are you sure you want to delete Bookmark 1?`);

      //Click on OK Button
      await dialog.accept();
    });
    await page.getByTitle('Bookmark').locator('a').click();
    await page.locator('.Bookmark  .DeleteIcon').click();

    // Default
    await delay(1000)
    await page.locator('.MuiBackdrop-root').first().click();
    await defaultCheck(page)
  });
});