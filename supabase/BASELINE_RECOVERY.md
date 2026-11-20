# Reconstitution du schéma initial — staging uniquement

## Constat
Le dépôt commence ses migrations par `20260609000004_safe_migration.sql`, qui référence `public.profiles` avant toute création. Les tables historiques `profiles`, `vendors`, `products`, `orders` ne sont pas créées par une migration initiale versionnée. La migration `p0_p1_operational_backoffice.sql` est ignorée par la CLI car son nom n'est pas daté.

## Procédure sûre
1. Exporter le **schéma uniquement** depuis le projet de référence avec la méthode officielle `supabase db dump` et un accès autorisé (sans `--data-only`, sans utilisateurs ni données). Ne jamais exporter `auth.users` ou les secrets.
2. Examiner le SQL exporté avant toute exécution : extensions, `SECURITY DEFINER`, `GRANT`, RLS, vues et références externes. Ne pas recopier automatiquement les clés, tokens ou données.
3. Dans cette branche de travail, construire une migration initiale datée, antérieure à `20260609000004`, couvrant les tables historiques et dépendances. Éviter de dupliquer les objets déjà créés par les migrations suivantes.
4. Sur base locale vierge, exécuter `supabase start` puis contrôler schéma, politiques RLS, tests d'API et jeux de données fictifs.
5. Ne pas appliquer la migration initiale à la production sans revue explicite et plan de retour arrière.

## État
En attente du schéma de référence complet. Ne pas inventer les colonnes, contraintes et permissions des tables métier.
