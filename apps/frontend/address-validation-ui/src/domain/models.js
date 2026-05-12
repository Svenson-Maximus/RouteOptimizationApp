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
 * @property {string} validationStatus
 * @property {string | null} tourType
 * @property {string | null} timeWindowStart
 * @property {string | null} timeWindowEnd
 * @property {string | null} rawTimeWindowStart
 * @property {string | null} rawTimeWindowEnd
 * @property {string | null} timeWindowNormalizationNote
 * @property {number | null} serviceTimeMinutes
 * @property {boolean} monday
 * @property {boolean} tuesday
 * @property {boolean} wednesday
 * @property {boolean} thursday
 * @property {boolean} friday
 * @property {boolean} saturday
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
