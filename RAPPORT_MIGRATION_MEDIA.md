# Rapport — médias traiteurs DELIKREOL

## Statut

**Code prêt pour revue. Migration non appliquée. Bucket et table non déclarés opérationnels sans vérification distante.**

## Architecture retenue

- Bucket `traiteur-media` privé.
- Accès table et Storage réservé à `public.is_delikreol_admin()`.
- Fichiers limités à 50 Mo côté bucket et table.
- Types MIME autorisés côté bucket et table.
- `storage_path` conservé comme identité technique.
- Upload initial `is_published=false`.
- Prévisualisation admin par URL signée temporaire.
- Compensation Storage si l'insertion de métadonnées échoue.
- Publication publique hors périmètre : elle devra être explicite et validée image par image.

## Fichiers

- `src/components/MediaUpload.tsx`
- `src/pages/admin/AdminTraiteurMedia.tsx`
- `supabase/migrations/20260901000000_create_traiteur_media.sql`
- `scripts/storage-policies.sql`
- route `/admin/media-traiteurs`

## Validation locale

| Contrôle | Résultat |
|---|---|
| Typecheck | PASS |
| Lint | PASS |
| Tests | 68/68 |
| Build | PASS, 70 routes |
| Audit secrets | 0 problème |

## Pré-audit obligatoire avant migration distante

```sql
SELECT to_regclass('public.traiteur_media') AS table_name;

SELECT policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE (schemaname = 'public' AND tablename = 'traiteur_media')
   OR (schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE 'traiteur_media_storage_%');

SELECT id, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'traiteur-media';

SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.traiteur_media'::regclass;
```

## Critères après application staging

1. bucket présent et privé ;
2. limites MIME/taille confirmées ;
3. table avec RLS active ;
4. utilisateur anonyme refusé ;
5. utilisateur authentifié non-admin refusé ;
6. admin autorisé à uploader et prévisualiser ;
7. échec DB sans objet Storage orphelin ;
8. suppression DB + Storage vérifiée ;
9. aucune exposition publique avant validation.

## Rollback

Le rollback recommandé retire les policies/index ajoutés mais ne supprime ni table ni objets sans inventaire et sauvegarde.
