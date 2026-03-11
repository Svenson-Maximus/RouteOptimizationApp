import { fetchValidationQueue } from "../../infrastructure/api/customerApi";

export async function getValidationQueueUseCase() {
  return fetchValidationQueue();
}
