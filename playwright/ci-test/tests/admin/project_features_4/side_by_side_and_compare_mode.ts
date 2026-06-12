import { expect, test } from '@playwright/test';
import { viewProject } from "../../utils/project";
import {
  defaultFill,
  defaultLine,
  indicatorAFill,
  indicatorBFill,
  ProjectTestContext,
  TEXT,
} from "../../utils/project_context";

test.describe('Side by side and compare mode', () => {
  const ctx = new ProjectTestContext();

  test.beforeEach(async ({ page }) => {
    ctx.setup(page);
    await viewProject(page, 'Demo GeoSight Project', true);
  });

  test('Compare mode', async ({ page }) => {
    // Compare mode
    await page.getByLabel(TEXT.INDICATOR_LAYERS.sampleIndicatorA).click();
    await expect(page.locator('#indicator-tab-panel .MuiCheckbox-root:visible')).toHaveCount(0);
    await expect(page.locator('#indicator-tab-panel .MuiRadio-root:visible')).toHaveCount(10);
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);

    // Turn on compare mode
    await page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.Off).click();
    await expect(page.locator('#indicator-tab-panel .MuiCheckbox-root:visible')).toHaveCount(10);
    await expect(page.locator('#indicator-tab-panel .MuiRadio-root:visible')).toHaveCount(0);
    expect(ctx.lastLayerPaintFill["map-0"]).toBe('"#D8D8D8"');
    expect(ctx.lastLayerPaintLine["map-0"]).toBe(indicatorAFill + defaultLine);

    // Add indicator B
    await page.getByLabel(TEXT.INDICATOR_LAYERS.sampleIndicatorB).click();
    expect(ctx.lastLayers["map-0"]).toContain("reference-layer-fill-map-0-0,reference-layer-outline-map-0-0");
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorA + ' (Outline)')
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(1)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorB + ' (Inner)')
    await expect(page.locator('.MapLegendSection').nth(0).locator('.IndicatorLegendRow').first()).toBeVisible()
    await expect(page.locator('.MapLegendSection').nth(1).locator('.IndicatorLegendRow').first()).toBeVisible()
    expect(ctx.lastLayerPaintFill["map-0"]).toBe(indicatorBFill + defaultFill);
    expect(ctx.lastLayerPaintLine["map-0"]).toBe(indicatorAFill + defaultLine);

    // We swap
    await page.locator('.MapLegend .MapLegendSwapIcon').click()
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorB + ' (Outline)')
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(1)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorA + ' (Inner)')
    await expect(page.locator('.MapLegendSection').nth(0).locator('.IndicatorLegendRow').first()).toBeVisible()
    await expect(page.locator('.MapLegendSection').nth(0).locator('.IndicatorLegendRow').first()).toBeVisible()
    expect(ctx.lastLayerPaintFill["map-0"]).toBe(indicatorAFill + defaultFill);
    expect(ctx.lastLayerPaintLine["map-0"]).toBe(indicatorBFill + defaultLine);

    // Swap with select
    await page.locator('#map-0-wrapper .MapLegendSection .ReactSelect').first().click();
    await page.getByRole('option', { name: '[switch] Sample Indicator A' }).click();
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorA + ' (Outline)')
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(1)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorB + ' (Inner)')
    expect(ctx.lastLayerPaintFill["map-0"]).toBe(indicatorBFill + defaultFill);
    expect(ctx.lastLayerPaintLine["map-0"]).toBe(indicatorAFill + defaultLine);

    // Turn off compare mode
    await page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.On).click();
    await expect(page.locator('#indicator-tab-panel .MuiCheckbox-root:visible')).toHaveCount(0);
    await expect(page.locator('#indicator-tab-panel .MuiRadio-root:visible')).toHaveCount(10);
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);

    // We turn it on
    await page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.Off).click();
    await page.getByLabel(TEXT.INDICATOR_LAYERS.sampleIndicatorB).click();
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorA + ' (Outline)')
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(1)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorB + ' (Inner)')

    // We change to side by side
    await page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.Off).click();
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkMapStyle(page, 1, TEXT.INDICATOR_LAYERS.sampleIndicatorB);

    await page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.On).click();
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkMapStyle(page, 1, null);
  })

  test('Side by side view', async ({ page }) => {
    await page.locator('.ToolbarControl.RightButton').click();

    // Default
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkMapStyle(page, 1, null);
    await ctx.checkMapStyle(page, 2, null);
    await ctx.checkMapStyle(page, 3, null);

    // Turn on
    await page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.Off).click();

    // Turn on B
    await page.getByLabel(TEXT.INDICATOR_LAYERS.sampleIndicatorB).click();
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkMapStyle(page, 1, TEXT.INDICATOR_LAYERS.sampleIndicatorB);
    await ctx.checkMapStyle(page, 2, null);
    await ctx.checkMapStyle(page, 3, null);
    await ctx.doSwap(page, 0, 1, TEXT.INDICATOR_LAYERS.sampleIndicatorA, TEXT.INDICATOR_LAYERS.sampleIndicatorB, "Right");

    // Turn on C
    await page.getByLabel(TEXT.INDICATOR_LAYERS.testIndicatorC).click();
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkMapStyle(page, 1, TEXT.INDICATOR_LAYERS.sampleIndicatorB);
    await ctx.checkMapStyle(page, 2, TEXT.INDICATOR_LAYERS.testIndicatorC);
    await ctx.checkMapStyle(page, 3, null);
    await ctx.doSwap(page, 0, 1, TEXT.INDICATOR_LAYERS.sampleIndicatorA, TEXT.INDICATOR_LAYERS.sampleIndicatorB, "Right");
    await ctx.doSwap(page, 1, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorB, TEXT.INDICATOR_LAYERS.sampleIndicatorA, "Left");
    await ctx.doSwap(page, 1, 2, TEXT.INDICATOR_LAYERS.sampleIndicatorB, TEXT.INDICATOR_LAYERS.testIndicatorC, "Right");
    await ctx.doSwap(page, 2, 1, TEXT.INDICATOR_LAYERS.testIndicatorC, TEXT.INDICATOR_LAYERS.sampleIndicatorB, "Left");

    // Turn on Kenya
    await page.getByLabel(TEXT.INDICATOR_LAYERS.kenyaIndicatorA).click();
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkMapStyle(page, 1, TEXT.INDICATOR_LAYERS.sampleIndicatorB);
    await ctx.checkMapStyle(page, 2, TEXT.INDICATOR_LAYERS.testIndicatorC);
    await ctx.checkMapStyle(page, 3, TEXT.INDICATOR_LAYERS.kenyaIndicatorA);
    await ctx.doSwap(page, 0, 1, TEXT.INDICATOR_LAYERS.sampleIndicatorA, TEXT.INDICATOR_LAYERS.sampleIndicatorB, "Right");
    await ctx.doSwap(page, 0, 2, TEXT.INDICATOR_LAYERS.sampleIndicatorA, TEXT.INDICATOR_LAYERS.testIndicatorC, "BottomRight");
    await ctx.doSwap(page, 0, 3, TEXT.INDICATOR_LAYERS.sampleIndicatorA, TEXT.INDICATOR_LAYERS.kenyaIndicatorA, "Bottom");
    await ctx.doSwap(page, 1, 2, TEXT.INDICATOR_LAYERS.sampleIndicatorB, TEXT.INDICATOR_LAYERS.testIndicatorC, "Bottom");
    await ctx.doSwap(page, 1, 3, TEXT.INDICATOR_LAYERS.sampleIndicatorB, TEXT.INDICATOR_LAYERS.kenyaIndicatorA, "BottomLeft");
    await ctx.doSwap(page, 2, 3, TEXT.INDICATOR_LAYERS.testIndicatorC, TEXT.INDICATOR_LAYERS.kenyaIndicatorA, "Left");

    // Turn on compare layer
    await page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.Off).click();
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorA + ' (Outline)')
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(1)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorB + ' (Inner)')
    await expect(page.locator('.MapLegendSection').nth(0).locator('.IndicatorLegendRow').first()).toBeVisible()
    await expect(page.locator('.MapLegendSection').nth(1).locator('.IndicatorLegendRow').first()).toBeVisible()
    expect(ctx.lastLayerPaintFill["map-0"]).toBe(indicatorBFill + defaultFill);
    expect(ctx.lastLayerPaintLine["map-0"]).toBe(indicatorAFill + defaultLine);

    // Turn on again side by side
    await page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.Off).click();
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkMapStyle(page, 1, TEXT.INDICATOR_LAYERS.sampleIndicatorB);
    await ctx.checkMapStyle(page, 2, null);
    await ctx.checkMapStyle(page, 3, null);
    await ctx.doSwap(page, 0, 1, TEXT.INDICATOR_LAYERS.sampleIndicatorA, TEXT.INDICATOR_LAYERS.sampleIndicatorB, "Right");

    // Turn off
    await page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.On).click();
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkMapStyle(page, 1, null);
    await ctx.checkMapStyle(page, 2, null);
    await ctx.checkMapStyle(page, 3, null);

    // Turn on
    await page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.Off).click();
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkMapStyle(page, 1, null);
    await ctx.checkMapStyle(page, 2, null);
    await ctx.checkMapStyle(page, 3, null);

  })
});