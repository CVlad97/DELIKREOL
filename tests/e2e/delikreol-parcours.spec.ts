import { test, expect } from '@playwright/test';

test.describe('DeliKreol — Parcours utilisateur', () => {
  test('Page d’accueil — affiche les trois parcours clés', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DeliKreol/);
    await expect(
      page.getByRole('heading', { name: /Le goût local, simple à commander/i })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Voir les offres/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Demander un devis/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Devenir partenaire/i }).first()).toBeVisible();
  });

  test('Catalogue — affiche des produits', async ({ page }) => {
    await page.goto('/catalogue');
    await expect(page.getByRole('heading', { name: 'Catalogue' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Ajouter au panier/i }).first()).toBeVisible({ timeout: 15_000 });
  });

  test('Traiteurs — page liste affiche les partenaires', async ({ page }) => {
    await page.goto('/traiteurs');
    const cards = page.locator('a[href*="/traiteur/"]');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
  });

  test('Page traiteur — contient présentation et menu', async ({ page }) => {
    await page.goto('/traiteurs');
    const firstTraiteurLink = page.locator('a[href*="/traiteur/"]').first();
    await expect(firstTraiteurLink).toBeVisible({ timeout: 10_000 });
    await firstTraiteurLink.click();
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Ajouter/i }).first()).toBeVisible();
  });

  test('Ajout au panier — depuis le catalogue', async ({ page }) => {
    await page.goto('/catalogue');
    const addButton = page.getByRole('button', { name: /Ajouter au panier/i }).first();
    await expect(addButton).toBeVisible({ timeout: 15_000 });
    await addButton.click();
    await expect(
      page.getByText(/ajouté au panier/i).or(page.locator('[class*="toast"]')).first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('Contact page — formulaire et contact visibles', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText(/Contact/);
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('a[href="mailto:contact@delikreol.com"]').first()).toBeVisible();
  });

  test('Pages légales — accessibles', async ({ page }) => {
    await page.goto('/confidentialite');
    await expect(page.locator('h1')).toContainText(/Confidentialité/);
    await page.goto('/cgv');
    await expect(page.locator('h1')).toContainText(/CGV|Conditions/);
    await page.goto('/cookies');
    await expect(page.locator('h1')).toContainText(/Cookies/);
  });
});
