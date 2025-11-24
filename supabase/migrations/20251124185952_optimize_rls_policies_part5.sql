/*
  # Optimize RLS Policies - Part 5 (Client Requests, Loyalty, Investments)
  
  Final batch of RLS optimizations.
*/

-- client_requests table
DROP POLICY IF EXISTS "Users can view their own requests" ON public.client_requests;
CREATE POLICY "Users can view their own requests"
  ON public.client_requests FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own requests" ON public.client_requests;
CREATE POLICY "Users can create their own requests"
  ON public.client_requests FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can view all requests" ON public.client_requests;
CREATE POLICY "Admins can view all requests"
  ON public.client_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update all requests" ON public.client_requests;
CREATE POLICY "Admins can update all requests"
  ON public.client_requests FOR UPDATE
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

-- loyalty_points table
DROP POLICY IF EXISTS "Users can view their own points" ON public.loyalty_points;
CREATE POLICY "Users can view their own points"
  ON public.loyalty_points FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "System can manage points" ON public.loyalty_points;
CREATE POLICY "System can manage points"
  ON public.loyalty_points FOR ALL
  TO authenticated
  USING (true);

-- loyalty_events table
DROP POLICY IF EXISTS "Users can view their own events" ON public.loyalty_events;
CREATE POLICY "Users can view their own events"
  ON public.loyalty_events FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "System can create events" ON public.loyalty_events;
CREATE POLICY "System can create events"
  ON public.loyalty_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- investment_projects table
DROP POLICY IF EXISTS "Admins can view all projects" ON public.investment_projects;
CREATE POLICY "Admins can view all projects"
  ON public.investment_projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert projects" ON public.investment_projects;
CREATE POLICY "Admins can insert projects"
  ON public.investment_projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update projects" ON public.investment_projects;
CREATE POLICY "Admins can update projects"
  ON public.investment_projects FOR UPDATE
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

-- investment_contributions table
DROP POLICY IF EXISTS "Users can view their own contributions" ON public.investment_contributions;
CREATE POLICY "Users can view their own contributions"
  ON public.investment_contributions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own contributions" ON public.investment_contributions;
CREATE POLICY "Users can create their own contributions"
  ON public.investment_contributions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can view all contributions" ON public.investment_contributions;
CREATE POLICY "Admins can view all contributions"
  ON public.investment_contributions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (select auth.uid()) 
      AND profiles.user_type = 'admin'
    )
  );

-- investment_preferences table
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.investment_preferences;
CREATE POLICY "Users can view their own preferences"
  ON public.investment_preferences FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage their own preferences" ON public.investment_preferences;
CREATE POLICY "Users can manage their own preferences"
  ON public.investment_preferences FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);