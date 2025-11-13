/*
  # Add relay_host user type
  
  ## Changes
  - Add 'relay_host' to the user_type enum to support relay point hosts
  
  ## Notes
  This allows users to register as relay point hosts who manage pickup locations.
*/

-- Add relay_host to user_type enum
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'relay_host';
