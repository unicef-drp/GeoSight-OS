import { expect, test } from '@playwright/test';


test.describe('Checking header', () => {
  test('Checking header', async ({ page }) => {
    // Checking resource meta
    for (const name of ["project", "indicators", "context-layer", "basemap", "style", "related-table"]) {
      const _url = `/admin/${name}/`
      await page.goto(_url);
      const headers = await page.locator('.MuiDataGrid-columnHeader').allTextContents();
      const headerText = JSON.stringify(headers)
      await expect(headerText).toContain(`"Created At","Created By","Modified At","Modified By"`);
    }
  });
})