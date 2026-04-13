# ADR-0014: How should vehicles and delivery capacities be modeled?

- **Date:** 2026-04-14
- **Status:** Proposed
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The optimization problem includes vehicle capacity constraints.
The platform therefore needs a model for vehicles and customer delivery demand.
The model should be simple enough for the project scope but explicit enough to support capacitated vehicle routing.
How should vehicles and delivery capacities be modeled?

## Decision Summary
Model vehicles as explicit records with capacity values, and model customer delivery demand as demand units used by the optimizer.

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
- The model can support different capacities if vehicles are not identical.
- Demand units already exist in the routing metadata concept and can be connected to vehicle capacity.
- Keeping vehicles in the database avoids hard-coding fleet assumptions inside the optimizer.

## Consequences
### Good
- Vehicle capacity constraints can be represented clearly.
- The optimizer receives explicit fleet input.
- The model can evolve if vehicle availability, vehicle type, or capacity differs.

### Bad
- Additional tables and validation rules are required.
- The project must define the unit used for demand and capacity.
- If all vehicles are identical, the model is more explicit than strictly necessary for a prototype.
