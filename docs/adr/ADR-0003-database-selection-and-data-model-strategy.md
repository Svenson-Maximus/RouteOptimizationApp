# ADR-0003: Database Selection and Data Model Strategy

- **Date:** 2026-03-05
- **Status:** Accepted
- **Deciders:** Student

## Context and Problem Statement
The platform manages customers, addresses, geocoding results, delivery profiles, and routing metadata that are strongly related and must remain consistent.
Which database technology and data model strategy should be used as the system of record for the platform?

## Decision Summary
Use PostgreSQL with a relational data model as the system of record.

## Considered Options
- PostgreSQL with a relational data model
- NoSQL-only approach

## Decision Outcome
Chosen option: **PostgreSQL with a relational data model**.

### Justification
- The domain contains strongly related entities that benefit from foreign keys and referential integrity.
- Multi-table updates require transactional consistency.
- The relational model fits the operational workflows around customers, addresses, geocoding, and route planning readiness.
- PostgreSQL is mature, well-supported, and suitable for both local development and cloud deployment.
- The chosen approach leaves room for future extensions such as geospatial capabilities if they become necessary.

## Consequences
### Good
- The data model is clear and strongly aligned with the business domain.
- Referential integrity and transactions support reliable operational updates.
- The database design remains understandable for development, debugging, and thesis documentation.

### Bad
- Schema changes require more discipline than in schema-less approaches.
- Relational modeling adds upfront design effort.
- If future requirements become highly schema-volatile, the approach may become less flexible.
