#!/usr/bin/env node
/**
 * DELIKREOL — déploiement du bundle vers le VPS.
 *
 * Remplace `wrangler deploy`, qui publiait sur Cloudflare alors que la
 * production est le VPS nginx `srv1729857.hstgr.cloud`.
 *
 * Principe : RIEN n'est écrit sans `--apply`. Le mode par défaut est un plan
 * de déploiement + un contrôle d'accès en lecture seule.
 *
 * Trois pièges que ce script refuse de franchir silencieusement :
 *  1. Le docroot réel est inconnu : un `rsync` vers le mauvais chemin ne casse
 *     rien, ce qui est pire — le site semble déployé mais ne change pas.
 *     Le docroot est donc lu depuis `nginx -T`, jamais deviné.
 *  2. `/opt/delikreol-runtime/site` contient une copie morte (c38b5ae, 06/10).
 *     Écrire là est explicitement refusé sans `--allow-dead-copy`.
 *  3. `rsync --delete` sur un docroot supprime les médias non reconstruits.
 *     La suppression n'a lieu qu'avec `--prune`.
 *
 * Usage :
 *   node scripts/deploy-vps.mjs                     # plan + contrôle d'accès (aucune écriture)
 *   node scripts/deploy-vps.mjs --apply             # deploy réel
 *   node scripts/deploy-vps.mjs --apply --docroot /var/www/delikreol
 *   node scripts/deploy-vps.mjs --apply --no-build --prune
 *
 * Options : --host, --docroot, --no-build, --prune, --allow-dead-copy, --help
 * Sortie  : 0 si la release servie correspond au commit construit, 1 sinon.
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const DEAD_DOCROOTS = ['/opt/delikreol-runtime/site'];

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const value = (flag, fallback) => {
  const index = argv.indexOf(flag);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};

if (has('--help') || has('-h')) {
  const source = readFileSync(new URL(import.meta.url), 'utf8');
  console.log(source.slice(source.indexOf('/**') + 3, source.indexOf('*/')).replace(/^ ?\* ?/gm, '').trim());
  process.exit(0);
}

const HOST = value('--host', 'root@srv1729857.hstgr.cloud');
const APPLY = has('--apply');
const PRUNE = has('--prune');
const BUILD = !has('--no-build');
const ALLOW_DEAD = has('--allow-dead-copy');
let docroot = value('--docroot', null);

const log = (icon, message) => console.log(`${icon} ${message}`);
const fail = (message, code = 1) => {
  log('❌', message);
  process.exit(code);
};

function ssh(command, { inherit = false } = {}) {
  const args = [
    '-o', 'BatchMode=yes',
    '-o', 'ConnectTimeout=10',
    '-o', 'StrictHostKeyChecking=accept-new',
    HOST,
    command,
  ];
  const res = spawnSync('ssh', args, { encoding: 'utf8', stdio: inherit ? 'inherit' : 'pipe' });
  return { ok: res.status === 0, status: res.status, out: (res.stdout || '').trim(), err: (res.stderr || '').trim() };
}

// --- 1. Garde-fou d'environnement ------------------------------------------
// Les VITE_* sont figées à la compilation : un build sans elles produit une
// application inerte qui répond 200. Le garde-fou de vite.config.ts le bloque
// déjà, on échoue plus tôt et avec un message actionnable.
const missing = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].filter((key) => !process.env[key]);
if (missing.length > 0 && BUILD) {
  fail(`variables d'environnement absentes : ${missing.join(', ')}\n   export VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=...   (valeurs publiques du projet)`, 2);
}

// --- 2. Contrôle d'accès (lecture seule) -----------------------------------
log('🔑', `contrôle d'accès ${HOST}`);
const access = ssh('echo ok');
if (!access.ok) {
  fail(`SSH indisponible : ${access.err.split('\n')[0] || 'échec inconnu'}\n   La clé publique de cette session doit être ajoutée à ~/.ssh/authorized_keys.`);
}
log('✅', 'SSH joignable');

// --- 3. Docroot réel, lu depuis nginx --------------------------------------
if (!docroot) {
  const conf = ssh("nginx -T 2>/dev/null | grep -E '^[[:space:]]*root[[:space:]]' | awk '{print $2}' | tr -d ';' | sort -u");
  const roots = conf.ok ? conf.out.split('\n').map((line) => line.trim()).filter(Boolean) : [];
  if (roots.length === 1) {
    docroot = roots[0];
    log('📁', `docroot déduit de nginx -T : ${docroot}`);
  } else if (roots.length === 0) {
    fail("nginx -T ne renvoie aucun `root` : passer --docroot explicitement (ne jamais deviner).");
  } else {
    fail(`plusieurs docroots détectés :\n   ${roots.join('\n   ')}\n   choisir avec --docroot`);
  }
} else {
  log('📁', `docroot fourni : ${docroot}`);
}

if (DEAD_DOCROOTS.some((dead) => docroot.startsWith(dead)) && !ALLOW_DEAD) {
  fail(`${docroot} est la copie morte identifiée (c38b5ae du 06/10) : le site ne changerait pas.\n   Corriger nginx ou forcer avec --allow-dead-copy en connaissance de cause.`);
}

// --- 4. Plan ---------------------------------------------------------------
const plan = [
  BUILD ? 'npm run build (production)' : 'réutiliser dist/ existant',
  `sauvegarder ${docroot}/index.html`,
  `rsync dist/ → ${HOST}:${docroot}/${PRUNE ? ' (avec suppression)' : ''}`,
  `vérifier ${docroot}/release.json`,
  'vérifier https://delikreol.com/release.json',
];
console.log('\n=== PLAN ===');
plan.forEach((step, index) => console.log(`  ${index + 1}. ${step}`));

if (!APPLY) {
  console.log('\n🚫 Mode plan : aucune écriture. Relancer avec --apply pour déployer.');
  process.exit(0);
}

// --- 5. Build --------------------------------------------------------------
if (BUILD) {
  log('🔨', 'build production');
  const build = spawnSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'inherit' });
  if (build.status !== 0) fail('build échoué : rien n\'a été téléversé.');
}

if (!existsSync(join(DIST, 'release.json'))) {
  fail('dist/release.json absent : le bundle ne porte pas de release identifiable, déploiement refusé.');
}
const release = JSON.parse(readFileSync(join(DIST, 'release.json'), 'utf8'));
log('🏷️', `release construite : ${release.release}`);

// --- 6. Sauvegarde + envoi -------------------------------------------------
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
ssh(`[ -f ${docroot}/index.html ] && cp -a ${docroot}/index.html ${docroot}/index.html.bak-${stamp} || true`);
log('💾', `index.html sauvegardé (index.html.bak-${stamp})`);

const rsyncArgs = ['-az', '--info=stats1', '--exclude', '.DS_Store', `${DIST}/`, `${HOST}:${docroot}/`];
if (PRUNE) rsyncArgs.splice(1, 0, '--delete');
log('📤', `rsync${PRUNE ? ' --delete' : ''} vers ${docroot}`);
const rsync = spawnSync('rsync', rsyncArgs, { stdio: 'inherit' });
if (rsync.status !== 0) fail('rsync échoué : la release en place n\'a pas été modifiée par ce script au-delà des fichiers déjà copiés.');
if (rsync.error) fail(`rsync introuvable (${rsync.error.message}) : installer rsync côté local et serveur.`);

// --- 7. Preuve côté serveur puis côté public ------------------------------
const served = ssh(`cat ${docroot}/release.json`);
if (!served.ok) fail('release.json illisible sur le serveur après envoi.');
const serverRelease = JSON.parse(served.out);
if (serverRelease.commit !== release.commit) {
  fail(`le serveur annonce ${serverRelease.commit} mais le bundle est ${release.commit} : docroot probablement erroné.`);
}
log('✅', `serveur : ${serverRelease.release}`);

let publicRelease = null;
try {
  const response = await fetch('https://delikreol.com/release.json', { signal: AbortSignal.timeout(15_000) });
  publicRelease = await response.json();
} catch (error) {
  log('⚠️', `vérification publique impossible (${error.message}) : le déploiement reste non prouvé côté domaine.`);
}

if (publicRelease) {
  if (publicRelease.commit === release.commit) {
    log('✅', `public : delikreol.com sert ${publicRelease.release}`);
  } else {
    fail(`delikreol.com sert encore ${publicRelease.release} : cache, conteneur ou docroot différents — ne pas annoncer le déploiement.`);
  }
}

console.log('\nProchaine étape : purge du cache et vérification des en-têtes (ops/hardening/verify.sh).');
process.exit(0);
