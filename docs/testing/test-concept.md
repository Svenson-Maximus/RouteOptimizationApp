# Test Concept

## Purpose

The project uses an architecture-driven and risk-based test strategy. The test concept is not only based on a generic test pyramid, but on the concrete system decisions documented in the ADRs:

- ADR-0002: 3-layer architecture with microservices in the business logic layer
- ADR-0003: React frontend
- ADR-0004: Java/Spring Boot backend services
- ADR-0005: Python with Google OR-Tools for route optimization
- ADR-0006: PostgreSQL with Flyway migrations
- ADR-0008: local Docker Compose plus cloud-managed services
- ADR-0009 and ADR-0010: Google Maps Platform, persisted travel-time and distance matrix
- ADR-0011: CVRPTW model with time windows and vehicle capacities

Because the application crosses several technology boundaries, the test strategy puts more weight on integration and contract tests than a simple single-language application would. Because route optimization is the highest-risk part of the system, the optimizer also receives property and regression tests.

## Project Context

The project is developed by a small team in a thesis/project setting. Therefore, the test strategy must be realistic to maintain:

- Prefer fast automated tests for logic that changes often.
- Use integration tests where architecture boundaries create real risk.
- Keep end-to-end tests small and focused on critical workflows.
- Use fixtures and regression tests for optimizer behavior instead of manually checking every route.
- Avoid expensive or flaky tests that depend on live third-party APIs.

As a guideline, the project follows an adapted test pyramid:

- 60% unit tests
- 25% integration tests
- 10% contract tests
- 5% end-to-end tests

This split is intentionally adapted for React, Spring Boot, PostgreSQL, Python OR-Tools, and external map services. The percentages are a planning guideline, not a strict metric.

## System Under Test

```text
React frontend
  -> Spring Boot customer master / optimization orchestration API
      -> PostgreSQL with Flyway-managed schema
      -> Python OR-Tools optimizer
          -> persisted travel-time and distance matrix
  -> Google Maps Embed / Google Maps links for route visualization
```

The frontend does not call Google routing APIs directly. Matrix creation and route optimization are backend/optimizer responsibilities. Route visualization may use Google Maps in the browser, but tests should not depend on live Google map rendering except for optional manual or smoke checks.

## Repository Test Structure

```text
apps/
  frontend/address-validation-ui/
    tests/
      unit/
      component/
      integration/
      e2e/

  optimizer/route-optimization-engine/
    tests/
      unit/
      integration/
      property/
      regression/

  services/customer-master-service/
    src/test/java/ch/hslu/fp2/customermaster/
      unit/
      integration/
      contract/
      e2e/

test-fixtures/
  contracts/
  example-inputs/
  expected-outputs/
  mock-api-responses/

docker-compose.test.yml
ci/test-pipeline.yml
```

## Test Levels

### Unit Tests

Purpose: test one function, class, component, or algorithmic rule in isolation.

Rules:

- No database.
- No network.
- No Docker.
- Deterministic and fast.

Examples:

- React formatting helpers, form state updates, route-table formatting, and capacity display.
- Java validation, DTO mapping, service decisions, and persistence guard logic.
- Python route time formatting, weekday demand selection, matrix validation, capacity calculation, and result mapping.

### Component Tests

Purpose: test React components with realistic props and mocked APIs.

Examples:

- Customer edit form saves delivery address notes, profile notes, weekdays, and daily demands.
- Route planner renders strategy controls, run history, vehicle metrics, maps, and stop tables.
- Stop rows display remaining capacity in decreasing order, for example `100 to 99 / 100`.

### Integration Tests

Purpose: test collaboration across one technical boundary.

Examples:

- Spring service with PostgreSQL and Flyway migrations.
- Spring optimization orchestration invoking the Python optimizer with fixed fixtures.
- Python optimizer reading matrix/customer/vehicle input from a test database or fixture.
- React page using mocked backend API responses.

### Contract Tests

Purpose: protect language and service boundaries.

Contracts:

- React expects the Spring `/api/optimization-runs` and `/api/customers` response shapes.
- Spring expects the Python optimizer JSON result shape.
- Database migrations provide required columns for customers, delivery profiles, matrix entries, vehicles, and optimization-run history.

Preferred implementation:

- JSON Schema for API and optimizer payloads.
- OpenAPI later if the REST API grows.
- Contract fixtures under `test-fixtures/contracts`.

### Property Tests

Purpose: check optimizer invariants over many generated or varied inputs.

Examples:

- No route may exceed vehicle capacity.
- A stop is either served exactly once or reported as dropped.
- If dropped stops are returned, the run must not be persisted as a good/recent run.
- Service start must be inside the configured time window when a stop is served.
- `departureTime` must be greater than or equal to `serviceStartTime`.

### Regression Tests

Purpose: preserve behavior for known bugs, professor-review findings, and fixed route-planning issues.

Examples:

- Waiting time is shown at arrival, not hidden in the previous departure.
- Weekday-specific delivery and pickup demands are used for the selected day.
- `SAVINGS` and `PARALLEL_SAVINGS` remain accepted first-solution strategies.
- Complete runs are persisted; runs with dropped stops are not.
- Total route duration and distance remain present in optimizer and API output.

### End-to-End Tests

Purpose: prove critical user workflows work end to end.

Keep this layer small:

- Edit a customer including delivery address note and weekday demands.
- Calculate a route for one weekday.
- Show route metrics, capacity per stop, and route visualization.
- Persist only complete runs.
- Confirm geocoding suggestion flow.

Run E2E tests against `docker-compose.test.yml` or an equivalent isolated test environment.

## Risk-Based Test Matrix

| Risk | Example Failure | Main Test Type |
|---|---|---|
| Customer data is persisted incorrectly | Delivery address note overwrites profile note | Backend integration, frontend component |
| Weekday demand is wrong | Monday route uses Tuesday delivery or pickup values | Backend integration, optimizer regression |
| Java/Python contract changes | Backend cannot parse optimizer result | Contract test |
| Dropped stops are treated as good runs | Incomplete route appears in Recent Runs | Backend unit/integration, regression |
| Capacity logic is wrong | Vehicle route exceeds capacity or UI shows wrong remaining load | Optimizer property, frontend component |
| Time-window logic is wrong | Vehicle arrives early but waiting is assigned to the wrong stop | Optimizer unit/regression |
| Route metrics are incomplete | Vehicle duration or distance is missing from API/UI | Contract, frontend component |
| Google API dependency becomes flaky or costly | Tests call live Google APIs repeatedly | Mocked integration, manual smoke only |
| Database schema drifts from code | Migration misses required column | Flyway integration, contract |
| Full workflow breaks | User cannot calculate and inspect a route | E2E smoke |

## Critical Test Cases

### Customer Model

- Editing a delivery address persists the address fields.
- Delivery address note and delivery profile note are independent.
- Weekday-specific delivery and pickup demands persist correctly.
- Invalid or missing time windows fail clearly.

### Optimization

- `SAVINGS` and `PARALLEL_SAVINGS` are accepted as first solution strategies.
- `GUIDED_LOCAL_SEARCH`, `TABU_SEARCH`, `SIMULATED_ANNEALING`, `GREEDY_DESCENT`, and `AUTOMATIC` are accepted as local search metaheuristics.
- Route output includes per-vehicle duration and distance.
- Route output includes total duration and total distance.
- Runs with dropped stops are not persisted as recent/good runs.
- A fixed seed produces deterministic output where OR-Tools supports deterministic behavior.
- The selected weekday controls active customers and delivery/pickup demand values.
- Served stops respect time windows and vehicle capacity.

### Route UI

- Recent Runs table loads persisted runs from the backend.
- Recent Runs table shows strategy, metaheuristic, time limit, waiting, seed, duration, and distance.
- Vehicle cards show total time and total distance.
- Stop rows show remaining capacity decreasing, e.g. `100 to 99 / 100`.
- Stop navigation opens Google Maps for that one stop only.
- Route map embeds do not block the core workflow if the Google Maps key is missing.

## Test Data and Fixtures

Fixtures are stored under `test-fixtures/` and should be small, deterministic, and safe to commit.

Required fixture types:

- Example optimization requests.
- Expected optimization summaries.
- Mock backend API responses for React tests.
- JSON Schemas for API and optimizer contracts.
- Small matrix/customer/vehicle datasets for optimizer tests.

Test data should include:

- One depot.
- Two vehicles with capacity `100`.
- Customers with different weekday demands.
- One customer with delivery demand and pickup demand.
- One customer with a narrow time window for waiting behavior.
- One customer with a delivery address note and a separate delivery profile note.
- At least one fixture where a stop would be dropped, to verify that the run is not persisted as good.

## Test Environment

Local development:

- PostgreSQL and supporting infrastructure run through Docker Compose.
- Frontend and backend can run as local development servers.
- Python optimizer can be executed independently for fixture-based tests.

Automated tests:

- Use `docker-compose.test.yml` for an isolated PostgreSQL test database.
- Do not use production data.
- Do not call live Google APIs in normal automated tests.
- Mock Google API responses or use persisted matrix fixtures.
- Keep API keys out of test fixtures and source control.

## Concrete Verification Commands

Current project checks:

```powershell
# Backend
.\gradlew.bat test

# Frontend
npm run build

# Optimizer syntax check
.conda\envs\route-optimizer\python.exe -m py_compile apps\optimizer\route-optimization-engine\src\main.py

# Test Docker Compose validation
docker compose -f docker-compose.test.yml config
```

Planned test commands when the corresponding suites are implemented:

```powershell
# Frontend unit/component tests
npm test

# Frontend E2E tests
npx playwright test

# Optimizer tests
pytest
```

## CI Policy

On every commit:

- Frontend build and unit/component tests.
- Java unit tests.
- Python compile and unit tests.
- Contract validation.

On merge to main:

- Integration tests with database.
- Optimizer regression tests with fixed fixtures.
- E2E smoke tests.

Nightly or before a release/demo:

- Full E2E suite.
- Optimizer performance/regression comparison on historical datasets.
- Optional manual smoke check of Google Maps visualization.

## Definition of Done

A feature is considered complete when:

- New pure logic has unit tests.
- Changed service/database behavior has integration tests.
- API or optimizer response changes update the relevant contract fixtures.
- Critical UI behavior is covered by component or E2E tests.
- Existing verification commands pass.
- Bugs and professor-review findings receive regression tests where practical.
- Tests do not require live third-party APIs unless explicitly marked as manual or smoke tests.

## Bug Policy

Every production bug, route-planning defect, or professor-review finding gets a regression test before the fix is considered complete, unless the case is only a documentation issue or cannot be automated with reasonable effort.
