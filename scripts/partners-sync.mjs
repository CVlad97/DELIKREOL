#!/usr/bin/env node
/**
 * partners-sync.mjs — Synchronisation des partenaires frontend → Supabase
 * Modes: --dry-run (default), --apply (requires CONFIRM_PARTNER_SYNC=YES), --sql
 * Usage: node scripts/partners-sync.mjs [--dry-run|--apply|--sql]
 */
import { createClient } from '@supabase/supabase-js';

const mode = process.argv.includes('--apply') ? 'apply' : process.argv.includes('--sql') ? 'sql' : 'dry-run';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (mode === 'apply' && process.env.CONFIRM_PARTNER_SYNC !== 'YES') {
  console.error('❌ --apply requires CONFIRM_PARTNER_SYNC=YES');
  process.exit(1);
}

const frontendPartners = [
  {
    name: 'Les Delices de Ninice',
    legal_name: 'Les Delices de Ninice',
    zone_label: 'Secteur Dillon',
    commune: 'Fort-de-France',
    phone: '+596 696 01 93 21',
    whatsapp: '+596 696 01 93 21',
    email: 'jereniceeduards@gmail.com',
    description: 'Traiteur, boxes repas et snacking — cuisine de rue surinamo-caraïbe.',
    story: 'Cuisine de rue surinamo-caraïbe, épices du Suriname et générosité antillaise. Retrait au Barber Shop de Dillon, Fort-de-France.',
    promise: 'Cuisine maison, saveurs surinamiennes et caraïbes, retrait facile à Dillon',
    specialty: 'Colombo, moksi aleisi, bami, bara, gulab jamun et mini brochettes Saoto',
    highlights: ['Cuisine maison', 'Mélange Suriname / Caraïbes', 'Point relais Barber Shop de Dillon', 'Commande groupe'],
    hero_image: '/vendors/ninice/hero.jpg',
    portrait_image: '/vendors/ninice/portrait.jpg',
    gallery_images: ['/vendors/ninice/gallery-01.jpg', '/vendors/ninice/gallery-02.jpg', '/vendors/ninice/gallery-03.jpg'],
  },
  {
    name: 'An Tjè Coco',
    legal_name: 'AN TJE COCO',
    zone_label: 'Fort-de-France',
    commune: 'Fort-de-France',
    phone: '0696 85 70 77',
    whatsapp: '0696 85 70 77',
    email: 'antjecoco@gmail.com',
    description: 'Crêpes gastronomiques, pépites salées et sucrées.',
    story: 'An Tjè Coco réinvente la crêpe en pépites artisanales sucrées et salées avec des produits locaux.',
    promise: 'Pépites artisanales, produits locaux, précommande WhatsApp',
    specialty: 'Pépites façon gratin de banane jaune, coco-passion, rougail saucisses, poulet-curry-lait de coco',
    highlights: ['Crêpes gastronomiques', 'Pépites salées & sucrées', 'Précommande WhatsApp', 'Produits locaux'],
    hero_image: '/vendors/an-tje-coco/hero.jpg',
    portrait_image: '/vendors/an-tje-coco/portrait.jpg',
    gallery_images: ['/vendors/an-tje-coco/gallery-01.jpg', '/vendors/an-tje-coco/gallery-02.jpg', '/vendors/an-tje-coco/gallery-03.jpg'],
  },
  {
    name: "Coco's Food",
    legal_name: "COCO'S FOOD",
    zone_label: 'Rivière-Pilote — Marché',
    commune: 'Rivière-Pilote',
    phone: '+596 696 25 47 20',
    whatsapp: '+596 696 25 47 20',
    description: 'Cuisine de marché créole et caribéenne, plats complets, bowls, paella, brochettes.',
    story: "Cuisine du marché de Rivière-Pilote : plats complets faits maison, généreux et colorés.",
    promise: 'Cuisine de marché généreuse, variée, portions XXL',
    specialty: 'Plats du jour, paella fruits de mer, bowls, brochettes, poulet rôti',
    highlights: ['Cuisine de marché', 'Marché de Rivière-Pilote', 'Plats du jour variés', 'Paella aux fruits de mer'],
    hero_image: '/vendors/coco/hero.jpg',
    portrait_image: '/vendors/coco/portrait.jpg',
    gallery_images: ['/vendors/coco/gallery-01.jpg', '/vendors/coco/gallery-02.jpg', '/vendors/coco/gallery-03.jpg'],
  },
  {
    name: "Snack Savè Peyi’A",
    legal_name: "Snack Savè Peyi’A",
    zone_label: 'Rivière-Pilote — Pont de Fer',
    commune: 'Rivière-Pilote',
    phone: '+596 696 00 27 64',
    whatsapp: '+596 696 00 27 64',
    email: 'marianelitta972@gmail.com',
    description: 'Transformation de fruits et légumes, jus locaux, grillades, plats cuisinés et snacks.',
    story: "Snack Savè Peyi’A est le spot de Rivière-Pilote près du Pont de Fer : fruits frais, jus locaux, paninis, crêpes, plats cuisinés et grillades.",
    promise: 'Grillades maison, fruits frais, produits locaux — livraison sur Rivière-Pilote et environs',
    specialty: 'Côte de porc, entrecôte, cabri, saumon sauce blanche, dorade grillée, salades de fruits, smoothies',
    highlights: ['Transformation fruits et légumes', 'Grillades & poissons', 'Rivière-Pilote — Pont de Fer', 'Livraison disponible'],
    hero_image: '/vendors/save-peyia/hero.jpg',
    portrait_image: '/vendors/save-peyia/portrait.jpg',
    gallery_images: ['/vendors/save-peyia/cote-porc-riz.jpg', '/vendors/save-peyia/crevettes-riz.jpg', '/vendors/save-peyia/salade-fruits-1.jpg'],
  },
  {
    name: 'Gouté Mwen',
    legal_name: 'Gouté Mwen',
    zone_label: 'Martinique',
    commune: 'Martinique',
    phone: '+596 696 16 61 93',
    whatsapp: '+596 696 16 61 93',
    description: 'Glaces artisanales antillaises — pur fruit, fait maison, inclusif.',
    story: 'Gouté Mwen valorise les saveurs des Antilles avec des glaces artisanales, des fruits locaux et des versions sans sucre ajouté.',
    promise: 'Glaces faites maison, fruits locaux, 2€ seulement — inclusion & patrimoine antillais',
    specialty: 'Glaces artisanales : abricot pays, mangue, maracuja, prune cythère, corossol, coco, snow-boll',
    highlights: ['18 parfums de glaces artisanales', '2€ chaque', 'Sans sucre ajouté disponible', 'Fait maison'],
    hero_image: '/vendors/goute-mwen/hero.jpg',
    portrait_image: '/vendors/goute-mwen/portrait.jpg',
    gallery_images: ['/vendors/goute-mwen/product-glacee-groseille.jpg', '/vendors/goute-mwen/snow-boll.jpg', '/vendors/goute-mwen/mangue.jpg'],
  },
  {
    name: 'Sweet Family Traiteur Orianne',
    legal_name: 'Sweet Family Traiteur Orianne',
    zone_label: 'Martinique',
    commune: 'Fort-de-France',
    phone: '+596 696 88 75 28',
    whatsapp: '+596 696 88 75 28',
    description: 'Spécialiste Seafood Boil & Landfood, Bao Buns, Nems, Burgers, Verrines créoles, Desserts & Cocktails dînatoires.',
    story: 'Traiteur événementiel basé en Martinique, spécialisé Seafood Boils et cocktails dînatoires haut de gamme.',
    promise: 'Plats généreux et savoureux — Prestations sur mesure — Produits de saison',
    specialty: 'Seafood Boil, Landfood, Bao Buns, Nems, Mini Burgers, Pizzas, Verrines créoles, Desserts',
    highlights: ['Spécialiste Seafood Boil & Landfood', 'Prestations sur mesure', 'Grande capacité de service', 'Qualité et générosité'],
    hero_image: '/vendors/sweet-family/cocktails-mignardises-hero.webp',
    portrait_image: '/vendors/sweet-family/portrait.jpg',
    gallery_images: ['/vendors/sweet-family/cocktails-mignardises-menu.webp', '/vendors/sweet-family/bao-buns-menu.webp', '/vendors/sweet-family/seafood-boil-1.webp'],
  },
  {
    name: "Saveurs d'Afrique",
    legal_name: "SAVEURS D'AFRIQUE",
    zone_label: 'Cluny',
    commune: 'Rivière-Salée',
    phone: '0596 68 12 25',
    whatsapp: '0596 68 12 25',
    description: 'Cuisine africaine, buffet, traiteur et commandes groupe.',
    story: "Saveurs d'Afrique propose des spécialités africaines et créoles. Fiche en cours de validation avec la partenaire.",
    promise: 'Cuisine maison, portions généreuses — fiche en cours de validation',
    specialty: 'Spécialités africaines et créoles',
    highlights: ['Cuisine africaine et créole', 'Commune : Cluny', 'Fiche en cours de validation', 'Photos et descriptions à valider'],
    hero_image: '/vendors/saveurs-afrique/hero.jpg',
    portrait_image: '/vendors/saveurs-afrique/portrait.jpg',
    gallery_images: ['/vendors/saveurs-afrique/gallery-01.jpg', '/vendors/saveurs-afrique/gallery-02.jpg', '/vendors/saveurs-afrique/gallery-03.jpg'],
  },
  {
    name: 'Chef à Mada',
    legal_name: 'Chef à Mada',
    zone_label: 'Fort-de-France',
    commune: 'Fort-de-France',
    description: 'Traiteur malgache et créole — ateliers culinaires, plats sur commande, événements.',
    story: 'Association Loi 1901 basée à Fort-de-France qui promeut la cuisine malgache et créole à travers ateliers, prestations traiteur et événements culturels.',
    promise: 'Cuisine malgacho-créole authentique — ateliers et traiteur sur commande',
    specialty: 'Cuisine malgache et créole, rougail, poulet massalé, samoussas, ateliers culinaires',
    highlights: ['Association Loi 1901', 'Cuisine malgache et créole', 'Fort-de-France', 'Ateliers culinaires', 'HelloAsso'],
    hero_image: '/vendors/chef-a-mada/logo.jpg',
    portrait_image: '/vendors/chef-a-mada/logo.jpg',
    gallery_images: ['/vendors/chef-a-mada/logo.jpg'],
  },
];

function normalizeSlug(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toVendorPayload(partner) {
  return {
    name: partner.name,
    business_name: partner.name,
    legal_name: partner.legal_name,
    status: 'verified',
    is_public: true,
    is_active: true,
    is_demo: false,
    zone_label: partner.zone_label || 'Martinique',
    commune: partner.commune || partner.zone_label || 'Martinique',
    phone: partner.phone || null,
    whatsapp: partner.whatsapp || partner.phone || null,
    email: partner.email || null,
    description: partner.description || '',
    story: partner.story || partner.description || '',
    promise: partner.promise || '',
    specialty: partner.specialty || '',
    highlights: partner.highlights || [],
    hero_image: partner.hero_image || null,
    portrait_image: partner.portrait_image || null,
    gallery_images: partner.gallery_images || [],
    gradient: partner.gradient || 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]',
    accent: partner.accent || '#fff7ed',
    delivery_radius_km: partner.delivery_radius_km || 12,
    photo_status: partner.photo_status || 'à confirmer',
    public_display_status: partner.public_display_status || 'public confirmé',
    updated_at: new Date().toISOString(),
  };
}

const payloads = frontendPartners.map(toVendorPayload);

function sqlLiteral(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return `${sqlLiteral(JSON.stringify(value ?? []))}::jsonb`;
}

function buildPartnerSql(payload) {
  const textColumns = [
    'business_name',
    'legal_name',
    'status',
    'zone_label',
    'commune',
    'phone',
    'whatsapp',
    'email',
    'description',
    'story',
    'promise',
    'specialty',
    'hero_image',
    'portrait_image',
    'gradient',
    'accent',
    'photo_status',
    'public_display_status',
  ];

  const updateAssignments = [
    ...textColumns.map((column) => `${column} = ${sqlLiteral(payload[column])}`),
    `is_public = ${payload.is_public}`,
    `is_active = ${payload.is_active}`,
    `is_demo = ${payload.is_demo}`,
    `highlights = ${sqlJson(payload.highlights)}`,
    `gallery_images = ${sqlJson(payload.gallery_images)}`,
    `delivery_radius_km = ${Number(payload.delivery_radius_km)}`,
    `updated_at = now()`,
  ];

  const insertColumns = [
    'name',
    ...textColumns,
    'is_public',
    'is_active',
    'is_demo',
    'highlights',
    'gallery_images',
    'delivery_radius_km',
    'created_at',
    'updated_at',
  ];

  const insertValues = [
    sqlLiteral(payload.name),
    ...textColumns.map((column) => sqlLiteral(payload[column])),
    String(payload.is_public),
    String(payload.is_active),
    String(payload.is_demo),
    sqlJson(payload.highlights),
    sqlJson(payload.gallery_images),
    String(Number(payload.delivery_radius_km)),
    'now()',
    'now()',
  ];

  return `-- ${payload.name}
DO $$
BEGIN
  UPDATE public.vendors
     SET ${updateAssignments.join(',\n         ')}
   WHERE lower(coalesce(business_name, name)) = lower(${sqlLiteral(payload.name)})
      OR lower(name) = lower(${sqlLiteral(payload.name)});

  IF NOT FOUND THEN
    INSERT INTO public.vendors (${insertColumns.join(', ')})
    VALUES (${insertValues.join(', ')});
  END IF;
END $$;`;
}

function printSql() {
  console.log(`-- DELIKREOL partner import
-- Generated from scripts/partners-sync.mjs.
-- Idempotent: updates matching vendors by name/business_name, inserts missing vendors.
-- Run in Supabase SQL Editor on project Delikreol after schema migrations are applied.

BEGIN;

${payloads.map(buildPartnerSql).join('\n\n')}

COMMIT;`);
}

function printPayloadSummary() {
  console.log('=== FRONTEND PARTNERS PAYLOAD ===\n');
  console.log(`Frontend partners: ${payloads.length}`);
  for (const partner of payloads) {
    console.log(`  📦 ${partner.name} (slug: ${normalizeSlug(partner.name)}, commune: ${partner.commune})`);
  }
}

if (mode === 'sql') {
  printSql();
  process.exit(0);
}

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  if (mode === 'dry-run') {
    printPayloadSummary();
    console.log('\n⚠️ Supabase non connecté : SUPABASE_URL/VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY absents.');
    console.log('Dry-run local terminé — aucun changement distant effectué.');
    process.exit(0);
  }

  console.error('❌ SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY must be set in environment');
  process.exit(1);
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: existingVendors, error } = await supabase
    .from('vendors')
    .select('id, name, business_name, status, is_public, is_active, is_demo, updated_at, zone_label, commune, phone, description, photo_status, public_display_status, story, promise, specialty, highlights, hero_image, portrait_image, gallery_images, gradient, accent, whatsapp, email, siret, legal_name');

  if (error) {
    console.error('❌ Failed to fetch vendors:', error.message);
    process.exit(1);
  }

  const supabaseVendors = existingVendors || [];

  console.log('=== PARTNER SYNC ' + mode.toUpperCase() + ' ===\n');
  console.log(`Frontend partners: ${payloads.length}`);
  console.log(`Supabase vendors: ${supabaseVendors.length}\n`);

  const matches = [];
  const missing = [];

  for (const payload of payloads) {
    const normalized = normalizeSlug(payload.name);
    const found = supabaseVendors.find((vendor) => {
      const vendorName = vendor.business_name || vendor.name || '';
      const normalizedVendor = normalizeSlug(vendorName);
      return normalizedVendor === normalized || normalizedVendor.includes(normalized) || normalized.includes(normalizedVendor);
    });

    if (found) {
      matches.push({ frontend: payload.name, supabase: found.business_name || found.name, id: found.id, status: found.status });
    } else {
      missing.push(payload);
    }
  }

  console.log(`Already in Supabase: ${matches.length}`);
  for (const match of matches) {
    console.log(`  ✅ ${match.frontend} → ${match.supabase} (${match.id.slice(0, 8)}..., status: ${match.status})`);
  }

  console.log(`\nMissing from Supabase: ${missing.length}`);
  for (const payload of missing) {
    console.log(`  ${mode === 'apply' ? '⬆️' : '📋'} ${payload.name} (slug: ${normalizeSlug(payload.name)})`);
  }

  if (mode === 'dry-run') {
    console.log('\n✅ Dry-run complete — no changes made');
    console.log('Run with --apply and CONFIRM_PARTNER_SYNC=YES to insert/update');
    return;
  }

  console.log('\n=== UPSERTING PARTNERS ===');
  for (const payload of payloads) {
    const { data, error: upsertError } = await supabase
      .from('vendors')
      .upsert(payload, { onConflict: 'name', ignoreDuplicates: false })
      .select('id, name');

    if (upsertError) {
      console.error(`  ❌ Failed to upsert ${payload.name}: ${upsertError.message}`);
    } else {
      console.log(`  ✅ Upserted ${payload.name} (${data?.[0]?.id?.slice(0, 8) || '?'})`);
    }
  }

  console.log('\n✅ Sync complete');
  console.log(`Partners payload: ${payloads.length} | Supabase before: ${supabaseVendors.length} | Missing before: ${missing.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
