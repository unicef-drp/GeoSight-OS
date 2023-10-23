import {expect, test} from '@playwright/test';

// URL That we need to check
let url = 'http://localhost:2000';
const timeout = 2000;

test.describe('Create project', () => {
    test.beforeEach(async ({page}) => {
        // Go to the starting url before each test.
        await page.goto(url);
    });

    // A use case tests scenarios
    test('Create with default config', async ({page}) => {
        await page.waitForSelector('.Home', {timeout: timeout});
        await page.getByText('Admin panel').click();
        await expect(page.getByText('Add New Project')).toBeVisible();
        await page.getByText('Add New Project').click();
        await expect(page.getByText('Save')).toBeVisible();
        await page.locator(".ReferenceDatasetSection input").click();
        await page.locator(".ModalDataSelector .MuiDataGrid-row").click();
        await page.locator("#SummaryName").fill('Test Project Default');
        await page.locator("#SummaryCategory").click();
        await page.keyboard.type('Test');
        await page.keyboard.press('Enter');
        await page.getByText('Save').isEnabled();
        await page.getByText('Save').click();

        // Wait submitted
        page.on('dialog', async dialog => {
            // Verify Dialog Message
            expect(dialog.message()).toContain('Are you sure you want to delete : Test Project Default?');

            //Click on OK Button
            await dialog.accept();
        });

        await page.locator('.MoreActionIcon').click();
        await page.locator('.MuiMenu-root .MuiButtonBase-root .error').click();
        await expect(page.getByText('Add New Project')).toBeVisible();
        await expect(page.getByText('Test Project Default')).toBeHidden();
    });

    // A use case tests scenarios
    test('Create with override config', async ({page}) => {
        // --------------------------------------------------------------
        // CREATE PROJECT WITH OVERRIDE CONFIG
        // --------------------------------------------------------------
        await page.waitForSelector('.Home', {timeout: timeout});
        await page.getByText('Admin panel').click();
        await expect(page.getByText('Add New Project')).toBeVisible();
        await page.getByText('Add New Project').click();
        await expect(page.getByText('Save')).toBeVisible();
        await page.locator(".ReferenceDatasetSection input").click();
        await page.locator(".ModalDataSelector .MuiDataGrid-row").click();
        await page.locator("#SummaryName").fill('Test Project Override Config');
        await page.locator("#SummaryCategory").click();
        await page.keyboard.type('Test');
        await page.keyboard.press('Enter');
        await page.getByText("Fit to current indicator range").click()
        await page.getByText("Show last known value in range").click()
        await page.locator("#default_interval > .ReactSelect__control > .ReactSelect__value-container > .ReactSelect__input-container").click()
        await page.getByText("Yearly").click()
        await page.getByText('Save').isEnabled();
        await page.getByText('Save').click();

        // Wait submitted
        page.on('dialog', async dialog => {
            // Verify Dialog Message
            expect(dialog.message()).toContain('Are you sure you want to delete : Test Project Override Config?');

            //Click on OK Button
            await dialog.accept();
        });

        // Check default time mode
        await expect(page.getByText('Yearly')).toBeVisible();
        expect(await page.locator("#fit_to_current_indicator_range").isChecked()).toBeTruthy()
        expect(await page.locator("#show_last_known_value_in_range").isChecked()).toBeFalsy()

        await page.locator('.MoreActionIcon').click();
        await page.locator('.MuiMenu-root .MuiButtonBase-root .error').click();
        await expect(page.getByText('Add New Project')).toBeVisible();
        await expect(page.getByText('Test Project Override Config')).toBeHidden()
    });
});