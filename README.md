# Focus Project 2

Monorepo for the bakery route optimization platform.

## Architecture
- 3-layer architecture
- Microservices in the business logic layer

## Repository Structure
- `apps/frontend/address-validation-ui`
- `apps/services/data-integration-service`
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
1. Create customer/delivery records manually in PostgreSQL
2. Validate and geocode addresses with Google Maps.
3. Correct/confirm addresses in the frontend.
4. Run optimization only on validated + geocoded records.


## Key Documents
- `docs/adr/ADR-0001-tech-stack.md`
- `docs/adr/ADR-0002-database-selection-and-data-model-strategy.md`
- `docs/adr/ADR-0003-flyway-migration-strategy.md`
- `docs/architecture/README.md`
- `docs/architecture/database-structure.md`
- `docs/runbooks/local-development.md`
- `docs/runbooks/aws-deployment.md`
