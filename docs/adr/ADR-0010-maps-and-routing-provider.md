# ADR-0010: Which maps and routing provider should be used?

- **Date:** 2026-04-14
- **Status:** Proposed
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The platform needs reliable geocoding and travel-time data for route optimization.
The optimizer does not calculate real-world travel times itself; it requires a duration matrix as input.
For the project scope, the matrix is calculated once for the fixed customer dataset and stored in the database.
Which maps and routing provider should be used?

## Decision Summary
Use Google Maps Platform for geocoding and for calculating the directed travel-time and distance matrix.

## Considered Options
- Google Maps Platform
- OpenRouteService
- HERE Maps
- Mapbox
- Self-hosted OSRM

## Decision Outcome
Chosen option: **Google Maps Platform**.

### Justification
- Google Maps provides mature geocoding and route matrix APIs.
- The existing legacy implementation already uses Google APIs.
- The project scope requires one matrix calculation for a fixed customer dataset, so expected API usage is limited.
- The official Google Maps Platform Routes API billing documentation states that Compute Route Matrix is billed per returned element, where the number of elements is the number of origins multiplied by the number of destinations: https://developers.google.com/maps/documentation/routes/usage-and-billing
- The official Google Maps Platform pricing list defines the Routes API Compute Route Matrix Essentials SKU with a monthly free usage cap of 10,000 elements and a first paid tier of USD 5.00 per 1,000 elements: https://developers.google.com/maps/billing-and-pricing/pricing
- The cost driver is the number of origin-destination matrix elements. For a directed matrix with `n` locations, the required number of elements is approximately `n * (n - 1)` when self-routes are excluded.
- For 92 customers and one depot, this results in `93 * 92 = 8,556` matrix elements for one full calculation.
- The matrix is persisted after calculation, so repeated optimization runs do not require repeated Google API calls unless the customer set, coordinates, or departure-time assumptions change.
- Google returns both travel duration and distance, which supports optimization, reporting, and plausibility checks.
- Open-source or self-hosted alternatives can reduce provider cost, but they add setup, hosting, maintenance, and data-quality responsibilities.

## Consequences
### Good
- Reliable geocoding and route matrix data can be obtained from one provider.
- Only one matrix calculation is needed for the fixed project dataset.
- Persisting the matrix limits repeated API usage and cost.
- Distance data can be stored together with travel time for reporting and validation.

### Bad
- The solution depends on an external paid API.
- API keys and billing must be configured and protected.
- Pricing can change over time.
- Google Maps traffic assumptions may not exactly match actual delivery conditions.
