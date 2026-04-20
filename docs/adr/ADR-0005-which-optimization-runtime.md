# ADR-0005: Which optimization runtime?

- **Date:** 2026-04-14
- **Status:** Accepted
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
The platform must solve a vehicle routing problem with delivery time windows and vehicle capacity constraints.
The optimizer needs a runtime and library ecosystem that can model routing constraints without implementing all search logic from scratch.
Which optimization runtime should be used?

## Decision Summary
Use Python with Google OR-Tools for the route optimization engine.

## Considered Options
- Python with Google OR-Tools
- Java with Google OR-Tools
- Custom heuristic implementation
- Commercial optimization solver

## Decision Outcome
Chosen option: **Python with Google OR-Tools**.

### Justification
- OR-Tools provides established support for vehicle routing problems, time windows, and capacity constraints.
- Python is widely used for optimization experiments, scripting, and data processing, which makes it practical for the route optimization engine.
- Existing legacy optimization scripts are already written in Python.
- Keeping the optimizer separate from business services allows the optimization model to evolve independently.
- A custom solver would add unnecessary algorithmic risk for the project scope.
- Java with OR-Tools was not selected because the existing optimization examples and legacy scripts are Python-based.
- A commercial solver was not selected because it would add licensing and integration overhead that is not needed for the project scope.

## Consequences
### Good
- The project can use proven vehicle routing functionality.
- Optimization logic can be developed and tested independently.
- Existing Python work can be reused or migrated.

### Bad
- The platform uses another runtime in addition to Java and JavaScript.
- Data contracts between the orchestrator and optimizer must be defined clearly.
