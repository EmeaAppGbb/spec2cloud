# Integration Slice — Full Procedure

## Overview

After BOTH the API and Web slices are complete (all their tests green), wire
them together and verify end-to-end behavior. The key task is **replacing any
mock API calls in the Web slice with real fetch calls to the running API**. All
integration tests run against the **Aspire environment** (`aspire start`), which
orchestrates API and Web services identically to production.

## Procedure

```
1.  Verify both slices are done:
      - slices.api.status == "done"
      - slices.web.status == "done"
    If either is not done, STOP — do not proceed to integration.

2.  Replace mocks with real API calls:
      a. Identify every API client function in the Web slice that uses
         mock/stub/hardcoded data (e.g., functions returning static contract
         types, MSW handlers, or in-memory stores).
      b. Replace each mock with a real fetch call to the API endpoint:
           - Use the API_URL environment variable (e.g., process.env.API_URL
             or NEXT_PUBLIC_API_URL) — never hardcode localhost.
           - Request/response types MUST use the contract types from
             src/shared/types/{feature}.ts.
           - Add proper error handling (try/catch, status code checks).
           - Add appropriate headers (Content-Type, Authorization if needed).
      c. Verify the Web slice still builds after the switch:
           cd src/web && npm run build
      d. If the build fails, fix type mismatches between the mock responses
         and the real API responses — the contract types are the source of truth.

3.  Start the Aspire environment (if not already running):
      aspire start
      aspire wait api --status healthy
      aspire wait web --status healthy

4.  Verify Playwright browsers are installed:
      npx playwright install --with-deps

5.  Run Cucumber step definitions for this feature:
      npx cucumber-js --tags "@{feature}"

6.  If any Cucumber scenario fails → analyze the failure:
      a. API response mismatch → fix backend route/service code
         (re-run API tests to confirm no regression).
      b. UI rendering issue → fix frontend component code
         (re-run Web build to confirm no regression).
      c. Integration wiring issue → fix API client calls, CORS, env vars.
      d. Mock leftover → a mock was not replaced or is still intercepting;
         remove it.

7.  Run Playwright tests for this feature:
      npx playwright test e2e/{feature}.spec.ts

8.  If any Playwright test fails → analyze the failure:
      a. Runner/infrastructure error → fix the infrastructure.
      b. UI rendering issue → fix frontend component code.
      c. API integration issue → fix backend controller/service code.
      d. Timing issue → fix wait patterns using Playwright locators.
         No hardcoded delays.
      e. Mock/real mismatch → the UI is still reading mock data instead of
         the API response; verify fetch calls are wired correctly.

9.  After fixing, re-run both Cucumber and Playwright for this feature.

10. Re-run API unit tests to confirm no regressions:
      cd src/api && npm test

11. Loop steps 5–10 until all integration tests pass with no regressions.

12. All green → commit and update state:
      git add -A && git commit -m "[impl] {feature-id} — all tests green"
      Set slices.integration.status = "done" and feature status = "done"
      in state.json.
```

## Rules

- **Mock removal is mandatory.** No mock API calls may remain after the
  integration slice. Every data fetch in the frontend must hit the real API
  server. If a mock is still active, the e2e tests are not truly validating
  integration.
- **Keep the Aspire environment running** across iterations. Only restart if
  configuration changes require it.
- Run only the relevant feature's e2e tests during this slice. Do not run the
  full Playwright suite yet — that happens in the regression check.
- If a Playwright test fails, always check that API unit tests haven't regressed
  before fixing the e2e issue.
- A feature is only `"done"` when ALL three implementation slices (api + web +
  integration) are green and contracts from Step 2 are in place.

## Mock Removal Checklist

Before marking the integration slice as done, verify:

- [ ] All mock/stub API client functions replaced with real `fetch()` calls
- [ ] All MSW handlers removed or disabled in production mode
- [ ] All hardcoded/static data sources replaced with API responses
- [ ] All in-memory stores replaced with real backend state
- [ ] `API_URL` environment variable used for all API endpoints
- [ ] `cd src/web && npm run build` succeeds with real fetch calls
- [ ] No `mock`, `stub`, `fake`, or `hardcoded` references in production code
- [ ] Contract types from `src/shared/types/` used for all request/response shapes

## Test Commands

```bash
# Start Aspire environment
aspire start
aspire wait api --status healthy
aspire wait web --status healthy

# Cucumber for a specific feature
npx cucumber-js --tags "@{feature}"

# Playwright for a specific feature
npx playwright test e2e/{feature}.spec.ts

# Interactive debugging
npx playwright test --ui

# Verify no API regression
cd src/api && npm test
```
