import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/user-and-group/'

test.describe('Users list admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  test('Test list user functions', async ({ page }) => {
    await expect(page.getByText('1–4 of 4')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search user' }).fill('user3');
    await expect(page.getByRole('cell', { name: 'creator', exact: true })).toBeVisible();
    await expect(page.getByText('1–1 of 1')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search user' }).fill('example-2');
    await expect(page.getByRole('cell', { name: 'contributor', exact: true })).toBeVisible();
    await expect(page.getByText('1–1 of 1')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search user' }).fill('admin');
    await expect(page.getByRole('cell', { name: 'admin', exact: true })).toBeVisible();
    await expect(page.getByText('1–1 of 1')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search user' }).fill('example-');
    await expect(page.getByRole('cell', { name: 'creator', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'contributor', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'viewer', exact: true })).toBeVisible();
    await expect(page.getByText('1–3 of 3')).toBeVisible();

    // On the model
    await page.getByText('Groups', { exact: true }).click();
    await page.getByRole('button', { name: 'Create New Group' }).click();
    await page.getByRole('button', { name: 'Add users' }).click();

    await expect(page.getByText('1–4 of 4')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search user' }).fill('user3');
    await expect(page.getByRole('cell', { name: 'creator', exact: true })).toBeVisible();
    await expect(page.getByText('1–1 of 1')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search user' }).fill('example-2');
    await expect(page.getByRole('cell', { name: 'contributor', exact: true })).toBeVisible();
    await expect(page.getByText('1–1 of 1')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search user' }).fill('admin');
    await expect(page.getByRole('cell', { name: 'admin', exact: true })).toBeVisible();
    await expect(page.getByText('1–1 of 1')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search user' }).fill('example-');
    await expect(page.getByRole('cell', { name: 'creator', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'contributor', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'viewer', exact: true })).toBeVisible();
    await expect(page.getByText('1–3 of 3')).toBeVisible();

    // On share
    await page.goto('/admin/project/');
    await page.getByRole('menuitem', { name: 'Change Share Configuration' }).locator('a').click();
    await page.getByRole('button', { name: 'Share to new user(s)' }).click();

    await expect(page.locator('.ModalDataSelector').getByText('1–4 of 4')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search user' }).fill('user3');
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'creator', exact: true })).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByText('1–1 of 1')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search user' }).fill('example-2');
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'contributor', exact: true })).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByText('1–1 of 1')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search user' }).fill('admin');
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'admin', exact: true })).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByText('1–1 of 1')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search user' }).fill('example-');
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'creator', exact: true })).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'contributor', exact: true })).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByRole('cell', { name: 'viewer', exact: true })).toBeVisible();
    await expect(page.locator('.ModalDataSelector').getByText('1–3 of 3')).toBeVisible();
  });

  test('Test list group functions', async ({ page }) => {
    await page.goto('/admin/user-and-group/#Groups');
    await expect(page.getByText('1–3 of 3')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search Group' }).fill('group');
    await expect(page.getByText('1–2 of 2')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search Group' }).fill('unicef');
    await expect(page.getByText('1–1 of 1')).toBeVisible();

    // On share
    await page.goto('/admin/project/');
    await page.getByRole('menuitem', { name: 'Change Share Configuration' }).locator('a').click();
    await page.getByText('Group Access (0)').click();
    await page.getByRole('button', { name: 'Share to new group(s)' }).click();

    await expect(page.getByText('1–3 of 3')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search Group' }).fill('group');
    await expect(page.getByText('1–2 of 2')).toBeVisible();

    await page.getByRole('textbox', { name: 'Search Group' }).fill('unicef');
    await expect(page.getByText('1–1 of 1')).toBeVisible();
  })
})