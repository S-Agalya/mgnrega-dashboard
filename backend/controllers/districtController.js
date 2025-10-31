import pool from "../config/db.js";

// Get all districts
export const getDistricts = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT district_name, state_name FROM district_config WHERE is_active = true"
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get metrics for a specific district
export const getDistrictMetrics = async (req, res) => {
    try {
        const { district } = req.params;
        const metrics = await pool.query(
            `SELECT m.metric_name, m.metric_value, m.metric_icon 
             FROM district_metrics m
             JOIN district_config d ON d.id = m.district_id
             WHERE d.district_name = $1`,
            [district]
        );
        res.json(metrics.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get aggregated metrics for all districts
export const getAggregatedMetrics = async (req, res) => {
    try {
        const metrics = await pool.query(`
            SELECT 
                m.metric_name,
                SUM(m.metric_value) as metric_value,
                MAX(m.metric_icon) as metric_icon
            FROM district_metrics m
            JOIN district_config d ON d.id = m.district_id
            WHERE d.is_active = true
            GROUP BY m.metric_name
        `);
        res.json(metrics.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all data for a specific district
export const getDistrictData = async (req, res) => {
    try {
        const { district } = req.params;
        
        // Get district basic info
        const districtInfo = await pool.query(
            `SELECT id, district_name, state_name 
             FROM district_config 
             WHERE district_name = $1`,
            [district]
        );
        
        if (districtInfo.rows.length === 0) {
            return res.status(404).json({ error: "District not found" });
        }
        
        const districtId = districtInfo.rows[0].id;
        
        // Get metrics
        const metrics = await pool.query(
            `SELECT metric_name, metric_value, metric_icon 
             FROM district_metrics 
             WHERE district_id = $1`,
            [districtId]
        );
        
        // Get monthly data
        const monthlyData = await pool.query(
            `SELECT month, employed, jobs_created, wages_paid 
             FROM monthly_district_stats 
             WHERE district_id = $1 
             ORDER BY year, 
                CASE month 
                    WHEN 'Jan' THEN 1 
                    WHEN 'Feb' THEN 2 
                    WHEN 'Mar' THEN 3 
                    WHEN 'Apr' THEN 4 
                    WHEN 'May' THEN 5 
                    WHEN 'Jun' THEN 6 
                    WHEN 'Jul' THEN 7 
                    WHEN 'Aug' THEN 8 
                    WHEN 'Sep' THEN 9 
                    WHEN 'Oct' THEN 10 
                    WHEN 'Nov' THEN 11 
                    WHEN 'Dec' THEN 12
                END`,
            [districtId]
        );
        
        // Get outcomes
        const outcomes = await pool.query(
            `SELECT outcome_type, description 
             FROM district_outcomes 
             WHERE district_id = $1`,
            [districtId]
        );
        
        res.json({
            ...districtInfo.rows[0],
            metrics: metrics.rows,
            monthlyData: monthlyData.rows,
            positiveOutcomes: outcomes.rows
                .filter(o => o.outcome_type === 'positive')
                .map(o => o.description),
            issuesFaced: outcomes.rows
                .filter(o => o.outcome_type === 'issue')
                .map(o => o.description)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get district insights
export const getDistrictInsights = async (req, res) => {
    try {
        const { district } = req.params;
        
        const insights = await pool.query(
            `SELECT insight_type, description 
             FROM district_insights i
             JOIN district_config d ON d.id = i.district_id
             WHERE d.district_name = $1`,
            [district]
        );
        
        // Transform into required format
        const formattedInsights = {
            positive: insights.rows.filter(i => i.insight_type === 'positive').map(i => i.description),
            issues: insights.rows.filter(i => i.insight_type === 'issue').map(i => i.description),
            analytical: insights.rows.filter(i => i.insight_type === 'analytical').map(i => i.description)
        };
        
        res.json(formattedInsights);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get aggregated insights across all districts
export const getAggregatedInsights = async (req, res) => {
    try {
        const insights = await pool.query(`
            SELECT DISTINCT ON (i.description) i.insight_type, i.description
            FROM district_insights i
            JOIN district_config d ON d.id = i.district_id
            WHERE d.is_active = true
            ORDER BY i.description, i.insight_type
            LIMIT 15
        `);
        
        // Transform into required format
        const formattedInsights = {
            positive: insights.rows.filter(i => i.insight_type === 'positive').map(i => i.description),
            issues: insights.rows.filter(i => i.insight_type === 'issue').map(i => i.description),
            analytical: insights.rows.filter(i => i.insight_type === 'analytical').map(i => i.description)
        };
        
        res.json(formattedInsights);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Compare districts - FIXED VERSION
export const compareDistricts = async (req, res) => {
    try {
        const { districts } = req.query;
        
        if (!districts) {
            return res.status(400).json({ error: 'Districts parameter is required' });
        }
        
        const districtList = districts.split(',').map(d => d.trim());
        
        console.log('Comparing districts:', districtList);
        
        const comparisons = await pool.query(
            `SELECT 
                d.district_name,
                m.metric_name,
                m.metric_value,
                m.metric_icon
             FROM district_config d
             JOIN district_metrics m ON m.district_id = d.id
             WHERE d.district_name = ANY($1)
             ORDER BY d.district_name, m.metric_name`,
            [districtList]
        );
        
        console.log('Query returned rows:', comparisons.rows.length);
        
        if (comparisons.rows.length === 0) {
            return res.status(404).json({ 
                error: 'No data found for the specified districts',
                requestedDistricts: districtList 
            });
        }
        
        // Transform data for comparison charts
        const transformedData = comparisons.rows.reduce((acc, curr) => {
            if (!acc[curr.metric_name]) {
                acc[curr.metric_name] = {
                    icon: curr.metric_icon
                };
            }
            acc[curr.metric_name][curr.district_name] = parseFloat(curr.metric_value);
            return acc;
        }, {});
        
        // Create chart data array in the format frontend expects
        const chartData = Object.entries(transformedData).map(([metric, data]) => {
            const { icon, ...districtValues } = data;
            return {
                metricName: metric,
                icon: icon,
                ...districtValues
            };
        });
        
        console.log('Sending response with', chartData.length, 'metrics');
        
        // Return in the format frontend expects
        res.json({ 
            metrics: transformedData, 
            chartData: chartData 
        });
    } catch (error) {
        console.error('Error comparing districts:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get district statistics for charts
export const getDistrictStats = async (req, res) => {
    try {
        const { district } = req.params;
        
        // Get employment growth rate
        const employmentGrowth = await pool.query(
            `SELECT month, year, employed
             FROM monthly_district_stats ms
             JOIN district_config d ON d.id = ms.district_id
             WHERE d.district_name = $1
             ORDER BY year, 
                CASE month 
                    WHEN 'Jan' THEN 1 
                    WHEN 'Feb' THEN 2 
                    WHEN 'Mar' THEN 3 
                    WHEN 'Apr' THEN 4 
                    WHEN 'May' THEN 5 
                    WHEN 'Jun' THEN 6 
                    WHEN 'Jul' THEN 7 
                    WHEN 'Aug' THEN 8 
                    WHEN 'Sep' THEN 9 
                    WHEN 'Oct' THEN 10 
                    WHEN 'Nov' THEN 11 
                    WHEN 'Dec' THEN 12
                END`,
            [district]
        );

        // Get jobs vs wages data
        const jobsWages = await pool.query(
            `SELECT month, jobs_created, wages_paid
             FROM monthly_district_stats ms
             JOIN district_config d ON d.id = ms.district_id
             WHERE d.district_name = $1
             ORDER BY year DESC, 
                CASE month 
                    WHEN 'Jan' THEN 1 
                    WHEN 'Feb' THEN 2 
                    WHEN 'Mar' THEN 3 
                    WHEN 'Apr' THEN 4 
                    WHEN 'May' THEN 5 
                    WHEN 'Jun' THEN 6 
                    WHEN 'Jul' THEN 7 
                    WHEN 'Aug' THEN 8 
                    WHEN 'Sep' THEN 9 
                    WHEN 'Oct' THEN 10 
                    WHEN 'Nov' THEN 11 
                    WHEN 'Dec' THEN 12
                END
             LIMIT 12`,
            [district]
        );

        res.json({
            employmentGrowth: employmentGrowth.rows,
            jobsWages: jobsWages.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get rural development index
export const getRuralDevelopmentIndex = async (req, res) => {
    try {
        const { district } = req.params;
        
        const result = await pool.query(
            `SELECT 
                (SUM(CASE WHEN metric_name = 'Jobs Created' THEN metric_value ELSE 0 END) * 0.4 +
                 SUM(CASE WHEN metric_name = 'Wages Paid' THEN metric_value ELSE 0 END) * 0.3 +
                 SUM(CASE WHEN metric_name = 'People Employed' THEN metric_value ELSE 0 END) * 0.3
                ) / 1000 as development_index
             FROM district_metrics m
             JOIN district_config d ON d.id = m.district_id
             WHERE d.district_name = $1
             GROUP BY d.district_name`,
            [district]
        );
        
        res.json({
            ruralDevelopmentIndex: result.rows[0]?.development_index || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
