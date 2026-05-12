# ADR-0010: When should travel times be requested?

- **Date:** 2026-04-14
- **Status:** Proposed
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The route optimizer requires travel times between the depot and customers and between customer pairs.
For the project scope, the customer dataset is fixed and the matrix should be reusable across all delivery days.
The first implementation should keep API cost low and produce a reusable baseline matrix.
Traffic-aware travel times can be generated later as a separate comparison matrix.
When should travel times be requested?

## Decision Summary
Request travel times once for the full fixed customer dataset and depot.
Treat the matrix as delivery-day independent and reuse it for all weekdays by filtering active customers during optimization.
Use Google Routes API Compute Route Matrix with the default `TRAFFIC_UNAWARE` routing behavior for the first full matrix.
Do not send a representative departure timestamp for this baseline matrix.
Call Google Routes API Compute Route Matrix in `10 x 10` origin-destination chunks and throttle requests below the documented element-per-minute quota.
Persist the returned directed durations and distances.
Keep `TRAFFIC_AWARE_OPTIMAL` configurable for a later comparison matrix; that optional run should be stored as a separate matrix run.

## Considered Options
- Calculate one full matrix for all customers and the depot
- Calculate one matrix per selected delivery day
- Request travel times every time an optimization run starts
- Recalculate travel times after every stop

## Decision Outcome
Chosen option: **calculate one full matrix for all customers and the depot**.

### Justification
- The project uses a fixed customer dataset, so repeated API calls are not necessary for the core scope.
- A full matrix contains all origin-destination pairs needed by the weekday-specific optimizer inputs.
- Weekday-specific optimization can reuse the full matrix by selecting only the customers active on the chosen weekday.
- Persisting the matrix makes optimization runs repeatable and auditable.
- Google documents `ROUTING_PREFERENCE_UNSPECIFIED` as defaulting to `TRAFFIC_UNAWARE`; in this mode, the returned `duration` is the same as `staticDuration` and does not include live traffic.
- The full matrix has up to `93 * 93 = 8,649` elements, which fits below the current 10,000 free monthly cap for Routes Compute Route Matrix Essentials.
- `TRAFFIC_AWARE_OPTIMAL` is a Pro-tier request mode with a lower free monthly cap, so it is not the default for the full baseline matrix.
- The bachelor thesis prototype used `TRAFFIC_AWARE_OPTIMAL` with a predictive morning departure time and a smaller daily input file such as `Monday_Customers.csv`. That remains useful for a later comparison, but it is not the cost-free baseline strategy for the full fixed dataset.
- `10 x 10` chunks match the legacy matrix-generation script and keep each request small enough for straightforward retry and checkpoint handling.
- Google documents a Compute Route Matrix rate limit in elements per minute, so the matrix generator must throttle chunk calls instead of sending all chunks immediately.
- Calculating one matrix per delivery day was not selected because the full matrix can already serve all weekday subsets and per-day matrices would increase API usage.
- Requesting travel times for every optimization run was not selected because it would create unnecessary API calls for a fixed dataset.
- Recalculating after every stop was not selected because real-time replanning is outside the project scope and would strongly increase API usage.

## Consequences
### Good
- Optimization can run without calling Google Maps each time.
- API cost and rate-limit exposure stay low.
- The same full matrix can be reused for all weekday optimizations.
- The first matrix should fit within the current Essentials free monthly element cap if no other Essentials matrix usage has consumed it.
- A later traffic-aware matrix can be compared against the baseline without changing the optimizer data model.

### Bad
- The first matrix does not model current or predictive traffic conditions.
- The matrix can become outdated if customer locations, route conditions, or Google's average travel-time model change.
- Changing customer locations or switching to a traffic-aware comparison requires a new matrix calculation.
- The project does not model live traffic updates during optimization.
