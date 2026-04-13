# ADR-0001: Which format should be used for architectural decision records?

- **Date:** 2026-03-17
- **Status:** Accepted
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
Architectural decisions in this project need to be documented in a way that is easy to read, maintain in Git, and keep consistent across the repository.
Which format and structure should these records follow?

## Decision Summary
Use Markdown Architectural Decision Records with one consistent template across the project.

## Considered Options
- MADR-style Markdown ADRs with a fixed structure
- Michael Nygard's ADR template
- Other ADR templates
- Formless documentation without a fixed ADR convention

## Decision Outcome
Chosen option: **MADR-style Markdown ADRs with one fixed project template**.

### Justification
- Decisions need to stay readable inside the repository without special tooling.
- Markdown works naturally with Git, code review, and thesis documentation.
- A fixed structure makes ADRs easier to compare and maintain over time.
- The template is lean enough for this project and still explicit enough to capture the decision problem, alternatives, chosen outcome, and reasoning.
- Using one format across all ADRs avoids mixing documentation styles within the same project.

## Consequences
### Good
- ADRs stay lightweight and easy to update.
- Decision records are versioned together with the codebase.
- The project keeps one uniform documentation style.
- Readers can quickly find the same sections in every ADR.

### Bad
- Existing ADRs must be adjusted whenever the chosen template changes.
- The project is constrained to one structure even if another template might fit a specific decision better.
