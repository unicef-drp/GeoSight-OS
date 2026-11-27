import { devices, expect, test } from '@playwright/test';
import {
  deleteProject,
  saveAsProject,
  saveProject,
  viewProject
} from "../../utils/project";
import { addChartWidget } from "../../utils/chart_widget";

test.use(devices['Galaxy S5']);

// The project is created with a desktop page (the editor is not made for
// phones) and deleted at the end, so the fixtures stay unchanged.
const name = 'Demo GeoSight Project Chart Widget Mobile'

test.describe('Chart widget on a phone', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'states/.auth/admin.json',
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    await saveAsProject(page, 'Demo GeoSight Project', name)
    await page.getByText('Widgets (6)').click();
    await addChartWidget(page, 'Chart on a phone', 'bar')
    await expect(page.getByText('Widgets (7)')).toBeVisible();
    await saveProject(page)
    await context.close();
  });

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'states/.auth/admin.json',
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    await deleteProject(page, name)
    await context.close();
  });

  test('Chart renders in the widget panel', async ({ page }) => {
    await viewProject(page, name, true)
    await page.locator(`.MobileBottomNav .Item[data-item="Widget"]`).click();
    const chart = page.getByTestId('chart-widget')
    await chart.scrollIntoViewIfNeeded();
    await expect(chart.locator('svg').first()).toBeVisible({ timeout: 30000 });

    // Nothing is wider than the screen.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const box = await chart.boundingBox();
    const viewport = page.viewportSize();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);

    // Tap a bar: the tooltip opens inside the chart.
    const svgBox = await chart.locator('svg').first().boundingBox();
    await page.touchscreen.tap(svgBox.x + svgBox.width * 0.5, svgBox.y + 30);
    const tooltip = chart.locator('.widget__chart > div').filter({ hasNot: page.locator('svg') });
    await expect(tooltip.first()).toBeVisible();
    const tipBox = await tooltip.first().boundingBox();
    expect(tipBox.x).toBeGreaterThanOrEqual(0);
    expect(tipBox.x + tipBox.width).toBeLessThanOrEqual(viewport.width);
  })
});
