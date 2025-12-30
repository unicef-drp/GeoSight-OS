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

    // Await edit url and check featured should be checked
    await expect(page.locator('#ProjectFeatured')).toBeChecked();
    await page.locator('#ProjectFeatured').click();
    await expect(page.locator('#ProjectFeatured')).not.toBeChecked();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    const listUrl = `${BASE_URL}/admin/project/`
    await page.goto(listUrl);
    await page.waitForURL(listUrl)
    await expect(page.getByRole('cell', { name: name })).toBeVisible();

    // ------------------------------------
    await page.goto(editUrl);
    await page.waitForURL(editUrl)

    // Await edit url and check featured should be checked
    await expect(page.locator('#ProjectFeatured')).not.toBeChecked();

    // ------------------------------------
    // DELETE PROJECT
    // ------------------------------------
    await deleteProject(page, name)
  });
});