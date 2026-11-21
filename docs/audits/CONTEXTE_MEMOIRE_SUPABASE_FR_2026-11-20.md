# DELIKREOL — Audit croisé contexte, livrables et migration Supabase France

Date : 20 novembre 2026 (Martinique). Statut : **NO-GO commercial / migration France non exécutée**.

## Preuves relevées (lecture seule, Supabase MCP)

- Projet DELIKREOL `boihlgodmclljtckhmgz` : `ACTIVE_HEALTHY`, région **us-east-2**, PostgreSQL 17.
- Base publique : **91 produits, 11 vendeurs, 10 candidatures partenaires, 126 médias traiteurs, 8 fichiers catalogue partenaires, 80 articles catalogue partenaires, 1 commande, 1 ligne de commande, 0 paiement, 0 livraison** (comptages approximatifs de `list_tables`, non preuve de flux opérationnel).
- RLS activée sur toutes les tables `public` listées ; l'activation seule ne garantit pas la sécurité des politiques.
- Supabase Security Advisor : 4 fonctions `SECURITY DEFINER` exécutables par `authenticated` (`accept_delivery_mission`, `archive_product_admin`, `claim_partner_access`, `vendor_transition_order`) à auditer pour autorisation effective ; protection des mots de passe compromis désactivée.
- Edge Functions actives : `checkout-order`, `create-sumup-checkout`, `sumup-webhook`, `stripe-webhook`, `vendor-push-gateway` et autres. **Active ≠ testée**. `sumup-webhook` a `verify_jwt=false`, ce qui exige une vérification stricte de signature dans le code.
- Déploiement GitHub Pages : `.github/workflows/deploy.yml` référence explicitement l'URL de l'ancien projet US ; il faudra la changer au moment du basculement, avec les autres environnements, et régénérer la clé publique côté France.
- VPS2 `/` : 96 Go, 71 Go utilisés, 26 Go libres (~74 %) au moment de la vérification.

## Corrélations des demandes historiques (à vérifier avant fermeture)

| Sujet | Contexte existant | État prouvé / action suivante |
|---|---|---|
| Langouste House / Charles SUVELOR | Site et logo demandés, ancienne archive WhatsApp et anciens commits signalés | Absence de Langouste House dans catalogue local courant ; retrouver les assets des versions antérieures, contrôler droits et intégrer sans inventer de photos |
| Catalogue photos | Skill `delikreol-catalog-photo-go`, logos Ninice et Chef à Mada, portraits partenaires | Images existantes, mais conformité identité/produit, allergènes et validation partenaires non démontrées |
| Accès partenaires | Skill `delikreol-partner-linking`, tables d'invitations et d'accès | Refaire parcours client/partenaire et auditer `claim_partner_access` avec test de non-escalade |
| Paiements | Fonctions SumUp/Stripe déployées, 0 ligne dans `payments` | Tester sandbox, signature et rejeu webhook, annulation et remboursement ; aucune opération live sans validation |
| Livraison et relais | Tables `deliveries`, `drivers`, `relay_points` vides | Tester affectation, notifications et preuve de remise, sans simuler un succès réel |
| KopeAgri / IKABAY | Intégrations et synchronisation demandées | Aucun flux B2B complet prouvé ; ne pas confondre projets, utilisateurs et données personnelles |
| GO commercial | Protocole de 20 commandes documenté | 20 scénarios E2E non démontrés ; statut NO-GO maintenu |

## Migration US → France : protocole de bascule contrôlé

1. **Ne pas modifier/supprimer le projet US.** Vérifier plan, quotas, frais, région France disponible, capacité de création et fenêtre de coupure.
2. Inventorier schémas, données, extensions, Auth, RLS, Storage buckets et **objets**, Edge Functions, secrets, triggers, cron, Realtime, domaines, emails, webhooks, paramètres OAuth, clés et intégrations.
3. Export chiffré et vérifié de la base + stockage des fichiers, avec copie hors VPS et restauration testée. Ne jamais committer de dump ni de secret.
4. Créer **un nouveau projet Supabase dans une région France** après validation du coût. Une région ne se change pas en place. La fonction `Restore to a New Project` Supabase conserve la région source et ne suffit donc pas pour déplacer US vers France.
5. Restaurer DB, Auth et données ; migrer séparément les objets Storage, Edge Functions, paramètres, secrets et fournisseurs externes. Comparer comptes, lignes, objets, RLS, fonctions, contraintes, versions et intégrité.
6. Tester dans le nouveau projet les accès client/partenaire, produits, images, commandes, SumUp/Stripe sandbox, webhooks, notifications, rôles, permissions et rollback.
7. Basculer `VITE_SUPABASE_URL`/clé publique dans GitHub Actions et les autres environnements **uniquement après validation** ; mettre à jour les URLs de callback et webhooks ; surveiller et maintenir l'ancien projet en repli temporaire.
8. Conserver la preuve de résidence de données (la région DB France ne prouve pas à elle seule la résidence de toutes les données chez les prestataires tiers).

Références officielles :
- https://supabase.com/docs/guides/platform/migrating-within-supabase
- https://supabase.com/docs/guides/platform/clone-project
- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/database/database-linter

## Autorisations non obtenues

Pas d'autorisation de coût de nouveau projet, de coupure de production, de création de ressources payantes, ni de migration réelle de données. Aucune de ces actions n'a été réalisée. Le présent rapport ne contient aucun secret ni données personnelles.
