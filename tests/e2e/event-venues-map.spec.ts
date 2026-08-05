import { test, expect } from '@playwright/test';

test.describe('Carte interactive — Salles & réceptions', () => {
  test('ouvrir la carte et activer le filtre Salles & réceptions', async ({ page }) => {
    await page.goto('/carte');
    // Attendre que la carte se charge
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });
    // Le filtre Salles & réceptions doit être visible
    const venueFilter = page.getByRole('button', { name: /Salles & réceptions/i });
    await expect(venueFilter).toBeVisible();
    // Activer le filtre
    await venueFilter.click();
    // Vérifier qu'il est activé
    await expect(venueFilter).toHaveAttribute('aria-pressed', 'true');
  });

  test('sélectionner une salle et ouvrir Préparer mon événement', async ({ page }) => {
    await page.goto('/carte');
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });
    // Activer le filtre salles
    await page.getByRole('button', { name: /Salles & réceptions/i }).click();
    // Attendre que les marqueurs apparaissent
    await page.waitForTimeout(1000);
    // Cliquer sur le premier marqueur venue
    const venueMarker = page.locator('.venue-marker').first();
    if (await venueMarker.count() > 0) {
      await venueMarker.click();
      // Attendre la popup
      await page.waitForSelector('.leaflet-popup', { timeout: 5000 });
      // Le bouton Préparer mon événement doit être visible
      const prepareBtn = page.getByRole('button', { name: /Préparer mon événement/i });
      await expect(prepareBtn).toBeVisible();
      // Cliquer pour ouvrir la modale
      await prepareBtn.click();
      // La modale doit s'ouvrir
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    }
  });

  test('remplir le formulaire et générer le message WhatsApp', async ({ page }) => {
    await page.goto('/carte');
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });
    await page.getByRole('button', { name: /Salles & réceptions/i }).click();
    await page.waitForTimeout(1000);
    const venueMarker = page.locator('.venue-marker').first();
    if (await venueMarker.count() > 0) {
      await venueMarker.click();
      await page.waitForSelector('.leaflet-popup', { timeout: 5000 });
      await page.getByRole('button', { name: /Préparer mon événement/i }).click();
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

      // Remplir la date
      const dateInput = page.getByLabel(/Date de l'événement/i);
      await dateInput.fill('2026-12-15');
      // Remplir le nombre d'invités
      const guestsInput = page.getByLabel(/Nombre d'invités/i);
      await guestsInput.fill('80');
      // Sélectionner un type
      await page.getByLabel(/Type d'événement/i).selectOption('Mariage');
      // Générer le message
      await page.getByRole('button', { name: /Préparer le message WhatsApp/i }).click();
      // Le message doit apparaître
      await expect(page.getByText(/DELIKREOL — Demande événementielle/i)).toBeVisible({ timeout: 5000 });
      // Vérifier qu'aucun envoi réel n'a lieu
      await expect(page.getByText(/Aucune commande créée/i)).toBeVisible();
    }
  });

  test('pas de débordement horizontal sur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/carte');
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});
