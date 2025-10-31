import express from "express";
import pool from "../config/db.js";
import axios from "axios";
import { createTable, insertData } from "../models/mgnregaModel.js";

const router = express.Router();

// ✅ Fetch and insert fresh data from data.gov.in
router.get("/fetch", async (req, res) => {
  try {
    await createTable();
    console.log("⏳ Fetching data from Data.gov.in...");
    const { data } = await axios.get(process.env.DATA_API);
    const records = data.records;

    console.log("🔍 Sample record keys:", Object.keys(records[0]));
    console.log("🔍 Sample record values:", records[0]);

    await insertData(records);
    res.json({ success: true, message: "Data fetched and stored", count: records.length });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Failed to fetch and store data" });
  }
});


// ✅ Get all states
router.get("/states", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT state_name FROM mgnrega_data ORDER BY state_name ASC"
    );
    res.json(result.rows.map((r) => r.state_name));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch states" });
  }
});

// ✅ Get all districts for a given state
router.get("/districts", async (req, res) => {
  const { state } = req.query;
  if (!state) return res.status(400).json({ error: "State is required" });

  try {
    const result = await pool.query(
      "SELECT DISTINCT district_name FROM mgnrega_data WHERE LOWER(state_name)=LOWER($1) ORDER BY district_name ASC",
      [state]
    );
    res.json(result.rows.map((r) => r.district_name));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});

// ✅ Get records (filtered or all)
router.get("/", async (req, res) => {
  const { state, district, limit = 10000 } = req.query;
  try {
    let query = "SELECT * FROM mgnrega_data";
    const params = [];

    if (state && district) {
      query += " WHERE LOWER(state_name)=LOWER($1) AND LOWER(district_name)=LOWER($2)";
      params.push(state, district);
    } else if (state) {
      query += " WHERE LOWER(state_name)=LOWER($1)";
      params.push(state);
    }

    query += ` LIMIT $${params.length + 1}`;
    params.push(Number(limit));

    const result = await pool.query(query, params);
    res.json({ records: result.rows });
  } catch (err) {
    console.error("❌ Error fetching records:", err.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// ✅ Compare multiple districts across selected metrics
router.get("/compare", async (req, res) => {
  const { districts } = req.query;
  if (!districts) return res.status(400).json({ error: "Districts parameter is required" });

  const districtList = districts.split(",").map((d) => d.trim());

  try {
    const query = `
      SELECT 
        district_name,
        AVG(Average_Wage_rate_per_day_per_person) AS Average_Wage_rate_per_day_per_person,
        AVG(Average_days_of_employment_provided_per_Household) AS Average_days_of_employment_provided_per_Household,
        SUM(Persondays_of_Central_Liability_so_far) AS Persondays_of_Central_Liability_so_far,
        SUM(Women_Persondays) AS Women_Persondays,
        SUM(Total_Households_Worked) AS Total_Households_Worked
      FROM mgnrega_data
      WHERE district_name = ANY($1)
      GROUP BY district_name
      ORDER BY district_name ASC;
    `;
    const result = await pool.query(query, [districtList]);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching comparison data:", err.message);
    res.status(500).json({ error: "Failed to fetch comparison data" });
  }
});

export default router;
