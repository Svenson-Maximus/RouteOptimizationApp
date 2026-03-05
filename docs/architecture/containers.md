# C4 - Container View

## Purpose
Describe deployable containers/apps and communication paths.

## Containers
- Address Validation UI (React)
- Data Integration Service (Spring Boot)
- Customer Master Service (Spring Boot)
- Geocoding Service (Spring Boot)
- Optimization Orchestrator Service (Spring Boot)
- Route Optimization Engine (Python OR-Tools)
- PostgreSQL

## Key Interactions
- UI -> Customer Master / Geocoding / Orchestrator APIs
- Data Integration -> Customer Master (persist imported entities)
- Orchestrator -> Optimizer Engine (run optimization)
- Services -> PostgreSQL

## To Finalize Later
- Sync vs async integration boundaries
- API gateway/load balancer placement
