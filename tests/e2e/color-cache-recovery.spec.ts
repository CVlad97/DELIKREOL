import { test, expect } from '@playwright/test';

test.describe('Couleurs stables et récupération du cache', () => {
  test('le header conserve un fond opaque et stable', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    const styles = await header.evaluate((element) => {
      const computed = window.getComputedStyle(element);
      return {
        backgroundColor: computed.backgroundColor,
        backdropFilter: computed.backdropFilter,
        webkitBackdropFilter: computed.getPropertyValue('-webkit-backdrop-filter'),
      };
    });

    expect(styles.backgroundColor).not.toMatch(/rgba\([^)]*,\s*0(?:\.|\))/i);
    expect(styles.backdropFilter || 'none').toBe('none');
    expect(styles.webkitBackdropFilter || 'none').toBe('none');
  });

  test('le handler Vite empêche une boucle de rechargement', async ({ page }) => {
    await page.goto('/');

    const defaultPrevented = await page.evaluate(() => {
      sessionStorage.setItem('delikreol-preload-reload-at', String(Date.now()));
      const event = new Event('vite:preloadError', { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    });

    expect(defaultPrevented).toBe(true);
  });
});
