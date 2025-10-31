import { expect, test } from '@playwright/test';
import xlsx from "xlsx";
import fs from "fs";
import { BASE_URL } from "../../variables";
import { deleteProject, fillProjectName } from "../../utils/project";

// URL That we need to check
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('View kenya latest project', () => {
  test('Check data', async ({ page }) => {
    /**
     * This test is to check the data of the latest view of Kenya
     * The data is using KEN_V1
     * But the Kenya latest is using KEN_V2
     *
     * So when using ucode, no data loaded
     * But when using concept_uuid, data loaded
     */
    const name = "Kenya Test"
    const editUrl = `${BASE_URL}/admin/project/kenya-test/edit`
    await page.goto('/admin/project/');

    // Create project
    await page.getByRole('button', { name: 'Create New Project' }).click();
    await page.getByRole('textbox', { name: 'Select View' }).click();
    await page.getByRole('cell', { name: 'Kenya (Latest)' }).click();

    await fillProjectName(page,name)

    // Options
    await page.locator('.ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'Test' }).click();

    // Create indicator
    await page.getByText('Indicators').nth(1).click();
    await page.getByRole('button', { name: 'Add Indicator' }).click();
    await page.getByRole('cell', { name: 'Kenya Indicator A' }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();

    // Create indicator layers
    await page.getByText('Indicator Layers', { exact: true }).click();
    await page.getByRole('button', { name: 'Add Indicator Layer' }).click();
    await page.getByText('Single Indicator LayerSelect').click();
    await page.getByRole('cell', { name: 'Kenya Indicator A' }).click();
    await page.getByRole('button', { name: 'Apply Selections : Selected (' }).click();

    // Create widget
    await page.getByText('Widgets').click();
    await page.getByRole('button', { name: 'Add Widget' }).click();
    await page.getByRole('textbox', { name: 'Widget name' }).click();
    await page.getByRole('textbox', { name: 'Widget name' }).fill('Sum');
    await page.getByText('Sync with the current map').first().click();
    await page.getByRole('button', { name: 'Apply' }).click();

    // Save
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.waitForURL(editUrl)

    // Review map
    await page.goto('/project/kenya-test/');
    await expect(page.locator('.IndicatorLegendRow')).toHaveCount(1)
    await expect(page.locator('.widget__content')).toHaveText('');

    // Now change to concept uuid
    await page.goto(editUrl);
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeVisible();
    await page.getByRole('combobox', { name: 'Select 1 option' }).click();
    await page.getByRole('option', { name: 'Concept uuid' }).click();

    // Save
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.waitForURL(editUrl)

    // Review map
    await page.goto('/project/kenya-test/');
    await expect(page.locator('.IndicatorLegendRow')).toHaveCount(2)
    await expect(page.locator('.IndicatorLegendRow').nth(0)).toHaveText("1")
    await expect(page.locator('.widget__content')).toHaveText('1');

    // --------------------------------
    // Download current dates
    await page.getByTitle('Download Data').click();
    const output = [
      {
        GeographyCode: 'KEN_V2',
        GeographyName: 'Kenya',
        GeographyLevel: 'Level 0',
        IndicatorCode: 'KENYA_A',
        IndicatorName: 'Kenya Indicator A',
        Value: '1',
        Date: '2025-01-01'
      }
    ]
    {
      let downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download' }).click();
      let download = await downloadPromise;
      let filePath = await download.path();
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      await expect(jsonData[0]).toStrictEqual(output[0]);

      // GEOJSON
      await page.getByRole('combobox', { name: 'Select 1 option' }).nth(1).click();
      await page.getByRole('option', { name: 'Geojson' }).click();

      downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download' }).click();
      download = await downloadPromise;
      filePath = await download.path();
      const geojsonText = fs.readFileSync(filePath, 'utf8');

      // Parse it into a JS object
      const geojson = JSON.parse(geojsonText);
      const compare = async function (first, second) {
        for (const field of Object.keys(second)) {
          await expect(first[field]).toEqual(second[field]);
        }
      }
      await compare(geojson.features[0].properties, output[0])
    }

    // --------------------------------
    // Download all history
    {
      await page.getByRole('combobox', { name: 'Select 1 option' }).nth(2).click();
      await page.getByRole('option', { name: 'All history' }).click();

      // GEOJSON
      await page.getByRole('combobox', { name: 'Select 1 option' }).nth(1).click();
      await page.getByRole('option', { name: 'Geojson' }).click();

      let downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download' }).click();
      let download = await downloadPromise;
      let filePath = await download.path();
      const geojsonText = fs.readFileSync(filePath, 'utf8');

      // Parse it into a JS object
      const geojson = JSON.parse(geojsonText);
      const compare = async function (first, second) {
        for (const field of Object.keys(second)) {
          await expect(first[field]).toEqual(second[field]);
        }
      }
      await compare(geojson.features[0].properties, output[0])
    }

    // ------------------------------------
    // DELETE PROJECT
    // ------------------------------------
    await deleteProject(page, "Kenya Test")
  })
})