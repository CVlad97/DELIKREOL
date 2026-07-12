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
  await expect(page.getByRole('heading', { name: 'Catalogue' })).toBeVisible();

  const addButton = page.getByRole('button', { name: /Ajouter/i }).first();
  await expect(addButton).toBeVisible({ timeout: 15000 });
  await addButton.click();
  await expect(page.getByText(/ajouté au panier/i).first()).toBeVisible();
});

test('catalogue: search and filters render', async ({ page }) => {
  await page.goto('/catalogue');
  await expect(page.getByRole('heading', { name: 'Catalogue' })).toBeVisible();
  await expect(
    page.getByPlaceholder(/Rechercher un plat, (un )?traiteur ou (une )?commune/i)
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Plats', exact: true })).toBeVisible();

  const filtersButton = page.getByRole('button', { name: 'Filtres', exact: true });
  await expect(filtersButton).toBeVisible();
  await filtersButton.click();
  await expect(page.getByText('Budget', { exact: true })).toBeVisible();
  await expect(page.getByText('Commune', { exact: true })).toBeVisible();
});
