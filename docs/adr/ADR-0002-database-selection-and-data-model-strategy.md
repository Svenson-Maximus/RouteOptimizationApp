# ADR-0002: Database Selection and Data Model Strategy

- **Date:** 2026-03-05
- **Status:** Accepted
- **Deciders:** Student

## Concern
The platform manages customers, addresses, geocoding results, delivery profiles, and routing metadata that are strongly related and must remain consistent. This concern is driven by the need for traceability, structured operational data, and reliable updates across multiple related entities.

## Decision Issue
Which database technology and data model strategy should be used as the system of record for the platform?

## Alternatives
1. **PostgreSQL with a relational data model**
2. **NoSQL-only approach**

## Outcome
The chosen alternative is **PostgreSQL with a relational data model**.

## Rationale
- The domain contains strongly related entities that benefit from foreign keys and referential integrity.
- Multi-table updates require transactional consistency.
- The relational model fits the operational workflows around customers, addresses, geocoding, and route planning readiness.
- PostgreSQL is mature, well-supported, and suitable for both local development and cloud deployment.
- The chosen approach leaves room for future extensions such as geospatial capabilities if they become necessary.

## Constraints And Revision Conditions
- This rationale assumes the core domain remains structured and relationship-heavy.
- If future requirements become document-heavy, schema-volatile, or event-store-oriented, the decision may need revision.
- If geospatial querying becomes a major architectural concern, PostgreSQL extensions or complementary data services may need to be introduced.

## Architecture Rationale
The relational approach provides the strongest fit for the current operational model and gives the architecture a clear, consistent system of record.

## Affected Architecture Description Elements
- Database technology choice
- Logical data model
- Persistence strategy for customer and routing data
