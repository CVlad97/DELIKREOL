#!/usr/bin/env python3
"""PARTNER_SYNC_MATRIX — Frontend partners vs Supabase vendors audit."""

frontend_partners = [
    {"name": "Les Delices de Ninice", "slug": "les-delices-de-ninice", "zone": "Fort-de-France", "status": "public confirmé"},
    {"name": "An Tjè Coco", "slug": "an-tje-coco", "zone": "Fort-de-France", "status": "public confirmé"},
    {"name": "Coco's Food", "slug": "cocos-food", "zone": "Rivière-Pilote", "status": "public confirmé"},
    {"name": "Snack Savè Peyi’A", "slug": "snack-save-peyia", "zone": "Rivière-Pilote", "status": "public confirmé"},
    {"name": "Gouté Mwen", "slug": "goute-mwen", "zone": "Martinique", "status": "public confirmé"},
    {"name": "Sweet Family Traiteur Orianne", "slug": "sweet-family-traiteur-orianne", "zone": "Fort-de-France", "status": "public confirmé"},
    {"name": "Saveurs d'Afrique", "slug": "saveurs-dafrique", "zone": "Rivière-Salée", "status": "public confirmé"},
    {"name": "Chef à Mada", "slug": "chef-a-mada", "zone": "Fort-de-France", "status": "public confirmé"},
]

supabase_vendors = [
    {"id": "boihlgodmclljtckhmgz", "name": "Projet Supabase Delikreol", "status": "ACTIVE_HEALTHY", "is_public": False, "zone_label": "Projet"},
]


def normalize(value: str) -> str:
    return "".join(char.lower() for char in value if char.isalnum())


print("=== MATRICE DE CORRESPONDANCE PARTENAIRES ===")
print()
print(f"{'Partenaire Frontend':40s} {'Slug':32s} {'Statut Frontend':20s} {'Supabase':20s} {'Match':10s}")
print("-" * 130)

for frontend_partner in frontend_partners:
    normalized_slug = normalize(frontend_partner["slug"])
    found = [
        supabase_vendor
        for supabase_vendor in supabase_vendors
        if normalize(frontend_partner["name"]) in normalize(supabase_vendor["name"])
        or normalized_slug in normalize(supabase_vendor["name"])
    ]
    supabase_vendor = found[0] if found else None
    match = "✅" if supabase_vendor else "❌ à importer"

    print(
        f"{frontend_partner['name']:40s} "
        f"{frontend_partner['slug']:32s} "
        f"{frontend_partner['status']:20s} "
        f"{supabase_vendor['name'] if supabase_vendor else '—':20s} "
        f"{match:10s}"
    )

print()
print("=== RÉSUMÉ ===")
print(f"Partenaires frontend prêts à importer: {len(frontend_partners)}")
print("Projet Supabase cible: Delikreol (boihlgodmclljtckhmgz)")
print("Fichier SQL idempotent: supabase/seed.partners.sql")
print()
print("=== DÉCISION ===")
print("Source de vérité cible: Supabase après import")
print("Fallback actuel: données statiques frontend si Supabase indisponible")
print("Mode recommandé: hybrid")
