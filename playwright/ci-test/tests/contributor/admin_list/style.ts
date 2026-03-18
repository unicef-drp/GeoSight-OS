import { expect, test } from '@playwright/test';
import {
  filterDelete,
  filterList,
  filterRead,
  filterShare,
  filterWrite
} from "../../utils/filter";

const _url = '/admin/style/'
test.describe('Style list admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(_url);
  });

  test('Test filter functions', async ({ page }) => {
    // Check list
    await page.goto(_url);

    // Default
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');

    await filterList(page);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');
    await filterRead(page);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');
    await filterWrite(page);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');
    await filterShare(page);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');
    await filterDelete(page);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');
  });
})