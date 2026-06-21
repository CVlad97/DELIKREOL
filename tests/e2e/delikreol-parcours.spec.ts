import { test, expect } from '@playwright/test';

test.describe('DeliKreol — Parcours utilisateur', () => {

  test('Page d\'accueil — affiche les éléments clés', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DeliKreol/);
    // Vérifier que le titre principal est visible
    await expect(page.locator('h1')).toContainText(/Commandez créole/);
    // Vérifier la présence du lien vers le catalogue
    await expect(page.locator('a[href*="catalogue"]').first()).toBeVisible();
  });

  test('Catalogue — affiche des produits', async ({ page }) => {
    await page.goto('/catalogue');
    await page.waitForLoadState('networkidle');
    // Vérifier qu'au moins un produit est présent
    await expect(page.locator('[class*="rounded-3xl"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('Traiteurs — page liste affiche les partenaires', async ({ page }) => {
    await page.goto('/traiteurs');
    await page.waitForLoadState('networkidle');
    // Vérifier que des cartes traiteurs sont affichées
    const cards = page.locator('a[href*="/traiteur/"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test('Page traiteur — contient hero + portrait + menu', async ({ page }) => {
    await page.goto('/traiteurs');
    await page.waitForLoadState('networkidle');
    // Cliquer sur le premier traiteur
    const firstTraiteurLink = page.locator('a[href*="/traiteur/"]').first();
    await firstTraiteurLink.click();
    await page.waitForLoadState('networkidle');
    // Vérifier le nom du traiteur
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    // Vérifier la présence du bouton "Ajouter au panier"
    await expect(page.locator('button:has-text("Ajouter")').first()).toBeVisible();
  });

  test('Ajout au panier — depuis le catalogue', async ({ page }) => {
    await page.goto('/catalogue');
    await page.waitForLoadState('networkidle');
    // Attendre que des boutons "Ajouter" soient visibles
    const addButtons = page.locator('button:has-text("Ajouter")');
    await expect(addButtons.first()).toBeVisible({ timeout: 15000 });
    // Cliquer sur "Ajouter" du premier produit
    await addButtons.first().click();
    // Vérifier qu'une notification de succès apparaît
    await expect(page.locator('text=ajouté au panier').or(page.locator('[class*="toast"]')).first()).toBeVisible({ timeout: 5000 });
  });

  test('Contact page — formulaire visible', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText(/Contact/);
    await expect(page.locator('form')).toBeVisible();
    // Vérifier les coordonnées (WhatsApp, email)
    await expect(page.locator('text=@delikreol.mq').or(page.locator('text=696'))).toBeVisible();
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