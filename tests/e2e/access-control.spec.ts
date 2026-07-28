import { expect, test, type Page } from '@playwright/test';

type DemoRole = 'admin' | 'vendor' | 'driver' | 'relay_host' | 'customer';

async function installDemoSession(page: Page, role: DemoRole, email = `${role}@demo.delikreol.local`) {
  await page.addInitScript(({ role, email }) => {
    const id = `demo_${role}_access`;
    window.localStorage.setItem('delikreol_demo_override', 'true');
    window.localStorage.setItem('delikreol_demo_session', JSON.stringify({ userId: id, email }));
    window.localStorage.setItem('delikreol_demo_profiles', JSON.stringify([
      {
        id,
        full_name: `Demo ${role}`,
        phone: '+596696000000',
        user_type: role,
        avatar_url: null,
        created_at: new Date().toISOString(),
        email,
        contact_email: email,
      },
    ]));
  }, { role, email });
}

test.describe('Accès admin et partenaires', () => {
  test('redirige admin non connecté vers connexion avec retour', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/connexion\?next=%2Fadmin/);
    await expect(page.getByRole('heading', { name: /Se connecter/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Connexion admin/i })).toBeVisible();
  });

  test('redirige partenaire non connecté vers connexion avec retour', async ({ page }) => {
    await page.goto('/espace-partenaire');
    await expect(page).toHaveURL(/\/connexion\?next=%2Fespace-partenaire/);
    await expect(page.getByRole('heading', { name: /Se connecter/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Traiteur', exact: true })).toBeVisible();
  });

  test('bloque admin pour un compte client', async ({ page }) => {
    await installDemoSession(page, 'customer');
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: /Accès réservé/i })).toBeVisible();
  });

  test('bloque espace partenaire pour un compte client', async ({ page }) => {
    await installDemoSession(page, 'customer');
    await page.goto('/espace-partenaire');
    await expect(page.getByRole('heading', { name: /Accès partenaire à activer/i })).toBeVisible();
  });

  test('ouvre admin pour un profil admin', async ({ page }) => {
    await installDemoSession(page, 'admin', 'admin@demo.delikreol.local');
    await page.goto('/admin');
    await expect(page.getByText(/Admin DeliKreol/i).first()).toBeVisible();
    await expect(page.getByText(/Accès réservé/i)).toHaveCount(0);
  });

  test('reprend la redirection admin après retour OAuth ou OTP', async ({ page }) => {
    await installDemoSession(page, 'admin', 'admin@demo.delikreol.local');
    await page.addInitScript(() => {
      window.localStorage.setItem('delikreol_auth_next', '/admin');
    });
    await page.goto('/');
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText(/Admin DeliKreol/i).first()).toBeVisible();
  });

  test('ouvre espace partenaire pour un profil vendeur', async ({ page }) => {
    await installDemoSession(page, 'vendor');
    await page.goto('/espace-partenaire');
    await expect(page.getByRole('heading', { name: /Mes documents/i })).toBeVisible();
    await expect(page.getByText(/Portail partenaire/i)).toBeVisible();
  });

  test('reprend la redirection partenaire après retour OAuth ou OTP', async ({ page }) => {
    await installDemoSession(page, 'vendor');
    await page.addInitScript(() => {
      window.localStorage.setItem('delikreol_auth_next', '/espace-partenaire');
    });
    await page.goto('/');
    await expect(page).toHaveURL(/\/espace-partenaire$/);
    await expect(page.getByRole('heading', { name: /Mes documents/i })).toBeVisible();
  });

  test('Google affiche une erreur claire en mode démo', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('delikreol_demo_override', 'true'));
    await page.goto('/connexion?next=/admin');
    await page.getByRole('button', { name: /Continuer avec Google/i }).click();
    await expect(page.getByText(/Connexion Google indisponible sans Supabase/i)).toBeVisible();
  });

  test('Google indisponible affiche un message local sans quitter le site', async ({ page }) => {
    await page.goto('/connexion?next=/admin');
    await page.getByRole('button', { name: /Continuer avec Google/i }).click();
    await expect(page).toHaveURL(/\/connexion/);
    await expect(page.getByText(/Connexion Google (indisponible sans Supabase|en cours de configuration)/i)).toBeVisible();
  });
});
