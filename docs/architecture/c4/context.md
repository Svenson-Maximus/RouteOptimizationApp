# C4 - System Context

## Purpose
Defines the system boundary, external actors, and external systems for the bakery optimization platform.

## Scope
The platform covers the full operational flow:
1. Customer/delivery data intake and cleansing.
2. Address validation, geolocation verification/correction in UI, and geocoding (Google Maps).
3. Travel-time matrix generation (Google Routes API).
4. CVRPTW optimization (Python + OR-Tools).
5. Delivery schedule output for operations.

## System Context Diagram
```mermaid
C4Context
    title Focus Project 2 Platform - System Context Diagram

    Person(ops, "Bakery Planner", "Maintains customers, validates addresses, verifies/corrects geolocations, and triggers optimization.")
    Person(drivers, "Delivery Drivers", "Receive and follow finalized delivery routes.")

    System_Boundary(focus, "Focus Project 2 Platform") {
        System(system, "Focus Project 2 Platform", "Supports import, validation, geocoding, optimization, and schedule publication.")
    }

    System_Ext(files, "Excel Sources", "Tourenplaene / Customer Data imports")
    System_Ext(maps, "Google Maps Platform", "Geocoding API + Routes API")
    SystemDb_Ext(db, "PostgreSQL", "Persistent store for customer, address, delivery, geocoding, and optimization data")

    Rel(ops, system, "Maintains customers, validates addresses, verifies/corrects geolocations, triggers optimization")
    Rel(files, system, "Provides input data for import and cleanup")
    Rel(system, maps, "Requests geocoding and route matrices")
    Rel(system, db, "Reads and writes operational data")
    Rel(system, ops, "Publishes optimized route plan and schedule")
    Rel(ops, drivers, "Dispatches route plan")

## Actors and External Systems
- `Bakery Planner`: Maintains data, verifies/corrects geolocations in UI, launches optimization runs, and reviews results.
- `Delivery Drivers`: Consume finalized route plans from operations.
- `Google Maps Platform`: External provider for geocoding and route-matrix travel times.
- `PostgreSQL`: Persistent store for customer/address/delivery/import/geocoding/optimization data.
- `Excel Sources`: Upstream operational input files for onboarding and updates.

## Key Interactions
1. Operations imports or maintains customer and delivery constraints.
2. Platform validates addresses and supports UI-based geolocation verification/correction.
3. Platform requests geocoding/place IDs and then a travel-time matrix from Google Maps APIs.
4. Optimization engine solves CVRPTW with time windows (OR-Tools) using cleaned constraints + matrix.
5. Platform stores run outputs and exposes route/schedule results to operations for dispatch.
