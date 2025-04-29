import { expect, test } from '@playwright/test';

// URL That we need to check
const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('View edit project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/admin/project/demo-geosight-project/edit');
  });

  // A use case tests scenarios
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

    // Check filter is hidden or not
    await page.goto('/admin/project/demo-geosight-project/edit');
    await page.locator('.TabPrimary').getByText('Filters').click();
    await page.getByText('Hide filter section').click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.goto('/project/demo-geosight-project');
    await page.waitForURL('/project/demo-geosight-project');
    await delay(1000)
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('tab', { name: 'Filters' })).toBeHidden();

    await page.goto('/admin/project/demo-geosight-project/edit');
    await page.locator('.TabPrimary').getByText('Filters').click();
    await page.getByText('Hide filter section').click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.goto('/project/demo-geosight-project');
    await page.waitForURL('/project/demo-geosight-project');
    await delay(1000)
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('tab', { name: 'Filters' })).toBeVisible();

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
    await page.waitForURL('/project/demo-geosight-project');
    await delay(1000)
    await expect(JSON.stringify(lastLayerStyles["80 - 100"])).toEqual('{"rule":"x>80 and x<=100","color":"#d7191c","outline_color":"#ffffff","outline_size":"1"}')
    await expect(JSON.stringify(lastLayerStyles["No data"])).toEqual('{"rule":"No data","color":"#D8D8D8","outline_color":"#ffffff","outline_size":"2"}')
    await expect(JSON.stringify(lastLayerStyles["Other data"])).toEqual('{"rule":"Other data","color":"#A6A6A6","outline_color":"#ffffff","outline_size":"3"}')
  });
});