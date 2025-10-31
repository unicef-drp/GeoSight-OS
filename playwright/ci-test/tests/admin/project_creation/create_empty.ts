import { expect, test } from '@playwright/test';
import { deleteProject, fillProjectName } from "../../utils/project";
import { BASE_URL } from "../../variables";

test.describe('Create empty project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('');
  });

  // A use case tests scenarios
  test('Create empty project', async ({ page }) => {
    let lastSearchEntity = null
    page.on('console', msg => {
      if (msg.text().indexOf('SEARCH_GEOMETRY_INPUT:') !== -1) {
        try {
          lastSearchEntity = msg.text().replace('SEARCH_GEOMETRY_INPUT:', '')
        } catch (e) {
          console.log(e)

        }
      }
    })

    const name = 'Empty'
    await page.goto('/admin/project/create');
    await page.getByRole('textbox', { name: 'Select View' }).click();
    await page.getByText('Somalia', { exact: true }).click();

    await fillProjectName(page,name);

    await page.locator('.ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'Test' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    const editUrl = `${BASE_URL}/admin/project/${name.toLowerCase()}/edit`
    await page.waitForURL(editUrl)

    await page.goto(`${BASE_URL}/project/${name.toLowerCase()}/`);
    await page.hover('.ReferenceLayerLevelSelected')
    await expect(page.locator('.ReferenceLayerLevelOption').getByText('Admin Level 0')).toBeVisible();
    await expect(page.locator('.ReferenceLayerLevelOption').getByText('Admin Level 1')).toBeVisible();
    await expect(page.locator('.ReferenceLayerLevelOption').getByText('Admin Level 2')).toBeVisible();

    await page.getByRole('combobox', { name: 'Search Geography Entity' }).click();
    await page.getByRole('option', { name: 'Banadir Admin Level' }).click();
    await expect(lastSearchEntity).toEqual("45.20831299,1.96833061,45.60608431,2.18504432");
    await page.getByRole('option', { name: 'Gedo Admin Level' }).click();
    await expect(lastSearchEntity).toEqual("40.994317,1.23272177,43.14093018,4.30793036");

    // ------------------------------------
    // DELETE PROJECT
    // ------------------------------------
    await deleteProject(page, name)
  });

  // A use case tests scenarios
  test('Create empty project with no view', async ({ page }) => {
    const name = 'Empty'
    await page.goto('/admin/project/create');
    await expect(page.locator('.DashboardFormHeader').getByText('General', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Basemaps (1)', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Indicators', { exact: true })).toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Indicator Layers', { exact: true })).toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Filters', { exact: true })).toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Widgets', { exact: true })).toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Related Tables', { exact: true })).toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Tools', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");
    await expect(page.getByText('Share', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");

    // Select view
    await page.getByRole('textbox', { name: 'Select View' }).click();
    await page.getByText('Somalia', { exact: true }).click();
    await expect(page.locator('.DashboardFormHeader').getByText('General', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Basemaps (1)', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Indicators', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Indicator Layers', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Filters', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Widgets', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Related Tables', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Tools', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Share', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");

    await page.locator('#UndoHistory').click();
    await expect(page.locator('.DashboardFormHeader').getByText('General', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Basemaps (1)', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Indicators', { exact: true })).toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Indicator Layers', { exact: true })).toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Filters', { exact: true })).toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Widgets', { exact: true })).toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Related Tables', { exact: true })).toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Tools', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");
    await expect(page.locator('.DashboardFormHeader').getByText('Share', { exact: true })).not.toHaveClass("MuiButtonLike Disabled");

    await fillProjectName(page,name);

    await page.locator('.ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'Test' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    const editUrl = `${BASE_URL}/admin/project/${name.toLowerCase()}/edit`
    await page.waitForURL(editUrl)

    await page.goto(`${BASE_URL}/project/${name.toLowerCase()}/`);
    await expect(page.locator('.ReferenceLayerLevelSelected')).toBeHidden()
    await expect(page.getByRole('combobox', { name: 'Search Geography Entity' })).toBeHidden();

    // ------------------------------------
    // DELETE PROJECT
    // ------------------------------------
    await deleteProject(page, name)
  });
});