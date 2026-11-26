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
    await page.getByLabel('Presentation mode (full-screen story)').check();
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
    await expect(
      page.getByLabel('Presentation mode (full-screen story)')
    ).toBeChecked();
    const savedRows = page.locator('.StoryMap .OtherActionIndicator');
    await expect(savedRows).toHaveCount(2);
    await expect(savedRows.nth(0)).toHaveText(`Bookmark: ${BOOKMARK_A}`);
    await expect(savedRows.nth(1)).toHaveText(`Bookmark: ${BOOKMARK_B}`);

    // Editing a page keeps its bookmark (also after typing a description).
    await page.locator('.StoryMap [data-testid="EditIcon"]').nth(0).click();
    const modal = page.locator('.StoryMapModal');
    await expect(modal.locator('select')).toHaveValue(/\d+/);
    await modal.locator('[contenteditable="true"]').click();
    await page.keyboard.type('First page of the story.');
    await modal.getByRole('button', { name: 'Apply' }).click();
    await expect(savedRows.nth(0)).toHaveText(`Bookmark: ${BOOKMARK_A}`);
    await saveProject(page);
    await editProject(page, PROJECT);
    await openStoryMapTab(page);
    await expect(savedRows.nth(0)).toHaveText(`Bookmark: ${BOOKMARK_A}`);
    await expect(savedRows.nth(1)).toHaveText(`Bookmark: ${BOOKMARK_B}`);
  });

  test('Play the story', async ({ page }) => {
    await viewProject(page, PROJECT, true);
    await expect(page.getByRole('tab', { name: 'Layers', exact: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Filters', exact: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Story', exact: true })).toBeVisible();

    // The Story tab opens on the first page.
    await page.getByRole('tab', { name: 'Story', exact: true }).click();
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

    // Only the current page is open; a page can be opened by hand, and the
    // next page change closes it again.
    const descriptions = page.getByTestId('story-map-page-description');
    await expect(descriptions).toHaveCount(0);
    await pages.nth(0).getByTestId('story-map-page-toggle').click();
    await expect(descriptions).toHaveCount(1);
    await expect(descriptions.first()).toContainText('First page of the story.');
    await expect(page.getByTestId('story-map-counter')).toHaveText('2 / 2');
    await page.getByTestId('story-map-next').click();
    await expect(page.getByTestId('story-map-counter')).toHaveText('1 / 2');
    await expect(descriptions).toHaveCount(1);
    await expect(pages.nth(0)).toHaveClass(/Expanded/);
    await expect(pages.nth(1)).not.toHaveClass(/Expanded/);

    // Settings: time per page.
    await page.getByTestId('story-map-settings-button').click();
    await page.getByTestId('story-map-speed').selectOption('3');
    await expect(page.getByTestId('story-map-speed')).toHaveValue('3');
    await page.getByTestId('story-map-settings-button').click();

    // Playing shows the time left; stop goes back to the first page.
    await page.getByTestId('story-map-next').click();
    await expect(page.getByTestId('story-map-counter')).toHaveText('2 / 2');
    await expect(page.getByTestId('story-map-progress')).toHaveCount(0);
    await page.getByTestId('story-map-play').click();
    await expect(page.getByTestId('story-map-progress')).toBeVisible();
    await page.getByTestId('story-map-stop').click();
    await expect(page.getByTestId('story-map-progress')).toHaveCount(0);
    await expect(page.getByTestId('story-map-counter')).toHaveText('1 / 2');
    await expect(page.getByLabel(layer1)).toBeChecked();
  });

  test('Presentation mode', async ({ page }) => {
    await viewProject(page, PROJECT, true);
    // The map toolbar button starts the presentation mode.
    await page.getByTestId('story-map-presentation-toolbar')
      .getByTitle('Presentation mode (full screen)').click();

    // Only the map, the title, the description card and the bar.
    const view = page.getByTestId('story-map-presentation-view');
    await expect(view).toBeVisible();
    await expect(page.locator('header')).toBeHidden();
    await expect(page.locator('.DashboardMap .Toolbar')).toBeHidden();
    await expect(page.locator('.dashboard__left_side')).toBeHidden();
    await expect(page.getByTestId('story-map-presentation-title')).toHaveText(
      'Page one'
    );
    await expect(page.getByTestId('story-map-presentation-card')).toContainText(
      'First page of the story.'
    );
    await expect(page.getByLabel(layer1)).toBeChecked();

    // Next, and the page picker.
    await view.getByTestId('story-map-next').click();
    await expect(page.getByTestId('story-map-presentation-title')).toHaveText(
      'Page two'
    );
    await expect(page.getByLabel(layer2)).toBeChecked();
    await view.getByTestId('story-map-page-select').selectOption({
      label: '1. Page one'
    });
    await expect(page.getByTestId('story-map-presentation-title')).toHaveText(
      'Page one'
    );

    // Legend on and off.
    const legend = page.locator('.MapLegendContent').first();
    await expect(legend).toBeVisible();
    await view.getByTestId('story-map-legend').click();
    await expect(legend).toBeHidden();
    await view.getByTestId('story-map-legend').click();
    await expect(legend).toBeVisible();

    // Arrow keys change the page.
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('story-map-presentation-title')).toHaveText(
      'Page two'
    );
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('story-map-presentation-title')).toHaveText(
      'Page one'
    );

    // With widgets: the description card sits on top of the widget column.
    const cardBox = await page.getByTestId('story-map-presentation-card').boundingBox();
    const widgetBox = await page.locator('.DashboardMiddlePanel .RightContent .widget').first().boundingBox();
    expect(Math.abs(cardBox.x - widgetBox.x)).toBeLessThan(2);
    expect(Math.abs(cardBox.width - widgetBox.width)).toBeLessThan(2);
    expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(widgetBox.y);

    // Widgets can be hidden.
    await expect(page.locator('.DashboardMiddlePanel .RightContent')).toBeVisible();
    await view.getByTestId('story-map-settings-button').click();
    await view.getByLabel('Show widgets in presentation mode').uncheck();
    await expect(page.locator('.DashboardMiddlePanel .RightContent')).toBeHidden();
    await view.getByLabel('Show widgets in presentation mode').check();

    // Exit: everything is back.
    await view.getByTestId('story-map-presentation-exit').click();
    await expect(view).toBeHidden();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('.DashboardMap .Toolbar')).toBeVisible();
  });

  test('Hidden pages are not played', async ({ page }) => {
    await editProject(page, PROJECT);
    await openStoryMapTab(page);
    // Pages are listed in order: the second edit button is page two.
    await page.locator('.StoryMap [data-testid="EditIcon"]').nth(1).click();
    const modal = page.locator('.StoryMapModal');
    await expect(modal.getByLabel('Title')).toHaveValue('Page two');

    // The "Default" bookmark (the project's default view) is kept on save.
    await modal.locator('select').selectOption({ label: 'Default' });
    await modal.getByRole('button', { name: 'Apply' }).click();
    const rows = page.locator('.StoryMap .OtherActionIndicator');
    await expect(rows.nth(1)).toHaveText('Bookmark: Default');
    await saveProject(page);
    await editProject(page, PROJECT);
    await openStoryMapTab(page);
    await expect(rows.nth(1)).toHaveText('Bookmark: Default');
    await page.locator('.StoryMap [data-testid="EditIcon"]').nth(1).click();
    await expect(modal.locator('select')).toHaveValue('0');

    await modal.getByLabel('Visible in the story').uncheck();
    await modal.getByRole('button', { name: 'Apply' }).click();
    await saveProject(page);

    await viewProject(page, PROJECT, true);
    await page.getByRole('tab', { name: 'Story', exact: true }).click();
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
    await expect(page.getByTestId('story-map-counter')).toHaveText('1 / 1');

    // Presentation mode on the phone.
    await page.getByTestId('story-map-presentation').click();
    const view = page.getByTestId('story-map-presentation-view');
    await expect(page.getByTestId('story-map-presentation-title')).toHaveText(
      'Page one'
    );
    await expect(view.getByTestId('story-map-play')).toBeVisible();
    await expect(page.locator('.MobileBottomNav')).toBeHidden();
    await view.getByTestId('story-map-presentation-exit').click();
    await expect(page.locator('.MobileBottomNav')).toBeVisible();
  });
});
