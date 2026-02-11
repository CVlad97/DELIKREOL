import { test, expect } from '@playwright/test';

/**
 * Tests E2E: Journey complet d'un client
 * Flow: Visite → Inscription → Commande → Paiement → Suivi
 */

test.describe('Customer Journey - DeliKreol', () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page d'accueil
    await page.goto('/');
    
    // Vérifier que l'app charge correctement
    await expect(page).toHaveTitle(/DeliKreol|DELIKREOL/i);
  });

  test('should load homepage and display vendors', async ({ page }) => {
    // Attendre le chargement des vendeurs
    await page.waitForSelector('[data-testid="vendor-list"]', { timeout: 10000 });
    
    // Vérifier qu'au moins 1 vendeur est affiché
    const vendors = page.locator('[data-testid="vendor-card"]');
    await expect(vendors).toHaveCount(3, { timeout: 5000 });

    // Vérifier le contenu du premier vendeur
    const firstVendor = vendors.first();
    await expect(firstVendor).toContainText(/Accras|Colombo|Poisson/i);
  });

  test('should register new client', async ({ page }) => {
    // Cliquer sur "S'inscrire"
    await page.click('text=S\'inscrire');

    // Remplir le formulaire
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="full_name"]', 'Test Client');
    await page.fill('[name="phone"]', '+596696999999');

    // Sélectionner le rôle "Client"
    await page.selectOption('[name="role"]', 'client');

    // Soumettre
    await page.click('button[type="submit"]');

    // Vérifier la redirection vers le tableau de bord
    await page.waitForURL(/\/dashboard|\/client/i, { timeout: 10000 });
    
    // Vérifier le message de bienvenue
    await expect(page.locator('text=Bienvenue')).toBeVisible({ timeout: 5000 });
  });

  test('should browse vendors and view menu', async ({ page }) => {
    // Cliquer sur le premier vendeur
    await page.click('[data-testid="vendor-card"]:first-child');

    // Attendre le chargement du menu
    await page.waitForSelector('[data-testid="product-list"]', { timeout: 10000 });

    // Vérifier qu'il y a des produits affichés
    const products = page.locator('[data-testid="product-card"]');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);

    // Vérifier qu'un produit a un prix
    const firstProduct = products.first();
    await expect(firstProduct.locator('[data-testid="product-price"]')).toBeVisible();
  });

  test('should add product to cart and checkout', async ({ page }) => {
    // Se connecter d'abord (utiliser un compte de test existant)
    await page.goto('/login');
    await page.fill('[name="email"]', 'pierre.dupont@example.com'); // Client de test
    await page.fill('[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard|\/home/i, { timeout: 10000 });

    // Aller sur la page des vendeurs
    await page.goto('/vendors');
    await page.click('[data-testid="vendor-card"]:first-child');

    // Ajouter un produit au panier
    await page.click('[data-testid="add-to-cart"]:first-child');

    // Vérifier que le panier est mis à jour
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('1');

    // Aller au panier
    await page.click('[data-testid="cart-button"]');

    // Vérifier le contenu du panier
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

    // Procéder au checkout
    await page.click('text=Commander');

    // Sélectionner le mode de livraison
    await page.click('[data-testid="delivery-mode-home"]');
    await page.fill('[name="delivery_address"]', '32 Rue Test, Fort-de-France 97200');

    // Sélectionner un créneau horaire
    await page.selectOption('[name="time_slot"]', '12:00-14:00');

    // Confirmer la commande
    await page.click('button:has-text("Confirmer la commande")');

    // Attendre la redirection vers la page de paiement
    await page.waitForURL(/\/payment|\/checkout/i, { timeout: 10000 });

    // Vérifier l'affichage du récapitulatif
    await expect(page.locator('text=Récapitulatif')).toBeVisible();
  });

  test('should track delivery in real-time', async ({ page }) => {
    // Se connecter
    await page.goto('/login');
    await page.fill('[name="email"]', 'pierre.dupont@example.com');
    await page.fill('[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/i, { timeout: 10000 });

    // Aller dans "Mes commandes"
    await page.click('text=Mes commandes');

    // Cliquer sur une commande en cours
    await page.click('[data-testid="order-card"][data-status="in_delivery"]:first-child');

    // Vérifier que la carte de suivi est affichée
    await expect(page.locator('[data-testid="delivery-tracking"]')).toBeVisible();

    // Vérifier la présence de la carte (Leaflet ou Google Maps)
    const map = page.locator('[data-testid="delivery-map"]');
    await expect(map).toBeVisible({ timeout: 5000 });

    // Vérifier l'affichage des informations du livreur
    await expect(page.locator('[data-testid="driver-info"]')).toContainText(/Livreur|Driver/i);

    // Vérifier l'heure estimée d'arrivée
    await expect(page.locator('[data-testid="estimated-arrival"]')).toBeVisible();
  });

  test('should display loyalty points after order', async ({ page }) => {
    // Se connecter
    await page.goto('/login');
    await page.fill('[name="email"]', 'pierre.dupont@example.com');
    await page.fill('[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/i, { timeout: 10000 });

    // Aller dans le profil
    await page.click('[data-testid="profile-button"]');

    // Vérifier l'affichage des points de fidélité
    const loyaltyPoints = page.locator('[data-testid="loyalty-points"]');
    await expect(loyaltyPoints).toBeVisible();

    // Vérifier que la valeur est numérique et positive
    const pointsText = await loyaltyPoints.textContent();
    const points = parseFloat(pointsText?.replace(/[^\d.]/g, '') || '0');
    expect(points).toBeGreaterThanOrEqual(0);
  });

  test('should navigate with Waze or Google Maps', async ({ page, context }) => {
    // Se connecter
    await page.goto('/login');
    await page.fill('[name="email"]', 'michael.livraison@example.com'); // Driver de test
    await page.fill('[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/driver/i, { timeout: 10000 });

    // Aller dans "Livraisons en cours"
    await page.click('text=Livraisons en cours');

    // Cliquer sur une livraison
    await page.click('[data-testid="delivery-card"]:first-child');

    // Vérifier la présence du composant de navigation
    await expect(page.locator('[data-testid="delivery-navigation"]')).toBeVisible();

    // Vérifier les boutons Waze et Google Maps
    const wazeButton = page.locator('a[href*="waze.com"]');
    const mapsButton = page.locator('a[href*="google.com/maps"]');

    await expect(wazeButton).toBeVisible();
    await expect(mapsButton).toBeVisible();

    // Vérifier que les liens s'ouvrent dans un nouvel onglet
    await expect(wazeButton).toHaveAttribute('target', '_blank');
    await expect(mapsButton).toHaveAttribute('target', '_blank');
  });

  test('should optimize delivery route', async ({ page }) => {
    // Se connecter en tant que livreur
    await page.goto('/login');
    await page.fill('[name="email"]', 'michael.livraison@example.com');
    await page.fill('[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/driver/i, { timeout: 10000 });

    // Aller dans "Optimiser ma tournée"
    await page.click('text=Optimiser tournée');

    // Attendre le chargement de la liste de livraisons
    await page.waitForSelector('[data-testid="delivery-list"]', { timeout: 10000 });

    // Cliquer sur "Calculer l'itinéraire optimal"
    await page.click('button:has-text("Calculer itinéraire")');

    // Attendre le résultat de l'optimisation
    await page.waitForSelector('[data-testid="optimized-route"]', { timeout: 15000 });

    // Vérifier les informations de la route optimisée
    await expect(page.locator('[data-testid="total-distance"]')).toBeVisible();
    await expect(page.locator('[data-testid="estimated-duration"]')).toBeVisible();

    // Vérifier qu'il y a un ordre de livraison
    const stops = page.locator('[data-testid="route-stop"]');
    const count = await stops.count();
    expect(count).toBeGreaterThan(0);
  });
});
