import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4175';

const PAGES = [
  { path: '/', name: 'accueil' },
  { path: '/catalogue', name: 'catalogue' },
  { path: '/traiteurs', name: 'traiteurs' },
  { path: '/traiteur/snack-save-peyia', name: 'save-peyia' },
  { path: '/traiteur/sweet-family-traiteur-orianne', name: 'sweet-family' },
  { path: '/carte', name: 'carte-interactive' },
];

for (const { path, name } of PAGES) {
  test(`production smoke: ${name}`, async ({ page }) => {
    const response = await page.goto(`${BASE_URL}${path}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // 1. Route accessible
    expect(response?.status()).toBeLessThan(400);

    // 2. Wait for all images to load
    await page.waitForTimeout(5000);
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for lazy-loaded images to finish
    const imgCount = await page.locator('img').count();
    if (imgCount > 0) {
      await page.locator('img').first().waitFor({ state: 'attached', timeout: 5000 });
    }
    
    // Scroll to trigger lazy loading for all images
    await page.evaluate(async () => {
      const allImages = Array.from(document.querySelectorAll('img'));
      for (const img of allImages) {
        img.scrollIntoView({ behavior: 'instant', block: 'center' });
        await new Promise(r => setTimeout(r, 100));
      }
    });
    await page.waitForTimeout(2000);

    // Ensure all visible images are fully loaded
    await page.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.every(img => img.complete);
    }, { timeout: 10000 }).catch(() => {});

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));

    // 3. No broken images from our domain
    const origin = new URL(BASE_URL).origin;
    const brokenImages = await page.locator('img').evaluateAll(
      (images: HTMLImageElement[], o) =>
        images
          .filter((img) => img.src.startsWith(o) && (!img.complete || img.naturalWidth === 0))
          .map((img) => img.currentSrc || img.src),
      origin
    );
    expect(brokenImages).toEqual([]);

    // 3. No significant horizontal overflow (allow 2px tolerance)
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    );
    expect(overflow).toBe(false);

    // 4. No white screen
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(50);
  });
}