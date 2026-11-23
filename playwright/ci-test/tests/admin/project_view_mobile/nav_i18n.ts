import { devices, expect, test } from '@playwright/test';

test.use(devices['Galaxy S5']);

// The mobile bottom navigation must work in every language, not only English.
// Tabs are found by their stable data-item key; the page is French.
test.describe('Mobile navigation in another language', () => {
  test('Tabs open their panels under /fr-fr/', async ({ page }) => {
    await page.goto('/fr-fr/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Fermer' }).click();

    const tab = (key: string) => page.locator(`.MobileBottomNav .Item[data-item="${key}"]`);
    const panels = {
      'Indicators': page.locator('#indicator-tab-panel'),
      'Context Layers': page.locator('#context-layer-tab-panel'),
      'Filter': page.locator('.filters-tab-content'),
      'Widget': page.locator('.DashboardMiddlePanel .RightContent'),
    };

    // Map is the active tab on load.
    await expect(tab('Map')).toHaveClass(/Active/);

    for (const [key, panel] of Object.entries(panels)) {
      await tab(key).click();
      await expect(tab(key)).toHaveClass(/Active/);
      await expect(panel).toBeInViewport();

      await tab('Map').click();
      await expect(tab('Map')).toHaveClass(/Active/);
      await expect(panel).not.toBeInViewport();
    }
  });
});
