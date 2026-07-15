#!/usr/bin/env python3
"""PARTNER_SYNC_MATRIX — Frontend partners vs Supabase vendors audit"""
import json

# 7 partners from frontend data
frontend_partners = [
    {"name": "Les Delices de Ninice", "slug": "les-delices-de-ninice", "zone": "Fort-de-France", "specialty": "Plats créoles", "status": "public confirmé"},
    {"name": "An Tjè Coco", "slug": "an-tje-coco", "zone": "Fort-de-France", "specialty": "Cuisine antillaise", "status": "public confirmé"},
    {"name": "Coco's Food", "slug": "cocos-food", "zone": "Fort-de-France", "specialty": "Cuisine rapide", "status": "public confirmé"},
    {"name": "Snack Savè Peyi'A", "slug": "snack-save-peyia", "zone": "Le Lamentin", "specialty": "Snack créole", "status": "public confirmé"},
    {"name": "Gouté Mwen", "slug": "goute-mwen", "zone": "Schoelcher", "specialty": "Glaces artisanales", "status": "public confirmé"},
    {"name": "Sweet Family Traiteur Orianne", "slug": "sweet-family", "zone": "Fort-de-France", "specialty": "Cocktails & mignardises", "status": "public confirmé"},
    {"name": "Saveurs d'Afrique", "slug": "saveurs-dafrique", "zone": "Fort-de-France", "specialty": "Cuisine africaine", "status": "public confirmé"},
]

# Supabase vendors (from audit)
supabase_vendors = [
    {"id": "4afa0843-e486-4947-a2e7-d34d49b0196b", "name": "Verger Tropical", "status": "draft", "is_public": False, "zone_label": "Sainte-Anne"},
    {"id": "57f49dbb-56e3-48f5-bb8d-a475f7b71671", "name": "Chez Tatie Mireille", "status": "verified", "is_public": True, "zone_label": "Fort-de-France"},
]

print("=== MATRICE DE CORRESPONDANCE PARTENAIRES ===")
print()
print(f"{'Partenaire Frontend':40s} {'Slug':25s} {'Statut Frontend':20s} {'Supabase ID':40s} {'Statut Supabase':20s} {'Match':10s}")
print("-" * 160)

for fp in frontend_partners:
    found = [sv for sv in supabase_vendors if fp['name'].lower() in sv['name'].lower() or fp['slug'] in sv['name'].lower()]
    if found:
        sv = found[0]
        match = "✅"
    else:
        sv = None
        match = "❌ Aucun"
    
    print(f"{fp['name']:40s} {fp['slug']:25s} {fp['status']:20s} {sv['id'] if sv else '—':40s} {sv['status'] if sv else '—':20s} {match:10s}")

print()
print("=== RÉSUMÉ ===")
print(f"Partenaires frontend: {len(frontend_partners)}")
print(f"Vendors Supabase: {len(supabase_vendors)}")
print(f"Correspondance: 0 / {len(frontend_partners)}")
print()
print("=== DÉCISION ===")
print("Source de vérité: Supabase (après synchronisation)")
print("Fallback: Données statiques frontend si Supabase indisponible")
print("Mode recommandé: hybrid")