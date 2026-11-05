import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'config/public-apis.json'),'utf8'));
const code=fs.readFileSync(path.join(root,'scripts/public-api-bridge.mjs'),'utf8');
function runWith(data) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'api-catalog-test-'));
  try {
    fs.mkdirSync(path.join(root,'config'));
    fs.mkdirSync(path.join(root,'scripts'));
    fs.writeFileSync(path.join(root,'config/public-apis.json'),JSON.stringify(data));
    fs.writeFileSync(path.join(root,'scripts/public-api-bridge.mjs'),code);
    fs.writeFileSync(path.join(root,'package.json'),'{"type":"module"}');
    return spawnSync(process.execPath,[path.join(root,'scripts/public-api-bridge.mjs'),'audit'],{encoding:'utf8',timeout:5000});
  } finally {
    fs.rmSync(root,{recursive:true,force:true});
  }
}
test('valid, offline catalogue passes',()=>assert.equal(runWith(catalog).status,0));
test('enabled outbound providers are rejected',()=>{
 const bad=structuredClone(catalog);bad.providers[0].enabled=true;
 assert.equal(runWith(bad).status,1);
});
test('non-HTTPS docs are rejected',()=>{
 const bad=structuredClone(catalog);bad.providers[0].docs='http://example.com';
 assert.equal(runWith(bad).status,1);
});
test('duplicate providers are rejected',()=>{
 const bad=structuredClone(catalog);bad.providers.push({...bad.providers[0]});
 assert.equal(runWith(bad).status,1);
});
test('customer-data forwarding is rejected',()=>{
 const bad=structuredClone(catalog);bad.providers[0].data_policy='send_customer_data';
 assert.equal(runWith(bad).status,1);
});
