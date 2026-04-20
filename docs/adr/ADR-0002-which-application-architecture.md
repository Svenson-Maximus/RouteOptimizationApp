# ADR-0002: Which application architecture?

- **Date:** 2026-04-14
- **Status:** Accepted
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The platform must support customer review, address validation, geocoding preparation, travel-time matrix handling, and route optimization.
The system needs a structure that separates user interaction, business workflows, optimization logic, and persistent data.
Which application architecture should be used?

## Decision Summary
Use a 3-layer architecture with a presentation layer, a business logic layer, and a data layer.
Implement the business logic layer as microservices for customer master data, geocoding, optimization orchestration, and optimization execution.

## Considered Options
- 3-layer architecture with microservices in the business logic layer
- Single monolithic application

## Decision Outcome
Chosen option: **3-layer architecture with microservices in the business logic layer**.

### Justification
- The presentation layer can focus on customer review, address validation, and optimization configuration.
- The business logic layer can coordinate customer data, geocoding, matrix preparation, and optimization workflows through separate services.
- The data layer can manage PostgreSQL persistence for customers, addresses, delivery profiles, vehicles, and route-planning data.
- Microservices in the business logic layer fit the production-like project goal and make the main responsibilities visible: data integration, customer master data, geocoding, optimization orchestration, and route optimization.
- The separation also matches the technical split between Java business services and the Python optimization engine.
- The structure is understandable for the project scope and clear enough for thesis documentation.
- The architecture supports local development and later cloud deployment without changing the conceptual system structure.
- A single monolithic application was not selected because customer workflows, geocoding, optimization orchestration, and the optimizer runtime have different responsibilities and technology needs.

## Consequences
### Good
- Responsibilities are clearly separated.
- The architecture remains understandable for stakeholders and maintainers.
- The frontend, services, optimizer, and database can evolve independently.
- The architecture can be deployed locally as containers and mapped to cloud services later.

### Bad
- Interfaces between layers must be documented and kept consistent.
- The structure adds more components than a single monolithic prototype.
- Microservices add operational and integration overhead compared with one application.
