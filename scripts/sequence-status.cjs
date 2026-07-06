#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

const checks = [];

function run(name, command, args = []) {
  try {
    const output = execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    checks.push({ name, status: 'ok', output });
  } catch (error) {
    checks.push({
      name,
      status: 'fail',
      output: `${error.stdout || ''}${error.stderr || ''}`.trim() || error.message,
    });
  }
}

function file(name, path) {
  checks.push({ name, status: fs.existsSync(path) ? 'ok' : 'fail', output: path });
}

async function main() {
  file('revenue board', 'REVENUE_OPERATING_BOARD.md');
  file('campaign kit', 'CAMPAIGN_LAUNCH_KIT.md');
  file('bank and keys readiness', 'BANK_AND_KEYS_READINESS.md');
  file('repos operating map', 'REPOS_OPERATING_MAP.md');
  file('anyclaw mission control', 'ANYCLAW_MISSION_CONTROL.md');
  file('prospection public sources', 'PROSPECTION_PUBLIC_SOURCES.md');
  file('supabase migration test plan', 'SUPABASE_MIGRATION_TEST_PLAN.md');
  file('prospection log', 'data/prospection/revenue-prospects-log.csv');
  file('rls hardening migration', 'supabase/migrations/20260706000001_rls_policy_hardening.sql');

  run('git branch', 'git', ['branch', '--show-current']);
  run('git status', 'git', ['status', '--short']);
  run('site http', 'curl', ['-I', '-L', '--max-time', '15', 'https://cvlad97.github.io/DELIKREOL/']);

  const summary = {
    generated_at: new Date().toISOString(),
    project: 'DELIKREOL',
    public_url: 'https://cvlad97.github.io/DELIKREOL/',
    checks,
    ok: checks.filter((check) => check.status === 'ok').length,
    fail: checks.filter((check) => check.status === 'fail').length,
  };

  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/sequence-status.json', `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.fail > 0 ? 1 : 0);
}

main();
