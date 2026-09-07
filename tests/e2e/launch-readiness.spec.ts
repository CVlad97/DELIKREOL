import { test, expect } from '@playwright/test';

test('les paiements indisponibles ne sont pas proposés', async ({ page }) => {
  await page.goto('/panier', { waitUntil: 'networkidle' });
  await expect(page.getByText('Stripe désactivé')).toBeVisible();
  await expect(page.getByText('Qonto', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Revolut Business', { exact: true })).toHaveCount(0);
});

test('les mentions légales ne renvoient pas la confidentialité', async ({ page }) => {
  await page.goto('/mentions-legales', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Mentions légales', exact: true })).toBeVisible();
  await expect(page.getByText('Plateforme en phase pilote')).toBeVisible();
});
