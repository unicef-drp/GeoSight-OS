import {test} from '@playwright/test';

let url = 'http://localhost:2000';


test.describe('navigation', () => {
    test.beforeEach(async ({page}) => {
        // Go to the starting url before each test.
        await page.goto(url);
    });

    test('Page Loaded', async ({page}) => {
        await page.waitForSelector('.PageContent', {timeout: 2000});
    })
});