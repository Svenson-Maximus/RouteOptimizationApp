# ADR 0001 - Record Architecture Baseline

- Date: 2026-03-05
- Status: Accepted

## Decision
Use a 3-layer architecture with microservices in the business layer.

## Scope
- Frontend for address correction and operations
- Business services for import, customer data, geocoding, orchestration
- Python optimization engine for CVRPTW
- Relational PostgreSQL with Flyway migrations

## Rationale
- Clear service boundaries
- Better maintainability and testability
- Good fit for cloud deployment on AWS
