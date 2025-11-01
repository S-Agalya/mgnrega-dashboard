import pool from "../config/db.js";

// Get all districts
export const getDistricts = async (req, res) => {
    try {
        // First, let's log some sample data to check the format
        const sampleData = await pool.query(
            "SELECT DISTINCT state_name FROM mgnrega_data LIMIT 5"
        );
        console.log('Sample state names:', sampleData.rows);

        let query = `
            SELECT DISTINCT district_code, district_name, state_name 
            FROM mgnrega_data
            WHERE TRIM(state_name) ILIKE 'TAMIL NADU'
            ORDER BY district_name
        `;
        
        const result = await pool.query(query);
        console.log('Found Tamil Nadu districts:', result.rows.length);
        res.json(result.rows);
    } catch (error) {
        console.error('Error in getDistricts:', error);
        res.status(500).json({ error: error.message });
    }
};
// Get metrics for a specific district
export const getDistrictMetrics = async (req, res) => {
    try {
        const { district_code } = req.params;
        const result = await pool.query(
            `SELECT 
                district_name,
                state_name,
                district_code,
                households_worked,
                average_wage_rate,
                updated_at
             FROM mgnrega_data
             WHERE district_code = $1
             ORDER BY fin_year DESC, month DESC
             LIMIT 1`,
            [district_code]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "District not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get aggregated metrics for all districts
export const getAggregatedMetrics = async (req, res) => {
    try {
        const metrics = await pool.query(`
            WITH latest_data AS (
                SELECT DISTINCT ON (district_code) *
                FROM mgnrega_data
                WHERE TRIM(state_name) ILIKE 'TAMIL NADU'
                ORDER BY district_code, fin_year DESC, month DESC
            )
            SELECT 
                COALESCE(SUM(households_worked), 0) as total_households,
                COALESCE(ROUND(AVG(average_wage_rate), 2), 0) as avg_wage_rate,
                COUNT(DISTINCT district_code) as total_districts
            FROM latest_data
        `);
        res.json(metrics.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all data for a specific district
export const getDistrictData = async (req, res) => {
    try {
        const { district_code } = req.params;
        const result = await pool.query(
            `SELECT 
                district_name,
                state_name,
                month,
                fin_year,
                total_exp as total_expenditure,
                households_worked,
                individuals_worked,
                average_wage_rate,
                completed_works,
                ongoing_works,
                updated_at
             FROM mgnrega_data
             WHERE district_code = $1
             ORDER BY fin_year DESC, month DESC
             LIMIT 12`,
            [district_code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No data found for this district" });
        }

        res.json(result.rows);
        
        // Get current metrics
        const currentMetrics = await pool.query(
            `SELECT *
             FROM mgnrega_data 
             WHERE district_code = $1
             ORDER BY fin_year DESC, month DESC
             LIMIT 1`,
            [district_code]
        );
        
        if (currentMetrics.rows.length === 0) {
            return res.status(404).json({ error: "District not found" });
        }
        
        // Get historical monthly data
        const monthlyData = await pool.query(
            `SELECT 
                fin_year,
                month,
                households_worked as employed,
                total_jobcards_issued as jobs_created,
                wages as wages_paid,
                women_persondays,
                sc_persondays,
                st_persondays,
                total_exp as total_expenditure
             FROM mgnrega_data 
             WHERE district_code = $1
             ORDER BY fin_year DESC, 
                CASE month 
                    WHEN \'Jan\' THEN 1 
                    WHEN \'Feb\' THEN 2 
                    WHEN \'Mar\' THEN 3 
                    WHEN \'Apr\' THEN 4 
                    WHEN \'May\' THEN 5 
                    WHEN \'Jun\' THEN 6 
                    WHEN \'Jul\' THEN 7 
                    WHEN \'Aug\' THEN 8 
                    WHEN \'Sep\' THEN 9 
                    WHEN \'Oct\' THEN 10 
                    WHEN \'Nov\' THEN 11 
                    WHEN \'Dec\' THEN 12
                END DESC
             LIMIT 12`,
            [district_code]
        );

        // Get comparative stats with state average
        const comparativeStats = await pool.query(
            `WITH district_stats AS (
                SELECT state_name
                FROM mgnrega_data
                WHERE district_code = $1
                LIMIT 1
            ),
            state_averages AS (
                SELECT 
                    ROUND(AVG(total_exp), 2) as avg_state_expenditure,
                    ROUND(AVG(households_worked), 2) as avg_state_households,
                    ROUND(AVG(average_wage_rate), 2) as avg_state_wage,
                    ROUND(AVG(average_days_employment), 2) as avg_state_employment_days
                FROM mgnrega_data md
                JOIN district_stats ds ON md.state_name = ds.state_name
                WHERE fin_year = (SELECT MAX(fin_year) FROM mgnrega_data)
            )
            SELECT * FROM state_averages`,
            [district_code]
        );

        // Generate insights based on the data
        const insights = {
            positive: [],
            issues: [],
            analytical: []
        };

        const current = currentMetrics.rows[0];
        const stateAvg = comparativeStats.rows[0];

        if (current.households_worked > stateAvg.avg_state_households) {
            insights.positive.push("Above state average in household employment");
        }

        if (current.average_wage_rate > stateAvg.avg_state_wage) {
            insights.positive.push("Higher than state average wages");
        }

        if (current.average_days_employment < 45) { // MGNREGA guarantees 100 days
            insights.issues.push("Below target employment days per household");
        }

        insights.analytical.push(
            `Average employment: ${current.average_days_employment} days per household`,
            `Total expenditure: ${current.total_exp.toLocaleString()}`,
            `Active workers: ${current.active_workers.toLocaleString()}`
        );
        
        res.json({
            currentMetrics: currentMetrics.rows[0],
            monthlyData: monthlyData.rows,
            comparativeStats: comparativeStats.rows[0],
            insights
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Compare districts
export const compareDistricts = async (req, res) => {
    try {
        const { districts } = req.query;
        if (!districts) {
            return res.status(400).json({ error: "No districts provided for comparison" });
        }

        const districtCodes = districts.split(',');
        if (districtCodes.length !== 2) {
            return res.status(400).json({ error: "Exactly two districts must be provided for comparison" });
        }

        const metricsPromises = districtCodes.map(async (code) => {
            const result = await pool.query(
                `SELECT 
                    district_code,
                    district_name,
                    total_exp,
                    households_worked,
                    individuals_worked,
                    average_wage_rate,
                    average_days_employment,
                    women_persondays,
                    sc_workers,
                    st_workers,
                    completed_works,
                    wages
                 FROM mgnrega_data 
                 WHERE district_code = $1
                 ORDER BY fin_year DESC, month DESC
                 LIMIT 1`,
                [code]
            );

            if (result.rows.length === 0) {
                throw new Error(`District with code ${code} not found`);
            }

            return result.rows[0];
        });

        const results = await Promise.all(metricsPromises);
        res.json(results);
    } catch (error) {
        console.error("Error comparing districts:", error);
        res.status(500).json({ error: error.message });
    }
};
