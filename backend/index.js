import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const PORT = 5000;
const BASE_URL = "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722";

// 🟩 Fetch full MGNREGA data
app.get("/api/mgnrega", async (req, res) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        "api-key": process.env.API_KEY,
        format: "json",
        limit: 10000,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching MGNREGA data:", error.message);
    res.status(500).json({ error: "Failed to fetch data from MGNREGA API" });
  }
});

// 🟦 API to get all states
app.get("/api/states", async (req, res) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        "api-key": process.env.API_KEY,
        format: "json",
        limit: 10000,
      },
    });
    const records = response.data.records || [];
    const states = [...new Set(records.map((item) => item.state_name))];
    res.json(states.sort());
  } catch (error) {
    console.error("Error fetching states:", error.message);
    res.status(500).json({ error: "Failed to fetch states" });
  }
});

// 🟨 API to get districts by state
app.get("/api/districts/:state", async (req, res) => {
  try {
    const state = req.params.state;
    const response = await axios.get(BASE_URL, {
      params: {
        "api-key": process.env.API_KEY,
        format: "json",
        limit: 10000,
      },
    });
    const records = response.data.records || [];
    const districts = [
      ...new Set(
        records
          .filter((item) => item.state_name.toLowerCase() === state.toLowerCase())
          .map((item) => item.district_name)
      ),
    ];
    res.json(districts.sort());
  } catch (error) {
    console.error("Error fetching districts:", error.message);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
