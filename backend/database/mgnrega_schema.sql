-- Drop existing tables if they exist
DROP TABLE IF EXISTS mgnrega_data;
DROP TABLE IF EXISTS sync_status;

-- Create table for MGNREGA data
CREATE TABLE mgnrega_data (
    id SERIAL PRIMARY KEY,
    fin_year VARCHAR(10),
    month VARCHAR(10),
    state_code VARCHAR(5),
    state_name VARCHAR(100),
    district_code VARCHAR(5),
    district_name VARCHAR(100),
    approved_labour_budget BIGINT,
    average_wage_rate DECIMAL(12,2),
    average_days_employment DECIMAL(12,2),
    differently_abled_persons BIGINT,
    material_skilled_wages DECIMAL(12,2),
    completed_works BIGINT,
    gps_with_nil_exp BIGINT,
    ongoing_works BIGINT,
    persondays_central_liability BIGINT,
    sc_persondays BIGINT,
    sc_workers BIGINT,
    st_persondays BIGINT,
    st_workers BIGINT,
    total_adm_expenditure DECIMAL(12,2),
    total_exp DECIMAL(12,2),
    households_worked BIGINT,
    individuals_worked BIGINT,
    active_job_cards BIGINT,
    active_workers BIGINT,
    households_100_days BIGINT,
    total_jobcards_issued BIGINT,
    total_workers BIGINT,
    total_works_taken BIGINT,
    wages DECIMAL(12,2),
    women_persondays BIGINT,
    category_b_works_percent DECIMAL(8,2),
    agriculture_allied_exp_percent DECIMAL(8,2),
    nrm_expenditure_percent DECIMAL(8,2),
    payments_15days_percent DECIMAL(8,2),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fin_year, month, district_code)
);

-- Create table for tracking data sync status
CREATE TABLE sync_status (
    id SERIAL PRIMARY KEY,
    last_sync_time TIMESTAMP,
    sync_status VARCHAR(50),
    records_processed INTEGER,
    error_message TEXT
);

-- Create indexes for faster queries
CREATE INDEX idx_district_state ON mgnrega_data(district_code, state_code);
CREATE INDEX idx_fin_year_month ON mgnrega_data(fin_year, month);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamp
CREATE TRIGGER update_mgnrega_data_updated_at
    BEFORE UPDATE ON mgnrega_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();