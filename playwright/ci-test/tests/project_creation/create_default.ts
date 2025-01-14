import { expect, test } from '@playwright/test';

// URL That we need to check
const timeout = 2000;

test.describe('Create project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('');
  });

  // A use case tests scenarios
  test('Create with default config', async ({ page }) => {
    let lastLog = null
    page.on('console', msg => {
      if (msg.text().indexOf('FILTERED_GEOM:') !== -1) {
        try {
          lastLog = JSON.parse(msg.text().replace('FILTERED_GEOM:', ''))
        } catch (e) {
          console.log(e)

        }
      }
    });
    await page.waitForSelector('.Home', { timeout: timeout });
    await page.getByText('Admin panel').click();
    await expect(page.getByText('Create New Project')).toBeVisible();
    await page.getByText('Create New Project').click();
    await page.locator(".ReferenceDatasetSection input").click();
    await page.locator(".ModalDataSelector .MuiDataGrid-row").click();
    await page.locator("#SummaryName").fill('Test Project Default');
    await page.locator("#SummaryCategory").click();
    await page.keyboard.type('Test');
    await page.keyboard.press('Enter');
    await page.getByPlaceholder('Select default admin level').click();
    await page.getByRole('option', { name: 'Admin Level 2' }).click();
    await page.getByText('Use last know value for all').click();

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

    // Add filters
    await new Promise(r => setTimeout(r, 2000));
    await page.locator('.TabPrimary').getByText('Filters').click();
    await page.locator('.Filters').getByTestId('AddCircleIcon').click();
    await page.getByPlaceholder('Filter name').click();
    await page.getByText('Pick the field').click();
    await page.getByRole('option', { name: 'value' }).first().click();
    await page.locator('.FilterEditModalQueryMethod').click();
    await page.getByText('more than').click();
    await page.getByRole('spinbutton').first().fill('70');
    await page.getByPlaceholder('Filter name').fill('Indicator A more than 10');
    await page.getByPlaceholder('Filter description').fill('Description 1');
    await page.getByRole('button', { name: 'Create filter' }).click();
    await page.locator('.Filters').getByTestId('AddCircleIcon').click();
    await page.getByText('Pick the field').click();
    await page.getByRole('option', { name: 'ucode' }).nth(1).click();
    await page.locator('.FilterEditModalQueryMethod').click();
    await page.getByRole('option', { name: 'like', exact: true }).click();
    await page.getByPlaceholder('Put the value').fill('SOM_0002');
    await page.getByPlaceholder('Filter name').fill('Show SOM_0002');
    await page.getByPlaceholder('Filter description').fill('Description 2');
    await page.getByRole('button', { name: 'Create filter' }).click();

    // --------------------------------------------
    // Save
    // --------------------------------------------
    await page.getByText('Save').isEnabled();
    await page.getByText('Save').click();

    // --------------------------------------------
    // Check the preview
    // --------------------------------------------
    const editUrl = 'http://localhost:2000/admin/project/test-project-default/edit'
    await page.waitForURL(editUrl)
    await page.goto('/project/test-project-default');

    // Check filter
    expect(await page.getByRole('tab', { name: 'Filters' })).toBeVisible();
    await page.getByRole('tab', { name: 'Filters' }).click();
    await page.getByRole('button', { name: 'Indicator A more than' }).getByRole('checkbox').check();
    await page.waitForTimeout(1000);
    await expect(lastLog).toEqual(["01da401b-09fc-4910-baa1-d42bdba5235a", "02ef3c1a-a9a1-43c6-8b35-1f67954b7106", "20f81ec5-8f1b-4056-b885-6560011cb8a8", "2698e715-18bb-47f4-b81c-cdadbdf3f142", "2773ed37-6fff-4e4f-b104-73883ab81fcf", "2943bd42-b7c8-45b7-9967-250ba0a72eec", "3d7e756f-8060-463e-ae20-b8b9be32e32f", "405e9a6b-97b4-4fd0-a273-089b2fe478ea", "58f04e3a-28c4-4754-84c0-345467550961", "5b747066-341a-43ec-9993-9d03bf1cfd2c", "6bddaec7-83a1-4da5-9d37-8a32bc925e64", "6f02fd37-83d5-4638-b078-6d0282114560", "8146eb81-6722-4918-8d9d-61395da58469", "82241b2d-5339-43cd-980e-d49205536c4c", "8323739b-392c-4268-8fd5-46d1fbf18e5d", "8bd15515-ea95-40de-bfa8-00813df2ccd3", "9e6b0956-fd2d-403b-8752-b13993cb1cdb", "a2006979-4f25-448c-891b-3935c4bcf6f0", "b57fdfe7-240a-48da-b050-26244e0fd5d4", "cc0748d8-e0a0-4cbe-a230-77dfdbcda220", "d7c57957-70cf-4e95-bc4d-c28e739b300a", "d928d4bc-d444-46a4-85ac-a64898841554", "f187b219-d4df-4831-84a3-886fde91b1e3", "f9cc24d3-40da-429b-a568-f02016d75131"]);
    await page.getByRole('button', { name: 'Show SOM_0002' }).getByRole('checkbox').check();
    await page.waitForTimeout(1000);
    await expect(lastLog).toEqual(["2943bd42-b7c8-45b7-9967-250ba0a72eec", "8146eb81-6722-4918-8d9d-61395da58469", "a2006979-4f25-448c-891b-3935c4bcf6f0"]);
    await page.getByRole('button', { name: 'Indicator A more than' }).getByRole('checkbox').uncheck();
    await page.waitForTimeout(1000);
    await expect(lastLog).toEqual(["1ddb6ad8-5651-4a20-bf70-f256335ee80a", "2943bd42-b7c8-45b7-9967-250ba0a72eec", "6ee97f02-b800-49fe-b73a-f55c1b57ed27", "8146eb81-6722-4918-8d9d-61395da58469", "8b1f017c-76cb-4d43-bbc1-5817a7c8b7fb", "a2006979-4f25-448c-891b-3935c4bcf6f0", "fab5edae-3df3-4f74-97bc-1d0afb5fc885"]);

    // Check values
    await page.getByTitle('Edit project').getByRole('link').click();
    await page.waitForURL('http://localhost:2000/admin/project/test-project-default/edit')
    await expect(page.locator('.MoreActionIcon')).toBeVisible();
    await expect(page.locator('.Summary .ReferenceDatasetSection input')).toHaveValue('Somalia');
    await expect(page.locator('.Summary .CodeMappingConfig input')).toHaveValue('Latest ucode');
    await expect(page.getByPlaceholder('Select default admin level')).toHaveValue('Admin Level 2');

    const availableLayers = [];
    const selector = '.Summary .ReferenceLayerAvailableLevelsConfiguration .MuiChip-label'
    const num = await page.locator(selector).count();
    for (let i = 0; i < num; i++) {
      availableLayers.push(await page.locator(selector).nth(i).innerText());
    }
    await expect(availableLayers).toEqual(['Admin Level 0', 'Admin Level 1', 'Admin Level 2']);
    await expect(page.locator('.Summary #SummaryName')).toHaveValue('Test Project Default');
    expect(await page.locator('.Summary #SummaryCategory .ReactSelect__single-value').innerText()).toEqual('Test');
    await expect(page.locator('.ExtentManualInput input').nth(0)).toHaveValue('40.9943');
    await expect(page.locator('.ExtentManualInput input').nth(1)).toHaveValue('11.9884');
    await expect(page.locator('.ExtentManualInput input').nth(2)).toHaveValue('51.4151');
    await expect(page.locator('.ExtentManualInput input').nth(3)).toHaveValue('-1.6568');
    await expect(page.locator('#default_interval').getByText('Monthly')).toBeVisible();
    expect(await page.locator("#fit_to_current_indicator_range").isChecked()).toBeFalsy()
    expect(await page.locator("#show_last_known_value_in_range").isChecked()).toBeTruthy()

    // Check indicators
    await page.locator('.TabPrimary').getByText('Indicators').click();
    expect(await page.getByRole('cell', { name: 'Sample Indicator A' })).toBeVisible();
    expect(await page.getByRole('cell', { name: 'Sample Indicator B' })).toBeVisible();

    // Check indicator layers
    await page.locator('.TabPrimary').getByText('Indicator Layers').click();
    expect(await page.getByText('Sample Indicator A').nth(1)).toBeVisible();
    expect(await page.getByText('Sample Indicator B').nth(1)).toBeVisible();

    // Check filters
    await page.locator('.TabPrimary').getByText('Filters').click();
    expect(await page.getByRole('button', { name: 'Indicator A more than 10' })).toBeVisible();
    expect(await page.getByRole('button', { name: 'Show SOM_0002' })).toBeVisible();

    // Delete
    await page.locator('.MoreActionIcon').click();
    await page.locator('.MuiMenu-root .MuiButtonBase-root .error').click();
    await expect(page.locator('.modal--content ')).toContainText(`Are you sure you want to delete : Test Project Default?`);
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Create New Project')).toBeVisible();
    await expect(page.getByText('Test Project Default')).toBeHidden();
  });
});