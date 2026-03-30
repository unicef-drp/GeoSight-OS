import { expect, test } from '@playwright/test';

const timeout = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const _url = '/admin/context-layer/'

test.describe('Context layer cloud native data', () => {
  test('Context layer cloud native data', async ({ page }) => {
    await page.goto("/admin/context-layer/2/edit#Data");
    await page.locator('.TabPrimary').getByText('Data', { exact: true }).click();
    await expect(page.locator('.Data .AdminTable .MuiTablePagination-displayedRows')).toHaveText("1–25 of 47")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(1)).toHaveText("id")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(2)).toHaveText("Osm id")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(3)).toHaveText("Osm type")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(4)).toHaveText("Completene")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(5)).toHaveText("Amenity")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(6)).toHaveText("Healthcare")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(7)).toHaveText("Name")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(8)).toHaveText("Operator")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(9)).toHaveText("Source")

    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toHaveText("4997437522")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(2)).toHaveText("4997437522")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(3)).toHaveText("node")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(4)).toHaveText("12.5")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(5)).toHaveText("hospital")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(6)).toHaveText("hospital")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(7)).toHaveText("p/p GARGAAR HOSPITAL")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(8)).toHaveText("")
  })
  test('Context layer related table data', async ({ page }) => {
    await page.goto("/admin/context-layer/3/edit#Data");
    await page.locator('.TabPrimary').getByText('Data', { exact: true }).click();
    await expect(page.locator('.Data .AdminTable .MuiTablePagination-displayedRows')).toHaveText("1–25 of 296")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(1)).toHaveText("id")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(2)).toHaveText("Date")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(3)).toHaveText("Name")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(4)).toHaveText("Pcode")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(5)).toHaveText("Ucode")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(6)).toHaveText("Sector")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(7)).toHaveText("Partner")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(8)).toHaveText("Latitude")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(9)).toHaveText("Longitude")
    await expect(page.locator('.MuiDataGrid-columnHeader').nth(10)).toHaveText("NoBeneficiaries")

    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(1)).toHaveText("45839")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(2)).toHaveText("2010-01-01T00:00:00.000Z")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(3)).toHaveText("Baki")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(4)).toHaveText("SO1102")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(5)).toHaveText("SOM_0001_0001_V1")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(6)).toHaveText("")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(7)).toHaveText("Partner A")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(8)).toHaveText("10.224881735")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(9)).toHaveText("43.53291619493366")
    await expect(page.locator('.MuiDataGrid-row').nth(0).locator('.MuiDataGrid-cell').nth(10)).toHaveText("371")
  })
})