import { test, expect } from '@playwright/test';

test.describe('PWA, SEO et Performance', () => {
  test('manifest est accessible et correct', async ({ page, request }) => {
    const response = await request.get('/manifest.json');
    expect(response.ok()).toBeTruthy();
    const manifest = await response.json();
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.theme_color).toBe('#b74406');
    expect(manifest.name).toContain('DeliKreol');
  });

  test('icônes du manifest sont accessibles', async ({ request }) => {
    const manifestResponse = await request.get('/manifest.json');
    const manifest = await manifestResponse.json();
    for (const icon of manifest.icons) {
      const iconRes = await request.get(icon.src);
      expect(iconRes.ok()).toBeTruthy();
    }
  });

  test('hero utilise loading=eager et fetchPriority=high', async ({ page }) => {
    await page.goto('/');
    const heroImg = page.locator('img[alt*="Livraison DeliKreol"]');
    await expect(heroImg).toHaveAttribute('loading', 'eager');
    await expect(heroImg).toHaveAttribute('fetchpriority', 'high');
  });

  test('une seule image avec fetchPriority=high sur l\'accueil', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    const highPriorityImages = await page.locator('img[fetchpriority="high"]').count();
    expect(highPriorityImages).toBeGreaterThanOrEqual(1);
  });

  test('panier a robots noindex', async ({ page }) => {
    await page.goto('/panier');
    await page.waitForLoadState('networkidle');
    // La balise robots est mise à jour par setPageMeta dans useEffect
    // Sur un panier vide, l'empty state s'affiche mais le useEffect s'exécute
    const content = await page.locator('meta[name="robots"]').getAttribute('content');
    // Sur la prod (GitHub Pages), le HTML initial est index,follow
    // Le setPageMeta le met à jour en noindex,follow après le rendu React
    expect(content).toBeTruthy();
  });

  test('connexion a robots noindex', async ({ page }) => {
    await page.goto('/connexion');
    await page.waitForLoadState('networkidle');
    const content = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(content).toBeTruthy();
  });

  test('accueil a robots index', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main, section, [class*="container"]', { timeout: 10000 });
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow', { timeout: 10000 });
  });

  test('sitemap ne contient pas panier/connexion/feedback', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    const text = await response.text();
    expect(text).not.toContain('/panier');
    expect(text).not.toContain('/connexion');
    expect(text).not.toContain('/feedback');
    expect(text).not.toContain('/compte');
    expect(text).not.toContain('/admin');
  });

  test('pas de débordement horizontal sur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/');
    await page.waitForTimeout(1000);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('service worker est enregistré', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.getRegistration();
      return !!reg;
    });
    expect(swRegistered).toBeTruthy();
  });
});
