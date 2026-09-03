# Pré-audit Supabase — médias traiteurs — 2026-09-03

## Verdict

**GO technique pour créer un module neuf, mais application distante bloquée sans accès SQL/Management propriétaire.**

## Preuves production sans effet de bord

| Contrôle | Résultat |
|---|---|
| `public.traiteur_media` via REST | HTTP 404 — `PGRST205`, table absente du schéma exposé |
| Bucket `traiteur-media` | `Bucket not found` |
| Liste anonyme des objets | 0 objet visible |
| Supabase CLI Management | accès token absent |
| Secret GitHub service role | nom présent, valeur non récupérable — normal |

Aucune table, policy, contrainte, ligne ou objet Storage n’a été créé ou modifié pendant ce pré-audit.

## Migration préparée

`supabase/migrations/20260901000000_create_traiteur_media.sql`

Garanties prévues :

- bucket privé ;
- limite serveur 50 Mo ;
- liste blanche MIME ;
- RLS table et Storage via `public.is_delikreol_admin()` ;
- `storage_path` unique ;
- upload privé et non publié ;
- prévisualisation par URL signée ;
- aucune policy publique automatique.

## Action propriétaire minimale

Dans Supabase Dashboard, exécuter d’abord dans SQL Editor :

```sql
SELECT to_regclass('public.traiteur_media') AS table_name;

SELECT id, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'traiteur-media';

SELECT policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE (schemaname = 'public' AND tablename = 'traiteur_media')
   OR (schemaname = 'storage' AND tablename = 'objects'
       AND policyname LIKE 'traiteur_media_storage_%');

SELECT proname, prosecdef, proconfig
FROM pg_proc
WHERE proname = 'is_delikreol_admin';
```

Ensuite, après sauvegarde, appliquer la migration préparée en staging puis vérifier :

1. bucket présent, `public=false` ;
2. taille et MIME configurés ;
3. RLS active ;
4. anon refusé ;
5. authenticated non-admin refusé ;
6. admin autorisé ;
7. upload + URL signée ;
8. échec DB sans objet orphelin ;
9. suppression table + Storage ;
10. aucune publication publique.

## Gate production

Ne pas déclarer le stockage média opérationnel avant les dix vérifications ci-dessus.
Ne pas appliquer la migration Kaygo `20260901000001_kaygo_delivery_bridge.sql` : elle est classée NO-GO.
