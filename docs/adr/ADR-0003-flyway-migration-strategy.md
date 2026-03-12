# ADR-0003: Flyway Migration Strategy for PostgreSQL

- Date: 2026-03-05
- Status: Accepted
- Deciders: Solution Architect (Student)

## Context
The platform depends on a relational PostgreSQL schema shared across services (customers, addresses, geocodes, imports, optimization runs).
Schema changes must be repeatable and auditable across local, dev, and cloud environments.

## Decision
Use **Flyway** for versioned SQL migrations.

## Rules
- Keep migration scripts in each schema-owning service under `db/migration`.
- Use ordered naming: `V1__init_schema.sql`, `V2__add_index.sql`, etc.
- Apply migrations automatically at service startup in non-production environments.
- Track migration files in Git as part of normal code review.

## Consequences
**Positive**
- Reproducible schema rollout across environments.
- Clear database change history.
- Reduced schema drift and manual DB edits.

**Trade-off**
- Must follow migration discipline (no unmanaged manual changes).
