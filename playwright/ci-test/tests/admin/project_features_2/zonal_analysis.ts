import { expect, test } from '@playwright/test';
import {
  deleteProject,
  saveAsProject,
  viewProject
} from "../../utils/project";

test.describe('Zonal analysis', () => {
  test('Config tool', async ({ page }) => {
    const text = "Zonal analysis"
    // --------------------------------------------------------------------
    // Check configuration
    // --------------------------------------------------------------------
    // Create project
    // --------------------------------------------------------------------
    const name = 'Demo GeoSight Project Zonal Analysis'
    await saveAsProject(page, 'Demo GeoSight Project', name)

    await page.getByText('Tools').click();
    await expect(await page.getByRole('listitem').filter({ hasText: text })).toBeVisible();
    const disable = await page
      .getByRole('listitem')
      .filter({ hasText: text })
      .locator('.VisibilityIconOff')
      .first()
      .isVisible();
    if (disable) {
      await page.getByRole('listitem').filter({ hasText: text }).getByRole('img').click(); // Activate it
    }

    await page.getByRole('listitem').filter({ hasText: text }).getByTestId('EditIcon').click();

    // Add Somalia sample context layer
    await page.locator('.Creator > div').first().locator('.InputControl').click();
    await page.getByRole('option', { name: 'Somalia sample context layer' }).click();
    await page.locator('.Creator > div').nth(3).locator('button').click();

    // Add somalia healthsites
    await page.locator('.Creator > div').first().locator('.InputControl').click();
    await page.getByRole('option', { name: 'Somalia healthsites' }).click();
    await page.locator('.Creator > div').nth(2).locator('.InputControl').click();
    await page.getByRole('option', { name: 'completene' }).click();
    await page.locator('.Creator > div').nth(3).locator('button').click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    // --------------------------------------------------------------------
    // Save
    // --------------------------------------------------------------------
    await page.getByText('Save', { exact: true }).isEnabled();
    await page.getByText('Save', { exact: true }).click();

    // --------------------------------------------------------------------
    // View the project
    // --------------------------------------------------------------------
    await viewProject(page, name)
    await page.getByRole('button', { name: 'Close' }).click();

    // Test composite and compare toggle each other
    await page.getByTitle('Zonal Analysis').click();
    await page.getByRole('region', { name: 'Map' }).click({
      position: {
        x: 592,
        y: 344
      }
    });
    await page.getByRole('button', { name: 'Run analysis' }).click();
    await expect(page.locator('.ZonalAnalysisTable tr').nth(1).locator('td').nth(0)).toHaveText('Somalia sample context layer');
    await expect(page.locator('.ZonalAnalysisTable tr').nth(1).locator('td').nth(1)).toHaveText('SUM');
    await expect(page.locator('.ZonalAnalysisTable tr').nth(1).locator('td').nth(2)).toHaveText('FID');
    await expect(page.locator('.ZonalAnalysisTable tr').nth(1).locator('td').nth(3)).toHaveText('3,465');
    await expect(page.locator('.ZonalAnalysisTable tr').nth(2).locator('td').nth(0)).toHaveText('Somalia healthsites');
    await expect(page.locator('.ZonalAnalysisTable tr').nth(2).locator('td').nth(1)).toHaveText('SUM');
    await expect(page.locator('.ZonalAnalysisTable tr').nth(2).locator('td').nth(2)).toHaveText('completene');
    await expect(page.locator('.ZonalAnalysisTable tr').nth(2).locator('td').nth(3)).toHaveText('34.375');


    // --------------------------------------------------------------------
    // Delete project
    // --------------------------------------------------------------------
    await deleteProject(page, name)
  })
});