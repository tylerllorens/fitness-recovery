import { apiClient } from "./apiClient.js";

export async function loginRequest({ email, password }) {
  // returns { token: string } on success
  return apiClient("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutRequest() {
  return apiClient("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function fetchCurrentUser() {
  const res = await apiClient("/api/profile/me", {
    method: "GET",
  });

  if (res?.data?.user) return res.data.user;
  if (res?.user) return res.user;
  return res;
}
