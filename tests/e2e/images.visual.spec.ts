import { test, expect } from '@playwright/test';

test.describe.configure({ timeout: 90_000 });

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
  { path: '/carte', name: 'carte-interactive' },
  { path: '/panier', name: 'panier' },
];

for (const vp of VIEWPORTS) {
  for (const page of PAGES) {
    test(`screenshot ${page.name} at ${vp.name}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: vp });
      const p = await context.newPage();

      await p.route('**/*.{png,jpg,jpeg,gif,svg}', async route => {
        const url = route.request().url();
        if (url.includes('127.0.0.1') || url.includes('localhost')) {
          await route.continue();
        } else {
          await route.abort();
        }
      });

      await p.goto(page.path, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      });
      await p.waitForSelector('main, #root > *', { timeout: 15000 });

      await p.waitForTimeout(2000);

      const brokenImages = await p.evaluate(() => {
        return Array.from(document.querySelectorAll('img'))
          .filter(img => !img.complete || img.naturalWidth === 0)
          .map(img => img.src);
      });

      await p.screenshot({
        path: `reports/images-before/${page.name}-${vp.name}.png`,
        fullPage: true,
      });

      if (brokenImages.length > 0) {
        console.log(`⚠️ Broken images on ${page.name} (${vp.name}):`, brokenImages);
      }

      await context.close();
    });
  }
}

test.describe('Fidélité des couleurs originales', () => {
  test("le hero de l'accueil est visible et sans filtre destructif", async ({ page }) => {
    await page.goto('/');

    const hero = page.locator('img[src*="branding/hero-tropical"]').first();
    await expect(hero).toBeVisible();

    const styles = await hero.evaluate((image) => {
      const computed = window.getComputedStyle(image);
      return {
        filter: computed.filter,
        mixBlendMode: computed.mixBlendMode,
      };
    });

    // Le hero a une opacité décorative (overlay) mais pas de filtre destructif
    expect(styles.filter).toBe('none');
    expect(styles.mixBlendMode).toBe('normal');
  });

  test('les images catalogue sont chargées et sans filtre', async ({ page }) => {
    await page.goto('/catalogue');

    // Attendre que les images du catalogue se chargent
    await page.waitForTimeout(2000);
    const image = page.locator('img').filter({ has: page.locator(':scope') }).first();
    const imageCount = await image.count();
    if (imageCount === 0) {
      test.skip();
      return;
    }

    const styles = await image.evaluate((element) => {
      const imageStyle = window.getComputedStyle(element);
      return {
        filter: imageStyle.filter,
        mixBlendMode: imageStyle.mixBlendMode,
        naturalWidth: (element as HTMLImageElement).naturalWidth,
        naturalHeight: (element as HTMLImageElement).naturalHeight,
      };
    });

    expect(styles.filter).toBe('none');
    expect(styles.mixBlendMode).toBe('normal');
    expect(styles.naturalWidth).toBeGreaterThan(0);
    expect(styles.naturalHeight).toBeGreaterThan(0);
  });

  test("le hero partenaire ne contient pas de filtre destructif sur l'image", async ({ page }) => {
    await page.goto('/traiteur/snack-save-peyia');

    // Attendre que la page se charge
    await page.waitForSelector('main section', { timeout: 10000 });

    const heroImage = page.locator('main section img').first();
    const imageCount = await heroImage.count();
    if (imageCount === 0) {
      test.skip();
      return;
    }

    const filter = await heroImage.evaluate((element) => {
      return window.getComputedStyle(element).filter;
    });

    expect(filter).toBe('none');
  });
});
