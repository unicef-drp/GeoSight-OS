import { expect, test } from '@playwright/test';

// Back to Home returns the map to the project extent without a page error.
// Regression: the button sent [[x1, y1], [x2, y2]] while zoomToExtent expects
// [x1, y1, x2, y2], so maplibre threw "Invalid LngLat object: (NaN, NaN)".
test.describe('Back to Home button', () => {
  test('Zooms to the project extent without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();

    const map = page.locator('.maplibregl-canvas').first();
    await expect(map).toBeVisible();
    const box = await map.boundingBox();

    // Move the map away from the home extent, then go back home.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + 150, box.y + box.height / 2 + 100, { steps: 5 }
    );
    await page.mouse.up();

    await page.locator('[data-tool="Back to Home"] > *').first().click();
    // zoomToExtent runs after a 100 ms timeout; give the camera time to move.
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);
  });
});
