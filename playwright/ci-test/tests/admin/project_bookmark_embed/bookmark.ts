import {expect, test} from '@playwright/test';
import {
  defaultFill,
  defaultLine,
  indicatorAFill,
  indicatorBFill,
  ProjectTestContext,
  TEXT
} from "../../utils/project_context";
import {viewProject, saveProject, deleteProject, saveAsProject} from "../../utils/project";
import {
  createBookmark,
  defaultBookmark,
  defaultCheck,
  deleteBookmark,
  selectBookmark,
  selection
} from '../../utils/bookmark'

const sideBySideText = TEXT.TOOLS_PROJECT.sideBySide;

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
    const bookmarkName = 'Bookmark Map Mode'
    const projectName = 'Demo GeoSight Project Bookmark'
    await deleteProject(page, projectName)
    await saveAsProject(page, 'Demo GeoSight Project', projectName)
    await page.locator('.TabPrimary').getByText('Tools').click();

    // Side by side view
    await expect(page.getByRole('listitem').filter({ hasText: sideBySideText })).toBeVisible();
    await page
      .getByRole('listitem')
      .filter({ hasText: sideBySideText })
      .locator('.VisibilityIconOff')
      .first().click();
    await saveProject(page);
    await viewProject(page, projectName, true);

    // -----------------------------------
    // Compare mode
    // -----------------------------------
    await page.getByLabel(TEXT.INDICATOR_LAYERS.sampleIndicatorA).click();
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);

    // Turn on compare mode
    await page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.Off).click();
    await page.getByLabel(TEXT.INDICATOR_LAYERS.sampleIndicatorB).click();
    expect(ctx.lastLayers["map-0"]).toContain("reference-layer-fill-map-0-0,reference-layer-outline-map-0-0");
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorA + ' (Outline)')
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(1)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorB + ' (Inner)')
    expect(ctx.lastLayerPaintFill["map-0"]).toBe(indicatorBFill + defaultFill);
    expect(ctx.lastLayerPaintLine["map-0"]).toBe(indicatorAFill + defaultLine);

    await createBookmark(page, bookmarkName)

    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.On)).toBeVisible();
    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.Off)).toBeVisible();

    // We view
    await viewProject(page, projectName, true);
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkIndicatorNotSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorB);
    await ctx.checkIndicatorNotSelected(page, TEXT.INDICATOR_LAYERS.kenyaIndicatorA);

    // Select bookmark
    await selectBookmark(page, bookmarkName)
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorB);
    await ctx.checkIndicatorNotSelected(page, TEXT.INDICATOR_LAYERS.kenyaIndicatorA);
    await expect(page.locator("#map-0")).toBeVisible();
    await expect(page.locator("#map-1")).toBeHidden();

    // Delete bookmark
    await deleteBookmark(page, bookmarkName)

    // -----------------------------------
    // Side by Side mode
    // -----------------------------------
    await viewProject(page, projectName, true);
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

    await createBookmark(page, bookmarkName)

    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.Off)).toBeVisible();
    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.On)).toBeVisible();

    // We view
    await viewProject(page, projectName, true);
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkIndicatorNotSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorB);
    await ctx.checkIndicatorNotSelected(page, TEXT.INDICATOR_LAYERS.testIndicatorC);
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkMapStyle(page, 1, null);
    await ctx.checkMapStyle(page, 2, null);

    // Select bookmark
    await selectBookmark(page, bookmarkName)
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorB);
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.testIndicatorC);
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkMapStyle(page, 1, TEXT.INDICATOR_LAYERS.sampleIndicatorB);
    await ctx.checkMapStyle(page, 2, TEXT.INDICATOR_LAYERS.testIndicatorC);

    // Delete bookmark
    await deleteBookmark(page, bookmarkName)
    await deleteProject(page, projectName)
  })

  test('Test bookmark restores map mode off and side by side sync', async ({ page }) => {
    const singleName = 'Bookmark Single Layer'
    const syncOffName = 'Bookmark Sync Off'
    const projectName = 'Demo GeoSight Project Bookmark Sync'
    const syncOn = 'Turn off sync movement'
    const syncOff = 'Turn on sync movement'
    await deleteProject(page, projectName)
    await saveAsProject(page, 'Demo GeoSight Project', projectName)
    await page.locator('.TabPrimary').getByText('Tools').click();
    await page
      .getByRole('listitem')
      .filter({ hasText: sideBySideText })
      .locator('.VisibilityIconOff')
      .first().click();
    await saveProject(page);
    await viewProject(page, projectName, true);

    // One layer, no map mode: saving re-applies it, both modes stay off
    await page.getByLabel(TEXT.INDICATOR_LAYERS.sampleIndicatorA).click();
    await ctx.checkMapStyle(page, 0, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await createBookmark(page, singleName)
    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.Off)).toBeVisible();
    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.Off)).toBeVisible();
    await expect(page.locator("#map-1")).toBeHidden();

    // Side by side with sync off
    await page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.Off).click();
    await delay(500)
    await page.getByLabel(TEXT.INDICATOR_LAYERS.sampleIndicatorB).click();
    await delay(500)
    await page.getByTitle(syncOn).click();
    await expect(page.getByTitle(syncOff)).toBeVisible();
    await createBookmark(page, syncOffName)
    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.On)).toBeVisible();
    await expect(page.getByTitle(syncOff)).toBeVisible();

    // Single layer bookmark turns side by side off
    await selectBookmark(page, singleName)
    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.Off)).toBeVisible();
    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.Off)).toBeVisible();
    await expect(page.locator("#map-1")).toBeHidden();
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkIndicatorNotSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorB);

    // Side by side bookmark restores the mode and sync off
    await selectBookmark(page, syncOffName)
    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.On)).toBeVisible();
    await expect(page.getByTitle(syncOff)).toBeVisible();
    await expect(page.locator("#map-1")).toBeVisible();
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorA);
    await ctx.checkIndicatorSelected(page, TEXT.INDICATOR_LAYERS.sampleIndicatorB);

    // Default bookmark turns side by side off
    await page.getByTitle(syncOff).click();
    await expect(page.getByTitle(syncOn)).toBeVisible();
    await selectBookmark(page)
    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.Off)).toBeVisible();
    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.Off)).toBeVisible();
    await expect(page.locator("#map-1")).toBeHidden();

    // From a fresh page, sync off comes back
    await viewProject(page, projectName, true);
    await selectBookmark(page, syncOffName)
    await expect(page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.On)).toBeVisible();
    await expect(page.getByTitle(syncOff)).toBeVisible();

    // Bookmarks are deleted with the project
    await deleteProject(page, projectName)
  })
});
