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
 *
 * Les origines supplémentaires peuvent être fournies par AUDIT_ORIGINS
 * (liste séparée par des virgules) sans modifier le fichier.
 */
import { pathToFileURL } from 'node:url';

export const CANONICAL = 'https://delikreol.com';

// Origines historiques connues. Elles ne doivent plus servir l'application.
export const DEFAULT_SUSPECTS = [
  'https://delikreol.pages.dev',
  'https://delikreol.netlify.app',
];

// Marqueurs propres à DELIKREOL. On ne teste pas seulement le 200 : un domaine
// parké ou une page d'erreur personnalisée répond aussi 200.
export const APP_MARKERS = [/Delikreol/i, /Marketplace Logistique Martinique/i];

export const TIMEOUT_MS = 12_000;

export function origins(env = process.env) {
  const extra = (env.AUDIT_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set([...DEFAULT_SUSPECTS, ...extra])];
}

function describeError(error) {
  if (error?.name === 'TimeoutError') return 'délai dépassé';
  return error?.code || error?.message || 'erreur inconnue';
}

export async function probeOrigin(origin, { fetchImpl = globalThis.fetch, timeoutMs = TIMEOUT_MS } = {}) {
  const url = new URL('/', origin);
  try {
    const response = await fetchImpl(url, { redirect: 'follow', signal: AbortSignal.timeout(timeoutMs) });
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
    return { origin, status: 'PASS', http: null, detail: `injoignable (${describeError(error)}) : rien à retirer` };
  }
}

export async function probeCanonical(origin, { fetchImpl = globalThis.fetch, timeoutMs = TIMEOUT_MS } = {}) {
  const url = new URL('/release.json', origin);
  try {
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) });
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
    return { origin, status: 'FAIL', detail: `canonique injoignable (${describeError(error)})` };
  }
}

export function summarize(results) {
  const failed = results.filter((row) => row.status === 'FAIL');
  return { state: failed.length === 0 ? 'PASS' : 'FAIL', failed };
}

async function main() {
  const results = [await probeCanonical(CANONICAL), ...(await Promise.all(origins().map((origin) => probeOrigin(origin))))];
  const { state } = summarize(results);

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
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
