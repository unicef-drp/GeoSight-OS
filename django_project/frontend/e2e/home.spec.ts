import {test} from '@playwright/test';

// URL That we need to check
let url = 'http://localhost:2000';


test.describe('navigation', () => {
    test.beforeEach(async ({page}) => {
        // Go to the starting url before each test.
        await page.goto(url);
    });

    // A use case tests scenarios
    test('Page Loaded', async ({page}) => {
        await page.waitForSelector('.Home', {timeout: 2000});
    })
});