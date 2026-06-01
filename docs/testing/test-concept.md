# Test Concept

## 1. Introduction and Objective

This test concept defines the testing strategy for the Route Optimization App. It is maintained as a living Markdown document in the repository so that changes to architecture, scope, risks, or automation can be versioned together with the source code.

The structure is based on:

- ISTQB test management principles: test planning, test strategy, test levels, risk-based testing, and iterative refinement. Source: [ISTQB Certified Tester Foundation Level syllabus](https://www.istqb.org/certifications/certified-tester-foundation-level).
- IEEE 829-style master test plan contents: scope, test items, test approach, test environment, responsibilities, risks, deliverables, and acceptance criteria. Source: [IEEE 829-2008 Software and System Test Documentation](https://standards.ieee.org/ieee/829/3787/).
- A pragmatic agile test concept approach: concise documentation, updated during development, with automated tests in CI where possible.

The objective is to find defects early, protect the most important architecture boundaries, and provide enough evidence for project/thesis documentation without creating a large static document that is not maintained.

## 2. Test Object and Architecture

The system under test is the Route Optimization App:

```text
React frontend
  -> Spring Boot customer master / optimization orchestration API
      -> PostgreSQL with Flyway-managed schema
      -> Python OR-Tools optimizer
          -> persisted travel-time and distance matrix
  -> Google Maps Embed / Google Maps links for route visualization
```

The test concept is aligned with the architecture decisions in the ADRs:

- ADR-0002: 3-layer architecture with microservices in the business logic layer
- ADR-0003: React frontend
- ADR-0004: Java/Spring Boot backend services
- ADR-0005: Python with Google OR-Tools for route optimization
- ADR-0006: PostgreSQL with Flyway migrations
- ADR-0007: AWS as target cloud provider
- ADR-0008: local Docker Compose plus cloud-managed services
- ADR-0009 and ADR-0010: Google Maps Platform and persisted travel-time/distance matrix
- ADR-0011: CVRPTW model with time windows and vehicle capacities

Because the system crosses several technology boundaries, the test strategy puts more weight on integration and contract tests than a simple single-language application would. Because route optimization is the highest-risk part of the system, the optimizer also receives dedicated unit, property, and regression tests.

## 3. Test Scope

### In Scope

- Customer master data editing:
  - delivery address
  - delivery address note
  - delivery profile note
  - weekday selection
  - weekday-specific delivery and pickup demands
  - service times and time windows
- Geocoding review workflow and persisted geocoding results.
- Travel-time and distance matrix usage.
- Route optimization with OR-Tools:
  - CVRPTW constraints
  - search strategy and metaheuristic parameters
  - seed handling for reproducibility
  - dropped-stop handling
  - per-vehicle and total route metrics
- Persistence of complete optimization runs.
- Route visualization and stop table display:
  - route map
  - stop order
  - arrival, waiting, service start, service end, departure
  - demand and remaining capacity
  - delivery address notes
- API contracts between frontend, backend, and optimizer.
- Database migrations relevant to customer data, route matrix data, and optimization-run history.
- Automated CI checks for build, unit tests, and basic test environment validation.

### Out of Scope

- Full load/performance testing.
- Security penetration testing.
- Browser compatibility matrix across many browser versions.
- Automated tests that call live Google APIs in CI.
- Full real-time traffic comparison.
- Full E2E regression suite for every UI workflow.
- Production monitoring and incident-response tests.

These items can be added later if the project scope or deployment risk increases.

## 4. Test Strategy

The project uses a shift-left, risk-based, architecture-driven strategy.

Shift-left means that defects should be found by fast checks before a full browser/database/system run is needed. Risk-based means the optimizer, persistence, and service contracts receive more attention than low-risk display-only behavior. Source for shift-left testing: [IBM, Shift-left testing](https://www.ibm.com/think/topics/shift-left-testing).

As a planning guideline, the project follows an adapted test pyramid:

- 60% unit tests
- 25% integration tests
- 10% contract tests
- 5% end-to-end tests

The percentages are not strict metrics. They describe the intended balance for a React, Spring Boot, PostgreSQL, Python OR-Tools system.

### Test Levels

| Level | Purpose | Status | Examples |
|---|---|---|---|
| Unit tests | Test isolated functions, classes, components, or algorithmic rules. | Implemented partly | React formatter tests, Java DTO/search-configuration test, Python route-time tests. |
| Component tests | Test React components with realistic props and mocked APIs. | Planned | Customer edit form, route stop table, recent runs table. |
| Integration tests | Test collaboration across one technical boundary. | Planned; test database startup exists | Spring + PostgreSQL, Spring invoking optimizer, optimizer reading matrix data. |
| Contract tests | Protect JSON/API/database contracts across languages. | Planned; schema location exists | React-backend response schemas, backend-optimizer result schema, migration expectations. |
| Property tests | Check optimizer invariants over varied inputs. | Planned | Capacity never exceeded, served stops respect time windows, dropped stops are explicit. |
| End-to-end tests | Prove critical user workflows through the full stack. | Planned | Edit customer, calculate route, inspect result and map. |

## 5. Test Design Techniques

The following test design techniques are used or planned:

- Equivalence partitioning:
  - valid and invalid customer addresses
  - complete and incomplete optimization runs
  - active and inactive weekday customers
- Boundary value analysis:
  - time-window start/end boundaries
  - service time limits
  - vehicle capacity limits
  - Google Maps route point limits
- Decision table testing:
  - whether an optimization run is persisted as good/recent
  - whether a customer is eligible for a selected weekday
  - whether route visualization can be shown or needs a fallback
- Use-case testing:
  - customer edits data
  - planner calculates route
  - driver opens a stop in Google Maps
- Contract/schema testing:
  - backend response shapes
  - optimizer JSON result shape
  - shared schema files under `shared/contracts`
- Regression testing:
  - every relevant bug or professor-review finding gets a regression test where practical.
- Property-based testing for optimizer behavior:
  - no capacity violation
  - no duplicate served stop
  - time windows respected
  - dropped stops explicitly reported

## 6. Test Environment and Tools

### Repository Test Structure

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

shared/
  contracts/

test-fixtures/
  example-inputs/
  expected-outputs/
  mock-api-responses/

docker-compose.test.yml
.github/workflows/test-pipeline.yml
```

### Tools

| Area | Tool | Status |
|---|---|---|
| Frontend build | Vite | Implemented |
| Frontend unit tests | Node assertions | Implemented for formatter tests |
| Backend tests | JUnit 5, AssertJ, Spring Boot test support | Implemented for basic unit test; broader suite planned |
| Optimizer unit tests | Python unittest | Implemented for route-time tests |
| Optimizer property/regression tests | pytest, Hypothesis | Planned |
| Test database | PostgreSQL via Docker Compose | Implemented as environment startup/config validation |
| CI | GitHub Actions | Implemented for build and unit tests |
| Contracts | JSON Schema in `shared/contracts` | Schema exists; automated validation planned |
| E2E | Playwright | Planned |
| AWS cloud hosting | S3/CloudFront, ECS Fargate, RDS PostgreSQL, Secrets Manager, CloudWatch | Planned target deployment according to ADR-0007 |

### Environment Rules

- Automated CI tests must not call live Google APIs.
- API keys and secrets must not be committed.
- Test data must be deterministic and safe to commit.
- Production data must not be used in automated tests.
- Google Maps rendering is checked manually or as a smoke check only.
- The isolated test database is defined in `docker-compose.test.yml`.

### Environment Stages

| Stage | Purpose | Status |
|---|---|---|
| Local development | Run frontend, backend, optimizer, and PostgreSQL locally for implementation and manual checks. | Implemented |
| CI test environment | Run build checks, unit tests, and test database startup in GitHub Actions. | Implemented partly |
| Staging | AWS-hosted pre-production environment for deployment smoke tests and acceptance checks before production. | Planned |
| Production | AWS-hosted target environment for real use. | Planned |

Staging and production are included as planned environments because the target deployment model is AWS-based. They are not required for the current local/CI unit-test workflow but should be considered before a production deployment.

## 7. Test Phases and CI Schedule

### Current CI Pipeline

The GitHub Actions workflow is located at:

```text
.github/workflows/test-pipeline.yml
```

On every push and pull request, the `unit-tests` job runs:

```text
Frontend:
- npm ci
- npm run build
- npm test

Backend:
- bash ./gradlew test

Optimizer:
- python -m py_compile ...
- python -m unittest discover ...
```

The `integration` job currently validates that the isolated PostgreSQL test environment can start:

```text
docker compose -f docker-compose.test.yml up -d postgres-test
docker compose -f docker-compose.test.yml ps
```

### Planned Extensions

On merge to main:

- Spring integration tests with PostgreSQL.
- Backend-optimizer integration test with fixed fixture input.
- Contract validation against `shared/contracts`.

Before demo/release:

- Optimizer regression tests with historical/fixed datasets.
- E2E smoke test for the critical route-calculation workflow.
- Manual smoke check of Google Maps visualization.

## 8. Roles and Responsibilities

This is a one-person student/project repository.

| Role | Responsible Person | Responsibility |
|---|---|---|
| Developer | Sven Leutenegger | Implements frontend, backend, optimizer, database migrations, and tests. |
| Test responsible | Sven Leutenegger | Maintains this test concept, test structure, fixtures, and CI pipeline. |
| Test automation | Sven Leutenegger | Implements automated unit, integration, contract, and future E2E tests. |
| Product/stakeholder review | Supervisor/professor | Reviews scope, quality expectations, and thesis/project outcomes. |
| Acceptance decision | Supervisor/professor and project context | Gives feedback or acceptance based on project requirements and demonstration. |

Because the same person develops and tests, automated tests, CI, fixtures, and regression tests are important safeguards against confirmation bias.

## 9. Risks and Assumptions

| Risk | Example Failure | Mitigation |
|---|---|---|
| Customer data is persisted incorrectly | Delivery address note overwrites profile note. | Backend integration tests and frontend component tests. |
| Weekday demand is wrong | Monday route uses Tuesday delivery or pickup values. | Backend integration and optimizer regression tests. |
| Java/Python contract changes | Backend cannot parse optimizer result. | JSON schema contract tests. |
| Dropped stops are treated as good runs | Incomplete route appears in Recent Runs. | Backend unit/integration tests and regression test. |
| Capacity logic is wrong | Vehicle route exceeds capacity or UI shows wrong remaining load. | Optimizer property tests and frontend component tests. |
| Time-window logic is wrong | Waiting time is assigned to the wrong stop. | Optimizer unit/regression tests. |
| Route metrics are incomplete | Vehicle duration or distance is missing from API/UI. | Contract tests and frontend component tests. |
| Google API dependency becomes flaky or costly | CI repeatedly calls live Google APIs. | Mocked responses and persisted matrix fixtures. |
| Database schema drifts from code | Migration misses required column. | Flyway integration tests. |
| One-person project bias | Developer misses defects in own implementation. | CI, regression tests, code review by supervisor where possible. |

Assumptions:

- PostgreSQL remains the system of record.
- The first route matrix is persisted and reused for optimization runs.
- The project does not require live-traffic optimization in automated tests.
- Google API calls are backend responsibilities and are not part of normal CI.
- The application is developed and tested incrementally.

## 10. Acceptance Criteria and Definition of Done

A feature is considered complete when:

- New pure logic has unit tests.
- Changed service/database behavior has integration tests where practical.
- API or optimizer response changes update the relevant contract schema or fixture.
- Critical UI behavior is covered by component or E2E tests where practical.
- Existing verification commands pass locally or in CI.
- Bugs and professor-review findings receive regression tests where practical.
- Tests do not require live third-party APIs unless explicitly marked as manual or smoke tests.

Testing for a feature can be accepted when:

- CI is green for the relevant changed areas.
- No known critical bug remains open for the feature.
- Manual smoke testing confirms the main user workflow if the feature is UI-heavy.
- Out-of-scope items are explicitly documented and not hidden as missing work.

## 11. Test Deliverables

The project test deliverables are:

- `docs/testing/test-concept.md`: this living test concept.
- `.github/workflows/test-pipeline.yml`: automated CI pipeline.
- `docker-compose.test.yml`: isolated test database environment.
- `shared/contracts/`: contract schemas.
- `test-fixtures/`: reusable test data.
- Unit test files in frontend, backend, and optimizer modules.
- Future integration, contract, regression, property, and E2E tests.
- CI run results in GitHub Actions.

## 12. Current Verification Commands

```powershell
# Backend unit tests
.\gradlew.bat test

# Frontend build and unit tests
npm run build
npm test

# Optimizer syntax check
.conda\envs\route-optimizer\python.exe -m py_compile apps\optimizer\route-optimization-engine\src\main.py apps\optimizer\route-optimization-engine\src\route_time.py

# Optimizer unit tests
$env:PYTHONPATH='apps\optimizer\route-optimization-engine\src'
.conda\envs\route-optimizer\python.exe -m unittest discover -s apps\optimizer\route-optimization-engine\tests\unit -p "test_*.py"

# Test Docker Compose validation
docker compose -f docker-compose.test.yml config
```

Planned commands:

```powershell
# Frontend E2E tests
npx playwright test

# Optimizer property/regression tests
pytest
```

## 13. Glossary

| Term | Meaning |
|---|---|
| Test concept | Master document describing scope, approach, resources, responsibilities, risks, and acceptance criteria. |
| Test plan | Concrete schedule and execution plan for a test level or release. |
| Test case / test script | Detailed executable or manual check with inputs and expected results. |
| Contract test | Test that verifies an API or JSON schema between components. |
| Regression test | Test that prevents a previously fixed defect from returning. |
| CVRPTW | Capacitated Vehicle Routing Problem with Time Windows. |
| Seed | Search parameter used to improve reproducibility where solver behavior uses randomness. |

## 14. Maintenance

This test concept is maintained together with the source code. Since this is a one-person project, no formal review workflow is required.

The document is updated when the architecture, test scope, CI pipeline, optimizer model, or relevant project risks change. Supervisor feedback is incorporated when it affects testing scope or quality expectations.
