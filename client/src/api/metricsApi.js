import { apiClient } from "./apiClient.js";

// GET /api/metrics/latest
export async function fetchLatestMetricDay() {
  const res = await apiClient("/api/metrics/latest", {
    method: "GET",
  });

  return res?.data?.item ?? res.item ?? res;
}

// GET /api/metrics
export async function fetchMetricDays() {
  const res = await apiClient("/api/metrics", {
    method: "GET",
  });

  return res?.data?.items ?? res?.items ?? [];
}

// GET /api/metrics/:date
export async function fetchMetricDayByDate(date) {
  // date should be "YYYY-MM-DD"
  const res = await apiClient(`/api/metrics/day?date=${date}`, {
    method: "GET",
  });

  return res?.data?.item ?? res?.item ?? null;
}

// POST /api/metrics (upsert)
export async function upsertMetricDay(payload) {
  // payload: { date, sleepHours, rhr, hrv, strain, notes? }
  const res = await apiClient("/api/metrics", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return res?.data?.item ?? res?.item ?? res;
}
