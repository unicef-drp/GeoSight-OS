import { expect, test } from '@playwright/test';

// URL That we need to check
const timeout = 2000;

test.describe('View project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/project/demo-geosight-project');
  });

  // A use case tests scenarios
  test('View project', async ({ page }) => {
    let lastLog = null
    page.on('console', msg => {
      if (msg.text().indexOf('LOGGER.log:') !== -1) {
        try {
          lastLog = JSON.parse(msg.text().replace('LOGGER.log:', ''))
        } catch (e) {
          console.log(e)

        }
      }
    });

    // Check initial state
    const layer1 = 'Sample Indicator A'
    const layer2 = 'Dynamic Layer based on a list of interventions'
    await expect(page.getByLabel(layer1)).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
    await expect(page.getByLabel(layer1)).toBeChecked();
    await expect(page.getByLabel(layer2)).not.toBeChecked();

    // ----------------------------------------------------------------------------
    // BOOKMARK
    // ----------------------------------------------------------------------------
    // Check if sample indicator b is checked
    await page.getByLabel(layer2).click();
    await expect(page.getByLabel(layer1)).not.toBeChecked();
    await expect(page.getByLabel(layer2)).toBeChecked();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer2);

    // Click the slicer
    await page.getByRole('combobox', { name: 'Select 1 option' }).click();
    await page.getByRole('option', { name: 'HEALTH' }).click();
    await page.getByRole('option', { name: 'EDU' }).click();
    await page.getByRole('option', { name: 'WASH' }).click();
    await expect(page.getByLabel(layer1)).not.toBeChecked();
    await expect(page.getByLabel(layer2)).toBeChecked();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer2);

    // Check if it just have 2 value
    await page.getByRole('spinbutton').first().fill('990');
    await expect(page.locator('.IndicatorLegendSection .IndicatorLegendRowName').nth(0)).toContainText('994');
    await expect(page.locator('.IndicatorLegendSection .IndicatorLegendRowName').nth(1)).toContainText('991');
    await expect(page.locator('.IndicatorLegendSection .IndicatorLegendRowName').nth(2)).toContainText('No data');

    // Create bookmark with Dynamic Layer as default
    await page.getByTitle('Bookmark').locator('a').click();
    await page.getByRole('button', { name: 'Save As...' }).click();
    await page.getByLabel('Bookmark Name').fill('Bookmark 1');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByLabel(layer1)).not.toBeChecked();
    await expect(page.getByLabel(layer2)).toBeChecked();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer2);

    // Click default on bookmark
    await page.getByText('Default').click();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
    await expect(page.getByLabel(layer1)).toBeChecked();
    await expect(page.getByLabel(layer2)).not.toBeChecked();

    // Click Bookmark Sample Indicator B
    await page.getByText('Bookmark 1').click();
    await expect(page.getByLabel(layer1)).not.toBeChecked();
    await expect(page.getByLabel(layer2)).toBeChecked();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer2);

    // Delete the bookmark and it will back to default
    page.once('dialog', async dialog => {
      // Verify Dialog Message
      await expect(dialog.message()).toContain(`Are you sure you want to delete Bookmark 1?`);

      //Click on OK Button
      await dialog.accept();
    });
    await page.locator('.Bookmark  .DeleteIcon').click();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
    await expect(page.getByLabel(layer1)).toBeChecked();
    await expect(page.getByLabel(layer2)).not.toBeChecked();
  });
});