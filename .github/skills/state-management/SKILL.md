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

## Brownfield State Fields

When operating in brownfield mode, the state includes additional fields for testability tracking and per-feature track assignment.

| Field | Type | Description |
|-------|------|-------------|
| `brownfield.testability` | `"full"` \| `"partial"` \| `"none"` | Overall testability verdict after the testability gate. |
| `brownfield.track` | `"A"` \| `"B"` \| `"hybrid"` | Delivery track: A (testable, green baseline), B (doc-only), or hybrid (mix per feature). |
| `brownfield.testabilityChecklist` | object | Six binary checks: `canBuild`, `externalDepsReachable`, `apiExercisable`, `uiRenderable`, `devEnvExists`, `existingTestsRunnable`. |
| `brownfield.featureTracks` | object | Map of `featureId → "A" \| "B"`. Only present when `track` is `"hybrid"`. |
| `brownfield.greenBaseline` | object | Track A metrics: per-feature `scenarios` count, `testsPass` boolean, `lastVerified` ISO timestamp. |
| `brownfield.behavioralDocs` | object | Track B metrics: per-feature `scenarios` count and `manualChecklist` item count. |

## Brownfield State Transitions

| Trigger | Phase | State Updates |
|---------|-------|---------------|
| Extraction complete | `"B1"` | `currentPhase: "B1"`, extraction output paths recorded in `brownfield.extraction` |
| Spec-Enable complete | `"B2"` | `currentPhase: "B2"`, `brownfield.prdGenerated: true`, `brownfield.frdCount: N` |
| Testability gate complete | `"B3"` | `currentPhase: "B3"`, `brownfield.testability`, `brownfield.track`, `brownfield.testabilityChecklist` recorded |
| Track A baseline green | *(still B3)* | `brownfield.greenBaseline.features` populated with per-feature test results |
| Track B docs complete | *(still B3)* | `brownfield.behavioralDocs.features` populated with per-feature scenario/checklist counts |
| Path selection (human gate) | `"assessment"` | `brownfield.selectedPaths` array recorded (e.g., `["modernize", "security"]`) |
| Assessment + planning done | `"increment-delivery"` | Increments generated, `incrementPlan` populated, delivery proceeds track-aware |

When `track` is `"hybrid"`, each increment in Phase 2 inherits its track from `featureTracks`. Track A increments follow the full test → contract → implement → verify cycle. Track B increments follow a doc-only path (behavioral docs + manual checklists instead of automated green baselines).

## On Resume

1. Read `.spec2cloud/state.json`
2. Determine current increment and current step within it
3. Re-validate by running the appropriate test suite:
   - Tests step: verify test files exist and compile
   - Implementation step: run tests for the current slice, compare to state
   - Verification step: check deployment status
4. If results match state → continue from where you left off
5. If results differ → update state to reflect reality, then continue
