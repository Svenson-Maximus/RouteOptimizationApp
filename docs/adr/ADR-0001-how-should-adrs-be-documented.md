# ADR-0001: How should ADRs be documented?

- **Date:** 2026-03-17
- **Status:** Accepted
- **Deciders:** Sven Leutenegger

## Context and Problem Statement
Architectural decisions in this project need to be documented in a way that is easy to read, maintain in Git, and keep consistent across the repository.
How should ADRs be documented?

## Decision Summary
Use Nygard-inspired Markdown Architectural Decision Records with explicit considered options.

## Considered Options
- Nygard-inspired Markdown ADRs with explicit considered options
- Pure Michael Nygard ADR template
- Full MADR-style Markdown ADR template
- Other ADR templates
- Formless documentation without a fixed ADR convention

## Decision Outcome
Chosen option: **Nygard-inspired Markdown ADRs with explicit considered options**.

### Justification
- Decisions need to stay readable inside the repository without special tooling.
- Markdown works naturally with Git, code review, and thesis documentation.
- A fixed structure makes ADRs easier to compare and maintain over time.
- The template keeps the Nygard ADR core structure: context, decision, and consequences.
- Explicit considered options and justification make alternatives visible for review.
- A pure Nygard template was not selected because the project benefits from documenting alternatives more explicitly.
- A full MADR-style template was not selected because the project only needs a compact structure.
- Other ADR templates were not selected because they would add another convention without a clear benefit for this project.
- Using one format across all ADRs avoids mixing documentation styles within the same project.
- Formless documentation was not selected because it would make the decision records harder to compare and review.

## Consequences
### Good
- ADRs stay lightweight and easy to update.
- Decision records are versioned together with the codebase.
- The project keeps one uniform documentation style.
- Readers can quickly find the same sections in every ADR.

### Bad
- Existing ADRs must be adjusted whenever the chosen template changes.
- The project is constrained to one structure even if another template might fit a specific decision better.
