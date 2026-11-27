import { expect, test } from '@playwright/test';
import { editProject } from "../../utils/project";

// Read-only: the demo project's editor is opened, nothing is saved.
const TEXT = [
  '## Hello',
  'Some **bold** text and a [link](https://example.org).',
  '',
  '<span data-testid="styled" style="color: rgb(255, 0, 0); position: fixed; background: url(https://example.org/x.png)">Red</span>',
  '<img src="x" onerror="window.__xss = 1">',
  '<script>window.__xss = 2</script>',
  '[bad](javascript:window.__xss=3)',
].join('\n');

test.describe('Widget type tiles', () => {
  test.beforeEach(async ({ page }) => {
    await editProject(page, 'Demo GeoSight Project')
    await page.getByText(/^Widgets \(\d+\)$/).click();
    await page.getByRole('button', { name: 'Add Widget' }).click();
  });

  test('One grid of tiles for every new widget', async ({ page }) => {
    // The value (summary) is the default; time series is not offered.
    await expect(page.getByTestId('widget-type-value')).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('widget-type-text')).toBeVisible();
    await expect(page.getByTestId('widget-type-time-series')).toHaveCount(0);
    for (const type of ['bar', 'line', 'donut', 'scatter', 'heatmap', 'treemap', 'gauge', 'kpi']) {
      await expect(page.getByTestId(`chart-type-${type}`)).toBeVisible();
    }

    // A chart tile shows the chart settings, the value tile hides them;
    // the name is kept.
    await page.getByRole('textbox', { name: 'Widget name' }).fill('Tiles');
    await page.getByTestId('chart-type-line').click();
    await expect(page.getByTestId('chart-config')).toBeVisible();
    await page.getByTestId('widget-type-value').click();
    await expect(page.getByTestId('chart-config')).toBeHidden();
    await expect(page.getByRole('textbox', { name: 'Widget name' })).toHaveValue('Tiles');
  });

  test('Custom colours are set in the predefined list', async ({ page }) => {
    await page.getByTestId('chart-type-bar').click();
    const colors = page.getByTestId('chart-config-colors');
    // Map style (default) and palette: no colour column in the lists.
    await expect(page.locator('.WidgetLayout-Data th', { hasText: 'Color' })).toHaveCount(0);
    await colors.getByText('Custom', { exact: true }).click();
    await expect(page.locator('.WidgetLayout-Data th', { hasText: 'Color' }).first()).toBeVisible();

    // A new area gets a palette colour, not black.
    const areas = page.locator(
      '.WidgetLayout-Data .MuiForm-RadioGroup:has(.MultiSelectorItem)', { hasText: 'Geographical units' }
    )
    await areas.locator('select').selectOption({ index: 1 });
    await areas.getByRole('button').first().click();
    const code = areas.locator('.ItemRows .ColorConfig input[type="text"]').first();
    await expect(code).toBeVisible();
    await expect(code).not.toHaveValue('#000000');
  });

  test('Text widget renders Markdown safely', async ({ page }) => {
    await page.getByTestId('widget-type-text').click();
    await page.getByRole('textbox', { name: 'Widget name' }).fill('Text');
    await page.getByTestId('text-config').fill(TEXT);

    const preview = page.getByTestId('widget-preview').getByTestId('text-widget');
    await expect(preview.locator('h2')).toHaveText('Hello');
    await expect(preview.locator('strong')).toHaveText('bold');
    const link = preview.getByRole('link', { name: 'link' });
    await expect(link).toHaveAttribute('href', 'https://example.org');
    await expect(link).toHaveAttribute('target', '_blank');

    // Allowed style kept, the rest dropped.
    const styled = preview.locator('span', { hasText: 'Red' });
    await expect(styled).toHaveCSS('color', 'rgb(255, 0, 0)');
    const style = await styled.getAttribute('style');
    expect(style).not.toContain('position');
    expect(style).not.toContain('url(');

    // Nothing runs: no script, no handler, no javascript: link.
    await expect(preview.locator('script')).toHaveCount(0);
    await expect(preview.locator('img[onerror]')).toHaveCount(0);
    await expect(preview.locator('a[href^="javascript"]')).toHaveCount(0);
    expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();

    // The text is kept: apply, then open the widget again (not saved).
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.getByRole('listitem').filter({ hasText: 'Text' }).getByTestId('EditIcon').last().click();
    await expect(page.getByTestId('text-config')).toHaveValue(TEXT);
  });
});
