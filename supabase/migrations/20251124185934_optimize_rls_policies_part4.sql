/*
  # Optimize RLS Policies - Part 4 (Admin Tables)
  
  Continues RLS optimization for admin-only tables (API, WhatsApp, Partners, Errors).
*/

-- api_keys table
DROP POLICY IF EXISTS "Only admins can view API keys" ON public.api_keys;
CREATE POLICY "Only admins can view API keys"
  ON public.api_keys FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can insert API keys" ON public.api_keys;
CREATE POLICY "Only admins can insert API keys"
  ON public.api_keys FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can update API keys" ON public.api_keys;
CREATE POLICY "Only admins can update API keys"
  ON public.api_keys FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can delete API keys" ON public.api_keys;
CREATE POLICY "Only admins can delete API keys"
  ON public.api_keys FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  );

-- api_usage_logs table
DROP POLICY IF EXISTS "Only admins can view usage logs" ON public.api_usage_logs;
CREATE POLICY "Only admins can view usage logs"
  ON public.api_usage_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  );

-- whatsapp_messages table
DROP POLICY IF EXISTS "Admins can view all WhatsApp messages" ON public.whatsapp_messages;
CREATE POLICY "Admins can view all WhatsApp messages"
  ON public.whatsapp_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can view their own WhatsApp messages" ON public.whatsapp_messages;
CREATE POLICY "Users can view their own WhatsApp messages"
  ON public.whatsapp_messages FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- whatsapp_sessions table
DROP POLICY IF EXISTS "Admins can view all WhatsApp sessions" ON public.whatsapp_sessions;
CREATE POLICY "Admins can view all WhatsApp sessions"
  ON public.whatsapp_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can view their own WhatsApp session" ON public.whatsapp_sessions;
CREATE POLICY "Users can view their own WhatsApp session"
  ON public.whatsapp_sessions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- whatsapp_templates table
DROP POLICY IF EXISTS "Admins can manage WhatsApp templates" ON public.whatsapp_templates;
CREATE POLICY "Admins can manage WhatsApp templates"
  ON public.whatsapp_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  );

-- partner_applications table
DROP POLICY IF EXISTS "Admins can view applications" ON public.partner_applications;
CREATE POLICY "Admins can view applications"
  ON public.partner_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update applications" ON public.partner_applications;
CREATE POLICY "Admins can update applications"
  ON public.partner_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  );

-- error_logs table
DROP POLICY IF EXISTS "Admins can view error logs" ON public.error_logs;
CREATE POLICY "Admins can view error logs"
  ON public.error_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  );