import { expect, test } from '@playwright/test';
import {
  deleteProject,
  saveAsProject,
  saveProject,
  viewProject
} from "../../utils/project";
import {
  addChartWidget,
  dashboardWidget,
  pickChartIndicator,
  widgetInformation
} from "../../utils/chart_widget";

// One project copy with every chart variant, created once and deleted at the
// end, so the fixtures stay unchanged.
const name = 'Demo GeoSight Project Chart Dashboard'

const layout = (label: string) => async (page) => {
  await page.getByTestId('chart-config-layout').getByText(label, { exact: true }).click();
}
const scatter = (pulse: boolean) => async (page) => {
  await pickChartIndicator(page, 'x', 'Sample Indicator A');
  await pickChartIndicator(page, 'y', 'Sample Indicator B');
  if (pulse) {
    await page.getByTestId('chart-config-pulse').click();
  }
}

/**
 * Every chart variant, with what its info popup must show (`info`) and must
 * not show (`hidden`): only the settings the chart type uses are listed.
 */
const CHARTS = [
  {
    title: 'Chart bar', type: 'bar',
    info: ['Chart type:Bar · Simple', 'Group by:', 'Sort by:Value', 'Indicators:'],
    // One latest value per area: nothing to aggregate.
    hidden: ['Target:', 'Aggregation:']
  },
  {
    title: 'Chart stacked', type: 'bar', setup: layout('Stacked'),
    info: ['Chart type:Bar · Stacked', 'Group by:', 'Sort by:'], hidden: []
  },
  {
    title: 'Chart grouped', type: 'bar', setup: layout('Grouped'),
    info: ['Chart type:Bar · Grouped'], hidden: []
  },
  {
    title: 'Chart percent', type: 'bar', setup: layout('100% stacked'),
    info: ['Chart type:Bar · 100% stacked'], hidden: []
  },
  {
    title: 'Chart target', type: 'bar',
    setup: async (page) => {
      await page.getByTestId('chart-config-target').fill('50');
    },
    info: ['Chart type:Bar · Simple', 'Target:50'], hidden: []
  },
  {
    title: 'Chart line', type: 'line',
    setup: async (page) => {
      await page.getByTestId('chart-config-period').getByText('Year', { exact: true }).click();
    },
    info: ['Chart type:Line', 'Period:Year', 'Aggregation:SUM', 'Group by:', 'Indicators:'],
    hidden: ['Sort by:']
  },
  {
    title: 'Chart donut', type: 'donut',
    info: ['Chart type:Donut', 'Group by:', 'Sort by:'], hidden: ['Period:', 'Aggregation:']
  },
  {
    title: 'Chart heatmap', type: 'heatmap',
    info: ['Chart type:Heatmap', 'Period:Each date', 'Group by:'],
    hidden: ['Sort by:', 'Aggregation:']
  },
  {
    title: 'Chart treemap', type: 'treemap',
    info: ['Chart type:Treemap', 'Group by:', 'Sort by:'], hidden: []
  },
  {
    title: 'Chart gauge', type: 'gauge',
    setup: async (page) => {
      await page.getByTestId('chart-config-target').fill('500');
    },
    info: ['Chart type:Gauge', 'Target:500', 'Aggregation:SUM', 'Indicators:'],
    hidden: ['Group by:', 'Sort by:']
  },
  {
    title: 'Chart KPI', type: 'kpi',
    info: ['Chart type:KPI', 'Period:Each date', 'Aggregation:SUM', 'Indicators:'],
    hidden: ['Group by:', 'Sort by:']
  },
  {
    title: 'Chart scatter', type: 'scatter', setup: scatter(false),
    info: ['Chart type:Scatter', 'X axis:Sample Indicator A', 'Y axis:Sample Indicator B'],
    hidden: ['Group by:', 'Sort by:', 'Indicators:', 'Point size:', 'Aggregation:']
  },
  {
    title: 'Chart effect scatter', type: 'scatter', setup: scatter(true),
    info: ['Chart type:Scatter', 'X axis:Sample Indicator A'],
    hidden: ['Group by:', 'Indicators:']
  },
]

test.describe('Chart widget on the dashboard', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'states/.auth/admin.json',
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    await saveAsProject(page, 'Demo GeoSight Project', name)
    await page.getByText('Widgets (6)').click();
    for (const chart of CHARTS) {
      await addChartWidget(page, chart.title, chart.type, chart.setup)
    }
    await expect(page.getByText(`Widgets (${6 + CHARTS.length})`)).toBeVisible();
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

  test('Every chart type renders', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await viewProject(page, name, true)
    for (const chart of CHARTS) {
      const widget = dashboardWidget(page, chart.title)
      await widget.scrollIntoViewIfNeeded();
      const view = widget.getByTestId('chart-widget')
      await expect(view, chart.title).toHaveAttribute('data-chart-type', chart.type);
      await expect(view.locator('.dashboard__right_side__loading'), chart.title).toBeHidden({ timeout: 30000 });
      await expect(view.locator('svg').first(), chart.title).toBeVisible({ timeout: 30000 });
      await expect(view, chart.title).not.toContainText('No data found');
      await expect(view.locator('.error'), chart.title).toHaveCount(0);
      if (chart.type === 'kpi') {
        await expect(view.getByTestId('chart-kpi'), chart.title).toBeVisible();
      }
    }
    expect(errors).toEqual([]);
  })

  test('The info popup lists the settings of each chart', async ({ page }) => {
    await viewProject(page, name, true)
    for (const chart of CHARTS) {
      const popup = await widgetInformation(page, chart.title)
      const text = (await popup.innerText()).replace(/\n/g, '')
      for (const expected of chart.info) {
        expect(text, `${chart.title}: ${expected}`).toContain(expected)
      }
      for (const unexpected of chart.hidden) {
        expect(text, `${chart.title}: not ${unexpected}`).not.toContain(unexpected)
      }
    }
  })

  test('Clicking an area selects it on the map', async ({ page }) => {
    const selections = [];
    page.on('console', msg => {
      if (msg.text().indexOf('SEARCH_GEOMETRY_INPUT:') !== -1) {
        selections.push(msg.text())
      }
    });
    await viewProject(page, name, true)
    const view = dashboardWidget(page, 'Chart bar').getByTestId('chart-widget')
    await view.scrollIntoViewIfNeeded();
    const label = view.locator('svg text', { hasText: 'Bakool' }).first()
    await expect(label).toBeVisible({ timeout: 30000 });

    // First click: the map zooms to the area.
    await label.click();
    await expect.poll(() => selections.length).toBe(1);

    // The area is outlined in the chart: its axis label is bold.
    await expect(view.locator('svg text', { hasText: 'Bakool' }).first()).toHaveAttribute('style', /bold|700/);

    // Second click: the selection is cleared (no new zoom).
    await view.locator('svg text', { hasText: 'Bakool' }).first().click();
    await expect(view.locator('svg text', { hasText: 'Bakool' }).first()).not.toHaveAttribute('style', /bold|700/);
    expect(selections.length).toBe(1);
  })

  test('The legend shows the first entries and expands to all', async ({ page }) => {
    await viewProject(page, name, true)
    const view = dashboardWidget(page, 'Chart donut').getByTestId('chart-widget')
    await view.scrollIntoViewIfNeeded();
    await expect(view.locator('svg').first()).toBeVisible({ timeout: 30000 });
    const legend = view.getByTestId('chart-legend')
    const entries = legend.locator('li button')

    // 11 areas and "Other": 6 shown, the button shows all 12.
    await expect(entries).toHaveCount(6);
    const more = legend.getByTestId('chart-legend-more')
    await expect(more).toHaveText('Show all (12)');
    await more.click();
    await expect(entries).toHaveCount(12);
    await expect(entries.last()).toHaveText('Other');
    await expect(more).toHaveText('Show less');
    await more.click();
    await expect(entries).toHaveCount(6);

    // An entry toggles its slice.
    const first = entries.first()
    await expect(first).toHaveAttribute('aria-pressed', 'true');
    await first.click();
    await expect(first).toHaveAttribute('aria-pressed', 'false');
    await first.click();
    await expect(first).toHaveAttribute('aria-pressed', 'true');

    // No ECharts legend with paging arrows.
    await expect(view.locator('svg').first()).not.toContainText('1/');
  })

  test('A multi-indicator layer gets an indicator picker', async ({ page }) => {
    await viewProject(page, name, true)
    const view = dashboardWidget(page, 'Chart bar').getByTestId('chart-widget')
    await view.scrollIntoViewIfNeeded();
    // One indicator on the map: no picker.
    await expect(view.locator('svg').first()).toBeVisible({ timeout: 30000 });
    await expect(view.getByTestId('chart-indicator-picker')).toHaveCount(0);

    // Multi-indicator layer: pick one of its indicators.
    await page.getByLabel('Pie Chart layer').click();
    const picker = view.getByTestId('chart-indicator-picker')
    await expect(picker).toBeVisible({ timeout: 30000 });
    await expect(picker.locator('option')).toHaveText(['Sample Indicator A', 'Sample Indicator B']);
    const before = await view.locator('svg').first().innerHTML()
    await picker.selectOption({ label: 'Sample Indicator B' });
    await expect.poll(async () => await view.locator('svg').first().innerHTML(), { timeout: 30000 }).not.toEqual(before);
    await expect(view).not.toContainText('No data found');

    // Charts that show several indicators draw them all: no picker.
    const stacked = dashboardWidget(page, 'Chart stacked').getByTestId('chart-widget')
    await stacked.scrollIntoViewIfNeeded();
    await expect(stacked.locator('svg').first()).toBeVisible({ timeout: 30000 });
    await expect(stacked.getByTestId('chart-indicator-picker')).toHaveCount(0);
  })
});
