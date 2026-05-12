import { getJson, postJson } from "./httpClient";

const MOCK_CUSTOMERS = [
  {
    id: "c-1",
    companyIndex: "139",
    name: "Dorfmarkt",
    fullAddressRaw: "Hauptstrasse 29, 9555 Tobel",
    street: "Hauptstrasse",
    buildingNo: "29",
    city: "Tobel",
    postalCode: "9555",
    addressType: "DELIVERY",
    primaryDelivery: true,
    needsDeliveryAddressReview: false,
    deliveryAddressReviewReason: null,
    validationStatus: "VALIDATED",
    tourType: null,
    timeWindowStart: "04:20:00",
    timeWindowEnd: "19:00:00",
    rawTimeWindowStart: null,
    rawTimeWindowEnd: null,
    timeWindowNormalizationNote: "No explicit time window was available; normalized to full route horizon.",
    serviceTimeMinutes: 10,
    monday: true,
    tuesday: false,
    wednesday: false,
    thursday: true,
    friday: false,
    saturday: false,
    deliveryNotes: "Hintereingang auf Rolliwagen",
  },
  {
    id: "c-2",
    companyIndex: "379",
    name: "Ortimo AG",
    fullAddressRaw: "obere Bahnhofstrasse 58, 8640 Rapperswil",
    street: "obere Bahnhofstrasse",
    buildingNo: "58",
    city: "Rapperswil",
    postalCode: "8640",
    addressType: "DELIVERY",
    primaryDelivery: true,
    needsDeliveryAddressReview: false,
    deliveryAddressReviewReason: null,
    validationStatus: "PENDING",
    tourType: null,
    timeWindowStart: "06:00:00",
    timeWindowEnd: "10:00:00",
    rawTimeWindowStart: "06:00:00",
    rawTimeWindowEnd: "10:00:00",
    timeWindowNormalizationNote: "Explicit imported time window retained.",
    serviceTimeMinutes: 10,
    monday: true,
    tuesday: true,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    deliveryNotes: "Geht vorne und hinten",
  },
  {
    id: "c-3",
    companyIndex: "KORNHAUS-9500",
    name: "Kornhaus",
    fullAddressRaw: "Sonnenhofstrasse 2, 9500 Wil",
    street: "Sonnenhofstrasse",
    buildingNo: "2",
    city: "Wil",
    postalCode: "9500",
    addressType: "DELIVERY",
    primaryDelivery: true,
    needsDeliveryAddressReview: false,
    deliveryAddressReviewReason: null,
    validationStatus: "PENDING",
    tourType: null,
    timeWindowStart: "04:20:00",
    timeWindowEnd: "19:00:00",
    rawTimeWindowStart: null,
    rawTimeWindowEnd: null,
    timeWindowNormalizationNote: "No explicit time window was available; normalized to full route horizon.",
    serviceTimeMinutes: 10,
    monday: false,
    tuesday: true,
    wednesday: false,
    thursday: false,
    friday: true,
    saturday: false,
    deliveryNotes: null,
  },
  {
    id: "c-4",
    companyIndex: "205",
    name: "Kletterzentrum Gaswerk",
    fullAddressRaw: "Schlieren",
    street: null,
    buildingNo: null,
    city: "Schlieren",
    postalCode: "8952",
    addressType: "DELIVERY",
    primaryDelivery: true,
    needsDeliveryAddressReview: true,
    deliveryAddressReviewReason: "Delivery note suggests a different physical delivery location than the structured address.",
    validationStatus: "NEEDS_REVIEW",
    tourType: "TK",
    timeWindowStart: "04:20:00",
    timeWindowEnd: "06:00:00",
    rawTimeWindowStart: "05:50:00",
    rawTimeWindowEnd: "05:00:00",
    timeWindowNormalizationNote: "Invalid imported time window manually extended to 06:00 following thesis prototype handling of originally 05:00 windows.",
    serviceTimeMinutes: 10,
    monday: true,
    tuesday: false,
    wednesday: true,
    thursday: false,
    friday: false,
    saturday: false,
    deliveryNotes: "wenn Ortoloco geliefert wird",
  },
];

export async function fetchCustomers() {
  try {
    return await getJson("/api/customers");
  } catch {
    return MOCK_CUSTOMERS;
  }
}

export async function fetchValidationQueue() {
  try {
    return await getJson("/api/customers/validation-queue");
  } catch {
    const customers = await fetchCustomers();
    return customers.filter((c) => c.validationStatus !== "VALIDATED");
  }
}

export async function updateCustomerAddress(customerId, payload) {
  return postJson(`/api/customers/${customerId}/address`, payload);
}
