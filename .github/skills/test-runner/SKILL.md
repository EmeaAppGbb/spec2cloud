---
name: test-runner
description: Execute the appropriate test suite (unit, Gherkin, e2e, smoke) and return structured results. Use during Phase 3 (e2e test verification), Phase 4 (red baseline verification), Phase 5 (contract type compilation), Phase 6 (API/Web/integration slices), Phase 7 (smoke tests against deployment), and on resume (re-validate test state). Trigger when running tests, checking test status, or verifying test baselines.
---

# Test Runner

Execute tests and return structured results for the orchestrator.

## Test Commands

| Type | Command |
|------|---------|
| Unit (TypeScript) | `cd src/api && npm test` |
| Gherkin | `npx cucumber-js` |
| E2E | `npx playwright test --config=e2e/playwright.config.ts` |
| Smoke | `npx playwright test --grep @smoke` |
| All | `npm run test:all` |

## Steps

1. **Determine test type** — Select the test suite based on current phase and task
2. **Run tests** — Execute the command, capture stdout and stderr
3. **Parse results** — Extract pass/fail counts, failure details, and test names
4. **Detect flaky tests** — If a test failed, re-run it once; if it passes on retry, flag as flaky
5. **Structure output** — Format results for the orchestrator

## Output Format

```
Type: unit | gherkin | e2e | smoke | all
Pass: <count>
Fail: <count>
Flaky: <count>
Verdict: GREEN | RED | FLAKY

Failed tests:
- <test name>: <error message>
```

## Edge Cases

- Test runner itself fails (not assertions) → report as infrastructure failure
- Tests exceed 5 minutes → check for hung processes
- Always capture both stdout and stderr
