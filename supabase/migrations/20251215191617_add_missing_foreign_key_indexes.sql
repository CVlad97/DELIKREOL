/*
  # Add Missing Foreign Key Indexes

  1. Performance Optimization
    - Add index on `compliance_checks.verified_by`
    - Add index on `payout_calculations.related_delivery_id`
    - Add index on `payout_calculations.related_order_id`

  2. Purpose
    - Improves JOIN performance with foreign key relationships
    - Reduces query execution time for related data lookups
*/

-- Add index for compliance_checks.verified_by foreign key
CREATE INDEX IF NOT EXISTS idx_compliance_checks_verified_by 
ON compliance_checks(verified_by);

-- Add index for payout_calculations.related_delivery_id foreign key
CREATE INDEX IF NOT EXISTS idx_payout_calculations_related_delivery_id 
ON payout_calculations(related_delivery_id);

-- Add index for payout_calculations.related_order_id foreign key
CREATE INDEX IF NOT EXISTS idx_payout_calculations_related_order_id 
ON payout_calculations(related_order_id);
