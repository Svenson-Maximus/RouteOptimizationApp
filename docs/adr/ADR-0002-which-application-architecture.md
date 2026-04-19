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

## Considered Options
- 3-layer architecture
- Single monolithic application
- Event-driven architecture as the primary structure
- Client-only application with direct database access

## Decision Outcome
Chosen option: **3-layer architecture**.

### Justification
- The presentation layer can focus on customer review, address validation, and optimization configuration.
- The business logic layer can coordinate customer data, geocoding, matrix preparation, and optimization workflows.
- The data layer can manage PostgreSQL persistence for customers, addresses, delivery profiles, vehicles, and route-planning data.
- The structure is understandable for the project scope and clear enough for thesis documentation.
- The architecture supports local development and later cloud deployment without changing the conceptual system structure.
- A single monolithic application was not selected because frontend, business workflows, optimization, and persistence have different responsibilities.
- Event-driven architecture was not selected as the primary structure because it would add unnecessary complexity for the current project scope.
- Client-only database access was not selected because it would bypass the business logic layer and weaken validation and security boundaries.

## Consequences
### Good
- Responsibilities are clearly separated.
- The architecture remains understandable for stakeholders and maintainers.
- The frontend, services, optimizer, and database can evolve independently.

### Bad
- Interfaces between layers must be documented and kept consistent.
- The structure adds more components than a single monolithic prototype.
