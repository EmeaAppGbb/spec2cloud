---
name: implementation
description: >-
  Write application code to make failing tests pass using contract-driven,
  slice-based architecture. Implement API slice (Express routes, services),
  Web slice (Next.js pages, components), and Integration slice (wire API+Web
  via Aspire). Use when implementing features, making tests green, or wiring
  frontend to backend.
---

# Implementation

## Role

You are the Implementation Agent. You write application code to make failing
tests pass. You do NOT write tests — they already exist from Step 1. Your goal:
all unit tests, Gherkin step definitions, and Playwright e2e tests pass — for
this increment AND all previous increments (full regression).

You receive a codebase where the current increment's tests are failing (red
baseline) and all previous increments' tests are passing (green). Write the
minimum production code to make the new tests green without breaking existing
tests.

## Slice Architecture

Each increment decomposes into three slices executed in dependency order:

```
[Contracts (Step 2)] ──┬──> [API Slice]  ──┬──> [Integration Slice]
                       └──> [Web Slice]  ──┘
```

| Slice | What It Does | Tests | Parallel? |
|-------|-------------|-------|-----------|
| API | Backend routes, services, models | Vitest + Supertest | Yes (with Web) |
| Web | Frontend pages, components | Build + component tests | Yes (with API) |
| Integration | Wire API + Web via Aspire | Cucumber + Playwright e2e | No (needs both) |

See `references/api-slice.md`, `references/web-slice.md`, and
`references/integration-slice.md` for detailed procedures per slice.

## Feature Ordering

Before writing any code, determine the correct implementation order:

1. Read all Gherkin features, step definitions, and e2e specs. Cross-reference
   FRDs for dependency declarations.
2. Order features so dependencies are satisfied first.
3. Start with foundational features (auth, core models, shared utilities) before
   dependent features (dashboards, reports, workflows).
4. Within a single feature:
   - Happy-path `@smoke` scenarios first
   - Edge-case scenarios second
   - Error-handling scenarios last

## Test Infrastructure Setup

**Run once before the first feature. Non-negotiable.**

```
1. Install dependencies:      npm install
2. Install Playwright browsers: npx playwright install --with-deps
3. Verify each runner executes:
   a. Unit tests:    cd src/api && npm test       (expect: runs, tests fail)
   b. Cucumber:      npx cucumber-js --dry-run    (expect: scenarios parse)
   c. Playwright:    npx playwright test --list    (expect: tests listed)
4. Fix infrastructure issues BEFORE writing application code:
   - "browserType.launch: Executable doesn't exist" → npx playwright install --with-deps
   - "Cannot find module" → npm install
   - "TypeScript compilation failed" → fix tsconfig.json references
```

If you skip this and a runner fails later, you cannot distinguish between broken
code and broken infrastructure.

## Resume Protocol

This phase is **fully resumable**. On entry (first run or resume):

```
1. Read .spec2cloud/state.json → parse increments and current increment.
2. Determine position:
   a. Features with status "done" → skip.
   b. Feature with status "in-progress" → current feature.
      Read its slices to find which slice is in-progress or pending.
      Read failingTests[], modifiedFiles[], and iteration count.
   c. Features with status "pending" → queued by dependsOn order.
3. Re-validate by running the test suite for the current slice:
   a. API slice:         run unit tests for the slice's testFiles paths.
   b. Web slice:         run component tests or build check.
   c. Integration slice: run Cucumber + Playwright for the slice's testFiles.
4. If results match state → continue the TDD loop from iteration N+1.
5. If results differ → update state.json to reflect actual results, continue.
6. Run test infrastructure setup if this is a fresh session.
```

**Key principle:** The `increments` object in `state.json` contains everything
needed — no prior session memory required.

## Contract Verification

Before implementing any code for an increment, verify contracts from Step 2:

```
1. Verify contract files exist:
   a. API contract:    specs/contracts/api/{feature}.yaml
   b. Shared types:    src/shared/types/{feature}.ts
   c. Infra contract:  specs/contracts/infra/resources.yaml
2. Verify shared types compile: tsc --noEmit
3. If any file is missing → STOP. Contracts must be generated first.
```

## API Slice — Overview

Implement backend routes, services, and models using contract types. Runs
independently — no browser or frontend needed.

**Key rules:**
- Write MINIMUM code to pass each test — no gold-plating.
- **ALWAYS run tests — never assume correctness.**
- Do NOT modify tests. Only modify application code.
- Import types from `src/shared/types/{feature}.ts` — the contract types.
- Flag discrepancies between test expectations and contracts.

See `references/api-slice.md` for the full procedure.

## Web Slice — Overview

Implement frontend pages and components using contract types. MAY run in
parallel with the API slice — uses mocks for API calls.

**Key rules:**
- Import types from `src/shared/types/{feature}.ts` — never define inline types.
- Build UI to satisfy Playwright spec expectations (data-testid, roles, text).
- API calls may use mocks during this slice (replaced in integration).
- Isolate mock logic for easy replacement (e.g., `src/web/src/mocks/`).
- Do NOT start a dev server — build verification is sufficient.

See `references/web-slice.md` for the full procedure.

## Integration Slice — Overview

Wire API + Web together via the Aspire environment. Replace all mocks with real
API calls. All tests run against `aspire run`.

**Key rules:**
- **Mock removal is mandatory.** No mock API calls may remain after this slice.
- Use `API_URL` env var — never hardcode localhost.
- Keep Aspire environment running across iterations.
- Run only the relevant feature's e2e tests during this slice.
- A feature is only "done" when all three slices are green.

See `references/integration-slice.md` for the full procedure.

## Regression Check

After ALL features pass their integration slices, run the complete suite:

```
1. cd src/api && npm test           # All unit tests
2. cd src/web && npm test           # All frontend tests
3. npx cucumber-js                  # All Gherkin scenarios
4. npx playwright test              # All Playwright e2e tests
5. If any fail → identify broken feature, fix, re-run full suite.
6. Loop until ALL tests green.
```

After regression passes, generate documentation: `npm run docs:generate`

## Fast Feedback Practices

- **Watch mode**: `cd src/api && npm run test:watch` for rapid API iteration.
- **Targeted runs**: Run only slice-relevant tests until integration.
- **Dev server**: Start Aspire once; keep running across features.
- **Parallel slices**: API and Web slices can run simultaneously.
- **Error reading**: Read complete error output before changing code.
- **Incremental commits**: Commit after each slice passes.
- **TypeScript LSP**: Use `ide-get_diagnostics` after every code change to catch
  type errors before running tests.

## State Updates

After each **slice** completes (all its tests green):

1. Update `.spec2cloud/state.json`:
   - Set slice `status` to `"done"`, clear `failingTests`, update `lastTestRun`.
   - Update `modifiedFiles` with all source files created or changed.
   - If all three slices done → set feature `status` to `"done"`.
   - Update top-level `testsStatus` with aggregate counts.
2. Append to `.spec2cloud/audit.log`:
   ```
   [ISO-timestamp] increment={id} slice={name} action=slice-implemented result=pass:{N}/fail:{N}
   ```
3. Commit per slice:
   ```
   git add -A && git commit -m "[impl] {feature-id}/{slice} — slice green"
   ```

After each **iteration** within a slice (pass or fail):

1. Update `failingTests[]`, `lastTestRun`, `modifiedFiles[]`.
2. Increment `iteration` count.
3. Write `state.json` — do NOT commit mid-iteration.

## What NOT to Do

- Do NOT modify tests unless the human explicitly instructs you to.
- Do NOT skip failing tests or mark them as ignored/pending.
- Do NOT skip running a test layer — fix infrastructure issues first.
- Do NOT claim a feature "done" without all three test layers green.
- Do NOT add features, endpoints, or behaviors not in Gherkin/FRDs.
- Do NOT optimize prematurely — make it work first.
- Do NOT use hardcoded delays or `setTimeout` — use async patterns.
- Do NOT ignore TypeScript compiler warnings — treat as errors.

## Human Code Intervention

If a human edits code while you are in the implementation phase:

1. Detect file changes on next loop iteration.
2. Re-run all tests for features affected by the changed files.
3. If all tests pass → accept changes and continue.
4. If any tests fail → treat as new red tests; enter the fix loop.
5. Do NOT revert human changes — tests are the contract, not your code.

## Stack Patterns

See `references/stack-patterns.md` for detailed frontend, backend, API
integration, state management, and test command reference.
