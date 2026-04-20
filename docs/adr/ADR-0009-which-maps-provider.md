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
- The expected project usage is below the free monthly usage if the fixed dataset is calculated once: about 93 geocoding requests and `93 * 92 = 8,556` directed route matrix elements.
- Google documents pay-as-you-go geocoding and route-matrix billing, with Essentials products including 10,000 free calls or elements per SKU per month: https://developers.google.com/maps/documentation/geocoding/usage-and-billing, https://developers.google.com/maps/documentation/routes/usage-and-billing, https://mapsplatform.google.com/pricing/
- OpenRouteService was not selected because it would introduce a second provider pattern while Google already covers both geocoding and matrix calculation.
- Self-hosted OSRM was not selected because it would require operating map data, routing servers, updates, and data-quality checks.

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
