# ADR-0013: How should customer delivery data be modeled?

- **Date:** 2026-04-14
- **Status:** Proposed
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The optimizer needs customer-related input such as address, geocode, delivery day, time window, service time, and delivery demand.
This data must be modeled separately from basic customer identity so that operational data can be validated before optimization.
Real delivery quantities are not yet available in the current dataset, but the CVRPTW model still needs a complete demand field.
How should customer delivery data be modeled?

## Decision Summary
Model customer identity, address/geocode data, delivery profiles, and routing metadata as separate but related relational entities.
Store customer delivery quantity as `demand_units`, using a documented default of `1` until real delivery quantities are available.

## Considered Options
- Separate relational entities for customer delivery data
- One wide customer table
- JSON-based delivery profile stored inside the customer record
- Optimizer-only CSV input files

## Decision Outcome
Chosen option: **separate relational entities for customer delivery data**.

### Justification
- Customer identity, address validation, geocoding, and delivery constraints change for different reasons.
- Time windows, delivery days, service time, and demand units belong to delivery profiles and routing metadata rather than the basic customer record.
- `demand_units` gives the optimizer a consistent capacity input for every customer.
- Until real delivery quantities are available, `demand_units = 1` keeps the database complete and makes the default explicit.
- Separating geocode data allows raw addresses and confirmed coordinates to be tracked independently.
- The model supports readiness checks before a customer is included in optimization.
- The existing database structure already separates customers, addresses, geocodes, delivery profiles, and routing metadata.
- One wide customer table was not selected because identity, address, geocoding, delivery constraints, and routing metadata change independently.
- JSON inside the customer record was not selected because important optimization fields should remain queryable and constrained.
- Optimizer-only CSV input files were not selected because the platform needs validated operational data before optimization.

## Consequences
### Good
- The optimizer can consume clean and validated input data.
- Customer master data remains separate from optimization-specific metadata.
- The model supports data-quality workflows before route planning.
- The model is ready for real delivery quantities once they become available.

### Bad
- Queries require joins across multiple tables.
- The data import process must populate several related entities consistently.
- Validation rules must ensure that optimization-required fields are complete.
- Default demand values do not represent real delivery quantity and must be treated as assumptions.
