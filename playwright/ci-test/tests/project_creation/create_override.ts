import { expect, test } from '@playwright/test';

// URL That we need to check
const timeout = 2000;

test.describe('Create project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('');
  });
  test('Create with override config', async ({ page }) => {
    // --------------------------------------------------------------
    // CREATE PROJECT WITH OVERRIDE CONFIG
    // --------------------------------------------------------------
    await page.waitForSelector('.Home', { timeout: timeout });
    await page.getByText('Admin panel').click();
    await expect(page.getByText('Create New Project')).toBeVisible();
    await page.getByText('Create New Project').click();
    await expect(page.getByText('Save')).toBeVisible();


    // Select dataset
    await page.locator(".ReferenceDatasetSection input").click();
    await page.locator(".ModalDataSelector .MuiDataGrid-row").click();

    // Check extent
    await expect(page.locator('.ExtentManualInput input').nth(0)).toHaveValue('40.9943');
    await expect(page.locator('.ExtentManualInput input').nth(1)).toHaveValue('11.9884');
    await expect(page.locator('.ExtentManualInput input').nth(2)).toHaveValue('51.4151');
    await expect(page.locator('.ExtentManualInput input').nth(3)).toHaveValue('-1.6568');

    await page.locator("#GeneralName").fill('Test Project Override Config');
    await page.locator("#GeneralCategory").click();
    await page.keyboard.type('Overriden');
    await page.keyboard.press('Enter');
    await page.getByText('Use last know value for all').click();
    await page.getByText("Fit to current indicator range").click()
    await page.getByText("Show last known value in range").click()
    await page.locator("#default_interval > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container").click()
    await page.getByText("Yearly").click()
    await page.locator('div').filter({ hasText: /^Project overviewBlock type$/ }).getByRole('textbox').getByRole('paragraph').click();
    await page.locator('div').filter({ hasText: /^Project overviewParagraph$/ }).getByRole('textbox').fill('Test overview');

    // Add indicator
    await page.locator('.TabPrimary').getByText('Indicators').click();
    await page.getByRole('button', { name: 'Add Indicator' }).click();
    await page.getByText('Sample Indicator A').first().click();
    await page.getByText('Sample Indicator B').first().click();
    await page.locator('.ModalDataSelector').getByRole('button', { name: 'Update Selection' }).click()

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

    // Save
    await page.getByText('Save').isEnabled();
    await page.getByText('Save').click();

    // Check values
    await page.waitForURL('http://localhost:2000/admin/project/test-project-override-config/edit')
    await expect(page.locator('.MoreActionIcon')).toBeVisible();
    await expect(page.locator('.General .ReferenceDatasetSection input')).toHaveValue('Somalia');
    await expect(page.locator('.General .CodeMappingConfig input')).toHaveValue('Latest ucode');
    await expect(page.getByPlaceholder('Select default admin level')).toHaveValue('Admin Level 0');

    const availableLayers = [];
    const selector = '.General .ReferenceLayerAvailableLevelsConfiguration .MuiChip-label'
    const num = await page.locator(selector).count();
    for (let i = 0; i < num; i++) {
      availableLayers.push(await page.locator(selector).nth(i).innerText());
    }
    await expect(availableLayers).toEqual(['Admin Level 0', 'Admin Level 1', 'Admin Level 2']);
    await expect(page.locator('.General #GeneralName')).toHaveValue('Test Project Override Config');
    expect(await page.locator('.General #GeneralCategory .ReactSelect__single-value').innerText()).toEqual('Overriden');
    await expect(page.locator('.ExtentManualInput input').nth(0)).toHaveValue('40.9943');
    await expect(page.locator('.ExtentManualInput input').nth(1)).toHaveValue('11.9884');
    await expect(page.locator('.ExtentManualInput input').nth(2)).toHaveValue('51.4151');
    await expect(page.locator('.ExtentManualInput input').nth(3)).toHaveValue('-1.6568');
    await expect(page.locator('#default_interval').getByText('Yearly')).toBeVisible();
    expect(await page.locator("#fit_to_current_indicator_range").isChecked()).toBeTruthy()
    expect(await page.locator("#show_last_known_value_in_range").isChecked()).toBeFalsy()
    await expect(page.locator('.Overview').getByRole('paragraph')).toContainText('Test overview');

    // Check indicators
    await page.locator('.TabPrimary').getByText('Indicators').click();
    expect(await page.getByRole('cell', { name: 'Sample Indicator A' })).toBeVisible();
    expect(await page.getByRole('cell', { name: 'Sample Indicator B' })).toBeVisible();

    // Check indicator layers
    await page.locator('.TabPrimary').getByText('Indicator Layers').click();
    expect(await page.getByText('Sample Indicator A').nth(1)).toBeVisible();
    expect(await page.getByText('Sample Indicator B').nth(1)).toBeVisible();

    // Delete
    await page.locator('.MoreActionIcon').click();
    await page.locator('.MuiMenu-root .MuiButtonBase-root .error').click();
    await expect(page.locator('.modal--content ')).toContainText(`Are you sure you want to delete : Test Project Override Config?`);
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Create New Project')).toBeVisible();
    await expect(page.getByText('Test Project Override Config')).toBeHidden();
  });
});