import { test, expect } from '@playwright/test';

test('public home: hero CTA opens catalogue and product can be added', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /Commandez créole local en Martinique/i })
  ).toBeVisible();

  const catalogueCta = page.getByRole('link', { name: /Commander maintenant/i }).first();
  await expect(catalogueCta).toBeVisible();
  await catalogueCta.click();

  await expect(page).toHaveURL(/\/catalogue/);
    const cookieAccept = page.getByRole('button', { name: /Tout accepter/i });
    if (await cookieAccept.isVisible()) await cookieAccept.click();
  await expect(page.getByRole('heading', { name: 'Catalogue' }).first()).toBeVisible();

  const addButton = page.getByRole('button', { name: /Ajouter/i }).first();
  await expect(addButton).toBeVisible({ timeout: 15000 });
  await addButton.click();

  const dialog = page.getByRole('dialog');
  if (await dialog.isVisible()) {
    const groups = dialog.getByRole('group');
    for (let index = 0; index < await groups.count(); index += 1) {
      const checkboxes = groups.nth(index).getByRole('checkbox');
      if (await checkboxes.count()) await checkboxes.first().check();
    }
    await dialog.getByRole('button', { name: /Ajouter au panier/i }).click();
  }

  await expect(page.getByRole('link', { name: /Panier, 1 article/i })).toBeVisible();
});

test('catalogue: search and filters render', async ({ page }) => {
  await page.goto('/catalogue');
  await expect(page.getByRole('heading', { name: 'Catalogue' }).first()).toBeVisible();
  await expect(
    page.getByPlaceholder(/Rechercher un plat, (un )?traiteur ou (une )?commune/i)
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Plats', exact: true })).toBeVisible();

  const filtersButton = page.getByRole('button', { name: 'Filtres', exact: true });
  await expect(filtersButton).toBeVisible();
  await filtersButton.click();
  await expect(page.getByLabel('Budget')).toBeVisible();
  await expect(page.getByLabel('Commune')).toBeVisible();
});
