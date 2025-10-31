const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all states
router.get('/states', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT state_name FROM district_config ORDER BY state_name';
    const { rows } = await db.query(query);
    res.json(rows.map(row => row.state_name));
  } catch (err) {
    console.error("Error fetching states:", err);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

// Compare districts
router.get('/compare', async (req, res) => {
  try {
    const { districts } = req.query;
    if (!districts) {
      return res.status(400).json({ error: 'Districts parameter is required' });
    }
    
    const districtList = districts.split(',');
    
    const query = `
      SELECT 
        dc.district_name,
        dm.metric_name,
        dm.metric_value
      FROM district_config dc
      JOIN district_metrics dm ON dc.id = dm.district_id
      WHERE dc.district_name = ANY($1::text[])
      ORDER BY dc.district_name, dm.metric_name
    `;

    const { rows } = await db.query(query, [districtList]);

    if (!rows.length) {
      return res.status(404).json({ error: 'No data found for the specified districts' });
    }

    // Transform data for frontend
    const transformedData = rows.reduce((acc, row) => {
      if (!acc[row.metric_name]) {
        acc[row.metric_name] = {};
      }
      acc[row.metric_name][row.district_name] = row.metric_value;
      return acc;
    }, {});

    // Create chart data array
    const chartData = Object.entries(transformedData).map(([metric, values]) => ({
      metricName: metric,
      ...values
    }));

    res.json({ metrics: transformedData, chartData });
  } catch (err) {
    console.error("Error comparing districts:", err);
    res.status(500).json({ error: 'Failed to compare districts' });
  }
});

// Get districts by state
router.get('/districts', async (req, res) => {
  try {
    const { state } = req.query;
    let query = 'SELECT district_name FROM district_config';
    let params = [];

    if (state) {
      query += ' WHERE state_name = $1';
      params.push(state);
    }

    query += ' ORDER BY district_name';
    console.log('Executing query:', query, params); // Debug log
    
    const { rows } = await db.query(query, params);
    console.log('Found districts:', rows); // Debug log
    
    if (rows.length === 0) {
      console.log('No districts found in database'); // Debug log
      return res.json([]);
    }
    
    const districts = rows.map(row => row.district_name);
    console.log('Returning districts:', districts); // Debug log
    res.json(districts);
  } catch (err) {
    console.error('Error fetching districts:', err);
    res.status(500).json({ error: 'Failed to fetch districts: ' + err.message });
  }
});

// Get district metrics
router.get('/districts/:district/metrics', async (req, res) => {
  try {
    const { district } = req.params;
    const query = `
      SELECT m.metric_name, m.metric_value, m.metric_icon
      FROM district_metrics m
      JOIN district_config d ON m.district_id = d.id
      WHERE d.district_name = $1
    `;
    const { rows } = await db.query(query, [district]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching district metrics:', err);
    res.status(500).json({ error: 'Failed to fetch district metrics' });
  }
});

// Get monthly statistics
router.get('/districts/:district/monthly-stats', async (req, res) => {
  try {
    const { district } = req.params;
    const query = `
      SELECT ms.month, ms.year, ms.employed, ms.jobs_created, ms.wages_paid
      FROM monthly_district_stats ms
      JOIN district_config d ON ms.district_id = d.id
      WHERE d.district_name = $1
      ORDER BY ms.year, ms.month
    `;
    const { rows } = await db.query(query, [district]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching monthly stats:', err);
    res.status(500).json({ error: 'Failed to fetch monthly statistics' });
  }
});

// Get district insights
router.get('/districts/:district/insights', async (req, res) => {
  try {
    const { district } = req.params;
    const query = `
      SELECT i.insight_type, i.description
      FROM district_insights i
      JOIN district_config d ON i.district_id = d.id
      WHERE d.district_name = $1
    `;
    const { rows } = await db.query(query, [district]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching district insights:', err);
    res.status(500).json({ error: 'Failed to fetch district insights' });
  }
});

// Compare districts
router.get('/compare', async (req, res) => {
  try {
    const { districts } = req.query;
    if (!districts) {
      return res.status(400).json({ error: 'Districts parameter is required' });
    }
    
    const districtList = districts.split(',');
    
    const query = `
      SELECT 
        dc.district_name,
        dm.metric_name,
        dm.metric_value,
        dm.metric_icon
      FROM district_config dc
      JOIN district_metrics dm ON dc.id = dm.district_id
      WHERE dc.district_name = ANY($1::text[])
      ORDER BY dc.district_name, dm.metric_name
    `;

    const { rows } = await db.query(query, [districtList]);

    if (!rows.length) {
      return res.status(404).json({ error: 'No data found for the specified districts' });
    }

    // Transform data for frontend
    const transformedData = rows.reduce((acc, row) => {
      if (!acc[row.metric_name]) {
        acc[row.metric_name] = {
          icon: row.metric_icon,
          values: {}
        };
      }
      acc[row.metric_name].values[row.district_name] = row.metric_value;
      return acc;
    }, {});

    // Create chart data array
    const chartData = Object.entries(transformedData).map(([metric, data]) => ({
      metricName: metric,
      icon: data.icon,
      ...data.values
    }));

    res.json({ metrics: transformedData, chartData });
  } catch (err) {
    console.error('Error comparing districts:', err);
    res.status(500).json({ error: 'Failed to compare districts' });
  }
});

// Get metrics for a specific district
router.get('/metrics/:district', async (req, res) => {
  try {
    const { district } = req.params;
    const query = `
      SELECT 
        district_name,
        persondays_of_central_liability_so_far,
        average_wage_rate_per_day_per_person,
        average_days_of_employment_provided_per_household,
        total_households_worked,
        completed_works,
        ongoing_works,
        wages_paid,
        employment_generated,
        work_completion_rate
      FROM district_metrics 
      WHERE district_name = $1
    `;

    const { rows } = await db.query(query, [district]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'District not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching district metrics:', err);
    res.status(500).json({ error: 'Failed to fetch district metrics' });
  }
});

module.exports = router;