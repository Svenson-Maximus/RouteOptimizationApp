# ADR-0012: How should travel times and distances be stored?

- **Date:** 2026-04-14
- **Status:** Proposed
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The optimizer needs travel-time values between locations.
Google Maps can return both duration and distance for each origin-destination pair.
The platform must store this data in a way that supports directed routes and later reuse.
How should travel times and distances be stored?

## Decision Summary
Store travel times and distances as directed origin-destination matrix entries in PostgreSQL.

## Considered Options
- Directed matrix entries in PostgreSQL
- Undirected pair table
- CSV files only
- Recalculate matrix data for every optimization run

## Decision Outcome
Chosen option: **directed matrix entries in PostgreSQL**.

### Justification
- Travel times are directed because `A -> B` can differ from `B -> A` due to one-way streets, turn restrictions, access roads, or traffic assumptions.
- The optimizer requires duration values, especially for time-window constraints.
- Distance is not required for time-window feasibility, but it is useful for reporting, plausibility checks, and later cost analysis.
- PostgreSQL persistence makes the matrix reusable and auditable.
- Storing matrix run metadata separately from matrix entries allows the project to record provider, calculation time, and assumptions.

## Consequences
### Good
- The matrix can be reused across optimization runs.
- Directed travel times are represented correctly.
- Distance and duration are available for reporting and validation.
- Matrix data can be linked to a specific calculation run.

### Bad
- The table can grow quickly because a full directed matrix needs approximately `n * (n - 1)` entries.
- Matrix data must be regenerated when relevant input data changes.
- Additional schema design is required for matrix run metadata and entries.
