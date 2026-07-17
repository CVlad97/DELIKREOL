import { test, expect, type Page } from '@playwright/test';

async function expectElementCenteredInHeader(page: Page, testId: string) {
  const header = page.locator('header').first();
  const brand = page.getByTestId(testId);

  await expect(header).toBeVisible();
  await expect(brand).toBeVisible();
  await expect(brand).toContainText('DELIKREOL');

  const [headerBox, brandBox] = await Promise.all([
    header.boundingBox(),
    brand.boundingBox(),
  ]);

  expect(headerBox).not.toBeNull();
  expect(brandBox).not.toBeNull();

  const headerCenter = headerBox!.x + headerBox!.width / 2;
  const brandCenter = brandBox!.x + brandBox!.width / 2;
  expect(Math.abs(headerCenter - brandCenter)).toBeLessThanOrEqual(2);

  const headerOverflows = await header.evaluate((element) => (
    element.scrollWidth > element.clientWidth + 1
  ));
  expect(headerOverflows).toBe(false);
}

test.describe('En-tête DeliKreol centré et accessible', () => {
  for (const viewport of [
    { width: 320, height: 800 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
  ]) {
    test(`marque centrée à ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');

      await expectElementCenteredInHeader(page, 'header-brand-mobile');
      await expect(page.getByRole('button', { name: 'Ouvrir le menu' })).toBeVisible();
      await expect(page.getByRole('link', { name: /Panier/ }).first()).toBeVisible();
    });
  }

  test('menu mobile regroupe les actions secondaires', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/');

    await expect(page.getByLabel('Choisir la langue')).toBeHidden();
    await page.getByRole('button', { name: 'Ouvrir le menu' }).click();

    await expect(page.getByRole('navigation', { name: 'Navigation mobile' })).toBeVisible();
    await expect(page.getByLabel('Choisir la langue')).toBeVisible();
    await expect(page.getByRole('link', { name: /Se connecter|Mon espace/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Signaler un bug' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'WhatsApp' })).toBeVisible();
  });

  test('marque centrée sur ordinateur avec navigation simplifiée', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await expectElementCenteredInHeader(page, 'header-brand-desktop');
    await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Catalogue' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Traiteurs' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Commander' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Partenaire' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Signaler un bug' })).toBeHidden();
  });
});
