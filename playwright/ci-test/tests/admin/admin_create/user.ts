import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/user-and-group/#Users'

test.describe('Users list admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  test('Test list functions', async ({ page }) => {
    // ----------------------------------
    // Check list
    // ----------------------------------
    await page.goto("en-us/admin/user/create");
    const username = 'user_test'

    await page.locator('#Form #id_first_name').fill('user');
    await page.locator('#Form #id_last_name').fill('test');
    await page.locator('#Form input[name="username"]').fill(username);
    await page.locator('input[type="password"]').fill(username);
    await page.locator('.ReactSelect__input-container').click();
    await page.getByRole('option', { name: 'Contributor' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.locator('.AdminContentHeader-Left')).toContainText('Users');
    await expect(page.locator('.MuiDataGrid-cell').getByText(username)).toBeVisible();

    await page.locator('.SideNavigationFooter .NavbarAccount').click();
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.getByRole('button', { name: 'Login' }).click();
    await page.locator('#app input[name="username"]').fill(username);
    await page.locator('#app input[name="password"]').fill(username);

    await page.getByText('Welcome to GeoSight Username').click();
    await page.getByRole('button', { name: 'LOG IN' }).click();
    await page.getByText('u', { exact: true }).click();
    await expect(page.getByRole('link', { name: username })).toBeVisible();

    // Change password
    await page.getByRole('link', { name: 'Profile' }).click();
    await page.getByRole('button', { name: 'Change Password' }).click();
    await page.getByRole('textbox').first().fill(username);
    await page.getByRole('textbox').nth(1).fill('new password');
    await page.getByRole('textbox').nth(2).fill('new password');
    await page.getByRole('button', { name: 'Change Password' }).click();

    // Re-login with new password
    await expect(page.getByText('Password changed successfully.')).toBeVisible()
    await page.locator('.MuiAlert-action').click()
    await page.locator('.SideNavigationFooter .NavbarAccount').click();
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.getByRole('button', { name: 'Login' }).click();
    await page.locator('#app input[name="username"]').fill(username);
    await page.locator('#app input[name="password"]').fill('new password');
    await page.getByText('Welcome to GeoSight Username').click();
    await page.getByRole('button', { name: 'LOG IN' }).click();
    await page.getByText('u', { exact: true }).click();
    await expect(page.getByRole('link', { name: username })).toBeVisible();

    // Delete user
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.getByRole('button', { name: 'Login' }).click();
    await page.locator('#app input[name="username"]').fill('admin');
    await page.locator('#app input[name="password"]').fill('admin');
    await page.getByRole('button', { name: 'LOG IN' }).click();
    await page.getByRole('button', { name: 'Admin panel' }).click();
    await page.getByRole('link', { name: 'Users and groups' }).click();
    await page.getByRole('link', { name: username }).click();
    await page.getByRole('menuitem', { name: 'More' }).click();
    await page.getByText('Delete').click();
    await page.getByRole('textbox').fill(username);
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Check it
    await expect(page.locator('.AdminContentHeader-Left')).toContainText('Users');
    await expect(page.locator('.MuiDataGrid-cell').getByText(username)).toBeHidden();

    await expect(page.locator('.MuiAlert-message')).toContainText('User deleted successfullyssss.');
  });
})