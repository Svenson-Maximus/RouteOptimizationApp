# ADR-0009: Which maps provider?

- **Date:** 2026-04-14
- **Status:** Proposed
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The platform needs reliable geocoding and travel-time data for route optimization.
The optimizer does not calculate real-world travel times itself; it requires a duration matrix as input.
Customer and depot addresses also need to be resolved to stable geographic references before a route matrix can be calculated.
For the project scope, one full matrix is calculated for the fixed customer dataset and depot, stored in the database, and reused across all delivery days.
Which maps provider should be used?

## Decision Summary
Use Google Maps Platform for address geocoding, Google Place ID resolution, and for calculating one full directed travel-time and distance matrix.
Calculate the first full matrix with the default `TRAFFIC_UNAWARE` routing behavior so the `93 x 93 = 8,649` element matrix fits within the Routes Compute Route Matrix Essentials free monthly cap.
Keep the implementation configurable so a later `TRAFFIC_AWARE_OPTIMAL` matrix can be generated and compared separately.
All Google API calls are made by backend services, never directly by the frontend.

## Considered Options
- Google Maps Platform
- OpenRouteService
- Self-hosted OSRM

## Decision Outcome
Chosen option: **Google Maps Platform**.

### Justification
- Google Maps provides mature geocoding and route matrix APIs.
- Google is the simplest option for this project because one provider can cover geocoding, Place IDs, travel times, and distances.
- The legacy prototype already used Google APIs, so Google also has the lowest migration effort.
- Backend geocoding resolves depot and customer addresses to formatted addresses, Place IDs, latitude, longitude, provider status, result count, and raw provider response metadata before matrix calculation.
- The expected first matrix usage is below the current free monthly cap if the fixed dataset is calculated once with `TRAFFIC_UNAWARE` routing: about 93 geocoding requests and up to `93 * 93 = 8,649` route matrix elements when depot, customers, and self-pairs are included in rectangular API chunks.
- Google documents Routes Compute Route Matrix Essentials with 10,000 free elements per month and paid usage after that. `TRAFFIC_AWARE_OPTIMAL` belongs to the Pro tier, which has a lower free cap and should be generated separately only when the project intentionally compares traffic-aware and traffic-unaware results.
- Relevant Google documentation: https://developers.google.com/maps/documentation/routes/reference/rest/v2/TopLevel/computeRouteMatrix, https://developers.google.com/maps/documentation/routes/reference/rest/v2/RoutingPreference, https://developers.google.cn/maps/billing-and-pricing/pricing?hl=en
- OpenRouteService was not selected because it would introduce a second provider pattern while Google already covers both geocoding and matrix calculation.
- Self-hosted OSRM was not selected because it would require operating map data, routing servers, updates, and data-quality checks.

## Consequences
### Good
- Reliable geocoding and route matrix data can be obtained from one provider.
- API keys stay on the server side and are not exposed to the browser.
- Only one full matrix calculation is needed for the fixed project dataset.
- Persisting the matrix limits repeated API usage and cost.
- Distance data can be stored together with travel time for reporting and validation.

### Bad
- The solution depends on an external paid API.
- API keys and billing must be configured and protected.
- Pricing can change over time.
- The first full matrix does not model live or predictive traffic conditions.
- A later traffic-aware comparison matrix can create additional API cost because `TRAFFIC_AWARE_OPTIMAL` uses the Pro tier.
