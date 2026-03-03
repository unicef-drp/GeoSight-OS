import { expect, test } from '@playwright/test';
import { delay } from "../../utils";

test.describe('Cloud native layer', () => {
  test('Cloud native layer', async ({ page }) => {
    await page.goto(`/en-us/admin/context-layer/2/edit`);
    await page.getByText('Fields').click();
    await page.getByText('Override field config from').click();
    await page.getByRole('row', { name: 'osm_id Osm id Number' }).getByRole('checkbox').uncheck();
    await page.getByRole('row', { name: 'osm_type Osm type String' }).getByRole('checkbox').uncheck();
    await page.getByRole('row', { name: 'completene Completene Number' }).getByRole('checkbox').uncheck();
    await page.locator('form').evaluate(form => {
      form.scrollTo(0, form.scrollHeight);
    });
    await page.locator('tr:nth-child(30) > td:nth-child(5) > .ReactSelect > .ReactSelect__control > .ReactSelect__indicators').click();
    await page.getByRole('option', { name: 'Date' }).click();
    await page.getByRole('row', { name: 'changeset_ Changeset Date' }).getByRole('textbox').fill('Date time');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('tab', { name: 'Context Layers' }).click();
    await page.getByText('Somalia healthsites').click();
    await delay(1000)
    await page.getByRole('region', { name: 'Map' }).click({
      position: {
        x: 748,
        y: 273
      }
    });
    await expect(page.locator('.maplibregl-popup-content-wrapper tr').first().locator('td').nth(0)).toContainText('Amenity');
    await expect(page.locator('.maplibregl-popup-content-wrapper tr').first().locator('td').nth(1)).toContainText('hospital');
    await expect(page.locator('.maplibregl-popup-content-wrapper tr').nth(3).locator('td').nth(0)).toContainText('Date time');
    await expect(page.locator('.maplibregl-popup-content-wrapper tr').nth(3).locator('td').nth(1)).toContainText('1970-01-01T20:27:29.859Z');
  })
});