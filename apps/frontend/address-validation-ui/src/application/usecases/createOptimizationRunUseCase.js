import { createOptimizationRun } from "../../infrastructure/api/optimizationApi";

export async function createOptimizationRunUseCase(payload) {
  return createOptimizationRun(payload);
}
