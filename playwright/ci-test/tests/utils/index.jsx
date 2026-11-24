import { expect } from "@playwright/test";

export const TIMEOUT = 2000;
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export function parseMultipartFormData(body) {
  const result = {};
  const parts = body.split('Content-Disposition: form-data;');

  for (const part of parts) {
    const nameMatch = part.match(/name="([^"]+)"/);
    if (!nameMatch) continue;

    const name = nameMatch[1];
    const value = part.split('\r\n\r\n')[1]?.split('\r\n')[0];

    if (value !== undefined) {
      result[name] = value;
    }
  }
  return result;
}
/**
 * Select all rows of an admin list.
 * A click while the list is (re)loading checks the grid's header checkbox but
 * leaves the list's selection empty ("0 items … selected", Edit disabled),
 * so wait until the list has finished loading first.
 */
export async function selectAllRows(page) {
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.AdminList .MuiDataGrid-overlay')).toHaveCount(0);
  await expect(page.locator('.AdminList .MuiDataGrid-row').first()).toBeVisible();
  await page.getByRole('checkbox', { name: 'Select all rows' }).check();
  // The list itself must have taken the selection, not only the grid
  await expect(page.locator('.AdminListHeader-Count')).not.toHaveClass(/Empty/);
}
