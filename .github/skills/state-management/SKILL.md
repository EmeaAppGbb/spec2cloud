---
name: state-management
description: Read, write, and maintain .spec2cloud/state.json across phases and increments. Defines the state schema, read/write protocol, and resume re-validation logic. Use when reading project state, updating state after task completion, or resuming from a previous session.
---

# State Management

State lives in `.spec2cloud/state.json`. You read it at the start of every loop iteration and write it at the end.

## Reading State

At the **start of every loop iteration**:
1. Read `.spec2cloud/state.json`
2. Parse `currentPhase` to determine where you are (setup, discovery, or increment-delivery)
3. If in `increment-delivery`, parse `currentIncrement` and its `steps` to determine what's been done and what's next
4. Parse `humanGates` to check which approvals have been granted

## Writing State

At the **end of every loop iteration**:
1. Update the relevant section with the result of the task you just executed
2. Update `lastUpdated` to the current ISO timestamp
3. Write the updated state back to `.spec2cloud/state.json`

## State File Schema

See [references/schema.md](references/schema.md) for the full JSON schema example and field descriptions.

## Increment Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"pending"` \| `"in-progress"` \| `"done"` | Overall increment delivery status. `"done"` only when Step 4 (Verify & Ship) completes. |
| `steps` | object | Per-step status tracking: `tests`, `contracts`, `implementation`, `verification`. |

## Step Object Fields

| Step | Key Fields | Description |
|------|-----------|-------------|
| `tests` | `e2eSpecs`, `gherkinFiles`, `cucumberSteps`, `vitestFiles` | Files generated for this increment's test scaffolding. |
| `contracts` | `apiContracts`, `sharedTypes`, `infraUpdated` | Contract artifacts for this increment. |
| `implementation` | `slices` (api, web, integration) | Per-slice tracking with `modifiedFiles`, `failingTests`, `lastTestRun`, `iteration`. |
| `verification` | `regression`, `deployment`, `smokeTests`, `docs` | Full regression results, deployment URL, smoke test results, docs status. |

## Slice Dependencies (within implementation)

```
Contracts → api  (api slice reads contract types)
Contracts → web  (web slice reads contract types)
api + web → integration  (integration requires both slices done)
integration → verification  (verify requires all slices green)
```

## On Resume

1. Read `.spec2cloud/state.json`
2. Determine current increment and current step within it
3. Re-validate by running the appropriate test suite:
   - Tests step: verify test files exist and compile
   - Implementation step: run tests for the current slice, compare to state
   - Verification step: check deployment status
4. If results match state → continue from where you left off
5. If results differ → update state to reflect reality, then continue
