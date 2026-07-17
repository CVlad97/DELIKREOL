import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { width: 360, height: 800, name: 'mobile-s' },
  { width: 390, height: 844, name: 'mobile-m' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1440, height: 900, name: 'desktop' },
];

const PAGES = [
  { path: '/', name: 'accueil' },
  { path: '/catalogue', name: 'catalogue' },
  { path: '/traiteurs', name: 'traiteurs' },
  { path: '/traiteur/snack-save-peyia', name: 'save-peyia' },
  { path: '/traiteur/sweet-family-traiteur-orianne', name: 'sweet-family' },
  { path: '/traiteur/goute-mwen', name: 'goute-mwen' },
  { path: '/devis', name: 'devis' },
  { path: '/panier', name: 'panier' },
];

async function revealLazyImages(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let y = 0;
      const step = Math.max(window.innerHeight * 0.8, 480);
      const timer = window.setInterval(() => {
        window.scrollTo(0, y);
        y += step;
        if (y >= document.documentElement.scrollHeight) {
          window.clearInterval(timer);
          window.scrollTo(0, 0);
          window.setTimeout(resolve, 350);
        }
      }, 70);
    });
  });
}

for (const viewport of VIEWPORTS) {
  for (const route of PAGES) {
    test(`${route.name} — ${viewport.name}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const response = await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });

      expect(response?.status(), `${route.name}: erreur de navigation`).toBeLessThan(400);
      await expect(page.locator('body')).not.toBeEmpty();
      await revealLazyImages(page);
      await page.waitForLoadState('networkidle').catch(() => undefined);
      await page.waitForTimeout(500);

      const brokenImages = await page.locator('img').evaluateAll((images) =>
        images
          .filter((image) => {
            const img = image as HTMLImageElement;
            return Boolean(img.currentSrc || img.src) && (!img.complete || img.naturalWidth === 0);
          })
          .map((image) => ({
            src: (image as HTMLImageElement).currentSrc || (image as HTMLImageElement).src,
            alt: (image as HTMLImageElement).alt,
          }))
      );
      expect(brokenImages, `${route.name}: images cassées`).toEqual([]);

      const overflowPixels = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflowPixels, `${route.name}: débordement horizontal`).toBeLessThanOrEqual(4);

      const screenshot = await page.screenshot({
        fullPage: true,
        animations: 'disabled',
      });
      await testInfo.attach(`${route.name}-${viewport.name}`, {
        body: screenshot,
        contentType: 'image/png',
      });
    });
  }
}
