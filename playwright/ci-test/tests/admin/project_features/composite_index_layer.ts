import { expect, test } from '@playwright/test';
import {
  deleteProject,
  saveAsProject,
  viewProject
} from "../../utils/project";

test.describe('Composite index layer', () => {
  test('Config tool', async ({ page }) => {
    let onRun = null
    let onFinish = null
    page.on('console', msg => {
      if (msg.text().indexOf('COMPOSITE_INDEX_LAYER_CONFIG:') !== -1) {
        try {
          const log = msg.text().replace('COMPOSITE_INDEX_LAYER_CONFIG:', '')
          if (log) {
            onRun = log
          }
        } catch (e) {
          console.log(e)

        }
      }
    });

    // --------------------------------------------------------------------
    // Check configuration
    // --------------------------------------------------------------------
    // Create project
    // --------------------------------------------------------------------
    const name = 'Demo GeoSight Project Composite Index Layer'
    await saveAsProject(page, 'Demo GeoSight Project', name)

    await page.getByText('Tools').click();
    await expect(await page.getByRole('listitem').filter({ hasText: 'Composite index layer' })).toBeVisible();
    const disable = await page
      .getByRole('listitem')
      .filter({ hasText: 'Composite index layer' })
      .locator('.VisibilityIconOff')
      .first()
      .isVisible();
    if (disable) {
      await page.getByRole('listitem').filter({ hasText: 'Composite index layer' }).getByRole('img').click(); // Activate it
    }

    await page.getByRole('listitem').filter({ hasText: 'Composite index layer' }).getByTestId('EditIcon').click();
    await page.getByText('Label', { exact: true }).click();
    await page.locator('.Label textarea').first().fill('{name}\n{value}.round(3)');
    await page.getByRole('row', { name: 'Halo Weight' }).getByRole('spinbutton').fill('3');
    await page.getByText('Popup', { exact: true }).click();
    await page.getByRole('row', { name: 'context.current.geometry_data.admin_level Admin level String' }).getByRole('checkbox').check();
    await page.getByRole('row', { name: 'context.current.geometry_data.admin_level_name Admin level name String' }).getByRole('checkbox').check();
    await page.getByRole('row', { name: 'context.current.indicator.name Indicator String' }).getByRole('checkbox').uncheck();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await expect(onRun).toEqual(`{"data_fields":[{"name":"context.current.indicator.name","alias":"Indicator","visible":false,"type":"string","order":0},{"name":"context.current.indicator.value","alias":"Value","visible":true,"type":"string","order":1},{"name":"context.current.indicator.label","alias":"Label","visible":true,"type":"string","order":2},{"name":"context.current.indicator.time","alias":"Date","visible":true,"type":"string","order":3},{"name":"context.current.geometry_data.admin_level","alias":"Admin level","visible":true,"type":"string","order":4},{"name":"context.current.geometry_data.admin_level_name","alias":"Admin level name","visible":true,"type":"string","order":5},{"name":"context.current.geometry_data.concept_uuid","alias":"Concept uuid","visible":false,"type":"string","order":6},{"name":"context.current.geometry_data.geom_code","alias":"Geom code","visible":false,"type":"string","order":7},{"name":"context.current.geometry_data.name","alias":"Name","visible":false,"type":"string","order":8},{"name":"context.current.indicator.attributes","alias":"","visible":false,"type":"string","order":9}],"config":{},"type":"Composite Index Layer","style_type":"Dynamic quantitative style.","style_config":{"dynamic_classification":"Equidistant.","dynamic_class_num":7,"sync_outline":false,"sync_filter":false,"outline_color":"#FFFFFF","outline_size":0.5,"color_palette":3,"no_data_rule":{"id":0,"name":"No data","rule":"No data","color":"#D8D8D8","outline_color":"#ffffff","outline_size":0.5,"active":true}},"style":[{"id":-1,"name":"No data","rule":"No data","color":"#D8D8D8","outline_color":"#ffffff","outline_size":0.5,"active":false},{"id":0,"name":"Other data","rule":"Other data","color":"#A6A6A6","outline_color":"#ffffff","outline_size":0.5,"active":false}],"label_config":{"text":"{name}\\n{value}.round(3)","style":{"minZoom":0,"maxZoom":24,"fontFamily":"\\"Rubik\\", sans-serif","fontSize":13,"fontColor":"#000000","fontWeight":300,"strokeColor":"#FFFFFF","strokeWeight":0,"haloColor":"#FFFFFF","haloWeight":3}}}`)


    await page.getByRole('listitem').filter({ hasText: 'Composite index layer' }).getByTestId('EditIcon').click();
    await page.getByText('Style', { exact: true }).first().click();
    await page.locator('div:nth-child(2) > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'Dynamic qualitative style.' }).click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await expect(onRun).toEqual(`{"data_fields":[{"name":"context.current.indicator.name","alias":"Indicator","visible":false,"type":"string","order":0},{"name":"context.current.indicator.value","alias":"Value","visible":true,"type":"string","order":1},{"name":"context.current.indicator.label","alias":"Label","visible":true,"type":"string","order":2},{"name":"context.current.indicator.time","alias":"Date","visible":true,"type":"string","order":3},{"name":"context.current.geometry_data.admin_level","alias":"Admin level","visible":true,"type":"string","order":4},{"name":"context.current.geometry_data.admin_level_name","alias":"Admin level name","visible":true,"type":"string","order":5},{"name":"context.current.geometry_data.concept_uuid","alias":"Concept uuid","visible":false,"type":"string","order":6},{"name":"context.current.geometry_data.geom_code","alias":"Geom code","visible":false,"type":"string","order":7},{"name":"context.current.geometry_data.name","alias":"Name","visible":false,"type":"string","order":8},{"name":"context.current.indicator.attributes","alias":"","visible":false,"type":"string","order":9}],"config":{},"type":"Composite Index Layer","style_type":"Dynamic qualitative style.","style_config":{"dynamic_classification":"Equidistant.","dynamic_class_num":7,"sync_outline":false,"sync_filter":false,"outline_color":"#FFFFFF","outline_size":0.5,"color_palette":3,"no_data_rule":{"id":0,"name":"No data","rule":"No data","color":"#D8D8D8","outline_color":"#ffffff","outline_size":0.5,"active":true}},"style":[{"id":-1,"name":"No data","rule":"No data","color":"#D8D8D8","outline_color":"#ffffff","outline_size":0.5,"active":false},{"id":0,"name":"Other data","rule":"Other data","color":"#A6A6A6","outline_color":"#ffffff","outline_size":0.5,"active":false}],"label_config":{"text":"{name}\\n{value}.round(3)","style":{"minZoom":0,"maxZoom":24,"fontFamily":"\\"Rubik\\", sans-serif","fontSize":13,"fontColor":"#000000","fontWeight":300,"strokeColor":"#FFFFFF","strokeWeight":0,"haloColor":"#FFFFFF","haloWeight":3}}}`)


    // --------------------------------------------------------------------
    // Save
    // --------------------------------------------------------------------
    await page.getByText('Save', { exact: true }).isEnabled();
    await page.getByText('Save', { exact: true }).click();

    // --------------------------------------------------------------------
    // View the project
    // --------------------------------------------------------------------
    await viewProject(page, name)
    await page.getByRole('button', { name: 'Close' }).click();

    // Test composite and compare toggle each other
    await expect(page.getByTitle('Activate composite index layer')).toBeVisible();
    await expect(page.getByTitle('Turn on compare Layers')).toBeVisible();

    await page.getByTitle('Activate composite index layer').click();
    await expect(page.getByTitle('Deactivate composite index')).toBeVisible();
    await expect(page.getByTitle('Turn on compare Layers')).toBeVisible();

    await page.getByTitle('Turn on compare Layers').click();
    await expect(page.getByTitle('Activate composite index layer')).toBeVisible();
    await expect(page.getByTitle('Turn off compare Layers')).toBeVisible();

    // Activate composite index layer
    await page.getByTitle('Activate composite index layer').click();
    await expect(page.getByTitle('Deactivate composite index')).toBeVisible();
    await expect(page.getByTitle('Turn on compare Layers')).toBeVisible();

    // Check the style
    await expect(page.locator('.MapLegendSectionTitle')).toHaveText('Composite Index Layer');
    await expect(page.locator('.IndicatorLegendSection .IndicatorLegendRow')).toHaveCount(18);
    [10, 9.79, 9.26, 8.11, 7.68, 7.05, 6.53, 6.32, 6.11, 4.11, 3.58, 3.26, 3.05, 1.37, 1.05, 0.95, 0].map(
      (value, index) => expect(page.locator('.IndicatorLegendSection .IndicatorLegendRow').nth(index)).toHaveText(value.toString())
    );
    await page.getByRole('checkbox', { name: 'Sample Indicator A' }).click();
    await page.getByRole('checkbox', { name: 'Sample Indicator B' }).click();
    [10, 6.32, 5.83, 5.49, 4.86, 4.51, 4.17, 3.96, 3.61, 3.33, 3.26, 2.78, 1.94, 1.74, 1.18, 0.49, 0].map(
      (value, index) => expect(page.locator('.IndicatorLegendSection .IndicatorLegendRow').nth(index)).toHaveText(value.toString())
    );
    await page.getByRole('checkbox', { name: 'Sample Indicator A' }).click();
    [16.53, 13.33, 12.62, 11.8, 11.53, 10.66, 10.46, 9.58, 9.26, 7.91, 7.75, 7.29, 6.89, 6.05, 5.33, 4.59, 4.21, 2.78].map(
      (value, index) => expect(page.locator('.IndicatorLegendSection .IndicatorLegendRow').nth(index)).toHaveText(value.toString())
    );
    await page.getByRole('checkbox', { name: 'Sample Indicator A' }).click();
    await page.getByRole('checkbox', { name: 'Sample Indicator B' }).click();
    await page.getByRole('checkbox', {
      name: 'Dynamic Layer',
      exact: true
    }).click();
    [10, 6.2, 6.14, 5.96, 4.94, 4.76, 4.7, 4.4, 3.55, 3.25, 2.89, 2.11, 1.81, 1.63, 0.96, 0.36, 0].map(
      (value, index) => expect(page.locator('.IndicatorLegendSection .IndicatorLegendRow').nth(index)).toHaveText(value.toString())
    );
    await page.getByRole('checkbox', {
      name: 'Dynamic Layer',
      exact: true
    }).click();
    await page.getByRole('checkbox', { name: 'Dynamic Layer based on a list of interventions' }).click();
    ["No data"].map(
      (value, index) => expect(page.locator('.IndicatorLegendSection .IndicatorLegendRow').nth(index)).toHaveText(value.toString())
    );
    await page.hover('.ReferenceLayerLevelSelected')
    await page.locator('.ReferenceLayerLevelOption').getByText('Admin Level 2').click();
    [10, 9.13, 8.99, 8.77, 8.7, 8.65, 7.87, 7.72, 7.51, 7.3, 7.25, 7.13, 7.01, 7, 6.75, 6.25, 6.23, 5.75, 5.69, 5.52, 5.46, 5.4, 5.31, 4.99, 4.94, 4.65, 4.48, 4.47, 4.33, 4.19, 3.95, 3.94, 3.91, 3.86, 3.73, 3.64, 3.36, 3.31, 3.19, 3.1, 2.94, 1.43, 0.91, 0.72, 0.63, 0.49, 0.46, 0.24, 0].map(
      (value, index) => expect(page.locator('.IndicatorLegendSection .IndicatorLegendRow').nth(index)).toHaveText(value.toString())
    );
    await page.hover('.ReferenceLayerLevelSelected')
    await page.locator('.ReferenceLayerLevelOption').getByText('Admin Level 1').click();

    // Check the config
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.getByTitle('Deactivate composite index').click();
    await page.getByTitle('Activate composite index layer').click();
    await page.getByRole('checkbox', { name: 'Sample Indicator B' }).check();
    await page.getByRole('treeitem', { name: 'Composite Index Layer' }).locator('.CogIcon').click();

    const classForm = '.GeneralFormCompositeIndexLayer'
    await page.locator(classForm).locator('input[value="Composite Index Layer"]').fill('This is the test');

    await expect(page.locator(classForm).locator('tbody > tr')).toHaveCount(2);
    await expect(page.locator(classForm).getByRole('cell', { name: 'Sample Indicator A' })).toBeVisible();
    await expect(page.locator(classForm).getByRole('cell', { name: 'Sample Indicator B' })).toBeVisible();
    await expect(page.locator(classForm).locator('tbody tr').nth(0)).toContainText('50%');
    await expect(page.locator(classForm).locator('tbody tr').nth(1)).toContainText('50%');
    await page.locator(classForm).getByRole('row', { name: 'Sample Indicator A' }).getByRole('spinbutton').fill('3');
    await expect(page.locator(classForm).locator('tbody tr').nth(0)).toContainText('75%');
    await expect(page.locator(classForm).locator('tbody tr').nth(1)).toContainText('25%');
    await page.locator(classForm).getByRole('combobox').selectOption({ label: 'Test Indicator D' });
    await expect(page.locator(classForm).locator('tbody tr')).toHaveCount(3);
    await expect(page.locator(classForm).getByRole('cell', { name: 'Test Indicator D' })).toBeVisible();
    await expect(page.locator(classForm).locator('tbody tr').nth(0)).toContainText('60%');
    await expect(page.locator(classForm).locator('tbody tr').nth(1)).toContainText('20%');
    await expect(page.locator(classForm).locator('tbody tr').nth(2)).toContainText('20%');

    await page.locator(classForm).locator('tbody tr').nth(2).locator('.error').click();
    await expect(page.locator(classForm).locator('tbody tr')).toHaveCount(2);
    await expect(page.locator(classForm).getByRole('cell', { name: 'Sample Indicator A' })).toBeVisible();
    await expect(page.locator(classForm).getByRole('cell', { name: 'Sample Indicator B' })).toBeVisible();
    await expect(page.locator(classForm).locator('tbody tr').nth(0)).toContainText('75%');
    await expect(page.locator(classForm).locator('tbody tr').nth(1)).toContainText('25%');
    await page.getByText('Apply Changes').click();

    await expect(page.locator('.MapLegendSectionTitle')).toHaveText('This is the test');
    [33.33, 31.1, 29.58, 28.83, 27.79, 25.83, 24.77, 24.43, 19.5, 16.11, 14.9, 14.26, 14.02, 12.8, 8.99, 8.06, 6.11, 2.78].map(
      (value, index) => expect(page.locator('.IndicatorLegendSection .IndicatorLegendRow').nth(index)).toHaveText(value.toString())
    );
    await page.getByTestId('AddCircleIcon').click();
    await expect(page.getByTitle('Activate composite index layer')).toBeVisible();
    await expect(page.getByText('Dynamic Composite Layers')).toBeVisible();
    await expect(page.locator('.MuiTreeItem-label').getByText('This is the test')).toBeVisible();
    await page.locator('.MuiTreeItem-label').getByText('Sample Indicator A').click();
    await expect(page.locator('.MapLegendSectionTitle')).toHaveText('Sample Indicator A');
    ["80 - 100", "60 - 80", "40 - 60", "20 - 40", "0 - 20"].map(
      (value, index) => expect(page.locator('.IndicatorLegendSection .IndicatorLegendRow').nth(index)).toHaveText(value.toString())
    );
    await page.locator('.MuiTreeItem-label').getByText('This is the test').click();
    await expect(page.locator('.MapLegendSectionTitle')).toHaveText('This is the test');
    [33.33, 31.1, 29.58, 28.83, 27.79, 25.83, 24.77, 24.43, 19.5, 16.11, 14.9, 14.26, 14.02, 12.8, 8.99, 8.06, 6.11, 2.78].map(
      (value, index) => expect(page.locator('.IndicatorLegendSection .IndicatorLegendRow').nth(index)).toHaveText(value.toString())
    );


    // --------------------------------------------------------------------
    // Delete project
    // --------------------------------------------------------------------
    await deleteProject(page, name)
  })
});