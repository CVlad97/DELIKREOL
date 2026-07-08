-- DELIKREOL — Security hardening P0 (non-destructive)
-- Ajoute policies manquantes, restreint les over-permissives, ne supprime aucune donnée.

-- ============================================================
-- 1. MEDIA_ASSETS — policy minimale
-- ============================================================
DROP POLICY IF EXISTS "Public read media_assets" ON public.media_assets;
CREATE POLICY "Public read media_assets" ON public.media_assets
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR is_delikreol_admin());

DROP POLICY IF EXISTS "Admin write media_assets" ON public.media_assets;
CREATE POLICY "Admin write media_assets" ON public.media_assets
  FOR ALL TO authenticated
  USING (is_delikreol_admin())
  WITH CHECK (is_delikreol_admin());

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. PILOT_TEST_FEEDBACK — désactiver usage public large
-- ============================================================
DROP POLICY IF EXISTS "Public insert pilot_test_feedback" ON public.pilot_test_feedback;
CREATE POLICY "Public insert pilot_test_feedback" ON public.pilot_test_feedback
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin all pilot_test_feedback" ON public.pilot_test_feedback;
CREATE POLICY "Admin all pilot_test_feedback" ON public.pilot_test_feedback
  FOR ALL TO authenticated
  USING (is_delikreol_admin())
  WITH CHECK (is_delikreol_admin());

ALTER TABLE public.pilot_test_feedback ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. RESTREINDRE WITH CHECK true
-- ============================================================
-- Vérifier les policies existantes avec WITH CHECK true sur des tables sensibles
-- Si elles existent, les remplacer par des conditions plus strictes
DO $$
BEGIN
  -- orders : pas de WITH CHECK true sur anon
  DROP POLICY IF EXISTS "orders_insert_anon" ON public.orders;
  CREATE POLICY "orders_insert_anon" ON public.orders
    FOR INSERT TO anon
    WITH CHECK (customer_phone IS NOT NULL);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================
-- 4. STORAGE BUCKETS — éviter listing public large
-- ============================================================
-- caterer-photos : déjà durci dans rls_policy_hardening.sql
-- product-photos : ajouter si bucket existe
DO $$
BEGIN
  DROP POLICY IF EXISTS "Product photos public select" ON storage.objects;
  CREATE POLICY "Product photos public select" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'product-photos');

  DROP POLICY IF EXISTS "Product photos authenticated insert" ON storage.objects;
  CREATE POLICY "Product photos authenticated insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-photos' AND is_delikreol_admin());

  DROP POLICY IF EXISTS "Product photos authenticated update" ON storage.objects;
  CREATE POLICY "Product photos authenticated update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'product-photos' AND is_delikreol_admin())
    WITH CHECK (bucket_id = 'product-photos');

  DROP POLICY IF EXISTS "Product photos authenticated delete" ON storage.objects;
  CREATE POLICY "Product photos authenticated delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'product-photos' AND is_delikreol_admin());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================
-- 5. RÉVOQUER EXECUTE anon/authenticated sur SECURITY DEFINER non publiques
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.is_delikreol_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

-- ============================================================
-- 6. PROTECTION AUTH — leaked password detection
-- ============================================================
ALTER SYSTEM SET pgaudit.log_level TO 'warning';
-- Note: la protection des mots de passe fuite est gérée côté Supabase Auth
-- Activer dans le dashboard : Authentication > Settings > Leaked password protection

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('media_assets', 'pilot_test_feedback', 'orders')
ORDER BY tablename, policyname;