---
name: human-gate
description: Pause execution and request human approval at defined checkpoints. Present summaries, state next steps, and record approval or rejection. Use at phase exits, after Gherkin generation, after implementation PR review, and after deployment verification.
---

# Human Gate Protocol

## Gate Locations

Human gates exist at these points:
- Phase 0 exit (shell setup approval)
- Phase 1a exit (FRD approval)
- Phase 1b exit (UI/UX approval)
- Phase 1c exit (increment plan approval)
- Phase 1d exit (tech stack resolution approval)
- Phase 2, Step 1 mid-point (Gherkin approval, per increment)
- Phase 2, Step 3 exit (implementation PR review, per increment)
- Phase 2, Step 4 exit (deployment verification, per increment)
- Phase B1 exit (extraction accuracy review — brownfield only)
- Phase B2a (PRD approval — brownfield only)
- Phase B2b (FRD approval — brownfield only)
- Phase B2c (spec refinement approval — brownfield only)
- Phase B3 entry (testability assessment — brownfield only)
- Green baseline verification (per feature after Track A baseline — brownfield only)
- Track B behavioral docs review (per feature — brownfield only)
- Path selection (choose modernize/rewrite/extend/etc. — brownfield only)

## Testability Assessment Gate

**Gate type:** `testability-assessment`

**When triggered:** After Phase B2 (Spec-Enable) completes — PRD and all FRDs are approved.

### What to Present

**1. Extraction findings relevant to testability:**

- **Test discovery results** — existing test frameworks, test count, coverage metrics
- **Architecture overview** — external dependencies, integration points, service boundaries
- **Dev environment detection** — Docker/compose files, env configs, local run scripts

**2. Testability checklist for human to assess:**

- [ ] Can the application be built and started locally (or in a dev environment)?
- [ ] Are external dependencies reachable, mockable, or fakeable?
- [ ] Can API endpoints be exercised (HTTP calls return responses)?
- [ ] Can the UI be rendered and interacted with (browser automation possible)?
- [ ] Is there a working dev/test environment configuration?
- [ ] Can the existing test suite (if any) be executed?

**3. Decision options:**

| Decision | Criteria | Next step |
|----------|----------|-----------|
| **Track A (Full testability)** | All or most checklist items checked | Proceed with green baseline |
| **Track B (No testability)** | Few or no items checked | Proceed with documentation-only |
| **Hybrid** | Some features testable, others not | Human identifies which features are testable |

For **Hybrid**, also collect: list of testable feature names mapped to FRD IDs.

### What to Record

**state.json** — add to `brownfield` object:
```json
{
  "testability": "full | partial | none",
  "track": "A | B | hybrid",
  "testabilityChecklist": {
    "canBuild": true,
    "externalDepsReachable": true,
    "apiExercisable": true,
    "uiRenderable": false,
    "devEnvExists": true,
    "existingTestsRunnable": false
  },
  "featureTracks": {
    "auth": "A",
    "search": "A",
    "reporting": "B"
  }
}
```

**audit.log** entry:
```
[ISO-timestamp] gate=testability-assessment decision={track} testability={level} result=approved
```

### Gate Flow

1. Summarize extraction findings (test discovery, architecture, dev environment)
2. Present the testability checklist
3. Ask the human to check applicable items and select a track
4. If Hybrid is selected, ask which features (by FRD ID) are testable
5. Record the decision in `state.json` and `audit.log`
6. Advance to the appropriate track

---

## Green Baseline Verification Gate

**Gate type:** `green-baseline-verification`

**When triggered:** After Track A completes green baseline execution for each feature (brownfield only).

### What to Present

- Feature name and FRD ID
- Test suite execution results (pass/fail counts, failures if any)
- Baseline coverage summary
- Any tests that were skipped or could not run

### Decision

- **Accept baseline** — Tests pass, proceed to increment delivery for this feature
- **Reject baseline** — Tests fail or coverage insufficient, iterate on baseline setup
- **Reclassify feature** — Move feature from Track A to Track B (not testable after all)

### What to Record

**audit.log** entry:
```
[ISO-timestamp] gate=green-baseline-verification feature={frd-id} tests_passed={n} tests_failed={n} result={accepted|rejected|reclassified}
```

---

## How to Pause

When you reach a human gate:

1. **Summarize what was done.** Present a concise summary:
   - Phase 0: List all generated/verified files and scaffolding
   - Phase 1a: List all FRDs with their key decisions
   - Phase 1b: List screen map, design system, and prototype links per FRD
   - Phase 1c: List the increment plan with ordering, scope, and dependencies
   - Phase 1d: List tech stack decisions, infrastructure plan, created skills
   - Step 1 (per increment): List Gherkin scenario counts, e2e flow coverage
   - Step 3 (per increment): Link to the PR, list test results (pass/fail counts)
   - Step 4 (per increment): Deployment URL, smoke test results, docs status
   - Testability assessment (brownfield): Extraction findings, checklist, track recommendation
   - Green baseline verification (brownfield): Test results, coverage, per-feature status

2. **State what's next.** Tell the human what the next phase will do.

3. **Ask for approval.** Explicitly ask: "Approve to proceed to Phase X, or provide feedback to iterate."

4. **Wait.** Do not proceed until the human responds.

## Recording Approval

When the human approves:
1. Set `humanGates.<gate-name>` to `true` in `state.json`
2. Log the approval in `audit.log`
3. Advance `currentPhase` to the next phase
4. Continue the Ralph loop

## On Rejection

When the human rejects or provides feedback:
1. Log the rejection and feedback in `audit.log`
2. Do **not** advance the phase
3. Incorporate the feedback into the current phase
4. Re-execute the relevant tasks with the feedback
5. When done, present for approval again
