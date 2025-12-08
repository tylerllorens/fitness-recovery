import { apiClient } from "./apiClient.js";

// GET /api/profile/me
export async function getProfile() {
  const res = await apiClient("/api/profile/me", {
    method: "GET",
  });

  if (res?.data?.user) return res.data.user;
  if (res?.user) return res.user;
  return res;
}

// PATCH /api/profile/me
export async function updateProfile(payload) {
  const res = await apiClient("/api/profile/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (res?.data?.user) return res.data.user;
  if (res?.user) return res.user;
  return res;
}
