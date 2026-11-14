#!/usr/bin/env node
/**
 * DELIKREOL — audit des origines publiques.
 *
 * Pourquoi ce script existe : le 14/11/2026, `delikreol.pages.dev` servait
 * encore une application DELIKREOL complète (`/admin/` inclus) sur le même
 * backend Supabase, alors que la production est le VPS. Aucun gate ne le
 * voyait : les audits regardaient le domaine canonique uniquement.
 *
 * Règle : une origine qui répond 200 ET contient le balisage de l'application
 * est une copie publique concurrente → FAIL. Une réponse 404/403/DNS est
 * normale et ne prouve rien d'autre que l'absence de copie.
 *
 * Usage :
 *   node scripts/audit-origins.mjs           # vérifie et sort 0/1
 *   node scripts/audit-origins.mjs --json    # sortie machine
 *   node scripts/audit-origins.mjs --origin https://exemple.test   # origine en plus
 *
 * Les origines supplémentaires peuvent être fournies par AUDIT_ORIGINS
 * (liste séparée par des virgules) sans modifier le fichier.
 */

const CANONICAL = 'https://delikreol.com';

// Origines historiques connues. Elles ne doivent plus servir l'application.
const DEFAULT_SUSPECTS = [
  'https://delikreol.pages.dev',
  'https://delikreol.netlify.app',
];

// Marqueurs propres à DELIKREOL. On ne teste pas seulement le 200 : un domaine
// parké ou une page d'erreur personnalisée répond aussi 200.
const APP_MARKERS = [/Delikreol/i, /Marketplace Logistique Martinique/i];

const TIMEOUT_MS = 12_000;

function origins() {
  const extra = (process.env.AUDIT_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set([...DEFAULT_SUSPECTS, ...extra])];
}

async function probe(origin) {
  const url = new URL('/', origin);
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal, redirect: 'follow' });
    const body = await response.text();
    const marker = APP_MARKERS.find((pattern) => pattern.test(body));
    const served = response.ok && Boolean(marker);
    return {
      origin,
      status: served ? 'FAIL' : 'PASS',
      http: response.status,
      detail: served
        ? `sert l'application DELIKREOL (HTTP ${response.status}, marqueur ${marker}) : copie publique concurrente`
        : `n'expose pas l'application (HTTP ${response.status})`,
    };
  } catch (error) {
    const reason = error?.name === 'TimeoutError' ? 'délai dépassé' : error?.code || error?.message;
    return {
      origin,
      status: 'PASS',
      http: null,
      detail: `injoignable (${reason}) : rien à retirer`,
    };
  }
}

async function probeCanonical(origin) {
  const url = new URL('/release.json', origin);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
      return { origin, status: 'FAIL', detail: `/release.json → HTTP ${response.status} : la release servie n'est pas identifiable` };
    }
    if (!contentType.includes('json')) {
      // Un repli SPA renvoie index.html en 200 : c'est le signe d'un docroot
      // sans release.json, donc d'un build antérieur à write-release.mjs.
      return { origin, status: 'FAIL', detail: `/release.json renvoie ${contentType || 'sans type'} au lieu de JSON : build sans release.json (SPA fallback)` };
    }
    const payload = await response.json();
    if (!payload?.release || !payload?.commit) {
      return { origin, status: 'FAIL', detail: '/release.json présent mais sans `release` ni `commit`' };
    }
    return { origin, status: 'PASS', detail: `release servie : ${payload.release} (${payload.published_at})` };
  } catch (error) {
    const reason = error?.name === 'TimeoutError' ? 'délai dépassé' : error?.code || error?.message;
    return { origin, status: 'FAIL', detail: `canonique injoignable (${reason})` };
  }
}

const results = [await probeCanonical(CANONICAL), ...(await Promise.all(origins().map(probe)))];
const failed = results.filter((row) => row.status === 'FAIL');
const state = failed.length === 0 ? 'PASS' : 'FAIL';

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ state, generated_at: new Date().toISOString(), results }, null, 2));
} else {
  console.log('=== DELIKREOL — ORIGINES PUBLIQUES ===');
  for (const row of results) {
    console.log(`${row.status === 'PASS' ? '✅' : '❌'} ${row.origin} — ${row.status}`);
    console.log(`   ${row.detail}`);
  }
  console.log('');
  console.log(`STATE : ${state}`);
  if (state === 'FAIL') {
    console.log('Une origine concurrente sert l\'application : désactiver la publication avant tout GO.');
  }
}

process.exit(state === 'PASS' ? 0 : 1);
