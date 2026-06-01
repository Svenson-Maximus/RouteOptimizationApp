# ADR-0007: Which cloud provider?

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
- AWS has strong market value: the Stack Overflow Developer Survey 2025 lists AWS as the most used cloud platform among professional developers at 45.9%, and Synergy Research Group reported AWS as the leading cloud infrastructure provider with 28% worldwide market share in Q4 2025: https://survey.stackoverflow.co/2025/technology and https://www.srgresearch.com/articles/genai-helps-drive-quarterly-cloud-revenues-to-119-billion-as-growth-rate-jumped-yet-again-in-q4
- S3 and CloudFront fit static frontend hosting.
- ECS Fargate fits containerized backend and optimizer workloads.
- RDS PostgreSQL fits managed relational database hosting.
- Secrets Manager and CloudWatch support secret handling and operational visibility.
- AWS was also selected as a learning goal: Google Cloud would have been a natural and possibly simpler provider choice because the project already uses Google Maps Platform and I am more familiar with Google Cloud. Using AWS broadens the technical scope and builds practical AWS deployment experience.
- Azure was not selected because it does not provide a stronger project-specific advantage than AWS for the required hosting model.
- Google Cloud was not selected even though it would integrate naturally with Google Maps Platform and would likely have been easier for me. The project intentionally separates map-provider usage from the cloud-hosting learning goal.
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
- Google Cloud might have reduced provider diversity and learning value because Google Maps Platform is already used.
