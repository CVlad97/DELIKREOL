import { chromium } from '@playwright/test';

const BASE = 'https://cvlad97.github.io/DELIKREOL';
const visited = new Set();
const broken = [];

async function checkPage(url, depth = 0) {
  if (depth > 2 || visited.has(url)) return;
  visited.add(url);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    const status = resp?.status() || 0;
    if (status >= 400) {
      broken.push({ url, status, depth });
      console.log(`❌ ${status} ${url}`);
    } else {
      console.log(`✅ ${status} ${url}`);
    }

    if (depth === 0) {
      const links = await page.locator('a[href]').all();
      const hrefs = [...new Set(await Promise.all(links.map(l => l.getAttribute('href'))))];
      for (const href of hrefs) {
        if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('wa.me') || href.startsWith('http')) continue;
        const fullUrl = new URL(href, BASE).href;
        if (fullUrl.startsWith(BASE)) await checkPage(fullUrl, depth + 1);
      }
    }
  } catch (err) {
    broken.push({ url, status: 'ERR', error: err.message.slice(0, 100), depth });
    console.log(`❌ ERR ${url} - ${err.message.slice(0, 60)}`);
  } finally {
    await browser.close();
  }
}

(async () => {
  console.log('=== VÉRIFICATION LIENS ===\n');
  await checkPage(BASE);
  console.log(`\n=== RÉSUMÉ ===`);
  console.log(`${visited.size} pages visitées`);
  console.log(`${broken.length} liens cassés`);
  broken.forEach(b => console.log(`  ${b.status} ${b.url}`));
  const { writeFileSync } = await import('fs');
  writeFileSync('reports/broken-links.json', JSON.stringify(broken, null, 2));
})();