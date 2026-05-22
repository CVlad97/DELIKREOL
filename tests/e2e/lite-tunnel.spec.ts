import { test, expect } from '@playwright/test';

test('public home: add product to cart (selection) shows mobile bottom bar', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Le r.*flexe local/i })).toBeVisible();

  const addButton = page.getByTestId('add-to-cart').first();
  await expect(addButton).toBeVisible();
  await addButton.click();

  const mobileBar = page.getByTestId('mobile-cart-bar');
  await expect(mobileBar).toBeVisible();
  await expect(mobileBar.getByText(/1 article\(s\)/i)).toBeVisible();
  await expect(mobileBar.getByRole('button', { name: /Voir panier/i })).toBeVisible();
});

test('public home: catalogue and filters render', async ({ page }) => {
  await page.goto('/');
  const catalogue = page.locator('#catalogue');
  await expect(catalogue).toBeVisible();
  await expect(catalogue.getByRole('heading', { name: /Choisir vite/i })).toBeVisible();
  const geoButton = catalogue.getByRole('button', { name: /Me géolocaliser/i });
  await expect(geoButton).toBeVisible();
  await geoButton.click();
  await expect(catalogue.getByText(/Souhaitez-vous être géolocalisé/i)).toBeVisible();
});
