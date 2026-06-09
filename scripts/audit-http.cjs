/**
 * Link checker using HTTP requests instead of Playwright
 * More reliable when system deps are missing
 */
const https = require('https');
const http = require('http');

const BASE = 'https://cvlad97.github.io/DELIKREOL';
const visited = new Set();
const broken = [];
const results = [];
const SCREENSHOTS = [];

function fetch(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 10000, headers: { 'User-Agent': 'Hermes-Audit/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: data.slice(0, 50000), headers: res.headers }));
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message, data: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout', data: '' }); });
  });
}

async function getTitle(data) {
  const m = data.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : '(no title)';
}

async function extractURLs(data, base) {
  const urls = [];
  const regex = /<a[^>]+href=["']([^"']+)["']/gi;
  let m;
  while ((m = regex.exec(data)) !== null) {
    let href = m[1];
    if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
    try {
      const full = new URL(href, base).href;
      if (full.startsWith(BASE)) urls.push(full);
    } catch (e) {}
  }
  return [...new Set(urls)];
}

async function checkWhatsApp(data) {
  return data.includes('wa.me/') || data.includes('WHATSAPP_NUMBER') || data.includes('596696653589');
}

(async () => {
  console.log('=== AUDIT COMPLET DELIKREOL ===\n');

  const pages = [
    { path: '/', name: 'Accueil' },
    { path: '/catalogue', name: 'Catalogue' },
    { path: '/traiteurs', name: 'Traiteurs' },
    { path: '/traiteur/snack-save-peyia', name: 'Traiteur Save Peyia' },
    { path: '/traiteur/les-delices-de-ninice', name: 'Traiteur Ninice' },
    { path: '/traiteur/cocos-food', name: 'Traiteur Coco' },
    { path: '/traiteur/saveurs-dafrique', name: 'Traiteur Saveurs Afrique' },
    { path: '/panier', name: 'Panier' },
    { path: '/devis', name: 'Devis' },
    { path: '/devenir-partenaire', name: 'Partenaire' },
    { path: '/devenir-livreur', name: 'Livreur' },
    { path: '/points-relais', name: 'Points Relais' },
    { path: '/livraison', name: 'Livraison' },
    { path: '/aide', name: 'Aide' },
    { path: '/produit/ninice-colombo', name: 'Produit Ninice' },
  ];

  let total = 0; let ok = 0; let fail = 0;

  for (const p of pages) {
    const url = `${BASE}${p.path}`;
    const { status, data, error } = await fetch(url);
    const title = data ? await getTitle(data) : error;
    const hasWA = data ? await checkWhatsApp(data) : false;

    const record = { page: p.name, url, status, title: title.slice(0, 80), hasWhatsApp: hasWA };
    results.push(record);
    total++;

    if (status === 200) {
      console.log(`✅ ${status} ${p.path.padEnd(35)} ${title.slice(0, 50)} ${hasWA ? '📞' : '  '}`);
      ok++;
    } else {
      console.log(`❌ ${status || error} ${p.path} - ${title?.slice(0, 60)}`);
      fail++;
    }

    // Check sub-links on home page
    if (p.path === '/' && data) {
      const links = await extractURLs(data, url);
      console.log(`   → ${links.length} liens internes trouvés`);
      for (const link of links.slice(0, 20)) {
        const r2 = await fetch(link);
        if (r2.status !== 200) {
          console.log(`   ❌ ${r2.status} ${link.replace(BASE, '')}`);
          broken.push({ url: link, status: r2.status });
        }
      }
    }
  }

  console.log(`\n=== RÉSULTATS ===`);
  console.log(`✅ ${ok}/${total} pages OK`);
  console.log(`❌ ${fail}/${total} pages en échec`);
  console.log(`📞 ${results.filter(r => r.hasWhatsApp).length}/${total} pages avec WhatsApp`);
  
  if (broken.length > 0) {
    console.log(`\n🔗 Liens cassés détectés : ${broken.length}`);
    broken.forEach(b => console.log(`  ${b.status} ${b.url.replace(BASE, '')}`));
  }

  // Check JSON endpoints
  console.log(`\n=== VÉRIFICATIONS SUPPLÉMENTAIRES ===`);
  
  // Check 404
  const r404 = await fetch(`${BASE}/page-inexistante`);
  console.log(`Page 404: ${r404.status} (attendue: 200 si SPA fallback)`);

  // Check assets
  const assets = [
    '/branding/favicon.svg',
    '/branding/logo-mark.svg',
    '/vendors/ninice/gallery-01.jpg',
    '/vendors/coco/hero.jpg',
    '/vendors/saveurs-afrique/hero.jpg',
    '/vendors/save-peyia/hero.jpg',
  ];
  for (const a of assets) {
    const r = await fetch(`${BASE}${a}`);
    console.log(`📦 ${r.status} ${a} ${r.status === 200 ? '✅' : '❌'}`);
  }

  require('fs').writeFileSync('reports/audit-complet.json', JSON.stringify(results, null, 2));
  require('fs').writeFileSync('reports/broken-links.json', JSON.stringify(broken, null, 2));
  console.log(`\n✅ Rapports sauvegardés dans reports/`);
})();