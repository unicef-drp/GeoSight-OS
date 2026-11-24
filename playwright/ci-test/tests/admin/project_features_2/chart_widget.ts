import { expect, test } from '@playwright/test';
import {
  deleteProject,
  saveAsProject,
  saveProject,
  viewProject
} from "../../utils/project";
import {
  chartOf,
  previewChart,
  watchWidgetConfig
} from "../../utils/chart_widget";

const DEFAULT_CHART = {
  version: 1,
  type: 'bar',
  layout: 'simple',
  horizontal: true,
  area: false,
  labels: false,
  colors: 'map-style',
  linkAreas: true
}

test.describe('Chart widget', () => {
  test('Configure every chart type', async ({ page }) => {
    const state = watchWidgetConfig(page)
    const name = 'Demo GeoSight Project Chart Widget'
    await saveAsProject(page, 'Demo GeoSight Project', name)

    await page.getByText('Widgets (6)').click();
    await page.getByRole('button', { name: 'Add Widget' }).click();

    // The value (summary) stays the default; a chart type tile adds the
    // chart settings.
    await expect.poll(() => state.config?.type).toEqual('GenericSummaryWidget')
    await expect(page.getByTestId('widget-type-value')).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('chart-config')).toBeHidden();
    await page.getByTestId('chart-type-bar').click();
    await expect.poll(() => state.config?.type).toEqual('ChartWidget')
    await expect.poll(() => chartOf(state)).toEqual(DEFAULT_CHART)
    await expect.poll(() => state.config.config.seriesType).toEqual('Geographical units')

    await page.getByRole('textbox', { name: 'Widget name' }).fill('Chart widget');
    await page.getByText('Sync with the current map').first().click();
    await page.getByText('Sync with the current map').nth(1).click();

    // Bar by area shows one value per area: no aggregation setting.
    const aggregation = page.locator('.WidgetEditor').getByText('Aggregation', { exact: true })
    await expect(aggregation).toBeHidden();
    // The number format applies to every value shown: always there.
    const numberFormat = page.locator('.WidgetEditor').getByText('Number format', { exact: true })
    await expect(numberFormat).toBeVisible();

    // Preview: the default bar chart is drawn.
    await expect(previewChart(page)).toHaveAttribute('data-chart-type', 'bar');
    await expect(previewChart(page).locator('svg').first()).toBeVisible({ timeout: 30000 });

    // Bar: layout, orientation, target, labels and colours.
    await page.getByTestId('chart-config-layout').getByText('Stacked', { exact: true }).click();
    await expect.poll(() => chartOf(state).layout).toEqual('stacked')
    await page.getByTestId('chart-config-layout').getByText('100% stacked', { exact: true }).click();
    await expect.poll(() => chartOf(state).layout).toEqual('percent')
    await expect(page.getByTestId('chart-config-target')).toBeHidden();
    await page.getByTestId('chart-config-layout').getByText('Grouped', { exact: true }).click();
    await page.getByTestId('chart-config-target').fill('100');
    await page.getByTestId('chart-config-horizontal').click();
    await page.getByTestId('chart-config-labels').click();
    await page.getByTestId('chart-config-colors').getByText('Palette', { exact: true }).click();
    await expect.poll(() => chartOf(state)).toEqual({
      ...DEFAULT_CHART,
      layout: 'grouped',
      target: 100,
      horizontal: false,
      labels: true,
      colors: 'palette',
      palette: expect.any(Number)
    })
    await expect(previewChart(page).locator('svg').first()).toBeVisible();

    // Line, donut, heatmap, treemap, KPI: one click each.
    for (const type of ['line', 'donut', 'heatmap', 'treemap', 'kpi']) {
      await page.getByTestId(`chart-type-${type}`).click();
      await expect(page.getByTestId(`chart-type-${type}`)).toHaveAttribute('aria-checked', 'true');
      await expect.poll(() => chartOf(state).type).toEqual(type)
      await expect(previewChart(page)).toHaveAttribute('data-chart-type', type);
      await expect(previewChart(page).locator('.dashboard__right_side__loading')).toBeHidden({ timeout: 30000 });
    }

    // Line and heatmap: period.
    await page.getByTestId('chart-type-line').click();
    await page.getByTestId('chart-config-area').click();
    await page.getByTestId('chart-config-period').getByText('Year', { exact: true }).click();
    await expect.poll(() => chartOf(state).period).toEqual('yearly')
    await expect.poll(() => chartOf(state).area).toEqual(true)

    // Scatter: asks for the axes, then draws.
    await page.getByTestId('chart-type-scatter').click();
    await expect(previewChart(page)).toContainText('Pick the indicators of the X and Y axes.');
    await page.getByTestId('chart-config-x').selectOption({ label: 'Sample Indicator A' });
    await page.getByTestId('chart-config-y').selectOption({ label: 'Sample Indicator B' });
    await page.getByTestId('chart-config-pulse').click();
    await expect.poll(() => typeof chartOf(state).x).toEqual('number')
    await expect.poll(() => typeof chartOf(state).y).toEqual('number')
    await expect.poll(() => chartOf(state).pulse).toEqual(1)
    await expect(previewChart(page)).not.toContainText('Pick the indicators');
    await expect(previewChart(page).locator('svg').first()).toBeVisible({ timeout: 30000 });

    // Gauge: scale and target.
    await page.getByTestId('chart-type-gauge').click();
    await page.getByTestId('chart-config-min').fill('0');
    await page.getByTestId('chart-config-max').fill('1000');
    await page.getByTestId('chart-config-target').fill('500');
    await expect.poll(() => [chartOf(state).min, chartOf(state).max, chartOf(state).target]).toEqual([0, 1000, 500])
    // A gauge combines the values of all areas: aggregation is shown.
    await expect(aggregation).toBeVisible();
    await expect(numberFormat).toBeVisible();
    await expect(page.getByTestId('chart-config-labels')).toBeHidden();

    // Advanced: invalid JSON keeps the last valid options.
    await page.getByTestId('chart-config-advanced').click();
    await page.getByTestId('chart-config-overrides').fill('{ "legend": ');
    await expect(page.getByRole('alert')).toContainText('Not valid JSON');
    await expect.poll(() => chartOf(state).overrides ?? null).toEqual(null)
    await page.getByTestId('chart-config-overrides').fill('{ "series": [{ "radius": "80%" }] }');
    await expect(page.getByRole('alert')).toBeHidden();
    await expect.poll(() => chartOf(state).overrides).toEqual({ series: [{ radius: '80%' }] })

    // Back to a bar chart, apply and save.
    await page.getByTestId('chart-type-bar').click();
    await page.getByTestId('chart-config-overrides').fill('');
    await expect.poll(() => chartOf(state).overrides ?? null).toEqual(null)
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByText('Widgets (7)')).toBeVisible();
    await saveProject(page)

    // The dashboard draws the chart.
    await viewProject(page, name, true)
    await expect(page.locator('.widget__title').filter({ hasText: 'Chart widget' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('chart-widget').locator('svg').first()).toBeVisible({ timeout: 30000 });

    // --------------------------------------------------------------------
    // Delete project
    // --------------------------------------------------------------------
    await deleteProject(page, name)
  })

  test('Chart settings are translated', async ({ page }) => {
    // Only opens the editor and cancels: nothing is saved.
    await page.goto('/fr-fr/admin/project/demo-geosight-project/edit');
    await expect(page.locator('div').getByText('Fetching Project Data...')).toBeHidden();
    await page.locator('.TabPrimary > *').filter({ hasText: /\(6\)/ }).last().click();
    await page.getByRole('button', { name: 'Ajouter un widget' }).click();
    await page.getByTestId('chart-type-bar').click();
    // The widget type tiles and the chart settings are in French.
    const tiles = page.locator('.WidgetTypeTiles');
    await expect(tiles).toContainText('Type de widget');
    await expect(tiles).toContainText('Nuage de points');
    await expect(tiles).not.toContainText('admin.widget');
    const config = page.getByTestId('chart-config');
    await expect(config).toContainText('Style de la carte');
    await expect(config).not.toContainText('admin.widget');
  })
});
