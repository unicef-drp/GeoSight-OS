import { expect, test } from '@playwright/test';
import { deleteProject, saveAsProject } from "../../utils/project";
import { BASE_URL } from "../../variables";

test.describe('Related table slicer', () => {
  test('Related table slicer', async ({ page }) => {
    // --------------------------------------------------------------------
    // Check configuration
    // --------------------------------------------------------------------
    // Create project
    // --------------------------------------------------------------------
    const name = 'Demo GeoSight Project RT Silcer'
    await saveAsProject(page, 'Demo GeoSight Project', name)

    // Update related table slicer
    await page.getByText('Indicator Layers (10)').click();
    await page.getByRole('listitem').filter({ hasText: 'Dynamic Layer based on a list' }).getByRole('img').nth(2).click();
    await page.locator('span').filter({ hasText: 'Related Table Config' }).getByRole('button').click();
    await page.getByRole('textbox', { name: 'SQL Filter' }).click();
    await page.getByRole('combobox', { name: 'All selected' }).click();
    await page.getByRole('option', { name: 'Partner B' }).click();
    await page.getByRole('option', { name: 'Partner C' }).click();
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Configuration has been saved!')).toBeVisible();

    // Preview
    await page.goto(`/project/demo-geosight-project-rt-silcer`);
    await page.waitForURL(`${BASE_URL}/project/demo-geosight-project-rt-silcer`);
    await page.getByRole('button', { name: 'Close' }).click();

    // Check current Partnet
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

    // Select to EDU
    await page.getByRole('button', { name: 'Open' }).first().click();
    await page.getByRole('option', { name: 'EDU' }).click();

    await page.getByRole('button', { name: 'Open' }).first().click();
    await expect(page.getByRole('option', { name: 'Select all' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Partner A' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Partner C' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Partner B' })).toBeVisible();


    // --------------------------------------------------------------------
    // Delete project
    // --------------------------------------------------------------------
    await deleteProject(page, name)
  })
});