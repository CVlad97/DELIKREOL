import { test, expect } from '@playwright/test';

test('lite tunnel main flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Repas créoles, menus locaux et commandes planifiées en Martinique')).toBeVisible();

  await page.getByRole('button', { name: /voir le menu/i }).first().click();
  await expect(page).toHaveURL(/\?vendor=/);
  await expect(page.getByRole('heading', { name: /Menu de/i })).toBeVisible();

  await page.getByRole('button', { name: /ajouter au panier/i }).first().click();
  const openCheckout = page.getByRole('button', { name: /ouvrir le checkout/i });
  await expect(openCheckout).toBeVisible();
  await openCheckout.click();

  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('input[placeholder="Nom"]').first()).toBeVisible();
  await dialog.locator('input[placeholder="Nom"]').fill('Client Test');
  await dialog.locator('input[placeholder="Telephone"]').fill('0612345678');
  await dialog.locator('input[placeholder="Adresse ou point de retrait"]').fill('Fort-de-France');
  await expect(page.getByText(/Recapitulatif/i)).toHaveCount(1);

  const whatsappCta = page.getByRole('link', { name: /valider sur whatsapp/i });
  await expect(whatsappCta).toBeVisible();
  const href = await whatsappCta.getAttribute('href');
  expect(href).toBeTruthy();
  expect(href).toMatch(/^https:\/\/wa\.me\//);
  expect(href).toContain('text=');
});

test('vendor deep-link valid', async ({ page }) => {
  await page.goto('/?vendor=Traiteur%20Kreyol%20FDF');
  await expect(page.getByRole('heading', { name: /Menu de/i })).toBeVisible();
});

test('vendor deep-link invalid is safe', async ({ page }) => {
  await page.goto('/?vendor=introuvable');
  await expect(page.getByRole('heading', { name: 'Vendeurs pilotes' })).toBeVisible();
  await expect(page.getByText(/Menu de introuvable/i)).toHaveCount(0);
});
