# ADR-0001: Technology and Architecture Baseline for the Bakery Optimization Platform

- **Date:** 2026-02-17
- **Status:** Accepted
- **Deciders:** Student, Product Owner (Bakery Owner)

## Concern
The platform must support address correction, geocoding review, and route optimization in a way that is maintainable, production-like, and aligned with the thesis scope. This concern is driven by the needs for clear system boundaries, reliable operational workflows, and an architecture that can evolve toward cloud deployment.

## Decision Issue
Which overall technology and architecture baseline should be used for the Bakery Optimization Platform?

## Alternatives
1. **AWS + React + PostgreSQL + Java (Spring Boot) + Python for optimization**
2. **Azure + Angular + PostgreSQL + Java (Spring Boot)**

## Outcome
The chosen alternative is:
- **Architecture:** 3-layer architecture with business logic split into microservices
- **Frontend:** React
- **Business services:** Java with Spring Boot
- **Optimization engine:** Python with Google OR-Tools
- **System of record:** PostgreSQL
- **Cloud runtime target:** AWS (ECS/Fargate, RDS, S3)

## Rationale
- React and Spring Boot provide a pragmatic and widely used enterprise stack.
- Java is suitable for service orchestration, APIs, and integration workflows.
- Python is the most practical choice for OR-Tools-based optimization.
- PostgreSQL fits the strongly related operational data model and supports transactional consistency.
- AWS provides mature managed services that fit the target production-like deployment model.
- The chosen stack supports clear separation between UI, operational services, and optimization logic.

## Constraints And Revision Conditions
- This rationale assumes the project remains focused on a single bakery optimization domain with moderate system scale.
- If the deployment target changes substantially, the cloud-specific part of this decision should be revisited.
- If service boundaries create unnecessary complexity for the actual implementation scope, the architecture may need to be simplified.

## Architecture Rationale
The selected baseline balances thesis goals, implementation practicality, and long-term extensibility. It supports operational workflows around customer data, geocoding, and optimization without forcing all concerns into a single technology stack.

## Affected Architecture Description Elements
- Presentation layer
- Business service layer
- Optimization engine
- Data and infrastructure layer
