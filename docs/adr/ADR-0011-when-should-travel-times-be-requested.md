# ADR-0011: When should travel times be requested?

- **Date:** 2026-04-14
- **Status:** Proposed
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The route optimizer requires travel times between the depot and customers and between customer pairs.
Traffic-aware travel times depend on the customer coordinates and on the departure timestamp sent to Google Routes API.
For the project scope, the customer dataset is fixed and the matrix should be reusable across all delivery days.
When should travel times be requested?

## Decision Summary
Request travel times once for the full fixed customer dataset and depot.
Treat the matrix as delivery-day independent and reuse it for all weekdays by filtering active customers during optimization.
Use Tuesday at 04:30 Europe/Zurich as the representative departure timestamp for Google Routes API traffic-aware duration calculation.

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
- Google traffic-aware travel times require a concrete departure timestamp, even if the matrix is reused across weekdays.
- Tuesday at 04:30 Europe/Zurich is selected as a representative normal weekday timestamp.
- Tuesday avoids Monday, Friday, and Saturday traffic patterns that may be less representative.
- The all-day tour plan shows depot departure around 04:20 and first customer stops around 04:30-05:00, so 04:30 better represents the actual route start than the 07:00/08:00 assumption used in the previous thesis.
- The previous bachelor thesis also used a predictive morning departure time, but its documented time is inconsistent between 07:00, 08:00, and 08:00 UTC.
- One full matrix for 92 customers and one depot remains below the 10,000 free monthly Google matrix element cap if calculated once.
- Calculating one matrix per delivery day was not selected because the full matrix can already serve all weekday subsets and per-day matrices would increase API usage.
- Requesting travel times for every optimization run was not selected because it would create unnecessary API calls for a fixed dataset.
- Recalculating after every stop was not selected because real-time replanning is outside the project scope and would strongly increase API usage.

## Consequences
### Good
- Optimization can run without calling Google Maps each time.
- API cost and rate-limit exposure stay low.
- The same full matrix can be reused for all weekday optimizations.
- The matrix calculation is tied to an explicit traffic assumption.

### Bad
- The matrix uses one representative timestamp and does not model different traffic conditions for each weekday.
- The matrix can become outdated if real traffic, customer locations, or route conditions change.
- Changing customer locations or the representative departure-time assumption requires a new matrix calculation.
- The project does not model live traffic updates during optimization.
