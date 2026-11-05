#!/usr/bin/env node
// Public API catalog: dry-run by default; never transmits project/customer data.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfgPath = path.join(root, 'config', 'public-apis.json');
const usage = () => { console.log('Usage: node scripts/public-api-bridge.mjs [list|audit|export]'); };
function audit(catalog) {
  const issues = [];
  if (!catalog.project || !Array.isArray(catalog.providers)) issues.push('Invalid catalog schema');
  const ids = new Set();
  for (const entry of catalog.providers || []) {
    if (!entry.id || ids.has(entry.id)) issues.push('Missing or duplicate provider id');
    ids.add(entry.id);
    if (!['existing_code','candidate_unverified'].includes(entry.status)) issues.push(`Invalid provider status: ${entry.id}`);
    if (entry.enabled !== false) issues.push(`External network access must default to disabled: ${entry.id}`);
    if (!['no_customer_data','local_only'].includes(entry.data_policy)) issues.push(`Data policy missing: ${entry.id}`);
    try {
      const u = new URL(entry.docs);
      if (u.protocol !== 'https:' || u.username || u.password) throw new Error();
    } catch { issues.push(`Invalid HTTPS documentation URL: ${entry.id}`); }
    if (!entry.use_case) issues.push(`Missing project use case: ${entry.id}`);
  }
  return issues;
}
const catalog = JSON.parse(fs.readFileSync(cfgPath,'utf8'));
const cmd = process.argv[2] || 'list';
if (cmd === 'audit') {
  const issues = audit(catalog);
  console.log(`API catalog ${catalog.project}: ${catalog.providers.length} entries, ${issues.length} issues`);
  for (const issue of issues) console.error('FAIL',issue);
  if (issues.length) process.exitCode = 1;
} else if (cmd === 'list') {
  for (const p of catalog.providers) {
    console.log(`${p.id.padEnd(18)} ${p.status.padEnd(22)} ${p.enabled?'enabled':'disabled'} | ${p.use_case}`);
  }
} else if (cmd === 'export') {
  console.log(JSON.stringify({project:catalog.project,providers:catalog.providers.map(({id,status,enabled,use_case,docs})=>({id,status,enabled,use_case,docs}))},null,2));
} else { usage(); process.exitCode=2; }
