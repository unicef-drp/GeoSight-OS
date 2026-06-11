import { expect, test } from '@playwright/test';
import {
  defaultFill,
  defaultLine,
  indicatorAFill,
  indicatorBFill,
  ProjectTestContext,
  TEXT
} from "../../utils/project_context";
import { viewProject } from "../../utils/project";
import {
  createBookmark,
  defaultBookmark,
  defaultCheck,
  deleteBookmark,
  selectBookmark,
  selection
} from '../../utils/bookmark'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('Bookmark', () => {
  const ctx = new ProjectTestContext();

  test.beforeEach(async ({ page }) => {
    ctx.setup(page);
  });

  test('Test bookmark project', async ({ page }) => {
    const name = 'Bookmark 1'
    await viewProject(page, 'Demo GeoSight Project', true);

    // --------------------------------------------
    // Selection
    await selection(page)

    // --------------------------------------------
    // Create bookmark
    await createBookmark(page, name)
    await defaultBookmark(page)

    // --------------------------------------------
    // Click default on bookmark
    await selectBookmark(page)
    await defaultCheck(page)

    // --------------------------------------------
    // Click Bookmark Sample Indicator B
    await selectBookmark(page, name)
    await defaultBookmark(page)

    await deleteBookmark(page, name)
  });

  test('Test bookmark project with map mode', async ({ page }) => {
    const name = 'Bookmark Map Mode'
    await viewProject(page, 'Demo GeoSight Project', true);

    // -----------------------------------
    // Compare mode
    // -----------------------------------
    await page.getByLabel(TEXT.INDICATOR_LAYERS.sampleIndicatorA).click();
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);

    // Turn on compare mode
    await page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.Off).click();
    await page.getByLabel(TEXT.INDICATOR_LAYERS.sampleIndicatorB).click();
    expect(ctx.lastLayers["map-0"]).toContain("reference-layer-fill-map-0-0,reference-layer-outline-map-0-0,reference-layer-fill-map-0-1,reference-layer-outline-map-0-1");
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorA + ' (Outline)')
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(1)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorB + ' (Inner)')
    expect(ctx.lastLayerPaintFill["map-0"]).toBe(indicatorBFill + defaultFill);
    expect(ctx.lastLayerPaintLine["map-0"]).toBe(indicatorAFill + defaultLine);

    await createBookmark(page, name)

    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.On)).toBeVisible();
    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.Off)).toBeVisible();

    // We view
    await viewProject(page, 'Demo GeoSight Project', true);
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkIndicatorNotSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorB);
    await ctx.checkIndicatorNotSelected(page, TEXT.INDICATOR_LAYERS.kenyaIndicatorA);

    // Select bookmark
    await selectBookmark(page, name)
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorB);
    await ctx.checkIndicatorNotSelected(page, TEXT.INDICATOR_LAYERS.kenyaIndicatorA);
    await expect(page.locator("#map-0")).toBeVisible();
    await expect(page.locator("#map-1")).toBeHidden();

    // Delete bookmark
    await deleteBookmark(page, name)

    // -----------------------------------
    // Side by Side mode
    // -----------------------------------
    await viewProject(page, 'Demo GeoSight Project', true);
    await page.getByLabel(TEXT.INDICATOR_LAYERS.sampleIndicatorA).click();
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);

    // Turn on side by side mode
    await page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.Off).click();
    await delay(500)
    await page.getByLabel(TEXT.INDICATOR_LAYERS.sampleIndicatorB).click();
    await delay(500)
    await page.getByLabel(TEXT.INDICATOR_LAYERS.testIndicatorC).click();
    await delay(500)
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkMapStyle(page, 1, TEXT.INDICATOR_LAYERS.sampleIndicatorB);
    await ctx.checkMapStyle(page, 2, TEXT.INDICATOR_LAYERS.testIndicatorC);

    await createBookmark(page, name)

    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.Off)).toBeVisible();
    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.On)).toBeVisible();

    // We view
    await viewProject(page, 'Demo GeoSight Project', true);
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkIndicatorNotSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorB);
    await ctx.checkIndicatorNotSelected(page, TEXT.INDICATOR_LAYERS.testIndicatorC);
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkMapStyle(page, 1, null);
    await ctx.checkMapStyle(page, 2, null);

    // Select bookmark
    await selectBookmark(page, name)
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorB);
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.testIndicatorC);
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkMapStyle(page, 1, TEXT.INDICATOR_LAYERS.sampleIndicatorB);
    await ctx.checkMapStyle(page, 2, TEXT.INDICATOR_LAYERS.testIndicatorC);

    // Delete bookmark
    await deleteBookmark(page, name)
  })
});