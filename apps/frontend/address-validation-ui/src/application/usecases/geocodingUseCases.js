import {
  requestGeocodeSuggestions,
  confirmGeocode,
} from "../../infrastructure/api/geocodingApi";

export async function suggestGeocodeUseCase(customerId) {
  return requestGeocodeSuggestions(customerId);
}

export async function confirmGeocodeUseCase(customerId, candidate) {
  return confirmGeocode(customerId, candidate);
}
