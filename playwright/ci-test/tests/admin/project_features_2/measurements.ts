import { expect, test } from '@playwright/test';
import { delay } from "../../utils";

test.describe('Project measurements', () => {
  test('Test measurements', async ({ page }) => {
    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByTitle('Start Measurement').click();
    await delay(2000)
    await page.getByRole('region', { name: 'Map' }).click({
      position: {
        x: 406,
        y: 235
      }
    });
    await page.getByRole('region', { name: 'Map' }).click({
      position: {
        x: 236,
        y: 333
      }
    });
    await page.getByRole('region', { name: 'Map' }).click({
      position: {
        x: 250,
        y: 187
      }
    });
    await page.getByRole('region', { name: 'Map' }).click({
      position: {
        x: 250,
        y: 187
      }
    });
    await expect(page.locator('.MeasurementComponentText')).toHaveText(
      "138,456,859,559.78 Sq Meters1,736,815.76 Meters (1,079.21 Miles) Perimeter Delete selected"
    );
  })
});