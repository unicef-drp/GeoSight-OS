import { expect, test } from '@playwright/test';
import { deleteProject } from "../../utils/project";
import { BASE_URL } from "../../variables";

// URL That we need to check
const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('Create empty project', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('');
  });

  // A use case tests scenarios
  test('Create empty project', async ({ page }) => {
    let lastSearchEntity = null
    page.on('console', msg => {
      if (msg.text().indexOf('SEARCH_GEOMETRY_INPUT:') !== -1) {
        try {
          lastSearchEntity = msg.text().replace('SEARCH_GEOMETRY_INPUT:', '')
        } catch (e) {
          console.log(e)

        }
      }
    })

    const name = 'Empty'
    await page.goto('/admin/project/create');
    await page.getByRole('textbox', { name: 'Select View' }).click();
    await page.getByText('Somalia', { exact: true }).click();
    await page.getByRole('textbox', { name: 'Example: Afghanistan Risk' }).fill(name);
    await page.locator('.ReactSelect__input-container').first().click();
    await page.getByRole('option', { name: 'Test' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    const editUrl = `${BASE_URL}/admin/project/${name.toLowerCase()}/edit`
    await page.waitForURL(editUrl)

    await page.goto(`${BASE_URL}/project/${name.toLowerCase()}/`);
    await page.hover('.ReferenceLayerLevelSelected')
    await expect(page.locator('.ReferenceLayerLevelOption').getByText('Admin Level 0')).toBeVisible();
    await expect(page.locator('.ReferenceLayerLevelOption').getByText('Admin Level 1')).toBeVisible();
    await expect(page.locator('.ReferenceLayerLevelOption').getByText('Admin Level 2')).toBeVisible();

    await page.getByRole('combobox', { name: 'Search Geography Entity' }).click();
    await page.getByRole('option', { name: 'Banadir Admin Level' }).click();
    await expect(lastSearchEntity).toEqual("45.20831299,1.96833061,45.60608431,2.18504432");
    await page.getByRole('option', { name: 'Gedo Admin Level' }).click();
    await expect(lastSearchEntity).toEqual("40.994317,1.23272177,43.14093018,4.30793036");

    // ------------------------------------
    // DELETE PROJECT
    // ------------------------------------
    await deleteProject(page, name)
  });
});