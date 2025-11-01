import express from "express";
import {
    getDistricts,
    getDistrictMetrics,
    getDistrictData,
    getAggregatedMetrics,
    compareDistricts
} from "../controllers/districtController.js";

const router = express.Router();

// Get all districts
router.get("/districts", getDistricts);

// Compare districts
router.get("/districts/compare", compareDistricts);

// Get metrics for a specific district
router.get("/districts/:district_code/metrics", getDistrictMetrics);

// Get all data for a specific district
router.get("/districts/:district_code/data", getDistrictData);

// Get aggregated metrics across all districts
router.get("/metrics/aggregated", getAggregatedMetrics);

export default router;