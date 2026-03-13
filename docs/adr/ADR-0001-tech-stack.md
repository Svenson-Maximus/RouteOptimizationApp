# ADR-0001: Technology and Architecture Baseline for the Bakery Optimization Platform

- **Date:** 2026-02-17
- **Status:** Accepted
- **Deciders:** Student, Product Owner (Bakery Owner)

## Decision Summary
I adopt a production-like baseline stack and architecture:
- **Architecture:** 3-layer architecture; business logic implemented as **microservices**
- **Frontend:** React
- **Business services:** Java (Spring Boot)
- **Optimization engine:** Python + Google OR-Tools (CVRPTW)
- **System of record:** PostgreSQL (AWS RDS in cloud)
- **Schema evolution:** Flyway SQL migrations
- **Cloud runtime (target):** AWS (ECS/Fargate, S3, RDS)

## Context and Problem Statement
The master focus project evolves a prior VRPTW prototype into a production-like platform:

- Addresses must be cleaned/validated and geocoded (Google Maps).
- An optimization service must solve CVRPTW (capacity + time windows) using Google OR-Tools.
- A frontend is required for address correction and to trigger/inspect optimizations.

Current implementation note:
- The working customer dataset already exists in the database.

**Decision question:** Which stack and architecture baseline should be used to build a production-like platform with reliable data quality and optimization workflows?

## Decision Drivers
- Maintainability and extensibility (clear boundaries, service separation)
- Integration capability (Google Maps APIs, OR-Tools)
- Cost awareness (cloud and API usage)
- Operability (CI/CD, logging/monitoring, containerization)
- Career alignment (Zurich market demand)
- Data correctness and traceability (cleansing, geocoding auditability)

## Considered Options
1. **AWS + React + PostgreSQL + Java (Spring Boot) + Python for Optimization**
2. **Azure + Angular + PostgreSQL + Java (Spring Boot)**

## Decision Outcome
### Chosen Baseline
- **Frontend:** React
- **Business services:** Java (Spring Boot), split into microservices within a 3-layer architecture
- **Optimization engine:** Python + Google OR-Tools
- **Database:** relational PostgreSQL (AWS RDS in cloud)
- **Schema evolution:** Flyway SQL migrations
- **Cloud runtime (target):** AWS (ECS/Fargate, S3, RDS)

### Justification
- React + Spring Boot is a common enterprise pairing and supports a layered architecture with microservices.
- A **relational database (PostgreSQL)** matches the domain model (customers, addresses, geocodes, optimization runs) and supports strong consistency and clear relationships.
- Python is the most pragmatic choice for OR-Tools and optimization experimentation; Java services handle integration, workflows, and API management.
- AWS provides mature managed services (RDS for PostgreSQL, ECS/Fargate for containerized services, S3 for operational artifacts).
- Flyway provides versioned, reproducible schema evolution across local/dev/prod and enables traceable database changes.

## Architecture Scope
- **Layer 1 (Presentation):** Address validation/operations UI (React).
- **Layer 2 (Business Logic):** Microservices for customer master, geocoding, and optimization orchestration (Spring Boot); optimization engine service (Python).
- **Layer 3 (Data/Infrastructure):** PostgreSQL (RDS), Flyway migrations, object storage (S3), runtime infrastructure (ECS/Fargate).

## Consequences
### Good
- Clear separation of concerns: UI (React), integration/workflows (Java services), optimization engine (Python).
- Strong portfolio alignment: cloud + microservices + data pipeline + optimization.
- PostgreSQL supports structured relational data and can extend to JSON use cases; PostGIS could be added later if geospatial queries become important.
- Flyway enables controlled schema rollout with migration history in Git.
- Container-based deployment supports repeatable environments and CI/CD.

### Bad
- Google Maps APIs add external dependency and cost risk (quotas, billing, availability).
- Polyglot stack (Java + Python) increases operational complexity (builds, deployments, observability).

### Neutral / Trade-offs
- Some features could be faster to prototype end-to-end in Python; Java is chosen to strengthen enterprise alignment and service structure.
- Microservices introduce overhead (service boundaries, network calls); accepted for learning goals and clear separation, with the option to start “modular monolith” locally and split as needed.

## Notes / Assumptions
- The optimization service consumes travel times/distances produced from geocoding + routing (Google APIs or alternative).
- “Production-like” means CI/CD, container runtime, logging, and reproducible database migrations.
