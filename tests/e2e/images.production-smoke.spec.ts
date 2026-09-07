import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4175';

const PAGES = [
  { path: '/', name: 'accueil' },
  { path: '/catalogue', name: 'catalogue' },
  { path: '/traiteurs', name: 'traiteurs' },
  { path: '/traiteur/snack-save-peyia', name: 'save-peyia' },
  { path: '/traiteur/sweet-family-traiteur-orianne', name: 'sweet-family' },
  { path: '/carte', name: 'carte-interactive' },
  { path: '/panier', name: 'panier' },
  { path: '/cgu', name: 'cgu' },
  { path: '/cgv', name: 'cgv' },
  { path: '/mentions-legales', name: 'mentions-legales' },
  { path: '/jobs', name: 'jobs' },
  { path: '/offres-cash', name: 'offres-cash' },
];

for (const { path, name } of PAGES) {
  test(`production smoke: ${name}`, async ({ page }) => {
    // 1. Navigate and wait for SPA to render
    await page.goto(`${BASE_URL}${path}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

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

test('production smoke: les paiements indisponibles ne sont pas proposés', async ({ page }) => {
  await page.goto(`${BASE_URL}/panier`, { waitUntil: 'networkidle', timeout: 30000 });
  await expect(page.getByText('Stripe désactivé')).toBeVisible();
  await expect(page.getByText('Qonto', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Revolut Business', { exact: true })).toHaveCount(0);
});

test('production smoke: les mentions légales ne renvoient pas la confidentialité', async ({ page }) => {
  await page.goto(`${BASE_URL}/mentions-legales`, { waitUntil: 'networkidle', timeout: 30000 });
  await expect(page.getByRole('heading', { name: 'Mentions légales', exact: true })).toBeVisible();
  await expect(page.getByText('Plateforme en phase pilote')).toBeVisible();
});
