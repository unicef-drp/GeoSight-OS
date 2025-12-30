import { expect, test } from '@playwright/test';
import { deleteProject, fillProjectName } from "../../utils/project";
import { BASE_URL } from "../../variables";

// URL That we need to check
const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('Project feature', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('');
  });

  // A use case tests scenarios
  test('Create empty with featured', async ({ page }) => {
    const name = "Test Feature";
    const featuredLabel = 'Remove from featured'
    const nonFeaturedLabel = 'Feature it'

    // --------------------------------------------------------------
    // CREATE PROJECT FOR FEATURED
    // --------------------------------------------------------------
    await page.goto('/admin/project/create');
    await fillProjectName(page, name);

    // Check this is not featured
    await expect(page.locator('#ProjectFeatured')).not.toBeChecked();
    await page.locator('#ProjectFeatured').click();
    await expect(page.locator('#ProjectFeatured')).toBeChecked();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    const editUrl = `${BASE_URL}/admin/project/${name.toLowerCase().replace(' ', '-')}/edit`
    await page.waitForURL(editUrl)

    const homeUrl = `${BASE_URL}/`
    await page.goto(homeUrl);
    await page.waitForURL(homeUrl);
    await expect(page.getByRole('link', { name: name })).toBeVisible();

    const listUrl = `${BASE_URL}/admin/project/`
    await page.goto(listUrl);
    await page.waitForURL(listUrl);

    await expect(page.getByRole('row', { name: `Select row ${name}` }).getByLabel(featuredLabel)).toBeVisible();
    await expect(page.getByRole('cell', { name: name })).toBeVisible();

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.locator('.ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'False' }).click();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('cell', { name: name })).not.toBeVisible();

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.locator('.ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'True' }).click();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('cell', { name: name })).toBeVisible();

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.locator('.ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'False' }).click();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('cell', { name: name })).not.toBeVisible();

    await page.getByTitle('DataGrid-Filter').locator('a').click();
    await page.locator('.ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'Both' }).click();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.locator('.MuiBackdrop-root').click();

    await expect(page.getByRole('cell', { name: name })).toBeVisible();

    // Do filter

    // Click it
    await page.getByRole('row', { name: `Select row ${name}` }).getByLabel(featuredLabel).click();
    await expect(page.getByRole('row', { name: `Select row ${name}` }).getByLabel(nonFeaturedLabel)).toBeVisible();
    await page.goto(listUrl);
    await page.waitForURL(listUrl);
    await expect(page.getByRole('row', { name: `Select row ${name}` }).getByLabel(nonFeaturedLabel)).toBeVisible();

    // Click it
    await page.getByRole('row', { name: `Select row ${name}` }).getByLabel(nonFeaturedLabel).click();
    await expect(page.getByRole('row', { name: `Select row ${name}` }).getByLabel(featuredLabel)).toBeVisible();
    await page.goto(listUrl);
    await page.waitForURL(listUrl);
    await expect(page.getByRole('row', { name: `Select row ${name}` }).getByLabel(featuredLabel)).toBeVisible();

    // Await edit url and check featured should be checked
    await page.goto(editUrl);
    await page.waitForURL(editUrl)
    await expect(page.locator('#ProjectFeatured')).toBeChecked();
    await page.locator('#ProjectFeatured').click();
    await expect(page.locator('#ProjectFeatured')).not.toBeChecked();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await page.goto(listUrl);
    await page.waitForURL(listUrl)
    await expect(page.getByRole('cell', { name: name })).toBeVisible();

    // ------------------------------------
    await page.goto(editUrl);
    await page.waitForURL(editUrl)

    // Await edit url and check featured should be checked
    await expect(page.locator('#ProjectFeatured')).not.toBeChecked();

    await page.goto(homeUrl);
    await page.waitForURL(homeUrl);
    await delay(500);
    await expect(page.getByRole('link', { name: name })).not.toBeVisible();

    // ------------------------------------
    // DELETE PROJECT
    // ------------------------------------
    await deleteProject(page, name)
  });
});