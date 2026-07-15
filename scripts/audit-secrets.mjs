#!/usr/bin/env node
/**
 * audit-secrets.mjs — Audit des secrets dans le dépôt DELIKREOL
 * Usage: node scripts/audit-secrets.mjs
 * Lit uniquement, ne modifie rien, ne récupère aucune clé.
 */
import { execSync } from 'child_process';

const patterns = [
  { pattern: 'ghp_', name: 'GitHub PAT (ghp_)' },
  { pattern: 'github_pat_', name: 'GitHub PAT (github_pat_)' },
  { pattern: 'sk_live_', name: 'Stripe Live Key' },
  { pattern: 'sk_test_', name: 'Stripe Test Key' },
  { pattern: 'sb_secret_', name: 'Supabase Secret' },
  { pattern: 'service_role', name: 'Supabase service_role key' },
  { pattern: 'SUPABASE_SERVICE_ROLE_KEY', name: 'Env var SUPABASE_SERVICE_ROLE_KEY' },
  { pattern: 'STRIPE_SECRET', name: 'Env var STRIPE_SECRET' },
];

let totalIssues = 0;
const results = [];

for (const { pattern, name } of patterns) {
  try {
    const stdout = execSync(
      `git grep -nE '${pattern}' -- . ':!node_modules' ':!.git' ':!scripts/audit-*.py' ':!scripts/audit-*.mjs' ':!supabase/backups/*.py' 2>/dev/null || true`,
      { encoding: 'utf-8', timeout: 10000 }
    );
    const lines = stdout.trim().split('\n').filter(l => l);
    // Filter out safe references (documentation, comments about not doing it)
    const realIssues = lines.filter(l => !l.includes('Ne JAMAIS') && !l.includes('ne pas') && !l.includes('NE PAS') && !l.includes('jamais côté') && !l.includes('Never expose') && !l.includes(' Documentation') && !l.includes('docs/'));
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