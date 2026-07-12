import { expect, test, type Locator, type Page } from '@playwright/test';

type Rgb = [number, number, number];

function parseRgb(value: string): Rgb {
  const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
  if (channels.length !== 3) throw new Error(`Couleur CSS non reconnue : ${value}`);
  return channels as Rgb;
}

function luminance([red, green, blue]: Rgb): number {
  const linear = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(first: Rgb, second: Rgb): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

async function computedPair(locator: Locator, foregroundProperty = 'color', backgroundProperty = 'backgroundColor') {
  return locator.evaluate((element, properties) => {
    const style = getComputedStyle(element);
    return {
      foreground: style.getPropertyValue(properties.foregroundProperty),
      background: style.getPropertyValue(properties.backgroundProperty),
    };
  }, { foregroundProperty, backgroundProperty });
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

test('primary actions keep AA text contrast before and during hover', async ({ page }) => {
  await page.goto('/catalogue', { waitUntil: 'domcontentloaded' });
  const action = page.getByRole('button', { name: /Ajouter/i }).first();
  await expect(action).toBeVisible();

  const normal = await computedPair(action);
  expect(contrastRatio(parseRgb(normal.foreground), parseRgb(normal.background))).toBeGreaterThanOrEqual(4.5);

  await action.hover();
  const hovered = await computedPair(action);
  expect(contrastRatio(parseRgb(hovered.foreground), parseRgb(hovered.background))).toBeGreaterThanOrEqual(4.5);
});

test('public form controls have a visible 3:1 boundary', async ({ page }) => {
  await page.goto('/devenir-point-relais', { waitUntil: 'domcontentloaded' });
  const control = page.locator('input').first();
  await expect(control).toBeVisible();

  const colours = await computedPair(control, 'border-top-color', 'background-color');
  expect(contrastRatio(parseRgb(colours.foreground), parseRgb(colours.background))).toBeGreaterThanOrEqual(3);
});

test('catalogue product thumbnails share the same 4:3 format', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/catalogue', { waitUntil: 'domcontentloaded' });

  const thumbnails = page.locator('[data-catalogue-grid="true"] [data-thumbnail-source] [data-smart-image-container="true"]');
  await expect(thumbnails.first()).toBeVisible();
  const count = Math.min(await thumbnails.count(), 12);

  for (let index = 0; index < count; index += 1) {
    const box = await thumbnails.nth(index).boundingBox();
    expect(box).not.toBeNull();
    expect((box?.width ?? 0) / (box?.height ?? 1)).toBeCloseTo(4 / 3, 1);
  }
});

for (const route of ['/', '/catalogue', '/traiteurs', '/devenir-point-relais']) {
  test(`${route} reflows at 320 CSS pixels`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expectNoHorizontalOverflow(page);
  });
}

test('main touch actions meet the 24 CSS pixel minimum', async ({ page }) => {
  await page.goto('/catalogue', { waitUntil: 'domcontentloaded' });
  const targets = [
    page.getByRole('button', { name: /Filtres/i }).first(),
    page.getByRole('button', { name: /Ajouter/i }).first(),
    page.getByRole('button', { name: /Près de moi/i }).first(),
  ];

  for (const target of targets) {
    await expect(target).toBeVisible();
    const box = await target.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
  }
});
