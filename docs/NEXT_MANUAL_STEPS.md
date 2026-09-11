# Étapes manuelles restantes

## 1. WhatsApp Business

Endpoint à déclarer :

```text
https://delikreol.com/webhooks/whatsapp
```

Token de vérification présent uniquement sur le VPS :

```bash
cat /opt/delikreol-whatsapp/verify-token.txt
```

Depuis Meta Developers, fournir ensuite :

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_APP_SECRET`
- `WHATSAPP_PHONE_NUMBER_ID`
- l'identifiant du compte WhatsApp Business

Ne jamais placer ces valeurs dans Git, une capture d'écran ou un message public.

## 2. Configuration locale du VPS

Modifier uniquement ce fichier privé :

```bash
nano /opt/delikreol-whatsapp/.env
cd /opt/delikreol-whatsapp && docker compose up -d --force-recreate
```

## 3. Test de réception

Envoyer un message texte et une image au numéro WhatsApp configuré. Vérifier ensuite :

```bash
find /opt/delikreol-whatsapp/data -type f -mmin -10 -print
```

## 4. Règle de publication catalogue à confirmer

Avant toute publication automatique, confirmer :

- brouillon ou publication immédiate ;
- nom du produit ;
- prix et devise ;
- catégorie ;
- description ;
- stock ;
- image principale ;
- numéro de téléphone autorisé à publier.

## Liens officiels

- https://developers.facebook.com/apps/
- https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components
