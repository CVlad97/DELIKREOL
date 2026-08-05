import { expect, test } from '@playwright/test';

test.describe('Accueil — source image fraîche', () => {
  test('la première photo produit est visible et chargée naturellement', async ({ page }) => {
    await page.goto('/');

    // La section produits contient "À commander maintenant"
    const productSection = page.locator('section').filter({ hasText: /À commander maintenant/i }).first();

    // La première image produit doit être visible
    const image = productSection.locator('img').first();
    await expect(image).toBeVisible({ timeout: 10000 });

    // Vérifier que l'image est bien chargée (naturalWidth > 0)
    const dimensions = await image.evaluate((element) => ({
      naturalWidth: (element as HTMLImageElement).naturalWidth,
      naturalHeight: (element as HTMLImageElement).naturalHeight,
    }));

    expect(dimensions.naturalWidth).toBeGreaterThan(0);
    expect(dimensions.naturalHeight).toBeGreaterThan(0);
  });
});
