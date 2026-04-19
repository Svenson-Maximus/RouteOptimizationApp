# ADR-0010: Which maps provider?

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

## Considered Options
- Google Maps Platform
- OpenRouteService
- Self-hosted OSRM

## Decision Outcome
Chosen option: **Google Maps Platform**.

### Justification
- Google Maps provides mature geocoding and route matrix APIs.
- The existing legacy implementation already uses Google APIs.
- Using one provider for geocoding and routing reduces the risk that stored customer locations and matrix calculations refer to different map data.
- The geocoding step resolves customer and depot addresses to a formatted address, coordinates, and a Google Place ID before matrix generation.
- The current implementation contains the validation workflow and a mock geocoding adapter. The real Google Geocoding integration is an implementation task, not a separate provider decision.
- The project scope requires one full matrix calculation for the fixed customer dataset and depot, so expected API usage is limited.
- The official Google Maps Platform Geocoding API billing documentation states that geocoding uses a pay-as-you-go model and is billed per request: https://developers.google.com/maps/documentation/geocoding/usage-and-billing
- The official Google Maps Platform pricing overview states that Essentials products include 10,000 free calls per SKU per month: https://mapsplatform.google.com/pricing/
- For approximately 92 customers and one depot, the project needs about 93 geocoding requests if every address is geocoded once.
- This is below the free monthly usage for the Geocoding SKU, so geocoding should not create Google cost for this project if the fixed dataset is geocoded once or only a small number of times.
- The official Google Maps Platform Routes API billing documentation states that Compute Route Matrix is billed per returned element, where the number of elements is the number of origins multiplied by the number of destinations: https://developers.google.com/maps/documentation/routes/usage-and-billing
- The official Google Maps Platform pricing list defines the Routes API Compute Route Matrix Essentials SKU with a monthly free usage cap of 10,000 elements and a first paid tier of USD 5.00 per 1,000 elements: https://developers.google.com/maps/billing-and-pricing/pricing
- The cost driver is the number of origin-destination matrix elements. For a directed matrix with `n` locations, the required number of elements is approximately `n * (n - 1)` when self-routes are excluded.
- For 92 customers and one depot, this results in `93 * 92 = 8,556` matrix elements for one full calculation.
- This is below the 10,000 free monthly element cap, so the matrix calculation should not create Google route matrix cost for this project if it is calculated once and no additional billable calls exceed the monthly free usage.
- The full matrix is persisted after calculation and reused for each weekday by selecting only the active customers during optimization.
- Repeated optimization runs do not require repeated Google API calls unless the customer set, coordinates, or representative departure-time assumption changes.
- Google returns both travel duration and distance, which supports optimization, reporting, and plausibility checks.
- OpenRouteService was not selected because Google Maps is already used by the legacy scripts and provides one provider for geocoding and matrix calculation.
- Self-hosted OSRM was not selected because it would add map-data hosting, updates, routing-server operation, and data-quality responsibility.

## Consequences
### Good
- Reliable geocoding and route matrix data can be obtained from one provider.
- Only one full matrix calculation is needed for the fixed project dataset.
- Persisting the matrix limits repeated API usage and cost.
- Distance data can be stored together with travel time for reporting and validation.

### Bad
- The solution depends on an external paid API.
- API keys and billing must be configured and protected.
- Pricing can change over time.
- Google Maps traffic assumptions may not exactly match actual delivery conditions.
