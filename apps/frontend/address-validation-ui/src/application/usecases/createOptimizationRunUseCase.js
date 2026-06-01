import {
  createOptimizationRun,
  fetchRecentOptimizationRuns,
} from "../../infrastructure/api/optimizationApi";

export async function createOptimizationRunUseCase(payload) {
  return createOptimizationRun(payload);
}

export async function getRecentOptimizationRunsUseCase(weekday, limit = 3) {
  return fetchRecentOptimizationRuns(weekday, limit);
}
