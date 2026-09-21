import { test, expect } from '@playwright/test';

test('les mentions légales ne renvoient pas la confidentialité', async ({ page }) => {
  await page.goto('/mentions-legales', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Mentions légales', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Politique de Confidentialité', exact: true })).toHaveCount(0);
});

test('une navigation interne replace la nouvelle page tout en haut', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

  await page.locator('footer').getByRole('link', { name: 'Aide', exact: true }).click();
  await expect(page).toHaveURL(/\/aide\/?$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
});
