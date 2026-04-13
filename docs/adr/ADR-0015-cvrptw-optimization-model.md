# ADR-0015: How should the optimization problem be modeled as a CVRPTW?

- **Date:** 2026-04-14
- **Status:** Proposed
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The platform must generate delivery routes for customers with delivery time windows and limited vehicle capacity.
The route optimizer must combine travel times, customer delivery constraints, vehicle capacities, and customer demand.
How should the optimization problem be modeled as a CVRPTW?

## Decision Summary
Model the route planning problem as a Capacitated Vehicle Routing Problem with Time Windows using OR-Tools.

## Considered Options
- Capacitated Vehicle Routing Problem with Time Windows
- Vehicle Routing Problem with Time Windows only
- Capacitated Vehicle Routing Problem without time windows
- Manual route planning supported by reports

## Decision Outcome
Chosen option: **Capacitated Vehicle Routing Problem with Time Windows**.

### Justification
- Delivery time windows are required because customers can only be served during specific periods.
- Vehicle capacity is required because delivery quantities must fit into the available fleet.
- Travel-time matrix values provide the time dimension used by the optimizer.
- Customer demand units and vehicle capacity values provide the capacity dimension.
- OR-Tools supports combining time-window constraints and capacity constraints in one routing model.
- Modeling the problem as CVRPTW matches the practical delivery planning problem better than a distance-only route optimization.

## Consequences
### Good
- The optimization model reflects both delivery timing and vehicle capacity constraints.
- The same model can use validated customer data, stored matrix data, and vehicle data.
- The optimization objective can later be tuned for total travel time, distance, route balance, or dropped stops.

### Bad
- CVRPTW is more complex than a basic shortest-route problem.
- Input data quality has a strong impact on optimization results.
- The model requires complete time windows, demand units, vehicle capacities, and matrix values before reliable optimization is possible.
