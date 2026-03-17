# Focus Project 2

Monorepo for the bakery route optimization platform.

## Project Focus
The platform prepares operational customer and delivery data for a **Capacitated Vehicle Routing Problem with Time Windows (CVRPTW)**.
Its practical purpose is to ensure that addresses, geocodes, time windows, and route-relevant attributes are reliable enough to serve as input for route optimization.

## Architecture
- 3-layer architecture
- Microservices in the business logic layer

## Repository Structure
- `apps/frontend/address-validation-ui`
- `apps/services/customer-master-service`
- `apps/services/geocoding-service`
- `apps/services/optimization-orchestrator-service`
- `apps/optimizer/route-optimization-engine`
- `infra/local`
- `infra/aws`
- `data/excel`
- `docs/adr`
- `docs/architecture`
- `docs/runbooks`
- `docs/thesis`
- `legacy/thesis-code`

## Scope (MVP flow)
1. Work with the existing customer and delivery dataset already stored in PostgreSQL
2. Validate and geocode addresses with Google Maps.
3. Correct/confirm addresses in the frontend.
4. Run CVRPTW-based optimization only on validated + geocoded records.


## Key Documents
- `docs/adr/ADR-0001-use-markdown-architectural-decision-records.md`
- `docs/adr/ADR-0002-technology-and-architecture-baseline.md`
- `docs/adr/ADR-0003-database-selection-and-data-model-strategy.md`
- `docs/architecture/README.md`
- `docs/architecture/database-structure.md`
- `docs/runbooks/local-development.md`
- `docs/runbooks/aws-deployment.md`
