import { expect, test } from '@playwright/test';
import {
  deleteProject,
  saveAsProject,
  saveProject,
  viewProject
} from "../../utils/project";


test.describe('Indicator layer override', () => {
  test('Indicator layer name', async ({ page }) => {
    const name = 'Indicator layer name override project'

    // --------------------------------------------------------------------
    // Delete project if exists
    // --------------------------------------------------------------------
    await deleteProject(page, name)

    // --------------------------------------------------------------------
    // Check configuration
    // --------------------------------------------------------------------
    // Create project
    // --------------------------------------------------------------------
    const sampleIndicatorA = 'Sample Indicator A'
    const pieChart = 'Pie chart layer'
    const relatedTableLayer = 'Dynamic Layer based on a list'
    const dynamicLayer = 'Dynamic Layer'
    const indicatorD = 'Test Indicator D'

    await saveAsProject(page, 'Demo GeoSight Project', name)
    await viewProject(page, name);
    await page.getByRole('button', { name: 'Close' }).click();

    await expect(page.getByRole('treeitem', { name: sampleIndicatorA })).toBeVisible();
    await page.locator('label').filter({ hasText: sampleIndicatorA }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: This is the description for the sample indicator A. It is only for GeoSight demo purposes.`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', { name: pieChart })).toBeVisible();
    await page.locator('label').filter({ hasText: pieChart }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: This is the description for the sample indicator A. It is only for GeoSight demo purposes.`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', {
      name: dynamicLayer,
      exact: true
    })).toBeVisible();
    await page.locator('label').filter({ hasText: new RegExp(`^${dynamicLayer}$`) }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: -`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', { name: relatedTableLayer })).toBeVisible();
    await page.locator('label').filter({ hasText: relatedTableLayer }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: Layer dynamically created based on RRR table. Data has been aggregated using AVG on field NoBeneficiaries. Source data has been filtered based on the following fields: Partner.`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', { name: indicatorD })).toBeVisible();
    await page.locator('label').filter({ hasText: indicatorD }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: -`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);


    // Overwrite name everything
    await page.getByTitle('Edit project').getByRole('link').click();
    await page.getByText('Indicator Layers (10)').click();

    await page.getByRole('listitem').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('button').nth(1).click();
    await expect(page.locator('.IndicatorName')).toBeDisabled();
    await expect(page.locator('.IndicatorName')).toHaveValue("Sample Indicator A");
    await expect(page.locator('.LayerNameInput')).toBeEnabled();
    await page.locator('.LayerNameInput').fill("Sample 1");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.locator('span').filter({ hasText: 'Layers (Chart) Config' }).getByRole('button').click();
    await expect(page.locator('.IndicatorName')).toBeHidden();
    await expect(page.locator('.LayerNameInputCheckbox')).toBeHidden();
    await expect(page.locator('.LayerNameInput')).toBeEnabled();
    await page.locator('.LayerNameInput').fill("Sample 2");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.locator('span').filter({ hasText: 'Related Table Config' }).getByRole('button').click();
    await expect(page.locator('.IndicatorName')).toBeHidden();
    await expect(page.locator('.LayerNameInputCheckbox')).toBeHidden();
    await expect(page.locator('.LayerNameInput')).toBeEnabled();
    await page.locator('.LayerNameInput').fill("Sample 3");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.locator('span').filter({ hasText: 'Dynamic Config' }).getByRole('button').click();
    await expect(page.locator('.IndicatorName')).toBeHidden();
    await expect(page.locator('.LayerNameInputCheckbox')).toBeHidden();
    await expect(page.locator('.LayerNameInput')).toBeEnabled();
    await page.locator('.LayerNameInput').fill("Sample 4");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.getByRole('listitem').filter({ hasText: 'Test Indicator DSingle Config' }).getByRole('button').nth(1).click();
    await expect(page.locator('.IndicatorName')).toBeDisabled();
    await expect(page.locator('.IndicatorName')).toHaveValue("Sample Indicator D");
    await expect(page.locator('.LayerNameInput')).toBeEnabled();
    await page.locator('.LayerNameInput').fill("Sample 5");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await expect(page.locator('.DashboardForm').getByText("Sample 1", { exact: true })).toBeVisible();
    await expect(page.locator('.DashboardForm').getByText("Sample 2", { exact: true })).toBeVisible();
    await expect(page.locator('.DashboardForm').getByText("Sample 3", { exact: true })).toBeVisible();
    await expect(page.locator('.DashboardForm').getByText("Sample 4", { exact: true })).toBeVisible();
    await expect(page.locator('.DashboardForm').getByText("Sample 5", { exact: true })).toBeVisible();
    await saveProject(page);

    // View
    await viewProject(page, name);
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('treeitem', { name: "Sample 1" })).toBeVisible();
    await expect(page.getByRole('treeitem', { name: "Sample 2" })).toBeVisible();
    await expect(page.getByRole('treeitem', { name: "Sample 3" })).toBeVisible();
    await expect(page.getByRole('treeitem', { name: "Sample 4" })).toBeVisible();
    await expect(page.getByRole('treeitem', { name: "Sample 5" })).toBeVisible();

    await expect(page.getByRole('treeitem', { name: sampleIndicatorA })).toBeHidden();
    await expect(page.getByRole('treeitem', { name: pieChart })).toBeHidden();
    await expect(page.getByRole('treeitem', {
      name: dynamicLayer,
      exact: true
    })).toBeHidden();
    await expect(page.getByRole('treeitem', { name: relatedTableLayer })).toBeHidden();
    await expect(page.getByRole('treeitem', { name: indicatorD })).toBeHidden();

    // Revert
    // Overwrite name everything
    await page.getByTitle('Edit project').getByRole('link').click();
    await page.getByText('Indicator Layers (10)').click();

    await page.getByRole('listitem').filter({ hasText: 'Sample 1' }).getByRole('button').nth(1).click();
    await expect(page.locator('.LayerNameInput')).toHaveValue("Sample 1");
    await page.locator('.LayerNameInputCheckbox').click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.getByRole('listitem').filter({ hasText: 'Sample 2' }).getByRole('button').nth(1).click();
    await expect(page.locator('.LayerNameInputCheckbox')).toBeHidden();
    await expect(page.locator('.LayerNameInput')).toBeEnabled();
    await expect(page.locator('.LayerNameInput')).toHaveValue("Sample 2");
    await page.locator('.LayerNameInput').fill("Sample 2A");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.getByRole('listitem').filter({ hasText: 'Sample 3' }).getByRole('button').nth(1).click();
    await expect(page.locator('.LayerNameInputCheckbox')).toBeHidden();
    await expect(page.locator('.LayerNameInput')).toBeEnabled();
    await expect(page.locator('.LayerNameInput')).toHaveValue("Sample 3");
    await page.locator('.LayerNameInput').fill("Sample 3A");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.getByRole('listitem').filter({ hasText: 'Sample 4' }).getByRole('button').nth(1).click();
    await expect(page.locator('.LayerNameInputCheckbox')).toBeHidden();
    await expect(page.locator('.LayerNameInput')).toBeEnabled();
    await expect(page.locator('.LayerNameInput')).toHaveValue("Sample 4");
    await page.locator('.LayerNameInput').fill("Sample 4A");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.getByRole('listitem').filter({ hasText: 'Sample 5' }).getByRole('button').nth(1).click();
    await expect(page.locator('.LayerNameInput')).toHaveValue("Sample 5");
    await page.locator('.LayerNameInputCheckbox').click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await expect(page.locator('.DashboardForm').getByText("Sample Indicator A", { exact: true })).toBeVisible();
    await expect(page.locator('.DashboardForm').getByText("Sample 2A", { exact: true })).toBeVisible();
    await expect(page.locator('.DashboardForm').getByText("Sample 3A", { exact: true })).toBeVisible();
    await expect(page.locator('.DashboardForm').getByText("Sample 4A", { exact: true })).toBeVisible();
    await expect(page.locator('.DashboardForm').getByText("Sample Indicator D", { exact: true })).toBeVisible();
    await saveProject(page);

    // View
    await viewProject(page, name);
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('treeitem', { name: "Sample Indicator A" })).toBeVisible();
    await expect(page.getByRole('treeitem', { name: "Sample 2A" })).toBeVisible();
    await expect(page.getByRole('treeitem', { name: "Sample 3A" })).toBeVisible();
    await expect(page.getByRole('treeitem', { name: "Sample 4A" })).toBeVisible();
    await expect(page.getByRole('treeitem', { name: "Sample Indicator D" })).toBeVisible();

    await expect(page.getByRole('treeitem', { name: pieChart })).toBeHidden();
    await expect(page.getByRole('treeitem', {
      name: dynamicLayer,
      exact: true
    })).toBeHidden();
    await expect(page.getByRole('treeitem', { name: relatedTableLayer })).toBeHidden();

    // --------------------------------------------------------------------
    // Delete project
    // --------------------------------------------------------------------
    await deleteProject(page, name)
  })
  test('Indicator layer description', async ({ page }) => {
    const name = 'Indicator layer description override project'

    // --------------------------------------------------------------------
    // Delete project if exists
    // --------------------------------------------------------------------
    await deleteProject(page, name)

    // --------------------------------------------------------------------
    // Check configuration
    // --------------------------------------------------------------------
    // Create project
    // --------------------------------------------------------------------
    const sampleIndicatorA = 'Sample Indicator A'
    const pieChart = 'Pie chart layer'
    const relatedTableLayer = 'Dynamic Layer based on a list'
    const dynamicLayer = 'Dynamic Layer'
    const indicatorD = 'Test Indicator D'

    await saveAsProject(page, 'Demo GeoSight Project', name)
    await viewProject(page, name);
    await page.getByRole('button', { name: 'Close' }).click();

    await expect(page.getByRole('treeitem', { name: sampleIndicatorA })).toBeVisible();
    await page.locator('label').filter({ hasText: sampleIndicatorA }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: This is the description for the sample indicator A. It is only for GeoSight demo purposes.`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', { name: pieChart })).toBeVisible();
    await page.locator('label').filter({ hasText: pieChart }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: This is the description for the sample indicator A. It is only for GeoSight demo purposes.`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', {
      name: dynamicLayer,
      exact: true
    })).toBeVisible();
    await page.locator('label').filter({ hasText: new RegExp(`^${dynamicLayer}$`) }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: -`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', { name: relatedTableLayer })).toBeVisible();
    await page.locator('label').filter({ hasText: relatedTableLayer }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: Layer dynamically created based on RRR table. Data has been aggregated using AVG on field NoBeneficiaries. Source data has been filtered based on the following fields: Partner.`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', { name: indicatorD })).toBeVisible();
    await page.locator('label').filter({ hasText: indicatorD }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: -`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    // Overwrite description everything
    await page.getByTitle('Edit project').getByRole('link').click();
    await page.getByText('Indicator Layers (10)').click();

    await page.getByRole('listitem').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('button').nth(1).click();
    await expect(page.locator('.IndicatorDescription')).toBeDisabled();
    await expect(page.locator('.IndicatorDescription')).toHaveValue("This is the description for the sample indicator A. It is only for GeoSight demo purposes.");
    await expect(page.locator('.LayerDescriptionInput')).toBeEnabled();
    await page.locator('.LayerDescriptionInput').fill("Description 1");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.locator('span').filter({ hasText: 'Layers (Chart) Config' }).getByRole('button').click();
    await expect(page.locator('.IndicatorDescription')).toBeHidden();
    await expect(page.locator('.IndicatorDescriptionCheckbox')).toBeHidden();
    await expect(page.locator('.LayerDescriptionInput')).toBeEnabled();
    await page.locator('.LayerDescriptionInput').fill("Description 2");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.locator('span').filter({ hasText: 'Related Table Config' }).getByRole('button').click();
    await expect(page.locator('.IndicatorDescription')).toBeHidden();
    await expect(page.locator('.IndicatorDescriptionCheckbox')).toBeHidden();
    await expect(page.locator('.LayerDescriptionInput')).toBeEnabled();
    await page.locator('.LayerDescriptionInput').fill("Description 3");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.locator('span').filter({ hasText: 'Dynamic Config' }).getByRole('button').click();
    await expect(page.locator('.IndicatorDescription')).toBeHidden();
    await expect(page.locator('.IndicatorDescriptionCheckbox')).toBeHidden();
    await expect(page.locator('.LayerDescriptionInput')).toBeEnabled();
    await page.locator('.LayerDescriptionInput').fill("Description 4");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.getByRole('listitem').filter({ hasText: 'Test Indicator DSingle Config' }).getByRole('button').nth(1).click();
    await expect(page.locator('.IndicatorDescription')).toBeDisabled();
    await expect(page.locator('.IndicatorDescription')).toHaveValue("");
    await expect(page.locator('.LayerDescriptionInput')).toBeDisabled();
    await page.locator('.LayerDescriptionInputCheckbox').click();
    await page.locator('.LayerDescriptionInput').fill("Description 5");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await saveProject(page);

    // View
    await viewProject(page, name);
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('treeitem', { name: sampleIndicatorA })).toBeVisible();
    await page.locator('label').filter({ hasText: sampleIndicatorA }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: Description 1`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', { name: pieChart })).toBeVisible();
    await page.locator('label').filter({ hasText: pieChart }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: Description 2`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', { name: relatedTableLayer })).toBeVisible();
    await page.locator('label').filter({ hasText: relatedTableLayer }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: Description 3`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', {
      name: dynamicLayer,
      exact: true
    })).toBeVisible();
    await page.locator('label').filter({ hasText: new RegExp(`^${dynamicLayer}$`) }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: Description 4`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', { name: indicatorD })).toBeVisible();
    await page.locator('label').filter({ hasText: indicatorD }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: Description 5`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    // Revert
    // Overwrite name everything
    await page.getByTitle('Edit project').getByRole('link').click();
    await page.getByText('Indicator Layers (10)').click();

    await page.getByRole('listitem').filter({ hasText: 'Sample Indicator ASingle' }).getByRole('button').nth(1).click();
    await expect(page.locator('.IndicatorDescription')).toBeDisabled();
    await expect(page.locator('.IndicatorDescription')).toHaveValue("This is the description for the sample indicator A. It is only for GeoSight demo purposes.");
    await expect(page.locator('.LayerDescriptionInput')).toBeEnabled();
    await expect(page.locator('.LayerDescriptionInput')).toHaveValue("Description 1");
    await page.locator('.LayerDescriptionInputCheckbox').click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.locator('span').filter({ hasText: 'Layers (Chart) Config' }).getByRole('button').click();
    await expect(page.locator('.IndicatorDescription')).toBeHidden();
    await expect(page.locator('.IndicatorDescriptionCheckbox')).toBeHidden();
    await expect(page.locator('.LayerDescriptionInput')).toBeEnabled();
    await expect(page.locator('.LayerDescriptionInput')).toHaveValue("Description 2");
    await page.locator('.LayerDescriptionInput').fill("Description 2A");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.locator('span').filter({ hasText: 'Related Table Config' }).getByRole('button').click();
    await expect(page.locator('.IndicatorDescription')).toBeHidden();
    await expect(page.locator('.IndicatorDescriptionCheckbox')).toBeHidden();
    await expect(page.locator('.LayerDescriptionInput')).toBeEnabled();
    await expect(page.locator('.LayerDescriptionInput')).toHaveValue("Description 3");
    await page.locator('.LayerDescriptionInput').fill("Description 3A");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.locator('span').filter({ hasText: 'Dynamic Config' }).getByRole('button').click();
    await expect(page.locator('.IndicatorDescription')).toBeHidden();
    await expect(page.locator('.IndicatorDescriptionCheckbox')).toBeHidden();
    await expect(page.locator('.LayerDescriptionInput')).toBeEnabled();
    await expect(page.locator('.LayerDescriptionInput')).toHaveValue("Description 4");
    await page.locator('.LayerDescriptionInput').fill("Description 4A");
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await page.getByRole('listitem').filter({ hasText: 'Test Indicator DSingle Config' }).getByRole('button').nth(1).click();
    await expect(page.locator('.IndicatorDescription')).toBeDisabled();
    await expect(page.locator('.IndicatorDescription')).toHaveValue("");
    await expect(page.locator('.LayerDescriptionInput')).toBeEnabled();
    await expect(page.locator('.LayerDescriptionInput')).toHaveValue("Description 5");
    await page.locator('.LayerDescriptionInputCheckbox').click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    await saveProject(page);

    // View
    await viewProject(page, name);
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('treeitem', { name: sampleIndicatorA })).toBeVisible();
    await page.locator('label').filter({ hasText: sampleIndicatorA }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText("Description: This is the description for the sample indicator A. It is only for GeoSight demo purposes.", { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', { name: pieChart })).toBeVisible();
    await page.locator('label').filter({ hasText: pieChart }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: Description 2A`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', { name: relatedTableLayer })).toBeVisible();
    await page.locator('label').filter({ hasText: relatedTableLayer }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: Description 3A`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', {
      name: dynamicLayer,
      exact: true
    })).toBeVisible();
    await page.locator('label').filter({ hasText: new RegExp(`^${dynamicLayer}$`) }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: Description 4A`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    await expect(page.getByRole('treeitem', { name: indicatorD })).toBeVisible();
    await page.locator('label').filter({ hasText: indicatorD }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: -`, { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);

    // --------------------------------------------------------------------
    // Delete project
    // --------------------------------------------------------------------
    await deleteProject(page, name)
  })
});