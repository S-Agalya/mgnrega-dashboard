import axios from 'axios';
import pkg from "pg";
import { fileURLToPath } from 'url';
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
const API_URL = 'https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722';

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
  ssl: false
});

async function fetchDataFromAPI(offset = 0) {
  try {
    const response = await axios.get(API_URL, {
      params: {
        'api-key': API_KEY,
        format: 'json',
        offset: offset,
        limit: 100 // Fetch 100 records at a time
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching data from API:', error.message);
    throw error;
  }
}

async function updateSyncStatus(status, recordsProcessed, errorMessage = null) {
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO sync_status (last_sync_time, sync_status, records_processed, error_message) VALUES (NOW(), $1, $2, $3)',
      [status, recordsProcessed, errorMessage]
    );
  } catch (error) {
    console.error('Error updating sync status:', error);
  } finally {
    client.release();
  }
}

function validateAndTransformNumber(value, fieldName) {
  if (value === null || value === undefined) return null;
  const num = parseFloat(value);
  if (isNaN(num)) {
    console.warn(`Invalid number for ${fieldName}: ${value}`);
    return null;
  }
  return num;
}

async function insertOrUpdateData(records) {
  const client = await pool.connect();
  try {
    for (const record of records) {
      // Validate and transform percentage fields
      const transformedRecord = {
        ...record,
        percent_of_Category_B_Works: validateAndTransformNumber(record.percent_of_Category_B_Works, 'category_b_works_percent'),
        percent_of_Expenditure_on_Agriculture_Allied_Works: validateAndTransformNumber(record.percent_of_Expenditure_on_Agriculture_Allied_Works, 'agriculture_allied_exp_percent'),
        percent_of_NRM_Expenditure: validateAndTransformNumber(record.percent_of_NRM_Expenditure, 'nrm_expenditure_percent'),
        percentage_payments_gererated_within_15_days: validateAndTransformNumber(record.percentage_payments_gererated_within_15_days, 'payments_15days_percent')
      };
      await client.query(`
        INSERT INTO mgnrega_data (
          fin_year, month, state_code, state_name, district_code, district_name,
          approved_labour_budget, average_wage_rate, average_days_employment,
          differently_abled_persons, material_skilled_wages, completed_works,
          gps_with_nil_exp, ongoing_works, persondays_central_liability,
          sc_persondays, sc_workers, st_persondays, st_workers,
          total_adm_expenditure, total_exp, households_worked,
          individuals_worked, active_job_cards, active_workers,
          households_100_days, total_jobcards_issued, total_workers,
          total_works_taken, wages, women_persondays,
          category_b_works_percent, agriculture_allied_exp_percent,
          nrm_expenditure_percent, payments_15days_percent, remarks
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
                $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, 
                $29, $30, $31, $32, $33, $34, $35, $36)
        ON CONFLICT (fin_year, month, district_code)
        DO UPDATE SET
          approved_labour_budget = EXCLUDED.approved_labour_budget,
          average_wage_rate = EXCLUDED.average_wage_rate,
          average_days_employment = EXCLUDED.average_days_employment,
          differently_abled_persons = EXCLUDED.differently_abled_persons,
          material_skilled_wages = EXCLUDED.material_skilled_wages,
          completed_works = EXCLUDED.completed_works,
          gps_with_nil_exp = EXCLUDED.gps_with_nil_exp,
          ongoing_works = EXCLUDED.ongoing_works,
          persondays_central_liability = EXCLUDED.persondays_central_liability,
          sc_persondays = EXCLUDED.sc_persondays,
          sc_workers = EXCLUDED.sc_workers,
          st_persondays = EXCLUDED.st_persondays,
          st_workers = EXCLUDED.st_workers,
          total_adm_expenditure = EXCLUDED.total_adm_expenditure,
          total_exp = EXCLUDED.total_exp,
          households_worked = EXCLUDED.households_worked,
          individuals_worked = EXCLUDED.individuals_worked,
          active_job_cards = EXCLUDED.active_job_cards,
          active_workers = EXCLUDED.active_workers,
          households_100_days = EXCLUDED.households_100_days,
          total_jobcards_issued = EXCLUDED.total_jobcards_issued,
          total_workers = EXCLUDED.total_workers,
          total_works_taken = EXCLUDED.total_works_taken,
          wages = EXCLUDED.wages,
          women_persondays = EXCLUDED.women_persondays,
          category_b_works_percent = EXCLUDED.category_b_works_percent,
          agriculture_allied_exp_percent = EXCLUDED.agriculture_allied_exp_percent,
          nrm_expenditure_percent = EXCLUDED.nrm_expenditure_percent,
          payments_15days_percent = EXCLUDED.payments_15days_percent,
          remarks = EXCLUDED.remarks,
          updated_at = NOW()`,
        [
          record.fin_year,
          record.month,
          record.state_code,
          record.state_name,
          record.district_code,
          record.district_name,
          record.Approved_Labour_Budget,
          record.Average_Wage_rate_per_day_per_person,
          record.Average_days_of_employment_provided_per_Household,
          record.Differently_abled_persons_worked,
          record.Material_and_skilled_Wages,
          record.Number_of_Completed_Works,
          record.Number_of_GPs_with_NIL_exp,
          record.Number_of_Ongoing_Works,
          record.Persondays_of_Central_Liability_so_far,
          record.SC_persondays,
          record.SC_workers_against_active_workers,
          record.ST_persondays,
          record.ST_workers_against_active_workers,
          record.Total_Adm_Expenditure,
          record.Total_Exp,
          record.Total_Households_Worked,
          record.Total_Individuals_Worked,
          record.Total_No_of_Active_Job_Cards,
          record.Total_No_of_Active_Workers,
          record.Total_No_of_HHs_completed_100_Days_of_Wage_Employment,
          record.Total_No_of_JobCards_issued,
          record.Total_No_of_Workers,
          record.Total_No_of_Works_Takenup,
          record.Wages,
          record.Women_Persondays,
          transformedRecord.percent_of_Category_B_Works,
          transformedRecord.percent_of_Expenditure_on_Agriculture_Allied_Works,
          transformedRecord.percent_of_NRM_Expenditure,
          transformedRecord.percentage_payments_gererated_within_15_days,
          record.Remarks
        ]
      );
    }
  } catch (error) {
    console.error('Error inserting/updating data:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('Initializing database schema...');
    const schemaSQL = `
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
    CREATE INDEX IF NOT EXISTS idx_district_state ON mgnrega_data(district_code, state_code);
    CREATE INDEX IF NOT EXISTS idx_fin_year_month ON mgnrega_data(fin_year, month);
    `;
    
    await client.query(schemaSQL);
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function syncData() {
  let offset = 0;
  let totalRecords = 0;
  let recordsProcessed = 0;
  
  try {
    // Initialize database schema first
    await initializeDatabase();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return;
  }

  try {
    // Get initial data to get total count
    const initialData = await fetchDataFromAPI(0);
    totalRecords = initialData.total;

    while (recordsProcessed < totalRecords) {
      const data = await fetchDataFromAPI(offset);
      await insertOrUpdateData(data.records);
      
      recordsProcessed += data.records.length;
      offset += data.records.length;
      
      // Update sync status
      await updateSyncStatus('in_progress', recordsProcessed);
      
      // Add a small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await updateSyncStatus('completed', recordsProcessed);
    console.log(`✅ Successfully synced ${recordsProcessed} records`);
  } catch (error) {
    await updateSyncStatus('failed', recordsProcessed, error.message);
    console.error('❌ Sync failed:', error.message);
  }
}

// Export the syncData function
export { syncData };

// If this file is run directly, execute the sync
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncData().then(() => process.exit(0));
}