# .spec2cloud — State Persistence

This directory holds the persistent state that lets spec2cloud resume from any point after a session interruption. Both files are committed to the repository.

| File | Purpose |
|------|---------|
| `state.json` | Current position — what phase we're in, what's done, what's next. |
| `audit.log` | Full history — every action the orchestrator has taken, in order. |

## Why state is committed to the repo

- **Shared across machines** — any developer (or CI agent) can clone the repo and resume exactly where the last session left off.
- **Visible in git history** — every `state.json` change is a commit, giving a natural timeline of project progression.
- **No external dependencies** — no database, no cloud service, no session cookies. The repo is the single source of truth.
- **Reproducible** — `git log --oneline -- .spec2cloud/state.json` shows every state transition.

## How the orchestrator uses state

### Startup: read & validate

```
1. Read .spec2cloud/state.json (or create a fresh one if missing).
2. Validate against state-schema.json.
3. Set currentPhase as the entry point for the orchestrator loop.
```

If validation fails (e.g. a schema upgrade added new fields), the orchestrator applies safe defaults for missing fields and logs a warning to `audit.log`.

### Loop iteration: act & persist

Each iteration of the orchestrator loop follows this cycle:

```
1. Perform one action in the current phase.
2. Update phaseState with the results.
3. Check if the phase is complete → if yes, advance currentPhase.
4. Write state.json to disk.
5. Append an entry to audit.log.
6. Commit both files: git add .spec2cloud/ && git commit -m "spec2cloud: {action summary}"
```

State is written **after every action**, not just at the end of a phase. This means an interruption at any point loses at most one action.

### Phase-boundary commits

At the exit of each phase, a formal commit bundles all phase artifacts:

```
git add -A && git commit -m "[phase-N] {phase name} complete"
```

This creates clean checkpoints visible in `git log --oneline --grep="\[phase-"`. See AGENTS.md §4 (Phase Commit Protocol) for details. During implementation, additional mid-feature commits (`[impl] {feature-id} — all tests green`) create resumable checkpoints.

### Resume: read → re-validate → continue

When a new session starts (or the same session reconnects), the orchestrator:

1. Reads `state.json` and picks up at `currentPhase`.
2. Inspects `phaseState` to determine exactly where within the phase to resume.
3. For implementation phase: reads `features[]` to find the `"in-progress"` feature, determines which slice is active (`api`, `web`, or `integration`), and reads that slice's `failingTests`, `modifiedFiles`, and `iteration` count. Contract types from Phase 4 are already in place.
4. Re-validates by running the relevant test suite and comparing to `lastTestRun`.
5. Continues the loop from the determined position.

For example, if `currentPhase` is `5` (implementation) and a feature has `slices.api.status: "in-progress"` with `slices.api.iteration: 4` and `failingTests` listing two failures, the agent resumes the API slice at iteration 5, targeting those specific failures.

### Human gates

At certain transitions the orchestrator pauses and waits for human approval:

| Gate | Condition |
|------|-----------|
| PRD approval | `humanGates.prdApproved` must be `true` to leave spec-refinement. |
| FRD approval | `humanGates.frdApproved` must be `true` to start gherkin-generation. |
| Gherkin approval | `humanGates.gherkinApproved` must be `true` to start test-generation. |
| Contracts approval | `humanGates.contractsApproved` must be `true` to start implementation. |
| Implementation approval | `humanGates.implementationApproved` must be `true` to start deployment. |
| Deployment approval | `humanGates.deploymentApproved` must be `true` to run `azd deploy`. |

When a gate is not yet approved, the orchestrator logs a `human-gate-pending` event and exits cleanly so the user can review and re-run.

## How to reset state

To start a project from scratch:

```bash
rm .spec2cloud/state.json .spec2cloud/audit.log
git add .spec2cloud/ && git commit -m "spec2cloud: reset state"
```

The orchestrator will create a fresh `state.json` on the next run.

To re-enter a specific phase, edit `state.json` manually:

```bash
# Re-run implementation from the beginning — reset all features to pending
jq '.currentPhase = 5 | .phaseState.features = [.phaseState.features[] | .status = "pending" | .failingTests = [] | .modifiedFiles = [] | .lastTestRun = null | .iteration = 0] | .phaseState.currentFeature = null' \
  .spec2cloud/state.json > tmp.json && mv tmp.json .spec2cloud/state.json
```

## State vs. audit log

| | `state.json` | `audit.log` |
|-|--------------|-------------|
| **What** | Current snapshot | Append-only history |
| **Updated** | Overwritten each action | Appended each action |
| **Used by** | Orchestrator (resume logic) | Humans & debugging |
| **Size** | Small, constant | Grows over time |
| **Format** | JSON (schema-validated) | One-line-per-event text |

Together they give both a "where are we now?" answer (`state.json`) and a "how did we get here?" answer (`audit.log`). See [audit-log-format.md](audit-log-format.md) for the log's line format and standard actions.
