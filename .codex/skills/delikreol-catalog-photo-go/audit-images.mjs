#!/usr/bin/env node
// Read-only local media audit; no network, image generation or catalog mutation.
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative, extname, dirname } from 'node:path';
import { createHash } from 'node:crypto';
const root = process.cwd();
const media = join(root, 'public/vendors');
const out = join(root, 'reports/catalog-photo-go.json');
const extensions = new Set(['.jpg','.jpeg','.png','.webp','.avif','.gif','.svg']);
const assets=[];
function walk(dir){for(const ent of readdirSync(dir,{withFileTypes:true})){const p=join(dir,ent.name);if(ent.isDirectory())walk(p);else if(extensions.has(extname(ent.name).toLowerCase())){const buf=readFileSync(p);const size=statSync(p).size;const rel=relative(root,p).replaceAll('\\','/');const sha256=createHash('sha256').update(buf).digest('hex');const issues=[];if(size>750_000)issues.push('P1: image >750 KB, optimize for mobile');if(size<5_000 && !rel.endsWith('.svg'))issues.push('P1: unusually small bitmap, verify resolution');if(rel.includes('_fallback'))issues.push('P1: placeholder asset (check usage)');assets.push({path:rel,bytes:size,sha256,issues});}}}
walk(media);
const groups=new Map();for(const a of assets){const g=groups.get(a.sha256)||[];g.push(a.path);groups.set(a.sha256,g)}
const duplicates=[...groups.values()].filter(g=>g.length>1);
const summary={assets:assets.length,oversized:assets.filter(a=>a.bytes>750_000).length,smallBitmaps:assets.filter(a=>a.bytes<5_000&&!a.path.endsWith('.svg')).length,duplicateFileGroups:duplicates.length};
const result={generatedAt:new Date().toISOString(),scope:'local vendor image files only',limitations:['file hashes do not detect visually similar images','image identity, permissions, quality and real inventory require human review','no product catalog or Supabase changes'],summary,duplicates,issues:assets.filter(a=>a.issues.length),assets};
mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({summary,duplicates:duplicates.slice(0,8),report:out},null,2));
