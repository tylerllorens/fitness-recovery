import { apiClient } from "./apiClient.js";

// GET /api/trends/summary?days=7
export async function fetchSummary(days = 7) {
  const res = await apiClient(`/api/trends/summary?days=${days}`, {
    method: "GET",
  });

  return res; // { periodDays, hasData, averages, bestDay, worstDay, zones, ... }
}
