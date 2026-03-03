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
        x: 686,
        y: 235
      }
    });
    await page.getByRole('region', { name: 'Map' }).click({
      position: {
        x: 516,
        y: 333
      }
    });
    await page.getByRole('region', { name: 'Map' }).click({
      position: {
        x: 530,
        y: 187
      }
    });
    await page.getByRole('region', { name: 'Map' }).click({
      position: {
        x: 530,
        y: 187
      }
    });
    await expect(page.locator('.MeasurementComponentText')).toHaveText(
      "138,008,199,483.25 Sq Meters1,733,999.22 Meters (1,077.46 Miles) Perimeter Delete selected"
    );
  })
});