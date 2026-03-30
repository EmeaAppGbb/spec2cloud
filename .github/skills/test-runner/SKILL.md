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

1. **Verify Aspire environment** (for Gherkin/e2e/smoke/all) — Before running integration tests, ensure the Aspire environment is running:
   - Use `aspire describe --format Json` (or the Aspire MCP `list_resources` tool) to check resource status
   - If resources are not healthy, run `aspire start` + `aspire wait api --status healthy` + `aspire wait web --status healthy`
   - If resources show errors, use `aspire logs <resource>` (or `list_console_logs`) to diagnose
2. **Determine test type** — Select the test suite based on current phase and task
3. **Run tests** — Execute the command, capture stdout and stderr
4. **Parse results** — Extract pass/fail counts, failure details, and test names
5. **Detect flaky tests** — If a test failed, re-run it once; if it passes on retry, flag as flaky
6. **Diagnose failures with Aspire MCP** — On test failure, use Aspire observability:
   - `list_console_logs` for resource stdout/stderr around failure time
   - `list_structured_logs` for OpenTelemetry log entries
   - `list_traces` to find the failing request's distributed trace
   - `list_trace_structured_logs` with the trace ID for full request lifecycle
7. **Structure output** — Format results for the orchestrator

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

## Aspire MCP Debugging Workflow

When tests fail against the Aspire environment:

```
1. list_resources              → Are all resources Running + Healthy?
2. list_console_logs(resource) → Any errors in stdout/stderr?
3. list_traces(resource)       → Find the trace for the failing request
4. list_trace_structured_logs  → Full trace lifecycle with all spans
5. execute_resource_command    → Restart a resource if stuck
```

## Edge Cases

- Test runner itself fails (not assertions) → report as infrastructure failure
- Aspire resources unhealthy → restart via `aspire start` (auto-stops previous)
- Tests exceed 5 minutes → check for hung processes
- Always capture both stdout and stderr

## Mandatory Completion Checklist

The orchestrator MUST verify ALL of the following before marking test-runner as complete:

- [ ] All test suites were executed (unit, integration, e2e, Cucumber) — none skipped
- [ ] Results include: total tests, passed, failed, skipped counts per suite
- [ ] Any failures include file path, test name, and error message
- [ ] Aspire environment was healthy during test execution (resources Running + Healthy)
- [ ] If any tests failed, the failure is reported as a blocking issue — not silently ignored

**BLOCKING**: If the test runner itself fails (infrastructure failure, timeout, partial execution), this must be reported as "run incomplete" — not as "all tests passed".
