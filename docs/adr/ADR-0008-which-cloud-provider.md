# ADR-0008: Which cloud provider?

- **Date:** 2026-04-14
- **Status:** Accepted
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The platform should have a realistic target deployment model for frontend hosting, containerized services, managed database hosting, secret management, and observability.
The selected provider should support a production-like deployment without requiring unnecessary operational complexity for the project.
Which cloud provider should be used?

## Decision Summary
Use AWS as the target cloud provider.

## Considered Options
- AWS
- Azure
- Google Cloud
- Local-only deployment

## Decision Outcome
Chosen option: **AWS**.

### Justification
- AWS provides mature managed services for the required deployment needs.
- S3 and CloudFront fit static frontend hosting.
- ECS Fargate fits containerized backend and optimizer workloads.
- RDS PostgreSQL fits managed relational database hosting.
- Secrets Manager and CloudWatch support secret handling and operational visibility.
- The existing repository already contains an AWS infrastructure blueprint.
- Azure was not selected because the repository and deployment notes are already aligned with AWS services.
- Google Cloud was not selected because using Google Maps Platform does not require hosting the application on Google Cloud.
- Local-only deployment was not selected because the project should still describe a realistic cloud target model.

## Consequences
### Good
- The target deployment model is realistic and production-like.
- Managed services reduce the amount of infrastructure that must be operated directly.
- The same container images can be used locally and in the cloud.

### Bad
- The architecture becomes partially provider-specific.
- AWS knowledge is required for deployment and operations.
- Cloud costs and security configuration must be managed carefully.
