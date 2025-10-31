-- Drop existing tables if they exist
DROP TABLE IF EXISTS monthly_district_stats CASCADE;
DROP TABLE IF EXISTS district_outcomes CASCADE;
DROP TABLE IF EXISTS district_insights CASCADE;
DROP TABLE IF EXISTS district_metrics CASCADE;
DROP TABLE IF EXISTS district_config CASCADE;

-- Create district configuration table
CREATE TABLE district_config (
    id SERIAL PRIMARY KEY,
    district_name VARCHAR(100) NOT NULL,
    state_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create district metrics table
CREATE TABLE district_metrics (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES district_config(id),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_icon VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create district insights table
CREATE TABLE district_insights (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES district_config(id),
    insight_type VARCHAR(20) NOT NULL CHECK (insight_type IN ('positive', 'issue', 'analytical')),
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create monthly district statistics table
CREATE TABLE monthly_district_stats (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES district_config(id),
    month VARCHAR(10) NOT NULL,
    year INTEGER NOT NULL,
    employed INTEGER,
    jobs_created INTEGER,
    wages_paid DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create district outcomes table
CREATE TABLE district_outcomes (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES district_config(id),
    outcome_type VARCHAR(20) NOT NULL CHECK (outcome_type IN ('positive', 'issue')),
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for commonly queried fields
CREATE INDEX idx_district_name ON district_config(district_name);
CREATE INDEX idx_district_metrics ON district_metrics(district_id, metric_name);
CREATE INDEX idx_district_insights ON district_insights(district_id, insight_type);
CREATE INDEX idx_monthly_stats ON monthly_district_stats(district_id, year, month);
CREATE INDEX idx_district_outcomes ON district_outcomes(district_id, outcome_type);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Insert districts
INSERT INTO district_config (district_name, state_name, is_active) VALUES
('Chennai', 'Tamil Nadu', true),
('Madurai', 'Tamil Nadu', true),
('Coimbatore', 'Tamil Nadu', true),
('Thanjavur', 'Tamil Nadu', true),
('Salem', 'Tamil Nadu', true);

-- Insert metrics for Chennai
INSERT INTO district_metrics (district_id, metric_name, metric_value, metric_icon)
SELECT 
    d.id,
    m.metric_name,
    m.metric_value,
    m.metric_icon
FROM district_config d
CROSS JOIN (
    VALUES 
        ('People Employed', 1250, '👷'),
        ('Jobs Created', 320, '🛠️'),
        ('Wages Paid', 50000, '💰')
) AS m(metric_name, metric_value, metric_icon)
WHERE d.district_name = 'Chennai';

-- Insert metrics for Madurai
INSERT INTO district_metrics (district_id, metric_name, metric_value, metric_icon)
SELECT 
    d.id,
    m.metric_name,
    m.metric_value,
    m.metric_icon
FROM district_config d
CROSS JOIN (
    VALUES 
        ('People Employed', 980, '👷'),
        ('Jobs Created', 280, '🛠️'),
        ('Wages Paid', 45000, '💰')
) AS m(metric_name, metric_value, metric_icon)
WHERE d.district_name = 'Madurai';

-- Insert metrics for Coimbatore
INSERT INTO district_metrics (district_id, metric_name, metric_value, metric_icon)
SELECT 
    d.id,
    m.metric_name,
    m.metric_value,
    m.metric_icon
FROM district_config d
CROSS JOIN (
    VALUES 
        ('People Employed', 1100, '👷'),
        ('Jobs Created', 300, '🛠️'),
        ('Wages Paid', 48000, '💰')
) AS m(metric_name, metric_value, metric_icon)
WHERE d.district_name = 'Coimbatore';

-- Insert metrics for Thanjavur
INSERT INTO district_metrics (district_id, metric_name, metric_value, metric_icon)
SELECT 
    d.id,
    m.metric_name,
    m.metric_value,
    m.metric_icon
FROM district_config d
CROSS JOIN (
    VALUES 
        ('People Employed', 850, '👷'),
        ('Jobs Created', 220, '🛠️'),
        ('Wages Paid', 42000, '💰')
) AS m(metric_name, metric_value, metric_icon)
WHERE d.district_name = 'Thanjavur';

-- Insert metrics for Salem
INSERT INTO district_metrics (district_id, metric_name, metric_value, metric_icon)
SELECT 
    d.id,
    m.metric_name,
    m.metric_value,
    m.metric_icon
FROM district_config d
CROSS JOIN (
    VALUES 
        ('People Employed', 920, '👷'),
        ('Jobs Created', 260, '🛠️'),
        ('Wages Paid', 44000, '💰')
) AS m(metric_name, metric_value, metric_icon)
WHERE d.district_name = 'Salem';

-- Insert insights for all districts
INSERT INTO district_insights (district_id, insight_type, description)
SELECT 
    d.id,
    'positive',
    unnest(ARRAY[
        'Steady increase in employment opportunities',
        'Effective wage distribution system',
        'High women participation rate'
    ])
FROM district_config d;

INSERT INTO district_insights (district_id, insight_type, description)
SELECT 
    d.id,
    'issue',
    unnest(ARRAY[
        'Need for better infrastructure',
        'Seasonal employment variations',
        'Transport connectivity challenges'
    ])
FROM district_config d;

INSERT INTO district_insights (district_id, insight_type, description)
SELECT 
    d.id,
    'analytical',
    unnest(ARRAY[
        'Consistent growth in job creation',
        'Wage rates align with state average',
        'Good resource utilization'
    ])
FROM district_config d;

-- Insert monthly statistics for all districts
INSERT INTO monthly_district_stats (district_id, month, year, employed, jobs_created, wages_paid)
SELECT 
    d.id,
    m.month,
    2025,
    m.employed,
    m.jobs,
    m.wages
FROM district_config d
CROSS JOIN (
    VALUES 
        ('Jan', 100, 25, 5000),
        ('Feb', 120, 30, 5500),
        ('Mar', 110, 28, 5200),
        ('Apr', 130, 35, 5800)
) AS m(month, employed, jobs, wages);

-- Insert outcomes for all districts
INSERT INTO district_outcomes (district_id, outcome_type, description)
SELECT 
    d.id,
    'positive',
    unnest(ARRAY[
        'Strong community participation',
        'Efficient project completion',
        'Good worker satisfaction levels'
    ])
FROM district_config d;

INSERT INTO district_outcomes (district_id, outcome_type, description)
SELECT 
    d.id,
    'issue',
    unnest(ARRAY[
        'Weather-related work delays',
        'Resource allocation challenges',
        'Skill development needs'
    ])
FROM district_config d;

-- Create materialized view for dashboard analytics
CREATE MATERIALIZED VIEW mgnrega_analytics AS
SELECT 
    d.district_name,
    d.state_name,
    m.metric_name,
    m.metric_value,
    ms.month,
    ms.year,
    ms.employed,
    ms.jobs_created,
    ms.wages_paid
FROM district_config d
LEFT JOIN district_metrics m ON d.id = m.district_id
LEFT JOIN monthly_district_stats ms ON d.id = ms.district_id
WHERE d.is_active = true
WITH DATA;

-- Create index on materialized view
CREATE INDEX idx_mgnrega_analytics_district 
ON mgnrega_analytics(district_name);

-- Grant necessary permissions (adjust as needed)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO postgreskiru_user;