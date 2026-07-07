# DELIKREOL — Accès Pilote (Lancement 2026)

## Admin vérifié
- **Vladimir Claveau** (vladimir.claveau@gmail.com)
  - `profiles.user_type = 'admin'` ✅
  - `admin_users` entry ✅

## Liens partenaires (code dans l'URL)

| Partenaire | Lien | Message WhatsApp |
|------------|------|------------------|
| Saveurs d'Afrique | `/partenaire?code=SAVEURS-PILOTE` | Copier dans Admin → Accès pilote |
| Coco's Food | `/partenaire?code=COCO-PILOTE` | Copier dans Admin → Accès pilote |
| Les délices de Ninice | `/partenaire?code=NINICE-PILOTE` | Copier dans Admin → Accès pilote |
| Sweet Family | `/partenaire?code=SWEETFAMILY-PILOTE` | Copier dans Admin → Accès pilote |
| Gouté Mwen (Stacy) | `/partenaire?code=GOUTE-MWEN-PILOTE` | Copier dans Admin → Accès pilote |
| An Tjè Coco | `/partenaire?code=ANTJE-COCO-PILOTE` | Copier dans Admin → Accès pilote |
| Snack Savè Peyi'A | `/partenaire?code=SAVE-PEYI-PILOTE` | Copier dans Admin → Accès pilote |

## Sécurité en place

1. **Routes admin protégées** (`ProtectedAdminRoute`)
   - /admin/* bloqué si pas connecté ou non admin
   - Redirection vers /pro avec message clair

2. **Partenaire — insertion corrections**
   - Formulaire `/partenaire?code=XXX` sauvegarde directement dans `partner_corrections` (Supabase)
   - Fallback WhatsApp si erreur réseau
   - Lecture réservée aux admins (`user_type='admin'` ou `admin_users`)

3. **Pas de secrets côté frontend**
   - Aucun PARTNER_CODES hardcodé (résolution côté serveur)
   - Tokens à venir via `partner_access_tokens`

## Checklist test pour chaque partenaire

1. Ouvrir le lien pilote en navigation privée ou téléphone
2. Vérifier que le formulaire s'affiche avec le nom du traiteur
3. Modifier les champs (téléphone, horaires, plats, prix…)
4. Cliquer "Envoyer les corrections"
5. Confirmer l'envoi (toast ou WhatsApp)
6. Vérifier côté admin → `Admin → Accès pilote` ou `AdminPartnersApplications`
7. Signaler un bug avec le bouton "Signaler un bug" sur /test-pilote ou /feedback

## Page /test-pilote
- Visible uniquement pour admins
- Liste des 7 liens + copier
- Message WhatsApp pré-rempli
- Checklist en cocher

Dernière mise à jour : 2026-06-23 — 23:27