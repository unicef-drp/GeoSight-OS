import { test as setup, expect } from '@playwright/test';

const authFile = '../geosight.auth.json';

setup('authenticate', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('https://staging.kartoza.com/');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'username' }).click();
  await page.getByLabel('username').fill('username');
  await page.getByRole('button', { name: 'password' }).click();
  await page.getByLabel('password').fill('password');
  await page.getByRole('button', { name: 'LOG IN' }).click();
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('https://staging.kartoza.com/');
  // Alternatively, you can wait until the page reaches a state where all cookies are set.
  await expect(page.getByRole('button', { name: 'Admin panel' })).toBeVisible();

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
