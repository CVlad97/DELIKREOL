# Audit fonctionnel DELIKREOL — 2026-08-21

## Verdict exécutif

**NO-GO commercial.** Le frontend, les routes statiques et les protections d'erreur fonctionnent, mais aucun parcours de commande réel ne peut être validé de bout en bout avec les données production actuelles.

| Axe | Statut |
|---|---|
| Frontend/build | PASS |
| Navigation publique | PASS partiel |
| Catalogue | PASS affichage / FAIL identité backend |
| Panier | PASS local |
| Checkout réel | FAIL P0 |
| Auth email | PASS configuration / transaction non déclenchée |
| Auth Google | FAIL — provider désactivé |
| Suivi public | PASS sécurité / résultat réel non testable sans commande |
| Admin | PASS protection UI / données métier non testées sans compte admin |
| WhatsApp | BLOCKED — bridge connecté seulement, aller-retour non prouvé |
| PWA | PASS installable / FAIL offline réel |
| SEO/deep links | FAIL partiel |

## Environnement et preuves

- SHA audité et déployé : `cb18b35a681ad1d04e764d9830468fbd811cd874`
- CI GitHub Pages : succès.
- Typecheck : succès.
- Lint : succès.
- Vitest : **68/68**.
- Build : succès, **68 routes SPA générées**.
- Audit HTTP : **28 OK / 0 KO**.
- Audit secrets : **0**.
- Playwright : navigateur téléchargé, mais démarrage impossible dans le conteneur (`libglib-2.0.so.0` absente ; installation système root indisponible). Les échecs E2E observés sont infrastructurels.

## Matrice fonctionnelle

| ID | Parcours | Résultat | Preuve |
|---|---|---|---|
| F01 | Accueil | PASS | HTTP 200, assets JS/CSS chargés |
| F02 | Catalogue | PASS partiel | recherche/filtres/cartes présents ; 86 produits statiques |
| F03 | Fiche produit depuis catalogue | FAIL P1 | les cartes ouvrent un aperçu, aucun lien vers `/produit/:slug` trouvé |
| F04 | Deep link produit | FAIL P1 | URL produit arbitraire répond HTTP 404 avec shell SPA |
| F05 | Ajout panier/persistance | PASS statique | contexte panier + localStorage présents |
| F06 | Checkout sécurisé | PASS architecture | tous les checkouts principaux appellent `checkout-order` |
| F07 | Checkout produit catalogue | FAIL P0 | 86/86 IDs statiques sont des slugs ; Edge Function attend UUID ; test slug → HTTP 400 |
| F08 | Checkout produit Supabase | FAIL P0 | 3 produits visibles, 3/3 reliés à aucun vendor public visible ; ID réel testé → HTTP 409 Produit indisponible |
| F09 | RPC atomique | FAIL/BLOCKED P0 | appel exact anon → PGRST202 ; absence ou masquage non distinguable sans service-role/SQL audit |
| F10 | Fallback checkout | FAIL P0 UX | erreur serveur sauvegardée localement + WhatsApp + message de succès apparent |
| F11 | Auth email | PASS configuration | Supabase settings HTTP 200, email actif, signup actif, confirmation requise |
| F12 | Auth Google | FAIL P1 | `external.google=false` |
| F13 | Suivi token invalide | PASS | malformed → HTTP 400 ; token 32 hex inconnu → HTTP 404 |
| F14 | Suivi commande réelle | BLOCKED | aucune commande réelle contrôlée disponible |
| F15 | Protection admin anonyme | PASS statique | `ProtectedAdminRoute` redirige vers connexion |
| F16 | Autorisation admin backend | BLOCKED | pas de session admin fournie ; RLS complète non interrogée via SQL |
| F17 | Tables sensibles anon | PASS partiel | 0 ligne visible ou 401 sur tables testées |
| F18 | Données vendors publiques | FAIL P1 confidentialité | `select=*` expose téléphone 7/7, email 3/7 et commission 7/7 |
| F19 | WhatsApp site | PASS liens statiques | `wa.me` présent sur les pages auditées |
| F20 | WhatsApp bot E2E | BLOCKED | aucun message entrant/sortant de second numéro vérifié |
| F21 | Manifest/PWA | PASS partiel | manifest/icônes/SW accessibles |
| F22 | Offline PWA | FAIL P2 | SW sans précache ni stratégie offline |
| F23 | SEO initial par route | FAIL P1 | HTML serveur conserve métadonnées génériques |
| F24 | Headers sécurité | FAIL P1 | CSP/HSTS/XFO/XCTO/Referrer/Permissions absents |

## P0 — Bloquants

### P0-1 — Catalogue incompatible avec checkout

Le catalogue actif est statique et utilise 86 slugs. L'Edge Function accepte uniquement des UUID et recharge prix/disponibilité depuis Supabase. Il faut synchroniser un sous-ensemble commercial validé dans Supabase et utiliser une correspondance stable slug → UUID.

### P0-2 — Données produits/vendeurs Supabase incohérentes

Les trois produits visibles via l'API publique ne correspondent à aucun des sept vendors visibles. Un essai non destructif sur un ID produit réel est refusé `409 Produit indisponible` avant création.

### P0-3 — Faux succès du fallback checkout

Quand `checkout-order` échoue, `CartPage` peut sauvegarder localement, ouvrir WhatsApp, vider le panier et afficher « Demande préparée ». Cette issue doit être un état explicite **non enregistré côté serveur**, sans vider le panier automatiquement.

### P0-4 — RPC atomique non prouvée en production

La fonction SQL existe dans le dépôt, mais sa présence production n'est pas prouvée avec le rôle anon. Un audit SQL/service-role doit vérifier fonction, signature, droits et migrations avant tout GO.

## P1

1. Activer Google OAuth dans Supabase.
2. Publier une vue vendors minimale sans téléphone privé, email, commission ni champs Stripe.
3. Relier les cartes catalogue aux fiches produit.
4. Pré-générer tous les slugs ou utiliser un hébergement avec rewrite SPA HTTP 200.
5. Ajouter les headers de sécurité via le frontal/CDN.
6. Remplacer l'email admin codé en dur côté UI par un rôle/profil uniquement ; conserver RLS comme autorité.
7. Tester les transitions admin via une RPC métier journalisée.
8. Corriger `robots` panier/connexion : les tests actuels vérifient seulement une valeur non vide alors que le code applique `index, follow`.

## P2

1. Réactiver une vraie stratégie PWA offline ou retirer les promesses offline.
2. Ajouter la route locale `/admin/corrections-partenaires` au générateur SPA avant déploiement de ce travail local.
3. Moderniser la suite E2E historique et couvrir checkout, tracking, admin, livreur et corrections partenaires.
4. Aligner Node local 22 avec l'exigence déclarée `>=24`.

## Actions requises pour un GO

1. Audit SQL `pg_policies`, fonctions, index et données avec rôle propriétaire.
2. Sauvegarde puis staging Supabase.
3. Import validé des produits/vendors réels et correspondance slug → UUID.
4. Correction du fallback en état d'échec/non synchronisé.
5. Cinq tests de concurrence checkout.
6. Une commande contrôlée réelle : création, admin, suivi token, WhatsApp et total serveur.
7. Test WhatsApp entrant + réponse Hermes depuis un second numéro.
8. Google OAuth de bout en bout.
9. Zéro P0 ouvert.

## Limites de l'audit

- Aucun compte, email, paiement ou commande réelle créé volontairement.
- Aucun secret affiché.
- Aucun accès admin propriétaire fourni.
- Test navigateur bloqué par dépendance système `libglib-2.0.so.0` absente du conteneur ; les contrôles HTTP, API, statiques et unitaires restent reproductibles.
- Les modifications locales existantes `AdminLayout`, `router.tsx` et `AdminPartnerCorrections.tsx` ont été préservées.
