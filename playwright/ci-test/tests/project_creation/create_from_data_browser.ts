import { expect, test } from '@playwright/test';

// URL That we need to check
const timeout = 2000;

test.describe('Create project from dataset', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('');
  });

  // A use case tests scenarios
  test('Create project from dataset', async ({ page }) => {
    // --------------------------------------------------------------
    // CREATE PROJECT FROM DATASET
    // --------------------------------------------------------------
    await page.getByRole('button', { name: 'Admin panel' }).click();
    await page.getByRole('link', { name: 'Data Browser' }).click();
    await page.getByRole('textbox').first().click();
    await page.getByRole('cell', {
      name: 'Sample Indicator A',
      exact: true
    }).click();
    await page.getByRole('cell', {
      name: 'Sample Indicator B',
      exact: true
    }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('cell', { name: 'Somalia', exact: true }).click();
    await page.getByRole('button', { name: 'Update Selection' }).click();
    await page.locator('.AdminTable .MuiDataGrid-columnHeaderCheckbox').first().click();
    await page.getByRole('button', { name: 'Add to New Project' }).click();
    await expect(page.getByText('Save')).toBeVisible();

    await page.locator("#GeneralName").fill('Test From Dataset');
    await page.locator("#GeneralCategory").click();
    await page.keyboard.type('Complex');
    await page.keyboard.press('Enter');
    await page.getByPlaceholder('Select default admin level').click();
    await page.getByRole('option', { name: 'Admin Level 1' }).click();

    // Check extent
    await expect(page.locator('.ExtentManualInput input').nth(0)).toHaveValue('40.9943');
    await expect(page.locator('.ExtentManualInput input').nth(1)).toHaveValue('11.9884');
    await expect(page.locator('.ExtentManualInput input').nth(2)).toHaveValue('51.4151');
    await expect(page.locator('.ExtentManualInput input').nth(3)).toHaveValue('-1.6568');

    // Add pins layer
    await page.locator('.TabPrimary').getByText('Indicator Layers').click();
    await page.getByRole('button', { name: 'Add Indicator Layer' }).click();
    await page.getByText('Multi Indicators LayerSelect').click();
    await page.locator('.IndicatorLayerConfig .TabPrimary').getByText('General').click();
    await page.getByRole('textbox').first().fill('Pin Layer');
    await page.locator('.IndicatorLayerConfig .TabPrimary').getByText('Style').click();
    await page.getByRole('listbox').selectOption(['318', '319']);
    await page.getByRole('button').nth(2).click();
    await page.getByRole('combobox', { name: 'Select 1 option' }).click();
    await page.getByRole('option', { name: 'Pin' }).click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    // Add chart layer
    await page.getByRole('button', { name: 'Add Indicator Layer' }).click();
    await page.getByText('Multi Indicators LayerSelect').click();
    await page.locator('.IndicatorLayerConfig .TabPrimary').getByText('General').click();
    await page.getByRole('textbox').first().fill('Chart Layer');
    await page.locator('.IndicatorLayerConfig .TabPrimary').getByText('Style').click();
    await page.getByRole('listbox').selectOption(['318', '319']);
    await page.getByRole('button').nth(2).click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    // Widgets
    await page.getByText('Widgets').click();
    await page.getByRole('button', { name: 'Add Widget' }).click();
    await page.getByText('Summary WidgetSummarize all').click();
    await page.getByPlaceholder('Widget name').fill('Widget 1');
    await page.getByText('Indicator', { exact: true }).click();
    await page.getByRole('option', { name: 'Indicator', exact: true }).click();
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Sample Indicator A' }).click();
    await page.getByRole('combobox').nth(3).click();
    await page.getByRole('option', { name: 'value' }).click();
    await expect(page.locator('label').filter({ hasText: 'No filter (global latest' })).toBeDisabled();
    await page.getByRole('button', { name: 'Apply' }).click();

    // Save
    await page.getByText('Save').isEnabled();
    await page.getByText('Save').click();

    const editUrl = 'http://localhost:2000/admin/project/test-from-dataset/edit'
    await page.waitForURL(editUrl)

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

    // Because turn on Last Know Value, the button is hidden
    await expect(page.getByTitle('Show global time configuration')).toBeHidden();

    // Chart
    const layer3 = 'Chart Layer'
    await page.getByLabel(layer3).click();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer3);
    await expect(page.getByLabel(layer3)).toBeChecked();
    await expect(page.locator('[id="01da401b-09fc-4910-baa1-d42bdba5235a-chart"]')).toHaveCSS("height", "20px");
    await expect(page.locator('[id="01da401b-09fc-4910-baa1-d42bdba5235a-chart"]')).toHaveCSS("width", "20px");

    // Pin layer
    const layer4 = 'Pin Layer'
    await page.getByLabel(layer4).click();
    await expect(page.locator('.MapLegendSectionTitle').nth(0)).toContainText('Sample Indicator A');
    await expect(page.locator('.MapLegendSectionTitle').nth(1)).toContainText('Sample Indicator B');
    await expect(page.getByLabel(layer4)).toBeChecked();

    const pin1 = await page.locator('[id="01da401b-09fc-4910-baa1-d42bdba5235a-pin"] .pin').nth(0)
    await expect(page.locator('[id="01da401b-09fc-4910-baa1-d42bdba5235a-pin"]')).toHaveCSS('display', 'flex');
    await expect(pin1).toHaveAttribute('title', 'Test/Sample Indicator A (SOM_TEST_IND_A) - 96');
    await expect(pin1).toHaveCSS('background-color', 'rgb(215, 25, 28)');
    await expect(pin1).toHaveCSS('height', '10px');
    await expect(pin1).toHaveCSS('width', '10px');
    await expect(pin1).toHaveCSS('border-radius', '50%');
    const pin2 = await page.locator('[id="01da401b-09fc-4910-baa1-d42bdba5235a-pin"] .pin').nth(1)
    await expect(pin2).toHaveAttribute('title', 'Test/Sample Indicator B (SOM_TEST_IND_B) - 54');
    await expect(pin2).toHaveCSS('background-color', 'rgb(255, 255, 191)');
    await expect(pin2).toHaveCSS('height', '10px');
    await expect(pin2).toHaveCSS('width', '10px');
    await expect(pin2).toHaveCSS('border-radius', '50%');
    const pin3 = await page.locator('[id="01da401b-09fc-4910-baa1-d42bdba5235a-pin"] .pin').nth(2)

    // --------------------------------------------------------------
    // CHECK PROJECT WITH OVERRIDE CONFIG EDIT MODE
    // --------------------------------------------------------------
    await page.getByRole('button', { name: 'Back to form' }).click();
    await expect(page.locator('.MoreActionIcon')).toBeVisible();
    await expect(page.locator('.General .ReferenceDatasetSection input')).toHaveValue('Somalia');
    await expect(page.locator('.General .CodeMappingConfig input')).toHaveValue('Latest ucode');
    await expect(page.getByPlaceholder('Select default admin level')).toHaveValue('Admin Level 1');

    const availableLayers = [];
    const selector = '.General .ReferenceLayerAvailableLevelsConfiguration .MuiChip-label'
    const num = await page.locator(selector).count();
    for (let i = 0; i < num; i++) {
      availableLayers.push(await page.locator(selector).nth(i).innerText());
    }
    await expect(availableLayers).toEqual(['Admin Level 0', 'Admin Level 1', 'Admin Level 2']);
    await expect(page.locator('.General #GeneralName')).toHaveValue('Test From Dataset');
    expect(await page.locator('.General #GeneralCategory .ReactSelect__single-value').innerText()).toEqual('Complex');
    await expect(page.locator('.ExtentManualInput input').nth(0)).toHaveValue('40.9943');
    await expect(page.locator('.ExtentManualInput input').nth(1)).toHaveValue('11.9884');
    await expect(page.locator('.ExtentManualInput input').nth(2)).toHaveValue('51.4151');
    await expect(page.locator('.ExtentManualInput input').nth(3)).toHaveValue('-1.6568');

    // Check indicators
    await page.locator('.TabPrimary').getByText('Indicators (2)').click();
    expect(await page.getByRole('cell', { name: 'Sample Indicator A' })).toBeVisible();
    expect(await page.getByRole('cell', { name: 'Sample Indicator B' })).toBeVisible();

    // Check indicator layers
    await page.locator('.TabPrimary').getByText('Indicator Layers (4)').click();
    await expect(page.getByText('Sample Indicator A').nth(1)).toBeVisible();
    await expect(page.getByText('Sample Indicator B').nth(1)).toBeVisible();
    await expect(page.getByText('Chart Layer').nth(1)).toBeVisible();

    // ------------------------------------
    // DELETE PROJECT
    // ------------------------------------
    await page.locator('.MoreActionIcon').click();
    await page.locator('.MuiMenu-root .MuiButtonBase-root .error').click();
    await expect(page.locator('.modal--content ')).toContainText(`Are you sure you want to delete : Test From Dataset?`);
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Create New Project')).toBeVisible();
    await expect(page.getByText('Test From Dataset')).toBeHidden();
  });
});