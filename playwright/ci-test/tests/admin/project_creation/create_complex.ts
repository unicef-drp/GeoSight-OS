import { expect, test } from '@playwright/test';

// URL That we need to check
const timeout = 2000;

test.describe('Create complex project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('');
  });

  // A use case tests scenarios
  test('Create with complex config', async ({ page }) => {
    // --------------------------------------------------------------
    // CREATE PROJECT WITH OVERRIDE CONFIG
    // --------------------------------------------------------------
    await page.waitForSelector('.Home', { timeout: timeout });
    await page.getByText('Admin panel').click();
    await expect(page.getByText('Create New Project')).toBeVisible();
    await page.getByText('Create New Project').click();

    // Select dataset
    await page.locator(".ReferenceDatasetSection input").click();
    await page.locator(".ModalDataSelector .MuiDataGrid-row").nth(1).click();

    // Check extent
    await expect(page.locator('.ExtentManualInput input').nth(0)).toHaveValue('40.9943');
    await expect(page.locator('.ExtentManualInput input').nth(1)).toHaveValue('11.9884');
    await expect(page.locator('.ExtentManualInput input').nth(2)).toHaveValue('51.4151');
    await expect(page.locator('.ExtentManualInput input').nth(3)).toHaveValue('-1.6568');

    await page.locator("#GeneralName").fill('Test Project Complex Config');
    await page.locator("#GeneralCategory").click();
    await page.keyboard.type('Complex');
    await page.keyboard.press('Enter');
    await page.getByPlaceholder('Select default admin level').click();
    await page.getByRole('option', { name: 'Admin Level 1' }).click();

    // Add indicator
    await page.locator('.TabPrimary').getByText('Indicators').click();
    await page.getByRole('button', { name: 'Add Indicator' }).click();
    await page.getByText('Sample Indicator A').first().click();
    await page.getByText('Sample Indicator B').first().click();
    await page.locator('.ModalDataSelector').getByRole('button', { name: 'Update Selection' }).click()

    // Add Related table
    await page.locator('.TabPrimary').getByText('Related Tables').click();
    await page.getByRole('button', { name: 'Add RelatedTable' }).click();
    await page.getByRole('cell', { name: 'RRR' }).click();
    await page.getByRole('button', { name: 'Apply Selections : Selected (' }).click();
    await page.getByRole('button', { name: 'Open' }).first().click();
    await page.getByRole('option', { name: 'Ucode' }).click();

    // Add indicator Layers
    await page.locator('.TabPrimary').getByText('Indicator Layers').click();
    await page.getByRole('button', { name: 'Add Indicator Layer' }).click();
    await page.getByText('Single Indicator LayerSelect').click();
    await page.getByRole('cell', {
      name: 'Sample Indicator A',
      exact: true
    }).click();
    await page.getByRole('cell', {
      name: 'Sample Indicator B',
      exact: true
    }).click();
    await page.locator('.AdminSelectDataForm .Save-Button button').click();

    // Add RT Layer
    await page.getByRole('button', { name: 'Add Indicator Layer' }).click();
    await page.getByText('Related Table LayerCreate').click();
    await page.locator('.IndicatorLayerConfig .TabPrimary').getByText('General').click();
    await page.getByRole('textbox').first().fill('Related Table Layer');
    await page.locator('label').filter({ hasText: 'Override admin level' }).click();
    await page.getByRole('combobox', { name: 'Select default admin level' }).click();
    await page.getByRole('option', { name: 'Admin Level 2' }).click();
    await page.getByPlaceholder('Select available levels').click();
    await page.getByRole('option', { name: 'Admin Level 2' }).click();

    await page.locator('.IndicatorLayerConfig .TabPrimary').getByText('Sample Data').click();
    await expect(page.locator('.Sample.Data .MuiDataGrid-cell').nth(0)).toHaveText('Baki');
    await expect(page.locator('.Sample.Data .MuiDataGrid-cell').nth(1)).toHaveText('SOM_0001_0001_V1');
    await expect(page.locator('.Sample.Data .MuiDataGrid-cell').nth(2)).toHaveText('4');
    await expect(page.locator('.Sample.Data .MuiDataGrid-cell').nth(3)).toHaveText('2020-01-01T00:00:00+00:00');
    await page.getByRole('cell', { name: 'SOM_0001_0001_V1' }).click();
    await page.locator('.IndicatorLayerConfig .TabPrimary').getByText('Style').click();
    await page.locator('div:nth-child(2) > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'Dynamic quantitative style.' }).click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    // Add pins layer
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

    // Update tools
    await page.locator('.TabPrimary').getByText('Tools').click();
    await page.locator('li').filter({ hasText: '3D view' }).getByRole('img').click();
    await page.locator('li').filter({ hasText: 'Compare layers' }).getByRole('img').click();
    await page.locator('li').filter({ hasText: 'Zonal analysis' }).getByRole('img').click();

    // Filter
    await page.locator('.TabPrimary').getByText('Filters').click();
    await page.locator('.Filters').getByTestId('AddCircleIcon').click();
    await page.getByPlaceholder('Filter name').click();
    await page.getByText('Pick the field').click();
    await page.getByRole('option', { name: 'Sector' }).first().click();
    await page.locator('.FilterEditModalQueryMethod').click();
    await page.getByRole('option', { name: 'in', exact: true }).click();
    await page.getByRole('button', { name: 'Open' }).click();
    await page.getByRole('option', { name: 'Select all' }).click()
    await page.getByPlaceholder('Filter name').fill('Sector all');
    await page.getByPlaceholder('Filter description').fill('Description 1');
    await page.locator('.modal--content').getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Create filter' }).click();

    // Save
    await page.getByText('Save').isEnabled();
    await page.getByText('Save').click();

    const editUrl = 'http://localhost:2000/admin/project/test-project-complex-config/edit'
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

    // Related Table
    const layer5 = 'Related Table Layer'
    await page.getByLabel(layer5).click();
    await expect(page.locator('.MapLegendSectionTitle')).toContainText(layer5);
    await expect(page.getByLabel(layer5)).toBeChecked();
    await expect(page.locator('.MapLegendSection .IndicatorLegendRowName').nth(0)).toContainText("4");
    await expect(page.locator('.MapLegendSection .IndicatorLegendRowName').nth(1)).toContainText("No data");

    // CHECK TOOLS VISIBILITY
    await expect(page.getByTitle('Zonal Analysis')).toBeVisible();
    await expect(page.getByTitle('Start Measurement')).toBeVisible();
    await expect(page.getByTitle('Turn on compare Layers')).toBeHidden();
    await expect(page.getByTitle('3D layer')).toBeHidden();
    await page.getByTitle('Start Measurement').click();
    await expect(page.getByText('Measure distances and areas')).toBeVisible();
    await page.getByTitle('Zonal Analysis').click();
    await expect(page.getByText('Draw on map and finish by')).toBeVisible();
    await page.getByText('Click to select').click();
    await expect(page.getByText('Click a feature on the map')).toBeVisible();

    // Check filter
    await page.getByRole('tab', { name: 'Filters' }).click();
    await page.getByRole('button', { name: 'Sector all Delete Group' }).click();
    await page.getByPlaceholder('All selected').click();
    await page.getByRole('option', { name: 'EDU' }).click();
    await page.getByRole('option', { name: 'HEALTH' }).click();
    await page.getByRole('option', { name: 'WASH' }).click();
    await page.getByRole('option', { name: 'Blank' }).click();

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
    await expect(page.locator('.General #GeneralName')).toHaveValue('Test Project Complex Config');
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
    await page.locator('.TabPrimary').getByText('Indicator Layers (5)').click();
    await expect(page.locator('.IndicatorLayers').getByText('Sample Indicator A').first()).toBeVisible();
    await expect(page.locator('.IndicatorLayers').getByText('Sample Indicator B').first()).toBeVisible();
    await expect(page.locator('.IndicatorLayers').getByText('Related Table Layer').first()).toBeVisible();
    await expect(page.locator('.IndicatorLayers').getByText('Pin Layer').first()).toBeVisible();
    await expect(page.locator('.IndicatorLayers').getByText('Chart Layer').first()).toBeVisible();

    // Check related table
    await page.locator('.TabPrimary').getByText('Related Tables (1)').click();
    await expect(page.locator('.RelatedTableConfiguration input').nth(0)).toHaveValue('Ucode');
    await expect(page.locator('.RelatedTableConfiguration input').nth(1)).toHaveValue('ucode');

    // ------------------------------------
    // DELETE PROJECT
    // ------------------------------------
    await page.locator('.MoreActionIcon').click();
    await page.locator('.MuiMenu-root .MuiButtonBase-root .error').click();
    await expect(page.locator('.modal--content ')).toContainText(`Are you sure you want to delete : Test Project Complex Config?`);
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForURL('/admin/project/');
    await expect(page.getByText('Create New Project')).toBeVisible();
    await expect(page.getByText('Test Project Complex Config')).toBeHidden();
  });
});