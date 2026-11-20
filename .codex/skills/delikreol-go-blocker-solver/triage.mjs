#!/usr/bin/env node
// Read-only local blocker inventory. Does not make external calls or claim a GO.
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
const root=process.cwd();
const output=resolve(root,process.argv[2]||'reports/go-blocker-triage.json');
function git(...args){try{return execFileSync('git',args,{cwd:root,encoding:'utf8',timeout:6000}).trim()}catch{return null}}
const checks=[
 ['catalog-media','scripts/audit-catalog-media.mjs','P1','catalog photos, descriptions, allergens require partner approval'],
 ['partner-linking','.codex/skills/delikreol-partner-linking/SKILL.md','P0','auth/ownership and RLS must be validated against backend'],
 ['catalog-photo-skill','.codex/skills/delikreol-catalog-photo-go/SKILL.md','P1','image audit and partner approval required'],
 ['checkout-order','supabase/functions/checkout-order/index.ts','P0','guest/customer checkout requires E2E proof'],
 ['sumup-webhook','supabase/functions/sumup-webhook/index.ts','P0','sandbox webhook and idempotence need execution evidence'],
 ['stripe-webhook','supabase/functions/stripe-webhook/index.ts','P0','sandbox webhook and refund need execution evidence'],
 ['partner-terminal','src/pages/new/PartnerTerminalPage.tsx','P0','partner accept/refuse needs E2E proof'],
 ['cart','src/pages/new/CartPage.tsx','P0','cart, menus, options and price verification need E2E proof'],
 ['delivery','src/pages/new/DevenirLivreurPage.tsx','P1','delivery zones, driver notifications and handoff need proof'],
 ['go-20-orders','docs/PILOTE_20_COMMANDES_2026-11-20.md','P0','20 actual pilot scenarios need evidence'],
];
const rows=checks.map(([id,path,priority,requiredEvidence])=>({id,path,priority,fileExists:existsSync(resolve(root,path)),status:'unverified',requiredEvidence}));
const report={generatedAt:new Date().toISOString(),repo:'CVlad97/DELIKREOL',commit:git('rev-parse','--short','HEAD'),branch:git('branch','--show-current'),dirty:Boolean(git('status','--porcelain')),verdict:'NO-GO — evidence not established by this static inventory',limitations:['file existence is not proof of working functionality','does not query Supabase, payment provider, partners or delivery','no live orders or financial operations performed'],checks:rows,missingFiles:rows.filter(x=>!x.fileExists).map(x=>x.path)};
mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({commit:report.commit,dirty:report.dirty,checks:rows.length,missingFiles:report.missingFiles,verdict:report.verdict,report:output},null,2));
