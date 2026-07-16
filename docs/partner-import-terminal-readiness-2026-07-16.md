# Import partenaires + terminal mobile — 2026-07-16

## Import Drive

Dossier source : `https://drive.google.com/drive/folders/1jCKzWuQJKMtBwDAaOiqhyOq0VDI_ngHy`

Archives traitées :

- Sweet Family Traiteur Orianne — 2 exports WhatsApp.
- Snack Savè Peyi'A / Maria Traiteur — 2 exports WhatsApp.
- Les Délices de Ninice — 1 export WhatsApp.
- Saveurs Afrique — 1 export WhatsApp.
- Coco Traiteur — 1 export WhatsApp.

Règle appliquée : seules les photos de produits ont été importées. Les fichiers PDF, VCF, audios, vidéos, QR codes, invitations, cartes, menus et captures contenant des coordonnées privées sont exclus du catalogue.

Photos publiées :

- `public/vendors/save-peyia/drive-import/` + vignettes `public/vendors/save-peyia/thumbs/drive-*.webp`.
- `public/vendors/sweet-family/drive-import/` + vignettes `public/vendors/sweet-family/thumbs/drive-*.webp`.
- `public/vendors/ninice/drive-import/` + vignettes `public/vendors/ninice/thumbs/drive-*.webp`.
- `public/vendors/saveurs-afrique/drive-import/` + vignettes `public/vendors/saveurs-afrique/thumbs/drive-*.webp`.

## Paiement téléphone / TPE partenaire

Ce qui est prêt côté application web :

- Page `/terminal-partenaire` pour créer une vente comptoir.
- Choix du mode : SumUp Tap to Pay, lien SumUp, ou paiement manuel.
- Génération d'un numéro de commande DeliKreol.
- Sauvegarde locale du suivi commande.
- Brouillon de facture prêt à envoyer par email et WhatsApp.
- Statut Qonto préparé : `pending_reconciliation`.

Ce qui doit rester côté PSP certifié :

- Tap to Pay réel Android/iPhone via SumUp SDK ou app SumUp Business.
- Traitement carte, NFC, conformité PCI, authentification forte et anti-fraude.
- Webhooks serveur de paiement pour marquer automatiquement `paid`.

## Qonto et facturation électronique

Préparation MVP :

- Libellé commande unique utilisable pour rapprochement Qonto.
- Facture brouillon envoyable par email/WhatsApp.
- Statuts prêts : `invoice_status`, `qonto_status`.

À activer en production :

- OAuth/API Qonto serveur uniquement, jamais côté navigateur.
- Création réelle de facture client via API Qonto.
- Webhook SumUp -> commande payée -> facture -> rapprochement Qonto.
- Plateforme agréée de dématérialisation pour la réforme française de facturation électronique.

## WhatsApp partenaires — brouillon à envoyer manuellement

Bonjour, c’est DeliKreol. Pour finaliser votre fiche partenaire avant publication, merci de valider :

1. Description officielle de votre activité.
2. Liste des plats avec prix.
3. Composition et allergènes.
4. Capacité de production par jour.
5. Modes acceptés : retrait, livraison, point relais.
6. Photos produits autorisées pour publication.

Votre accès de correction : https://delikreol.com/partenaire?code=VOTRE_CODE_PARTENAIRE

Nouveau test disponible : https://delikreol.com/terminal-partenaire pour préparer paiement, facture email/WhatsApp et suivi commande.
