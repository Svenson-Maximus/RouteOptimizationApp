# ADR-0015: How should CVRPTW be modeled?

- **Date:** 2026-04-14
- **Status:** Proposed
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The platform must generate delivery routes for customers with delivery time windows and limited vehicle capacity.
The route optimizer must combine travel times, customer delivery constraints, vehicle capacities, and customer demand.
How should CVRPTW be modeled?

## Decision Summary
Model the route planning problem as a Capacitated Vehicle Routing Problem with Time Windows using OR-Tools.
Combine the OR-Tools time-window routing model with the OR-Tools capacity dimension model.

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
- The Time dimension uses the persisted duration matrix, service times, and customer time windows.
- The Capacity dimension uses `demand_units` per customer and `capacity_units` per vehicle.
- The initial model uses two vehicles with `capacity_units = 100` and default customer `demand_units = 1` until real delivery quantities are available.
- Modeling the problem as CVRPTW matches the practical delivery planning problem better than a distance-only route optimization.
- VRPTW without capacity was not selected because delivery quantities must fit into vehicles.
- CVRP without time windows was not selected because customer delivery time windows are part of the problem.
- Manual route planning was not selected because the project goal is algorithmic route optimization.

## Consequences
### Good
- The optimization model reflects both delivery timing and vehicle capacity constraints.
- The same model can use validated customer data, stored matrix data, and vehicle data.
- The optimization objective can later be tuned for total travel time, distance, route balance, or dropped stops.

### Bad
- CVRPTW is more complex than a basic shortest-route problem.
- Input data quality has a strong impact on optimization results.
- The model requires complete time windows, demand units, vehicle capacities, and matrix values before reliable optimization is possible.
