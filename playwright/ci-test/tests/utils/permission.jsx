import { expect } from "@playwright/test";


Object.defineProperty(String.prototype, 'capitalize', {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
});

export async function editPermission(page, id, {
  public_access,
  users,
  groups
}) {
  await page.locator(`.ResourceRow[data-id="${id}"] .MuiButtonBase-root[aria-label="Change Share Configuration."] .ButtonIcon`).first().click();
  await page.locator(`.GeneralAccess .MuiFormControl-root`).first().click();
  await page.getByRole('option', { name: public_access }).click();

  // Users
  await page.getByRole('button', { name: 'Share to new user(s)' }).click();
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    await page.getByRole('row', { name: `Select row ${user} ${user.capitalize()}` }).getByLabel('Select row').check();
  }
  await page.getByRole('button', { name: 'Add Users' }).click();

  // Groups
  await page.locator('.TabPrimary > div').nth(1).click();
  await page.getByRole('button', { name: 'Share to new group(s)' }).click();
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    await page.getByRole('row', { name: `Select row ${group}` }).getByLabel('Select row').check();
  }
  await page.getByRole('button', { name: 'Add Groups' }).click();
  await page.getByRole('button', { name: 'Apply Changes' }).click();
}

export async function checkPermission(page, id, {
  public_access,
  users,
  groups
}) {
  await page.locator(`.ResourceRow[data-id="${id}"] .MuiButtonBase-root[aria-label="Change Share Configuration."] .ButtonIcon`).first().click();
  await expect(page.locator(`.GeneralAccess .MuiFormControl-root`).first()).toContainText(public_access);
  await expect(page.locator('body')).toContainText(`User Access (${users.length + 1})`);
  await expect(page.locator('body')).toContainText(`Group Access (${groups.length})`);

  // Users
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    await expect(page.locator('.PermissionFormModal .MuiDataGrid-row div[data-field="username"]').nth(i + 1)).toContainText(user);
  }
  // Groups
  await page.locator('.TabPrimary > div').nth(1).click();
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    await expect(page.locator('.PermissionFormModal .MuiDataGrid-row div[data-field="name"]').nth(i)).toContainText(group);
  }

  await page.locator('.modal--header > .MuiButtonLike').click();
}

