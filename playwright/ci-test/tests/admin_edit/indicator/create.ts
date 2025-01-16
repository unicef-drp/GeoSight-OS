import { expect, test } from '@playwright/test';

const timeout = 2000;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test.describe('Create indicator', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('');
  });

  // A use case tests scenarios
  test('Create indicator', async ({ page }) => {
    const name = `CI Indicator Sample`
    await page.waitForSelector('.Home', { timeout: timeout });
    await page.getByText('Admin panel').click();
    await page.getByRole('link', { name: 'Indicators' }).click();
    await page.getByRole('button', { name: 'Create New Indicator' }).click();

    // Check similarity
    await page.locator('#Form #id_name').fill('Sample ind B');
    await page.locator('#Form #id_description').click();
    await expect(page.locator('.Similarity table')).toBeVisible();
    await expect(page.locator('.Similarity table .SimilarityName a').nth(0)).toContainText('Sample Indicator B');
    await expect(page.locator('.Similarity table .SimilarityScore').nth(0)).toContainText('60%');
    await expect(page.locator('.Similarity table .SimilarityName a').nth(1)).toContainText('Sample Indicator A');
    await expect(page.locator('.Similarity table .SimilarityScore').nth(1)).toContainText('50%');

    // Fill correct values
    await page.locator('#Form #id_name').fill(name);
    await page.locator('#Form #id_shortcode').fill(name);
    await page.locator("#Form #id_description").fill('CI Indicator Sample Description');
    await page.locator("#Form #id_source").fill('CI Source');
    await page.locator("#Form #id_unit").fill('percent');
    await page.locator("#Form [name='min_value']").fill('0');
    await page.locator("#Form [name='max_value']").fill('100');
    await page.locator("#Form #id_group").click();
    await page.keyboard.type(name);
    await page.keyboard.press('Enter');
    await page.locator('.TabPrimary').getByText('Aggregation').click();
    await page.locator('.InputInLine', { has: page.locator("[name='aggregation_upper_level_allowed']") }).locator('.MuiCheckbox-root').click();


    await page.getByText('Save').isEnabled();
    await page.getByText('Save').click();

    // CHECK VALUES
    await expect(page.locator('#Form #id_name')).toHaveValue(name);
    await expect(page.locator('#Form #id_shortcode')).toHaveValue(name);
    await expect(page.locator('#Form #id_description')).toHaveValue('CI Indicator Sample Description');
    await expect(page.locator('#Form #id_source')).toHaveValue('CI Source');
    await expect(page.locator('#Form #id_unit')).toHaveValue('percent');
    await expect(page.locator("#Form [name='min_value']")).toHaveValue('0');
    await expect(page.locator("#Form [name='max_value']")).toHaveValue('100');
    await expect(page.locator("#Form [name='group']")).toHaveValue(name);
    await page.locator('.TabPrimary').getByText('Aggregation').click();
    await expect(page.locator("[name='aggregation_upper_level_allowed']")).toHaveValue('true');

    // TEST SAVE AS
    await page.getByText('Save As').isEnabled();
    await page.getByText('Save As').click();
    await expect(page.locator("#Form").getByText(`The shortcode has been used by ${name}`)).toBeVisible();

    await page.getByText(`${name}/${name} (${name})`).click();

    // Wait 2 second
    await delay(2000);

    await page.locator('.MoreActionIcon').click();
    await page.locator('.MuiMenu-root .MuiButtonBase-root .error').click();
    await expect(page.locator('.modal--content ')).toContainText(`Are you sure you want to delete : ${name}?`);
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Create New Indicator')).toBeVisible();
    await expect(page.getByText(name)).toBeHidden();
  });
})