import axios from "axios";
import { createTable, insertData } from "../models/mgnregaModel.js";

export const fetchAndStoreData = async (req, res) => {
  try {
    await createTable(); // Ensure table exists

    const { data } = await axios.get(process.env.DATA_API);
    const records = data.records;

    await insertData(records);

    res.json({ success: true, message: "Data fetched and stored successfully", count: records.length });
    console.log(Object.keys(records[0]));

  } catch (error) {
    console.error("Error fetching/storing data:", error.message);
    res.status(500).json({ success: false, message: "Error fetching/storing data" });
  }


};
