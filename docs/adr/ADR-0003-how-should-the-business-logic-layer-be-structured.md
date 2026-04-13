# ADR-0003: How should the business logic layer be structured?

- **Date:** 2026-04-14
- **Status:** Accepted
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The business logic layer must handle different responsibilities: customer master data, address validation, geocoding integration, optimization orchestration, and route optimization.
These responsibilities have different implementation needs and can change independently.
How should the business logic layer be structured?

## Decision Summary
Structure the business logic layer as multiple focused services instead of one single service.

## Considered Options
- Focused services in the business logic layer
- One monolithic backend service
- Direct frontend integration with all external APIs
- Fully event-driven microservice architecture

## Decision Outcome
Chosen option: **focused services in the business logic layer**.

### Justification
- Customer data management, geocoding, orchestration, and optimization have different responsibilities.
- The route optimization engine benefits from being separated because it uses a Python optimization runtime.
- Service boundaries make it easier to document responsibilities in architecture diagrams.
- The approach matches the existing repository structure with customer, geocoding, orchestration, and optimization components.
- The scope stays pragmatic because the services are focused but do not require a complex distributed platform.

## Consequences
### Good
- Responsibilities are easier to understand and test separately.
- The Python optimizer can evolve independently from Java business services.
- The service structure maps well to containerized deployment.

### Bad
- Service interfaces must be defined and maintained.
- Local development requires running multiple components.
- Distributed service boundaries add operational complexity compared with a single backend.
