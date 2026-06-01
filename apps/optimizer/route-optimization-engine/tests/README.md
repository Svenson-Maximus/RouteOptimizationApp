# Optimizer Test Structure

Python optimizer tests are grouped by risk:

- `unit`: pure formatting, validation, matrix, and result-mapping tests.
- `integration`: database-backed matrix loading and OR-Tools solve runs.
- `property`: invariant tests for route constraints.
- `regression`: fixed historical datasets and expected outputs.

Recommended tools:

- pytest
- hypothesis
- jsonschema
