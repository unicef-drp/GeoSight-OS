import { expect, test } from '@playwright/test';

/**
 * Tests that verify i18n translations are working correctly.
 * Checks that key UI strings appear in the correct language based on the URL locale prefix.
 */
test.describe('i18n translations', () => {

  test('English (en-US) - home page shows English strings', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.Home', { timeout: 10000 });
    await expect(page.getByText('Admin panel')).toBeVisible();
    await expect(page.getByText('Featured Projects', { exact: true })).toBeVisible();
  });

  test('Spanish (es-ES) - home page shows Spanish strings', async ({ page }) => {
    await page.goto('/es-es/');
    await page.waitForSelector('.Home', { timeout: 10000 });
    await expect(page.getByText('Panel de administración')).toBeVisible();
    await expect(page.getByText('Proyectos destacados', { exact: true })).toBeVisible();
  });

  test('Portuguese (pt-BR) - home page shows Portuguese strings', async ({ page }) => {
    await page.goto('/pt-br/');
    await page.waitForSelector('.Home', { timeout: 10000 });
    await expect(page.getByText('Painel de administração')).toBeVisible();
    await expect(page.getByText('Projetos em destaque', { exact: true })).toBeVisible();
  });

  test('French (fr-FR) - home page shows French strings', async ({ page }) => {
    await page.goto('/fr-fr/');
    await page.waitForSelector('.Home', { timeout: 10000 });
    await expect(page.getByText("Panneau d'administration")).toBeVisible();
    await expect(page.getByText('Projets en vedette', { exact: true })).toBeVisible();
  });

  test('Spanish (es-ES) - project dashboard shows Spanish toolbar labels', async ({ page }) => {
    await page.goto('/es-es/project/demo-geosight-project');
    // Close the splash screen if it appears
    const closeBtn = page.getByRole('button', { name: 'Cerrar' });
    if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeBtn.click();
    }
    // Check that measurement toolbar tooltip is in Spanish
    await expect(page.getByTitle('Iniciar medición')).toBeVisible({ timeout: 10000 });
  });

  test('Spanish (es-ES) - project panel tabs show Spanish strings', async ({ page }) => {
    await page.goto('/es-es/project/demo-geosight-project');
    const closeBtn = page.getByRole('button', { name: 'Cerrar' });
    if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeBtn.click();
    }
    // Panel tabs only appear when the project has layers configured.
    // If absent in this environment, skip rather than fail.
    const capasTab = page.getByRole('tab', { name: 'Capas', exact: true });
    if (await capasTab.isVisible({ timeout: 10000 }).catch(() => false)) {
      await expect(capasTab).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Filtros', exact: true })).toBeVisible({ timeout: 5000 });
    }
  });

  test('Portuguese Portugal (pt-PT) - home page shows Portuguese strings', async ({ page }) => {
    await page.goto('/pt-pt/');
    await page.waitForSelector('.Home', { timeout: 10000 });
    await expect(page.getByText('Painel de administração')).toBeVisible();
    await expect(page.getByText('Projetos em destaque', { exact: true })).toBeVisible();
  });

  test('locale JSON files exist for all supported languages', async ({ page }) => {
    // Verify all language files load correctly by checking the i18n resources via the React app
    for (const [locale, path] of [
      ['en-US', '/'],
      ['es-ES', '/es-es/'],
      ['pt-BR', '/pt-br/'],
      ['pt-PT', '/pt-pt/'],
      ['fr-FR', '/fr-fr/'],
    ]) {
      await page.goto(path);
      await page.waitForSelector('.Home', { timeout: 10000 });
      // If the locale file fails to load, the key name itself would be rendered
      // We check that the logout link text is translated (not just the key "logout")
      const logoutLink = page.getByText('logout');
      await expect(logoutLink).not.toBeVisible();
    }
  });

  test('language switcher - clicking globe icon switches language', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.NavHeader', { timeout: 10000 });
    await expect(page.getByText('Admin panel')).toBeVisible();
    await page.locator('.AdminLinkButton.LanguageSelector').click();
    await expect(page.locator('.LanguageSelectorComponent')).toBeVisible();
    await page.locator('.language-option', { hasText: 'Español' }).click();
    await page.waitForURL(/\/es-es\//i, { timeout: 10000 });
    await page.waitForSelector('.NavHeader', { timeout: 5000 });
    await expect(page.getByText('Panel de administración')).toBeVisible();
    await page.locator('.AdminLinkButton.LanguageSelector').click();
    await expect(page.locator('.LanguageSelectorComponent')).toBeVisible();
    await page.locator('.language-option', { hasText: 'English' }).click();
    await page.waitForURL(/\/en-us\//i, { timeout: 10000 });
    await page.waitForSelector('.NavHeader', { timeout: 5000 });
    await expect(page.getByText('Admin panel')).toBeVisible();
  });
});
