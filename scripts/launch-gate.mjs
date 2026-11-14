#!/usr/bin/env node
/**
 * DELIKREOL — connecteur de gates de lancement.
 *
 * Agrège :
 *  - les vérifications locales (qualité) exécutables sans réseau ;
 *  - les preuves déposées par les sous-agents dans reports/launch/*.json.
 *
 * Règle : absent = NOT_TESTED. Un HTTP 200, un fichier manquant ou un build
 * réussi ne valent jamais PASS. GO n'est possible que si tout est PASS.
 *
 * Usage :
 *   node scripts/launch-gate.mjs            # affiche le verdict
 *   node scripts/launch-gate.mjs --json     # sortie JSON brute
 *   node scripts/launch-gate.mjs --write    # écrit reports/launch/verdict-<date>.md|json
 *
 * Sortie : code 0 si GO, 1 sinon (utilisable comme gate CI ou agent).
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();
const LAUNCH_DIR = join(ROOT, 'reports', 'launch');
const STATES = ['PASS', 'FAIL', 'BLOCKED_HUMAN', 'NOT_TESTED'];

const LOCAL_CHECKS = [
  { id: 'typecheck', script: 'typecheck', label: 'TypeScript' },
  { id: 'lint', script: 'lint', label: 'ESLint' },
  { id: 'test', script: 'test', label: 'Tests Vitest' },
  { id: 'build', script: 'build', label: 'Build Vite' },
  { id: 'audit:secrets', script: 'audit:secrets', label: 'Audit secrets' },
  { id: 'audit:catalog-media', script: 'audit:catalog-media', label: 'Audit médias catalogue' },
];

const EVIDENCE_GATES = [
  { id: 'vps_infra', gate: 'G1', label: 'Infra VPS saine (docroot, disque, conteneurs, certificats)' },
  { id: 'release_live', gate: 'G2', label: 'Release servie == commit déployé, cache correct' },
  { id: 'partner_conformity', gate: 'G4', label: 'Conformité partenaires (allergènes, photos, droits)' },
  { id: 'pilot_orders', gate: 'G5', label: '20 commandes pilotes tracées de bout en bout' },
  { id: 'payment_sandbox', gate: 'G3', label: 'Cycle paiement sandbox + webhook idempotent + remboursement' },
];

function notTested(reason) {
  return { status: 'NOT_TESTED', evidence: reason };
}

function runLocalCheck(check) {
  if (!existsSync(join(ROOT, 'node_modules'))) {
    return notTested('node_modules absent : lancer `npm ci` avant de vérifier');
  }
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  if (!pkg.scripts || !pkg.scripts[check.script]) {
    return notTested(`script npm "${check.script}" absent de package.json`);
  }
  const res = spawnSync('npm', ['run', check.script], { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
  if (res.status === 0) {
    return { status: 'PASS', evidence: `npm run ${check.script} → exit 0` };
  }
  const output = `${res.stdout || ''}${res.stderr || ''}`;
  const tail = output.trim().split('\n').slice(-3).join(' / ');

  // Un build bloqué par le garde-fou d'environnement n'est pas un code cassé :
  // il manque des secrets. C'est BLOCKED_HUMAN, pas FAIL, sinon la porte est
  // rouge en permanence pour une raison que le code ne peut pas corriger.
  const guard = output.match(/Production build blocked: missing ([^\n]+)/);
  if (guard) {
    return {
      status: 'BLOCKED_HUMAN',
      evidence: `variables d'environnement absentes : ${guard[1].trim()} (build volontairement bloqué)`,
    };
  }

  return { status: 'FAIL', evidence: `npm run ${check.script} → exit ${res.status ?? 'null'} ${tail}`.slice(0, 400) };
}

function readEvidence(gate) {
  const file = join(LAUNCH_DIR, `${gate.id}.json`);
  if (!existsSync(file)) {
    return notTested(`aucune preuve : déposer ${file.replace(ROOT + '/', '')} via le sous-agent concerné`);
  }
  let payload;
  try {
    payload = JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return { status: 'FAIL', evidence: `preuve illisible (JSON invalide) : ${gate.id}.json` };
  }
  const status = STATES.includes(payload.status) ? payload.status : 'FAIL';
  const evidence = String(payload.evidence ?? '').slice(0, 400);
  if (status === 'PASS' && !evidence) {
    return { status: 'FAIL', evidence: `preuve PASS sans evidence citée : ${gate.id}.json` };
  }
  return { status, evidence };
}

function verdict(rows) {
  if (rows.some((r) => r.status === 'FAIL')) return 'NO-GO';
  if (rows.some((r) => r.status === 'BLOCKED_HUMAN')) return 'NO-GO';
  if (rows.some((r) => r.status === 'NOT_TESTED')) return 'PILOT-ONLY';
  return 'GO';
}

function render(rows, state) {
  const icon = { PASS: '✅', FAIL: '❌', BLOCKED_HUMAN: '🚫', NOT_TESTED: '⬜' };
  const lines = [];
  lines.push('=== DELIKREOL — GATES DE LANCEMENT ===');
  lines.push('');
  for (const r of rows) {
    const ref = r.gate ? `${r.gate} ` : '';
    lines.push(`${icon[r.status]} ${ref}${r.label} — ${r.status}`);
    if (r.evidence) lines.push(`   ${r.evidence}`);
  }
  lines.push('');
  lines.push(`STATE : ${state}`);
  const counts = STATES.map((s) => `${s}=${rows.filter((r) => r.status === s).length}`).join('  ');
  lines.push(`TOTAL : ${counts}`);
  if (state !== 'GO') {
    lines.push('');
    lines.push('GO exige que chaque gate soit PASS avec une preuve citée. Rien n\'est arrondi.');
  }
  return lines.join('\n');
}

const localRows = LOCAL_CHECKS.map((c) => ({ ...runLocalCheck(c), id: c.id, label: c.label }));
const evidenceRows = EVIDENCE_GATES.map((g) => ({ ...readEvidence(g), id: g.id, gate: g.gate, label: g.label }));
const rows = [...localRows, ...evidenceRows];
const state = verdict(rows);
const payload = { state, generated_at: new Date().toISOString(), gates: rows };

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  console.log(render(rows, state));
}

if (process.argv.includes('--write')) {
  mkdirSync(LAUNCH_DIR, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  writeFileSync(join(LAUNCH_DIR, `verdict-${stamp}.json`), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  const md = [
    `# Verdict de lancement — ${stamp}`,
    '',
    `**STATE : ${state}**`,
    '',
    '| Gate | Statut | Preuve |',
    '|---|---|---|',
    ...rows.map((r) => `| ${r.gate ? r.gate + ' ' : ''}${r.label} | ${r.status} | ${(r.evidence || '').replace(/\|/g, '/')} |`),
    '',
  ].join('\n');
  writeFileSync(join(LAUNCH_DIR, `verdict-${stamp}.md`), md, 'utf8');
  console.log(`\nRapport écrit : reports/launch/verdict-${stamp}.md`);
}

process.exit(state === 'GO' ? 0 : 1);
