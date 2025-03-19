import { expect } from "@playwright/test";


export async function createIndicator(page, name) {
  await page.goto('/django-admin/geosight_data/indicator/add/');
  await page.locator('#id_name').fill(name);
  await page.getByRole('button', { name: 'Save and continue editing' }).click();
  await expect(page.getByText('History')).toBeVisible();
  return page.url();
}

export async function deleteIndicator(page, url) {
  await page.goto(url);
  await page.getByRole('link', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Yes, I’m sure' }).click();
  await expect(page.getByText('Add indicator', { exact: true })).toBeVisible();

}