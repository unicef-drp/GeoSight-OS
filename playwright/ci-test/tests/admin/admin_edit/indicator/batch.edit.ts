import { expect, test } from '@playwright/test';
import { checkPermission, editPermission } from "../../../utils/permission";
import { BASE_URL } from "../../../variables";

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = `${BASE_URL}/admin/indicators/`
const description = 'This is test';
const defaultPermission = {
  318: {
    public_access: 'Read',
    users: ['contributor', 'creator'],
    groups: ['Group 1', 'Group 2']
  },
  319: {
    public_access: 'Read',
    users: ['contributor', 'creator'],
    groups: ['Group 1', 'Group 2']
  },
  362: {
    public_access: 'None', users: ['creator'], groups: ['Group 2']
  },
  370: {
    public_access: 'None', users: ['creator'], groups: ['Group 2',]
  },
}
const newPermission = {
  318: {
    public_access: 'Read',
    users: ['contributor'],
    groups: ['Group 1']
  },
  319: {
    public_access: 'Read',
    users: ['contributor'],
    groups: ['Group 1']
  },
  362: {
    public_access: 'None', users: [], groups: []
  },
  370: {
    public_access: 'None', users: [], groups: []
  },
}

const ids = [318, 319, 362, 370]
test.describe('Batch edit indicator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  // A use case tests scenarios
  test('Batch edit description indicator', async ({ page }) => {
    await delay(1000);
    await page.getByPlaceholder('Search Indicator').fill('Sample Indicator');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–4 of 4');
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.locator('span > .MuiSvgIcon-root').first().click();
    await page.locator('#Form #id_description').fill(description);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForURL(_url)
    for (let i = 0; i < ids.length; i++) {
      const _id = ids[i]
      await page.goto(`/admin/indicators/${_id}/edit`);
      await expect(page.locator('#Form #id_description').first()).toHaveValue(description);
    }
  });

  // A use case tests scenarios
  test('Batch edit permission indicator', async ({ page }) => {
    await delay(1000);
    for (let i = 0; i < ids.length; i++) {
      const _id = ids[i]
      await editPermission(page, _id, defaultPermission[_id])
      await checkPermission(page, _id, defaultPermission[_id])
    }

    // batch edit permission
    await delay(1000);
    await page.getByPlaceholder('Search Indicator').fill('Sample Indicator');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–4 of 4');
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await expect(page.locator('.AdminListHeader-Count ')).toContainText('4 items on this list are selected.');
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByText('Share').click();

    // Delete creator user
    await page.locator('label').filter({ hasText: 'Change permission' }).getByTestId('CheckBoxOutlineBlankIcon').click();
    await page.getByRole('row', { name: 'Select row creator' }).getByLabel('Delete').click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Delete group 2
    await page.locator('.PermissionForm .TabPrimary > div').nth(1).click();
    await page.getByRole('row', { name: 'Select row Group 2' }).getByLabel('Delete').click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    // Check after setup
    for (let i = 0; i < ids.length; i++) {
      const _id = ids[i]
      await checkPermission(page, _id, newPermission[_id])
    }

    // Edit the public access
    await page.getByPlaceholder('Search Indicator').fill('Sample Indicator');
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–4 of 4');
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByText('Share').click();
    await page.locator('label').filter({ hasText: 'Change permission' }).getByTestId('CheckBoxOutlineBlankIcon').click();
    await page.locator('.GeneralAccess > .MuiButtonBase-root').click();
    await page.locator(`.GeneralAccess .MuiFormControl-root`).first().click();
    await page.getByRole('option', { name: 'Read' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    // Check after setup
    for (let i = 0; i < ids.length; i++) {
      const _id = ids[i]
      await checkPermission(page, _id,
        {
          ...newPermission[_id],
          public_access: 'Read'
        }
      )
    }

    // Revert to default
    for (let i = 0; i < ids.length; i++) {
      const _id = ids[i]
      await editPermission(page, _id, defaultPermission[_id])
      await checkPermission(page, _id, defaultPermission[_id])
    }
  });
})