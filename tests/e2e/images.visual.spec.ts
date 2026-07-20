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

      // Block non-essential resources for consistency.
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
  test('le hero de l’accueil est affiché à pleine opacité sans filtre ni voile', async ({ page }) => {
    await page.goto('/');

    const hero = page.locator('img[src*="branding/hero-tropical"]').first();
    await expect(hero).toBeVisible();

    const styles = await hero.evaluate((image) => {
      const computed = window.getComputedStyle(image);
      return {
        opacity: computed.opacity,
        filter: computed.filter,
        mixBlendMode: computed.mixBlendMode,
        siblingDisplays: Array.from(image.parentElement?.children || [])
          .slice(1)
          .map((element) => window.getComputedStyle(element).display),
      };
    });

    expect(styles.opacity).toBe('1');
    expect(styles.filter).toBe('none');
    expect(styles.mixBlendMode).toBe('normal');
    expect(styles.siblingDisplays.every((display) => display === 'none')).toBe(true);
  });

  test('les vignettes catalogue n’ont ni filtre, ni mélange, ni fond imposé', async ({ page }) => {
    await page.goto('/catalogue');

    const image = page.locator('img[data-smart-image="true"][data-color-fidelity="original"]').first();
    await expect(image).toBeVisible();

    const styles = await image.evaluate((element) => {
      const imageStyle = window.getComputedStyle(element);
      const container = element.closest('[data-smart-image-container="true"]');
      const containerStyle = container ? window.getComputedStyle(container) : null;
      return {
        filter: imageStyle.filter,
        mixBlendMode: imageStyle.mixBlendMode,
        backgroundColor: containerStyle?.backgroundColor || '',
        naturalWidth: (element as HTMLImageElement).naturalWidth,
        naturalHeight: (element as HTMLImageElement).naturalHeight,
      };
    });

    expect(styles.filter).toBe('none');
    expect(styles.mixBlendMode).toBe('normal');
    expect(styles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(styles.naturalWidth).toBeGreaterThan(0);
    expect(styles.naturalHeight).toBeGreaterThan(0);
  });

  test('le voile noir du hero partenaire est supprimé et le texte est placé dessous', async ({ page }) => {
    await page.goto('/traiteur/snack-save-peyia');

    const heroSection = page.locator('main section.relative.overflow-hidden.bg-neutral-950.shadow-xl').first();
    await expect(heroSection).toBeVisible();

    const overlay = heroSection.locator(':scope > [data-smart-image-container="true"] + div.absolute.inset-0');
    const information = heroSection.locator(':scope > div.absolute.inset-x-0.bottom-0');

    await expect(overlay).toHaveCSS('display', 'none');
    await expect(information).toHaveCSS('position', 'static');

    const heroImage = heroSection.locator('img[data-smart-image="true"]').first();
    await expect(heroImage).toHaveCSS('filter', 'none');
    await expect(heroImage).toHaveCSS('mix-blend-mode', 'normal');
  });
});
