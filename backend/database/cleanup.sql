-- Drop materialized view if exists
DROP MATERIALIZED VIEW IF EXISTS mgnrega_analytics;

-- Drop all tables with CASCADE to remove dependencies
DROP TABLE IF EXISTS monthly_district_stats CASCADE;
DROP TABLE IF EXISTS district_outcomes CASCADE;
DROP TABLE IF EXISTS district_insights CASCADE;
DROP TABLE IF EXISTS district_metrics CASCADE;
DROP TABLE IF EXISTS district_config CASCADE;

-- Drop the timestamp update function
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Drop any remaining indexes (though CASCADE above should handle these)
DROP INDEX IF EXISTS idx_district_name;
DROP INDEX IF EXISTS idx_district_metrics;
DROP INDEX IF EXISTS idx_district_insights;
DROP INDEX IF EXISTS idx_monthly_stats;
DROP INDEX IF EXISTS idx_district_outcomes;
DROP INDEX IF EXISTS idx_mgnrega_analytics_district;