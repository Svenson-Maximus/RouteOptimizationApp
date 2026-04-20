# ADR-0003: Which frontend framework?

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
- React has strong market value: in the Stack Overflow Developer Survey 2025, React was used by 46.9% of professional developers in the web frameworks category, ahead of Angular and Vue: https://survey.stackoverflow.co/2025/technology
- The component model supports a clear separation of pages, UI components, use cases, and API access.
- React works well with Vite for lightweight local development.
- The existing frontend implementation already uses React.
- React keeps the frontend independent from backend runtime decisions.
- Angular was not selected because it adds more framework structure than the current frontend scope requires and has lower professional-developer usage than React in the survey.
- Vue was not selected because the project already uses React and Vue has lower professional-developer usage than React in the survey.
- A server-rendered Spring Boot UI was not selected because the frontend should remain independent from the backend runtime.

## Consequences
### Good
- The frontend can evolve independently from backend services.
- Interactive workflows can be implemented with reusable components.
- Local development remains lightweight with Vite.

### Bad
- A separate frontend build and deployment pipeline is required.
- API contracts between frontend and backend must be maintained explicitly.
