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
- `docs/modeling`
- `docs/runbooks`
- `docs/thesis`
- `legacy/thesis-code`

## Scope (MVP flow)
1. Work with the existing customer and delivery dataset already stored in PostgreSQL
2. Validate and geocode addresses with Google Maps.
3. Correct/confirm addresses in the frontend.
4. Run CVRPTW-based optimization only on validated + geocoded records.


## Key Documents
- `docs/adr/ADR-0001-how-should-adrs-be-documented.md`
- `docs/adr/ADR-0002-which-application-architecture.md`
- `docs/adr/ADR-0003-which-frontend-framework.md`
- `docs/adr/ADR-0004-which-backend-runtime.md`
- `docs/adr/ADR-0005-which-optimization-runtime.md`
- `docs/adr/ADR-0006-which-database.md`
- `docs/adr/ADR-0007-which-cloud-provider.md`
- `docs/adr/ADR-0008-how-should-the-platform-be-operated.md`
- `docs/adr/ADR-0009-which-maps-provider.md`
- `docs/adr/ADR-0010-when-should-travel-times-be-requested.md`
- `docs/adr/ADR-0011-how-should-cvrptw-be-modeled.md`
- `docs/modeling/optimization-data-model.md`
- `docs/modeling/optimization-database-tables.md`
- `docs/runbooks/project-overview.md`
- `docs/runbooks/local-development.md`
- `docs/runbooks/aws-deployment.md`
