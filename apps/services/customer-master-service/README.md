# Customer Master Service

Spring Boot service for customer master data, address validation lifecycle, and geocoding confirmation workflow.

## Responsibilities
- Store and query customer/address master records.
- Manage address validation states.
- Provide UI-facing endpoints for customer overview and geocoding review queue.
- Persist confirmed geocodes and update validation status.

## Tech
- Java 21
- Spring Boot 3
- JDBC (NamedParameterJdbcTemplate)
- PostgreSQL
- Flyway migrations

## Local Run
1. Ensure PostgreSQL is running (`fp2-postgres` via `infra/local/docker-compose.yml`).
2. Start service from this directory using your IDE Gradle integration or Gradle wrapper once added.
3. Default port: `8080`.

Environment variables (optional overrides):
- `SPRING_DATASOURCE_URL` (default `jdbc:postgresql://localhost:5432/FocusProject2`)
- `SPRING_DATASOURCE_USERNAME` (default `fp2`)
- `SPRING_DATASOURCE_PASSWORD` (default `fp2_dev_password`)
- `SPRING_FLYWAY_ENABLED` (default `true`)

## API Endpoints
- `GET /api/customers`
  - Returns all customers with address + validation state for UI table.
- `GET /api/customers/validation-queue`
  - Returns customers not yet validated.
- `POST /api/geocoding/{customerId}/suggest`
  - Returns geocode candidates (currently mocked candidate generation for MVP).
- `POST /api/geocoding/{customerId}/confirm`
  - Persists candidate in `customer_geocodes` and updates address to `VALIDATED`.

## Notes
- Geocoding suggest currently uses deterministic mock data to unblock UI flow.
- Replace mock candidate generation with Google Maps API integration in `suggestGeocodes` for step 2.

## Deployment Target
- Docker container on ECS Fargate.
