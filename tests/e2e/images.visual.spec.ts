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
      
      // Block non-essential resources for consistency
      await p.route('**/*.{png,jpg,jpeg,gif,svg}', async route => {
        const url = route.request().url();
        // Only load our own images from localhost
        if (url.includes('127.0.0.1') || url.includes('localhost')) {
          await route.continue();
        } else {
          await route.abort();
        }
      });

      await p.goto(page.path, { 
        waitUntil: 'networkidle', 
        timeout: 30000 
      });

      // Wait for images to load
      await p.waitForTimeout(2000);
      
      // Check for broken images
      const brokenImages = await p.evaluate(() => {
        return Array.from(document.querySelectorAll('img'))
          .filter(img => !img.complete || img.naturalWidth === 0)
          .map(img => img.src);
      });

      await p.screenshot({ 
        path: `reports/images-before/${page.name}-${vp.name}.png`,
        fullPage: true 
      });

      // Report broken images
      if (brokenImages.length > 0) {
        console.log(`⚠️ Broken images on ${page.name} (${vp.name}):`, brokenImages);
      }

      await context.close();
    });
  }
}
