# Architecture Overview

This folder is the entry point for architecture documentation of Focus Project 2.

## Goal
Build a production-like platform that:
1. Imports Excel-based customer and delivery data into PostgreSQL.
2. Validates and geocodes addresses with Google Maps.
3. Allows staff to correct and confirm addresses in a frontend.
4. Runs CVRPTW optimization (capacity + time windows) with OR-Tools.

## System at a Glance
- Frontend: React address validation and operations UI
- Business services (microservices):
  - Data Integration Service
  - Customer Master Service
  - Geocoding Service
  - Optimization Orchestrator Service
- Optimization engine: Python + OR-Tools
- Data layer: PostgreSQL (relational), Flyway migrations
- Cloud target: AWS (S3/CloudFront, ECS/Fargate, RDS)

## Main Data Flow
1. Excel upload is processed by Data Integration Service.
2. Customer and address records are stored with `needs_validation` state.
3. UI lists unresolved addresses.
4. Geocoding Service proposes formatted address and coordinates.
5. Staff confirms or edits address.
6. Only validated and geocoded records are passed to optimization.

## Document Map
- `context.md`: C4 system context
- `containers.md`: C4 container view
- `components.md`: C4 component view
- `deployment.md`: deployment view
- `adr/0001-record-architecture.md`: architecture decision record
