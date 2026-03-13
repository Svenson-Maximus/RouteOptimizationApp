import { fetchCustomers, updateCustomerAddress } from "../../infrastructure/api/customerApi";

export async function getAllCustomersUseCase() {
  return fetchCustomers();
}

export async function updateCustomerAddressUseCase(customerId, payload) {
  return updateCustomerAddress(customerId, payload);
}
