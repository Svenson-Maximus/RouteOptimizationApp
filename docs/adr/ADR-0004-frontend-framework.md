# ADR-0004: Which frontend framework should be used?

- **Date:** 2026-04-14
- **Status:** Accepted
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The platform needs a user interface for reviewing customers, validating addresses, confirming geocoding results, and preparing route optimization runs.
The frontend should support interactive workflows while staying maintainable within the project scope.
Which frontend framework should be used?

## Decision Summary
Use React as the frontend framework.

## Considered Options
- React
- Angular
- Vue
- Server-rendered Spring Boot UI

## Decision Outcome
Chosen option: **React**.

### Justification
- React fits interactive workflows such as address review, validation queues, and optimization configuration.
- The component model supports a clear separation of pages, UI components, use cases, and API access.
- React works well with Vite for lightweight local development.
- The existing frontend implementation already uses React.
- React keeps the frontend independent from backend runtime decisions.

## Consequences
### Good
- The frontend can evolve independently from backend services.
- Interactive workflows can be implemented with reusable components.
- Local development remains lightweight with Vite.

### Bad
- A separate frontend build and deployment pipeline is required.
- API contracts between frontend and backend must be maintained explicitly.
