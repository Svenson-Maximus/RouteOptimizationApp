# ADR-0003: Flyway Migration Strategy for PostgreSQL

- Date: 2026-03-05
- Status: Accepted
- Deciders: Student

## Context
The platform depends on a relational PostgreSQL schema shared across services (customers, addresses, geocodes, optimization runs).
Schema changes must be repeatable and auditable across local, dev, and cloud environments.

## Decision
Use **Flyway** for versioned SQL migrations.

## Rules
- Keep migration scripts in each schema-owning service under `db/migration`.
- Use ordered naming: `V1__init_schema.sql`, `V2__add_index.sql`, etc.
- Apply migrations automatically at service startup in non-production environments.

## Consequences
**Positive**
- Reproducible schema rollout across environments.
- Clear database change history.

**Trade-off**
- Must follow migration discipline (no unmanaged manual changes).
- Not completly necessary when working alone.
