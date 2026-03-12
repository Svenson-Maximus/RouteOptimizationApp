# Current Status Handover

## Scope
This file captures the current implementation state so work can continue in a new context window without rediscovery.

## What Is Implemented

### Frontend (`apps/frontend/address-validation-ui`)
- React + Vite app scaffolded and working.
- Clean-layer style structure:
  - `domain`
  - `application/usecases`
  - `infrastructure/api`
  - `presentation`
- UI modules (collapsed-first UX):
  1. `Customers` (accordion cards, status + source tour labels)
  2. `Geocoding Desk` (queue, suggest, confirm flow)
  3. `Optimization Studio` (future workflow preview UI, mock run output)
- API base URL support via `VITE_API_BASE_URL` (default `http://localhost:8080`).

### Backend (`apps/services/customer-master-service`)
- Spring Boot service scaffolded (Java 21, Gradle).
- Gradle wrapper added (`gradlew`, `gradlew.bat`).
- Endpoints implemented:
  - `GET /api/customers`
  - `GET /api/customers/validation-queue`
  - `POST /api/geocoding/{customerId}/suggest`
  - `POST /api/geocoding/{customerId}/confirm`
- PostgreSQL integration via JDBC.
- Flyway configured with `baseline-on-migrate=true` for existing non-empty schema.
- CORS configured for frontend dev origin (`http://localhost:5173`).

## Data Work Already Done
- Imported/cleaned operational dataset in PostgreSQL (`92` customer rows currently).
- Corrected multiple mixed `name/address` rows.
- Export created for manual QA:
  - `data/fp2_full_manual_review.csv`
- Source tour labels are available from import audit JSON and exposed as `sourceSheet` in customer API.

## Important Known Gaps
1. Geocoding suggest endpoint currently returns deterministic mock candidates (`GOOGLE_MOCK`).
2. Optimization Studio is UI-only preview (no real optimization-run backend endpoint yet).
3. Some encoding display issues (`ZÃ¼rich`) can appear in terminal/CSV viewers if UTF-8 is not respected.

## How To Run

### Start Docker DB
```powershell
docker compose -f infra/local/docker-compose.yml --env-file infra/local/.env up -d
```

### Start Backend
```powershell
cd apps/services/customer-master-service
.\gradlew.bat bootRun
```

### Start Frontend
```powershell
cd apps/frontend/address-validation-ui
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

### Access
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api/customers`

## How To Stop

### Stop Frontend/Backend processes
- Stop terminal sessions running `npm run dev` and `bootRun`, or kill listeners on `5173` and `8080`.

### Stop Docker DB
```powershell
docker compose -f infra/local/docker-compose.yml --env-file infra/local/.env down
```

## Suggested Next Tasks
1. Replace mock geocoding suggest with real Google Geocoding API integration in backend.
2. Add persistent optimization run API (start run + status + summary payload) for Optimization Studio.
3. Add backend tests for repository query mapping and geocode confirmation flow.
4. Add UI filtering/search by source tour (`ZH1 See`/`ZH2 Stadt`) and validation status.

## Last Commit
- `c446140`
- `feat: scaffold address verification UI and spring backend workflow`
