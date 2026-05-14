import { test, expect } from '@playwright/test';

test('public home: add product to cart (selection) shows mobile bottom bar', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Le r.*flexe local/i })).toBeVisible();

  const addButton = page.getByRole('button', { name: /^Ajouter$/i }).first();
  await expect(addButton).toBeVisible();
  await addButton.click();

  const mobileBar = page.locator('div.fixed.md\\:hidden').filter({
    has: page.getByRole('button', { name: /^Commander$/i }),
  });
  await expect(mobileBar).toBeVisible();
  await expect(mobileBar.getByText(/1 article\(s\)/i)).toBeVisible();
});

test('public home: catalogue and filters render', async ({ page }) => {
  await page.goto('/');
  const catalogue = page.locator('#catalogue');
  await expect(catalogue).toBeVisible();
  await expect(catalogue.getByRole('heading', { name: /Choisir vite/i })).toBeVisible();
  await expect(catalogue.getByRole('button', { name: /Voir autour de moi/i })).toBeVisible();
});
