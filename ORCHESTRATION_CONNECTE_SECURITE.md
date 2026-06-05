# Orchestration connectee et securisee — DeliKreol

## Statut connecteurs verifies

- GitHub : connecte. Depot principal : CVlad97/DELIKREOL. Droits disponibles : admin, push, pull.
- Supabase : connecte en lecture projet. Un projet nomme Delikreol existe, mais il est indique inactif dans la liste des projets.
- Canva : connecte. L'affiche Snack Save Peyia a ete convertie en design Canva editable.
- Gmail : non operationnel actuellement, reconnexion requise.
- Hostinger / Hermes : utilisable via l'interface Hostinger Horizons et prompts de modification.

## Regle critique de securite

Ne jamais demander, afficher ou stocker :
- GitHub token ;
- Supabase service role key ;
- token WhatsApp Business ;
- mot de passe Hostinger ;
- mot de passe email ;
- cle API secrete ;
- token Meta permanent.

Cote frontend public, seules les variables publiques suivantes sont acceptables :
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY ou cle publishable Supabase
- VITE_WHATSAPP_MAIN
- VITE_EMAIL_CONTACT

## Contacts officiels DeliKreol

- WhatsApp Business principal : +596 696 65 35 89
- Email principal a creer ou configurer chez Hostinger : contact@delikreol.mq
- Emails optionnels : commandes@delikreol.mq, partenaires@delikreol.mq

## Nouveau partenaire

- Snack Save Peyia
- Commune : Riviere-Pilote
- Repere : pres du Pont de Fer
- Produits visibles : Cote de porc 12 EUR, Filet de poulet 10 EUR, Crevettes grillees 14 EUR
- Accompagnements : riz, lentilles, legumes pays, crudites
- Style : local, madras, tropical, jaune soleil, vert pays, rouge, orange, bois
- Contact direct du snack : a confirmer avant publication publique
- Boutons publics a router vers le WhatsApp DeliKreol principal

## A faire dans Hostinger / Hermes

1. Appliquer le fichier HERMES_BANKABLE_OPERATING_PROMPT.md.
2. Appliquer la fiche partners/snack-save-peyia.md.
3. Utiliser +596 696 65 35 89 comme WhatsApp public principal.
4. Utiliser contact@delikreol.mq comme email public principal.
5. Retirer toute mention de service role key, token GitHub ou token WhatsApp cote interface.
6. Retirer les identifiants demo visibles avant publication.
7. Remplacer les points relais fictifs par : Reseau points relais en constitution — candidatures ouvertes.
8. Creer une section admin MemLife pour suivre la memoire projet.
9. Ajouter une checklist de publication.

## Supabase Free securise

Avant execution SQL : verifier le projet Supabase actif.
Si le projet Delikreol est inactif, le restaurer manuellement depuis Supabase ou demander confirmation avant toute action payante.

Tables recommandees :
- profiles
- vendors
- products
- orders
- order_items
- drivers
- deliveries
- relay_points
- catering_requests
- partner_applications
- reviews
- leads
- marketing_posts
- financial_assumptions
- operational_alerts
- project_memory

RLS obligatoire sur toutes les tables exposees.

## Protection anti-copie realiste

Un site public ne peut jamais etre impossible a copier. La vraie protection passe par :
- marque et identite locale ;
- depot prive si necessaire ;
- pas de secrets dans le code ;
- RLS Supabase ;
- authentification admin ;
- contenus originaux ;
- historique GitHub ;
- mentions legales ;
- politique de confidentialite ;
- surveillance des copies.
