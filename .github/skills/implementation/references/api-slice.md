# API Slice — Full Procedure

## Overview

Using the contract types from Step 2, implement the backend. This slice runs
independently — no browser or frontend needed.

## Procedure

```
1.  Read the contract types for this feature (src/shared/types/{feature}.ts)
    and the API contract (specs/contracts/api/{feature}.yaml).
2.  Read the API test files — these define your implementation blueprint:
      - Vitest unit tests: src/api/tests/unit/{feature}.test.ts
      - Supertest integration tests (if any)
3.  Extract the concrete requirements:
      - API endpoints and HTTP methods the tests call
      - Request/response shapes the assertions expect (must match contract types)
      - Service interfaces and method signatures the unit tests reference
4.  Write the minimum code to make ONE test pass.
5.  Run unit tests:
      cd src/api && npm run test:watch
6.  If the test passes → move to the next failing test.
7.  If the test fails → read the full error output, fix your code, re-run.
8.  Repeat steps 4–7 until all unit tests for this feature pass.
9.  Run the Cucumber step definitions that exercise backend-only behavior:
      npx cucumber-js --tags "@{feature} and @api"
10. All API tests green → commit and update state:
      git add -A && git commit -m "[impl] {feature-id}/api — slice green"
      Set slices.api.status = "done" in state.json.
```

## Rules

- Write the **MINIMUM** code to pass each test. No gold-plating, no speculative
  abstractions.
- **ALWAYS run tests — never assume your code is correct.** Reading tests tells
  you what to build; running them tells you whether you built it correctly.
- Do NOT modify tests. Only modify application code.
- Request/response types **MUST** import from `src/shared/types/{feature}.ts` —
  the contract types from Step 2.
- If a test expects a response shape that differs from the contract, flag the
  discrepancy — contracts were human-approved in Step 2. Consult the orchestrator
  before changing contracts.

## Test Commands

```bash
# Watch mode for rapid iteration
cd src/api && npm run test:watch

# Single run
cd src/api && npm test

# Run Cucumber backend-only scenarios
npx cucumber-js --tags "@{feature} and @api"
```

## File Locations

| Artifact | Path |
|----------|------|
| Contract types | `src/shared/types/{feature}.ts` |
| API contract | `specs/contracts/api/{feature}.yaml` |
| Unit tests | `src/api/tests/unit/{feature}.test.ts` |
| Route files | `src/api/src/routes/{feature}.ts` |
| Service files | `src/api/src/services/{feature}.ts` |
| App setup | `src/api/src/app.ts` |
