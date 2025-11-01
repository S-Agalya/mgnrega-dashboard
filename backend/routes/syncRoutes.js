import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Get sync status and statistics
router.get('/status', async (req, res) => {
    try {
        // Get last sync status
        const syncStatus = await pool.query(
            `SELECT last_sync_time, sync_status, records_processed, error_message 
             FROM sync_status 
             ORDER BY last_sync_time DESC 
             LIMIT 1`
        );

        // Get total records in database
        const totalRecords = await pool.query(
            `SELECT COUNT(*) as total_records FROM mgnrega_data`
        );

        // Get latest data timestamp
        const latestUpdate = await pool.query(
            `SELECT MAX(updated_at) as latest_update FROM mgnrega_data`
        );

        // Get state and district counts
        const counts = await pool.query(
            `SELECT 
                COUNT(DISTINCT state_name) as total_states,
                COUNT(DISTINCT district_code) as total_districts
             FROM mgnrega_data`
        );

        res.json({
            lastSync: syncStatus.rows[0] || null,
            totalRecords: totalRecords.rows[0].total_records,
            latestUpdate: latestUpdate.rows[0].latest_update,
            coverage: {
                states: counts.rows[0].total_states,
                districts: counts.rows[0].total_districts
            }
        });
    } catch (error) {
        console.error('Error fetching sync status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get sample data validation
router.get('/validate', async (req, res) => {
    try {
        // Get sample records with potential issues
        const validation = await pool.query(
            `SELECT 
                COUNT(*) as total_records,
                COUNT(*) FILTER (WHERE approved_labour_budget IS NULL) as missing_budget,
                COUNT(*) FILTER (WHERE average_wage_rate IS NULL) as missing_wage_rate,
                COUNT(*) FILTER (WHERE average_days_employment IS NULL) as missing_employment_days,
                COUNT(*) FILTER (WHERE total_exp IS NULL) as missing_expenditure
             FROM mgnrega_data`
        );

        // Get date range of data
        const dateRange = await pool.query(
            `SELECT 
                MIN(fin_year) as earliest_year,
                MAX(fin_year) as latest_year,
                COUNT(DISTINCT fin_year) as total_years,
                COUNT(DISTINCT month) as total_months
             FROM mgnrega_data`
        );

        res.json({
            dataValidation: validation.rows[0],
            coverage: dateRange.rows[0]
        });
    } catch (error) {
        console.error('Error validating data:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;