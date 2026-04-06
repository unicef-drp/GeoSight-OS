import { expect, test } from '@playwright/test';
import { deleteProject, saveAsProject } from "../../utils/project";

// URL That we need to check
const timeout = 2000;

test.describe('Project navigation', () => {
  // A use case tests scenarios
  test('Left panel navigations', async ({ page }) => {
    const name = 'Demo GeoSight Project Navigation'
    const slug = 'demo-geosight-project-navigation'

    // --------------------------------------------------------------------
    // Delete project if exists
    // --------------------------------------------------------------------
    await deleteProject(page, name)
    await saveAsProject(page, 'Demo GeoSight Project', name)
    await page.getByText('Indicator Layers (10)').click();
    await page.getByRole('listitem').filter({ hasText: 'Dynamic Layer based on a list' }).locator('path').nth(3).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Configuration has been saved!')).toBeVisible();
    await page.locator('.MuiAlert-action').click();
    await page.goto('/project/' + slug)
    await page.getByRole('button', { name: 'Close' }).click();

    const middleConfig = ".IndicatorLayerMiddleConfig.Open";
    const layerTab = '#simple-tab-Layers'
    const filterTab = '#simple-tab-Filters'
    const indicatorTab = '#simple-tab-indicator'
    const contextLayerTab = '#simple-tab-context-layer'

    const indicatorTabPanel = '#indicator-tab-panel'
    const contextLayerTabPanel = '#context-layer-tab-panel'
    const filterTabPanel = '#filter-tab-panel'

    await expect(page.locator(layerTab)).toBeVisible();
    await expect(page.locator(filterTab)).toBeVisible();
    await expect(page.locator(indicatorTab)).toBeVisible();
    await expect(page.locator(contextLayerTab)).toBeVisible();
    await expect(page.locator(indicatorTabPanel)).toBeVisible();
    await expect(page.locator(contextLayerTabPanel)).toBeHidden();
    await expect(page.locator(filterTabPanel)).toBeHidden();
    await expect(page.locator(middleConfig)).toBeVisible();

    // context layer show
    await page.locator(contextLayerTab).click();
    await expect(page.locator(contextLayerTabPanel)).toBeVisible();
    await expect(page.locator(indicatorTabPanel)).toBeHidden();
    await expect(page.locator(filterTabPanel)).toBeHidden();
    await expect(page.locator(middleConfig)).toBeVisible();

    // Filter show
    await page.locator(filterTab).click();
    await expect(page.locator(filterTabPanel)).toBeVisible();
    await expect(page.locator(contextLayerTabPanel)).toBeHidden();
    await expect(page.locator(indicatorTabPanel)).toBeHidden();
    await expect(page.locator(indicatorTab)).toBeHidden();
    await expect(page.locator(contextLayerTab)).toBeHidden();
    await expect(page.locator(middleConfig)).toBeVisible();

    // Layers show
    await page.locator(layerTab).click();
    await expect(page.locator(contextLayerTabPanel)).toBeVisible();
    await expect(page.locator(filterTabPanel)).toBeHidden();
    await expect(page.locator(indicatorTabPanel)).toBeHidden();
    await expect(page.locator(indicatorTab)).toBeVisible();
    await expect(page.locator(contextLayerTab)).toBeVisible();
    await expect(page.locator(middleConfig)).toBeVisible();
    // Hide layer
    await page.locator(indicatorTab).locator('svg').click();
    await expect(page.locator(middleConfig)).toBeHidden();
    // Hide layer
    await page.locator(indicatorTab).locator('svg').click();
    await expect(page.locator(middleConfig)).toBeEnabled();

    // Context layer tab only
    await page.locator(".EditProjectLinkButton").click();
    await page.getByText("Context layers tab only").click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Configuration has been saved!')).toBeVisible();
    await page.locator('.MuiAlert-action').click();
    await page.goto('/project/' + slug)
    await page.getByRole('button', { name: 'Close' }).click();

    await expect(page.locator(layerTab)).toBeVisible();
    await expect(page.locator(filterTab)).toBeVisible();
    await expect(page.locator(indicatorTab)).toBeHidden();
    await expect(page.locator(contextLayerTab)).toBeHidden();
    await expect(page.locator(contextLayerTabPanel)).toBeVisible();
    await expect(page.locator(indicatorTabPanel)).toBeHidden();
    await expect(page.locator(filterTabPanel)).toBeHidden();
    await expect(page.locator(middleConfig)).toBeHidden();

    // Indicator tab only
    await page.locator(".EditProjectLinkButton").click();
    await page.getByText("Indicator layers tab only").click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Configuration has been saved!')).toBeVisible();
    await page.locator('.MuiAlert-action').click();
    await page.goto('/project/' + slug)
    await page.getByRole('button', { name: 'Close' }).click();

    await expect(page.locator(layerTab)).toBeVisible();
    await expect(page.locator(filterTab)).toBeVisible();
    await expect(page.locator(indicatorTab)).toBeHidden();
    await expect(page.locator(contextLayerTab)).toBeHidden();
    await expect(page.locator(contextLayerTabPanel)).toBeHidden();
    await expect(page.locator(indicatorTabPanel)).toBeVisible();
    await expect(page.locator(filterTabPanel)).toBeHidden();
    await expect(page.locator(middleConfig)).toBeVisible();

    // Hide filter
    await page.locator(".EditProjectLinkButton").click();
    await expect(page.getByText('Context and indicator layer tabs visibility')).toBeVisible();
    await page.locator('.DashboardFormHeader').getByText('Filters').click();
    await page.getByText('Hide filter section').click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Configuration has been saved!')).toBeVisible();
    await page.locator('.MuiAlert-action').click();
    await page.goto('/project/' + slug)
    await page.getByRole('button', { name: 'Close' }).click();

    await expect(page.locator(layerTab)).toBeHidden();
    await expect(page.locator(filterTab)).toBeHidden();
    await expect(page.locator(indicatorTab)).toBeHidden();
    await expect(page.locator(contextLayerTab)).toBeHidden();
    await expect(page.locator(contextLayerTabPanel)).toBeHidden();
    await expect(page.locator(indicatorTabPanel)).toBeVisible();
    await expect(page.locator(filterTabPanel)).toBeHidden();
    await expect(page.locator(middleConfig)).toBeVisible();

    // --------------------------------------------------------------------
    // Delete project
    // --------------------------------------------------------------------
    await deleteProject(page, name)

  });
})
;