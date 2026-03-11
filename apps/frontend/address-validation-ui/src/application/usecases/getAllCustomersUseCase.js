import { fetchCustomers } from "../../infrastructure/api/customerApi";

export async function getAllCustomersUseCase() {
  return fetchCustomers();
}
