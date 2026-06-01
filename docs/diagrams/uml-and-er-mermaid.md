# UML and ER Diagrams

These Mermaid diagrams are source diagrams for documentation and for recreating the same views in Enterprise Architect.

The UML interpretation follows the UML book found in `../uml-models.pdf`:

- Building block view: use a UML Component Diagram.
- Source-code organization: use a UML Package Diagram.
- Runtime/cloud view: use a UML Deployment Diagram.
- Database model: use an ER diagram, not a building block view.

## 1. Building Block View - UML Component Diagram

Use this as the main arc42 Bausteinsicht level 1.

Enterprise Architect recreation:

- Create a UML Component Diagram.
- Use UML Components for frontend, backend service, optimizer, database, and external Google Maps Platform.
- Use Dependency connectors for calls/uses relationships.
- Optionally model API contracts as provided/required interfaces.

```mermaid
flowchart LR
    browser["Driver / Planner Browser"]

    subgraph frontend["<<component>> React Frontend\naddress-validation-ui"]
        customerUi["Customer Management UI"]
        geocodingUi["Geocoding Review UI"]
        routePlannerUi["Route Planner UI"]
    end

    subgraph backend["<<component>> Spring Boot Backend\ncustomer-master-service"]
        customerApi["Customer API"]
        geocodingApi["Geocoding API"]
        matrixApi["Matrix API"]
        optimizationApi["Optimization Run API"]
    end

    optimizer["<<component>> Python Optimizer\nOR-Tools CVRPTW Solver"]
    db[("<<database>> PostgreSQL\nSystem of Record")]
    google["<<external system>> Google Maps Platform\nGeocoding, Routes Matrix, Maps Embed"]

    browser --> frontend
    customerUi --> customerApi
    geocodingUi --> geocodingApi
    routePlannerUi --> optimizationApi
    routePlannerUi --> google

    customerApi --> db
    geocodingApi --> db
    matrixApi --> db
    optimizationApi --> db
    optimizationApi --> optimizer
    optimizer --> db

    geocodingApi --> google
    matrixApi --> google
```

## 2. Backend Building Block View - UML Component Diagram

Use this as a level 2 Bausteinsicht for the Spring Boot backend.

Enterprise Architect recreation:

- Create a UML Component Diagram.
- Represent controllers, services, repositories, external clients, and database tables as components.
- Use Dependency connectors from controllers to services and from services to repositories/clients.

```mermaid
flowchart LR
    subgraph api["<<component>> API Layer"]
        customerController["CustomerController"]
        geocodingController["GeocodingController"]
        matrixController["MatrixController"]
        optimizationController["OptimizationRunController"]
    end

    subgraph service["<<component>> Business Services"]
        customerService["Customer Data Workflow"]
        geocodingService["Geocoding Workflow"]
        matrixService["Matrix Calculation Workflow"]
        optimizationService["OptimizationRunService"]
    end

    subgraph persistence["<<component>> Persistence"]
        customerRepository["CustomerRepository"]
        matrixRepository["TravelMatrixRepository"]
        optimizationRunsTable[("optimization_runs")]
        customerTables[("customer tables")]
        matrixTables[("matrix tables")]
    end

    subgraph external["<<component>> External Adapters"]
        googleGeocodingClient["GoogleGeocodingClient"]
        googleMatrixClient["GoogleRouteMatrixClient"]
        pythonProcess["Python Optimizer Process"]
    end

    customerController --> customerService
    geocodingController --> geocodingService
    matrixController --> matrixService
    optimizationController --> optimizationService

    customerService --> customerRepository
    geocodingService --> customerRepository
    geocodingService --> googleGeocodingClient
    matrixService --> matrixRepository
    matrixService --> googleMatrixClient
    optimizationService --> customerRepository
    optimizationService --> matrixRepository
    optimizationService --> optimizationRunsTable
    optimizationService --> pythonProcess

    customerRepository --> customerTables
    matrixRepository --> matrixTables
```

## 3. Source Organization - UML Package Diagram

Use this if you want to show the code/package organization. This is not the same as the runtime architecture.

Enterprise Architect recreation:

- Create a UML Package Diagram.
- Use Packages for root folders and important source packages.
- Use Dependency connectors for imports/calls.

```mermaid
flowchart TB
    root["RouteOptimizationApp"]

    subgraph apps["apps"]
        frontendPkg["frontend/address-validation-ui"]
        servicesPkg["services/customer-master-service"]
        optimizerPkg["optimizer/route-optimization-engine"]
    end

    subgraph frontendSrc["React source packages"]
        feDomain["domain"]
        feApplication["application/usecases"]
        feInfrastructure["infrastructure/api"]
        fePresentation["presentation/pages, components"]
    end

    subgraph backendSrc["Spring Boot source packages"]
        beApi["api"]
        beDto["api.dto"]
        beService["service / optimization / matrix / geocoding"]
        beRepository["repository"]
        beResources["resources/db/migration"]
    end

    subgraph optimizerSrc["Python optimizer packages"]
        optSrc["src"]
        optTests["tests"]
    end

    shared["shared/contracts"]
    fixtures["test-fixtures"]
    infra["infra"]
    docs["docs"]

    root --> apps
    root --> shared
    root --> fixtures
    root --> infra
    root --> docs

    frontendPkg --> frontendSrc
    servicesPkg --> backendSrc
    optimizerPkg --> optimizerSrc

    fePresentation --> feApplication
    feApplication --> feInfrastructure
    feApplication --> feDomain
    feInfrastructure --> shared

    beApi --> beDto
    beApi --> beService
    beService --> beRepository
    beService --> shared
    beResources --> beRepository

    optSrc --> shared
    optTests --> fixtures
```

## 4. Runtime View - UML Deployment Diagram

Use this for local and cloud deployment documentation.

Enterprise Architect recreation:

- Create a UML Deployment Diagram.
- Use Nodes for browser, local machine/cloud runtime, containers, database, and external Google services.
- Deploy artifacts/components inside the nodes.
- Use Communication Path connectors for HTTP, JDBC, process invocation, and external API calls.

```mermaid
flowchart LR
    browserNode["<<device>> User Device\nBrowser"]

    subgraph local["<<node>> Local Developer Machine / Cloud Runtime"]
        frontendNode["<<execution environment>> Frontend Dev Server or Static Hosting\nReact/Vite artifact"]
        backendNode["<<execution environment>> Backend Container or JVM\nSpring Boot artifact"]
        optimizerNode["<<execution environment>> Python Runtime\nOR-Tools optimizer artifact"]
    end

    postgresNode[("<<node>> PostgreSQL\nDocker Compose locally / Managed DB in cloud")]
    googleNode["<<external node>> Google Maps Platform\nGeocoding, Routes API, Maps Embed"]

    browserNode -- "HTTPS / local HTTP" --> frontendNode
    frontendNode -- "REST / JSON" --> backendNode
    frontendNode -- "Maps Embed / browser link" --> googleNode
    backendNode -- "JDBC" --> postgresNode
    backendNode -- "process call / JSON result" --> optimizerNode
    optimizerNode -- "PostgreSQL read" --> postgresNode
    backendNode -- "Google API HTTP" --> googleNode
```

## 5. Database Model - ER Diagram

Use this as the data model diagram. This is separate from the UML Bausteinsicht.

Enterprise Architect recreation:

- Create a Data Modeling or ER diagram.
- Add entities/tables with primary keys and foreign keys.
- Use one-to-many relationships according to the foreign keys below.
- Keep detailed weekday demand columns in the `customer_delivery_profiles` entity or move them into a note if the diagram gets too wide.

```mermaid
erDiagram
    CUSTOMERS {
        UUID id PK
        TEXT company_index UK
        TEXT name
        BOOLEAN is_active
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    CUSTOMER_ADDRESSES {
        UUID id PK
        UUID customer_id FK
        TEXT address_type
        BOOLEAN is_primary_delivery
        TEXT full_address_raw
        TEXT street
        TEXT building_no
        TEXT postal_code
        TEXT city
        TEXT country_code
        TEXT delivery_note
        TEXT validation_status
        TEXT validation_source
        BOOLEAN needs_delivery_address_review
        TEXT delivery_address_review_reason
        TIMESTAMPTZ validated_at
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    CUSTOMER_GEOCODES {
        UUID id PK
        UUID address_id FK
        TEXT provider
        TEXT place_id
        TEXT formatted_address
        DECIMAL latitude
        DECIMAL longitude
        TEXT geocode_status
        INTEGER result_count
        JSONB raw_response_json
        TIMESTAMPTZ created_at
    }

    CUSTOMER_DELIVERY_PROFILES {
        UUID id PK
        UUID customer_id FK
        TEXT tour_type
        TEXT route_group
        TIME raw_time_window_start
        TIME raw_time_window_end
        TIME time_window_start
        TIME time_window_end
        TEXT time_window_normalization_note
        INTEGER service_time_minutes
        BOOLEAN monday
        BOOLEAN tuesday
        BOOLEAN wednesday
        BOOLEAN thursday
        BOOLEAN friday
        BOOLEAN saturday
        INTEGER monday_delivery_demand_units
        INTEGER monday_pickup_demand_units
        INTEGER tuesday_delivery_demand_units
        INTEGER tuesday_pickup_demand_units
        INTEGER wednesday_delivery_demand_units
        INTEGER wednesday_pickup_demand_units
        INTEGER thursday_delivery_demand_units
        INTEGER thursday_pickup_demand_units
        INTEGER friday_delivery_demand_units
        INTEGER friday_pickup_demand_units
        INTEGER saturday_delivery_demand_units
        INTEGER saturday_pickup_demand_units
        BOOLEAN requires_frozen_food
        TEXT delivery_notes
        TIMESTAMPTZ updated_at
    }

    CUSTOMER_ROUTING_METADATA {
        UUID id PK
        UUID customer_id FK
        INTEGER duration_matrix_index
        TEXT google_api_customer_id
        INTEGER demand_units
        TIMESTAMPTZ updated_at
    }

    DEPOTS {
        UUID id PK
        TEXT name
        DECIMAL latitude
        DECIMAL longitude
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    VEHICLES {
        UUID id PK
        TEXT name
        INTEGER capacity_units
        UUID start_depot_id FK
        UUID end_depot_id FK
        BOOLEAN is_active
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    ROUTE_LOCATIONS {
        UUID id PK
        TEXT location_type
        UUID customer_id FK
        UUID depot_id FK
        TEXT name
        DECIMAL latitude
        DECIMAL longitude
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    TRAVEL_MATRIX_RUNS {
        UUID id PK
        TEXT provider
        TIMESTAMPTZ calculated_at
        TIMESTAMPTZ departure_time
        TEXT departure_time_zone
        TEXT reference_weekday
        TEXT travel_mode
        INTEGER origin_count
        INTEGER destination_count
        TEXT notes
    }

    TRAVEL_MATRIX_ENTRIES {
        UUID id PK
        UUID matrix_run_id FK
        UUID origin_location_id FK
        UUID destination_location_id FK
        INTEGER duration_seconds
        INTEGER distance_meters
        TEXT status
    }

    OPTIMIZATION_RUNS {
        UUID id PK
        TIMESTAMPTZ created_at
        TEXT weekday
        UUID matrix_run_id FK
        TEXT status
        BIGINT objective_value
        INTEGER eligible_customer_count
        INTEGER served_customer_count
        INTEGER dropped_customer_count
        INTEGER vehicles_used
        INTEGER total_return_duration_seconds
        INTEGER total_route_duration_seconds
        INTEGER total_distance_meters
        INTEGER time_limit_seconds
        INTEGER dropped_stop_penalty
        BOOLEAN allow_waiting
        TEXT first_solution_strategy
        TEXT local_search_metaheuristic
        INTEGER random_seed
        JSONB result_json
    }

    CUSTOMERS ||--o{ CUSTOMER_ADDRESSES : has
    CUSTOMER_ADDRESSES ||--o{ CUSTOMER_GEOCODES : geocoded_as
    CUSTOMERS ||--o| CUSTOMER_DELIVERY_PROFILES : has
    CUSTOMERS ||--o| CUSTOMER_ROUTING_METADATA : has
    CUSTOMERS ||--o{ ROUTE_LOCATIONS : represented_by
    DEPOTS ||--o{ ROUTE_LOCATIONS : represented_by
    DEPOTS ||--o{ VEHICLES : start_depot
    DEPOTS ||--o{ VEHICLES : end_depot
    TRAVEL_MATRIX_RUNS ||--o{ TRAVEL_MATRIX_ENTRIES : contains
    ROUTE_LOCATIONS ||--o{ TRAVEL_MATRIX_ENTRIES : origin
    ROUTE_LOCATIONS ||--o{ TRAVEL_MATRIX_ENTRIES : destination
    TRAVEL_MATRIX_RUNS ||--o{ OPTIMIZATION_RUNS : used_by
```
