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
1. Import Excel-based customer/delivery data into PostgreSQL.
2. Validate and geocode addresses with Google Maps.
3. Correct/confirm addresses in the frontend.
4. Run optimization only on validated + geocoded records.

## Database Migrations (Flyway)
- We use Flyway for versioned SQL schema changes.
- Why: reproducible schema across local/dev/prod and full DB change history in Git.
- Planned location: `db/migration` inside each Java service that owns schema changes.
- Naming convention: `V1__init_schema.sql`, `V2__add_geocode_status.sql`, etc.

## Key Documents
- `docs/adr/ADR-0001-tech-stack.md`
- `docs/adr/ADR-0002-flyway-migration-strategy.md`
- `docs/architecture/README.md`
- `docs/architecture/database-structure.md`
- `docs/runbooks/local-development.md`
- `docs/runbooks/aws-deployment.md`
