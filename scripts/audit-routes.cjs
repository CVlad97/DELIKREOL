#!/usr/bin/env node
// DELIKREOL — Audit routes
// node scripts/audit-routes.cjs
// Vérifie que les routes publiques répondent (OK/KO)

const BASE = process.env.BASE_URL || 'https://delikreol.com';

const ROUTES_200 = [
  '',
  'catalogue',
  'panier',
  'statut-commande',
  'pro',
  'devenir-livreur',
  'devenir-point-relais',
  'points-relais',
  'devenir-partenaire',
  'traiteurs',
  'aide',
  'contact',
  'cgv',
  'confidentialite',
  'mentions-legales',
];

const ROUTES_ADMIN = [
  'admin',
  'admin/dashboard',
  'admin/simulation',
  'admin/finance',
  'admin/factures',
];

async function fetchPage(url) {
  try {
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(8000) });
    const text = await res.text();
    return { status: res.status, ok: res.status < 500, text };
  } catch {
    return { status: 0, ok: false, text: '' };
  }
}

function isSpaFallback(text) {
  return (
    text.includes('SPA fallback') ||
    text.includes('Redirection vers DeliKreol') ||
    text.includes("window.location.href = '/DELIKREOL/'") ||
    text.includes('Redirection vers l\'application') ||
    text.includes('<div id="root"></div>') ||
    text.includes('/src/main.tsx')
  );
}

async function main() {
  console.log(`\n🔍 AUDIT ROUTES — ${BASE}\n`);
  let ok = 0, ko = 0;

  console.log('📄 Routes publiques :');
  for (const path of ROUTES_200) {
    const url = `${BASE}/${path}`;
    const r = await fetchPage(url);
    const spaFallback = r.status === 404 && isSpaFallback(r.text);
    const routeOk = r.status === 200 || spaFallback;
    const label = routeOk ? '✅' : '❌';
    console.log(`  ${label} /${path} → ${r.status}${spaFallback ? ' (SPA)' : ''}`);
    if (routeOk) ok++; else ko++;
  }

  console.log('\n🔐 Routes admin :');
  for (const path of ROUTES_ADMIN) {
    const url = `${BASE}/${path}`;
    const r = await fetchPage(url);
    const spaFallback = r.status === 404 && isSpaFallback(r.text);
    const routeOk = r.status <= 404 || spaFallback;
    const label = routeOk ? '✅' : '❌';
    console.log(`  ${label} /${path} → ${r.status}${spaFallback ? ' (SPA)' : ' (SPA normal si 404)'}`);
    if (routeOk) ok++; else ko++;
  }

  console.log('\n📸 Images :');
  const images = [
    'branding/logo-mark.svg',
    'branding/hero-tropical.png',
    'vendors/ninice/drive-import/drive-01.webp',
    'vendors/coco/drive-import/drive-09.webp',
    'vendors/saveurs-afrique/drive-import/drive-02.webp',
    'vendors/save-peyia/drive-import/drive-01.webp',
    'vendors/sweet-family/drive-import/drive-02.webp',
  ];
  for (const img of images) {
    const url = `${BASE}/${img}`;
    const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000) }).then(res => ({ status: res.status })).catch(() => ({ status: 0 }));
    const label = r.status === 200 ? '✅' : '❌';
    console.log(`  ${label} ${img} → ${r.status}`);
    if (r.status === 200) ok++; else ko++;
  }

  console.log(`\n📊 Total : ${ok} OK / ${ko} KO`);
  process.exit(ko > 0 ? 1 : 0);
}

main();
