# ADR-0007: Which database should be used as the system of record?

- **Date:** 2026-04-14
- **Status:** Accepted
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The platform manages customers, addresses, geocoding results, delivery profiles, vehicles, and optimization-related metadata.
These entities are strongly related and must remain consistent across customer review, geocoding, and route planning workflows.
Which database should be used as the system of record?

## Decision Summary
Use PostgreSQL with a relational data model as the system of record.

## Considered Options
- PostgreSQL with a relational data model
- MySQL or MariaDB with a relational data model
- NoSQL document database
- File-based storage

## Decision Outcome
Chosen option: **PostgreSQL with a relational data model**.

### Justification
- The domain contains strongly related entities that benefit from foreign keys and referential integrity.
- Customer, address, delivery profile, vehicle, and matrix data can be modeled explicitly.
- Multi-table updates require transactional consistency.
- PostgreSQL is mature, well-supported, and suitable for both local development and cloud deployment.
- The chosen approach leaves room for future extensions such as geospatial capabilities if they become necessary.

## Consequences
### Good
- The data model is clear and strongly aligned with the business domain.
- Referential integrity and transactions support reliable operational updates.
- The database design remains understandable for development, debugging, and thesis documentation.

### Bad
- Schema changes require more discipline than schema-less storage.
- Relational modeling adds upfront design effort.
- If future requirements become highly schema-volatile, the approach may become less flexible.
