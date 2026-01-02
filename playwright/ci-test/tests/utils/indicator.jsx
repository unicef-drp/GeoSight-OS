import { expect } from "@playwright/test";


export async function createIndicator(page, name) {
  await page.goto('/django-admin/geosight_data/indicator/add/');
  await page.locator('#id_name').fill(name);
  await page.getByLabel('Aggregation upper level allowed').check();
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

export async function deleteIndicatorByName(page, name) {
  await page.goto("/admin/indicators/");
  await page.getByRole('cell', { name: name }).click();
  await page.getByRole('menuitem', { name: 'More' }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
}