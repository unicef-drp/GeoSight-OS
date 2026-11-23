import { expect, test } from '@playwright/test';

// Time slider (desktop bar) on the demo project.
// Demo dates (monthly): Jan 2000, Jan 2010, Jan 2015, Jan 2020, Dec 2021,
// Jan 2023, Aug 2023, Sep 2023, Jan 2025, Feb 2026 (latest 2026-02-17).
test.describe('Time slider', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByTitle('Show global time configuration').click();
    await expect(page.getByTestId('time-slider-date')).toContainText('Feb 2026');
  });

  test('Playback buttons move through the dates', async ({ page }) => {
    const currentDate = page.locator('.CurrentDate');
    const date = page.getByTestId('time-slider-date');
    await expect(currentDate).toContainText('<=2026-02-17');
    await expect(date).toHaveAttribute('title', 'Jan 1, 2000 – Feb 28, 2026');

    await page.getByTestId('time-slider-first').click();
    await expect(currentDate).toContainText('<=2000-01-01');
    await expect(date).toContainText('Jan 2000');

    await page.getByTestId('time-slider-next').click();
    await expect(currentDate).toContainText('<=2010-01-01');

    await page.getByTestId('time-slider-last').click();
    await expect(currentDate).toContainText('<=2026-02-17');

    await page.getByTestId('time-slider-previous').click();
    await expect(currentDate).toContainText('<=2025-01-01');
    await expect(date).toContainText('Jan 2025');
  });

  test('Play toggles to pause', async ({ page }) => {
    const play = page.getByTestId('time-slider-play');
    await expect(play).toHaveAttribute('title', 'Play');
    await play.click();
    await expect(play).toHaveAttribute('title', 'Pause');
    await expect(play).toHaveAttribute('aria-pressed', 'true');
    await play.click();
    await expect(play).toHaveAttribute('title', 'Play');
  });

  test('Settings set the range and close with Escape', async ({ page }) => {
    const currentDate = page.locator('.CurrentDate');
    await page.getByTestId('time-slider-settings-button').click();
    const settings = page.getByTestId('time-slider-settings');
    await expect(settings).toBeVisible();
    await expect(page.getByTestId('time-slider-from')).toContainText('Jan 2000');
    await expect(page.getByTestId('time-slider-to')).toContainText('Feb 2026');

    await page.getByTestId('time-slider-from').locator('.ReactSelect__indicators').click();
    await page.getByRole('option', { name: 'Jan 2015' }).click();
    await page.keyboard.press('Escape');
    await expect(settings).toBeHidden();

    await page.getByTestId('time-slider-first').click();
    await expect(currentDate).toContainText('<=2015-01-01');
  });

  test('Stop resets to the default time settings', async ({ page }) => {
    const currentDate = page.locator('.CurrentDate');
    const interval = page.getByTestId('time-slider-interval');

    // Change interval, date, range and an option.
    await interval.locator('.ReactSelect__indicators').click();
    await page.getByRole('option', { name: 'Yearly' }).click();
    await expect(interval).toContainText('Yearly');
    await page.getByTestId('time-slider-first').click();
    await expect(currentDate).toContainText('<=2000-01-01');
    await page.getByTestId('time-slider-settings-button').click();
    await page.getByLabel('Show last known value in range').uncheck();
    await expect(currentDate).toHaveText('2000-01-01');

    // Stop: back to the project defaults.
    await page.getByTestId('time-slider-stop').click();
    await expect(interval).toContainText('Monthly');
    await expect(currentDate).toContainText('<=2026-02-17');
    await page.getByTestId('time-slider-settings-button').click();
    await expect(page.getByLabel('Show last known value in range')).toBeChecked();
    await expect(page.getByTestId('time-slider-from')).toContainText('Jan 2000');
  });

  test('Hide closes the bar', async ({ page }) => {
    await page.getByTestId('time-slider-hide').click();
    await expect(page.getByTestId('time-slider-date')).toBeHidden();
    await page.getByTitle('Show global time configuration').click();
    await expect(page.getByTestId('time-slider-date')).toBeVisible();
  });
});
