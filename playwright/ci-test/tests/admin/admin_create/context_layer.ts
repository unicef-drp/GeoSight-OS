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
    await page.locator('#Form #id_description').fill(name.replace(" ", "_"));
    await page.locator("#Form #id_source").fill('Source');
    await page.locator("#Form #id_group").click();
    await page.keyboard.type("Test");
    await page.keyboard.press('Enter');

    await page.locator('#Form [data-wrapper-name="layer_type"] .ReactSelect').click();
    await page.getByRole('option', { name: 'Related Table' }).click();

    // Error for related table
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('[data-wrapper-name="related_table"]')).toContainText('This field is required.');

    // Correct
    await page.getByRole('textbox', { name: 'Select Related Table' }).click();
    await page.getByRole('cell', { name: 'RRR' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('[data-wrapper-name="related_table"]')).not.toContainText('This field is required.');

    // Wait 2 second
    await delay(2000);

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
    await page.locator("#Form #id_description").fill('Context layer test description');
    await page.locator("#Form #id_source").fill('Source');
    await page.locator("#Form #id_group").click();
    await page.keyboard.type("Test");
    await page.keyboard.press('Enter');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('#Form [data-wrapper-name="layer_type"] .ReactSelect').click();
    await page.getByRole('option', { name: 'Cloud Native GIS Layer' }).click();

    // Error save without delete the data
    await page.getByText('Save').isEnabled();
    await page.getByText('Save').click();
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
    await page.getByText('Fields').click();
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
    await expect(page.locator('#Form #id_description')).toHaveValue('Context layer test description');
    await expect(page.locator('#Form #id_source')).toHaveValue('Source');
    await expect(page.locator("#Form [name='group']")).toHaveValue("Test");

    // Change the cloud native
    await page.getByText('General').click();

    // File chooser
    {
      await page.locator('input[type="file"]').setInputFiles(
        path.join(__dirname, 'sample_data', 'countries.zip')
      );
      await expect(page.locator('.UploadFile').first()).toContainText("Progress : 100", { timeout: 10000 });
    }

    // Check field
    await page.getByText('Fields').click();
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