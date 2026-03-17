# ADR-0002: Technology and Architecture Baseline for the Bakery Optimization Platform

- **Date:** 2026-02-17
- **Status:** Accepted
- **Deciders:** Student, Product Owner (Bakery Owner)

## Context and Problem Statement
The platform must support customer review, address correction, geocoding, and route optimization in a way that is maintainable, production-like, and aligned with the thesis scope.
The optimization target in this project is a **Capacitated Vehicle Routing Problem with Time Windows (CVRPTW)**, so the architecture must support the preparation and orchestration of route-planning inputs under capacity and delivery-time constraints.
Which overall technology and architecture baseline should be used for the Bakery Optimization Platform?

## Decision Summary
Use a React frontend, Java Spring Boot business services, a Python optimization engine for the CVRPTW, PostgreSQL as the system of record, and AWS as the target cloud environment.

## Considered Options
- AWS + React + PostgreSQL + Java (Spring Boot) + Python for optimization
- Azure + Angular + PostgreSQL + Java (Spring Boot)

## Decision Outcome
Chosen option: **AWS + React + PostgreSQL + Java (Spring Boot) + Python for optimization**.

### Justification
- React and Spring Boot provide a pragmatic and widely used enterprise stack.
- Java is suitable for service orchestration, APIs, and integration workflows.
- Python is the most practical choice for OR-Tools-based CVRPTW optimization.
- PostgreSQL fits the strongly related operational data model and supports transactional consistency.
- AWS provides mature managed services that fit the target production-like deployment model.
- The chosen stack supports clear separation between UI, operational services, and optimization logic.

## Consequences
### Good
- Clear separation between presentation, service orchestration, optimization logic, and persistence.
- Good fit for the operational workflows around customers, geocoding, and CVRPTW routing.
- Strong alignment with enterprise-oriented technologies and deployment patterns.
- The architecture can evolve toward a realistic cloud deployment model.

### Bad
- A polyglot stack increases implementation and operational complexity.
- Microservice-style boundaries introduce overhead for a project of limited scope.
- AWS-specific assumptions may need revision if the deployment target changes.
