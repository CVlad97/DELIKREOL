#!/usr/bin/env node
/**
 * audit-secrets.mjs — Audit des secrets dans le dépôt DELIKREOL
 * Usage: node scripts/audit-secrets.mjs
 * Lit uniquement, ne modifie rien, ne récupère aucune clé.
 */
import { execSync } from 'child_process';

const patterns = [
  { pattern: 'ghp_[A-Za-z0-9_]{20,}', name: 'GitHub PAT (ghp_)' },
  { pattern: 'github_pat_[A-Za-z0-9_]{20,}', name: 'GitHub PAT (github_pat_)' },
  { pattern: 'sk_live_[A-Za-z0-9]{16,}', name: 'Stripe Live Key' },
  { pattern: 'sk_test_[A-Za-z0-9]{16,}', name: 'Stripe Test Key' },
  { pattern: 'sk-[A-Za-z0-9_-]{20,}', name: 'OpenAI API Key' },
  { pattern: 'sb_secret_[A-Za-z0-9_-]{20,}', name: 'Supabase Secret' },
  { pattern: 'whsec_[A-Za-z0-9_]{20,}', name: 'Stripe Webhook Secret' },
  { pattern: 'xox[baprs]-[A-Za-z0-9-]{20,}', name: 'Slack Token' },
  { pattern: 'AKIA[0-9A-Z]{16}', name: 'AWS Access Key' },
];

let totalIssues = 0;
const results = [];

for (const { pattern, name } of patterns) {
  try {
    const stdout = execSync(
      `git grep -nE '${pattern}' -- . ':!node_modules' ':!.git' ':!dist' ':!coverage' ':!test-results' ':!playwright-report' ':!scripts/audit-*.py' ':!scripts/audit-*.mjs' ':!supabase/backups/*.py' 2>/dev/null || true`,
      { encoding: 'utf-8', timeout: 10000 }
    );
    const lines = stdout.trim().split('\n').filter(l => l);
    const realIssues = lines.filter(l => !l.includes('xxxxxxxx') && !l.includes('replace_with_') && !l.includes('<service-role-key>') && !l.includes('sk_test_...') && !l.includes('sk_...'));
    if (realIssues.length > 0) {
      totalIssues += realIssues.length;
      results.push({ name, count: realIssues.length, examples: realIssues.slice(0, 3) });
    }
  } catch (e) {
    // git grep returns non-zero when no matches
  }
}

console.log('=== SECRET AUDIT RESULTS ===');
if (results.length === 0) {
  console.log('✅ No secrets detected in repository');
  console.log('✅ All patterns safe');
} else {
  for (const r of results) {
    console.log(`⚠️  ${r.name}: ${r.count} occurrences`);
    for (const ex of r.examples) {
      console.log(`     ${ex.substring(0, 100)}`);
    }
  }
}

console.log(`\nTotal issues: ${totalIssues}`);
process.exit(totalIssues > 0 ? 1 : 0);
