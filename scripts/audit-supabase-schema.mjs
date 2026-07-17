#!/usr/bin/env node
/**
 * audit-supabase-schema.mjs — Audit du schéma Supabase
 * Usage: node scripts/audit-supabase-schema.mjs
 * Lecture seule — utilise SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY depuis l'env
 */
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment');
  process.exit(1);
}

const tables = [
  'vendors', 'products', 'orders', 'order_items', 'profiles',
  'partner_applications', 'partner_documents', 'contact_messages',
  'reviews', 'relay_points', 'drivers', 'client_requests',
  'feedback', 'admin_users', 'admin_settings', 'delivery_rules',
  'project_memory', 'loyalty_points', 'loyalty_events',
];

async function checkTable(name) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${name}?select=count&limit=1`;
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Accept': 'application/json',
        'Accept-Profile': 'public',
      },
    });
    
    if (res.status === 200) {
      const countHeader = res.headers.get('content-range');
      const count = countHeader ? countHeader.split('/')[1] : '?';
      return { status: 'ok', count };
    } else if (res.status === 404) {
      const body = await res.json();
      if (body?.code === 'PGRST205' || body?.message?.includes('Could not find')) {
        return { status: 'not_found', count: 0 };
      }
      return { status: 'error', error: body?.message || res.statusText };
    } else {
      return { status: 'error', error: res.statusText };
    }
  } catch (e) {
    return { status: 'error', error: e.message };
  }
}

console.log('=== SUPABASE SCHEMA AUDIT ===');
console.log(`URL: ${SUPABASE_URL.replace(/\/$/, '')}/project/default\n`);

let ok = 0, nf = 0, err = 0;

for (const table of tables) {
  const result = await checkTable(table);
  if (result.status === 'ok') {
    console.log(`  ✅ ${table.padEnd(35)} ${result.count} rows`);
    ok++;
  } else if (result.status === 'not_found') {
    console.log(`  ❌ ${table.padEnd(35)} NOT FOUND`);
    nf++;
  } else {
    console.log(`  ⚠️  ${table.padEnd(35)} ${result.error || 'error'}`);
    err++;
  }
}

console.log(`\nTotal: ${tables.length} | OK: ${ok} | Not found: ${nf} | Errors: ${err}`);
process.exit(err > 0 ? 1 : 0);