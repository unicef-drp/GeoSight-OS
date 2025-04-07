import { expect, test } from '@playwright/test';

// URL That we need to check
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('View project', () => {
  // A use case tests scenarios
  test('View project permission', async ({ page }) => {
    // Check initial state
    await page.goto('/project/demo-geosight-project');
    await page.getByRole('button', { name: 'Close' }).click();
    // Sample Indicator A
    await expect(page.locator('#simple-tabpanel-1').locator('.PanelInput').nth(0)).toBeEnabled();
    await expect(page.locator('#simple-tabpanel-1').locator('.PanelInput').nth(1)).toBeEnabled();
    await expect(page.locator('#simple-tabpanel-1').locator('.PanelInput').nth(2)).toBeEnabled();
    await expect(page.locator('#simple-tabpanel-1').locator('.PanelInput').nth(3)).toBeEnabled();
    await expect(page.locator('#simple-tabpanel-1').locator('.PanelInput').nth(4)).toBeDisabled();
    await expect(page.locator('#simple-tabpanel-1').locator('.PanelInput').nth(5)).toBeDisabled();
    await expect(page.locator('#simple-tabpanel-1').locator('.PanelInput').nth(6)).toBeEnabled();
    await expect(page.locator('#simple-tabpanel-1').locator('.PanelInput').nth(7)).toBeDisabled();
    await expect(page.locator('#simple-tabpanel-1').locator('.PanelInput').nth(8)).toBeDisabled();
    await expect(page.locator('#simple-tabpanel-1').locator('.PanelInput').nth(9)).toBeEnabled();

    // The info icon
    await expect(page.locator('#simple-tabpanel-1').locator('.LayerInfoIcon').nth(0)).not.toHaveClass('LayerInfoIcon InfoIcon LayerIcon Error');
    await expect(page.locator('#simple-tabpanel-1').locator('.LayerInfoIcon').nth(1)).not.toHaveClass('LayerInfoIcon InfoIcon LayerIcon Error');
    await expect(page.locator('#simple-tabpanel-1').locator('.LayerInfoIcon').nth(2)).not.toHaveClass('LayerInfoIcon InfoIcon LayerIcon Error');
    await expect(page.locator('#simple-tabpanel-1').locator('.LayerInfoIcon').nth(3)).not.toHaveClass('LayerInfoIcon InfoIcon LayerIcon Error');
    await expect(page.locator('#simple-tabpanel-1').locator('.LayerInfoIcon').nth(4)).toHaveClass('LayerInfoIcon InfoIcon LayerIcon Error');
    await expect(page.locator('#simple-tabpanel-1').locator('.LayerInfoIcon').nth(5)).toHaveClass('LayerInfoIcon InfoIcon LayerIcon Error');
    await expect(page.locator('#simple-tabpanel-1').locator('.LayerInfoIcon').nth(6)).not.toHaveClass('LayerInfoIcon InfoIcon LayerIcon Error');
    await expect(page.locator('#simple-tabpanel-1').locator('.LayerInfoIcon').nth(7)).toHaveClass('LayerInfoIcon InfoIcon LayerIcon Error');
    await expect(page.locator('#simple-tabpanel-1').locator('.LayerInfoIcon').nth(8)).toHaveClass('LayerInfoIcon InfoIcon LayerIcon Error');
    await expect(page.locator('#simple-tabpanel-1').locator('.LayerInfoIcon').nth(9)).not.toHaveClass('LayerInfoIcon InfoIcon LayerIcon Error');
  });
});