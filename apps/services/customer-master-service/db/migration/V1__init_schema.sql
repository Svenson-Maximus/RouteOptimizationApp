CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_index TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    full_address_raw TEXT,
    street TEXT,
    building_no TEXT,
    postal_code TEXT,
    city TEXT,
    country_code TEXT,
    validation_status TEXT,
    validation_source TEXT,
    validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_geocodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address_id UUID NOT NULL REFERENCES customer_addresses(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    place_id TEXT,
    formatted_address TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    geocode_status TEXT,
    result_count INTEGER,
    raw_response_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_delivery_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tour_type TEXT,
    route_group TEXT,
    time_window_start TIME,
    time_window_end TIME,
    service_time_minutes INTEGER,
    monday BOOLEAN NOT NULL DEFAULT FALSE,
    tuesday BOOLEAN NOT NULL DEFAULT FALSE,
    wednesday BOOLEAN NOT NULL DEFAULT FALSE,
    thursday BOOLEAN NOT NULL DEFAULT FALSE,
    friday BOOLEAN NOT NULL DEFAULT FALSE,
    saturday BOOLEAN NOT NULL DEFAULT FALSE,
    requires_frozen_food BOOLEAN NOT NULL DEFAULT FALSE,
    delivery_notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_routing_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    duration_matrix_index INTEGER,
    google_api_customer_id TEXT,
    demand_units INTEGER,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX idx_customer_addresses_city_postal ON customer_addresses(city, postal_code);
CREATE INDEX idx_customer_geocodes_address_id_created_at ON customer_geocodes(address_id, created_at DESC);
CREATE INDEX idx_customer_geocodes_place_id ON customer_geocodes(place_id);
CREATE INDEX idx_customer_delivery_profiles_customer_id ON customer_delivery_profiles(customer_id);
CREATE INDEX idx_customer_routing_metadata_customer_id ON customer_routing_metadata(customer_id);
CREATE INDEX idx_vehicles_start_depot_id ON vehicles(start_depot_id);
CREATE INDEX idx_vehicles_end_depot_id ON vehicles(end_depot_id);
CREATE INDEX idx_route_locations_customer_id ON route_locations(customer_id);
CREATE INDEX idx_route_locations_depot_id ON route_locations(depot_id);
CREATE INDEX idx_travel_matrix_entries_matrix_run_id ON travel_matrix_entries(matrix_run_id);
CREATE INDEX idx_travel_matrix_entries_origin_destination ON travel_matrix_entries(origin_location_id, destination_location_id);
