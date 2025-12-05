import { apiClient } from "./apiClient.js";

// GET /api/metrics/latest -> { item: { ...MetricDay } }
export async function fetchLatestMetricDay() {
  const res = await apiClient("/api/metrics/latest", {
    method: "GET",
  });

  return res.item ?? res;
}

// GET /api/metrics -> { items: MetricDay[] }
export async function fetchMetricDays() {
  const res = await apiClient("/api/metrics", {
    method: "GET",
  });

  return res.items ?? [];
}

// GET /api/metrics/:date -> { item: MetricDay } or { error: ... }
export async function fetchMetricDayByDate(date) {
  // date should be "YYYY-MM-DD"
  const res = await apiClient(`/api/metrics/${date}`, {
    method: "GET",
  });

  return res.item ?? null;
}

// POST /api/metrics (upsert) -> { item: MetricDay }
export async function upsertMetricDay(payload) {
  // payload: { date, sleepHours, rhr, hrv, strain, notes? }
  const res = await apiClient("/api/metrics", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return res.item ?? res;
}
