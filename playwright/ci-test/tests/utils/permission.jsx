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
  await page.locator(`.MuiDataGrid-row[data-id="${id}"] .MuiButtonBase-root[aria-label="Change Share Configuration."] .ButtonIcon`).first().click();
  const originalPage = page
  page = await page.locator('.PermissionFormModal')
  await page.locator(`.GeneralAccess .MuiFormControl-root`).first().click();
  await originalPage.getByRole('option', { name: public_access }).click();

  // Remove unmatched one
  const usernames = await page.locator('.MuiDataGrid-cell[data-field="username"]');
  const count = await usernames.count();
  for (let i = 0; i < count; i++) {
    const text = await usernames.nth(i).textContent();
    if (text !== 'admin' && !users.includes(text)) {
      const parent = await usernames.nth(i).locator('..');
      await expect(parent.locator('.DeleteButton')).toBeVisible()
      parent.locator('.DeleteButton').click()
      await originalPage.getByRole('button', { name: 'Confirm' }).click();
    }
  }

  // ----------------------------
  // Users
  // ----------------------------
  const userPage = await originalPage.locator('.ModalDataSelector')
  await page.getByRole('button', { name: 'Share to new user(s)' }).click();
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    await userPage.getByRole('row', { name: `Select row ${user} ${user.capitalize()}` }).getByLabel('Select row').check();
  }
  await userPage.getByRole('button', { name: 'Update selection' }).click();

  // ----------------------------
  // Groups
  // ----------------------------
  await page.locator('.TabPrimary > div').nth(1).click();
  // Remove unmatched one
  const groupNames = await page.locator('.MuiDataGrid-cell[data-field="name"]');
  const groupCount = await groupNames.count();
  for (let i = 0; i < groupCount; i++) {
    const text = await groupNames.nth(i).textContent();
    if (!groups.includes(text)) {
      const parent = await groupNames.nth(i).locator('..');
      await expect(parent).toBeEditable()
      await expect(parent.locator('.DeleteButton')).toBeVisible()
      parent.locator('.DeleteButton').click()
      await originalPage.getByRole('button', { name: 'Confirm' }).click();
    }
  }

  await page.getByRole('button', { name: 'Share to new group(s)' }).click();
  const groupPage = originalPage.locator('.ModalDataSelector')
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    await groupPage.getByRole('row', { name: `Select row ${group}` }).getByLabel('Select row').check();
  }
  await groupPage.getByRole('button', { name: 'Update selection' }).click();
  await page.getByRole('button', { name: 'Apply Changes' }).click();
}

export async function checkPermission(page, id, {
  public_access,
  users,
  groups
}) {
  console.log({
    public_access,
    users,
    groups
  })
  await page.locator(`.MuiDataGrid-row[data-id="${id}"] .MuiButtonBase-root[aria-label="Change Share Configuration."] .ButtonIcon`).first().click();
  page = await page.locator('.PermissionFormModal')
  await expect(page.locator(`.GeneralAccess .MuiFormControl-root`).first()).toContainText(public_access);
  await expect(page.locator('.TabPrimary').getByText(`User Access (${users.length + 1})`)).toBeVisible();
  await expect(page.locator('.TabPrimary').getByText(`Group Access (${users.length})`)).toBeVisible();

  // Users
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    await expect(page.locator('.MuiDataGrid-row div[data-field="username"]').nth(i + 1)).toContainText(user);
  }
  // Groups
  await page.locator('.TabPrimary > div').nth(1).click();
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    await expect(page.locator('.MuiDataGrid-row div[data-field="name"]').nth(i)).toContainText(group);
  }

  await page.locator('.modal--header > .MuiButtonLike').click();
}

