import { expect, test } from '@playwright/test';

// URL That we need to check
const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('Bookmark project', () => {
  test('Test bookmark project', async ({ page }) => {
    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();
    const layer1 = 'Sample Indicator A'
    const layer2 = 'Dynamic Layer based on a list of interventions'
    const kenyaLayer = 'Kenya Indicator A'
    const contextLayer = 'Somalia sample context layer'
    // ----------------------------------------------------------------------------
    // BOOKMARK
    // ----------------------------------------------------------------------------
    // Change the context layers
    await page.getByRole('tab', { name: 'Context Layers' }).click();
    await page.getByLabel(contextLayer).click();
    await page.getByRole('tab', { name: 'Indicators' }).click();

    // Check the label
    await page.getByLabel(layer2).click();
    await page.getByTitle('Turn on compare Layers').click();
    await page.getByLabel(kenyaLayer).click();
    await page.getByRole('tab', { name: 'Filters' }).click();
    await page.getByRole('button', { name: 'Indicator A above X% Delete' }).getByRole('checkbox').check();
    await page.getByRole('tab', { name: 'Layers' }).click();

    // Create bookmark with Dynamic Layer as default
    await page.getByTitle('Bookmark').locator('a').click();
    await page.getByRole('button', { name: 'Save As...' }).click();
    await page.getByLabel('Bookmark Name').fill('Bookmark 1');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.locator('.MuiBackdrop-root').first().click();
    await expect(page.getByLabel(layer1)).not.toBeChecked();
    await expect(page.getByLabel(layer2)).toBeChecked();
    await expect(page.getByLabel(kenyaLayer)).toBeChecked();
    await expect(page.locator('.MapLegendSectionTitle').nth(0)).toContainText(layer2);
    await expect(page.locator('.MapLegendSectionTitle').nth(1)).toContainText(kenyaLayer);

    // Check context layers
    await page.getByRole('tab', { name: 'Context Layers' }).click();
    await expect(page.getByLabel(contextLayer)).toBeChecked();
    await expect(page.getByText('Sample ArcGIS layer')).toBeVisible();
    await page.getByRole('tab', { name: 'Indicators' }).click();

    // --------------------------------------------
    // Click default on bookmark
    await page.getByTitle('Bookmark').locator('a').click();
    await page.getByText('Default').click();
    await page.locator('.MuiBackdrop-root').first().click();
    await expect(page.getByTitle('Turn on compare Layers')).toBeVisible();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
    await expect(page.getByLabel(layer1)).toBeChecked();
    await expect(page.getByLabel(layer2)).not.toBeChecked();
    await expect(page.getByLabel(kenyaLayer)).not.toBeChecked();

    // Check context layers
    await page.getByRole('tab', { name: 'Context Layers' }).click();
    await expect(page.getByLabel(contextLayer)).not.toBeChecked();
    await expect(page.getByText('Sample ArcGIS layer')).not.toBeVisible();
    await page.getByRole('tab', { name: 'Indicators' }).click();

    // --------------------------------------------
    // Click Bookmark Sample Indicator B
    await page.getByTitle('Bookmark').locator('a').click();
    await page.getByText('Bookmark 1').click();
    await page.locator('.MuiBackdrop-root').first().click();
    await expect(page.getByTitle('Turn off compare Layers')).toBeVisible();
    await expect(page.locator('.MapLegendSectionTitle').nth(0)).toContainText(layer2);
    await expect(page.locator('.MapLegendSectionTitle').nth(1)).toContainText(kenyaLayer);
    await expect(page.getByLabel(layer1)).not.toBeChecked();
    await expect(page.getByLabel(layer2)).toBeChecked();
    await expect(page.getByLabel(kenyaLayer)).toBeChecked();

    // Check context layers
    await page.getByRole('tab', { name: 'Context Layers' }).click();
    await expect(page.getByLabel(contextLayer)).toBeChecked();
    await expect(page.getByText('Sample ArcGIS layer')).toBeVisible();
    await page.getByRole('tab', { name: 'Indicators' }).click();

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
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
    await expect(page.getByLabel(layer1)).toBeChecked();
    await expect(page.getByLabel(layer2)).not.toBeChecked();
    await expect(page.getByLabel(kenyaLayer)).not.toBeChecked();

    // Check context layers
    await page.getByRole('tab', { name: 'Context Layers' }).click();
    await expect(page.getByLabel(contextLayer)).not.toBeChecked();
    await expect(page.getByText('Sample ArcGIS layer')).not.toBeVisible();
    await page.getByRole('tab', { name: 'Indicators' }).click();
  });
});