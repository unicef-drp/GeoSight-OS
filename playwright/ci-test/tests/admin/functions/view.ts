import { expect, test } from '@playwright/test';

test.describe('Functions test', () => {
  // A use case tests scenarios
  test('Alasql', async ({ page }) => {
    let alasSQLTest = []
    page.on('console', msg => {
      if (msg.text().indexOf('ALASQL:') !== -1) {
        alasSQLTest.push(msg.text().replace('ALASQL:', ''))
      }
    })
    await page.goto('/');
    await expect(page.getByText('Featured Projects')).toBeVisible();

    // Test the alasql
    await expect(alasSQLTest.length).toBeGreaterThan(0)
    for (const result of alasSQLTest) {
      await expect(result.trim()).toBe('OK')
    }
  });
});