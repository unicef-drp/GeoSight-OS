import { BASE_URL } from "../variables";
import { expect } from "@playwright/test";

function nameToSlug(name) {
  return name.replaceAll(' ', '-').toLowerCase()
}

export async function saveAsProject(page, inputName, outputName) {
  await page.goto(`/admin/project/${nameToSlug(inputName)}/edit`);
  await page.waitForURL(`${BASE_URL}/admin/project/${nameToSlug(inputName)}/edit`);
  await page.getByRole('button', { name: 'Save as' }).click();
  await page.getByRole('textbox', { name: 'Example: Afghanistan Risk' }).fill(outputName);
  await page.getByRole('button', { name: 'Create' }).click();
  await page.waitForURL(`${BASE_URL}/admin/project/${nameToSlug(outputName)}/edit`);
}

export async function viewProject(page, name) {
  await page.goto(`/project/${nameToSlug(name)}`);
}


export async function editProject(page, name) {
  await page.goto(`/admin/project/${nameToSlug(name)}/edit`);
  await page.waitForURL(`${BASE_URL}/admin/project/demo-geosight-project/edit`);
  await expect(page.locator('div').getByText('Fetching Project Data...')).toBeHidden();
}


export async function deleteProject(page, name) {
  await page.goto(`/admin/project/${nameToSlug(name)}/edit`);
  await page.locator('.MoreActionIcon').click();
  await page.locator('.MuiMenu-root .MuiButtonBase-root .error').click();
  await expect(page.locator('.modal--content ')).toContainText(`Are you sure want to delete ${name}?`);
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForURL(`${BASE_URL}/admin/project/`);
  await expect(page.getByText('Create New Project')).toBeVisible();
  await expect(page.getByText(name)).toBeHidden();
}