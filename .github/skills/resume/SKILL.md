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

## Mandatory Completion Checklist

The orchestrator MUST verify ALL of the following before resuming work:

- [ ] `.spec2cloud/state.json` exists and is valid JSON
- [ ] Current phase and increment are determined from state
- [ ] Re-validation ran for the current step (tests compile, builds pass, deployment status checked — as appropriate)
- [ ] If re-validation results differ from state, state was updated to reflect reality
- [ ] Human edits during pause (if any) are detected and treated as ground truth — not reverted
- [ ] Audit log entry records the resume event with any discrepancies found

**BLOCKING**: If state.json is missing or unparseable, the orchestrator must initialize from Phase 0 (not guess). If re-validation fails, the orchestrator must update state before proceeding — never resume from stale state.
