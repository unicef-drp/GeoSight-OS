import { expect, test } from '@playwright/test';
import { BASE_URL } from "../../variables";
import { deleteProject, fillProjectName } from "../../utils/project";

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

    // For contributor, featured should not be visible
    await expect(page.locator('#ProjectFeatured')).not.toBeVisible();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    const editUrl = `${BASE_URL}/admin/project/${name.toLowerCase().replace(' ', '-')}/edit`
    await page.waitForURL(editUrl)

    // List url
    const listUrl = `${BASE_URL}/admin/project/`
    await page.goto(listUrl);
    await page.waitForURL(listUrl);
    await expect(page.getByRole('row', { name: `Select row ${name}` }).getByLabel(featuredLabel)).not.toBeVisible();
    await expect(page.getByRole('row', { name: `Select row ${name}` }).getByLabel(nonFeaturedLabel)).not.toBeVisible();

    // ------------------------------------
    // DELETE PROJECT
    // ------------------------------------
    await deleteProject(page, name)
  });
});