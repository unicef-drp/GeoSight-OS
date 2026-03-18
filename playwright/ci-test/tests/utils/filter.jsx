export async function filterPermission(page, input) {
  await page.locator('a[title="Filter"]').click();
  await page.locator('.PermissionFilter').click();
  await page.getByRole('option', { name: input, exact: true }).click();
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.locator('#simple-popover .MuiBackdrop-root').click();
}

export async function filterList(page) {
  await filterPermission(page, 'List')
}

export async function filterRead(page) {
  await filterPermission(page, 'Read')
}

export async function filterReadData(page) {
  await filterPermission(page, 'Read Data')
}

export async function filterWrite(page) {
  await filterPermission(page, 'Write')
}

export async function filterWriteData(page) {
  await filterPermission(page, 'Write Data')
}

export async function filterShare(page) {
  await filterPermission(page, 'Share')
}

export async function filterDelete(page) {
  await filterPermission(page, 'Delete')
}