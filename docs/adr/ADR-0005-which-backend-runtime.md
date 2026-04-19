# ADR-0005: Which backend runtime?

- **Date:** 2026-04-14
- **Status:** Accepted
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The business services must expose APIs, manage customer data workflows, integrate with PostgreSQL, and coordinate geocoding and optimization preparation.
The runtime should support maintainable service development and fit an enterprise-oriented architecture.
Which backend runtime should be used?

## Decision Summary
Use Java with Spring Boot for business services.

## Considered Options
- Java with Spring Boot
- Node.js with Express or NestJS
- Python with FastAPI
- Serverless functions as the main backend runtime

## Decision Outcome
Chosen option: **Java with Spring Boot**.

### Justification
- Spring Boot is well suited for HTTP APIs, service orchestration, validation logic, and database integration.
- Java provides a stable runtime for business workflows and structured application code.
- Spring Boot works well with PostgreSQL, Flyway, and containerized deployment.
- Separating Java business services from the Python optimizer keeps operational workflows distinct from optimization logic.
- The existing customer master service already uses Spring Boot.
- Node.js was not selected because Spring Boot better fits the enterprise-style service and database workflow used in this project.
- Python with FastAPI was not selected for business services because Python is reserved for optimization, keeping service responsibilities clearer.
- Serverless functions were not selected as the main backend runtime because the project needs stateful service workflows and local development simplicity.

## Consequences
### Good
- Business services can use mature Java and Spring infrastructure.
- Database migrations, configuration, and API development are well supported.
- The backend runtime is suitable for a production-like service architecture.

### Bad
- Java adds more setup than a lightweight scripting runtime.
- The project uses multiple languages because optimization is handled in Python.
