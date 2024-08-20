import { expect, test } from '@playwright/test';

// URL That we need to check
const timeout = 2000;

test.describe.configure({ mode: 'serial' });
test.describe('Duplicate and save as project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('');
  });

  // A use case tests scenarios
  test('Duplicate project', async ({ page }) => {
    // --------------------------------------------------------------
    // CREATE PROJECT WITH OVERRIDE CONFIG
    // --------------------------------------------------------------
    await page.waitForSelector('.Home', { timeout: timeout });
    await page.getByText('Admin panel').click();
    await page.getByRole('link', { name: 'Projects' }).click();
    await page.locator('.MuiButtonBase-root[data-id="demo-geosight-project"]').click();
    await page.getByRole('menuitem', { name: 'Duplicate' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.getByRole('link', { name: 'Demo GeoSight Project 1' }).click();

    const editUrl = 'http://localhost:2000/admin/project/demo-geosight-project-1/edit'
    await page.waitForURL(editUrl)
    await expect(page.getByPlaceholder('Example: Afghanistan Risk')).toHaveValue('Demo GeoSight Project 1');

    // --------------------------------------------------------------
    // CHECK PREVIEW
    // --------------------------------------------------------------
    await page.getByRole('button', { name: 'Preview' }).click();
    const layer1 = 'Sample Indicator A'
    const layer2 = 'Sample Indicator B'
    await expect(page.getByLabel(layer1)).toBeVisible();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
    await expect(page.getByLabel(layer1)).toBeChecked();
    await expect(page.getByLabel(layer2)).not.toBeChecked();

    // Check on home
    await page.goto('');
    await expect(page.getByRole('link', { name: 'Demo GeoSight Project 1' })).toBeVisible();

    // TODO:
    //  Not sure why more icon always not found
    // // ------------------------------------
    // // DELETE PROJECT
    // // ------------------------------------
    // await page.goto(editUrl);
    // page.on('dialog', async dialog => {
    //   //Click on OK Button
    //   await dialog.accept();
    // });
    //
    // await page.locator('.MoreActionIcon').click();
    // await page.locator('.MuiMenu-root .MuiButtonBase-root .error').click();
    // await expect(page.getByText('Create New Project')).toBeVisible();
    // await expect(page.getByText('Demo GeoSight Project 1')).toBeHidden()
  });

  // A use case tests scenarios
  test('Save as project', async ({ page }) => {
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
    await page.getByRole('textbox', { name: 'Example: Afghanistan Risk' }).fill('Test Project Save As');
    await page.getByRole('button', { name: 'Create' }).click();

    const editUrl = 'http://localhost:2000/admin/project/test-project-save-as/edit'
    await page.waitForURL(editUrl)
    await expect(page.getByPlaceholder('Example: Afghanistan Risk')).toHaveValue('Test Project Save As');

    // --------------------------------------------------------------
    // CHECK PREVIEW
    // --------------------------------------------------------------
    await page.getByRole('button', { name: 'Preview' }).click();
    const layer1 = 'Sample Indicator A'
    const layer2 = 'Sample Indicator B'
    await expect(page.getByLabel(layer1)).toBeVisible();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer1);
    await expect(page.getByLabel(layer1)).toBeChecked();
    await expect(page.getByLabel(layer2)).not.toBeChecked();

    // Check on home
    await page.goto('');
    await expect(page.getByRole('link', { name: 'Test Project Save As' })).toBeVisible();

    // TODO:
    //  Not sure why more icon always not found
    // // ------------------------------------
    // // DELETE PROJECT
    // // ------------------------------------
    // await page.goto(editUrl);
    // page.on('dialog', async dialog => {
    //   //Click on OK Button
    //   await dialog.accept();
    // });
    //
    // await page.locator('.MoreActionIcon').click();
    // await page.locator('.MuiMenu-root .MuiButtonBase-root .error').click();
    // await expect(page.getByText('Create New Project')).toBeVisible();
    // await expect(page.getByText('Test Project Save As')).toBeHidden()
  });
});