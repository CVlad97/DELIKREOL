import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4175';

const PAGES = [
  { path: '/', name: 'accueil' },
  { path: '/catalogue', name: 'catalogue' },
  { path: '/traiteurs', name: 'traiteurs' },
  { path: '/traiteur/snack-save-peyia', name: 'save-peyia' },
  { path: '/traiteur/sweet-family-traiteur-orianne', name: 'sweet-family' },
  { path: '/traiteur/goute-mwen', name: 'goute-mwen' },
  { path: '/devis', name: 'devis' },
  { path: '/panier', name: 'panier' },
  { path: '/contact', name: 'contact' },
];

async function scrollThroughPage(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let position = 0;
      const step = Math.max(window.innerHeight * 0.8, 500);
      const timer = window.setInterval(() => {
        window.scrollTo(0, position);
        position += step;
        if (position >= document.documentElement.scrollHeight) {
          window.clearInterval(timer);
          window.scrollTo(0, document.documentElement.scrollHeight);
          window.setTimeout(resolve, 400);
        }
      }, 80);
    });
  });
}

async function getBrokenRenderedImages(page: import('@playwright/test').Page) {
  return page.locator('img').evaluateAll((images) =>
    images
      .filter((image) => {
        const img = image as HTMLImageElement;
        const style = window.getComputedStyle(img);
        const isRendered =
          img.getClientRects().length > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden';
        const requestWasStarted = Boolean(img.currentSrc);
        return isRendered && requestWasStarted && (!img.complete || img.naturalWidth === 0);
      })
      .map((image) => {
        const img = image as HTMLImageElement;
        return { src: img.currentSrc || img.src, alt: img.alt };
      })
  );
}

for (const { path, name } of PAGES) {
  test(`production smoke: ${name}`, async ({ page }) => {
    const response = await page.goto(`${BASE_URL}${path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });

    expect(response, `${name}: aucune réponse HTTP`).not.toBeNull();
    expect(response?.status(), `${name}: statut HTTP invalide`).toBeLessThan(400);

    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('body')).not.toContainText('Application error');
    await expect(page.locator('body')).not.toContainText('Unexpected Application Error');

    const bodyText = (await page.locator('body').innerText()).trim();
    expect(bodyText.length, `${name}: écran presque vide`).toBeGreaterThan(80);

    await scrollThroughPage(page);
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await page.waitForTimeout(800);

    const brokenImages = await getBrokenRenderedImages(page);
    expect(brokenImages, `${name}: images visibles cassées`).toEqual([]);

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(
      overflow.scrollWidth - overflow.clientWidth,
      `${name}: débordement horizontal de ${overflow.scrollWidth - overflow.clientWidth}px`
    ).toBeLessThanOrEqual(4);

    console.log(`✓ ${name}: contenu, images visibles et largeur validés`);
  });
}
