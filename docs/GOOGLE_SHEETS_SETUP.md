# DELIKREOL Lite premium - Google Sheets (catalogue)

Ce guide definit la structure minimale attendue pour le catalogue produits en mode Lite premium.
Le front est tolerant aux colonnes manquantes, mais un minimum de cohérence est requis.

## 1) Feuille Produits (CSV public)
Colonnes recommandees:
- `id` (optionnel)
- `name` (obligatoire)
- `price` (obligatoire)
- `vendor`
- `category`
- `description`
- `image_url` (ou `image`)
- `zone`
- `available`

### Alias supportes (headers)
Le parser supporte ces variantes (normalisees automatiquement):
- `name`, `nom`
- `price`, `prix`
- `image`, `image_url`, `image url`, `imageurl`
- `vendor`, `vendeur`
- `available`, `is_available`, `isavailable`, `disponible`, `disponibilite`
- `category`, `categorie`
- `description`, `desc`
- `zone`
- `id`

## 2) Format des valeurs
- `price`: nombre avec point ou virgule (`12.5` ou `12,5`)
- `available`: `true/false`, `yes/no`, `oui/non`, `vrai/faux`, `1/0`
- `image_url`: URL HTTPS recommandee
- `vendor`: nom exact du partenaire (utilise pour la vue vendeur)

## 3) Exemples
Exemple valide:
```
id,name,price,vendor,category,description,image_url,zone,available
1,Colombo poulet,12.5,Traiteur Kreyol FDF,Plats,Recette locale,https://.../colombo.jpg,Fort-de-France,true
2,Tourment d'amour,4,Saveurs du Nord,Desserts,Maison,https://.../tourment.jpg,Schoelcher,oui
```

Exemples invalides (ignores):
- `name` vide
- `price` non numerique
- ligne completement vide

## 4) Publication CSV
1. Google Sheets -> Fichier -> Partager -> Publier sur le Web
2. Choisir la feuille `Produits` -> format CSV
3. Copier l'URL publique CSV

URL typique:
- `https://docs.google.com/spreadsheets/d/XXXX/pub?output=csv`
ou
- `https://docs.google.com/spreadsheets/d/XXXX/export?format=csv&gid=0`

## 5) Variables d'environnement
Obligatoires:
- `VITE_SHEETS_PUBLIC_URL="<url csv produits>"`
- `VITE_LITE_MODE=true`

Recommandees:
- `VITE_WHATSAPP_NUMBER=59669653589`
- `VITE_BASE_PATH=/`

Optionnel:
- `VITE_SHEETS_ORDERS_URL="<endpoint post commandes>"`

## 6) Conseils de structure
- Garder une ligne par produit
- Eviter les cellules fusionnees
- Eviter les emojis dans les headers
- Verifier l'encodage CSV (UTF-8)

## 7) Depannage rapide
- Si le catalogue est vide: verifier l'URL CSV et la publication publique
- Si des produits manquent: verifier `name` et `price`
- Si un partenaire n'apparait pas: verifier la colonne `vendor`
