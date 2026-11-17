import { expect, test, type Locator, type Page } from '@playwright/test';

async function loadAndValidateThumbnails(page: Page, thumbnails: Locator) {
  const images = thumbnails.locator('img[data-smart-image="true"]');
  await expect.poll(async () => images.evaluateAll((items) => {
    for (const image of items) image.loading = 'eager';
    return items.length;
  }), { timeout: 20_000 }).toBeGreaterThan(0);

  await expect.poll(async () => images.evaluateAll((items) => {
    for (const image of items) image.loading = 'eager';
    return items.length > 0 && items.every((image) => image.complete && image.naturalWidth > 0);
  }), { timeout: 20_000 }).toBe(true);

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
  await page.goto('/catalogue', { waitUntil: 'networkidle' });

  const grid = page.locator('[data-catalogue-grid="true"]');
  await expect(grid).toBeVisible();

  const cards = grid.locator('[data-product-card]');
  const thumbnails = grid.locator('[data-thumbnail-source]');
  const totalCards = await cards.count();

  expect(totalCards).toBeGreaterThan(0);
  await expect(thumbnails).toHaveCount(totalCards);

  await loadAndValidateThumbnails(page, thumbnails);
  const audit = await readAudit(thumbnails);
  console.log('THUMBNAIL_AUDIT_CATALOGUE', JSON.stringify({ totalCards, ...audit }));
  expect(audit.placeholder || 0).toBe(0);
  await expect(grid.getByText('Photo à venir')).toHaveCount(0);
  await expect(grid.getByText('An Tjè Coco')).toHaveCount(0);
  expect(await grid.getByText('Gouté Mwen').count()).toBeGreaterThan(0);

  const overflow = await page.evaluate(() => (
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  ));
  expect(overflow).toBe(false);
});

for (const slug of ['snack-save-peyia', 'les-delices-de-ninice']) {
  test(`partner catalogue ${slug} has a thumbnail for every item`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/traiteur/${slug}`, { waitUntil: 'networkidle' });

    const catalogue = page.locator('[data-partner-catalogue="true"]');
    await expect(catalogue).toBeVisible();

    const cards = catalogue.locator('article');
    const thumbnails = catalogue.locator('[data-thumbnail-source]');
    const totalCards = await cards.count();
    expect(totalCards).toBeGreaterThan(0);
    await expect(thumbnails).toHaveCount(totalCards);

    await loadAndValidateThumbnails(page, thumbnails);
    const audit = await readAudit(thumbnails);
    console.log('THUMBNAIL_AUDIT_PARTNER', JSON.stringify({ slug, totalCards, ...audit }));
    expect(audit.placeholder || 0).toBe(0);
    await expect(catalogue.getByText('Photo à venir')).toHaveCount(0);
  });
}

test('goute mwen displays imported usable product photos', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/traiteur/goute-mwen', { waitUntil: 'networkidle' });

  await expect(page.getByRole('heading', { name: 'Gouté Mwen' })).toBeVisible();
  const catalogue = page.locator('[data-partner-catalogue="true"]');
  await expect(catalogue).toBeVisible();
  const thumbnails = catalogue.locator('[data-thumbnail-source]');
  expect(await thumbnails.count()).toBeGreaterThan(0);
  await loadAndValidateThumbnails(page, thumbnails);
  await expect(page.getByText('Photo à venir')).toHaveCount(0);
});

test('catalogue product photo opens in large preview and closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/catalogue', { waitUntil: 'networkidle' });

  const previewButton = page.getByRole('button', { name: /Voir .* en gros plan/i }).first();
  await expect(previewButton).toBeVisible({ timeout: 15_000 });
  await previewButton.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img').first()).toBeVisible();

  await page.getByRole('button', { name: 'Fermer la photo en gros plan' }).click();
  await expect(dialog).toHaveCount(0);
});
