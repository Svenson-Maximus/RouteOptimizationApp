/**
 * @typedef {Object} CustomerRow
 * @property {string} id
 * @property {string} companyIndex
 * @property {string} name
 * @property {string} fullAddressRaw
 * @property {string | null} street
 * @property {string | null} buildingNo
 * @property {string} city
 * @property {string} postalCode
 * @property {string} addressType
 * @property {boolean} primaryDelivery
 * @property {boolean} needsDeliveryAddressReview
 * @property {string | null} deliveryAddressReviewReason
 * @property {string | null} deliveryAddressNote
 * @property {string} validationStatus
 * @property {string | null} tourType
 * @property {string | null} timeWindowStart
 * @property {string | null} timeWindowEnd
 * @property {string | null} rawTimeWindowStart
 * @property {string | null} rawTimeWindowEnd
 * @property {number | null} serviceTimeMinutes
 * @property {boolean} monday
 * @property {boolean} tuesday
 * @property {boolean} wednesday
 * @property {boolean} thursday
 * @property {boolean} friday
 * @property {boolean} saturday
 * @property {number | null} mondayDeliveryDemandUnits
 * @property {number | null} mondayPickupDemandUnits
 * @property {number | null} tuesdayDeliveryDemandUnits
 * @property {number | null} tuesdayPickupDemandUnits
 * @property {number | null} wednesdayDeliveryDemandUnits
 * @property {number | null} wednesdayPickupDemandUnits
 * @property {number | null} thursdayDeliveryDemandUnits
 * @property {number | null} thursdayPickupDemandUnits
 * @property {number | null} fridayDeliveryDemandUnits
 * @property {number | null} fridayPickupDemandUnits
 * @property {number | null} saturdayDeliveryDemandUnits
 * @property {number | null} saturdayPickupDemandUnits
 * @property {string | null} deliveryNotes
 */

/**
 * @typedef {Object} GeocodeCandidate
 * @property {string} placeId
 * @property {string} formattedAddress
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} provider
 */

export {};
