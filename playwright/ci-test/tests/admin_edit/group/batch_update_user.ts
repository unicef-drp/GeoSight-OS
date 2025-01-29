import { expect, test } from '@playwright/test';
import * as path from 'path';

test.describe('Batch update user', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('');
  });

  // A use case tests scenarios
  test('Batch update user', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin panel' }).click();
    await page.getByRole('link', { name: 'Users and groups' }).click();
    await page.getByText('Groups').nth(1).click();
    await page.getByRole('link', { name: 'unicef' }).click();
    await page.getByRole('menuitem', { name: 'Update user in batch.' }).getByLabel('Update user in batch.').click();

    // File chooser
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('#BatchUserFormFile').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, 'batch.group.csv'));

    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByText('Reload data').click();
    await expect(page.getByRole('row').nth(1).getByRole('cell').nth(0)).toContainText('admin');
    await expect(page.getByRole('row').nth(1).getByRole('cell').nth(1)).toContainText('admin@example.com');
    await expect(page.getByRole('row').nth(1).getByRole('cell').nth(2)).toContainText('');
    await expect(page.getByRole('row').nth(1).getByRole('cell').nth(3)).toContainText('');
    await expect(page.getByRole('row').nth(1).getByRole('cell').nth(4)).toContainText('Creator');

    await expect(page.getByRole('row').nth(2).getByRole('cell').nth(0)).toContainText('contributor');
    await expect(page.getByRole('row').nth(2).getByRole('cell').nth(1)).toContainText('');
    await expect(page.getByRole('row').nth(2).getByRole('cell').nth(2)).toContainText('');
    await expect(page.getByRole('row').nth(2).getByRole('cell').nth(3)).toContainText('');
    await expect(page.getByRole('row').nth(2).getByRole('cell').nth(4)).toContainText('Contributor');

    await expect(page.getByRole('row').nth(3).getByRole('cell').nth(0)).toContainText('creator');
    await expect(page.getByRole('row').nth(3).getByRole('cell').nth(1)).toContainText('');
    await expect(page.getByRole('row').nth(3).getByRole('cell').nth(2)).toContainText('');
    await expect(page.getByRole('row').nth(3).getByRole('cell').nth(3)).toContainText('');
    await expect(page.getByRole('row').nth(3).getByRole('cell').nth(4)).toContainText('Creator');
  });
})