import { expect, test, type Locator, type Page } from '@playwright/test';

async function loadAndValidateThumbnails(page: Page, thumbnails: Locator) {
  const total = await thumbnails.count();
  expect(total).toBeGreaterThan(0);

  const images = thumbnails.locator('img[data-smart-image="true"]');
  await images.evaluateAll((items) => {
    for (const image of items) image.loading = 'eager';
  });

  for (let index = 0; index < total; index += 8) {
    await thumbnails.nth(index).scrollIntoViewIfNeeded();
  }
  await thumbnails.last().scrollIntoViewIfNeeded();

  await expect.poll(
    async () => images.evaluateAll((items) => items.every((image) => image.complete)),
    { timeout: 20_000, intervals: [250, 500, 1000] },
  ).toBe(true);

  await expect.poll(
    async () => images.evaluateAll((items) => (
      items.filter((image) => image.complete && image.naturalWidth === 0).length
    )),
    { timeout: 10_000, intervals: [250, 500, 1000] },
  ).toBe(0);

  const broken = await images.evaluateAll((items) => (
    items
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src)
  ));
  expect(broken).toEqual([]);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}

async function readAudit(thumbnails: Locator) {
  return thumbnails.evaluateAll((items) => {
    const counts: Record<string, number> = { product: 0, partner: 0, placeholder: 0 };
    for (const item of items) {
      const source = item.getAttribute('data-thumbnail-source') || 'unknown';
      counts[source] = (counts[source] || 0) + 1;
    }
    return counts;
  });
}

test('catalogue only displays products with verified usable thumbnails', async ({ page }) => {
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

  await loadAndValidateThumbnails(page, thumbnails);
  const audit = await readAudit(thumbnails);
  console.log('THUMBNAIL_AUDIT_CATALOGUE', JSON.stringify({ totalCards, ...audit }));
  expect(audit.placeholder || 0).toBe(0);
  await expect(grid.getByText('Photo à venir')).toHaveCount(0);
  await expect(grid.getByText('An Tjè Coco')).toHaveCount(0);
  await expect(grid.getByText('Gouté Mwen')).toHaveCount(0);

  const overflow = await page.evaluate(() => (
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  ));
  expect(overflow).toBe(false);
});

for (const slug of ['snack-save-peyia', 'les-delices-de-ninice']) {
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

    await loadAndValidateThumbnails(page, thumbnails);
    const audit = await readAudit(thumbnails);
    console.log('THUMBNAIL_AUDIT_PARTNER', JSON.stringify({ slug, totalCards, ...audit }));
    expect(audit.placeholder || 0).toBe(0);
    await expect(catalogue.getByText('Photo à venir')).toHaveCount(0);
  });
}

test('goute mwen keeps its profile without unverified product photos', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/traiteur/goute-mwen', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Gouté Mwen' })).toBeVisible();
  await expect(page.locator('[data-partner-catalogue="true"]')).toHaveCount(0);
  await expect(page.getByText('Le catalogue est en cours de préparation.')).toBeVisible();
  await expect(page.getByText('Photo à venir')).toHaveCount(0);
});
