import { expect, test } from '@playwright/test';
import { viewProject } from "../../utils/project";

// Read-only: the demo project is only viewed, nothing is saved.
test.describe('Summary table linked to the map', () => {
  test('Clicking an area name selects it on the map', async ({ page }) => {
    const selections = [];
    page.on('console', msg => {
      if (msg.text().indexOf('SEARCH_GEOMETRY_INPUT:') !== -1) {
        selections.push(msg.text())
      }
    });
    await viewProject(page, 'Demo GeoSight Project', true)
    const table = page.locator('.widget', { hasText: 'Value by Geom Code' })
    await table.scrollIntoViewIfNeeded();
    const area = table.locator('.widget__table__area', { hasText: 'Bay' })
    await expect(area).toBeVisible({ timeout: 30000 });
    await expect(area).toHaveAttribute('aria-pressed', 'false');

    // First click: the map zooms to the area and the row is highlighted.
    await area.click();
    await expect.poll(() => selections.length, { timeout: 15000 }).toBeGreaterThan(0);
    await expect(area).toHaveAttribute('aria-pressed', 'true');
    await expect(table.locator('tr.Selected')).toHaveCount(1);
    await expect(table.locator('tr.Selected')).toContainText('Bay');

    // Second click: the selection is cleared.
    await area.click();
    await expect(table.locator('tr.Selected')).toHaveCount(0);
    await expect(area).toHaveAttribute('aria-pressed', 'false');
  });
});
