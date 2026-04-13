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
- `docs/adr/ADR-0002-high-level-application-architecture.md`
- `docs/adr/ADR-0003-business-logic-layer-structure.md`
- `docs/adr/ADR-0004-frontend-framework.md`
- `docs/adr/ADR-0005-backend-runtime.md`
- `docs/adr/ADR-0006-optimization-runtime.md`
- `docs/adr/ADR-0007-database-system-of-record.md`
- `docs/adr/ADR-0008-cloud-provider.md`
- `docs/adr/ADR-0009-operational-model.md`
- `docs/adr/ADR-0010-maps-and-routing-provider.md`
- `docs/adr/ADR-0011-travel-time-request-timing.md`
- `docs/adr/ADR-0012-travel-time-and-distance-storage.md`
- `docs/adr/ADR-0013-customer-delivery-data-model.md`
- `docs/adr/ADR-0014-vehicle-and-capacity-model.md`
- `docs/adr/ADR-0015-cvrptw-optimization-model.md`
- `docs/runbooks/local-development.md`
- `docs/runbooks/aws-deployment.md`
