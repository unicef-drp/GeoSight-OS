import { expect, test } from '@playwright/test';
import {
  filterDelete,
  filterList,
  filterRead,
  filterReadData,
  filterShare,
  filterWrite,
  filterWriteData
} from "../../utils/filter";

const _url = '/admin/indicators/'
test.describe('Indicator list admin', () => {
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
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');
    await filterReadData(page);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');
    await filterWrite(page);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');
    await filterWriteData(page);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');
    await filterShare(page);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');
    await filterDelete(page);
    await expect(page.locator('.MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');

    // Check list on the prject
    await page.goto('/admin/project/demo-geosight-project/edit');
    await page.getByText('Indicators (5)').click();
    await page.getByRole('button', { name: 'Add Indicator' }).click();

    // Default
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');

    await filterList(page);
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');
    await filterRead(page);
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');
    await filterReadData(page);
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('1–3 of 3');
    await filterWrite(page);
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('1–2 of 2');
    await filterWriteData(page);
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('1–1 of 1');
    await filterShare(page);
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');
    await filterDelete(page);
    await expect(page.locator('.ModalDataSelector .MuiTablePagination-displayedRows').first()).toContainText('0–0 of 0');
  });
})