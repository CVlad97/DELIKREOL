# Checklist livrable DeliKreol.mq

## Statut au dernier passage

- GitHub Pages reste la priorite gratuite.
- Hostinger/Hermes n'est pas prioritaire tant que les credits IA sont bloques.
- Supabase Delikreol est repere mais inactif : le site doit rester utilisable en mode statique / WhatsApp-first.
- Snack Save Peyia est ajoute au catalogue statique GitHub Pages avec les trois produits visibles du menu transmis.

## Priorite 1 — Contacts et securite

- WhatsApp Business principal : +596 696 65 35 89.
- Email principal a creer chez Hostinger : contact@delikreol.mq.
- Emails optionnels : commandes@delikreol.mq, partenaires@delikreol.mq.
- Ne pas afficher de token ou cle secrete.
- Ne pas afficher de compte demo public en production.
- Verifier que les boutons WhatsApp pointent vers le numero principal DeliKreol.

## Priorite 2 — Donnees reelles

Partenaires a conserver :
- An Tje Coco.
- Coco's Food.
- Saveurs d'Afrique.
- Les Delices de Ninice.
- Snack Save Peyia.

A retirer ou masquer :
- faux avis ;
- faux livreurs ;
- faux points relais ;
- faux chiffres de traction ;
- faux produits non rattaches.

## Priorite 3 — Snack Save Peyia

Integration deja faite dans `src/data/mockCatalog.ts` :
- Cote de porc : 12 EUR.
- Filet de poulet : 10 EUR.
- Crevettes grillees : 14 EUR.
- Accompagnements : riz, lentilles, legumes pays, crudites.
- Mention publique ajoutee : horaires, retrait et livraison a confirmer avec le prestataire.

A faire ensuite :
- Ajouter une fiche profil traiteur si l'ecriture sur `partnerProfiles.ts` passe.
- Ajouter une image ou une affiche optimisee, seulement si les droits d'utilisation sont confirmes.
- Confirmer horaires, jours de disponibilite, retrait, livraison et delai preparation.

## Priorite 4 — MemLife

- Table Supabase project_memory creee par migration.
- Page admin MemLife a creer dans le site.
- Categories : vision, partenaires, produits, photos, logistique, WhatsApp, marketing, finance, decisions, a confirmer, erreurs.

## Priorite 5 — Supabase

- Projet Delikreol Supabase repere mais inactif.
- Ne pas restaurer sans validation si cout possible.
- Activer RLS sur toutes les tables publiques avant usage reel.
- Utiliser seulement les cles publiques cote frontend.

## Priorite 6 — Publication gratuite

- GitHub Pages doit rester le canal principal tant que Hostinger/Hermes est bloque.
- Verifier l'URL publique apres chaque commit.
- Ne pas publier officiellement le domaine delikreol.mq avant checklist finale.

## Validation avant publication

- Test mobile.
- Test formulaire contact.
- Test demande devis.
- Test panier.
- Test bouton WhatsApp.
- Test pages traiteurs.
- Test recherche Snack Save Peyia.
- Test page/catalogue avec Cote de porc, Filet de poulet, Crevettes grillees.
- Verification absence de secrets.
- Verification absence de faux contenu.
- Verification mentions legales et confidentialite.
