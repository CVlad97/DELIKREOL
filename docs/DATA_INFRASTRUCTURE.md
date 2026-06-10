# DELIKREOL — Infrastructure données

## Base principale : Supabase (boihlgodmclljtckhmgz)
- Tables : 16 (profiles, vendors, products, orders, etc.)
- RLS activé sur toutes les tables
- is_admin() function prête
- Mode WhatsApp-first : les données sont aussi en localStorage

## Backup : Google Sheets
Utilisation :
- Collecte rapide des données partenaires
- Import photos via Drive
- Backup des commandes et devis
- Modification simple sans connexion au site

### Google Sheets utilisés
| Sheet | Usage |
|---|---|
| Commandes | Backup des commandes WhatsApp |
| Devis | Backup des demandes de devis |
| Partenaires | Liste des candidatures |
| Livreurs | Candidatures livreurs |
| Points relais | Candidatures relais |

### Google Drive
Dossier : `DELIKREOL_TRAITEURS_PHOTOS`
Structure attendue :
```
DELIKREOL_TRAITEURS_PHOTOS/
  an-tje-coco/
    hero.jpg, gallery-XX.jpg, portrait.jpg
  cocos-food/
    hero.jpg, gallery-XX.jpg
  saveurs-afrique/
    hero.jpg, gallery-XX.jpg
  les-delices-de-ninice/
    hero.jpg, gallery-XX.jpg, portrait.jpg
  snack-save-peyia/
    hero.jpg
```

## Flux de données
1. **Client** → navigate sur le site (données statiques depuis mock)
2. **Client** → clique WhatsApp → message prérempli (pas de backend nécessaire)
3. **Partenaire** → soumet formulaire → localStorage + si Supabase dispo
4. **Admin** → dashboard → lit localStorage / Supabase
5. **Backup** → export Sheets manuel depuis localStorage

## Sécurité
- service_role_key jamais côté frontend
- anon key seule clé publique frontend
- RLS Supabase actives
- Aucun secret dans le code