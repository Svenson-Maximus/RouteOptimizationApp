import { postJson } from "./httpClient";

export async function createOptimizationRun(payload) {
  return postJson("/api/optimization-runs", payload);
}
