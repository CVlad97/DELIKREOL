import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const hash = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
const release = {
  release: `delikreol-${hash}`,
  commit: hash,
  published_at: new Date().toISOString(),
};
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/release.json', `${JSON.stringify(release)}\n`, 'utf8');
console.log(`[DELIKREOL] release ${release.release}`);
