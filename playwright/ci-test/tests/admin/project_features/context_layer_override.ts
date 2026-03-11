import { expect, test } from '@playwright/test';
import {
  deleteProject,
  editProject,
  saveAsProject,
  viewProject
} from "../../utils/project";


test.describe('Context layer override', () => {
  test('Config tool', async ({ page }) => {
    const name = 'Context layer override project'
    const oldName = 'Somalia sample context layer'
    const newName = 'This is overridden name'
    const oldDescription = 'Somalia sample context layer'
    const newescription = 'This is overridden description'

    // --------------------------------------------------------------------
    // Delete project if exists
    // --------------------------------------------------------------------
    await deleteProject(page, name)

    // --------------------------------------------------------------------
    // Check configuration
    // --------------------------------------------------------------------
    // Create project
    // --------------------------------------------------------------------
    await saveAsProject(page, 'Demo GeoSight Project', name)

    // Check name of context layer on edit
    await page.getByText('Context Layers (2)').click();
    await expect(page.locator('.DashboardForm').getByText(oldName, { exact: true })).toBeVisible();

    // Check name and description on the view
    await viewProject(page, name);
    await page.getByRole('button', { name: 'Close' }).click();
    await page.locator('button').getByText('Context Layers', { exact: true }).click();
    await expect(page.getByText(oldName, { exact: true })).toBeVisible();
    await page.locator('label').filter({ hasText: oldName }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: ${oldDescription}`, { exact: true })).toBeVisible();

    // Override context layer
    await editProject(page, name)
    await page.getByText('Context Layers (2)').click();
    await page.locator('li').filter({ hasText: oldName }).locator('.OtherActionButton').click();
    await expect(page.locator('.DashboardForm').getByText(oldName, { exact: true })).toBeVisible();
    await expect(page.locator('.ContextLayerNameInput')).toHaveValue(oldName);
    await expect(page.locator('.ContextLayerDescriptionInput')).toHaveValue(oldDescription);
    await page.locator('.LayerNameInput').fill(newName);
    await page.locator('.LayerDescriptionInput').fill(newescription);
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await expect(page.locator('.DashboardForm').getByText(newName, { exact: true })).toBeVisible();
    await expect(page.locator('.DashboardForm').getByText(oldName, { exact: true })).toBeHidden();
    await page.getByText('Save', { exact: true }).isEnabled();
    await page.getByText('Save', { exact: true }).click();

    // Check name and description on the view
    await viewProject(page, name);
    await page.getByRole('button', { name: 'Close' }).click();
    await page.locator('button').getByText('Context Layers', { exact: true }).click();
    await expect(page.getByText(newName, { exact: true })).toBeVisible();
    await page.locator('label').filter({ hasText: newName }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: ${newescription}`, { exact: true })).toBeVisible();

    // Revert with empty
    await editProject(page, name)
    await page.getByText('Context Layers (2)').click();
    await page.locator('li').filter({ hasText: newName }).locator('.OtherActionButton').click();
    await expect(page.locator('.DashboardForm').getByText(newName, { exact: true })).toBeVisible();
    await expect(page.locator('.ContextLayerNameInput')).toHaveValue(oldName);
    await expect(page.locator('.ContextLayerDescriptionInput')).toHaveValue(oldDescription);
    await page.locator('.LayerNameInput').fill("");
    await page.locator('.LayerDescriptionInput').fill("");
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await expect(page.locator('.DashboardForm').getByText(newName, { exact: true })).toBeHidden();
    await expect(page.locator('.DashboardForm').getByText(oldName, { exact: true })).toBeVisible();
    await page.getByText('Save', { exact: true }).isEnabled();
    await page.getByText('Save', { exact: true }).click();

    // Check name and description on the view
    await viewProject(page, name);
    await page.getByRole('button', { name: 'Close' }).click();
    await page.locator('button').getByText('Context Layers', { exact: true }).click();
    await expect(page.getByText(oldName, { exact: true })).toBeVisible();
    await page.locator('label').filter({ hasText: oldName }).locator('.LayerInfoIcon').hover();
    await expect(page.getByText(`Description: ${oldDescription}`, { exact: true })).toBeVisible();

    // --------------------------------------------------------------------
    // Delete project
    // --------------------------------------------------------------------
    await deleteProject(page, name)
  })
});