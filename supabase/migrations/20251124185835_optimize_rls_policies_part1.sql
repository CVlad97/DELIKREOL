/*
  # Optimize RLS Policies - Part 1 (Core User Tables)
  
  Replaces auth.uid() with (select auth.uid()) to prevent re-evaluation per row.
  This significantly improves query performance at scale.
*/

-- profiles table
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- vendors table
DROP POLICY IF EXISTS "Vendors can update own profile" ON public.vendors;
CREATE POLICY "Vendors can update own profile"
  ON public.vendors FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- drivers table
DROP POLICY IF EXISTS "Drivers can read own profile" ON public.drivers;
CREATE POLICY "Drivers can read own profile"
  ON public.drivers FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Drivers can update own profile" ON public.drivers;
CREATE POLICY "Drivers can update own profile"
  ON public.drivers FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- relay_point_hosts table
DROP POLICY IF EXISTS "Hosts can read own profile" ON public.relay_point_hosts;
CREATE POLICY "Hosts can read own profile"
  ON public.relay_point_hosts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Hosts can update own profile" ON public.relay_point_hosts;
CREATE POLICY "Hosts can update own profile"
  ON public.relay_point_hosts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- notifications table
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);