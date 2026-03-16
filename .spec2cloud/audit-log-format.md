# Audit Log Format

The audit log (`.spec2cloud/audit.log`) is an append-only record of every action the orchestrator performs. While `state.json` captures the **current position**, the audit log captures the **full history** — useful for debugging, compliance, and understanding how the project reached its current state.

## Line Format

Each entry is a single line:

```
[ISO-timestamp] phase={phase} action={action} feature={feature?} iteration={iter?} result={result} details={details?}
```

| Field       | Required | Description |
|-------------|----------|-------------|
| `timestamp` | yes      | ISO 8601 UTC timestamp enclosed in brackets. |
| `phase`     | yes      | The orchestrator phase that produced the event. |
| `action`    | yes      | What happened — one of the standard actions listed below. |
| `feature`   | no       | FRD / feature ID when the action is scoped to a single feature. |
| `iteration` | no       | Red-green-refactor iteration number (implementation phase only). |
| `result`    | yes      | Outcome: `success`, `failure`, `skipped`, `pending`, `approved`, `rejected`. |
| `details`   | no       | Free-text context (test counts, error summaries, URLs, etc.). |

## Standard Actions

| Phase              | Action               | Description |
|--------------------|----------------------|-------------|
| spec-refinement    | `review-prd`         | AI reviewed the PRD and suggested changes. |
| spec-refinement    | `review-frd`         | AI reviewed an FRD and suggested changes. |
| gherkin-generation | `generate-gherkin`   | Gherkin feature file generated from an approved FRD. |
| test-generation    | `generate-tests`     | Test scaffolds (Cucumber, Playwright, xUnit) generated for a feature. |
| contract-generation | `generate-api-contract` | API contract (YAML) generated for a feature from Gherkin + tests. |
| contract-generation | `generate-shared-types` | Shared TypeScript types generated for a feature from API contract. |
| contract-generation | `generate-infra-contract` | Infrastructure resource contract generated across all features. |
| contract-generation | `validate-contracts` | Cross-validation of all contracts for completeness and consistency. |
| implementation     | `implement`          | Code written or modified for a feature iteration. |
| implementation     | `run-tests`          | Test suite executed during implementation. |
| deployment         | `provision`          | Azure resources provisioned via `azd provision`. |
| deployment         | `deploy`             | Application deployed via `azd deploy`. |
| deployment         | `smoke-test`         | Post-deployment smoke tests executed. |
| deployment         | `rollback`           | Deployment rolled back after failure. |
| any                | `human-gate-approve` | Human approved a gate checkpoint. |
| any                | `human-gate-reject`  | Human rejected a gate checkpoint. |
| any                | `phase-transition`   | Orchestrator moved from one phase to the next. |

## Example Log

The following shows a realistic progression from spec-refinement through mid-implementation:

```
[2025-01-15T09:00:12Z] phase=shell-setup action=phase-transition result=success details="Initialized nextjs-typescript shell for contoso-tasks"
[2025-01-15T09:05:34Z] phase=spec-refinement action=review-prd result=success details="Pass 1 — 4 suggestions applied"
[2025-01-15T09:12:47Z] phase=spec-refinement action=review-prd result=success details="Pass 2 — 2 suggestions applied"
[2025-01-15T09:18:03Z] phase=spec-refinement action=review-prd result=success details="Pass 3 — 0 suggestions, recommending approval"
[2025-01-15T09:18:45Z] phase=spec-refinement action=human-gate-approve result=approved details="PRD approved by user"
[2025-01-15T09:20:11Z] phase=spec-refinement action=review-frd feature=FRD-001 result=success details="Pass 1 — 1 suggestion applied"
[2025-01-15T09:24:30Z] phase=spec-refinement action=review-frd feature=FRD-002 result=success details="Pass 1 — 0 suggestions"
[2025-01-15T09:28:55Z] phase=spec-refinement action=review-frd feature=FRD-003 result=success details="Pass 1 — 3 suggestions applied"
[2025-01-15T09:30:02Z] phase=spec-refinement action=human-gate-approve result=approved details="All FRDs approved by user"
[2025-01-15T09:30:05Z] phase=spec-refinement action=phase-transition result=success details="spec-refinement → gherkin-generation"
[2025-01-15T09:31:20Z] phase=gherkin-generation action=generate-gherkin feature=FRD-001 result=success details="6 scenarios in user-authentication.feature"
[2025-01-15T09:33:48Z] phase=gherkin-generation action=generate-gherkin feature=FRD-002 result=success details="8 scenarios in task-management.feature"
[2025-01-15T09:35:10Z] phase=gherkin-generation action=generate-gherkin feature=FRD-003 result=success details="4 scenarios in notifications.feature"
[2025-01-15T09:35:55Z] phase=gherkin-generation action=human-gate-approve result=approved details="Gherkin features approved by user"
[2025-01-15T09:36:00Z] phase=gherkin-generation action=phase-transition result=success details="gherkin-generation → test-generation"
[2025-01-15T09:38:22Z] phase=test-generation action=generate-tests feature=FRD-001 result=success details="Cucumber steps + Playwright spec + xUnit tests generated"
[2025-01-15T09:41:05Z] phase=test-generation action=generate-tests feature=FRD-002 result=success details="Cucumber steps + Playwright spec + xUnit tests generated"
[2025-01-15T09:43:30Z] phase=test-generation action=generate-tests feature=FRD-003 result=success details="Cucumber steps + Playwright spec + xUnit tests generated"
[2025-01-15T09:44:00Z] phase=test-generation action=run-tests result=success details="Red baseline verified — all 42 tests fail as expected"
[2025-01-15T09:44:05Z] phase=test-generation action=phase-transition result=success details="test-generation → contract-generation"
[2025-01-15T09:46:00Z] phase=contract-generation action=generate-api-contract feature=FRD-001 result=success details="3 endpoints in user-auth.yaml"
[2025-01-15T09:48:00Z] phase=contract-generation action=generate-shared-types feature=FRD-001 result=success details="6 types in src/shared/types/user-auth.ts"
[2025-01-15T09:50:00Z] phase=contract-generation action=generate-api-contract feature=FRD-002 result=success details="5 endpoints in task-management.yaml"
[2025-01-15T09:52:00Z] phase=contract-generation action=generate-shared-types feature=FRD-002 result=success details="8 types in src/shared/types/task-management.ts"
[2025-01-15T09:54:00Z] phase=contract-generation action=generate-api-contract feature=FRD-003 result=success details="2 endpoints in notifications.yaml"
[2025-01-15T09:55:00Z] phase=contract-generation action=generate-shared-types feature=FRD-003 result=success details="4 types in src/shared/types/notifications.ts"
[2025-01-15T09:57:00Z] phase=contract-generation action=generate-infra-contract result=success details="5 resources in resources.yaml"
[2025-01-15T09:58:00Z] phase=contract-generation action=validate-contracts result=success details="All contracts consistent — 10 endpoints, 18 types, 5 resources"
[2025-01-15T09:59:00Z] phase=contract-generation action=human-gate-approve result=approved details="Contracts approved by user"
[2025-01-15T09:59:05Z] phase=contract-generation action=phase-transition result=success details="contract-generation → implementation"
[2025-01-15T10:02:18Z] phase=implementation action=implement feature=FRD-001 iteration=1 result=success details="Auth endpoints scaffolded"
[2025-01-15T10:05:44Z] phase=implementation action=run-tests feature=FRD-001 iteration=1 result=failure details="unit: 8/12 pass, gherkin: 2/6 pass, playwright: 0/3 pass"
[2025-01-15T10:20:33Z] phase=implementation action=implement feature=FRD-001 iteration=2 result=success details="JWT middleware + login flow"
[2025-01-15T10:23:50Z] phase=implementation action=run-tests feature=FRD-001 iteration=2 result=failure details="unit: 12/12 pass, gherkin: 5/6 pass, playwright: 2/3 pass"
[2025-01-15T10:35:12Z] phase=implementation action=implement feature=FRD-001 iteration=3 result=success details="Fixed redirect after login"
[2025-01-15T10:37:28Z] phase=implementation action=run-tests feature=FRD-001 iteration=3 result=success details="unit: 12/12 pass, gherkin: 6/6 pass, playwright: 3/3 pass — feature complete"
[2025-01-15T12:10:05Z] phase=implementation action=implement feature=FRD-002 iteration=1 result=success details="Task CRUD API + DB schema"
[2025-01-15T12:14:22Z] phase=implementation action=run-tests feature=FRD-002 iteration=1 result=failure details="unit: 10/15 pass, gherkin: 3/8 pass, playwright: 1/4 pass"
```

## Notes

- The log file is **append-only** — the orchestrator never modifies or truncates existing entries.
- Entries are written **after** `state.json` is updated, so the log always trails state by at most one action.
- The log is committed alongside `state.json` so the full history travels with the repository.
- To correlate a log entry with a state snapshot, compare `lastUpdated` in `state.json` with the log timestamp.
