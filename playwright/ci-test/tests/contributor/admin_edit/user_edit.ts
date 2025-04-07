import { expect, test } from '@playwright/test';

const _url = '/admin/user/contributor/edit#General'

test.describe('Users edit profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });


  // it is failed
  test('Test edit functions for non admin', async ({ page }) => {
    await page.goto(_url)
    // Check data
    await page.getByRole('link', { name: 'Profile' }).click();
    await page.locator('#Form #id_first_name').fill('Name');
    await page.locator('#Form #id_last_name').fill('Last');
    await page.locator('#Form #id_email').fill('contributor@gmail.com');
    await expect(page.locator('.ReactSelect__input-container .ReactSelect__input')).toBeDisabled();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.goto(_url)
    await expect(page.locator('#Form #id_first_name')).toHaveValue('Name');
    await expect(page.locator('#Form #id_last_name')).toHaveValue('Last');
    await expect(page.locator('#Form #id_email')).toHaveValue('contributor@gmail.com');

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