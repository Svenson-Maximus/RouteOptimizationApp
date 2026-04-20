# Optimization Database Tables

## Purpose
This document captures the initial database tables for route matrix storage and vehicle capacity data.
The class diagrams remain in `docs/modeling/optimization-data-model.md`; this file focuses only on table structure.

## Travel Matrix Tables
Travel times are stored as directed values.
The route from `A -> B` is not assumed to be equal to `B -> A`.

Distance does not need a separate table.
`duration_seconds` and `distance_meters` belong to the same directed matrix entry because both values describe the same route segment returned by the maps provider.

```sql
CREATE TABLE route_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_type TEXT NOT NULL,
    customer_id UUID NULL REFERENCES customers(id) ON DELETE CASCADE,
    depot_id UUID NULL REFERENCES depots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        (location_type = 'CUSTOMER' AND customer_id IS NOT NULL AND depot_id IS NULL)
        OR
        (location_type = 'DEPOT' AND depot_id IS NOT NULL AND customer_id IS NULL)
    )
);

CREATE TABLE travel_matrix_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    departure_time TIMESTAMPTZ,
    departure_time_zone TEXT NOT NULL,
    reference_weekday TEXT NOT NULL,
    travel_mode TEXT NOT NULL,
    origin_count INTEGER NOT NULL,
    destination_count INTEGER NOT NULL,
    notes TEXT
);

CREATE TABLE travel_matrix_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matrix_run_id UUID NOT NULL REFERENCES travel_matrix_runs(id) ON DELETE CASCADE,
    origin_location_id UUID NOT NULL REFERENCES route_locations(id),
    destination_location_id UUID NOT NULL REFERENCES route_locations(id),
    duration_seconds INTEGER,
    distance_meters INTEGER,
    status TEXT NOT NULL,
    UNIQUE (matrix_run_id, origin_location_id, destination_location_id)
);
```

## Vehicle Tables
The project starts with two active vehicles.
Both vehicles are assumed to be available on every modeled delivery day.

```sql
CREATE TABLE depots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    capacity_units INTEGER NOT NULL,
    start_depot_id UUID NOT NULL REFERENCES depots(id),
    end_depot_id UUID NOT NULL REFERENCES depots(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Existing Customer Tables
The customer classes in `docs/modeling/optimization-data-model.md` map to the customer-master tables in the same initial migration.

```text
Customer                    -> customers
CustomerAddress             -> customer_addresses
CustomerGeocode             -> customer_geocodes
CustomerDeliveryProfile     -> customer_delivery_profiles
CustomerRoutingMetadata     -> customer_routing_metadata
```

## Notes
- `route_locations` represents both depots and customers as routable locations.
- `travel_matrix_runs` groups one complete matrix calculation with its assumptions.
- `travel_matrix_entries` stores one directed origin-destination result.
- `duration_seconds` and `distance_meters` are nullable so `ZERO_RESULTS` or `ERROR` entries can still be stored with a status.
- `vehicles.capacity_units` is initialized with `100` for each vehicle until real capacity values are available.
