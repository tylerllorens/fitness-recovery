import { apiClient } from "./apiClient.js";

// GET /api/trends/summary?days=7
export async function fetchSummary(days = 7) {
  const res = await apiClient(`/api/trends/summary?days=${days}`, {
    method: "GET",
  });

  return res; // { periodDays, hasData, averages, bestDay, worstDay, zones, ... }
}

// GET /api/trends/7d
export async function fetchTrends7d() {
  const res = await apiClient("/api/trends/7d", {
    method: "GET",
  });

  return res.data ?? [];
}

// GET /api/trends/28d
export async function fetchTrends28d() {
  const res = await apiClient("/api/trends/28d", {
    method: "GET",
  });

  return res.data ?? [];
}
