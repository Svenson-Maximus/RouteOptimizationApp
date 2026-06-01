import { getJson, postJson } from "./httpClient";

export async function createOptimizationRun(payload) {
  return postJson("/api/optimization-runs", payload);
}

export async function fetchRecentOptimizationRuns(weekday, limit = 3) {
  const params = new URLSearchParams({ weekday, limit: String(limit) });
  return getJson(`/api/optimization-runs?${params.toString()}`);
}
