/**
 * This is for toolbars behaviours test
 * Just for visibility, and enable disabled
 */
import { expect, test } from '@playwright/test';
import {
  deleteProject,
  editProject,
  saveAsProject,
  saveProject,
  viewProject
} from "../../utils/project";
import { TEXT } from "../../utils/map";

const sideBySideText = TEXT.TOOLS_PROJECT.sideBySide;
const compareLayerText = TEXT.TOOLS_PROJECT.compareLayer;
const compositeLayerText = TEXT.TOOLS_PROJECT.compositeLayer;
const compareTitle = TEXT.TOOLS_TOGGLER.compareLayer;
const sideBySideTitle = TEXT.TOOLS_TOGGLER.sideBySide;
const compositeLayerTitle = TEXT.TOOLS_TOGGLER.compositeLayer;

test.describe('Toolbars behaviours', () => {
  test('Toolbars visibility behaviours', async ({ page }, testInfo) => {
    // --------------------------------------------------------------------
    // Create project
    // --------------------------------------------------------------------
    const name = 'Demo GeoSight Project toolbars behaviours'
    await deleteProject(page, name)
    await saveAsProject(page, 'Demo GeoSight Project', name)

    await page.locator('.TabPrimary').getByText('Tools').click();
    await expect(page.getByRole('listitem').filter({ hasText: sideBySideText })).toBeVisible();
    await expect(page
      .getByRole('listitem')
      .filter({ hasText: sideBySideText })
      .locator('.VisibilityIconOn')
      .first()
    ).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: compareLayerText })).toBeVisible();
    await expect(page
      .getByRole('listitem')
      .filter({ hasText: compareLayerText })
      .locator('.VisibilityIconOn')
      .first()
    ).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: compositeLayerText })).toBeVisible();
    await expect(page
      .getByRole('listitem')
      .filter({ hasText: compositeLayerText })
      .locator('.VisibilityIconOff')
      .first()
    ).toBeVisible();
    await page.getByRole('listitem').filter({ hasText: compositeLayerText }).getByRole('img').click();
    await expect(page
      .getByRole('listitem')
      .filter({ hasText: compositeLayerText })
      .locator('.VisibilityIconOn')
      .first()
    ).toBeVisible();
    await saveProject(page);

    const checkToolVisibilityToggle = async (itemText: string, offTitle: string) => {
      await editProject(page, name);
      await page.locator('.TabPrimary').getByText('Tools').click();
      await page.getByRole('listitem').filter({ hasText: itemText }).getByRole('img').click();
      await saveProject(page);
      await viewProject(page, name, true);
      await expect(page.getByTitle(offTitle)).toBeHidden();
      await editProject(page, name);
      await page.locator('.TabPrimary').getByText('Tools').click();
      await page.getByRole('listitem').filter({ hasText: itemText }).getByRole('img').click();
      await saveProject(page);
      await viewProject(page, name, true);
      await expect(page.getByTitle(offTitle)).toBeVisible();
    };

    await checkToolVisibilityToggle(compareLayerText, compareTitle.Off);
    await checkToolVisibilityToggle(sideBySideText, sideBySideTitle.Off);
    await checkToolVisibilityToggle(compositeLayerText, compositeLayerTitle.Off);


    // --------------------------------------------------------------------
    // Delete default project
    // --------------------------------------------------------------------
    await deleteProject(page, name)
    await saveAsProject(page, 'Demo GeoSight Project', name)

    // --------------------------------------------------------------------
    // Delete project
    // --------------------------------------------------------------------
    await deleteProject(page, name)
  })
  test('Toolbars click behaviours', async ({ page }) => {
    const name = 'Demo GeoSight Project toolbars click behaviours'
    await deleteProject(page, name)
    await saveAsProject(page, 'Demo GeoSight Project', name)

    // Enable composite layer visibility so it appears in the view toolbar
    await page.locator('.TabPrimary').getByText('Tools').click();
    await page.getByRole('listitem').filter({ hasText: compositeLayerText }).getByRole('img').click();

    await saveProject(page);
    await viewProject(page, name, true);

    // All modes off initially
    await expect(page.getByTitle(compareTitle.Off)).toBeVisible();
    await expect(page.getByTitle(sideBySideTitle.Off)).toBeVisible();
    await expect(page.getByTitle(compositeLayerTitle.Off)).toBeVisible();

    // Activate compare → sideBySide and composite must be off
    await page.getByTitle(compareTitle.Off).click();
    await expect(page.getByTitle(compareTitle.On)).toBeVisible();
    await expect(page.getByTitle(sideBySideTitle.Off)).toBeVisible();
    await expect(page.getByTitle(compositeLayerTitle.Off)).toBeVisible();

    // Activate sideBySide → compare and composite must be off
    await page.getByTitle(sideBySideTitle.Off).click();
    await expect(page.getByTitle(sideBySideTitle.On)).toBeVisible();
    await expect(page.getByTitle(compareTitle.Off)).toBeVisible();
    await expect(page.getByTitle(compositeLayerTitle.Off)).toBeVisible();

    // Activate composite → compare and sideBySide must be off
    await page.getByTitle(compositeLayerTitle.Off).click();
    await expect(page.getByTitle(compositeLayerTitle.On)).toBeVisible();
    await expect(page.getByTitle(compareTitle.Off)).toBeVisible();
    await expect(page.getByTitle(sideBySideTitle.Off)).toBeVisible();

    await deleteProject(page, name)
  })
});