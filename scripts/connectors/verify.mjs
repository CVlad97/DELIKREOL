#!/usr/bin/env node
/**
 * DELIKREOL — vérificateur de connecteurs.
 *
 * Interroge chaque service externe à partir des variables d'environnement,
 * puis rend un état par connecteur : PASS / FAIL / BLOCKED_HUMAN / NOT_TESTED.
 *
 * Règles :
 *  - aucune valeur de secret n'est affichée, seulement sa présence et sa nature ;
 *  - absent = BLOCKED_HUMAN avec le nom exact de la variable manquante ;
 *  - aucune écriture distante : uniquement des lectures (GET/HEAD).
 *
 * Usage :
 *   node scripts/connectors/verify.mjs
 *   node scripts/connectors/verify.mjs --json
 *   node scripts/connectors/verify.mjs --write   # reports/launch/connectors.json
 *
 * Sortie : 0 si tous les connecteurs critiques sont PASS, 1 sinon.
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { connect } from 'node:net';

const ROOT = process.cwd();
const LAUNCH_DIR = join(ROOT, 'reports', 'launch');
const TIMEOUT = 8000;

function loadEnvFiles() {
  for (const name of ['.env.local', '.env']) {
    const p = join(ROOT, name);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const value = m[2].replace(/^["']|["']$/g, '');
      if (value && !process.env[m[1]]) process.env[m[1]] = value;
    }
  }
}
loadEnvFiles();

const env = (name) => (process.env[name] || '').trim();
const firstOf = (...names) => names.map(env).find(Boolean) || '';

async function http(url, { method = 'GET', headers = {} } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { method, headers, signal: ctrl.signal });
    return { status: res.status };
  } catch (error) {
    return { status: 0, error: String(error?.name || error) };
  } finally {
    clearTimeout(timer);
  }
}

function tcp(host, port) {
  return new Promise((resolve) => {
    const sock = connect({ host, port });
    const done = (ok) => {
      sock.destroy();
      resolve(ok);
    };
    sock.setTimeout(TIMEOUT);
    sock.once('connect', () => done(true));
    sock.once('timeout', () => done(false));
    sock.once('error', () => done(false));
  });
}

const CONNECTORS = [
  {
    id: 'supabase',
    label: 'Supabase (base, auth)',
    critical: true,
    async check() {
      const url = firstOf('SUPABASE_URL', 'VITE_SUPABASE_URL');
      const key = firstOf('SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_ANON_KEY');
      if (!url) return { status: 'BLOCKED_HUMAN', evidence: 'SUPABASE_URL / VITE_SUPABASE_URL absente' };
      if (!key) return { status: 'BLOCKED_HUMAN', evidence: 'clé absente : SUPABASE_SERVICE_ROLE_KEY ou VITE_SUPABASE_ANON_KEY' };
      const kind = env('SUPABASE_SERVICE_ROLE_KEY') ? 'service_role' : 'anon';
      const { status, error } = await http(`${url}/rest/v1/?apikey=${encodeURIComponent(key)}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (status === 200) return { status: 'PASS', evidence: `REST joignable, clé ${kind} acceptée` };
      if (status === 401 || status === 403) return { status: 'FAIL', evidence: `clé ${kind} refusée (HTTP ${status})` };
      if (status === 0) return { status: 'FAIL', evidence: `injoignable (${error})` };
      return { status: 'FAIL', evidence: `réponse inattendue HTTP ${status}` };
    },
  },
  {
    id: 'supabase_orders',
    label: 'Supabase — volume de commandes (preuve G5)',
    critical: true,
    async check() {
      const url = firstOf('SUPABASE_URL', 'VITE_SUPABASE_URL');
      const key = firstOf('SUPABASE_SERVICE_ROLE_KEY');
      if (!url) return { status: 'BLOCKED_HUMAN', evidence: 'SUPABASE_URL absente' };
      if (!key) return { status: 'BLOCKED_HUMAN', evidence: 'SUPABASE_SERVICE_ROLE_KEY absente : comptage impossible sans contourner la RLS' };
      try {
        const res = await fetch(`${url}/rest/v1/orders?select=id&limit=1`, {
          headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' },
        });
        const range = res.headers.get('content-range') || '';
        const total = Number(range.split('/')[1]);
        if (!res.ok) return { status: 'FAIL', evidence: `HTTP ${res.status} sur orders` };
        if (!Number.isFinite(total)) return { status: 'NOT_TESTED', evidence: 'comptage indisponible (content-range absent)' };
        if (total >= 20) return { status: 'PASS', evidence: `${total} commandes en base (seuil pilote : 20)` };
        return { status: 'FAIL', evidence: `${total} commande(s) en base — pilote incomplet (seuil : 20)` };
      } catch (error) {
        return { status: 'FAIL', evidence: `exception : ${String(error).slice(0, 100)}` };
      }
    },
  },
  {
    id: 'stripe',
    label: 'Stripe (paiements)',
    critical: true,
    async check() {
      const key = firstOf('STRIPE_SECRET_KEY', 'STRIPE_API_KEY');
      if (!key) return { status: 'BLOCKED_HUMAN', evidence: 'STRIPE_SECRET_KEY absente' };
      const mode = key.startsWith('sk_live') ? 'LIVE' : key.startsWith('sk_test') ? 'test' : 'inconnu';
      if (mode === 'LIVE') return { status: 'FAIL', evidence: 'une clé LIVE est présente : interdite tant que G3 n\'est pas prouvé' };
      const { status, error } = await http('https://api.stripe.com/v1/balance', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (status === 200) return { status: 'PASS', evidence: `clé ${mode} acceptée, lecture /v1/balance OK` };
      if (status === 0) return { status: 'FAIL', evidence: `injoignable (${error})` };
      return { status: 'FAIL', evidence: `HTTP ${status}` };
    },
  },
  {
    id: 'github',
    label: 'GitHub (dépôt CVlad97/DELIKREOL)',
    critical: false,
    async check() {
      const token = firstOf('GITHUB_TOKEN', 'GH_TOKEN');
      const { status, error } = await http('https://api.github.com/repos/CVlad97/DELIKREOL', {
        headers: {
          Accept: 'application/vnd.github+json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (status === 200) return { status: 'PASS', evidence: token ? 'dépôt lisible, token fourni' : 'dépôt public lisible (sans token)' };
      if (status === 404) return { status: 'FAIL', evidence: 'dépôt introuvable ou non autorisé' };
      if (status === 0) return { status: 'FAIL', evidence: `injoignable (${error})` };
      return { status: 'FAIL', evidence: `HTTP ${status}` };
    },
  },
  {
    id: 'vps',
    label: 'VPS Hostinger (443 + SSH)',
    critical: true,
    async check() {
      const host = firstOf('VPS_HOST') || 'srv1729857.hstgr.cloud';
      const [web, ssh] = await Promise.all([tcp(host, 443), tcp(host, 22)]);
      if (!web) return { status: 'FAIL', evidence: `${host}:443 injoignable` };
      if (!ssh) return { status: 'FAIL', evidence: `${host}:22 injoignable` };
      return { status: 'PASS', evidence: `${host} : 443 et 22 ouverts` };
    },
  },
  {
    id: 'vps_ssh_auth',
    label: 'VPS — authentification SSH par clé',
    critical: true,
    async check() {
      const key = firstOf('VPS_SSH_KEY');
      if (!key) return { status: 'BLOCKED_HUMAN', evidence: 'VPS_SSH_KEY absente : aucun audit serveur possible' };
      return { status: 'NOT_TESTED', evidence: 'clé présente mais non testée ici' };
    },
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp Business (bridge)',
    critical: false,
    async check() {
      const needed = ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_APP_SECRET', 'WHATSAPP_PHONE_NUMBER_ID'];
      const missing = needed.filter((n) => !env(n));
      if (missing.length === needed.length) return { status: 'BLOCKED_HUMAN', evidence: 'aucune variable WhatsApp configurée' };
      if (missing.length) return { status: 'BLOCKED_HUMAN', evidence: `manquant : ${missing.join(', ')}` };
      return { status: 'NOT_TESTED', evidence: 'variables présentes, envoi non testé' };
    },
  },
  {
    id: 'email',
    label: 'E-mail transactionnel',
    critical: false,
    async check() {
      const host = firstOf('SMTP_HOST', 'RESEND_API_KEY');
      if (!host) return { status: 'BLOCKED_HUMAN', evidence: 'SMTP_HOST ou RESEND_API_KEY absente' };
      return { status: 'NOT_TESTED', evidence: 'configuration présente, envoi réel non testé' };
    },
  },
];

const rows = [];
for (const c of CONNECTORS) {
  let result;
  try {
    result = await c.check();
  } catch (error) {
    result = { status: 'FAIL', evidence: `exception : ${String(error).slice(0, 120)}` };
  }
  rows.push({ id: c.id, label: c.label, critical: c.critical, ...result });
}

const icon = { PASS: '✅', FAIL: '❌', BLOCKED_HUMAN: '🚫', NOT_TESTED: '⬜' };
const criticalOpen = rows.filter((r) => r.critical && r.status !== 'PASS');
const payload = {
  generated_at: new Date().toISOString(),
  connectors: rows,
  ready: criticalOpen.length === 0,
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  console.log('=== DELIKREOL — CONNECTEURS ===\n');
  for (const r of rows) {
    console.log(`${icon[r.status]} ${r.label} — ${r.status}${r.critical ? '' : ' (non critique)'}`);
    console.log(`   ${r.evidence}`);
  }
  console.log('');
  console.log(criticalOpen.length === 0
    ? 'CONNECTEURS : tous les critiques sont PASS'
    : `CONNECTEURS : ${criticalOpen.length} critique(s) non connecté(s) — ${criticalOpen.map((r) => r.id).join(', ')}`);
}

if (process.argv.includes('--write')) {
  mkdirSync(LAUNCH_DIR, { recursive: true });
  writeFileSync(join(LAUNCH_DIR, 'connectors.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log('\nRapport écrit : reports/launch/connectors.json');
}

process.exit(criticalOpen.length === 0 ? 0 : 1);
