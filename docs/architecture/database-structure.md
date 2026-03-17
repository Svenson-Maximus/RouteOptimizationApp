# Database Structure (PostgreSQL)

## Purpose
This document defines the initial relational schema for the fixed customer dataset, address validation/geocoding workflow, and optimization readiness for a **Capacitated Vehicle Routing Problem with Time Windows (CVRPTW)**.


## Core Entities
- `customers`: business identity (company/customer level)
- `customer_addresses`: raw + normalized address, validation state
- `customer_geocodes`: geocoding result history (place_id, lat/lng, status)
- `customer_delivery_profiles`: time windows, weekday flags, notes, frozen goods flag
- `customer_routing_metadata`: matrix index and optimization-related metadata

## ER Diagram (Mermaid)
```mermaid
erDiagram
    customers ||--o{ customer_addresses : has
    customer_addresses ||--o{ customer_geocodes : geocoded_by
    customers ||--o{ customer_delivery_profiles : has
    customers ||--o{ customer_routing_metadata : has

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
      string route_group
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
```



## Data Flow
1. Team enters customer/address/delivery records directly in PostgreSQL.
2. Address validation/geocoding updates status before optimization eligibility.
3. Validated and geocoded records provide the operational input needed for CVRPTW optimization.
