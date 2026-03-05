# Target Architecture (Initial)

## Core Flow
1. Excel upload -> `data-integration-service`
2. Raw records stored in DB with `needs_validation` status
3. UI displays unresolved addresses
4. UI triggers `geocoding-service` (Google Maps)
5. Staff confirms or corrects addresses
6. Records move to `validated` and become optimization-ready

## Repository Layout
- `apps/frontend/address-validation-ui`
- `apps/services/data-integration-service`
- `apps/services/customer-master-service`
- `apps/services/geocoding-service`
- `apps/services/optimization-orchestrator-service`
- `apps/optimizer/route-optimization-engine`
- `shared/contracts`
- `shared/events`

## First Vertical Slice
- Excel import endpoint
- Customer/address tables
- UI list filtered by `needs_validation`
- Geocoding action + confirm action
