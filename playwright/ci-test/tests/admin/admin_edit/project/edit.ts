import { expect, test } from '@playwright/test';
import { BASE_URL } from "../../../variables";

// URL That we need to check
const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('View edit project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/admin/project/demo-geosight-project/edit');
  });
  test('Edit project', async ({ page }) => {
    let lastLayerStyles = null
    page.on('console', msg => {
      if (msg.text().indexOf('LAYER_STYLE:') !== -1) {
        try {
          const log = msg.text().replace('LAYER_STYLE:', '')
          if (log) {
            lastLayerStyles = {}
            JSON.parse(log).map(style => {
              lastLayerStyles[style.name] = {
                rule: style.rule,
                color: style.color,
                outline_color: style.outline_color,
                outline_size: "" + style.outline_size
              }
            })
          }
        } catch (e) {
          console.log(e)

        }
      }
    });
    // Check preview
    await expect(page.getByText('Preview', { exact: true })).toBeVisible();
    // @ts-ignore
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.getByText('Preview', { exact: true }).click()
    ]);
    await newPage.waitForLoadState();
    await expect(newPage.url()).toEqual(`${BASE_URL}/project/demo-geosight-project`)

    // --------------------------------------------------------------------
    // Check filter is hidden or not
    await page.goto('/admin/project/demo-geosight-project/edit');
    await page.locator('.TabPrimary').getByText('Filters').click();
    await page.getByText('Hide filter section').click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.goto('/project/demo-geosight-project');
    await page.waitForURL(`${BASE_URL}/project/demo-geosight-project`);
    await delay(1000)
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('tab', { name: 'Filters' })).toBeHidden();

    await page.goto('/admin/project/demo-geosight-project/edit');
    await page.locator('.TabPrimary').getByText('Filters').click();
    await page.getByText('Hide filter section').click();

    // -------------------------------
    // Related table popup
    await page.getByText('Indicator Layers (10)').click();
    await page.getByRole('listitem').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('button').nth(1).click();
    await expect(page.getByText('Popup', { exact: true })).toBeVisible();
    await expect(page.getByText('Related Record Popup')).not.toBeVisible();
    await page.locator('.MuiButtonLike > svg > path').click();
    await page.locator('span').filter({ hasText: 'Layers (Chart) Config' }).getByRole('button').click();
    await expect(page.getByText('Popup', { exact: true })).toBeVisible();
    await expect(page.getByText('Related Record Popup')).not.toBeVisible();
    await page.locator('.MuiButtonLike > svg > path').click();
    await page.locator('span').filter({ hasText: 'Related Table Config' }).getByRole('button').click();
    await expect(page.getByText('Popup', { exact: true })).toBeVisible();
    await expect(page.getByText('Related Record Popup')).toBeVisible();
    await page.getByText('Related Record Popup').click();
    await expect(page.getByRole('cell', { name: 'Date' }).first()).toBeVisible();
    await expect(page.getByRole('table').getByText('Name')).toBeVisible();
    await expect(page.getByRole('table').getByText('NoBeneficiaries')).toBeVisible();
    await expect(page.getByText('Partner')).toBeVisible();
    await expect(page.getByText('Pcode')).toBeVisible();
    await expect(page.getByText('Sector')).toBeVisible();
    await expect(page.getByRole('table').getByText('Ucode')).toBeVisible();
    await page.getByText('Enable popup for Related').click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    // -------------------------------

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.goto('/project/demo-geosight-project');
    await page.waitForURL(`${BASE_URL}/project/demo-geosight-project`);
    await delay(1000)
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('tab', { name: 'Filters' })).toBeVisible();

    // ------------------------------------
    // Check RT
    // ------------------------------------
    await delay(1000)
    await page.getByText('Dynamic Layer based on a list').click();
    await delay(1000)
    await page.getByRole('region', { name: 'Map' }).click({
      position: {
        x: 583,
        y: 425
      }
    });
    await expect(page.getByText('Related Records')).toBeVisible();
    await page.getByText('Related Records').click();
    await expect(page.getByText('/ 2')).toBeVisible();

    // Check extent
    await page.goto('/admin/project/demo-geosight-project/edit');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await delay(2000)
    await expect(page.locator('.ExtentManualInput input').nth(0)).toHaveValue('32.90038883686066')
    await expect(page.locator('.ExtentManualInput input').nth(1)).toHaveValue('13.63887097489157')
    await expect(page.locator('.ExtentManualInput input').nth(2)).toHaveValue('54.19921517372131')
    await expect(page.locator('.ExtentManualInput input').nth(3)).toHaveValue('-5.586827947149395')

    // Check popup config
    await page.getByText('Indicator Layers (10)').click();
    await page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('button').nth(1).click();
    await page.getByText('Popup', { exact: true }).click();
    await expect(page.locator('.preview .popup-content').nth(0).locator('td').nth(0)).toContainText('SOM_TEST_IND_A')
    await expect(page.locator('.preview .popup-content').nth(0).locator('td').nth(1)).toContainText('77')
    await expect(page.locator('.preview .popup-content').nth(1).locator('td').nth(0)).toContainText('Average:')
    await expect(page.locator('.preview .popup-content').nth(1).locator('td').nth(1)).toContainText('NaN')
    await page.locator('#Form div').filter({ hasText: /^Admin Level 0$/ }).nth(3).click();
    await page.getByRole('option', { name: 'Admin Level 1' }).click();
    await expect(page.locator('.preview .popup-content').nth(0).locator('td').nth(0)).toContainText('SOM_TEST_IND_A')
    await expect(page.locator('.preview .popup-content').nth(0).locator('td').nth(1)).toContainText('61')
    await expect(page.locator('.preview .popup-content').nth(1).locator('tr').nth(0).locator('td').nth(0)).toContainText('Bakool')
    await expect(page.locator('.preview .popup-content').nth(1).locator('tr').nth(0).locator('td').nth(1)).toContainText('78')
    await expect(page.locator('.preview .popup-content').nth(1).locator('tr').nth(0).locator('td').nth(2)).toContainText('2020-01-01')
    await expect(page.locator('.preview .popup-content').nth(1).locator('tr').nth(1).locator('td').nth(0)).toContainText('Banadir')
    await expect(page.locator('.preview .popup-content').nth(1).locator('tr').nth(1).locator('td').nth(1)).toContainText('30')
    await expect(page.locator('.preview .popup-content').nth(1).locator('tr').nth(1).locator('td').nth(2)).toContainText('2020-01-01')

    // Update the style
    await page.locator('.TabPrimary').getByText('Style', { exact: true }).click();
    await expect(JSON.stringify(lastLayerStyles["80 - 100"])).toEqual('{"rule":"x>80 and x<=100","color":"#d7191c","outline_color":"#ffffff","outline_size":"0.5"}')
    await expect(JSON.stringify(lastLayerStyles["No data"])).toEqual('{"rule":"No data","color":"#D8D8D8","outline_color":"#ffffff","outline_size":"0.5"}')
    await expect(JSON.stringify(lastLayerStyles["Other data"])).toEqual('{"rule":"Other data","color":"#A6A6A6","outline_color":"#ffffff","outline_size":"0.5"}')

    // Update the style by quantitative
    await page.getByText('Override style from indicator').click();
    await page.locator('div:nth-child(2) > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'Dynamic quantitative style.' }).click();
    await page.locator('input[name="dynamic_class_num"]').fill('5');
    await delay(1000)
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Configuration has been saved!')).toBeVisible()
    await page.goto('/project/demo-geosight-project');
    await page.waitForURL(`${BASE_URL}/project/demo-geosight-project`);
    await expect(page.locator('.IndicatorLegendRow')).toHaveCount(6);
    await expect(page.locator('.IndicatorLegendRowBlock').nth(0)).toHaveCSS('background-color', 'rgb(26, 152, 80)');
    await expect(page.locator('.IndicatorLegendRowBlock').nth(0)).toHaveCSS('border', '1px solid rgb(255, 255, 255)');
    await expect(page.locator('.IndicatorLegendRowName').nth(0)).toHaveText('77.00 - 96.00');
    await expect(page.locator('.IndicatorLegendRowBlock').nth(1)).toHaveCSS('background-color', 'rgb(181, 223, 117)');
    await expect(page.locator('.IndicatorLegendRowBlock').nth(1)).toHaveCSS('border', '1px solid rgb(255, 255, 255)');
    await expect(page.locator('.IndicatorLegendRowName').nth(1)).toHaveText('58.00 - 77.00');
    await expect(page.locator('.IndicatorLegendRowBlock').nth(2)).toHaveCSS('background-color', 'rgb(255, 255, 191)');
    await expect(page.locator('.IndicatorLegendRowBlock').nth(2)).toHaveCSS('border', '1px solid rgb(255, 255, 255)');
    await expect(page.locator('.IndicatorLegendRowName').nth(2)).toHaveText('39.00 - 58.00');
    await expect(page.locator('.IndicatorLegendRowBlock').nth(3)).toHaveCSS('background-color', 'rgb(253, 182, 114)');
    await expect(page.locator('.IndicatorLegendRowBlock').nth(3)).toHaveCSS('border', '1px solid rgb(255, 255, 255)');
    await expect(page.locator('.IndicatorLegendRowName').nth(3)).toHaveText('20.00 - 39.00');
    await expect(page.locator('.IndicatorLegendRowBlock').nth(4)).toHaveCSS('background-color', 'rgb(215, 48, 39)');
    await expect(page.locator('.IndicatorLegendRowBlock').nth(4)).toHaveCSS('border', '1px solid rgb(255, 255, 255)');
    await expect(page.locator('.IndicatorLegendRowName').nth(4)).toHaveText('1.00 - 20.00');
    await expect(page.locator('.IndicatorLegendRowBlock').nth(5)).toHaveCSS('background-color', 'rgb(216, 216, 216)');
    await expect(page.locator('.IndicatorLegendRowBlock').nth(5)).toHaveCSS('border', '1px solid rgb(255, 255, 255)');
    await expect(page.locator('.IndicatorLegendRowName').nth(5)).toHaveText('No data');


    // Update the style by role
    await page.goto('/admin/project/demo-geosight-project/edit');
    await page.waitForURL(`${BASE_URL}/admin/project/demo-geosight-project/edit`);
    await page.getByText('Indicator Layers (10)').click();
    await page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('button').nth(1).click();
    await page.locator('.TabPrimary').getByText('Style', { exact: true }).click();
    await page.getByText('Override style from indicator').click();
    await delay(1000)
    await page.getByText('Override style from indicator').click();
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.locator('input[name="rule_outline_size_0"]').fill('1');
    await page.locator('input[name="rule_outline_size_1"]').fill('1');
    await page.locator('input[name="rule_outline_size_5"]').fill('2');
    await page.locator('input[name="rule_outline_size_6"]').fill('3');
    await page.locator('#RuleTable thead').click();
    await expect(page.locator('input[name="rule_outline_size_0"]')).toHaveValue('1');
    await expect(page.locator('input[name="rule_outline_size_1"]')).toHaveValue('1');
    await expect(page.locator('input[name="rule_outline_size_5"]')).toHaveValue('2');
    await expect(page.locator('input[name="rule_outline_size_6"]')).toHaveValue('3');
    await delay(1000)
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Check the style
    await expect(page.getByText('Configuration has been saved!')).toBeVisible()
    await page.goto('/project/demo-geosight-project');
    await page.waitForURL(`${BASE_URL}/project/demo-geosight-project`);
    await delay(1000)
    await expect(JSON.stringify(lastLayerStyles["80 - 100"])).toEqual('{"rule":"x>80 and x<=100","color":"#d7191c","outline_color":"#ffffff","outline_size":"1"}')
    await expect(JSON.stringify(lastLayerStyles["No data"])).toEqual('{"rule":"No data","color":"#D8D8D8","outline_color":"#ffffff","outline_size":"2"}')
    await expect(JSON.stringify(lastLayerStyles["Other data"])).toEqual('{"rule":"Other data","color":"#A6A6A6","outline_color":"#ffffff","outline_size":"3"}')
  });

  // A use case tests scenarios
  test('Edit project: Check history', async ({ page }) => {
    // --------------------------------------------------------------------
    // CHECK HISTORY
    // --------------------------------------------------------------------
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeDisabled();
    await expect(page.locator('#UndoHistory')).toBeDisabled();
    await expect(page.locator('#ResetHistory')).toBeDisabled();
    await expect(page.locator('#RedoHistory')).toBeDisabled();
    await page.getByText('Indicator Layers (10)').click();

    await page.locator('li').filter({ hasText: 'Sample Indicator BSingle' }).getByRole('img').nth(2).click();
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeEnabled();
    await expect(page.locator('#UndoHistory')).toBeEnabled();
    await expect(page.locator('#ResetHistory')).toBeEnabled();
    await expect(page.locator('#RedoHistory')).toBeDisabled();

    await page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('img').nth(2).click();
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeEnabled();
    await expect(page.locator('#UndoHistory')).toBeEnabled();
    await expect(page.locator('#ResetHistory')).toBeEnabled();
    await expect(page.locator('#RedoHistory')).toBeDisabled();
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOn.*/);
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator BSingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Pie Chart layer2 Layers (' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);

    await page.locator('li').filter({ hasText: 'Pie Chart layer2 Layers (' }).getByRole('img').nth(2).click();
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeEnabled();
    await expect(page.locator('#UndoHistory')).toBeEnabled();
    await expect(page.locator('#ResetHistory')).toBeEnabled();
    await expect(page.locator('#RedoHistory')).toBeDisabled();
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator BSingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Pie Chart layer2 Layers (' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOn.*/);

    // Undo 1
    await page.locator('#UndoHistory').click();
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeEnabled();
    await expect(page.locator('#UndoHistory')).toBeEnabled();
    await expect(page.locator('#ResetHistory')).toBeEnabled();
    await expect(page.locator('#RedoHistory')).toBeEnabled();
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOn.*/);
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator BSingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Pie Chart layer2 Layers (' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);

    // Undo 2
    await page.locator('#UndoHistory').click();
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeEnabled();
    await expect(page.locator('#UndoHistory')).toBeEnabled();
    await expect(page.locator('#ResetHistory')).toBeEnabled();
    await expect(page.locator('#RedoHistory')).toBeEnabled();
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator BSingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOn.*/);
    await expect(page.locator('li').filter({ hasText: 'Pie Chart layer2 Layers (' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);

    // Undo 3
    await page.locator('#UndoHistory').click();
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeDisabled();
    await expect(page.locator('#UndoHistory')).toBeDisabled();
    await expect(page.locator('#ResetHistory')).toBeDisabled();
    await expect(page.locator('#RedoHistory')).toBeEnabled();
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOn.*/);
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator BSingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Pie Chart layer2 Layers (' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);

    // Redo 1
    await page.locator('#RedoHistory').click();
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeEnabled();
    await expect(page.locator('#UndoHistory')).toBeEnabled();
    await expect(page.locator('#ResetHistory')).toBeEnabled();
    await expect(page.locator('#RedoHistory')).toBeEnabled();
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator BSingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOn.*/);
    await expect(page.locator('li').filter({ hasText: 'Pie Chart layer2 Layers (' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);

    // Redo 2
    await page.locator('#RedoHistory').click();
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeEnabled();
    await expect(page.locator('#UndoHistory')).toBeEnabled();
    await expect(page.locator('#ResetHistory')).toBeEnabled();
    await expect(page.locator('#RedoHistory')).toBeEnabled();
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOn.*/);
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator BSingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Pie Chart layer2 Layers (' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);

    // Redo 3
    await page.locator('#RedoHistory').click();
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeEnabled();
    await expect(page.locator('#UndoHistory')).toBeEnabled();
    await expect(page.locator('#ResetHistory')).toBeEnabled();
    await expect(page.locator('#RedoHistory')).toBeDisabled();
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator BSingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Pie Chart layer2 Layers (' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOn.*/);

    // Undo 1
    await page.locator('#UndoHistory').click();
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeEnabled();
    await expect(page.locator('#UndoHistory')).toBeEnabled();
    await expect(page.locator('#ResetHistory')).toBeEnabled();
    await expect(page.locator('#RedoHistory')).toBeEnabled();
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOn.*/);
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator BSingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Pie Chart layer2 Layers (' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);

    // We save with this state
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeDisabled();
    await expect(page.locator('#UndoHistory')).toBeEnabled();
    await expect(page.locator('#ResetHistory')).toBeDisabled();
    await expect(page.locator('#RedoHistory')).toBeDisabled();
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOn.*/);
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator BSingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Pie Chart layer2 Layers (' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);

    // Undo 2
    await page.locator('#UndoHistory').click();
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeEnabled();
    await expect(page.locator('#UndoHistory')).toBeEnabled();
    await expect(page.locator('#ResetHistory')).toBeEnabled();
    await expect(page.locator('#RedoHistory')).toBeEnabled();
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator BSingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOn.*/);
    await expect(page.locator('li').filter({ hasText: 'Pie Chart layer2 Layers (' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);

    // Undo 3
    await page.locator('#UndoHistory').click();
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeEnabled();
    await expect(page.locator('#UndoHistory')).toBeDisabled();
    await expect(page.locator('#ResetHistory')).toBeEnabled();
    await expect(page.locator('#RedoHistory')).toBeEnabled();
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOn.*/);
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator BSingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Pie Chart layer2 Layers (' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);

    // Redo 1
    await page.locator('#RedoHistory').click();
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeEnabled();
    await expect(page.locator('#UndoHistory')).toBeEnabled();
    await expect(page.locator('#ResetHistory')).toBeEnabled();
    await expect(page.locator('#RedoHistory')).toBeEnabled();
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator BSingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOn.*/);
    await expect(page.locator('li').filter({ hasText: 'Pie Chart layer2 Layers (' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);

    // Reset
    await page.locator('#ResetHistory').click();
    await expect(page.getByRole('button', {
      name: 'Save',
      exact: true
    })).toBeDisabled();
    await expect(page.locator('#UndoHistory')).toBeEnabled();
    await expect(page.locator('#ResetHistory')).toBeDisabled();
    await expect(page.locator('#RedoHistory')).toBeDisabled();
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOn.*/);
    await expect(page.locator('li').filter({ hasText: 'Sample Indicator BSingle' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    await expect(page.locator('li').filter({ hasText: 'Pie Chart layer2 Layers (' }).getByRole('img').nth(2)).toHaveClass(/.*VisibilityIconOff.*/);
    // --------------------------------------------------------------------
    // CHECK HISTORY
    // --------------------------------------------------------------------
  })
});