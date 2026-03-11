# Address Validation UI

React frontend for address cleanup, geocoding verification, and optimization readiness.

## Run
1. `cd apps/frontend/address-validation-ui`
2. `npm install`
3. `npm run dev`

## Current Features
- `Customers` view: list of all customers with address and validation state.
- `Geocoding Review` view: validation queue, geocode suggestions, and candidate confirmation.

## Architecture Style
- `domain`: domain model definitions
- `application/usecases`: UI-facing business actions
- `infrastructure/api`: API integration + fallback mock adapters
- `presentation`: pages and UI components

## API Integration
By default, the UI falls back to local mock data if backend endpoints are not available.
Use `VITE_API_BASE_URL` to point to your backend API.
