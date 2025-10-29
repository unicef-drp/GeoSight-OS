import { expect, test } from '@playwright/test';

// URL That we need to check
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('View kenya latest project', () => {
  test('Check data', async ({ page }) => {
    /**
     * This test is to check the data of the latest view of Kenya
     * The data is using KEN_V1
     * But the Kenya latest is using KEN_V2
     *
     * So when using ucode, no data loaded
     * But when using concept_uuid, data loaded
     */
    await page.goto('/admin/project/');

    // Create project
    await page.getByRole('button', { name: 'Create New Project' }).click();
    await page.getByRole('textbox', { name: 'Select View' }).click();
    await page.getByRole('cell', { name: 'Kenya (Latest)' }).click();
    await page.getByRole('textbox', { name: 'Example: Afghanistan Risk' }).fill('Kenya Test');

    // Options
    await page.locator('.ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'Test' }).click();

    // Create indicator
    await page.getByText('Indicators').nth(1).click();
    await page.getByRole('button', { name: 'Add Indicator' }).click();
    await page.getByRole('cell', { name: 'Kenya Indicator A' }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();

    // Create indicator layers
    await page.getByText('Indicator Layers', { exact: true }).click();
    await page.getByRole('button', { name: 'Add Indicator Layer' }).click();
    await page.getByText('Single Indicator LayerSelect').click();
    await page.getByRole('cell', { name: 'Kenya Indicator A' }).click();
    await page.getByRole('button', { name: 'Apply Selections : Selected (' }).click();

    // Create widget
    await page.getByText('Widgets').click();
    await page.getByRole('button', { name: 'Add Widget' }).click();
    await page.getByRole('textbox', { name: 'Widget name' }).click();
    await page.getByRole('textbox', { name: 'Widget name' }).fill('Sum');
    await page.getByText('Sync with the current map').first().click();
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    // Review map
    await page.goto('/project/kenya-test');
    await expect(page.locator('.IndicatorLegendRow')).toHaveCount(1)
    await expect(page.locator('.widget__content')).toHaveText('');

    // Now change to concept uuid
    await page.goto('/admin/project/kenya-test/edit');
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeVisible();
    await page.getByRole('combobox', { name: 'Select 1 option' }).click();
    await page.getByRole('option', { name: 'Concept uuid' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Review map
    await page.goto('/project/kenya-test');
    await expect(page.locator('.IndicatorLegendRow')).toHaveCount(2)
    await expect(page.locator('.IndicatorLegendRow').nth(1)).toHaveText("1")
    await expect(page.locator('.widget__content')).toHaveText('1');

    // Download

  })
})