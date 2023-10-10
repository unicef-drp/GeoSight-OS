import {expect, test} from '@playwright/test';

// URL That we need to check
let url = 'http://localhost:8080';
const timeout = 2000;

test.describe('Create project', () => {
    test.beforeEach(async ({page}) => {
        // Go to the starting url before each test.
        await page.goto(url);
    });

    // A use case tests scenarios
    test('Create', async ({page}) => {
        await page.waitForSelector('.Home', {timeout: timeout});
        await page.getByText('Admin panel').click();
        await expect(page.getByText('Add New Project')).toBeVisible();
        await page.getByText('Add New Project').click();
        await expect(page.getByText('Save')).toBeVisible();
        await page.getByPlaceholder('Select reference dataset ').click();
        await page.locator(".ModalDataSelector .MuiDataGrid-row").click();
        await page.locator("#SummaryName").fill('Test Project');
        await page.locator("#SummaryCategory").click();
        await page.keyboard.type('Test');
        await page.keyboard.press('Enter');
        await page.getByText('Save').isEnabled();
        await page.getByText('Save').click();

        // Wait submitted
        page.on('dialog', async dialog => {
            // Verify Dialog Message
            expect(dialog.message()).toContain('Are you sure you want to delete : Test Project?');

            //Click on OK Button
            await dialog.accept();
        });

        await page.locator('.MoreActionIcon').click();
        await page.locator('.MuiMenu-root .MuiButtonBase-root .error').click();
        await expect(page.getByText('Add New Project')).toBeVisible();
        await expect(page.getByText('No results found')).toBeVisible();
    })
});