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
    validationStatus: "VALIDATED",
    tourType: null,
    routeGroup: "ZH2 Stadt",
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
    validationStatus: "PENDING",
    tourType: null,
    routeGroup: "ZH1 See",
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
    validationStatus: "PENDING",
    tourType: null,
    routeGroup: "ZH2 Stadt",
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
    validationStatus: "NEEDS_REVIEW",
    tourType: "TK",
    routeGroup: "ZH2 Stadt",
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
