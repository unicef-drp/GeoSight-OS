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
    await expect(page.getByText('Featured Projects')).toBeVisible();
  });

  test('Spanish (es-ES) - home page shows Spanish strings', async ({ page }) => {
    await page.goto('/es-es/');
    await page.waitForSelector('.Home', { timeout: 10000 });
    await expect(page.getByText('Panel de administración')).toBeVisible();
    await expect(page.getByText('Proyectos destacados')).toBeVisible();
  });

  test('Portuguese (pt-BR) - home page shows Portuguese strings', async ({ page }) => {
    await page.goto('/pt-br/');
    await page.waitForSelector('.Home', { timeout: 10000 });
    await expect(page.getByText('Painel de administração')).toBeVisible();
    await expect(page.getByText('Projetos em destaque')).toBeVisible();
  });

  test('French (fr-FR) - home page shows French strings', async ({ page }) => {
    await page.goto('/fr-fr/');
    await page.waitForSelector('.Home', { timeout: 10000 });
    await expect(page.getByText("Panneau d'administration")).toBeVisible();
    await expect(page.getByText('Projets en vedette')).toBeVisible();
  });

  test('Portuguese Portugal (pt-PT) - home page shows Portuguese strings', async ({ page }) => {
    await page.goto('/pt-pt/');
    await page.waitForSelector('.Home', { timeout: 10000 });
    await expect(page.getByText('Painel de administração')).toBeVisible();
    await expect(page.getByText('Projetos em destaque')).toBeVisible();
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

  test('Spanish (es-ES) - filter panel shows Spanish strings', async ({ page }) => {
    await page.goto('/es-es/project/demo-geosight-project');
    const closeBtn = page.getByRole('button', { name: 'Cerrar' });
    if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeBtn.click();
    }
    // Open filter panel
    await page.getByTitle('Filtro').click();
    await expect(page.getByText('Aplicar filtros')).toBeVisible({ timeout: 5000 });
  });

  test('locale JSON files exist for all supported languages', async ({ page }) => {
    // Verify all language files load correctly by checking the i18n resources via the React app
    for (const [locale, path] of [
      ['en-US', '/'],
      ['es-ES', '/es-es/'],
      ['pt-BR', '/pt-br/'],
      ['fr-FR', '/fr-fr/'],
      ['pt-PT', '/pt-pt/'],
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

    // Open the language selector via the globe button
    await page.locator('.AdminLinkButton.LanguageSelector').click();
    await expect(page.locator('.LanguageSelectorComponent')).toBeVisible();

    // Switch to Spanish — changeLanguage() navigates to /es-es/
    await page.locator('.language-option', { hasText: 'Español' }).click();
    await page.waitForURL(/\/es-es\//i, { timeout: 10000 });
    await page.waitForSelector('.NavHeader', { timeout: 5000 });
    await expect(page.getByText('Panel de administración')).toBeVisible();

    // Switch back to English
    await page.locator('.AdminLinkButton.LanguageSelector').click();
    await expect(page.locator('.LanguageSelectorComponent')).toBeVisible();
    await page.locator('.language-option', { hasText: 'English' }).click();
    await page.waitForURL(/\/en-us\//i, { timeout: 10000 });
    await page.waitForSelector('.NavHeader', { timeout: 5000 });
    await expect(page.getByText('Admin panel')).toBeVisible();
  });
});
