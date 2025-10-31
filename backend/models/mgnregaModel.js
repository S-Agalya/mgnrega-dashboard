import pool from "../config/db.js";

export const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS mgnrega_data (
      id SERIAL PRIMARY KEY,
      fin_year TEXT,
      month TEXT,
      state_code TEXT,
      state_name TEXT,
      district_code TEXT,
      district_name TEXT,
      Approved_Labour_Budget NUMERIC,
      Average_Wage_rate_per_day_per_person NUMERIC,
      Average_days_of_employment_provided_per_Household NUMERIC,
      Differently_abled_persons_worked NUMERIC,
      Material_and_skilled_Wages NUMERIC,
      Number_of_Completed_Works NUMERIC,
      Number_of_GPs_with_NIL_exp NUMERIC,
      Number_of_Ongoing_Works NUMERIC,
      Persondays_of_Central_Liability_so_far NUMERIC,
      SC_persondays NUMERIC,
      ST_persondays NUMERIC,
      Total_Adm_Expenditure NUMERIC,
      Total_Exp NUMERIC,
      Total_Households_Worked NUMERIC,
      Total_Individuals_Worked NUMERIC,
      Total_No_of_Active_Job_Cards NUMERIC,
      Total_No_of_Active_Workers NUMERIC,
      Total_No_of_HHs_completed_100_Days_of_Wage_Employment NUMERIC,
      Total_No_of_JobCards_issued NUMERIC,
      Total_No_of_Workers NUMERIC,
      Total_No_of_Works_Takenup NUMERIC,
      Wages NUMERIC,
      Women_Persondays NUMERIC,
      percent_of_Category_B_Works NUMERIC,
      percent_of_Expenditure_on_Agriculture_Allied_Works NUMERIC,
      percent_of_NRM_Expenditure NUMERIC,
      percentage_payments_gererated_within_15_days NUMERIC,
      Remarks TEXT
    );
  `;
  await pool.query(query);
  console.log("✅ Table ready: mgnrega_data");
};

export const insertData = async (records) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertQuery = `
      INSERT INTO mgnrega_data (
        fin_year, month, state_code, state_name, district_code, district_name,
        Approved_Labour_Budget, Average_Wage_rate_per_day_per_person,
        Average_days_of_employment_provided_per_Household,
        Differently_abled_persons_worked, Material_and_skilled_Wages,
        Number_of_Completed_Works, Number_of_GPs_with_NIL_exp,
        Number_of_Ongoing_Works, Persondays_of_Central_Liability_so_far,
        SC_persondays, ST_persondays, Total_Adm_Expenditure, Total_Exp,
        Total_Households_Worked, Total_Individuals_Worked,
        Total_No_of_Active_Job_Cards, Total_No_of_Active_Workers,
        Total_No_of_HHs_completed_100_Days_of_Wage_Employment,
        Total_No_of_JobCards_issued, Total_No_of_Workers,
        Total_No_of_Works_Takenup, Wages, Women_Persondays,
        percent_of_Category_B_Works, percent_of_Expenditure_on_Agriculture_Allied_Works,
        percent_of_NRM_Expenditure, percentage_payments_gererated_within_15_days, Remarks
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22,
        $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34
      )
    `;

    for (const r of records) {
      await client.query(insertQuery, [
        r.fin_year, r.month, r.state_code, r.state_name, r.district_code, r.district_name,
        r.Approved_Labour_Budget, r.Average_Wage_rate_per_day_per_person,
        r.Average_days_of_employment_provided_per_Household,
        r.Differently_abled_persons_worked, r.Material_and_skilled_Wages,
        r.Number_of_Completed_Works, r.Number_of_GPs_with_NIL_exp,
        r.Number_of_Ongoing_Works, r.Persondays_of_Central_Liability_so_far,
        r.SC_persondays, r.ST_persondays, r.Total_Adm_Expenditure, r.Total_Exp,
        r.Total_Households_Worked, r.Total_Individuals_Worked,
        r.Total_No_of_Active_Job_Cards, r.Total_No_of_Active_Workers,
        r.Total_No_of_HHs_completed_100_Days_of_Wage_Employment,
        r.Total_No_of_JobCards_issued, r.Total_No_of_Workers,
        r.Total_No_of_Works_Takenup, r.Wages, r.Women_Persondays,
        r.percent_of_Category_B_Works, r.percent_of_Expenditure_on_Agriculture_Allied_Works,
        r.percent_of_NRM_Expenditure, r.percentage_payments_gererated_within_15_days,
        r.Remarks
      ]);
    }

    await client.query("COMMIT");
    console.log("✅ Data inserted successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error inserting data:", error.message);
  } finally {
    client.release();
  }
};
