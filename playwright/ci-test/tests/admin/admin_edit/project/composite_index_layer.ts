import { expect, test } from '@playwright/test';

// URL That we need to check
const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

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
    // Check filter is hidden or not
    await page.goto('/admin/project/demo-geosight-project/edit');

    await page.getByText('Tools').click();
    await page.getByRole('listitem').filter({ hasText: 'Composite index layer' }).getByTestId('EditIcon').click();
    await page.getByRole('button', { name: 'Add New Rule' }).click();
    await page.locator('input[name="rule_name_0"]').fill('A');
    await page.getByRole('row', { name: 'A Number ▶ value is or <' }).getByRole('spinbutton').first().fill('0');
    await page.getByRole('button', { name: 'Add New Rule' }).click();
    await page.locator('input[name="rule_name_1"]').fill('B');
    await page.getByRole('row', { name: 'B Number ▶ value is or <' }).getByRole('spinbutton').first().fill('2');
    await page.getByText('Label', { exact: true }).click();
    await page.locator('.Label textarea').first().fill('{name}\n{value}.round(3)');
    await page.getByRole('row', { name: 'Halo Weight' }).getByRole('spinbutton').fill('3');
    await page.getByText('Popup', { exact: true }).click();
    await page.getByRole('row', { name: 'context.current.geometry_data.admin_level Admin level String' }).getByRole('checkbox').check();
    await page.getByRole('row', { name: 'context.current.geometry_data.admin_level_name Admin level name String' }).getByRole('checkbox').check();
    await page.getByRole('row', { name: 'context.current.indicator.name Indicator String' }).getByRole('checkbox').uncheck();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await expect(onRun).toEqual(`{"data_fields":[{"name":"context.current.indicator.name","alias":"Indicator","visible":false,"type":"string","order":0},{"name":"context.current.indicator.value","alias":"Value","visible":true,"type":"string","order":1},{"name":"context.current.indicator.label","alias":"Label","visible":true,"type":"string","order":2},{"name":"context.current.indicator.time","alias":"Date","visible":true,"type":"string","order":3},{"name":"context.current.geometry_data.admin_level","alias":"Admin level","visible":true,"type":"string","order":4},{"name":"context.current.geometry_data.admin_level_name","alias":"Admin level name","visible":true,"type":"string","order":5},{"name":"context.current.geometry_data.concept_uuid","alias":"Concept uuid","visible":false,"type":"string","order":6},{"name":"context.current.geometry_data.geom_code","alias":"Geom code","visible":false,"type":"string","order":7},{"name":"context.current.geometry_data.name","alias":"Name","visible":false,"type":"string","order":8},{"name":"context.current.indicator.attributes","alias":"","visible":false,"type":"string","order":9}],"config":{},"type":"Composite Index","style":[{"id":1,"name":"A","rule":"x==0","color":"#000000","outline_color":"#FFFFFF","outline_size":0.5,"active":true},{"id":2,"name":"B","rule":"x==2","color":"#000000","outline_color":"#FFFFFF","outline_size":0.5,"active":true},{"id":-1,"name":"No data","rule":"No data","color":"#D8D8D8","outline_color":"#ffffff","outline_size":0.5,"active":false},{"id":0,"name":"Other data","rule":"Other data","color":"#A6A6A6","outline_color":"#ffffff","outline_size":0.5,"active":false}],"style_config":{"dynamic_classification":"Equidistant.","dynamic_class_num":7,"sync_outline":false,"sync_filter":false,"outline_color":"#FFFFFF","outline_size":0.5,"no_data_rule":{"id":0,"name":"No data","rule":"No data","color":"#D8D8D8","outline_color":"#ffffff","outline_size":0.5,"active":true},"color_palette":3},"style_type":"Predefined style/color rules.","label_config":{"text":"{name}\\n{value}.round(3)","style":{"minZoom":0,"maxZoom":24,"fontFamily":"\\"Rubik\\", sans-serif","fontSize":13,"fontColor":"#000000","fontWeight":300,"strokeColor":"#FFFFFF","strokeWeight":0,"haloColor":"#FFFFFF","haloWeight":3}}}`)


    await page.getByRole('listitem').filter({ hasText: 'Composite index layer' }).getByTestId('EditIcon').click();
    await page.getByText('Style', { exact: true }).first().click();
    await page.locator('div:nth-child(2) > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'Dynamic qualitative style.' }).click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await expect(onRun).toEqual(`{"data_fields":[{"name":"context.current.indicator.name","alias":"Indicator","visible":false,"type":"string","order":0},{"name":"context.current.indicator.value","alias":"Value","visible":true,"type":"string","order":1},{"name":"context.current.indicator.label","alias":"Label","visible":true,"type":"string","order":2},{"name":"context.current.indicator.time","alias":"Date","visible":true,"type":"string","order":3},{"name":"context.current.geometry_data.admin_level","alias":"Admin level","visible":true,"type":"string","order":4},{"name":"context.current.geometry_data.admin_level_name","alias":"Admin level name","visible":true,"type":"string","order":5},{"name":"context.current.geometry_data.concept_uuid","alias":"Concept uuid","visible":false,"type":"string","order":6},{"name":"context.current.geometry_data.geom_code","alias":"Geom code","visible":false,"type":"string","order":7},{"name":"context.current.geometry_data.name","alias":"Name","visible":false,"type":"string","order":8},{"name":"context.current.indicator.attributes","alias":"","visible":false,"type":"string","order":9}],"config":{},"type":"Composite Index","style":[{"id":1,"name":"A","rule":"x==0","color":"#000000","outline_color":"#FFFFFF","outline_size":0.5,"active":true},{"id":2,"name":"B","rule":"x==2","color":"#000000","outline_color":"#FFFFFF","outline_size":0.5,"active":true},{"id":-1,"name":"No data","rule":"No data","color":"#D8D8D8","outline_color":"#ffffff","outline_size":0.5,"active":false},{"id":0,"name":"Other data","rule":"Other data","color":"#A6A6A6","outline_color":"#ffffff","outline_size":0.5,"active":false}],"style_config":{"dynamic_classification":"Equidistant.","dynamic_class_num":7,"sync_outline":false,"sync_filter":false,"outline_color":"#FFFFFF","outline_size":0.5,"no_data_rule":{"id":0,"name":"No data","rule":"No data","color":"#D8D8D8","outline_color":"#ffffff","outline_size":0.5,"active":true},"color_palette":3},"style_type":"Dynamic qualitative style.","label_config":{"text":"{name}\\n{value}.round(3)","style":{"minZoom":0,"maxZoom":24,"fontFamily":"\\"Rubik\\", sans-serif","fontSize":13,"fontColor":"#000000","fontWeight":300,"strokeColor":"#FFFFFF","strokeWeight":0,"haloColor":"#FFFFFF","haloWeight":3}}}`)
  })
});