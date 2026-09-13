# DeliKreol — mémoire projet propre

Date de consolidation : 2026-09-13
Domaine canonique : `delikreol.com`
Dépôt principal : `CVlad97/DELIKREOL`
Projet Supabase : `boihlgodmclljtckhmgz`
Canal de commande prioritaire : WhatsApp-first, sans paiement carte public tant que Stripe n'est pas validé de bout en bout.

## À conserver comme vérité projet

- DeliKreol est une plateforme martiniquaise de commande de plats, traiteurs, snacks, livraison/retrait et services partenaires.
- Le lancement prioritaire est un MVP exploitable : catalogue, panier, composition menu, demande WhatsApp, devis, espaces admin/partenaire/livreur/point relais.
- Le numéro WhatsApp principal est `+596 696 65 35 89` / `596696653589`.
- Les emails professionnels visés sont `contact@delikreol.com`, `commandes@delikreol.com`, `partenaires@delikreol.com`.
- Le domaine à utiliser est `delikreol.com`, pas `delikreol.mq`.
- Le site doit rester utilisable en mode WhatsApp/fallback même si Supabase ou le paiement sont indisponibles.
- Stripe reste désactivé côté public tant que commande, paiement, webhook, commission et reversement ne sont pas validés.
- Google OAuth reste masqué côté interface tant que le provider Google n'est pas activé dans Supabase.
- Les comptes admin connus dans Supabase sont `vladimir.claveau@gmail.com` et `contactcvs@ikabay.store`.

## État technique validé

- GitHub Pages construit le site avec `VITE_BASE_PATH=/` et ajoute `CNAME=delikreol.com`.
- Les étapes CI à conserver : typecheck, lint, tests, audit secrets, build, fallback SPA, CNAME, déploiement GitHub Pages.
- Les routes protégées doivent rediriger vers `/connexion?next=...` si non connecté.
- Les routes admin doivent être derrière `ProtectedAdminRoute`.
- Les routes partenaire, livreur, documents partenaire et terminal partenaire doivent être derrière `ProtectedPartnerRoute`.
- Le panier crée une commande via la fonction `checkout-order`, puis prépare le message WhatsApp.
- Le message final client doit dire : `Demande préparée — à confirmer sur WhatsApp.`

## Points à ne pas oublier

- Les partenaires doivent valider leurs fiches, photos, prix, horaires, retrait/livraison avant usage officiel.
- Les comptes partenaires ne sont pas tous rattachés à des utilisateurs Supabase : l'accès partenaire réel dépend de l'email confirmé et du rôle `vendor`, `driver`, `relay_host` ou `admin`.
- Les fonctions Supabase sensibles peuvent être intentionnellement `SECURITY DEFINER`, mais chaque fonction exposée doit garder une vérification interne stricte.
- La protection contre mots de passe compromis doit être activée dans le Dashboard Supabase si le plan le permet.
- Les DNS/HTTPS/email du domaine doivent être vérifiés dans Hostinger/GitHub avant communication massive.

## Conversations anciennes à ignorer pour éviter la confusion

- Toute consigne indiquant `delikreol.mq` comme domaine principal.
- Toute proposition d'activation publique Stripe avant validation webhook complète.
- Toute promesse de délai de livraison fixe non validée par un prestataire.
- Toute demande d'utiliser ou d'afficher un secret/token dans le code frontend ou dans une conversation.

## Décision opérationnelle

- GO technique GitHub Pages si le dernier run `Deploy GitHub Pages` est vert.
- GO MVP préproduction/validation partenaires si WhatsApp, panier, catalogue et accès protégés sont OK.
- GO production commerciale complète seulement après validation manuelle du domaine, email, partenaires et sécurité Auth Supabase.