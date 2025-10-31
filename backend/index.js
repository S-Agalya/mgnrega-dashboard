import express from "express";
import cors from "cors";
import districtRoutes from "./routes/districtRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// District routes
app.use("/api/mgnrega", districtRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));