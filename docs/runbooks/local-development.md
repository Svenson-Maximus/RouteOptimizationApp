# Local Development Runbook

## Prerequisites
- Docker Desktop
- Java 21
- Python 3.12
- Node.js 22

## Why Flyway
- Flyway applies SQL migrations in order so every environment has the same schema.
- Migration files are versioned in Git and executed automatically at service startup.

## Start local database
1. Copy `infra/local/.env.example` to `infra/local/.env`.
2. Run: `docker compose --env-file .env -f docker-compose.yml up -d`

## Flyway migration workflow (planned)
1. Create migration SQL files in `db/migration`.
2. Start the service; Flyway runs pending migrations automatically.
3. Verify tables in PostgreSQL (`localhost:5432`) via psql or pgAdmin.

## Current endpoint plan
- Services run on `localhost` during development.
- PostgreSQL runs on `localhost:5432`.
- pgAdmin runs on `localhost:5050`.
