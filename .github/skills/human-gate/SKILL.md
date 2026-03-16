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
