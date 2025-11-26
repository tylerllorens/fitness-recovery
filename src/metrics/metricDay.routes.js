import { Router } from "express";
import { requireUser } from "../middleware/requireUser.js";
import {
  upsertMetricDayHandler,
  getMetricDaysHandler,
  getMyLatestMetricDayHandler,
} from "./metricDay.controller.js";

const router = Router();

// Require login
router.use(requireUser);

// Create/ update today's metrics
router.post("/", upsertMetricDayHandler);

// Get all metric days for the user
router.get("/", getMetricDaysHandler);

// Get the most recent metric day
router.get("/latest", getMyLatestMetricDayHandler);

export default router;
