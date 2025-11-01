import express from "express";
import cors from "cors";
import districtRoutes from "./routes/districtRoutes.js";
import syncRoutes from "./routes/syncRoutes.js";
import './services/cronService.js'; // Initialize cron service

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/mgnrega", districtRoutes);
app.use("/api/sync", syncRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('ℹ️ Data sync is scheduled to run every 7 days');
});