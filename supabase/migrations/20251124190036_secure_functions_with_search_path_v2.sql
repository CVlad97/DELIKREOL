/*
  # Secure Functions with search_path - v2
  
  Adds SECURITY DEFINER and SET search_path to prevent search_path injection attacks.
  Handles trigger dependencies properly.
*/

-- Update existing functions with secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  new_number text;
BEGIN
  new_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || 
                LPAD(FLOOR(random() * 10000)::text, 4, '0');
  RETURN new_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
)
RETURNS double precision
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN ST_Distance(
    ST_MakePoint(lon1, lat1)::geography,
    ST_MakePoint(lon2, lat2)::geography
  ) / 1000.0;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_api_key_usage()
RETURNS trigger
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE api_keys 
  SET last_used_at = now()
  WHERE id = NEW.api_key_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.clean_expired_whatsapp_sessions()
RETURNS void
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM whatsapp_sessions
  WHERE expires_at < now();
END;
$$;

-- Drop and recreate generate_qr_code with correct parameter name
DROP FUNCTION IF EXISTS public.generate_qr_code(text);
CREATE FUNCTION public.generate_qr_code(prefix text)
RETURNS text
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'QR-' || encode(digest(prefix, 'sha256'), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.find_optimal_relay_point(
  customer_lat double precision,
  customer_lon double precision,
  max_distance_km double precision DEFAULT 10
)
RETURNS TABLE (
  relay_point_id uuid,
  distance_km double precision
)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rp.id,
    ST_Distance(
      ST_MakePoint(customer_lon, customer_lat)::geography,
      ST_MakePoint(rp.longitude, rp.latitude)::geography
    ) / 1000.0 AS distance
  FROM relay_points rp
  WHERE rp.is_active = true
    AND ST_DWithin(
      ST_MakePoint(customer_lon, customer_lat)::geography,
      ST_MakePoint(rp.longitude, rp.latitude)::geography,
      max_distance_km * 1000
    )
  ORDER BY distance
  LIMIT 5;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_investment_updated_at()
RETURNS trigger
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Handle update_project_collected_points with trigger dependency
DROP TRIGGER IF EXISTS trigger_update_collected_points ON public.investment_contributions;

DROP FUNCTION IF EXISTS public.update_project_collected_points();

CREATE FUNCTION public.update_project_collected_points()
RETURNS trigger
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE investment_projects
  SET collected_points = (
    SELECT COALESCE(SUM(points_invested), 0)
    FROM investment_contributions
    WHERE project_id = NEW.project_id
  )
  WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trigger_update_collected_points
  AFTER INSERT OR UPDATE OR DELETE ON public.investment_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_collected_points();