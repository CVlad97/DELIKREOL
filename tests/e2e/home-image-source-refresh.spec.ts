import { expect, test } from '@playwright/test';

test.describe('Accueil — source image fraîche', () => {
  test('la première photo produit utilise la version locale révisée et un cadrage food', async ({ page }) => {
    await page.goto('/');

    const carousel = page.getByRole('region', { name: 'Produits à commander' });
    await expect(carousel).toBeVisible();

    const image = carousel.locator('img[data-smart-image="true"]').first();
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('src', /drive-01\.webp\?v=20260718-1$/);

    const container = image.locator('..');
    await expect(container).toHaveAttribute('data-image-kind', 'food');
    await expect(container).toHaveAttribute('data-image-fit', 'cover');

    const dimensions = await image.evaluate((element) => ({
      naturalWidth: (element as HTMLImageElement).naturalWidth,
      naturalHeight: (element as HTMLImageElement).naturalHeight,
    }));

    expect(dimensions.naturalWidth).toBeGreaterThan(0);
    expect(dimensions.naturalHeight).toBeGreaterThan(0);
  });
});
