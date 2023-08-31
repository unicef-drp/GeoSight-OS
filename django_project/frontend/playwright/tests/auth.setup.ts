import {test as setup} from '@playwright/test';

const authFile = 'states/.auth/user.json';
let url = 'http://localhost:2000/';

setup('authenticate', async ({page}) => {

    await page.goto(url + 'login/');
    await page.waitForSelector('.BasicForm', {timeout: 2000});
    await page.locator('#app input[name="username"]').fill('admin');
    await page.locator('#app input[name="password"]').fill('admin');
    await page.getByRole('button', {name: 'LOG IN'}).click();
    //
    // Sometimes login flow sets cookies in the process of several redirects.
    // Wait for the final URL to ensure that the cookies are actually set.
    await page.waitForURL(url, {timeout: 2000});

    // End of authentication steps.
    await page.context().storageState({path: authFile});
});