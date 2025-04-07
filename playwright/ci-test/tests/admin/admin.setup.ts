import { test as setup } from '@playwright/test';

const authFile = 'states/.auth/admin.json';

setup('authenticate', async ({ page }) => {

  await page.goto('login');
  await page.waitForSelector('.BasicForm', { timeout: 2000 });
  await page.locator('#app input[name="username"]').fill('admin');
  await page.locator('#app input[name="password"]').fill('admin');
  await page.getByRole('button', { name: 'LOG IN' }).click();
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('', { timeout: 2000 });

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});