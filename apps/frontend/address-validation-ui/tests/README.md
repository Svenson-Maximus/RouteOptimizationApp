# Frontend Test Structure

React tests are grouped by test size:

- `unit`: pure helpers and formatting logic.
- `component`: isolated React components with mocked props.
- `integration`: pages/use cases with mocked backend APIs.
- `e2e`: browser flows against a running test stack.

Recommended tools:

- Vitest
- React Testing Library
- MSW for mocked APIs
- Playwright for E2E smoke tests
