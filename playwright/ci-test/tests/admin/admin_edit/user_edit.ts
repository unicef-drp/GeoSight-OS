import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/user/admin/edit#General'

test.describe('Users edit profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  test('Test edit functions', async ({ page }) => {
    await page.goto('/admin/user/admin/edit#General')
    await expect(page.locator('.ReactSelect__input-container .ReactSelect__input')).toBeEnabled();

    // Create API Key
    await page.goto(_url)
    await page.getByText('API Key', { exact: true }).click();
    await page.getByRole('textbox').fill('test');
    await page.getByRole('button', { name: 'Generate API Key' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Platform : test')).toBeVisible();
    await page.getByRole('button', { name: 'Delete Api Key' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Platform : test')).toBeHidden();
  });
})