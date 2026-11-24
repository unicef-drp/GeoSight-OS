import { expect } from "@playwright/test";

/**
 * Helpers for the chart widget specs.
 * The widget editor logs its config as `WIDGET_CONFIG:<json>`.
 */
export function watchWidgetConfig(page) {
  const state = { config: null };
  page.on('console', msg => {
    if (msg.text().indexOf('WIDGET_CONFIG:') !== -1) {
      const log = msg.text().replace('WIDGET_CONFIG:', '')
      if (log) {
        try {
          state.config = JSON.parse(log)
        } catch (e) {
          console.log(e)
        }
      }
    }
  });
  return state
}

/** Chart settings of the widget being edited. */
export function chartOf(state) {
  return state.config?.config?.chart
}

/** The chart drawn in the editor preview. */
export function previewChart(page) {
  return page.getByTestId('chart-preview').getByTestId('chart-widget')
}

/**
 * In the open project editor: add a chart widget synced with the map
 * (all indicators and all geographical units) and apply it.
 */
export async function addChartWidget(
  page, name: string, type: string = 'bar', setup?: (page) => Promise<void>
) {
  await page.getByRole('button', { name: 'Add Widget' }).click();
  await page.getByRole('radio', { name: 'Chart', exact: true }).check();
  await page.getByRole('textbox', { name: 'Widget name' }).fill(name);
  await page.getByText('Sync with the current map').first().click();
  await page.getByText('Sync with the current map').nth(1).click();
  await page.getByTestId(`chart-type-${type}`).click();
  await expect(page.getByTestId(`chart-type-${type}`)).toHaveAttribute('aria-checked', 'true');
  if (setup) {
    await setup(page)
  }
  await page.getByRole('button', { name: 'Apply' }).click();
}

/** The dashboard widget with this title. */
export function dashboardWidget(page, title: string) {
  return page.locator('.widget').filter({
    has: page.locator('.widget__title', { hasText: title })
  })
}

/** Open the info popup of a dashboard widget and return it. */
export async function widgetInformation(page, title: string) {
  await page.mouse.move(0, 0);
  const widget = dashboardWidget(page, title)
  await widget.scrollIntoViewIfNeeded();
  await widget.locator('.widget__title svg').first().hover();
  const popup = page.getByTestId('widget-information').last()
  await expect(popup).toBeVisible();
  return popup
}
