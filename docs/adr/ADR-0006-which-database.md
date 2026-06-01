# ADR-0006: Which database?

- **Date:** 2026-04-14
- **Status:** Accepted
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The platform manages customers, addresses, geocoding results, delivery profiles, vehicles, and optimization-related metadata.
These entities are strongly related and must remain consistent across customer review, geocoding, and route planning workflows.
Which database should be used?

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
- PostgreSQL has strong market value: the Stack Overflow Developer Survey 2025 lists PostgreSQL as the most used database among professional developers at 58.2%, and DB-Engines ranks PostgreSQL fourth overall in April 2026: https://survey.stackoverflow.co/2025/technology and https://db-engines.com/en/ranking
- The chosen approach leaves room for future extensions such as geospatial capabilities if they become necessary.
- MySQL or MariaDB were not selected because PostgreSQL provides a strong fit for structured relational data and leaves room for future geospatial extensions.
- A NoSQL document database was not selected because the domain is strongly relational and needs referential integrity.
- File-based storage was not selected because the platform needs consistent updates and queryable operational data.

## Consequences
### Good
- The data model is clear and strongly aligned with the business domain.
- Referential integrity and transactions support reliable operational updates.
- The database design remains understandable for development, debugging, and thesis documentation.

### Bad
- Schema changes require more discipline than schema-less storage.
- Relational modeling adds upfront design effort.
- If future requirements become highly schema-volatile, the approach may become less flexible.
