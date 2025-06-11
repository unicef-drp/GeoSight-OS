import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/user-and-group/#Users'

test.describe('Users list admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  const duplicate = async (page, index) => {
    await page.goto('/django-admin/auth/user/add/');
    await page.locator('#id_username').fill(`Generated_A${index}`);
    await page.locator('#id_password1').fill('test_temporary');
    await page.locator('#id_password2').fill(`test_temporary`);
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.getByRole('button', { name: 'Save', exact: true }).click();
  }

  const testFunction = async (originalPage, page) => {
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–18 of 18');

    // Check search
    await page.getByPlaceholder('Search User').fill('A2');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    // Search by new object
    await page.getByPlaceholder('Search User').fill('Generated_A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–14 of 14');


    // Check pagination();
    await page.getByPlaceholder('Search User').fill('Generated_A');
    await page.getByLabel('25').click();
    await originalPage.getByRole('option', {
      name: '10',
      exact: true
    }).click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Generated_A0');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–10 of 14');
    await page.getByLabel('Go to next page').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Generated_A6');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('11–14 of 14');

    // Orders
    await page.getByLabel('Go to previous page').click();
    await page.getByLabel('Username').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Generated_A9');
    await page.getByLabel('Username').click();
    await page.getByLabel('Username').click();
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toContainText('Generated_A0');
  }

  test('Test list functions', async ({ page }) => {
    // Create new data();
    for (let i = 0; i < 14; i++) {
      await duplicate(page, i)
    }

    // ----------------------------------
    // Check list
    // ----------------------------------
    await page.goto(_url);
    await page.reload();
    await testFunction(page, page)

    // ------------------------------------------------------
    // DELETE THE CREATED
    // ------------------------------------------------------
    // Delete per row
    await page.reload();
    await page.getByPlaceholder('Search User').fill('Generated_A');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–14 of 14');
    await page.locator('.MuiDataGrid-row').nth(0).getByTestId('MoreVertIcon').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete Generated_A0?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–13 of 13');

    // Delete all
    await page.getByLabel('Select all rows').check();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.modal--content ')).toContainText('Are you sure want to delete 13 users?');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');

    // Reload
    await page.reload();
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–4 of 4');
  });
})