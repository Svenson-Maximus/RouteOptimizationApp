# ADR-0008: How should the platform be operated?

- **Date:** 2026-04-14
- **Status:** Proposed
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The platform must be runnable locally for development and demonstrable in a realistic cloud deployment model.
The operational model should describe how the frontend, business services, optimizer, database, secrets, and monitoring are deployed and operated.
How should the platform be operated?

## Decision Summary
Run the platform locally with Docker Compose and local development servers, and use a cloud deployment model based on static frontend hosting, containerized services, managed PostgreSQL, managed secrets, and centralized logging.

## Considered Options
- Local Docker Compose plus cloud-managed services
- Local-only deployment
- Cloud-only development environment
- Single virtual machine deployment

## Decision Outcome
Chosen option: **local Docker Compose plus cloud-managed services**.

### Justification
- Local development remains practical because PostgreSQL and supporting infrastructure can run with Docker Compose.
- Docker has strong market value and fits the local/cloud bridge: the Stack Overflow Developer Survey 2025 lists Docker usage among professional developers at 73.8% in the cloud development category: https://survey.stackoverflow.co/2025/technology
- Frontend and backend services can be started independently during development.
- Containerized services map naturally to cloud container hosting.
- A managed database reduces operational responsibility compared with running PostgreSQL manually on a virtual machine.
- Managed secrets and logging are required for a production-like model.
- Local-only deployment was not selected because the project also needs a target cloud operating model.
- Cloud-only development was not selected because local development must remain possible without cloud resources.
- A single virtual machine was not selected because it would mix frontend hosting, services, database, secrets, and logging too tightly.

## Consequences
### Good
- Developers can run the system locally without depending on cloud resources.
- The target cloud model stays close to the containerized service structure.
- The operational model supports separate concerns for frontend hosting, services, database, secrets, and logging.

### Bad
- Local and cloud environments must be kept aligned.
- Configuration management becomes more important.
- The cloud model still requires deployment and monitoring effort.
