# Project Overview: Done and TBD

- **Date:** 2026-04-19
- **Repository:** Focus Project 2
- **Scope:** Bakery route optimization platform

## Purpose
This document summarizes the current project state.
It separates completed work from open tasks so the next implementation, modeling, and documentation steps are clear.

## Current Project Focus
The platform prepares operational bakery delivery data for route optimization.
The optimization target is a **Capacitated Vehicle Routing Problem with Time Windows (CVRPTW)**.

The core workflow is:

```text
Customer and delivery data
        -> address validation
        -> geocoding confirmation
        -> one full travel-time and distance matrix
        -> CVRPTW optimization
        -> optimized delivery routes
```

## Done

### Repository Structure
The monorepo structure is in place:

```text
apps/frontend/address-validation-ui
apps/services/customer-master-service
apps/services/geocoding-service
apps/services/optimization-orchestrator-service
apps/optimizer/route-optimization-engine
infra/local
infra/aws
docs/adr
docs/modeling
docs/runbooks
data
legacy
shared
```

The old `docs/architecture` folder was removed because detailed architecture diagrams will be maintained separately in Enterprise Architect.
The `EnterpriseArchitect/` folder was removed from Git and added to `.gitignore`, so EA files remain local and are not pushed to the repository.

### Architectural Decision Records
The ADR set has been split into focused decisions.
ADR titles and filenames are written as questions.
All ADRs use the same structure as ADR-0001.
All ADRs use `Sven Leutenegger` as decider.

Current ADRs:

```text
ADR-0001: How should ADRs be documented?
ADR-0002: Which application architecture?
ADR-0003: How should business logic be structured?
ADR-0004: Which frontend framework?
ADR-0005: Which backend runtime?
ADR-0006: Which optimization runtime?
ADR-0007: Which database?
ADR-0008: Which cloud provider?
ADR-0009: How should the platform be operated?
ADR-0010: Which maps provider?
ADR-0011: When should travel times be requested?
ADR-0012: How should travel data be stored?
ADR-0013: How should customer delivery data be modeled?
ADR-0014: How should vehicles and capacity be modeled?
ADR-0015: How should CVRPTW be modeled?
```

Accepted decisions:

```text
ADR-0001 through ADR-0008
```

Proposed decisions:

```text
ADR-0009 through ADR-0015
```

### Modeling Documentation
A modeling note exists at:

```text
docs/modeling/optimization-data-model.md
```

It documents:

- directed travel-time matrix behavior
- reuse of one full all-customer matrix across weekday-specific optimizations
- why `A -> B` can differ from `B -> A`
- why travel time and distance should be stored together
- a travel matrix class diagram in Mermaid
- customer and vehicle class diagram in Mermaid
- table sketches for matrix runs, matrix entries, depots, vehicles, and vehicle availability
- how Google Maps Platform output connects to OR-Tools input

This document is intended as preparation for later Enterprise Architect class diagrams.

### Frontend
The frontend exists at:

```text
apps/frontend/address-validation-ui
```

Done:

- React + Vite application scaffold
- layered frontend structure:
  - `domain`
  - `application/usecases`
  - `infrastructure/api`
  - `presentation`
- API base URL support via `VITE_API_BASE_URL`
- customer overview UI
- geocoding review UI
- optimization studio preview UI

Current frontend modules:

```text
Customers
Geocoding Desk
Optimization Studio
```

The Optimization Studio is currently a preview and uses mock output.

### Backend
The main implemented backend service is:

```text
apps/services/customer-master-service
```

Done:

- Spring Boot service scaffold
- Java 21 / Gradle setup
- Gradle wrapper files
- PostgreSQL integration via JDBC
- Flyway migration setup
- CORS configuration for frontend development

Implemented endpoints:

```text
GET  /api/customers
GET  /api/customers/validation-queue
POST /api/geocoding/{customerId}/suggest
POST /api/geocoding/{customerId}/confirm
```

The geocoding suggestion endpoint currently returns deterministic mock candidates with source `GOOGLE_MOCK`.

### Database
The current PostgreSQL schema supports:

- customers
- customer addresses
- customer geocodes
- customer delivery profiles
- customer routing metadata

Current route-relevant fields include:

- validation status
- geocode data
- time-window data
- route group
- service time
- frozen goods flag
- demand units
- duration matrix index

Data work already done:

- operational customer dataset imported and cleaned
- 92 customer rows are currently documented as present
- multiple mixed `name/address` rows were corrected
- manual QA export exists:

```text
data/fp2_full_manual_review.csv
```

### Local Development
Local infrastructure exists under:

```text
infra/local
```

The expected local setup is:

```text
Docker Compose PostgreSQL
Spring Boot backend
React/Vite frontend
```

Runbook exists:

```text
docs/runbooks/local-development.md
```

### Cloud Target
AWS is documented as the target cloud provider.

Existing cloud-related docs:

```text
infra/aws/README.md
docs/runbooks/aws-deployment.md
```

Target services:

- S3 + CloudFront for frontend hosting
- ECS Fargate for backend and optimizer containers
- RDS PostgreSQL for database
- ECR for container registry
- Secrets Manager for secrets
- CloudWatch for logs and monitoring
- SQS optional for asynchronous workflows

### Legacy Code
Legacy thesis code exists under:

```text
legacy/thesis-code
```

Useful legacy assets:

- Google geocoding script
- Google route matrix script
- OR-Tools VRPTW script

These are not yet productionized into the new service structure but can guide implementation.

## TBD

### Enterprise Architect Modeling
The following diagrams should be recreated in Enterprise Architect:

- high-level 3-layer architecture
- business logic layer with focused services
- deployment / operational model
- travel-time and distance matrix class diagram
- customer, delivery profile, vehicle, and depot class diagram
- CVRPTW input model

Use the Mermaid diagrams in `docs/modeling/optimization-data-model.md` as the basis for EA class diagrams.

### Database Extensions
The current database schema does not yet include the full travel matrix and vehicle model.

TBD tables:

```text
route_locations
travel_matrix_runs
travel_matrix_entries
depots
vehicles
vehicle_availability
```

Main modeling decisions:

- travel times are directed
- distance and duration should be stored in the same matrix entry
- depot and customers should be represented as route locations for matrix generation
- vehicles should have capacity units
- vehicles should reference start and end depots

### Google Maps Integration
The real Google Maps integration is still TBD.

TBD:

- replace `GOOGLE_MOCK` geocoding candidates with real Google Geocoding API integration
- implement one full route matrix calculation with Google Routes API Compute Route Matrix
- persist calculated matrix runs and entries
- protect API keys through environment variables or secrets
- document actual API usage assumptions

Project scope assumption:

```text
Calculate one full matrix for the fixed customer dataset and depot.
Use Tuesday at 04:30 Europe/Zurich as the representative traffic timestamp.
Persist the matrix and reuse it for weekday-specific optimization by filtering active customers.
```

### Optimization Backend
The route optimization engine exists only as a placeholder.

TBD:

- implement OR-Tools CVRPTW model
- load the relevant weekday subset from the persisted full duration matrix
- load customers with time windows, service times, and demand units
- load vehicles with capacity units and depot start/end
- return optimized routes, timing, dropped stops, and metrics
- define API contract between optimization orchestrator and optimizer

### Optimization Orchestration
The optimization workflow is not yet implemented end-to-end.

TBD:

- add optimization run API
- persist optimization runs
- persist route results
- expose run status and summary
- connect Optimization Studio frontend to real backend output

Possible API shape:

```text
POST /api/optimization-runs
GET  /api/optimization-runs/{runId}
GET  /api/optimization-runs/{runId}/routes
```

### Frontend Improvements
TBD:

- replace mock Optimization Studio result with real optimization run output
- add validation filters
- add route group filters
- show readiness checks for optimization input
- show missing data per customer
- show optimization result routes and KPIs

### Tests
TBD:

- backend repository query tests
- geocoding confirmation flow tests
- database migration validation
- frontend component/use-case tests
- optimizer unit tests for small CVRPTW examples
- integration test for optimization input generation

### Documentation
TBD:

- update ADR statuses from `Proposed` to `Accepted` after review
- add EA exports or screenshots separately if needed for the thesis
- document Google Maps API configuration
- document matrix calculation procedure
- document optimizer run procedure
- keep `docs/runbooks/current-status.md` in sync with this overview

## Main Risks

### Data Quality
Optimization quality depends on complete and correct input data:

- validated addresses
- confirmed geocodes
- complete time windows
- realistic service times
- demand units
- vehicle capacities

### External API Dependency
Google Maps Platform is a paid external dependency.
API keys, billing, quota, and pricing must be managed.
Persisting the matrix reduces repeated API usage.

### Optimization Complexity
CVRPTW is more complex than simple shortest-path routing.
Bad input data can make the optimization infeasible or produce poor routes.

### Scope Creep
Live traffic, dynamic replanning, driver mobile apps, and production-grade cloud automation are outside the current core scope unless explicitly added.

## Recommended Next Steps

1. Create the Enterprise Architect diagrams from the ADRs and modeling notes.
2. Add database migrations for matrix and vehicle tables.
3. Replace mock geocoding with real Google Geocoding API integration.
4. Implement one-time full Google route matrix calculation and persistence.
5. Implement the OR-Tools CVRPTW optimizer using persisted matrix data.
6. Add optimization run API and connect the frontend Optimization Studio.
7. Add focused tests around database mapping, geocoding confirmation, and optimizer input generation.
8. Review proposed ADRs and change their status to `Accepted` once confirmed.
