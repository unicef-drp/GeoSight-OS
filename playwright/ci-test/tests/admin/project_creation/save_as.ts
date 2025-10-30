import { expect, test } from '@playwright/test';
import { BASE_URL } from "../../variables";
import { fillProjectName } from "../../utils/project";

// URL That we need to check
const timeout = 2000;

test.describe.configure({ mode: 'serial' });
test.describe('Duplicate and save as project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('');
  });

  // A use case tests scenarios
  test('Save as project', async ({ page }) => {
    const name = 'Test Project Save As';
    // --------------------------------------------------------------
    // CREATE PROJECT WITH OVERRIDE CONFIG
    // --------------------------------------------------------------
    await page.waitForSelector('.Home', { timeout: timeout });
    await page.getByText('Admin panel').click();
    await page.getByRole('link', {
      name: 'Demo GeoSight Project',
      exact: true
    }).click();
    await page.getByRole('button', { name: 'Save as' }).click();
    await page.getByRole('textbox', { name: 'Example: Afghanistan Risk' }).fill(name);
    await page.getByRole('button', { name: 'Create' }).click();

    const editUrl = `${BASE_URL}/admin/project/test-project-save-as/edit`
    await page.waitForURL(editUrl)
    await expect(page.getByPlaceholder('Example: Afghanistan Risk')).toHaveValue(name);

    // --------------------------------------------------------------
    // CHECK PREVIEW
    // --------------------------------------------------------------
    await page.getByRole('button', { name: 'Live Preview' }).click();
    const layer1 = 'Sample Indicator A'
    const layer2 = 'Sample Indicator B'
    await expect(page.getByLabel(layer1)).toBeVisible();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
    await expect(page.getByLabel(layer1)).toBeChecked();
    await expect(page.getByLabel(layer2)).not.toBeChecked();

    // ------------------------------------
    // DELETE PROJECT
    // ------------------------------------
    await page.goto(editUrl);
    await page.locator('.MoreActionIcon').click();
    await page.locator('.MuiMenu-root .MuiButtonBase-root .error').click();
    await expect(page.locator('.modal--content ')).toContainText(`Are you sure want to delete Test Project Save As?`);
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForURL(`${BASE_URL}/admin/project/`);
    await expect(page.getByText('Create New Project')).toBeVisible();
    await expect(page.getByText('Test Project Save As')).toBeHidden();
  });
});