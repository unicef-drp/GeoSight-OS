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
    await expect(page.getByRole('row').nth(1).getByRole('cell').nth(0)).toContainText('admin.a@example.com');
    await expect(page.getByRole('row').nth(1).getByRole('cell').nth(1)).toContainText('admin.a@example.com');
    await expect(page.getByRole('row').nth(1).getByRole('cell').nth(2)).toContainText('Admin');
    await expect(page.getByRole('row').nth(1).getByRole('cell').nth(3)).toContainText('A');
    await expect(page.getByRole('row').nth(1).getByRole('cell').nth(4)).toContainText('Super Admin');

    await expect(page.getByRole('row').nth(2).getByRole('cell').nth(0)).toContainText('contributor.a@example.com');
    await expect(page.getByRole('row').nth(2).getByRole('cell').nth(1)).toContainText('contributor.a@example.com');
    await expect(page.getByRole('row').nth(2).getByRole('cell').nth(2)).toContainText('Contributor');
    await expect(page.getByRole('row').nth(2).getByRole('cell').nth(3)).toContainText('A');
    await expect(page.getByRole('row').nth(2).getByRole('cell').nth(4)).toContainText('Contributor');

    await expect(page.getByRole('row').nth(3).getByRole('cell').nth(0)).toContainText('creator.a@example.com');
    await expect(page.getByRole('row').nth(3).getByRole('cell').nth(1)).toContainText('creator.a@example.com');
    await expect(page.getByRole('row').nth(3).getByRole('cell').nth(2)).toContainText('Creator');
    await expect(page.getByRole('row').nth(3).getByRole('cell').nth(3)).toContainText('A');
    await expect(page.getByRole('row').nth(3).getByRole('cell').nth(4)).toContainText('Creator');

    await expect(page.getByRole('row').nth(4).getByRole('cell').nth(0)).toContainText('viewer.a@example.com');
    await expect(page.getByRole('row').nth(4).getByRole('cell').nth(1)).toContainText('viewer.a@example.com');
    await expect(page.getByRole('row').nth(4).getByRole('cell').nth(2)).toContainText('Viewer');
    await expect(page.getByRole('row').nth(4).getByRole('cell').nth(3)).toContainText('A');
    await expect(page.getByRole('row').nth(4).getByRole('cell').nth(4)).toContainText('Viewer');

    await expect(page.getByRole('row').nth(5).getByRole('cell').nth(0)).toContainText('viewer.b@example.com');
    await expect(page.getByRole('row').nth(5).getByRole('cell').nth(1)).toContainText('viewer.b@example.com');
    await expect(page.getByRole('row').nth(5).getByRole('cell').nth(2)).toContainText('Viewer');
    await expect(page.getByRole('row').nth(5).getByRole('cell').nth(3)).toContainText('B');
    await expect(page.getByRole('row').nth(5).getByRole('cell').nth(4)).toContainText('Viewer');

    await expect(page.getByRole('row').nth(6).getByRole('cell').nth(0)).toContainText('viewer.c@example.com');
    await expect(page.getByRole('row').nth(6).getByRole('cell').nth(1)).toContainText('viewer.c@example.com');
    await expect(page.getByRole('row').nth(6).getByRole('cell').nth(2)).toContainText('Viewer');
    await expect(page.getByRole('row').nth(6).getByRole('cell').nth(3)).toContainText('C');
    await expect(page.getByRole('row').nth(6).getByRole('cell').nth(4)).toContainText('Viewer');

    await expect(page.getByRole('row').nth(7).getByRole('cell').nth(0)).toContainText('viewer.d@example.com');
    await expect(page.getByRole('row').nth(7).getByRole('cell').nth(1)).toContainText('viewer.d@example.com');
    await expect(page.getByRole('row').nth(7).getByRole('cell').nth(2)).toContainText('Viewer');
    await expect(page.getByRole('row').nth(7).getByRole('cell').nth(3)).toContainText('D');
    await expect(page.getByRole('row').nth(7).getByRole('cell').nth(4)).toContainText('Viewer');

    await expect(page.getByRole('row').nth(8).getByRole('cell').nth(0)).toContainText('viewer.e@example.com');
    await expect(page.getByRole('row').nth(8).getByRole('cell').nth(1)).toContainText('viewer.e@example.com');
    await expect(page.getByRole('row').nth(8).getByRole('cell').nth(2)).toContainText('Viewer');
    await expect(page.getByRole('row').nth(8).getByRole('cell').nth(3)).toContainText('E');
    await expect(page.getByRole('row').nth(8).getByRole('cell').nth(4)).toContainText('Viewer');

    await expect(page.getByRole('row').nth(9).getByRole('cell').nth(0)).toContainText('viewer.f@example.com');
    await expect(page.getByRole('row').nth(9).getByRole('cell').nth(1)).toContainText('viewer.f@example.com');
    await expect(page.getByRole('row').nth(9).getByRole('cell').nth(2)).toContainText('Viewer');
    await expect(page.getByRole('row').nth(9).getByRole('cell').nth(3)).toContainText('F');
    await expect(page.getByRole('row').nth(9).getByRole('cell').nth(4)).toContainText('Viewer');

    await expect(page.getByRole('row').nth(10).getByRole('cell').nth(0)).toContainText('viewer.g@example.com');
    await expect(page.getByRole('row').nth(10).getByRole('cell').nth(1)).toContainText('viewer.g@example.com');
    await expect(page.getByRole('row').nth(10).getByRole('cell').nth(2)).toContainText('Viewer');
    await expect(page.getByRole('row').nth(10).getByRole('cell').nth(3)).toContainText('G');
    await expect(page.getByRole('row').nth(10).getByRole('cell').nth(4)).toContainText('Viewer');
  });
})