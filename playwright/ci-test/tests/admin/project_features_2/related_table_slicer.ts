import { expect, test } from '@playwright/test';
import { deleteProject, saveAsProject } from "../../utils/project";
import { BASE_URL } from "../../variables";

test.describe('Related table slicer', () => {
  test('Related table slicer', async ({ page }) => {
    // --------------------------------------------------------------------
    // Check configuration
    // --------------------------------------------------------------------
    // Check slicer
    await page.goto(`/admin/project/demo-geosight-project/edit`);

    // Update slicer
    await page.getByText('Indicator Layers (10)').click();
    await page.locator('span').filter({ hasText: 'Related Table Config' }).getByRole('button').click();
    await page.getByRole('textbox', { name: 'SQL Filter' }).click();

    await expect(page.locator('.WhereConfigurationQuery').nth(2).locator('.FilterInput input')).toHaveValue('WASH');
    await page.getByRole('combobox').filter({ hasText: 'Sector' }).click();
    await page.getByRole('option', { name: 'Partner' }).click();
    await expect(page.locator('.WhereConfigurationQuery').nth(2).locator('.FilterInput input')).toHaveValue('Partner A');
    await page.getByText('Single selection').click();
    await page.getByRole('option', { name: 'Multi-selection' }).locator('div').click();
    await expect(page.locator('.WhereConfigurationQuery').nth(2).locator('.FilterInput .MuiChip-root')).toHaveCount(1);
    await expect(page.locator('.WhereConfigurationQuery').nth(2).locator('.FilterInput .MuiChip-root').nth(0)).toHaveText('Partner A');
    await page.getByText('Partner', { exact: true }).nth(2).click();
    await page.getByRole('option', { name: 'Sector' }).click();
    await expect(page.locator('.WhereConfigurationQuery').nth(2).locator('.FilterInput .MuiChip-root')).toHaveCount(1);
    await expect(page.locator('.WhereConfigurationQuery').nth(2).locator('.FilterInput .MuiChip-root').nth(0)).toHaveText('');

    // --------------------------------------------------------------------
    // Create project
    // --------------------------------------------------------------------
    const name = 'Demo GeoSight Project RT Silcer'
    await saveAsProject(page, 'Demo GeoSight Project', name)

    // Update related table slicer
    await page.getByText('Indicator Layers (10)').click();
    await page.getByRole('listitem').filter({ hasText: 'Dynamic Layer based on a list' }).getByRole('img').nth(2).click();

    // Test
    await page.locator('span').filter({ hasText: 'Related Table Config' }).getByRole('button').click();
    await page.getByRole('textbox', { name: 'SQL Filter' }).click();
    await page.getByRole('combobox', { name: 'All selected' }).click();
    await page.getByRole('option', { name: 'Partner B' }).click();
    await page.getByRole('option', { name: 'Partner C' }).click();

    // Other
    await page.locator('.WhereConfigurationResult > .MuiSvgIcon-root').click();
    await page.locator('.WhereConfigurationField').nth(3).click();
    await page.getByRole('option', { name: 'SpeedLimit' }).click();
    await page.getByRole('combobox', { name: 'Select 1 option' }).nth(1).click();
    await page.getByRole('option', { name: '10 km/h' }).click();
    await page.locator('.WhereConfigurationResult > .MuiSvgIcon-root').click();
    await page.locator('.WhereConfigurationField').nth(4).click();
    await page.getByRole('option', { name: 'TestText' }).click();
    await page.locator('.WhereConfigurationOperator').nth(4).click();
    await page.getByRole('option', { name: 'Multi-selection' }).locator('div').click();
    await page.locator('.WhereConfigurationQuery').nth(5).locator('.FilterInput').click();
    await page.getByRole('option', { name: 'Select all' }).click();

    // Other
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Configuration has been saved!')).toBeVisible();

    // Preview
    await page.goto(`/project/demo-geosight-project-rt-silcer`);
    await page.waitForURL(`${BASE_URL}/project/demo-geosight-project-rt-silcer`);
    await page.getByRole('button', { name: 'Close' }).click();

    await expect(page.locator('.IndicatorLegendRowName')).toHaveCount(2)
    await expect(page.locator('.IndicatorLegendRowName').nth(0)).toHaveText("320")
    await expect(page.locator('.IndicatorLegendRowName').nth(1)).toHaveText("No data")

    // Check current Partner
    await page.getByRole('button', { name: 'Open' }).first().click();
    await expect(page.getByRole('option', { name: 'Select all' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Partner A' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Partner C' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Partner B' })).toBeVisible();

    // Select to EDU
    await page.getByRole('button', { name: 'Open' }).first().click();
    await page.getByRole('option', { name: 'EDU' }).click();

    await page.getByRole('button', { name: 'Open' }).first().click();
    await expect(page.getByRole('option', { name: 'Select all' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Partner A' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Partner C' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Partner B' })).toBeVisible();

    // Select to Blank
    await page.getByRole('button', { name: 'Open' }).first().click();
    await page.getByRole('option', { name: 'Blank' }).click();

    await page.getByRole('button', { name: 'Open' }).first().click();
    await expect(page.getByRole('option', { name: 'Select all' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Partner A' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Partner C' })).toBeHidden();
    await expect(page.getByRole('option', { name: 'Partner B' })).toBeHidden();

    await expect(page.locator('.IndicatorLegendRowName')).toHaveCount(1)
    await expect(page.locator('.IndicatorLegendRowName').nth(0)).toHaveText("No data")

    // Select to EDU
    await page.getByRole('button', { name: 'Open' }).first().click();
    await page.getByRole('option', { name: 'EDU' }).click();

    // Open partner options
    await page.getByRole('button', { name: 'Open' }).first().click();
    await expect(page.getByRole('option', { name: 'Select all' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Partner A' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Partner C' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Partner B' })).toBeVisible();

    await expect(page.getByRole('option', { name: 'Select all' }).getByRole('checkbox')).not.toBeChecked();
    await expect(page.getByRole('option', { name: 'Partner A' }).getByRole('checkbox')).toBeChecked();
    await expect(page.getByRole('option', { name: 'Partner B' }).getByRole('checkbox')).not.toBeChecked();
    await expect(page.getByRole('option', { name: 'Partner C' }).getByRole('checkbox')).not.toBeChecked();

    await expect(page.locator('#RelatedTableLayerMiddleConfigReal')).toBeVisible();
    await expect(page.locator('#RelatedTableLayerMiddleConfigReal .WhereConfigurationQuery').nth(1).locator('.ResetFilterQuery')).toBeHidden();
    await page.getByRole('option', { name: 'Select all' }).click();
    await expect(page.getByRole('option', { name: 'Select all' }).getByRole('checkbox')).toBeChecked();
    await expect(page.getByRole('option', { name: 'Partner A' }).getByRole('checkbox')).toBeChecked();
    await expect(page.getByRole('option', { name: 'Partner B' }).getByRole('checkbox')).toBeChecked();
    await expect(page.getByRole('option', { name: 'Partner C' }).getByRole('checkbox')).toBeChecked();
    await expect(page.locator('#RelatedTableLayerMiddleConfigReal .WhereConfigurationQuery').nth(1).locator('.ResetFilterQuery')).toBeVisible();

    // Select testText
    await page.locator('.WhereConfigurationQuery ').nth(5).locator('.FilterInput').click();
    await page.getByRole('option', { name: 'Select all' }).click();
    await page.getByRole('option', { name: "Don't stop" }).click();

    await expect(page.locator('.IndicatorLegendRowName')).toHaveCount(3)
    await expect(page.locator('.IndicatorLegendRowName').nth(0)).toHaveText("363.00 - 932.00")
    await expect(page.locator('.IndicatorLegendRowName').nth(1)).toHaveText("363.00")
    await expect(page.locator('.IndicatorLegendRowName').nth(2)).toHaveText("No data")

    // Revert partner options
    await page.locator('#RelatedTableLayerMiddleConfigReal .WhereConfigurationQuery').nth(1).locator('.ResetFilterQuery').click();
    await page.getByRole('button', { name: 'Open' }).first().click();
    await expect(page.getByRole('option', { name: 'Select all' }).getByRole('checkbox')).not.toBeChecked();
    await expect(page.getByRole('option', { name: 'Partner A' }).getByRole('checkbox')).toBeChecked();
    await expect(page.getByRole('option', { name: 'Partner B' }).getByRole('checkbox')).not.toBeChecked();
    await expect(page.getByRole('option', { name: 'Partner C' }).getByRole('checkbox')).not.toBeChecked();
    await expect(page.locator('#RelatedTableLayerMiddleConfigReal .WhereConfigurationQuery').nth(1).locator('.ResetFilterQuery')).toBeHidden();

    // --------------------------------------------------------------------
    // Delete project
    // --------------------------------------------------------------------
    await deleteProject(page, name)
  })
});