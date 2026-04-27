/*
  # Fix Function Search Path

  1. Security Improvements
    - Fix calculate_distance_km function search_path to be immutable

  2. Changes Made
    - Recreate calculate_distance_km with stable search_path

  3. Note on Other Issues
    - Auth DB Connection Strategy: Requires dashboard configuration (not SQL)
    - PostGIS Extension in Public: Standard practice, moving could break functionality
    - Leaked Password Protection: Requires Supabase Auth settings (not SQL)
    - RLS on spatial_ref_sys: Cannot be enabled (system table owned by PostGIS)
*/

-- Fix calculate_distance_km function with stable search_path
DROP FUNCTION IF EXISTS calculate_distance_km(numeric, numeric, numeric, numeric);
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  R numeric := 6371;
  dLat numeric;
  dLon numeric;
  a numeric;
  c numeric;
BEGIN
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  
  a := sin(dLat/2) * sin(dLat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dLon/2) * sin(dLon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN R * c;
END;
$$;
