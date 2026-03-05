# Optimization Orchestrator Service

Service that controls optimization runs and exposes run status to the UI.

## Responsibilities
- Start optimization runs with clean input data only.
- Coordinate input/output exchange with the Python optimizer.
- Persist run metadata and status.

## Deployment Target
- Docker container on ECS Fargate.
