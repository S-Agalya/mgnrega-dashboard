-- ============================================
-- MGNREGA Database Cleanup Script
-- ============================================
-- WARNING: This will DELETE ALL DATA!
-- Run this to clean the database before testing
-- ============================================

-- Drop all tables in reverse order (to respect foreign key constraints)
DROP TABLE IF EXISTS district_outcomes CASCADE;
DROP TABLE IF EXISTS monthly_district_stats CASCADE;
DROP TABLE IF EXISTS district_insights CASCADE;
DROP TABLE IF EXISTS district_metrics CASCADE;
DROP TABLE IF EXISTS district_config CASCADE;

-- Drop indexes (they will be recreated with the tables)
-- But just to be safe, explicitly drop them if they exist
DROP INDEX IF EXISTS idx_district_name;
DROP INDEX IF EXISTS idx_district_metrics;
DROP INDEX IF EXISTS idx_district_insights;
DROP INDEX IF EXISTS idx_monthly_stats;
DROP INDEX IF EXISTS idx_district_outcomes;

-- Optional: Drop sequences if they exist
DROP SEQUENCE IF EXISTS district_config_id_seq CASCADE;
DROP SEQUENCE IF EXISTS district_metrics_id_seq CASCADE;
DROP SEQUENCE IF EXISTS district_insights_id_seq CASCADE;
DROP SEQUENCE IF EXISTS monthly_district_stats_id_seq CASCADE;
DROP SEQUENCE IF EXISTS district_outcomes_id_seq CASCADE;

-- Verify all tables are gone
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- If the above query returns no rows, cleanup was successful!

-- Display success message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Database cleanup completed successfully!';
    RAISE NOTICE '📝 You can now run your setup script to create fresh tables.';
END $$;
