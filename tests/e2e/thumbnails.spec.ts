import { expect, test } from '@playwright/test';

async function expectNoBrokenImages(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => {
    const images = Array.from(document.images);
    return images.every((image) => image.complete);
  });

  const broken = await page.locator('img').evaluateAll((images) => (
    images
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src)
  ));

  expect(broken).toEqual([]);
}

test('catalogue integrates all missing thumbnails with honest fallbacks', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/catalogue', { waitUntil: 'domcontentloaded' });

  const grid = page.locator('[data-catalogue-grid="true"]');
  await expect(grid).toBeVisible();

  const cards = grid.locator('[data-product-card]');
  const thumbnails = grid.locator('[data-thumbnail-source]');
  const totalCards = await cards.count();
  const totalThumbnails = await thumbnails.count();

  expect(totalCards).toBeGreaterThan(0);
  expect(totalThumbnails).toBe(totalCards);

  const audit = await thumbnails.evaluateAll((items) => {
    const counts: Record<string, number> = { product: 0, partner: 0, placeholder: 0 };
    for (const item of items) {
      const source = item.getAttribute('data-thumbnail-source') || 'unknown';
      counts[source] = (counts[source] || 0) + 1;
    }
    return counts;
  });

  console.log('THUMBNAIL_AUDIT_CATALOGUE', JSON.stringify({ totalCards, ...audit }));

  for (const source of ['partner', 'placeholder']) {
    const fallbackItems = thumbnails.locator(`[data-thumbnail-source="${source}"]`);
    const count = await fallbackItems.count();
    for (let index = 0; index < count; index += 1) {
      const item = fallbackItems.nth(index);
      await expect(item.getByText(source === 'partner' ? 'Visuel du partenaire' : 'Photo à venir')).toBeVisible();
    }
  }

  await expectNoBrokenImages(page);

  const overflow = await page.evaluate(() => (
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  ));
  expect(overflow).toBe(false);
});

for (const slug of ['goute-mwen', 'snack-save-peyia', 'les-delices-de-ninice']) {
  test(`partner catalogue ${slug} has a thumbnail for every item`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/traiteur/${slug}`, { waitUntil: 'domcontentloaded' });

    const catalogue = page.locator('[data-partner-catalogue="true"]');
    await expect(catalogue).toBeVisible();

    const cards = catalogue.locator('article');
    const thumbnails = catalogue.locator('[data-thumbnail-source]');
    const totalCards = await cards.count();
    const totalThumbnails = await thumbnails.count();

    expect(totalCards).toBeGreaterThan(0);
    expect(totalThumbnails).toBe(totalCards);

    const audit = await thumbnails.evaluateAll((items) => {
      const counts: Record<string, number> = { product: 0, partner: 0, placeholder: 0 };
      for (const item of items) {
        const source = item.getAttribute('data-thumbnail-source') || 'unknown';
        counts[source] = (counts[source] || 0) + 1;
      }
      return counts;
    });

    console.log('THUMBNAIL_AUDIT_PARTNER', JSON.stringify({ slug, totalCards, ...audit }));
    await expectNoBrokenImages(page);
  });
}
