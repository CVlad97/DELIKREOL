# Import WhatsApp vers DELIKREOL

## Endpoint
- Webhook: `https://delikreol.com/webhooks/whatsapp`
- Vérification: `GET /webhooks/whatsapp`
- Santé: `GET /health` (service interne)

## Données nécessaires
À saisir uniquement sur le VPS, jamais dans Git :
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`

## Configuration Meta
1. Créer ou ouvrir l'application: https://developers.facebook.com/apps/
2. Ajouter WhatsApp Business Platform / Cloud API.
3. Renseigner le webhook ci-dessus.
4. Utiliser le même `WHATSAPP_VERIFY_TOKEN` que dans `/opt/delikreol-whatsapp/.env`.
5. Abonner le webhook aux messages.

## Flux actuel
Les messages texte et les médias reçus sont enregistrés dans `/opt/delikreol-whatsapp/data/`.
Les fichiers sont téléchargés immédiatement, contrôlés par signature et conservés avec un fichier JSON de métadonnées.
La publication automatique sur le catalogue reste volontairement désactivée tant que la structure produit du site n'est pas confirmée.
