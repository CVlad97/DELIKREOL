/*
  # Optimize RLS Policies - Auth Initialization

  1. Performance Improvements
    - Replace auth.<function>() with (select auth.<function>()) in RLS policies
    - This prevents re-evaluation of auth functions for each row
    - Critical for query performance at scale

  2. Tables Updated
    - compensation_rules (3 policies)
    - loyalty_points (1 policy)
    - products (1 policy)
    - responsibility_matrix (1 policy)
    - whatsapp_templates (1 policy)
    - contact_messages (2 policies)

  3. Impact
    - Significant performance improvement on large datasets
    - Auth functions evaluated once per query instead of per row
*/

-- ============================================================================
-- COMPENSATION_RULES
-- ============================================================================

DROP POLICY IF EXISTS "Only admins can insert compensation rules" ON compensation_rules;
CREATE POLICY "Only admins can insert compensation rules"
  ON compensation_rules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can update compensation rules" ON compensation_rules;
CREATE POLICY "Only admins can update compensation rules"
  ON compensation_rules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can delete compensation rules" ON compensation_rules;
CREATE POLICY "Only admins can delete compensation rules"
  ON compensation_rules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.user_type = 'admin'
    )
  );

-- ============================================================================
-- LOYALTY_POINTS
-- ============================================================================

DROP POLICY IF EXISTS "Users view own points, admins view all" ON loyalty_points;
CREATE POLICY "Users view own points, admins view all"
  ON loyalty_points FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.user_type = 'admin'
    )
  );

-- ============================================================================
-- PRODUCTS
-- ============================================================================

DROP POLICY IF EXISTS "Users view available products, vendors manage own" ON products;
CREATE POLICY "Users view available products, vendors manage own"
  ON products FOR SELECT
  TO authenticated, anon
  USING (
    is_available = true
    OR vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.user_type = 'admin'
    )
  );

-- ============================================================================
-- RESPONSIBILITY_MATRIX
-- ============================================================================

DROP POLICY IF EXISTS "Users view active RACI, admins manage" ON responsibility_matrix;
CREATE POLICY "Users view active RACI, admins manage"
  ON responsibility_matrix FOR SELECT
  TO authenticated
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.user_type = 'admin'
    )
  );

-- ============================================================================
-- WHATSAPP_TEMPLATES
-- ============================================================================

DROP POLICY IF EXISTS "Users view active templates, admins manage" ON whatsapp_templates;
CREATE POLICY "Users view active templates, admins manage"
  ON whatsapp_templates FOR SELECT
  TO authenticated
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.user_type = 'admin'
    )
  );

-- ============================================================================
-- CONTACT_MESSAGES
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view contact messages" ON contact_messages;
CREATE POLICY "Admins can view contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update contact messages" ON contact_messages;
CREATE POLICY "Admins can update contact messages"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.user_type = 'admin'
    )
  );
