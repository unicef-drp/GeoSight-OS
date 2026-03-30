import { expect, test } from '@playwright/test';
import { BASE_URL } from "../../variables";
import path from "path";

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))


test.describe('Context layer create admin', () => {
  test('Create Related Table context layer', async ({ page }) => {
    const name = "Context Layer Related Table";
    await page.goto('/admin/context-layer/create#General');
    await page.locator('#Form #id_name').fill(name);
    await page.locator('#Form #id_description').fill("Description");
    await page.locator("#Form #id_source").fill('Source');
    await page.locator("#Form #id_group").click();
    await page.keyboard.type("Test");
    await page.keyboard.press('Enter');

    await page.locator('#Form [data-wrapper-name="layer_type"] .ReactSelect').click();
    await page.getByRole('option', { name: 'Related Table' }).click();

    // Error for related table
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('[data-wrapper-name="related_table_selector"]')).toContainText('This field is required.');

    // Correct
    await page.getByRole('textbox', { name: 'Select Related Table' }).click();
    await page.getByRole('cell', { name: 'RRR' }).click();
    await page.getByRole('combobox', { name: 'Select 1 option' }).first().click();
    await page.getByRole('option', { name: 'Latitude' }).click();
    await page.getByRole('combobox', { name: 'Select 1 option' }).nth(1).click();
    await page.getByRole('option', { name: 'Longitude' }).click();

    // Fields
    await page.getByText('Fields').first().click();
    await page.getByText('Override field config from').click();
    await page.getByRole('row', { name: 'Date Date Date' }).getByRole('checkbox').uncheck();
    await page.getByRole('row', { name: 'Latitude Latitude Number' }).getByRole('checkbox').uncheck();
    await page.getByRole('row', { name: 'Longitude Longitude Number' }).getByRole('checkbox').uncheck();
    await page.getByRole('row', { name: 'NoBeneficiaries' }).getByRole('checkbox').uncheck();
    await page.getByRole('row', { name: 'Name Name String' }).getByRole('checkbox').uncheck();
    await page.getByRole('row', { name: 'Ucode Ucode String' }).getByRole('checkbox').uncheck();

    // Labels
    await page.getByText('Label').first().click();
    await page.getByRole('textbox').nth(4).fill('{Partner}');

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('[data-wrapper-name="related_table_selector"]')).not.toContainText('This field is required.');

    // Wait 1 second
    await delay(1000);
    await page.getByText('Preview').first().click();
    await delay(2000);
    await page.getByRole('region', { name: 'Map' }).click({
      position: {
        x: 531,
        y: 347
      }
    });
    await expect(page.locator('.maplibregl-popup-content-wrapper tr')).toHaveCount(5);
    await expect(page.locator('.maplibregl-popup-content-wrapper tr').nth(0).locator('td').nth(0)).toHaveText("Pcode");
    await expect(page.locator('.maplibregl-popup-content-wrapper tr').nth(0).locator('td').nth(1)).toHaveText("SO1904");
    await expect(page.locator('.maplibregl-popup-content-wrapper tr').nth(1).locator('td').nth(0)).toHaveText("Sector");
    await expect(page.locator('.maplibregl-popup-content-wrapper tr').nth(1).locator('td').nth(1)).toHaveText("WASH");
    await expect(page.locator('.maplibregl-popup-content-wrapper tr').nth(2).locator('td').nth(0)).toHaveText("Partner");
    await expect(page.locator('.maplibregl-popup-content-wrapper tr').nth(2).locator('td').nth(1)).toHaveText("Partner B");

    await page.locator('.MoreActionIcon').click();
    await page.locator('.MuiMenu-root .MuiButtonBase-root .error').click();
    await expect(page.locator('.modal--content ')).toContainText(`Are you sure want to delete ${name}?`);
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Create New Context Layer')).toBeVisible();
    await expect(page.getByText(name)).toBeHidden();
  });


  // A use case tests scenarios
  test('Create Cloud Native context layer', async ({ page }) => {
    const name = `Context layer test`
    const _url = `${BASE_URL}/admin/context-layer/create`
    await page.goto(_url);

    // Fill correct values
    await page.locator('#Form #id_name').fill(name);
    await page.locator("#Form #id_description").fill('Description');
    await page.locator("#Form #id_source").fill('Source');
    await page.locator("#Form #id_group").click();
    await page.keyboard.type("Test");
    await page.keyboard.press('Enter');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('#Form [data-wrapper-name="layer_type"] .ReactSelect').click();
    await page.getByRole('option', { name: 'Cloud Native GIS Layer' }).click();

    // Error save without delete the data
    await page.getByText('Save', { exact: true }).isEnabled();
    await page.getByText('Save', { exact: true }).click();
    await expect(page.locator('[data-wrapper-name="cloud_native_gis"]')).toContainText('This field is required.');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // File chooser
    {
      await page.locator('input[type="file"]').setInputFiles(
        path.join(__dirname, 'sample_data', 'capital_cities.zip')
      );
      await expect(page.locator('.UploadFile').first()).toContainText("Progress : 100", { timeout: 10000 });
    }

    // Check field
    await page.locator('.AdminContent > .AdminForm > .TabPrimary').getByText('Fields').click();
    await page.locator('label').filter({ hasText: 'Override field config from' }).click();
    await expect(page.locator('.DragDropItem ')).toHaveCount(3);
    await expect(page.locator('.DragDropItem').nth(0).locator('td').nth(1)).toHaveText('CITY_TYPE');
    await expect(page.locator('.DragDropItem').nth(1).locator('td').nth(1)).toHaveText('CITY_NAME');
    await expect(page.locator('.DragDropItem').nth(2).locator('td').nth(1)).toHaveText('COUNTRY');
    await page.locator('label').filter({ hasText: 'Override field config from' }).click();

    await page.getByText('Save').isEnabled();
    await page.getByText('Save').click();

    // CHECK VALUES
    await expect(page.locator('#Form #id_name')).toHaveValue(name);
    await expect(page.locator('#Form #id_description')).toHaveValue('Description');
    await expect(page.locator('#Form #id_source')).toHaveValue('Source');
    await expect(page.locator("#Form [name='group']")).toHaveValue("Test");

    // Change the cloud native
    await page.locator('.AdminContent > .AdminForm > .TabPrimary').getByText('General').click();

    // File chooser
    {
      await page.locator('input[type="file"]').setInputFiles(
        path.join(__dirname, 'sample_data', 'countries.zip')
      );
      await expect(page.locator('.UploadFile').first()).toContainText("Progress : 100", { timeout: 10000 });
    }

    // Check field
    await page.locator('.AdminContent > .AdminForm > .TabPrimary').getByText('Fields').click();
    await page.locator('label').filter({ hasText: 'Override field config from' }).click();
    await delay(1000);
    if (!await page.locator('.DragDropItem').first().isVisible()) {
      await page.locator('label').filter({ hasText: 'Override field config from' }).click();
    }
    await expect(page.locator('.DragDropItem')).toHaveCount(1);
    await expect(page.locator('.DragDropItem').nth(0).locator('td').nth(1)).toHaveText('COUNTRY');
    await page.locator('label').filter({ hasText: 'Override field config from' }).click();

    // Wait 2 second
    await delay(2000);


    await page.locator('.MoreActionIcon').click();
    await page.locator('.MuiMenu-root .MuiButtonBase-root .error').click();
    await expect(page.locator('.modal--content ')).toContainText(`Are you sure want to delete ${name}?`);
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Create New Context Layer')).toBeVisible();
    await expect(page.getByText(name)).toBeHidden();
  });
})