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
 * The header checkbox only selects the rows that are loaded, so wait for them first.
 */
export async function selectAllRows(page) {
  await expect(page.locator('.MuiDataGrid-row').first()).toBeVisible();
  await page.getByRole('checkbox', { name: 'Select all rows' }).check();
}
