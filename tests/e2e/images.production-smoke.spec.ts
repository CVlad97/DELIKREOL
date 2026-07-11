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

    // 2. Wait for content to render
    await page.waitForTimeout(2000);

    // 3. Check page has content (not white screen)
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(50);

    // 4. Log image stats (non-blocking)
    const imgStats = await page.evaluate(() => {
      const all = document.querySelectorAll('img');
      const loaded = Array.from(all).filter(i => i.complete && i.naturalWidth > 0).length;
      return { total: all.length, loaded };
    });
    console.log(`  📊 ${name}: ${imgStats.loaded}/${imgStats.total} images loaded`);
  });
}