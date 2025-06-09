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

    // Preview should be hidden
    await expect(page.getByText('Preview', { exact: true })).toBeHidden();

    // Select dataset
    await page.locator(".ReferenceDatasetSection input").click();
    await page.locator(".ModalDataSelector .MuiDataGrid-row").nth(1).click();

    // Check extent
    await expect(page.locator('.ExtentManualInput input').nth(0)).toHaveValue('40.9943');
    await expect(page.locator('.ExtentManualInput input').nth(1)).toHaveValue('11.9884');
    await expect(page.locator('.ExtentManualInput input').nth(2)).toHaveValue('51.4151');
    await expect(page.locator('.ExtentManualInput input').nth(3)).toHaveValue('-1.6568');

    await page.locator("#GeneralName").fill('Test Project Default');
    await page.locator("#GeneralCategory").click();
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
    await page.getByText('Sample Indicator C').first().click();
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
    await page.getByRole('cell', {
      name: 'Sample Indicator C',
      exact: true
    }).first().click();
    await page.locator('.AdminSelectDataForm .Save-Button button').click();

    // We check the count
    expect(await page.locator('.TabPrimary').getByText('Indicator Layers (3)')).toBeVisible();

    // We delete the indicator
    await page.locator('.TabPrimary').getByText('Indicators').click();
    await page.getByRole('row', { name: 'Select row Sample Indicator C' }).getByLabel('Select row').check();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Indicator Layers (2)')).toBeVisible();
    await page.locator('.TabPrimary').getByText('Indicator Layers').click();


    // --------------------------------
    // Add filters
    // --------------------------------
    await new Promise(r => setTimeout(r, 2000));
    await page.locator('.TabPrimary').getByText('Filters').click();

    // Filter 1
    await page.locator('.Filters').getByTestId('AddCircleIcon').click();
    await page.getByPlaceholder('Filter name').click();
    await page.getByText('Pick the field').click();
    await page.getByRole('option', { name: 'value' }).first().click();
    await page.locator('.FilterEditModalQueryMethod').click();
    await page.getByText('more than').click();
    await page.getByRole('spinbutton').first().fill('70');
    await page.getByPlaceholder('Filter name').fill('Indicator A more than 10');
    await page.getByPlaceholder('Filter description').fill('Description 1');
    await page.locator('.modal--content').getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Create filter' }).click();

    // Filter 1
    await page.locator('.Filters').getByTestId('AddCircleIcon').click();
    await page.getByText('Pick the field').click();
    await page.getByRole('option', { name: 'ucode' }).nth(1).click();
    await page.locator('.FilterEditModalQueryMethod').click();
    await page.getByRole('option', { name: 'like', exact: true }).click();
    await page.getByPlaceholder('Put the value').fill('SOM_0002');
    await page.getByPlaceholder('Filter name').fill('Show SOM_0002');
    await page.getByPlaceholder('Filter description').fill('Description 2');
    await page.locator('.modal--content').getByRole('checkbox').check();
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

    // --------------------------------------------
    // TEST FILTERS
    // --------------------------------------------
    expect(await page.getByRole('tab', { name: 'Filters' })).toBeVisible();
    await page.getByRole('tab', { name: 'Filters' }).click();
    // Open
    await page.getByRole('button', { name: 'Indicator A more than' }).getByRole('checkbox').check();
    await page.waitForTimeout(1000);
    await expect(lastLog).toEqual(["02ef3c1a-a9a1-43c6-8b35-1f67954b7106", "20f81ec5-8f1b-4056-b885-6560011cb8a8", "2698e715-18bb-47f4-b81c-cdadbdf3f142", "2773ed37-6fff-4e4f-b104-73883ab81fcf", "405e9a6b-97b4-4fd0-a273-089b2fe478ea", "58f04e3a-28c4-4754-84c0-345467550961", "5b747066-341a-43ec-9993-9d03bf1cfd2c", "6bddaec7-83a1-4da5-9d37-8a32bc925e64", "6f02fd37-83d5-4638-b078-6d0282114560", "8146eb81-6722-4918-8d9d-61395da58469", "82241b2d-5339-43cd-980e-d49205536c4c", "8323739b-392c-4268-8fd5-46d1fbf18e5d", "9e6b0956-fd2d-403b-8752-b13993cb1cdb", "b57fdfe7-240a-48da-b050-26244e0fd5d4", "cc0748d8-e0a0-4cbe-a230-77dfdbcda220", "d928d4bc-d444-46a4-85ac-a64898841554", "f187b219-d4df-4831-84a3-886fde91b1e3", "f9cc24d3-40da-429b-a568-f02016d75131"]);
    await page.getByRole('button', { name: 'Show SOM_0002' }).getByRole('checkbox').check();
    await page.waitForTimeout(1000);
    await expect(lastLog).toEqual(["8146eb81-6722-4918-8d9d-61395da58469"]);
    await page.getByRole('button', { name: 'Indicator A more than' }).getByRole('checkbox').uncheck();
    await page.waitForTimeout(1000);
    await expect(lastLog).toEqual(["1ddb6ad8-5651-4a20-bf70-f256335ee80a", "2943bd42-b7c8-45b7-9967-250ba0a72eec", "6ee97f02-b800-49fe-b73a-f55c1b57ed27", "8146eb81-6722-4918-8d9d-61395da58469", "8b1f017c-76cb-4d43-bbc1-5817a7c8b7fb", "a2006979-4f25-448c-891b-3935c4bcf6f0", "fab5edae-3df3-4f74-97bc-1d0afb5fc885"]);

    // By changing data Indicator A more than 10
    await page.getByRole('button', { name: 'Indicator A more than 10' }).click();
    await page.getByRole('button', { name: 'Show SOM_0002' }).click();
    await page.getByRole('button', { name: 'Indicator A more than 10' }).getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Show SOM_0002' }).getByRole('checkbox').uncheck();
    await page.locator('.FilterInputWrapper').first().getByRole('spinbutton').first().fill('30');
    await page.waitForTimeout(1000);
    await expect(lastLog).toEqual(["01fbc793-6079-4340-81e3-9ed9b699caa2", "01fd5c8f-c457-4b58-b760-cdfab5377515", "021f18bd-3ada-4225-b86a-a8230e7eb26a", "0296f796-2e6c-420c-a497-f74266c121d7", "02ef3c1a-a9a1-43c6-8b35-1f67954b7106", "073bf6b0-6836-4eac-b64c-3fbcdea250e7", "1ddb6ad8-5651-4a20-bf70-f256335ee80a", "20f81ec5-8f1b-4056-b885-6560011cb8a8", "2698e715-18bb-47f4-b81c-cdadbdf3f142", "2773ed37-6fff-4e4f-b104-73883ab81fcf", "354a10c0-7be6-40ee-9377-2ec7708a04d2", "3d8230d5-45b7-433d-a3cf-fc9d6f1868a0", "405e9a6b-97b4-4fd0-a273-089b2fe478ea", "424f4c39-bd47-4bf6-ba61-a9edc5316506", "48f88505-edb2-4cf6-86f2-8acce809af31", "4a84545d-1106-4689-849a-658650ce0bc2", "58f04e3a-28c4-4754-84c0-345467550961", "598882e1-a549-4f44-aaa8-e423e089008a", "5b747066-341a-43ec-9993-9d03bf1cfd2c", "66c9b5ee-3315-45e6-8361-f1b93455e86d", "67180f2b-c20c-40fb-9a85-13552030d79c", "6bddaec7-83a1-4da5-9d37-8a32bc925e64", "6f02fd37-83d5-4638-b078-6d0282114560", "71b3b2da-4857-4c90-9683-e5056d80fb02", "75c01c2c-fdc4-4bdf-88e2-f79b935ebcd6", "7bc8f9c0-7bf6-4873-b6ea-39beccb3e20c", "8146eb81-6722-4918-8d9d-61395da58469", "82241b2d-5339-43cd-980e-d49205536c4c", "8323739b-392c-4268-8fd5-46d1fbf18e5d", "8801e277-d8bd-41c1-8260-f96a5210be74", "90b303dc-c37b-440d-b05f-cb99ce52c73e", "921c006e-4b3e-4483-af5c-7d5eb92c0c45", "9862d9bb-d5a9-4eb6-b91e-98acc5a95484", "9e6b0956-fd2d-403b-8752-b13993cb1cdb", "a0fe3caa-57b4-4a0a-9f6d-abadc50770e3", "b0a64777-4a60-43c6-bd8d-2a486b5d46c4", "b1660c4a-aa48-4fcb-9b3e-b6c507b3a450", "b1b237cc-208e-4c1e-83ea-2f66de4f4656", "b1d27efa-bfc2-4a93-99da-cac93faba80b", "b57fdfe7-240a-48da-b050-26244e0fd5d4", "cc0748d8-e0a0-4cbe-a230-77dfdbcda220", "ce1d3979-c51f-41cf-aed7-deb2ac59fc32", "d1b527f5-b7d8-477e-b4e7-725527bdcbc0", "d354ddb3-c351-45fa-a244-87ef339a282b", "d928d4bc-d444-46a4-85ac-a64898841554", "de18312f-e653-4377-a3fe-a22466cc684e", "ee210c3e-6eec-4e90-a760-d78ef5aa73a2", "ef59c37d-29a6-4972-bc97-e53024df23f1", "f187b219-d4df-4831-84a3-886fde91b1e3", "f37df583-fb31-459f-8f2a-b14d4529f2e8", "f9cc24d3-40da-429b-a568-f02016d75131", "fab5edae-3df3-4f74-97bc-1d0afb5fc885", "fd693d32-653a-4f6f-9908-a1b7d81ffaf0"])

    // Change first filter Show SOM_0002
    await page.getByRole('button', { name: 'Indicator A more than' }).getByRole('checkbox').uncheck();
    await page.getByRole('button', { name: 'Show SOM_0002' }).getByRole('checkbox').check();
    await page.locator('.FilterInputWrapper').nth(1).locator('input').first().fill('SOM_0001');
    await page.waitForTimeout(1000);
    await expect(lastLog).toEqual(["6bddaec7-83a1-4da5-9d37-8a32bc925e64", "7977bca3-3645-4072-bfe9-ad342c2674e8", "998e50ae-d1c4-48fa-8357-4dcbe3574517", "9e6b0956-fd2d-403b-8752-b13993cb1cdb", "a2006979-4f25-448c-891b-3935c4bcf6f0", "b1d27efa-bfc2-4a93-99da-cac93faba80b"])
    await page.locator('.FilterInputWrapper').nth(1).locator('input').first().fill('SOM_002');
    await page.waitForTimeout(1000);
    await expect(lastLog).toEqual([])

    // Check values
    await page.getByTitle('Edit project').getByRole('link').click();
    await page.waitForURL('http://localhost:2000/admin/project/test-project-default/edit')
    await expect(page.locator('.MoreActionIcon')).toBeVisible();
    await expect(page.locator('.General .ReferenceDatasetSection input')).toHaveValue('Somalia');
    await expect(page.locator('.General .CodeMappingConfig input')).toHaveValue('Latest ucode');
    await expect(page.getByPlaceholder('Select default admin level')).toHaveValue('Admin Level 2');

    const availableLayers = [];
    const selector = '.General .ReferenceLayerAvailableLevelsConfiguration .MuiChip-label'
    const num = await page.locator(selector).count();
    for (let i = 0; i < num; i++) {
      availableLayers.push(await page.locator(selector).nth(i).innerText());
    }
    await expect(availableLayers).toEqual(['Admin Level 0', 'Admin Level 1', 'Admin Level 2']);
    await expect(page.locator('.General #GeneralName')).toHaveValue('Test Project Default');
    expect(await page.locator('.General #GeneralCategory .ReactSelect__single-value').innerText()).toEqual('Test');
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
    await page.waitForURL('/admin/project/');
    await expect(page.getByText('Create New Project')).toBeVisible();
    await expect(page.getByText('Test Project Default')).toBeHidden();
  });
});