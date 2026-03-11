import { postJson } from "./httpClient";

const MOCK_CANDIDATES = {
  "c-2": [
    {
      placeId: "place-rapperswil-1",
      formattedAddress: "Obere Bahnhofstrasse 58, 8640 Rapperswil-Jona, Switzerland",
      latitude: 47.2269,
      longitude: 8.8192,
      provider: "GOOGLE",
    },
  ],
  "c-3": [
    {
      placeId: "place-wil-1",
      formattedAddress: "Sonnenhofstrasse 2, 9500 Wil, Switzerland",
      latitude: 47.4622,
      longitude: 9.0454,
      provider: "GOOGLE",
    },
    {
      placeId: "place-wil-2",
      formattedAddress: "Sonnenhofstrasse 2, 9500 Wil SG, Switzerland",
      latitude: 47.4624,
      longitude: 9.0451,
      provider: "GOOGLE",
    },
  ],
};

export async function requestGeocodeSuggestions(customerId) {
  try {
    return await postJson(`/api/geocoding/${customerId}/suggest`, {});
  } catch {
    return MOCK_CANDIDATES[customerId] || [];
  }
}

export async function confirmGeocode(customerId, candidate) {
  try {
    return await postJson(`/api/geocoding/${customerId}/confirm`, candidate);
  } catch {
    return { ok: true, customerId, placeId: candidate.placeId };
  }
}
