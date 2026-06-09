import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';

const BASE = 'https://cvlad97.github.io/DELIKREOL';

const PAGES = [
  { path: '/', name: 'Accueil' },
  { path: '/catalogue', name: 'Catalogue' },
  { path: '/traiteurs', name: 'Traiteurs' },
  { path: '/panier', name: 'Panier' },
  { path: '/devis', name: 'Devis' },
  { path: '/devenir-partenaire', name: 'Devenir Partenaire' },
  { path: '/devenir-livreur', name: 'Devenir Livreur' },
  { path: '/points-relais', name: 'Points Relais' },
  { path: '/livraison', name: 'Livraison' },
  { path: '/aide', name: 'Aide' },
  { path: '/traiteur/snack-save-peyia', name: 'Traiteur Save Peyia' },
  { path: '/traiteur/les-delices-de-ninice', name: 'Traiteur Ninice' },
  { path: '/traiteur/cocos-food', name: 'Traiteur Coco' },
  { path: '/traiteur/saveurs-dafrique', name: 'Traiteur Saveurs Afrique' },
  { path: '/produit/ninice-colombo', name: 'Produit Colombo' },
];

const WIDTHS = [
  { width: 390, height: 844, name: 'mobile' },   // iPhone 14
  { width: 768, height: 1024, name: 'tablet' },   // iPad
  { width: 1440, height: 900, name: 'desktop' },  // Desktop
];

async function run() {
  const results = [];

  for (const page of PAGES) {
    for (const viewport of WIDTHS) {
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      const p = await context.newPage();
      const url = `${BASE}${page.path}`;
      const slug = `${page.name.replace(/[^a-z0-9]/gi, '_')}_${viewport.name}`;

      try {
        const start = Date.now();
        const resp = await p.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        const loadTime = Date.now() - start;
        const status = resp?.status() || 0;
        const title = await p.title();
        const hasError = await p.locator('text=erreur|error|introuvable|404').count();

        await p.screenshot({ path: `reports/screenshots/${slug}.png`, fullPage: true });

        results.push({
          page: page.name, url, viewport: viewport.name,
          status, loadTime: `${loadTime}ms`, title,
          errors: hasError > 0 ? '⚠️ Texte erreur détecté' : '✅',
          hasWhatsApp: await p.locator('a[href*="wa.me"], button:has-text("WhatsApp")').count() > 0,
          hasCart: await p.locator('[href*="panier"], button:has-text("Panier"), button:has-text("Ajouter")').count() > 0,
        });

        console.log(`[${slug}] ${status} ${loadTime}ms ${hasError > 0 ? '⚠️' : '✅'}`);
      } catch (err) {
        results.push({ page: page.name, url, viewport: viewport.name, status: 'ERROR', loadTime: '-', title: err.message.slice(0, 100), errors: '❌ ERR', hasWhatsApp: false, hasCart: false });
        console.log(`[${slug}] ❌ ${err.message.slice(0, 80)}`);
      } finally {
        await browser.close();
      }
    }
  }

  // Summary
  console.log('\n=== RÉSUMÉ ===');
  const ok = results.filter(r => r.status === 200 || r.status?.toString().startsWith('2'));
  const fail = results.filter(r => r.status !== 200 && !r.status?.toString().startsWith('2'));
  console.log(`✅ ${ok.length}/${results.length} OK`);
  console.log(`❌ ${fail.length}/${results.length} Échecs`);
  fail.forEach(f => console.log(`  - ${f.page} (${f.viewport}) : ${f.status} ${f.title?.slice(0,60)}`));

  // Check WhatsApp presence
  const noWA = results.filter(r => !r.hasWhatsApp && r.status === 200);
  if (noWA.length > 0) {
    console.log('\n⚠️ Pages SANS WhatsApp:');
    noWA.forEach(r => console.log(`  - ${r.page} (${r.viewport})`));
  }

  writeFileSync('reports/playwright-audit.json', JSON.stringify(results, null, 2));
  console.log('\nRapport: reports/playwright-audit.json');
  console.log('Screenshots: reports/screenshots/');
}

run().catch(console.error);