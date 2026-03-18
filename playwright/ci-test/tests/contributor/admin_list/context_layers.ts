import { expect, test } from '@playwright/test';
import {
  filterDelete,
  filterList,
  filterRead,
  filterShare,
  filterWrite
} from "../../utils/filter";

const _url = '/admin/context-layer/'
test.describe('Context layer list admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  test('Test filter functions', async ({ page }) => {
    // Check list
    await page.goto(_url);

    // Default
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');

    await filterList(page);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');
    await filterRead(page);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');
    await filterWrite(page);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');
    await filterShare(page);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');
    await filterDelete(page);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');

    // Check list on the prject
    await page.goto('/admin/project/demo-geosight-project/edit');
    await page.getByText('Context Layers (2)').click();
    await page.getByRole('button', { name: 'Add Context Layer' }).click();

    // Default
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');

    await filterList(page);
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');
    await filterRead(page);
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');
    await filterWrite(page);
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');
    await filterShare(page);
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');
    await filterDelete(page);
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');
  });
})