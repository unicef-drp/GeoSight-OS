import { expect, test } from '@playwright/test';
import path from "path";

// URL That we need to check
const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('Create reference dataset', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/admin/reference-datasets/create');
  });
  test('Create reference dataset', async ({ page }) => {
    await page.locator('#Form #id_name').fill('Somalia autocreate');
    await page.getByText('Add new level').click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('link', { name: 'Import data' }).click();

    // File chooser
    const filePath = path.join(__dirname, 'sample_data', 'adm0.zip')
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Drag and drop or click to').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);

    await page.locator('.ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'name', exact: true }).click();
    await page.getByRole('button', { name: 'Submit' }).click();


    await delay(5000);
    await page.getByRole('button', { name: 'See the data' }).click();
    await expect(page.getByRole('grid')).toContainText('Somalia');
    await expect(page.getByRole('grid')).toContainText('0');
    await expect(page.getByRole('grid')).toContainText('SOM_V2');
  })
});