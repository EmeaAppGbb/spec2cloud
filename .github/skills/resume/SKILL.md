---
name: resume
description: Resume a spec2cloud session from saved state. Read state.json, determine position, re-validate by running tests, handle human edits during pause. Use at CLI session start, after interruption, or when continuing work from a previous session.
---

# Resume Protocol

On every CLI session start, check for existing state.

## Steps

1. **Check for `.spec2cloud/state.json`.**
   - If it does not exist → start from Phase 0
   - If it exists → read it and resume

2. **Read state and determine position.**
   - Parse `currentPhase` — are we in setup, discovery, or increment-delivery?
   - If in `increment-delivery`, parse `currentIncrement` and find the current step
   - Identify what was last completed and what's next

3. **Re-validate.**
   - Run the test suite appropriate for the current position:
     - Phase 1b: verify prototype HTML files exist in specs/ui/prototypes/
     - Phase 1c: verify `specs/increment-plan.md` exists
     - Phase 1d: verify `specs/tech-stack.md` exists, skills referenced are present
     - Step 1 (tests): verify test files exist and compile
     - Step 2 (contracts): verify contract files exist and shared types compile
     - Step 3 (implementation): run test suite for current slice, compare results to state
     - Step 4 (verification): check deployment status, run smoke tests
   - If validation matches state → continue
   - If validation differs → update state to reflect actual results, log the discrepancy, then continue

4. **Handle human edits during pause.**
   - Humans may edit specs, tests, or code while the agent is paused
   - On resume, re-validation catches these changes
   - Treat re-validation results as the new ground truth
   - Do not revert human edits — adjust your plan to the new state

5. **Continue the Ralph loop** from the determined position.
