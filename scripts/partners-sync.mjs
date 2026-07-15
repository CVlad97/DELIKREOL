#!/usr/bin/env node
/**
 * partners-sync.mjs — Synchronisation des partenaires frontend → Supabase
 * Modes: --dry-run (default), --apply (requires CONFIRM_PARTNER_SYNC=YES)
 * Usage: node scripts/partners-sync.mjs [--dry-run|--apply]
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mode = process.argv.includes('--apply') ? 'apply' : 'dry-run';

// Service role key from environment ONLY
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment');
  process.exit(1);
}

if (mode === 'apply' && process.env.CONFIRM_PARTNER_SYNC !== 'YES') {
  console.error('❌ --apply requires CONFIRM_PARTNER_SYNC=YES');
  process.exit(1);
}

// Parse frontend partner data
const traiteursPath = resolve(__dirname, '../src/data/traiteurs.ts');
const traiteursContent = readFileSync(traiteursPath, 'utf-8');

// Extract partner names from buildSpace calls
const partnerNames = [
  'Les Delices de Ninice', 'An Tjè Coco', "Coco's Food",
  'Snack Savè Peyi\'A', 'Gouté Mwen', 'Sweet Family Traiteur Orianne',
  "Saveurs d'Afrique"
];

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Get existing vendors from Supabase
  const { data: existingVendors, error } = await supabase
    .from('vendors')
    .select('id, name, business_name, status, is_public, is_active, is_demo, updated_at, zone_label, commune, phone, description, photo_status, public_display_status, story, promise, specialty, highlights, hero_image, portrait_image, gallery_images, gradient, accent, whatsapp, email, siret, legal_name');

  if (error) {
    console.error('❌ Failed to fetch vendors:', error.message);
    process.exit(1);
  }

  const supabaseVendors = existingVendors || [];
  const supabaseNames = new Set(supabaseVendors.map(v => (v.business_name || v.name).toLowerCase().trim()));

  console.log('=== PARTNER SYNC ' + mode.toUpperCase() + ' ===\n');
  console.log(`Frontend partners: ${partnerNames.length}`);
  console.log(`Supabase vendors: ${supabaseVendors.length}\n`);

  // Detect matches
  const matches = [];
  const missing = [];
  
  for (const name of partnerNames) {
    const normalized = name.toLowerCase().trim();
    const found = supabaseVendors.find(v => 
      (v.business_name || v.name).toLowerCase().trim() === normalized ||
      (v.business_name || v.name).toLowerCase().includes(normalized) ||
      normalized.includes((v.business_name || v.name).toLowerCase().trim())
    );
    
    if (found) {
      matches.push({ frontend: name, supabase: found.business_name || found.name, id: found.id, status: found.status });
    } else {
      missing.push(name);
    }
  }

  console.log(`Already in Supabase: ${matches.length}`);
  for (const m of matches) {
    console.log(`  ✅ ${m.frontend} → ${m.supabase} (${m.id.slice(0,8)}..., status: ${m.status})`);
  }

  console.log(`\nMissing from Supabase: ${missing.length}`);
  for (const m of missing) {
    const slug = m.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    console.log(`  ${mode === 'apply' ? '⬆️' : '📋'} ${m} (slug: ${slug})`);
  }

  if (mode === 'dry-run') {
    console.log('\n✅ Dry-run complete — no changes made');
    console.log('Run with --apply and CONFIRM_PARTNER_SYNC=YES to insert');
    return;
  }

  // Apply mode: insert missing partners
  if (mode === 'apply' && missing.length > 0) {
    console.log('\n=== INSERTING MISSING PARTNERS ===');
    for (const name of missing) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const { data, error: insertError } = await supabase
        .from('vendors')
        .upsert({
          name: name,
          business_name: name,
          status: 'verified',
          is_public: true,
          is_active: true,
          is_demo: false,
          zone_label: 'Martinique',
          photo_status: 'à confirmer',
          public_display_status: 'public à vérifier',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'name', ignoreDuplicates: false })
        .select();

      if (insertError) {
        console.error(`  ❌ Failed to insert ${name}: ${insertError.message}`);
      } else {
        console.log(`  ✅ Inserted ${name} (${data?.[0]?.id?.slice(0,8) || '?'})`);
      }
    }
  }

  console.log('\n✅ Sync complete');
  console.log(`Partners: ${partnerNames.length} | Supabase before: ${supabaseVendors.length} | New: ${missing.length}`);
}

main().catch(console.error);