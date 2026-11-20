import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const registry = readFileSync(join(root, 'src/data/verifiedPartnerLogos.ts'), 'utf8');
const cards = readFileSync(join(root, 'src/pages/new/TraiteursListPage.tsx'), 'utf8');
const failures = [];
const paths = [...registry.matchAll(/'([\w-]+)': '([^']+)'/g)];
if (!paths.length) failures.push('No verified partner logo entries');
for (const [, slug, asset] of paths) {
  if (!existsSync(join(root, 'public', asset))) failures.push(`${slug}: missing ${asset}`);
}
if (!cards.includes('getVerifiedPartnerLogo(traiteur.slug)')) failures.push('Cards do not use the verified logo registry');
if (!cards.includes('verifiedPortrait')) failures.push('Portrait handling is missing');
if (/MADA_BADGE_TRAITEURS|Écusson Chef à Mada/.test(cards)) failures.push('Collective badge still appears in partner cards');
if (failures.length) {
  console.error('Brand quality gate FAILED:\n' + failures.map(x => `- ${x}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Brand quality gate PASSED: ${paths.length} verified logo assets, no collective badge on cards.`);
  console.log('Note: this is not a visual, regulatory, or commercial GO approval.');
}
