# DELIKREOL — Bank And Keys Readiness

Date: 2026-07-06
Objectif: savoir exactement ce qui manque avant encaissement, campagne email et automatisation complete.

## Compte pro / banque

Documents a preparer:

- Piece d'identite du dirigeant.
- Justificatif de domicile ou domiciliation.
- Justificatif d'immatriculation si deja disponible.
- Statuts si societe.
- SIREN/SIRET ou preuve de demarche en cours.
- Liste des beneficiaires effectifs si applicable.
- Telephone et email publics coherents avec le site.

Decision temporaire:

- Avant compte pro valide: utiliser devis + confirmation manuelle.
- Apres compte pro valide: activer facturation et paiements.

## Cles et services

| Service | Variable / preuve | Statut attendu |
| --- | --- | --- |
| Supabase | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Obligatoire pour donnees |
| Stripe public | `VITE_STRIPE_PUBLISHABLE_KEY` | Seulement si paiement active |
| Stripe secret | Secret serveur uniquement, jamais frontend | Obligatoire pour paiement reel |
| Stripe webhook | Signature webhook verifiee | Obligatoire avant paiement auto |
| Google Analytics | `VITE_GA_ID` | Optionnel tracking |
| Meta Pixel | `VITE_FB_PIXEL_ID` | Optionnel campagnes Meta |
| Email domaine | MX, SPF, DKIM, DMARC | Obligatoire avant mailing |

## Regle encaissement

Autorise maintenant:

- Devis.
- Confirmation WhatsApp.
- Virement manuel.
- Acompte manuel si conditions ecrites.

Bloque tant que non valide:

- Paiement carte automatique.
- Campagne email a volume.
- Promesse de livraison garantie sans partenaire confirme.
- Facturation definitive sans statut legal correct.

## Tests avant activation paiement

1. `npm run check:env`.
2. Paiement test Stripe en mode test.
3. Verification webhook avec signature.
4. Creation facture test.
5. Verification remboursement / annulation.
6. Test commande complete client -> admin -> partenaire.

## Informations a renseigner quand confirmees

- Nom legal:
- Forme juridique:
- SIREN:
- SIRET:
- Adresse:
- Email legal:
- Telephone:
- Banque:
- IBAN pro disponible: oui / non
- Stripe active: oui / non
- Date de validation:

