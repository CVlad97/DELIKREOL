# DeliKreol — Facebook / Instagram / données partenaires

## Décision production

DeliKreol ne doit pas aspirer Facebook ou Instagram avec un bot gratuit non officiel.

Raisons :

- risque de blocage des comptes partenaires ;
- conditions Meta souvent incompatibles avec le scraping automatisé ;
- données instables, non vérifiées et difficiles à maintenir ;
- risque juridique si des photos, stories ou textes sont repris sans consentement clair.

## Flux accepté pour le lancement

1. Le partenaire fournit ses liens officiels : Instagram, Facebook, site web.
2. L’admin les saisit dans Supabase `vendors` :
   - `instagram_url`
   - `facebook_url`
   - `website_url`
   - `social_links` si metadata supplémentaire.
3. Le site affiche uniquement des liens sortants validés en HTTPS.
4. Les photos restent importées depuis les fichiers fournis par le propriétaire, Drive, WhatsApp export ou Supabase Storage.
5. Aucune donnée privée Meta n’est stockée dans le frontend.

## Alternative officielle plus tard

Si DeliKreol doit importer automatiquement des publications :

- utiliser Meta Graph API avec consentement du compte partenaire ;
- connecter uniquement les pages/business autorisés ;
- stocker les tokens côté serveur uniquement ;
- valider chaque photo avant publication catalogue ;
- conserver la preuve de consentement partenaire.

## Checklist partenaire

- Nom public validé.
- Bio validée.
- Logo ou portrait validé.
- Instagram officiel fourni.
- Facebook officiel fourni.
- Autorisation écrite d’utiliser les photos.
- Photos catalogue HD sélectionnées manuellement.
