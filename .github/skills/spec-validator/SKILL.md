---
name: spec-validator
description: Validate consistency and traceability across the specification chain (PRD → FRD → Gherkin). Detect gaps, orphans, contradictions, and missing coverage. Use at Phase 2 exit (before human gate), Phase 3 entry (before e2e generation), Phase 4 entry (before Gherkin generation), on resume (re-validate specs haven't drifted), or after human edits to any spec file (specs/prd.md, specs/frd-*.md, specs/features/*.feature).
---

# Spec Validator

Validate that every requirement traces from PRD → FRD → Gherkin with no gaps or orphans.

## Steps

1. **Parse PRD** — Extract all user stories and requirements from `specs/prd.md`
2. **Parse FRDs** — For each `specs/frd-*.md`, extract all functional requirements
3. **Trace PRD → FRD** — Verify every PRD requirement maps to at least one FRD
4. **Parse Gherkin** — For each `specs/features/*.feature`, extract all scenarios
5. **Trace FRD → Gherkin** — Verify every FRD requirement has at least one Gherkin scenario
6. **Detect orphans** — Find Gherkin scenarios that don't trace back to any FRD requirement
7. **Detect contradictions** — Flag requirements that conflict across FRDs
8. **Report** — Generate a coverage summary

## Output Format

```
Coverage: <percentage>% of requirements have Gherkin scenarios
Verdict: PASS | FAIL

Gaps (requirements without scenarios):
- <FRD file>: <requirement description>

Orphans (scenarios without requirements):
- <feature file>: <scenario name>

Contradictions:
- <FRD file A> vs <FRD file B>: <description>
```
