import express from "express";
import {
    getDistricts,
    getDistrictMetrics,
    getDistrictData,
    getDistrictInsights,
    compareDistricts,
    getDistrictStats,
    getRuralDevelopmentIndex,
    getAggregatedMetrics,
    getAggregatedInsights
} from "../controllers/districtController.js";

const router = express.Router();

// Get all districts
router.get("/districts", getDistricts);

// Get specific district data
router.get("/district/:district", getDistrictData);

// Get district metrics
router.get("/district/:district/metrics", getDistrictMetrics);

// Get aggregated metrics
router.get("/metrics/aggregated", getAggregatedMetrics);

// Get aggregated insights
router.get("/insights/aggregated", getAggregatedInsights);

// Get district insights
router.get("/district/:district/insights", getDistrictInsights);

// Compare districts
router.get("/compare", compareDistricts);

// Get district statistics for charts
router.get("/district/:district/stats", getDistrictStats);

// Get rural development index
router.get("/district/:district/development-index", getRuralDevelopmentIndex);

export default router;