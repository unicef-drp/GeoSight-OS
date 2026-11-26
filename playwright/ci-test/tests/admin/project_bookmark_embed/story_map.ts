import { expect, test } from '@playwright/test';
import {
  deleteProject,
  editProject,
  saveAsProject,
  saveProject,
  viewProject
} from "../../utils/project";
import { createBookmark, layer1, layer2 } from '../../utils/bookmark';

const PROJECT = 'Story Map Test';
const BOOKMARK_A = 'Story page A';
const BOOKMARK_B = 'Story page B';

/** Add a story page in the admin Story Map tab. */
const addStoryPage = async (page, title: string, bookmark: string) => {
  await page.getByRole('button', { name: 'Add Story Page' }).click();
  const modal = page.locator('.StoryMapModal');
  await modal.getByLabel('Title').fill(title);
  await modal.locator('select').selectOption({ label: bookmark });
  await modal.getByRole('button', { name: 'Apply' }).click();
  await expect(modal).toBeHidden();
}

/** Open the Story Map tab of the admin form. */
const openStoryMapTab = async (page) => {
  await page.locator('.DashboardFormHeader').getByText('Story Map').click();
}

test.describe.serial('Story Map', () => {
  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await deleteProject(page, PROJECT);
    await page.close();
  });

  test('Configure story pages', async ({ page }) => {
    await saveAsProject(page, 'Demo GeoSight Project', PROJECT);

    // Two bookmarks: indicator layer A, then indicator layer B.
    await viewProject(page, PROJECT, true);
    await expect(page.getByLabel(layer1)).toBeChecked();
    await createBookmark(page, BOOKMARK_A);
    await page.getByLabel(layer2).click();
    await expect(page.getByLabel(layer2)).toBeChecked();
    await createBookmark(page, BOOKMARK_B);

    // Story Map tab: enable it and add two pages.
    await editProject(page, PROJECT);
    await openStoryMapTab(page);
    await page.getByLabel('Show the Story Map in the project').check();
    await addStoryPage(page, 'Page one', BOOKMARK_A);
    await addStoryPage(page, 'Page two', BOOKMARK_B);
    const rows = page.locator('.StoryMap .OtherActionIndicator');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toHaveText(`Bookmark: ${BOOKMARK_A}`);
    await expect(rows.nth(1)).toHaveText(`Bookmark: ${BOOKMARK_B}`);
    await saveProject(page);

    // Both pages are kept after a reload.
    await editProject(page, PROJECT);
    await expect(
      page.locator('.DashboardFormHeader').getByText('Story Map (2)')
    ).toBeVisible();
    await openStoryMapTab(page);
    await expect(
      page.getByLabel('Show the Story Map in the project')
    ).toBeChecked();
    await expect(page.locator('.StoryMap .OtherActionIndicator')).toHaveCount(2);
  });

  test('Play the story', async ({ page }) => {
    await viewProject(page, PROJECT, true);
    await expect(page.getByRole('tab', { name: 'Layers', exact: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Filters', exact: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Story', exact: true })).toBeVisible();

    // The toolbar button opens the Story tab on the first page.
    await page.getByTestId('story-map-toolbar').getByTitle('Story Map').click();
    const pages = page.getByTestId('story-map-page');
    await expect(pages).toHaveCount(2);
    await expect(pages.nth(0)).toContainText('Page one');
    await expect(pages.nth(1)).toContainText('Page two');
    await expect(page.getByTestId('story-map-counter')).toHaveText('1 / 2');
    await expect(pages.nth(0)).toHaveAttribute('aria-current', 'step');
    await expect(page.getByLabel(layer1)).toBeChecked();

    // Next page: bookmark B.
    await page.getByTestId('story-map-next').click();
    await expect(page.getByTestId('story-map-counter')).toHaveText('2 / 2');
    await expect(pages.nth(1)).toHaveAttribute('aria-current', 'step');
    await expect(page.getByLabel(layer2)).toBeChecked();

    // Click a page: bookmark A again.
    await pages.nth(0).click();
    await expect(page.getByTestId('story-map-counter')).toHaveText('1 / 2');
    await expect(page.getByLabel(layer1)).toBeChecked();

    // Previous wraps to the last page.
    await page.getByTestId('story-map-previous').click();
    await expect(page.getByTestId('story-map-counter')).toHaveText('2 / 2');
    await expect(page.getByLabel(layer2)).toBeChecked();

    // The toolbar button again: back to the Layers tab.
    await page.getByTestId('story-map-toolbar').getByTitle('Story Map').click();
    await expect(
      page.getByRole('tab', { name: 'Layers', exact: true })
    ).toHaveAttribute('aria-selected', 'true');
  });

  test('Hidden pages are not played', async ({ page }) => {
    await editProject(page, PROJECT);
    await openStoryMapTab(page);
    // Pages are listed in order: the second edit button is page two.
    await page.locator('.StoryMap [data-testid="EditIcon"]').nth(1).click();
    const modal = page.locator('.StoryMapModal');
    await expect(modal.getByLabel('Title')).toHaveValue('Page two');
    await modal.getByLabel('Visible in the story').uncheck();
    await modal.getByRole('button', { name: 'Apply' }).click();
    await saveProject(page);

    await viewProject(page, PROJECT, true);
    await page.getByTestId('story-map-toolbar').getByTitle('Story Map').click();
    await expect(page.getByTestId('story-map-page')).toHaveCount(1);
    await expect(page.getByTestId('story-map-counter')).toHaveText('1 / 1');
  });

  test('Story tab on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await viewProject(page, PROJECT, true);
    const storyItem = page.locator('.MobileBottomNav [data-item="Story"]');
    await expect(storyItem).toBeVisible();
    await storyItem.click();
    await expect(page.getByTestId('story-map-page').first()).toBeVisible();
    await expect(page.getByTestId('story-map-page').first()).toContainText(
      'Page one'
    );
  });
});
