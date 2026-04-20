# ADR-0014: How should vehicles and capacity be modeled?

- **Date:** 2026-04-14
- **Status:** Proposed
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The optimization problem includes vehicle capacity constraints.
The platform therefore needs a model for vehicles and customer delivery demand.
The model should be simple enough for the project scope but explicit enough to support capacitated vehicle routing.
The previous thesis states that the bakery operates two vans and that the vans were not the main limiting factor in the VRPTW prototype.
How should vehicles and capacity be modeled?

## Decision Summary
Model vehicles as explicit records with capacity values, and model customer delivery demand as demand units used by the optimizer.
Initialize the project data with two active vehicles, each with `capacity_units = 100`, until real vehicle loading capacities are available.

## Considered Options
- Explicit vehicle records with capacity values
- Fixed vehicle count and capacity only in optimizer configuration
- Vehicle data stored as free-text configuration
- No vehicle capacity model

## Decision Outcome
Chosen option: **explicit vehicle records with capacity values**.

### Justification
- CVRPTW requires both customer demand and vehicle capacity.
- Explicit vehicle records make the fleet visible in the data model and architecture diagrams.
- The thesis documents two delivery vans, and the legacy OR-Tools script uses `num_vehicles = 2`.
- `capacity_units = 100` is a placeholder assumption that keeps the capacity model complete without claiming real loading data.
- Customer demand defaults to `1` demand unit until real delivery quantities are available.
- The model can support different capacities if vehicles are not identical.
- Demand units already exist in the routing metadata concept and can be connected to vehicle capacity.
- Keeping vehicles in the database avoids hard-coding fleet assumptions inside the optimizer.
- Fixed vehicle count and capacity only in optimizer configuration was not selected because fleet assumptions should be visible in the data model.
- Free-text vehicle configuration was not selected because capacity values must be structured for optimization.
- No vehicle capacity model was not selected because the target problem is capacitated vehicle routing.

## Consequences
### Good
- Vehicle capacity constraints can be represented clearly.
- The optimizer receives explicit fleet input.
- The model can evolve if vehicle type or capacity differs.
- Real capacity and delivery quantity values can replace the defaults without changing the model structure.

### Bad
- Additional tables and validation rules are required.
- The initial `100` capacity units and `1` demand unit per customer are assumptions, not measured loading quantities.
- If all vehicles are identical and real demand is missing, the capacity dimension may not constrain the current routes strongly.
