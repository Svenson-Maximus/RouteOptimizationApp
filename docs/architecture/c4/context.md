# C4 - System Context

## Purpose
Defines the system boundary, external actors, and external systems for the bakery optimization platform.

## Scope (Aligned with ADR-0001 + Thesis)
The platform covers the full operational flow:
1. Customer/delivery data intake and cleansing.
2. Address validation + geocoding (Google Maps).
3. Travel-time matrix generation (Google Routes API).
4. CVRPTW optimization (Python + OR-Tools).
5. Delivery schedule output for operations.

## System Context Diagram
```mermaid
flowchart LR
    ops[Bakery Operations Planner]
    drivers[Delivery Drivers]
    system[Focus Project 2 Platform\nReact UI + Spring Services + Python Optimization Engine]
    maps[Google Maps Platform\nGeocoding API + Routes API (Compute Route Matrix)]
    db[(PostgreSQL\nSystem of Record)]
    files[(Excel Sources\nTourenplaene / Customer Data)]

    ops -->|Maintain customers, validate addresses, trigger optimization| system
    files -->|Input data for import/cleanup| system

    system -->|Address validation/geocoding requests| maps
    maps -->|Place IDs + normalized addresses + coordinates| system

    system -->|Route matrix requests (place IDs as origins/destinations)| maps
    maps -->|Travel-time / distance matrix| system

    system -->|Read/write customers, addresses, profiles, imports, run metadata| db
    system -->|Publish optimized route plan + schedule| ops
    ops -->|Dispatch route plan| drivers
```

## Actors and External Systems
- `Bakery Operations Planner`: Maintains data, reviews corrections, launches optimization runs, and reviews results.
- `Delivery Drivers`: Consume finalized route plans from operations.
- `Google Maps Platform`: External provider for geocoding and route-matrix travel times.
- `PostgreSQL`: Persistent store for customer/address/delivery/import/optimization data.
- `Excel Sources`: Upstream operational input files for onboarding and updates.

## Key Interactions
1. Operations imports/maintains customer and delivery constraints.
2. Platform validates addresses and extracts geospatial identifiers via Google Maps APIs.
3. Platform requests a travel-time matrix from Google Routes API.
4. Optimization engine solves CVRPTW with time windows (OR-Tools) using cleaned constraints + matrix.
5. Platform stores run outputs and exposes route/schedule results to operations for dispatch.
