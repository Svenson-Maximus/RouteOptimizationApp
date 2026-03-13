import { getJson } from "./httpClient";

const MOCK_CUSTOMERS = [
  {
    id: "c-1",
    companyIndex: "139",
    name: "Dorfmarkt",
    fullAddressRaw: "Hauptstrasse 29, 9555 Tobel",
    city: "Tobel",
    postalCode: "9555",
    validationStatus: "VALIDATED",
    tourType: null,
    routeGroup: "ZH2 Stadt",
  },
  {
    id: "c-2",
    companyIndex: "379",
    name: "Ortimo AG",
    fullAddressRaw: "obere Bahnhofstrasse 58, 8640 Rapperswil",
    city: "Rapperswil",
    postalCode: "8640",
    validationStatus: "PENDING",
    tourType: null,
    routeGroup: "ZH1 See",
  },
  {
    id: "c-3",
    companyIndex: "KORNHAUS-9500",
    name: "Kornhaus",
    fullAddressRaw: "Sonnenhofstrasse 2, 9500 Wil",
    city: "Wil",
    postalCode: "9500",
    validationStatus: "PENDING",
    tourType: null,
    routeGroup: "ZH2 Stadt",
  },
  {
    id: "c-4",
    companyIndex: "205",
    name: "Kletterzentrum Gaswerk",
    fullAddressRaw: "Schlieren",
    city: "Schlieren",
    postalCode: "8952",
    validationStatus: "NEEDS_REVIEW",
    tourType: "TK",
    routeGroup: "ZH2 Stadt",
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
