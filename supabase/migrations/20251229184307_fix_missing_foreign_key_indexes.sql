/*
  # Fix Missing Foreign Key Indexes

  1. Performance Improvements
    - Add missing indexes on foreign key columns for optimal query performance
    - compliance_checks.verified_by
    - payout_calculations.related_delivery_id
    - payout_calculations.related_order_id

  2. Impact
    - Improves JOIN performance
    - Prevents sequential scans on large tables
    - Critical for production scalability
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

-- Add helpful comment
COMMENT ON INDEX idx_compliance_checks_verified_by IS 'Foreign key index for performance on verified_by lookups';
COMMENT ON INDEX idx_payout_calculations_related_delivery_id IS 'Foreign key index for performance on delivery-related payout queries';
COMMENT ON INDEX idx_payout_calculations_related_order_id IS 'Foreign key index for performance on order-related payout queries';
