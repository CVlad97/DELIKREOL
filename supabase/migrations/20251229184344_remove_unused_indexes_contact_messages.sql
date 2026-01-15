/*
  # Remove Unused Indexes on Contact Messages

  1. Index Cleanup
    - Remove unused indexes on newly created contact_messages table
    - idx_contact_messages_status_created (not yet used)
    - idx_contact_messages_email (not yet used)

  2. Rationale
    - Table is brand new, indexes not used yet
    - Can be re-added later if needed based on actual query patterns
    - Reduces maintenance overhead

  3. Note
    - Keeping all other indexes as they will be needed in production
    - Foreign key indexes are essential for JOIN performance
*/

-- Remove unused indexes on contact_messages
DROP INDEX IF EXISTS idx_contact_messages_status_created;
DROP INDEX IF EXISTS idx_contact_messages_email;

-- Note: We keep all other indexes as they are essential for production workloads
-- even if not currently used during development
