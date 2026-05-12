CREATE TABLE IF NOT EXISTS depots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    capacity_units INTEGER NOT NULL,
    start_depot_id UUID NOT NULL REFERENCES depots(id),
    end_depot_id UUID NOT NULL REFERENCES depots(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS route_locations (
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

CREATE TABLE IF NOT EXISTS travel_matrix_runs (
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

CREATE TABLE IF NOT EXISTS travel_matrix_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matrix_run_id UUID NOT NULL REFERENCES travel_matrix_runs(id) ON DELETE CASCADE,
    origin_location_id UUID NOT NULL REFERENCES route_locations(id),
    destination_location_id UUID NOT NULL REFERENCES route_locations(id),
    duration_seconds INTEGER,
    distance_meters INTEGER,
    status TEXT NOT NULL,
    UNIQUE (matrix_run_id, origin_location_id, destination_location_id)
);

CREATE INDEX IF NOT EXISTS idx_vehicles_start_depot_id ON vehicles(start_depot_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_end_depot_id ON vehicles(end_depot_id);
CREATE INDEX IF NOT EXISTS idx_route_locations_customer_id ON route_locations(customer_id);
CREATE INDEX IF NOT EXISTS idx_route_locations_depot_id ON route_locations(depot_id);
CREATE INDEX IF NOT EXISTS idx_travel_matrix_entries_matrix_run_id ON travel_matrix_entries(matrix_run_id);
CREATE INDEX IF NOT EXISTS idx_travel_matrix_entries_origin_destination ON travel_matrix_entries(origin_location_id, destination_location_id);

UPDATE customer_routing_metadata
SET demand_units = 1,
    updated_at = NOW()
WHERE demand_units IS NULL;

UPDATE customer_delivery_profiles
SET service_time_minutes = 5,
    updated_at = NOW()
WHERE service_time_minutes IS NULL;

WITH inserted_depot AS (
    INSERT INTO depots (name, latitude, longitude)
    SELECT 'Bio-Beck Lehmann', 47.5216728, 9.0954385
    WHERE NOT EXISTS (
        SELECT 1 FROM depots WHERE name = 'Bio-Beck Lehmann'
    )
    RETURNING id, name, latitude, longitude
),
selected_depot AS (
    SELECT id, name, latitude, longitude FROM inserted_depot
    UNION ALL
    SELECT id, name, latitude, longitude FROM depots WHERE name = 'Bio-Beck Lehmann'
    LIMIT 1
)
INSERT INTO route_locations (location_type, depot_id, name, latitude, longitude)
SELECT 'DEPOT', id, name, latitude, longitude
FROM selected_depot
WHERE NOT EXISTS (
    SELECT 1
    FROM route_locations
    WHERE location_type = 'DEPOT'
      AND depot_id = selected_depot.id
);

WITH depot AS (
    SELECT id FROM depots WHERE name = 'Bio-Beck Lehmann' LIMIT 1
)
INSERT INTO vehicles (name, capacity_units, start_depot_id, end_depot_id)
SELECT vehicle_name, 100, depot.id, depot.id
FROM depot
CROSS JOIN (VALUES ('Vehicle 1'), ('Vehicle 2')) AS seed(vehicle_name)
WHERE NOT EXISTS (
    SELECT 1 FROM vehicles WHERE name = seed.vehicle_name
);
