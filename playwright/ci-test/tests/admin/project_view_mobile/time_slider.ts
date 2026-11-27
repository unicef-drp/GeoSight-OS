import { devices, expect, test } from '@playwright/test';

test.use(devices['Galaxy S5']);

// Time slider on a phone: collapsed card and bottom sheet (demo project).
// Demo dates (monthly): 10 dates, Jan 2000 ... Jan 2025, Feb 2026.
test.describe('Time slider mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByTitle('Show global time configuration').click();
    await expect(page.getByTestId('time-slider-card')).toBeVisible();
    await expect(page.getByTestId('time-slider-date')).toContainText('Feb 2026');
  });

  test('Card has touch-size controls and steps through dates', async ({ page }) => {
    const date = page.getByTestId('time-slider-date');
    await expect(date).toContainText('Monthly · 10 of 10');

    for (const id of ['play', 'previous', 'next', 'expand']) {
      const box = await page.getByTestId('time-slider-' + id).boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    await page.getByTestId('time-slider-previous').click();
    await expect(date).toContainText('Jan 2025');
    await expect(date).toContainText('9 of 10');
    await page.getByTestId('time-slider-next').click();
    await expect(date).toContainText('Feb 2026');
  });

  test('Sheet opens, changes the interval, stop resets, closes', async ({ page }) => {
    await page.getByTestId('time-slider-previous').click();
    await page.getByTestId('time-slider-expand').click();
    const sheet = page.getByTestId('time-slider-sheet');
    await expect(sheet).toBeVisible();
    await expect(page.getByTestId('time-slider-card')).toBeHidden();

    // Interval
    await page.getByTestId('time-slider-interval-yearly').click();
    await expect(page.getByTestId('time-slider-interval-yearly')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('time-slider-date')).toContainText('2025');

    // Stop resets to the project defaults
    await page.getByTestId('time-slider-stop').click();
    await expect(page.getByTestId('time-slider-interval-monthly')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('time-slider-date')).toContainText('Feb 2026');
    await expect(page.getByLabel('Show last known value in range')).toBeChecked();

    await page.getByTestId('time-slider-collapse').click();
    await expect(sheet).toBeHidden();
    await expect(page.getByTestId('time-slider-card')).toBeVisible();
  });

  test('Card hides while a panel covers the map', async ({ page }) => {
    await page.locator('.MobileBottomNav .Item[data-item="Indicators"]').click();
    await expect(page.getByTestId('time-slider-card')).toBeHidden();
    await page.locator('.MobileBottomNav .Item[data-item="Map"]').click();
    await expect(page.getByTestId('time-slider-card')).toBeVisible();
  });
});
