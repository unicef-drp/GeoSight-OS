import { expect } from '@playwright/test';

export const TEXT = {
  TOOLS_PROJECT: {
    sideBySide: "Side by side view",
    compositeLayer: 'Composite index layer',
    compareLayer: "Compare layers"
  },
  TOOLS_TOGGLER: {
    compareLayer: {
      Off: 'Turn on compare Layers',
      On: 'Turn off compare Layers',
    },
    sideBySide: {
      Off: 'Turn on side by side view',
      On: 'Turn off side by side view',
    },
    compositeLayer: {
      Off: 'Activate composite index layer',
      On: 'Deactivate composite index layer',
    }
  },
  INDICATOR_LAYERS: {
    sampleIndicatorA: 'Sample Indicator A',
    sampleIndicatorB: 'Sample Indicator B',
    pieChartLayer: 'Pie Chart layer',
    pinLayer: 'Pin layer',
    pinsIndicatorLayer: 'Pins Indicator Layer',
    relatedTable: 'Dynamic Layer based on a list of interventions',
    dynamicLayer: 'Dynamic Layer',
    testIndicatorC: 'Test Indicator C',
    testIndicatorD: 'Test Indicator D',
    kenyaIndicatorA: 'Kenya Indicator A',
  }
}

export const defaultFill = `"#D8D8D8"]`
export const defaultLine = `"#ffffff"]`
export const indicatorAFill = '["case",["in",["get","concept_uuid"],["literal",["7977bca3-3645-4072-bfe9-ad342c2674e8","2943bd42-b7c8-45b7-9967-250ba0a72eec","3d7e756f-8060-463e-ae20-b8b9be32e32f","cefc6ec7-fd28-4151-8435-39144de1cb6d","acf728d3-cf60-4ad7-9272-9a1f6f240fa3"]]],"#fdae61",["in",["get","concept_uuid"],["literal",["2e72b6c7-56b3-410b-958c-a400ce692e52","ef43390a-0275-4d43-b2e8-a8aba5c80404","30052d36-45bb-46b2-83c8-63d642c22fb8","a51dceb8-5861-4fe9-978e-b52f16eed328","656e13a9-4ba0-433f-94bc-cebec0c73ad0"]]],"#a6d96a",["in",["get","concept_uuid"],["literal",["3ee7ea44-a5c0-433d-b93d-122110a6ee5c","a84aba36-823d-48e5-8a20-dd7685d24555","84f8d8d7-cbb0-438b-b400-45a8f6ef784d","eb230a71-77e2-41b7-bc5e-1199b67c8290"]]],"#1a9641",["in",["get","concept_uuid"],["literal",["01da401b-09fc-4910-baa1-d42bdba5235a","d7c57957-70cf-4e95-bc4d-c28e739b300a","8bd15515-ea95-40de-bfa8-00813df2ccd3"]]],"#d7191c",["in",["get","concept_uuid"],["literal",["1f8665a3-22d8-44ef-aaa7-7291c89b58db"]]],"#ffffbf",'
export const indicatorALine = '["case",["in",["get","concept_uuid"],["literal",["7977bca3-3645-4072-bfe9-ad342c2674e8","2943bd42-b7c8-45b7-9967-250ba0a72eec","2e72b6c7-56b3-410b-958c-a400ce692e52","3ee7ea44-a5c0-433d-b93d-122110a6ee5c","ef43390a-0275-4d43-b2e8-a8aba5c80404","a84aba36-823d-48e5-8a20-dd7685d24555","30052d36-45bb-46b2-83c8-63d642c22fb8","a51dceb8-5861-4fe9-978e-b52f16eed328","01da401b-09fc-4910-baa1-d42bdba5235a","1f8665a3-22d8-44ef-aaa7-7291c89b58db","3d7e756f-8060-463e-ae20-b8b9be32e32f","d7c57957-70cf-4e95-bc4d-c28e739b300a","cefc6ec7-fd28-4151-8435-39144de1cb6d","acf728d3-cf60-4ad7-9272-9a1f6f240fa3","84f8d8d7-cbb0-438b-b400-45a8f6ef784d","656e13a9-4ba0-433f-94bc-cebec0c73ad0","8bd15515-ea95-40de-bfa8-00813df2ccd3","eb230a71-77e2-41b7-bc5e-1199b67c8290"]]],"#ffffff",'
export const indicatorBFill = '["case",["in",["get","concept_uuid"],["literal",["7977bca3-3645-4072-bfe9-ad342c2674e8","3ee7ea44-a5c0-433d-b93d-122110a6ee5c","a51dceb8-5861-4fe9-978e-b52f16eed328"]]],"#d7191c",["in",["get","concept_uuid"],["literal",["2943bd42-b7c8-45b7-9967-250ba0a72eec","2e72b6c7-56b3-410b-958c-a400ce692e52","84f8d8d7-cbb0-438b-b400-45a8f6ef784d","656e13a9-4ba0-433f-94bc-cebec0c73ad0"]]],"#fdae61",["in",["get","concept_uuid"],["literal",["ef43390a-0275-4d43-b2e8-a8aba5c80404","1f8665a3-22d8-44ef-aaa7-7291c89b58db","d7c57957-70cf-4e95-bc4d-c28e739b300a"]]],"#a6d96a",["in",["get","concept_uuid"],["literal",["a84aba36-823d-48e5-8a20-dd7685d24555","01da401b-09fc-4910-baa1-d42bdba5235a","3d7e756f-8060-463e-ae20-b8b9be32e32f","acf728d3-cf60-4ad7-9272-9a1f6f240fa3","eb230a71-77e2-41b7-bc5e-1199b67c8290"]]],"#ffffbf",["in",["get","concept_uuid"],["literal",["30052d36-45bb-46b2-83c8-63d642c22fb8","8bd15515-ea95-40de-bfa8-00813df2ccd3"]]],"#1a9641",["in",["get","concept_uuid"],["literal",["cefc6ec7-fd28-4151-8435-39144de1cb6d"]]],"#A6A6A6",'
export const indicatorBLine = '["case",["in",["get","concept_uuid"],["literal",["7977bca3-3645-4072-bfe9-ad342c2674e8","2943bd42-b7c8-45b7-9967-250ba0a72eec","2e72b6c7-56b3-410b-958c-a400ce692e52","3ee7ea44-a5c0-433d-b93d-122110a6ee5c","ef43390a-0275-4d43-b2e8-a8aba5c80404","a84aba36-823d-48e5-8a20-dd7685d24555","30052d36-45bb-46b2-83c8-63d642c22fb8","a51dceb8-5861-4fe9-978e-b52f16eed328","01da401b-09fc-4910-baa1-d42bdba5235a","1f8665a3-22d8-44ef-aaa7-7291c89b58db","3d7e756f-8060-463e-ae20-b8b9be32e32f","d7c57957-70cf-4e95-bc4d-c28e739b300a","cefc6ec7-fd28-4151-8435-39144de1cb6d","acf728d3-cf60-4ad7-9272-9a1f6f240fa3","84f8d8d7-cbb0-438b-b400-45a8f6ef784d","656e13a9-4ba0-433f-94bc-cebec0c73ad0","8bd15515-ea95-40de-bfa8-00813df2ccd3","eb230a71-77e2-41b7-bc5e-1199b67c8290"]]],"#ffffff",'
export const indicatorCFill = '["case",["in",["get","concept_uuid"],["literal",["7977bca3-3645-4072-bfe9-ad342c2674e8","2943bd42-b7c8-45b7-9967-250ba0a72eec","2e72b6c7-56b3-410b-958c-a400ce692e52","3ee7ea44-a5c0-433d-b93d-122110a6ee5c","ef43390a-0275-4d43-b2e8-a8aba5c80404","a84aba36-823d-48e5-8a20-dd7685d24555","30052d36-45bb-46b2-83c8-63d642c22fb8","a51dceb8-5861-4fe9-978e-b52f16eed328","01da401b-09fc-4910-baa1-d42bdba5235a","1f8665a3-22d8-44ef-aaa7-7291c89b58db","3d7e756f-8060-463e-ae20-b8b9be32e32f","d7c57957-70cf-4e95-bc4d-c28e739b300a","cefc6ec7-fd28-4151-8435-39144de1cb6d","acf728d3-cf60-4ad7-9272-9a1f6f240fa3","84f8d8d7-cbb0-438b-b400-45a8f6ef784d","656e13a9-4ba0-433f-94bc-cebec0c73ad0","8bd15515-ea95-40de-bfa8-00813df2ccd3","eb230a71-77e2-41b7-bc5e-1199b67c8290"]]],"#edf8fbff",'
export const indicatorCLine = '["case",["in",["get","concept_uuid"],["literal",["7977bca3-3645-4072-bfe9-ad342c2674e8","2943bd42-b7c8-45b7-9967-250ba0a72eec","2e72b6c7-56b3-410b-958c-a400ce692e52","3ee7ea44-a5c0-433d-b93d-122110a6ee5c","ef43390a-0275-4d43-b2e8-a8aba5c80404","a84aba36-823d-48e5-8a20-dd7685d24555","30052d36-45bb-46b2-83c8-63d642c22fb8","a51dceb8-5861-4fe9-978e-b52f16eed328","01da401b-09fc-4910-baa1-d42bdba5235a","1f8665a3-22d8-44ef-aaa7-7291c89b58db","3d7e756f-8060-463e-ae20-b8b9be32e32f","d7c57957-70cf-4e95-bc4d-c28e739b300a","cefc6ec7-fd28-4151-8435-39144de1cb6d","acf728d3-cf60-4ad7-9272-9a1f6f240fa3","84f8d8d7-cbb0-438b-b400-45a8f6ef784d","656e13a9-4ba0-433f-94bc-cebec0c73ad0","8bd15515-ea95-40de-bfa8-00813df2ccd3","eb230a71-77e2-41b7-bc5e-1199b67c8290"]]],"#FFFFFF",'
export const indicatorKenyaFill = '["case",["in",["get","concept_uuid"],["literal",["b4b364fc-0b17-4197-a8de-8c23de0c20cb","59b1eda5-79c9-4594-948f-b69788f63041","f6a52657-0942-4856-a665-b5a544a332fc","cb3c2177-da83-4a2c-9981-5338b90121b5","62b85235-833d-4ff8-a8a2-8a02e5ffccb5","e76e2a73-e17f-4452-90bb-1d31a371dda6","1277d45e-e940-4737-a742-92bf7eb1a804","c9c9faa7-598f-498c-aae6-36dd573d5761","b65f2ef0-c01b-4cda-b76b-a5575383aa83","28888757-2504-4749-948c-6da82982432e","f7db615a-07f9-4695-8ad3-78360cbbbbc9","27297028-fad8-476e-a844-4a302d0351bf","97635a9b-3e3b-48d9-ad44-8b28e5910654","d0b88eff-9f29-43c5-b3e8-0e94d197e441","2976b7cb-d296-4f23-9ac9-c2b8e4aa5395","f54b92a9-09a7-4ed2-9e2d-ceb25a3dc58d","fff93f32-a507-4fc0-8182-53d7e7f51545","3881132a-255a-4200-a83f-30e775ce5a07","90ad8b28-6b2a-4f18-8ad1-443e3cb35f6c"]]],"#d73027ff",["in",["get","concept_uuid"],["literal",["5ce5943e-6988-4bd8-982e-ea8f1dacd3a8","7946c65a-e5c9-4707-8386-0bc12e12231b","001cef03-40c3-4951-8ed7-5687072c2b2e","2598cf3f-aa2b-49d4-b6b3-ecfa949e387a","b0723ced-37e5-40ab-acee-e8425fd86308","108f50cf-dfda-45dc-ac04-c0e05c328303","10add79a-827c-4579-88de-284d66e57b58","119b2238-4a3c-4a14-978c-27504c9e6bfc","9cfab798-623a-472e-85a9-8486cf7e81ef","96e0dca1-c546-44c1-a2cb-c21e2f3ebf1a","35ff463d-1f06-4c06-9aeb-4b52ea4d149c"]]],"#fc8d59ff",["in",["get","concept_uuid"],["literal",["5c4d6805-99d6-406c-83d7-5e06ac07f534","c4bc5799-8299-408a-890a-d295ec0cc03d","72dd3fa3-8d5a-4cb9-bbac-22591be95a7f"]]],"#d9ef8bff",["in",["get","concept_uuid"],["literal",["b7e6c8d1-6e7e-4b0d-b149-d6dc6a793cbb","a1b333c0-2d1b-4e1d-9966-1d5c7ea9d203"]]],"#91cf60ff",["in",["get","concept_uuid"],["literal",["9a8bc945-094f-4c66-a7f7-463399f6dc19","fa41300a-61fd-4bd3-8da9-b1b726221d1e","d243b586-429a-4de3-8713-e13ca058a96d","40d5eb01-f739-431b-89d3-c5a66c9e4527","16a80b96-679c-4f6c-a2ff-5f3a15cb1d28","0ceb38ff-315b-4507-8a3e-0ad8e10cc119","ae3b5025-33e6-45ac-89b3-3350df490db5"]]],"#fee08bff",["in",["get","concept_uuid"],["literal",["c1bd5689-8eb7-40bf-94c7-f3622f267081","917a71d2-e8ef-406b-9edc-3284c1549807"]]],"#ffffbfff",["in",["get","concept_uuid"],["literal",["6d519cb6-cb1d-4f3d-9df3-d33680a797cf","6d872747-ad06-490e-8605-953ec67bde0c","91bb4f12-2412-4f7e-b0be-fa83eb8c18f5"]]],"#1a9850ff",'
export const indicatorKenyaLine = '["case",["in",["get","concept_uuid"],["literal",["b4b364fc-0b17-4197-a8de-8c23de0c20cb","59b1eda5-79c9-4594-948f-b69788f63041","f6a52657-0942-4856-a665-b5a544a332fc","cb3c2177-da83-4a2c-9981-5338b90121b5","5ce5943e-6988-4bd8-982e-ea8f1dacd3a8","5c4d6805-99d6-406c-83d7-5e06ac07f534","b7e6c8d1-6e7e-4b0d-b149-d6dc6a793cbb","9a8bc945-094f-4c66-a7f7-463399f6dc19","c1bd5689-8eb7-40bf-94c7-f3622f267081","7946c65a-e5c9-4707-8386-0bc12e12231b","fa41300a-61fd-4bd3-8da9-b1b726221d1e","a1b333c0-2d1b-4e1d-9966-1d5c7ea9d203","c4bc5799-8299-408a-890a-d295ec0cc03d","6d519cb6-cb1d-4f3d-9df3-d33680a797cf","62b85235-833d-4ff8-a8a2-8a02e5ffccb5","e76e2a73-e17f-4452-90bb-1d31a371dda6","1277d45e-e940-4737-a742-92bf7eb1a804","c9c9faa7-598f-498c-aae6-36dd573d5761","001cef03-40c3-4951-8ed7-5687072c2b2e","d243b586-429a-4de3-8713-e13ca058a96d","2598cf3f-aa2b-49d4-b6b3-ecfa949e387a","b65f2ef0-c01b-4cda-b76b-a5575383aa83","28888757-2504-4749-948c-6da82982432e","f7db615a-07f9-4695-8ad3-78360cbbbbc9","b0723ced-37e5-40ab-acee-e8425fd86308","40d5eb01-f739-431b-89d3-c5a66c9e4527","917a71d2-e8ef-406b-9edc-3284c1549807","16a80b96-679c-4f6c-a2ff-5f3a15cb1d28","108f50cf-dfda-45dc-ac04-c0e05c328303","27297028-fad8-476e-a844-4a302d0351bf","97635a9b-3e3b-48d9-ad44-8b28e5910654","d0b88eff-9f29-43c5-b3e8-0e94d197e441","10add79a-827c-4579-88de-284d66e57b58","2976b7cb-d296-4f23-9ac9-c2b8e4aa5395","72dd3fa3-8d5a-4cb9-bbac-22591be95a7f","f54b92a9-09a7-4ed2-9e2d-ceb25a3dc58d","6d872747-ad06-490e-8605-953ec67bde0c","119b2238-4a3c-4a14-978c-27504c9e6bfc","0ceb38ff-315b-4507-8a3e-0ad8e10cc119","fff93f32-a507-4fc0-8182-53d7e7f51545","3881132a-255a-4200-a83f-30e775ce5a07","9cfab798-623a-472e-85a9-8486cf7e81ef","91bb4f12-2412-4f7e-b0be-fa83eb8c18f5","96e0dca1-c546-44c1-a2cb-c21e2f3ebf1a","ae3b5025-33e6-45ac-89b3-3350df490db5","35ff463d-1f06-4c06-9aeb-4b52ea4d149c","90ad8b28-6b2a-4f18-8ad1-443e3cb35f6c"]]],"#FFFFFF",'

const fillMap = {
  [TEXT.INDICATOR_LAYERS.sampleIndicatorA]: indicatorAFill,
  [TEXT.INDICATOR_LAYERS.sampleIndicatorB]: indicatorBFill,
  [TEXT.INDICATOR_LAYERS.testIndicatorC]: indicatorCFill,
  [TEXT.INDICATOR_LAYERS.kenyaIndicatorA]: indicatorKenyaFill,
};
const lineMap = {
  [TEXT.INDICATOR_LAYERS.sampleIndicatorA]: indicatorALine,
  [TEXT.INDICATOR_LAYERS.sampleIndicatorB]: indicatorBLine,
  [TEXT.INDICATOR_LAYERS.testIndicatorC]: indicatorCLine,
  [TEXT.INDICATOR_LAYERS.kenyaIndicatorA]: indicatorKenyaLine,
};

export function setupConsoleLayerCapture(page, lastLayers, lastLayerPaintFill, lastLayerPaintLine) {
  page.on('console', msg => {
    const matchLayers = msg.text().match(/LAYERS\[(.+?)]:\s*(.+)/);
    if (matchLayers) {
      try {
        lastLayers[matchLayers[1]] = matchLayers[2];
      } catch (e) {
        console.log(e)
      }
    }
    const capture = (pattern, store) => {
      const m = msg.text().match(pattern);
      if (m) store[m[1]] = m[2];
    };
    capture(/LAYER_PAINT_FILL\[(.+?)]:\s*(.+)/, lastLayerPaintFill);
    capture(/LAYER_PAINT_LINE\[(.+?)]:\s*(.+)/, lastLayerPaintLine);
  });
}

export const checkMapStyle = async (page, mapIndex, layerName, lastLayerPaintFill, lastLayerPaintLine) => {
  const container = `#map-${mapIndex}-wrapper`;
  if (layerName === null) {
    await expect(page.locator(container)).toBeHidden();
    return;
  }
  const mapId = `map-${mapIndex}`;
  const fill = fillMap[layerName];
  const line = lineMap[layerName];
  await expect(page.locator(container)).toBeVisible();
  await expect(page.locator(container).locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(0)).toHaveText(layerName);
  await expect(page.locator(container).locator('.MapLegendSectionTitle .ReactSelect__single-value').nth(1)).toBeHidden();
  await expect(page.locator(container).locator('.MapLegendSection').nth(0).locator('.IndicatorLegendRow').first()).toBeVisible();
  await expect(page.locator(container).locator('.MapLegendSection').nth(1).locator('.IndicatorLegendRow').first()).toBeHidden();
  expect(lastLayerPaintFill[mapId]).toBe(fill + defaultFill);
  expect(lastLayerPaintLine[mapId]).toBe(line + defaultLine);
};

export const doSwap = async (page, fromMapIndex, toMapIndex, fromLayerName, toLayerName, togglerClass, lastLayerPaintFill, lastLayerPaintLine) => {
  const container = `#map-${fromMapIndex}-wrapper`;
  await page.locator(container).hover();
  await page.locator(container).locator(".MapLegendSwapIcon." + togglerClass).click({ force: true });
  await checkMapStyle(page, fromMapIndex, toLayerName, lastLayerPaintFill, lastLayerPaintLine);
  await checkMapStyle(page, toMapIndex, fromLayerName, lastLayerPaintFill, lastLayerPaintLine);

  await page.locator(container).locator('.MapLegendSection .ReactSelect').first().click();
  await page.getByRole('option', { name: "[switch] " + fromLayerName }).click();
  await checkMapStyle(page, fromMapIndex, fromLayerName, lastLayerPaintFill, lastLayerPaintLine);
  await checkMapStyle(page, toMapIndex, toLayerName, lastLayerPaintFill, lastLayerPaintLine);
};

export class ProjectTestContext {
  lastLayers = {};
  lastLayerPaintFill = {};
  lastLayerPaintLine = {};

  setup(page) {
    this.lastLayers = {};
    this.lastLayerPaintFill = {};
    this.lastLayerPaintLine = {};
    setupConsoleLayerCapture(page, this.lastLayers, this.lastLayerPaintFill, this.lastLayerPaintLine);
  }

  async checkIndicatorSelected(page, layerName) {
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').getByText(layerName)).toBeVisible();
    await expect(page.getByLabel(layerName)).toBeChecked();
  }

  async checkIndicatorNotSelected(page, layerName) {
    await expect(page.locator('.MapLegendSectionTitle .ReactSelect__single-value').getByText(layerName)).toBeHidden();
    await expect(page.getByLabel(layerName)).not.toBeChecked();
  }

  async checkMapStyle(page, mapIndex, layerName) {
    return checkMapStyle(page, mapIndex, layerName, this.lastLayerPaintFill, this.lastLayerPaintLine);
  }

  async doSwap(page, fromMapIndex, toMapIndex, fromLayerName, toLayerName, togglerClass) {
    return doSwap(page, fromMapIndex, toMapIndex, fromLayerName, toLayerName, togglerClass, this.lastLayerPaintFill, this.lastLayerPaintLine);
  }
}