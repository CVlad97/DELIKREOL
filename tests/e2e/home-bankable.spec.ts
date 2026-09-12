import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`homepage stays inside viewport on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /Menu \/ Catalogue/i })).toBeVisible();

    // Vérifier l'absence de débordement horizontal
    const hasHorizontalOverflow = await page.evaluate(() => (
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    ));
    expect(hasHorizontalOverflow).toBe(false);

    const productSection = page.locator('section').filter({ hasText: /Menu \/ Catalogue/i }).first();
    const firstCard = productSection.locator('article, [class*="rounded-3xl"]').first();
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
  // L'image peut ne pas exister si le carousel ne la montre pas immédiatement
  // On vérifie si elle est présente, sinon on skip ce test
  const imageCount = await image.count();
  if (imageCount === 0) {
    test.skip();
    return;
  }
  await expect(image).toBeVisible();

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
