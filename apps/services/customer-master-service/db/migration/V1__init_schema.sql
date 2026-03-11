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

CREATE TABLE import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_filename TEXT,
    source_sheet TEXT,
    status TEXT,
    total_rows INTEGER,
    success_rows INTEGER,
    failed_rows INTEGER,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ
);

CREATE TABLE import_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_job_id UUID NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
    source_row_number INTEGER,
    status TEXT,
    error_message TEXT,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    raw_row_json JSONB,
    processed_at TIMESTAMPTZ
);

CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX idx_customer_addresses_city_postal ON customer_addresses(city, postal_code);
CREATE INDEX idx_customer_geocodes_address_id_created_at ON customer_geocodes(address_id, created_at DESC);
CREATE INDEX idx_customer_geocodes_place_id ON customer_geocodes(place_id);
CREATE INDEX idx_customer_delivery_profiles_customer_id ON customer_delivery_profiles(customer_id);
CREATE INDEX idx_customer_routing_metadata_customer_id ON customer_routing_metadata(customer_id);
CREATE INDEX idx_import_rows_import_job_id ON import_rows(import_job_id);
CREATE INDEX idx_import_rows_customer_id ON import_rows(customer_id);
