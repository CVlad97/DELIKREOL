import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`homepage stays inside viewport on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /À commander maintenant/i })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Produits à commander' })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => (
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    ));
    expect(hasHorizontalOverflow).toBe(false);

    const catalogueLink = page.getByRole('link', { name: /Catalogue complet/i });
    await expect(catalogueLink).toBeVisible();
    const catalogueBox = await catalogueLink.boundingBox();
    expect(catalogueBox).not.toBeNull();
    expect(catalogueBox!.x).toBeGreaterThanOrEqual(0);
    expect(catalogueBox!.x + catalogueBox!.width).toBeLessThanOrEqual(viewport.width + 1);

    const firstCard = page.getByRole('region', { name: 'Produits à commander' }).locator('a').first();
    const firstCardBox = await firstCard.boundingBox();
    expect(firstCardBox).not.toBeNull();
    expect(firstCardBox!.x).toBeGreaterThanOrEqual(0);
    expect(firstCardBox!.x + firstCardBox!.width).toBeLessThanOrEqual(viewport.width + 1);
  });
}

test('Save Peyi verified food photograph keeps natural colours and fills the card', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });

  const image = page.locator('img[src*="/vendors/save-peyia/"]').first();
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('src', /\?v=20260718-1$/);

  const style = await image.evaluate((element) => {
    const computed = window.getComputedStyle(element);
    return {
      objectFit: computed.objectFit,
      filter: computed.filter,
      mixBlendMode: computed.mixBlendMode,
    };
  });

  expect(style.objectFit).toBe('cover');
  expect(style.filter).toBe('none');
  expect(style.mixBlendMode).toBe('normal');
});
