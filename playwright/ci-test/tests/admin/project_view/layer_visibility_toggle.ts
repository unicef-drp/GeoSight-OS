import { expect, test } from '@playwright/test';

/**
 * The eye toggles next to the "Context Layers" and "Indicators" tabs have a
 * square click area around the icon. A click near the edge of that area must
 * toggle the layers and must not switch the tab.
 */
test.describe('Layer visibility toggles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();
  });

  for (const toggleId of ['context-layers-visibility', 'indicators-visibility']) {
    test(`Toggle ${toggleId} from the edge of its click area`, async ({ page }) => {
      const indicatorTab = page.locator('#simple-tab-indicator');
      const contextTab = page.locator('#simple-tab-context-layer');
      await expect(indicatorTab).toHaveAttribute('aria-selected', 'true');

      const toggle = page.getByTestId(toggleId);
      await expect(toggle).toHaveAttribute('data-visible', 'true');

      // The click area is a square, larger than the 16x10 eye icon
      const box = await toggle.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(24);
      expect(box.height).toBeGreaterThanOrEqual(24);

      // Top-left corner: outside the icon strokes, inside the click area
      await page.mouse.click(box.x + 2, box.y + 2);
      await expect(toggle).toHaveAttribute('data-visible', 'false');
      await expect(indicatorTab).toHaveAttribute('aria-selected', 'true');
      await expect(contextTab).toHaveAttribute('aria-selected', 'false');

      // Bottom-right corner turns it back on
      await page.mouse.click(box.x + box.width - 2, box.y + box.height - 2);
      await expect(toggle).toHaveAttribute('data-visible', 'true');
      await expect(indicatorTab).toHaveAttribute('aria-selected', 'true');
    });
  }
});
