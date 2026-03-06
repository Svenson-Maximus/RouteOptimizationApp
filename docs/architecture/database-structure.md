# Database Structure (PostgreSQL)

## Purpose
This document defines the initial relational schema for the customer import, address validation/geocoding workflow, and optimization readiness.


## Core Entities
- `customers`: business identity (company/customer level)
- `customer_addresses`: raw + normalized address, validation state
- `customer_geocodes`: geocoding result history (place_id, lat/lng, status)
- `customer_delivery_profiles`: time windows, weekday flags, notes, frozen goods flag
- `customer_routing_metadata`: matrix index and optimization-related metadata
- `import_jobs`: optional import tracking (for future automated import)
- `import_rows`: optional row-level import status/error tracking

## ER Diagram (Mermaid)
```mermaid
erDiagram
    customers ||--o{ customer_addresses : has
    customer_addresses ||--o{ customer_geocodes : geocoded_by
    customers ||--o{ customer_delivery_profiles : has
    customers ||--o{ customer_routing_metadata : has
    import_jobs ||--o{ import_rows : contains
    customers ||--o{ import_rows : created_from

    customers {
      uuid id PK
      string company_index
      string name
      boolean is_active
      timestamptz created_at
      timestamptz updated_at
    }

    customer_addresses {
      uuid id PK
      uuid customer_id FK
      string full_address_raw
      string street
      string building_no
      string postal_code
      string city
      string country_code
      string validation_status
      string validation_source
      timestamptz validated_at
      timestamptz created_at
      timestamptz updated_at
    }

    customer_geocodes {
      uuid id PK
      uuid address_id FK
      string provider
      string place_id
      string formatted_address
      decimal latitude
      decimal longitude
      string geocode_status
      int result_count
      json raw_response_json
      timestamptz created_at
    }

    customer_delivery_profiles {
      uuid id PK
      uuid customer_id FK
      string tour_type
      time time_window_start
      time time_window_end
      int service_time_minutes
      boolean monday
      boolean tuesday
      boolean wednesday
      boolean thursday
      boolean friday
      boolean saturday
      boolean requires_frozen_food
      text delivery_notes
      timestamptz updated_at
    }

    customer_routing_metadata {
      uuid id PK
      uuid customer_id FK
      int duration_matrix_index
      string google_api_customer_id
      int demand_units
      timestamptz updated_at
    }

    import_jobs {
      uuid id PK
      string source_filename
      string source_sheet
      string status
      int total_rows
      int success_rows
      int failed_rows
      timestamptz started_at
      timestamptz finished_at
    }

    import_rows {
      uuid id PK
      uuid import_job_id FK
      int source_row_number
      string status
      text error_message
      uuid customer_id FK
      json raw_row_json
      timestamptz processed_at
    }
```



## Data Flow (Current and Future)
### Current (manual entry)
1. Team enters customer/address/delivery records directly in PostgreSQL.
2. Address validation/geocoding updates status before optimization eligibility.

### Future (automated import)
1. Data import creates an `import_jobs` record.
2. Each parsed line is tracked in `import_rows`.
3. Valid mapped records create/update `customers` and `customer_addresses`.
