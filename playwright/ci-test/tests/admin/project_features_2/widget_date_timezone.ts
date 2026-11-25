import { expect, Page, Request, test } from '@playwright/test';

/**
 * Widget dates must not depend on the viewer's timezone.
 *
 * The widgets of the demo project are replaced in the dashboard data response,
 * so nothing is written to the database. The requests the widgets send are
 * read and their date__gte / date__lte checked.
 */

const PROJECT = 'demo-geosight-project';
const DATA_URL = `**/api/dashboard/${PROJECT}/data`;
const SUMMARY_WIDGET_ID = 86;      // Total of Sample indicator A (GenericSummaryWidget)
const TIME_SERIES_WIDGET_ID = 36;  // Time Chart by Indicator (TimeSeriesChartWidget)
const PREDEFINED = 'Predefined start/end date';
const SYNC = 'Sync with dashboard';

/** Local 2010-01-01 00:00 and 2010-12-31 23:30 as the editor stored them before the fix (UTC ISO). */
const ZONES = [
  {
    timezoneId: 'Europe/Warsaw',
    oldMin: '2009-12-31T23:00:00.000Z',
    oldMax: '2010-12-31T22:30:00.000Z'
  },
  {
    timezoneId: 'Asia/Tokyo',
    oldMin: '2009-12-31T15:00:00.000Z',
    oldMax: '2010-12-31T14:30:00.000Z'
  },
  {
    timezoneId: 'America/New_York',
    oldMin: '2010-01-01T05:00:00.000Z',
    oldMax: '2011-01-01T04:30:00.000Z'
  },
];

const NEW_MIN = '2010-01-01T00:00:00';
const NEW_MAX = '2010-12-31T23:30:00';

/** Keep only one widget and set its date config. */
async function showOnlyWidget(
  page: Page, widgetId: number, dateTimeType: string, min?: string, max?: string
) {
  await page.route(DATA_URL, async route => {
    const response = await route.fetch();
    const json = await response.json();
    json.widgets = json.widgets
      .filter(widget => widget.id === widgetId)
      .map(widget => {
        widget.config.dateTimeType = dateTimeType;
        if (dateTimeType === PREDEFINED) {
          widget.config.dateTimeConfig = {
            ...widget.config.dateTimeConfig,
            minDateFilter: min,
            maxDateFilter: max
          };
        }
        return widget;
      });
    await route.fulfill({ response, json });
  });
}

const isStatistic = (request: Request) =>
  request.method() === 'POST' && request.url().includes('/indicators/data/statistic/');
const isValues = (request: Request) =>
  request.method() === 'POST' && /\/indicators\/\d+\/data\/values\//.test(request.url());

async function requestDates(page: Page, matcher: (request: Request) => boolean) {
  const requestPromise = page.waitForRequest(matcher);
  await page.goto(`/project/${PROJECT}`);
  const body = (await requestPromise).postDataJSON();
  return { gte: body.date__gte, lte: body.date__lte };
}

for (const zone of ZONES) {
  test.describe(`Widget dates in ${zone.timezoneId}`, () => {
    test.use({ timezoneId: zone.timezoneId });

    test('Summary: config saved before the fix keeps its days', async ({ page }) => {
      await showOnlyWidget(page, SUMMARY_WIDGET_ID, PREDEFINED, zone.oldMin, zone.oldMax);
      expect(await requestDates(page, isStatistic)).toEqual({ gte: '2010-01-01', lte: '2010-12-31' });

      // Information popup shows the same local dates
      await page.getByRole('button', { name: 'Close' }).click();
      await page.locator('.widget__title svg').first().hover();
      await expect(page.locator('.WidgetInformation')).toContainText(`${NEW_MIN} - ${NEW_MAX}`);
    });

    test('Summary: new config gives the same days', async ({ page }) => {
      await showOnlyWidget(page, SUMMARY_WIDGET_ID, PREDEFINED, NEW_MIN, NEW_MAX);
      expect(await requestDates(page, isStatistic)).toEqual({ gte: '2010-01-01', lte: '2010-12-31' });
    });

    test('Time series: config saved before the fix keeps its days', async ({ page }) => {
      await showOnlyWidget(page, TIME_SERIES_WIDGET_ID, PREDEFINED, zone.oldMin, zone.oldMax);
      expect(await requestDates(page, isValues)).toEqual({ gte: '2010-01-01', lte: '2010-12-31' });
    });

    test('Time series: new config gives the same days', async ({ page }) => {
      await showOnlyWidget(page, TIME_SERIES_WIDGET_ID, PREDEFINED, NEW_MIN, NEW_MAX);
      expect(await requestDates(page, isValues)).toEqual({ gte: '2010-01-01', lte: '2010-12-31' });
    });

    test('Time series: sync uses the dashboard dates', async ({ page }) => {
      await showOnlyWidget(page, TIME_SERIES_WIDGET_ID, SYNC);
      // The dashboard dates arrive after the time slider has loaded them,
      // so wait for the request that has them.
      const dates = await requestDates(
        page, request => isValues(request) && !!request.postDataJSON()?.date__gte
      );
      expect(dates.gte).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(dates.lte).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(dates.gte <= dates.lte).toBeTruthy();
    });
  });
}

test.describe('Widget editor dates', () => {
  test.use({ timezoneId: 'Europe/Warsaw' });

  test('Saves the picked date without a timezone', async ({ page }) => {
    await page.goto(`/admin/project/${PROJECT}/edit`);
    await page.getByText(/^Widgets \(\d+\)$/).click();
    await page.getByRole('button', { name: 'Add Widget' }).click();
    await page.getByRole('textbox', { name: 'Widget name' }).fill('Date widget');
    await page.getByText(PREDEFINED).click();

    const pickers = page.locator('.CustomDateFilterValues .react-datepicker__input-container input');
    // Escape would close the whole widget dialog: close the calendar by clicking the name field.
    const nameInput = page.getByRole('textbox', { name: 'Widget name' });
    await pickers.nth(0).fill('01-01-2010 10:30:00');
    await nameInput.click();
    await pickers.nth(1).fill('31-12-2010 11:00:00');
    await nameInput.click();
    await page.getByRole('button', { name: 'Apply' }).click();

    // Read the save request and block it, so nothing is stored.
    let saved = null;
    await page.route(`**/admin/project/${PROJECT}/edit`, async route => {
      if (route.request().method() === 'POST') {
        saved = route.request().postData();
        await route.abort();
      } else {
        await route.continue();
      }
    });
    await page.getByText('Save', { exact: true }).click();
    await expect.poll(() => saved).not.toBeNull();
    expect(saved).toContain('"minDateFilter":"2010-01-01T10:30:00"');
    expect(saved).toContain('"maxDateFilter":"2010-12-31T11:00:00"');
  });
});
