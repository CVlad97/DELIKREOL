# DELIKREOL Lite - Google Sheets setup

## 1) Produits (Sheet: Produits)
Colonnes recommandees:
- id (optionnel)
- name
- vendor
- price
- category
- description
- image_url (ou image)
- zone (optionnel)
- available (optionnel)
- is_available (optionnel)

## Publication
1. Fichier Google Sheets -> Fichier -> Partager -> Publier sur le Web
2. Choisir la feuille Produits -> format CSV
3. Copier l'URL publique CSV

## Variables a definir
- VITE_SHEETS_PUBLIC_URL="<url csv produits>"
- VITE_LITE_MODE=true
- VITE_WHATSAPP_NUMBER=596696653589

## Commandes (optionnel)
Pour enregistrer les commandes en mode Lite, utiliser un Google Form ou un Apps Script.
Vous pouvez ensuite fournir l'URL a:
- VITE_SHEETS_ORDERS_URL="<endpoint post commandes>"

Astuce: on peut publier en JSON via Apps Script si besoin.
