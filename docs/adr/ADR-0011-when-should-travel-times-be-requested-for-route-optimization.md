# ADR-0011: When should travel times be requested for route optimization?

- **Date:** 2026-04-14
- **Status:** Proposed
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The route optimizer requires travel times between the depot and customers and between customer pairs.
Travel times can depend on the selected customer set, coordinates, and departure-time assumptions.
For the project scope, the customer dataset is fixed and the matrix only needs to be calculated once.
When should travel times be requested for route optimization?

## Decision Summary
Request travel times once for the fixed project dataset before optimization, store the resulting matrix, and reuse it for optimization runs.

## Considered Options
- Calculate the matrix once before optimization and persist it
- Request travel times every time an optimization run starts
- Request travel times on a fixed schedule
- Manually enter travel times

## Decision Outcome
Chosen option: **calculate the matrix once before optimization and persist it**.

### Justification
- The project uses a fixed customer dataset, so repeated API calls are not necessary for the core scope.
- Persisting the matrix makes optimization runs repeatable and auditable.
- A single calculation reduces dependency on external API availability during demos or later optimizer tests.
- The approach limits Google Maps API usage and cost.
- The matrix can be recalculated later if customers, coordinates, or the assumed departure time change.

## Consequences
### Good
- Optimization can run without calling Google Maps each time.
- API cost and rate-limit exposure stay low.
- The same input data can be reused for testing and thesis documentation.

### Bad
- The matrix can become outdated if real traffic or route conditions change.
- Changing customer locations or departure-time assumptions requires a new matrix calculation.
- The project does not model live traffic updates during optimization.
