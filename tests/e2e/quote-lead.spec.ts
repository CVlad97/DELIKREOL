import { test, expect } from '@playwright/test';

test('catering quote requires an explicit WhatsApp send, with a working message', async ({ page }) => {
  await page.addInitScript(() => {
    (window as typeof window & { __quotedWhatsAppUrl?: string }).open = ((url?: string | URL) => {
      (window as typeof window & { __quotedWhatsAppUrl?: string }).__quotedWhatsAppUrl = String(url ?? '');
      return null;
    }) as typeof window.open;
  });
  await page.goto('/devis');
  await expect(page.getByRole('heading', { name: 'Demander un devis traiteur' })).toBeVisible();
  await page.locator('#nom').fill('Prospect Test');
  await page.locator('#telephone').fill('0696123456');
  await page.locator('#typeEvenement').selectOption({ label: 'Séminaire' });
  await page.locator('#date').fill('2026-12-15');
  await page.locator('#commune').selectOption({ index: 1 });
  await page.locator('#nombrePersonnes').fill('25');
  await page.getByRole('button', { name: /Préparer et envoyer via WhatsApp/ }).click();
  await expect(page.getByRole('heading', { name: 'Votre demande est prête' })).toBeVisible();
  const url = await page.evaluate(() => (window as typeof window & { __quotedWhatsAppUrl?: string }).__quotedWhatsAppUrl);
  expect(url).toMatch(/^https:\/\/wa\.me\/596696653589\?text=/);
  expect(decodeURIComponent(url || '')).toContain('Prospect Test');
  await expect(page.getByRole('link', { name: /Ouvrir WhatsApp pour envoyer/ })).toHaveAttribute('href', /wa\.me/);
  await expect(page.getByText(/appuyez sur « Envoyer »/)).toBeVisible();
});
