import { expect, test } from '@playwright/test';
import { delay } from "../../utils";

test.describe('Mapbox style', () => {
  test('Styling mapbox', async ({ page }) => {
    await page.goto(`/en-us/admin/context-layer/2/edit`);
    await page.getByText('Preview').first().click();
    await expect(page.locator('.mapboxgl-ctrl-legend-pane .list--color').nth(0)).toHaveText("00000000-0000-0000-0000-000000000000-copy");
    await expect(page.locator('.mapboxgl-ctrl-legend-pane .list--color').nth(1)).toHaveText("00000000-0000-0000-0000-000000000000-copy-copy-copy");
    await expect(page.locator('.mapboxgl-ctrl-legend-pane .list--color').nth(2)).toHaveText("00000000-0000-0000-0000-000000000000-copy-copy");
    await expect(page.locator('.mapboxgl-ctrl-legend-pane .list--color').nth(3)).toHaveText("00000000-0000-0000-0000-000000000000");

    // Style
    {
      await page.locator('.MuiAccordionSummary-gutters').first().click();
      const li = page.locator('.mapboxgl-ctrl-legend-pane .list--color').locator('li').first();
      await expect(li).toHaveText("00000000-0000-0000-0000-000000000000-copy");
      await expect(await li.evaluate(el => getComputedStyle(el).getPropertyValue('--color'))).toBe('#98F194');
      await expect(page.locator('.MuiAccordionDetails-root .ColorConfig input').first()).toHaveValue("#98F194");
      await page.locator('.MuiAccordionSummary-gutters').first().click();
      await delay(1000)
    }

    // Get all drag icons
    const dragIcons = page.locator('.dragIcon');

    // Select bottom and top handles
    const sourceHandle = dragIcons.last();
    const targetHandle = dragIcons.first();

    // Get bounding boxes
    const sourceBox = await sourceHandle.boundingBox();
    const targetBox = await targetHandle.boundingBox();

    // Simulate actual drag (important for react-beautiful-dnd)
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();

    // Move gradually upward — smooth movement helps trigger DnD events
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2 - 10, { steps: 15 });
    await page.mouse.up();

    await expect(page.locator('.mapboxgl-ctrl-legend-pane .list--color').nth(0)).toHaveText("00000000-0000-0000-0000-000000000000");
    await expect(page.locator('.mapboxgl-ctrl-legend-pane .list--color').nth(1)).toHaveText("00000000-0000-0000-0000-000000000000-copy");
    await expect(page.locator('.mapboxgl-ctrl-legend-pane .list--color').nth(2)).toHaveText("00000000-0000-0000-0000-000000000000-copy-copy-copy");
    await expect(page.locator('.mapboxgl-ctrl-legend-pane .list--color').nth(3)).toHaveText("00000000-0000-0000-0000-000000000000-copy-copy");


    // Change label
    await page.locator('.MuiAccordionSummary-gutters').first().click();
    await page.locator('.MuiAccordionDetails-root input').first().fill('This is test');
    await expect(page.locator('.mapboxgl-ctrl-legend-pane .list--color').nth(0)).toHaveText("This is test");

    // Style
    {
      await page.locator('.MuiAccordionSummary-gutters').first().click();
      const li = page.locator('.mapboxgl-ctrl-legend-pane .list--color').locator('li').first();
      await expect(li).toHaveText("This is test");
      await expect(await li.evaluate(el => getComputedStyle(el).getPropertyValue('--color'))).toEqual("#068600")
      await expect(page.locator('.MuiAccordionDetails-root .ColorConfig input').first()).toHaveValue("#068600");
      await page.locator('.MuiAccordionSummary-gutters').first().click();
      await delay(1000)
    }
  })
  test('Styling with raw', async ({ page }) => {
    await page.goto(`/en-us/admin/context-layer/3/edit`);
    await page.getByText('Preview').first().click();
    await page.getByText('Raw input').first().click();

    // Heatmap
    await page.locator('.ContextLayerConfig textarea').nth(0).fill(
      `
      [{"id":"heatmapLayer","type":"heatmap","source":"source","maxzoom":15,"paint":{"heatmap-weight":["interpolate",["linear"],["get","value"],0,0,1,1],"heatmap-intensity":["interpolate",["linear"],["zoom"],0,1,15,3],"heatmap-color":["interpolate",["linear"],["heatmap-density"],0,"rgba(33,102,172,0)",0.2,"rgb(103,169,207)",0.4,"rgb(209,229,240)",0.6,"rgb(253,219,199)",0.8,"rgb(239,138,98)",1,"rgb(178,24,43)"],"heatmap-radius":["interpolate",["linear"],["zoom"],0,2,9,20],"heatmap-opacity":["interpolate",["linear"],["zoom"],7,1,15,0]}}]
      `
    );
    await page.getByText('Editor').first().click();
    await page.getByRole('button', { name: 'drag heatmapLayer' }).click();
    await expect(page.getByText('This type does not have editor')).toBeVisible();
    await expect(page.getByText('00.20.40.60.81')).toBeVisible();
  });
});