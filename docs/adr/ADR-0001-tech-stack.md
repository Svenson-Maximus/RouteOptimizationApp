# ADR-0001: Technology and Architecture Baseline for the Bakery Optimization Platform

- Date: 2026-02-17
- Status: Accepted
- Deciders: Solution Architect (Student), Product Owner (Bakery Owner)

## Decision Summary
- Use a 3-layer architecture with microservices in the business logic layer.
- Use React for the frontend and Java (Spring Boot) for business services.
- Use Python + Google OR-Tools for CVRPTW optimization.
- Use relational PostgreSQL (AWS RDS in cloud) as the system of record.
- Use Flyway for versioned, reproducible SQL schema migrations.


## Context and Problem Statement
The master focus project evolves a prior VRPTW prototype into a production-like platform:
- Excel-based customer/delivery input must be imported into a database.
- Addresses must be cleaned/validated and geocoded (Google Maps).
- An optimization service must solve CVRPTW (capacity + time windows) with Google OR-Tools.
- A frontend is required for address correction and to trigger/inspect optimizations.


**Decision question:** Which stack and architecture baseline should be used to build a production-like platform with reliable data quality and optimization workflows?

## Decision Drivers
- Maintainability and extensibility (microservices, clear boundaries)
- Integration capability (Google Maps APIs, OR-Tools)
- Cost awareness (cloud and API usage)
- Operability (CI/CD, logging/monitoring, containerization)
- Career alignment (Zurich market demand)
- Data correctness and traceability (import, cleansing, geocoding auditability)

## Considered Options
1. **AWS + React + PostgreSQL + Java (Spring Boot) + Python for Optimization**
2. Azure + Angular + PostgreSQL + Java (Spring Boot)


## Decision Outcome
Chosen baseline:
- **Frontend:** React
- **Business services:** Java (Spring Boot), split into microservices in a 3-layer architecture
- **Optimization engine:** Python + Google OR-Tools
- **Database:** **relational PostgreSQL** (AWS RDS in cloud)
- **Schema evolution:** **Flyway SQL migrations**
- **Cloud runtime:** AWS (ECS/Fargate, S3, RDS)

**Justification**
- React + Spring Boot for APIs is a common enterprise pairing in Zurich and supports layered + microservice architecture well.
- A **relational DB (PostgreSQL)** fits the domain (customers, addresses, geocodes, imports, optimization runs) and enforces strong consistency with clear relationships.
- Python is the most pragmatic choice for OR-Tools and optimization experimentation, while Java services handle integration, workflows, and API management.
- AWS provides mature managed services (RDS for PostgreSQL, ECS/Fargate for containers, and S3 for file uploads such as Excel sources) and broad market adoption.
- **Flyway** keeps schema changes versioned and reproducible across local/dev/prod, reducing drift and enabling auditable DB evolution.

### Architecture Scope
- **Layer 1 (Presentation):** address validation/operations UI.
- **Layer 2 (Business Logic):** data integration, customer master, geocoding, optimization orchestrator microservices.
- **Layer 3 (Data/Infrastructure):** PostgreSQL + Flyway + storage/infrastructure services.

### Consequences
**Good**
- Clear separation of concerns: UI (React), business/integration services (Java), optimization engine (Python).
- Good portfolio for Zurich: cloud + microservices + data pipeline + optimization.
- PostgreSQL supports both structured data and flexible JSON needs; PostGIS and pgvector can be added later if required.
- Flyway gives controlled, repeatable schema rollout with migration history in Git.
- Container-based deployment (ECS/Fargate).

**Bad**
- Google Maps API introduces cost and external dependency risks.

**Neutral / Trade-offs**
- Some functionality might be faster to prototype entirely in Python; we accept Java to strengthen enterprise alignment and service structure.


