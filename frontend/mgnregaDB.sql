CREATE TABLE mgnrega_data (
    id SERIAL PRIMARY KEY,
    state_name VARCHAR(100),
    district_name VARCHAR(100),
    month_year VARCHAR(50),
    jobcards_issued INT,
    households_worked INT,
    total_persondays INT,
    total_wages_paid NUMERIC,
    report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
