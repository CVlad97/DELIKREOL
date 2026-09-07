import { test, expect } from '@playwright/test';

test('les mentions légales ne renvoient pas la confidentialité', async ({ page }) => {
  await page.goto('/mentions-legales', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Mentions légales', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Politique de Confidentialité', exact: true })).toHaveCount(0);
});
