-- Drop existing tables if they exist
DROP TABLE IF EXISTS monthly_district_stats CASCADE;
DROP TABLE IF EXISTS district_outcomes CASCADE;
DROP TABLE IF EXISTS district_insights CASCADE;
DROP TABLE IF EXISTS district_metrics CASCADE;
DROP TABLE IF EXISTS district_config CASCADE;

-- Create district configuration table
CREATE TABLE district_config (
    id SERIAL PRIMARY KEY,
    district_name VARCHAR(100) NOT NULL UNIQUE,
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

-- Insert Tamil Nadu districts
INSERT INTO district_config (district_name, state_name, is_active) VALUES
('Chennai', 'Tamil Nadu', true),
('Madurai', 'Tamil Nadu', true),
('Coimbatore', 'Tamil Nadu', true),
('Thanjavur', 'Tamil Nadu', true),
('Salem', 'Tamil Nadu', true);

-- Insert base metrics for all districts
INSERT INTO district_metrics (district_id, metric_name, metric_value, metric_icon)
SELECT 
    d.id,
    m.metric_name,
    CASE 
        WHEN d.district_name = 'Chennai' THEN m.chennai_value
        WHEN d.district_name = 'Madurai' THEN m.madurai_value
        WHEN d.district_name = 'Coimbatore' THEN m.coimbatore_value
        WHEN d.district_name = 'Thanjavur' THEN m.thanjavur_value
        ELSE m.salem_value
    END as metric_value,
    m.metric_icon
FROM district_config d
CROSS JOIN (
    VALUES 
        ('People Employed', 15000, 12000, 13500, 11000, 10500, '👥'),
        ('Jobs Created', 320, 280, 300, 260, 240, '🛠️'),
        ('Wages Paid', 50000, 45000, 47500, 42500, 40000, '💰'),
        ('Average Wage Rate', 350.50, 325.75, 335.25, 315.00, 310.25, '💵'),
        ('Employment Days', 45, 40, 42, 38, 37, '📅'),
        ('Total Workers', 5000, 4000, 4500, 3500, 3250, '👷'),
        ('Completed Works', 150, 120, 135, 110, 105, '✅'),
        ('Ongoing Works', 50, 40, 45, 35, 32, '🏗️')
) AS m(metric_name, chennai_value, madurai_value, coimbatore_value, thanjavur_value, salem_value, metric_icon);

-- Insert district insights
INSERT INTO district_insights (district_id, insight_type, description)
SELECT 
    d.id,
    i.insight_type,
    i.description
FROM district_config d
CROSS JOIN (
    VALUES 
        ('positive', 'Employment rate increased by 15% in past quarter'),
        ('positive', 'Digital wage transfers improved payment efficiency'),
        ('positive', 'Women participation in workforce increased'),
        ('issue', 'Delayed wage payments in remote areas'),
        ('issue', 'Material shortage affecting work progress'),
        ('issue', 'Need more skill development programs'),
        ('analytical', 'High demand for agricultural related jobs'),
        ('analytical', 'Wage rates align with state average'),
        ('analytical', 'Rural employment showing upward trend')
) AS i(insight_type, description);

-- Insert monthly statistics for each district
INSERT INTO monthly_district_stats (district_id, month, year, employed, jobs_created, wages_paid)
SELECT 
    d.id,
    TO_CHAR(date_series, 'MM'),
    2025,
    -- Generating different ranges for each metric based on district size
    CASE 
        WHEN d.district_name = 'Chennai' THEN floor(random() * (2000-1000) + 1000)
        WHEN d.district_name = 'Madurai' THEN floor(random() * (1500-800) + 800)
        WHEN d.district_name = 'Coimbatore' THEN floor(random() * (1800-900) + 900)
        WHEN d.district_name = 'Thanjavur' THEN floor(random() * (1200-600) + 600)
        ELSE floor(random() * (1000-500) + 500)
    END as employed,
    CASE 
        WHEN d.district_name = 'Chennai' THEN floor(random() * (400-200) + 200)
        WHEN d.district_name = 'Madurai' THEN floor(random() * (300-150) + 150)
        WHEN d.district_name = 'Coimbatore' THEN floor(random() * (350-175) + 175)
        WHEN d.district_name = 'Thanjavur' THEN floor(random() * (250-125) + 125)
        ELSE floor(random() * (200-100) + 100)
    END as jobs_created,
    CASE 
        WHEN d.district_name = 'Chennai' THEN floor(random() * (2000000-1000000) + 1000000)
        WHEN d.district_name = 'Madurai' THEN floor(random() * (1500000-750000) + 750000)
        WHEN d.district_name = 'Coimbatore' THEN floor(random() * (1800000-900000) + 900000)
        WHEN d.district_name = 'Thanjavur' THEN floor(random() * (1200000-600000) + 600000)
        ELSE floor(random() * (1000000-500000) + 500000)
    END as wages_paid
FROM district_config d
CROSS JOIN generate_series(
    '2025-01-01'::date,
    '2025-12-31'::date,
    '1 month'::interval
) AS date_series;

-- Insert outcomes specific to each district
INSERT INTO district_outcomes (district_id, outcome_type, description)
SELECT 
    d.id,
    o.outcome_type,
    CASE 
        WHEN d.district_name = 'Chennai' THEN o.chennai_desc
        WHEN d.district_name = 'Madurai' THEN o.madurai_desc
        WHEN d.district_name = 'Coimbatore' THEN o.coimbatore_desc
        WHEN d.district_name = 'Thanjavur' THEN o.thanjavur_desc
        ELSE o.salem_desc
    END as description
FROM district_config d
CROSS JOIN (
    VALUES 
        ('positive', 'Urban employment initiatives successful', 'Temple renovation projects completed', 'Industrial zone development', 'Agricultural modernization success', 'Textile sector growth'),
        ('positive', 'Digital payment adoption at 95%', 'Heritage tourism boost', 'SME sector growth', 'Farm-to-market initiatives', 'Infrastructure development'),
        ('issue', 'Urban-rural wage gap', 'Heritage site work delays', 'Industrial training needs', 'Irrigation project delays', 'Skill gap in textile sector'),
        ('issue', 'Housing project delays', 'Tourism infrastructure needs', 'Industrial waste management', 'Agricultural storage needs', 'Transport infrastructure')
) AS o(outcome_type, chennai_desc, madurai_desc, coimbatore_desc, thanjavur_desc, salem_desc);