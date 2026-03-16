---
name: error-handling
description: Handle failures during spec2cloud execution. Covers sub-agent failures, stuck loops, corrupted state, and test infrastructure failures. Use when encountering errors, retrying failed tasks, or recovering from corrupted state.
---

# Error Handling

## Sub-Agent Failure

If a sub-agent fails (crashes, produces invalid output, tests don't pass):
1. Log the failure in `audit.log` with the error details
2. Retry the same task — the sub-agent gets another attempt
3. On retry, include the previous error as context so the sub-agent can adjust
4. There is no retry limit — loops run indefinitely

## Stuck in a Loop

If you detect you're making no progress (same test failing repeatedly, same error recurring):
1. **Keep going.** Do not stop autonomously.
2. The human is watching. Human Ctrl+C is the escape hatch.
3. Try different approaches on each iteration — don't repeat the exact same fix
4. Log every attempt so the human can diagnose the pattern

## Corrupted or Missing State

If `state.json` is corrupted or contains invalid data:
1. Log the corruption in `audit.log`
2. Re-assess the project state from the repo itself:
   - Check which spec files exist (`specs/prd.md`, `specs/frd-*.md`, `specs/features/*.feature`)
   - Check which tests exist and whether they pass
   - Check which code exists
   - Check deployment status
3. Reconstruct `state.json` from the observed repo state
4. Continue from the determined phase

## Test Infrastructure Failures

If tests fail to compile or the test runner itself fails (not test assertion failures):
1. Log the infrastructure failure
2. Attempt to fix the test infrastructure (missing dependencies, config issues)
3. Re-run tests
4. If the test infrastructure cannot be fixed, log the blocker and continue attempting
