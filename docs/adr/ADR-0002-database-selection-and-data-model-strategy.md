# ADR-0002: Database Selection and Data Model Strategy (PostgreSQL)

- **Date:** 2026-03-05
- **Status:** Accepted
- **Deciders:** Student

## Context
The platform manages strongly related operational entities:
- customers
- customer addresses
- geocoding results and status history
- delivery profiles and weekday constraints
- routing metadata


## Decision
Use **PostgreSQL** as the primary system of record with a **relational data model**.

## Rationale
- Strong referential integrity with foreign keys across core entities.
- Transactional consistency for multi-table updates (for example address + geocode status updates).
- Good fit for structured operational domain and audit-friendly workflows.
- Mature ecosystem and operational support in local and AWS environments.
- Supports future extensions (for example PostGIS if geospatial queries become necessary).

## Alternatives Considered
1. **NoSQL-only approach**
   - Rejected for this phase due to weaker relational guarantees and more complex consistency handling across linked entities.


## Consequences
### Positive
- Clear relational model aligned with business workflows.
- Easier consistency checks and schema governance.
- Better traceability for thesis and production-like operation.

### Trade-offs
- Requires migration discipline for schema changes.
- More upfront modeling than schema-less approaches.

## Follow-up ADRs
- Flyway migration strategy for controlled schema evolution.
