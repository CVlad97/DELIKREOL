#!/usr/bin/env node
// DELIKREOL — Audit routes
// node scripts/audit-routes.cjs
// Vérifie que les routes publiques répondent (OK/KO)

const BASE = process.env.BASE_URL || 'https://cvlad97.github.io/DELIKREOL';

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

async function check(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
    return { status: res.status, ok: res.status < 500 };
  } catch {
    return { status: 0, ok: false };
  }
}

async function main() {
  console.log(`\n🔍 AUDIT ROUTES — ${BASE}\n`);
  let ok = 0, ko = 0;

  console.log('📄 Routes publiques :');
  for (const path of ROUTES_200) {
    const url = `${BASE}/${path}`;
    const r = await check(url);
    const label = r.ok ? '✅' : '❌';
    console.log(`  ${label} /${path} → ${r.status}`);
    if (r.ok) ok++; else ko++;
  }

  console.log('\n🔐 Routes admin :');
  for (const path of ROUTES_ADMIN) {
    const url = `${BASE}/${path}`;
    const r = await check(url);
    // SPA routes return 404 from server, that's expected
    const label = r.status <= 404 ? '✅' : '❌';
    console.log(`  ${label} /${path} → ${r.status} (SPA normal si 404)`);
    if (r.status <= 404) ok++; else ko++;
  }

  console.log('\n📸 Images :');
  const images = ['branding/logo-mark.svg', 'assets/hero-food.svg', 'vendors/ninice/hero.jpg', 'vendors/coco/hero.jpg', 'vendors/saveurs-afrique/hero.jpg'];
  for (const img of images) {
    const url = `${BASE}/${img}`;
    const r = await check(url);
    const label = r.status === 200 ? '✅' : '❌';
    console.log(`  ${label} ${img} → ${r.status}`);
    if (r.status === 200) ok++; else ko++;
  }

  console.log(`\n📊 Total : ${ok} OK / ${ko} KO`);
  process.exit(ko > 0 ? 1 : 0);
}

main();