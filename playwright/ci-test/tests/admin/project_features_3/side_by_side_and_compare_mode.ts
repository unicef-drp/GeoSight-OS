import { expect, test } from '@playwright/test';
import { viewProject } from "../../utils/project";
import { TEXT } from "../../variables";

// URL That we need to check
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const defaultFill = `"#D8D8D8"]`
const defaultLine = `"#ffffff"]`
const indicatorAFill = '["case",["in",["get","concept_uuid"],["literal",["7977bca3-3645-4072-bfe9-ad342c2674e8","2943bd42-b7c8-45b7-9967-250ba0a72eec","3d7e756f-8060-463e-ae20-b8b9be32e32f","cefc6ec7-fd28-4151-8435-39144de1cb6d","acf728d3-cf60-4ad7-9272-9a1f6f240fa3"]]],"#fdae61",["in",["get","concept_uuid"],["literal",["2e72b6c7-56b3-410b-958c-a400ce692e52","ef43390a-0275-4d43-b2e8-a8aba5c80404","30052d36-45bb-46b2-83c8-63d642c22fb8","a51dceb8-5861-4fe9-978e-b52f16eed328","656e13a9-4ba0-433f-94bc-cebec0c73ad0"]]],"#a6d96a",["in",["get","concept_uuid"],["literal",["3ee7ea44-a5c0-433d-b93d-122110a6ee5c","a84aba36-823d-48e5-8a20-dd7685d24555","84f8d8d7-cbb0-438b-b400-45a8f6ef784d","eb230a71-77e2-41b7-bc5e-1199b67c8290"]]],"#1a9641",["in",["get","concept_uuid"],["literal",["01da401b-09fc-4910-baa1-d42bdba5235a","d7c57957-70cf-4e95-bc4d-c28e739b300a","8bd15515-ea95-40de-bfa8-00813df2ccd3"]]],"#d7191c",["in",["get","concept_uuid"],["literal",["1f8665a3-22d8-44ef-aaa7-7291c89b58db"]]],"#ffffbf",'
const indicatorALine = '["case",["in",["get","concept_uuid"],["literal",["7977bca3-3645-4072-bfe9-ad342c2674e8","2943bd42-b7c8-45b7-9967-250ba0a72eec","2e72b6c7-56b3-410b-958c-a400ce692e52","3ee7ea44-a5c0-433d-b93d-122110a6ee5c","ef43390a-0275-4d43-b2e8-a8aba5c80404","a84aba36-823d-48e5-8a20-dd7685d24555","30052d36-45bb-46b2-83c8-63d642c22fb8","a51dceb8-5861-4fe9-978e-b52f16eed328","01da401b-09fc-4910-baa1-d42bdba5235a","1f8665a3-22d8-44ef-aaa7-7291c89b58db","3d7e756f-8060-463e-ae20-b8b9be32e32f","d7c57957-70cf-4e95-bc4d-c28e739b300a","cefc6ec7-fd28-4151-8435-39144de1cb6d","acf728d3-cf60-4ad7-9272-9a1f6f240fa3","84f8d8d7-cbb0-438b-b400-45a8f6ef784d","656e13a9-4ba0-433f-94bc-cebec0c73ad0","8bd15515-ea95-40de-bfa8-00813df2ccd3","eb230a71-77e2-41b7-bc5e-1199b67c8290"]]],"#ffffff",'
const indicatorBFill = '["case",["in",["get","concept_uuid"],["literal",["7977bca3-3645-4072-bfe9-ad342c2674e8","3ee7ea44-a5c0-433d-b93d-122110a6ee5c","a51dceb8-5861-4fe9-978e-b52f16eed328"]]],"#d7191c",["in",["get","concept_uuid"],["literal",["2943bd42-b7c8-45b7-9967-250ba0a72eec","2e72b6c7-56b3-410b-958c-a400ce692e52","84f8d8d7-cbb0-438b-b400-45a8f6ef784d","656e13a9-4ba0-433f-94bc-cebec0c73ad0"]]],"#fdae61",["in",["get","concept_uuid"],["literal",["ef43390a-0275-4d43-b2e8-a8aba5c80404","1f8665a3-22d8-44ef-aaa7-7291c89b58db","d7c57957-70cf-4e95-bc4d-c28e739b300a"]]],"#a6d96a",["in",["get","concept_uuid"],["literal",["a84aba36-823d-48e5-8a20-dd7685d24555","01da401b-09fc-4910-baa1-d42bdba5235a","3d7e756f-8060-463e-ae20-b8b9be32e32f","acf728d3-cf60-4ad7-9272-9a1f6f240fa3","eb230a71-77e2-41b7-bc5e-1199b67c8290"]]],"#ffffbf",["in",["get","concept_uuid"],["literal",["30052d36-45bb-46b2-83c8-63d642c22fb8","8bd15515-ea95-40de-bfa8-00813df2ccd3"]]],"#1a9641",["in",["get","concept_uuid"],["literal",["cefc6ec7-fd28-4151-8435-39144de1cb6d"]]],"#A6A6A6",'
const indicatorBLine = '["case",["in",["get","concept_uuid"],["literal",["7977bca3-3645-4072-bfe9-ad342c2674e8","2943bd42-b7c8-45b7-9967-250ba0a72eec","2e72b6c7-56b3-410b-958c-a400ce692e52","3ee7ea44-a5c0-433d-b93d-122110a6ee5c","ef43390a-0275-4d43-b2e8-a8aba5c80404","a84aba36-823d-48e5-8a20-dd7685d24555","30052d36-45bb-46b2-83c8-63d642c22fb8","a51dceb8-5861-4fe9-978e-b52f16eed328","01da401b-09fc-4910-baa1-d42bdba5235a","1f8665a3-22d8-44ef-aaa7-7291c89b58db","3d7e756f-8060-463e-ae20-b8b9be32e32f","d7c57957-70cf-4e95-bc4d-c28e739b300a","cefc6ec7-fd28-4151-8435-39144de1cb6d","acf728d3-cf60-4ad7-9272-9a1f6f240fa3","84f8d8d7-cbb0-438b-b400-45a8f6ef784d","656e13a9-4ba0-433f-94bc-cebec0c73ad0","8bd15515-ea95-40de-bfa8-00813df2ccd3","eb230a71-77e2-41b7-bc5e-1199b67c8290"]]],"#ffffff",'

test.describe('Side by side and compare mode', () => {
  test('Compare mode', async ({ page }, testInfo) => {
    const lastLayers: Record<string, string> = {}
    const lastLayerPaintFill: Record<string, string> = {}
    const lastLayerPaintLine: Record<string, string> = {}
    page.on('console', msg => {
      const matchLayers = msg.text().match(/LAYERS\[(.+?)]:\s*(.+)/);
      if (matchLayers) {
        try {
          lastLayers[matchLayers[1]] = matchLayers[2];
        } catch (e) {
          console.log(e)
        }
      }
      const capture = (pattern: RegExp, store: Record<string, string>) => {
        const m = msg.text().match(pattern);
        if (m) store[m[1]] = m[2];
      };
      capture(/LAYER_PAINT_FILL\[(.+?)]:\s*(.+)/, lastLayerPaintFill);
      capture(/LAYER_PAINT_LINE\[(.+?)]:\s*(.+)/, lastLayerPaintLine);
    });
    await viewProject(page, 'Demo GeoSight Project');
    await page.getByRole('button', { name: 'Close' }).click();

    // Compare mode
    await page.getByLabel(TEXT.INDICATOR_LAYERS.sampleIndicatorA).click();
    await delay(1000);
    await expect(page.locator('#indicator-tab-panel .MuiCheckbox-root:visible')).toHaveCount(0);
    await expect(page.locator('#indicator-tab-panel .MuiRadio-root:visible')).toHaveCount(10);
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorA)
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(1)).toBeHidden()
    await expect(page.locator('.MapLegendSection').nth(0).locator('.IndicatorLegendRow').first()).toBeVisible()
    await expect(page.locator('.MapLegendSection').nth(1).locator('.IndicatorLegendRow').first()).toBeHidden()
    expect(lastLayerPaintFill["map-0"]).toBe(indicatorAFill + defaultFill);
    expect(lastLayerPaintLine["map-0"]).toBe(indicatorALine + defaultLine);

    // Turn on compare mode
    await page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.Off).click();
    await expect(page.locator('#indicator-tab-panel .MuiCheckbox-root:visible')).toHaveCount(10);
    await expect(page.locator('#indicator-tab-panel .MuiRadio-root:visible')).toHaveCount(0);
    expect(lastLayerPaintFill["map-0"]).toBe('"#D8D8D8"');
    expect(lastLayerPaintLine["map-0"]).toBe(indicatorAFill + defaultLine);

    // Add indicator B
    await page.getByLabel(TEXT.INDICATOR_LAYERS.sampleIndicatorB).click();
    await delay(1000);
    expect(lastLayers["map-0"]).toContain("reference-layer-fill-map-0-0,reference-layer-outline-map-0-0,reference-layer-fill-map-0-1,reference-layer-outline-map-0-1");
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorA + ' (Outline)')
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(1)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorB + ' (Inner)')
    await expect(page.locator('.MapLegendSection').nth(0).locator('.IndicatorLegendRow').first()).toBeVisible()
    await expect(page.locator('.MapLegendSection').nth(1).locator('.IndicatorLegendRow').first()).toBeVisible()
    expect(lastLayerPaintFill["map-0"]).toBe(indicatorBFill + defaultFill);
    expect(lastLayerPaintLine["map-0"]).toBe(indicatorAFill + defaultLine);

    // We swap
    await page.locator('.MapLegend .MapLegendSwapIcon').click()
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorB + ' (Outline)')
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(1)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorA + ' (Inner)')
    await expect(page.locator('.MapLegendSection').nth(0).locator('.IndicatorLegendRow').first()).toBeVisible()
    await expect(page.locator('.MapLegendSection').nth(0).locator('.IndicatorLegendRow').first()).toBeVisible()
    expect(lastLayerPaintFill["map-0"]).toBe(indicatorAFill + defaultFill);
    expect(lastLayerPaintLine["map-0"]).toBe(indicatorBFill + defaultLine);

    // Sawp with select
    await page.locator('#map-0-wrapper .MapLegendSection .ReactSelect').first().click();
    await page.getByRole('option', { name: '[switch] Sample Indicator A' }).click();
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorA + ' (Outline)')
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(1)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorB + ' (Inner)')
    expect(lastLayerPaintFill["map-0"]).toBe(indicatorBFill + defaultFill);
    expect(lastLayerPaintLine["map-0"]).toBe(indicatorAFill + defaultLine);

    // Turn off compare mode
    await page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.On).click();
    await expect(page.locator('#indicator-tab-panel .MuiCheckbox-root:visible')).toHaveCount(0);
    await expect(page.locator('#indicator-tab-panel .MuiRadio-root:visible')).toHaveCount(10);

    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorA)
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(1)).toBeHidden()
    await expect(page.locator('.MapLegendSection').nth(0).locator('.IndicatorLegendRow').first()).toBeVisible()
    await expect(page.locator('.MapLegendSection').nth(1).locator('.IndicatorLegendRow').first()).toBeHidden()
    expect(lastLayerPaintFill["map-0"]).toBe(indicatorAFill + defaultFill);
    expect(lastLayerPaintLine["map-0"]).toBe(indicatorALine + defaultLine);

    // We turn it on
    await page.getByTitle(TEXT.TOOLS_TOGGLER.compareLayer.Off).click();
    await page.getByLabel(TEXT.INDICATOR_LAYERS.sampleIndicatorB).click();
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorA + ' (Outline)')
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(1)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorB + ' (Inner)')

    // We change to side by side
    await page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.Off).click();
    await expect(page.locator('#map-0-wrapper .MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorA)
    await expect(page.locator('#map-1-wrapper .MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorB)
    expect(lastLayerPaintFill["map-0"]).toBe(indicatorAFill + defaultFill);
    expect(lastLayerPaintLine["map-0"]).toBe(indicatorALine + defaultLine);
    expect(lastLayerPaintFill["map-1"]).toBe(indicatorBFill + defaultFill);
    expect(lastLayerPaintLine["map-1"]).toBe(indicatorBLine + defaultLine);

    // Sawp with select
    await page.locator('#map-0-wrapper .MapLegendSection .ReactSelect').click();
    await page.getByRole('option', { name: '[switch] Sample Indicator B' }).click();
    await expect(page.locator('#map-0-wrapper .MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorB)
    await expect(page.locator('#map-1-wrapper .MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorA)
    expect(lastLayerPaintFill["map-0"]).toBe(indicatorBFill + defaultFill);
    expect(lastLayerPaintLine["map-0"]).toBe(indicatorBLine + defaultLine);
    expect(lastLayerPaintFill["map-1"]).toBe(indicatorAFill + defaultFill);
    expect(lastLayerPaintLine["map-1"]).toBe(indicatorALine + defaultLine);

    await page.getByTitle(TEXT.TOOLS_TOGGLER.sideBySide.On).click();
    await expect(page.locator('#map-1-wrapper')).toBeHidden();
    await expect(page.locator('#map-0-wrapper .MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(TEXT.INDICATOR_LAYERS.sampleIndicatorB)
    expect(lastLayerPaintFill["map-0"]).toBe(indicatorBFill + defaultFill);
    expect(lastLayerPaintLine["map-0"]).toBe(indicatorBLine + defaultLine);
  })
});