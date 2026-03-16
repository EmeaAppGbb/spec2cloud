# Web Slice — Full Procedure

## Overview

Using the contract types from Step 2, implement the frontend. This slice MAY
run in parallel with the API slice — it mocks API calls using the contract types.

## Procedure

```
1.  Read the contract types for this feature (src/shared/types/{feature}.ts).
2.  Read the Web test files — these define your implementation blueprint:
      - Component tests: src/web/tests/{feature}.test.ts (if any)
      - Playwright e2e specs: e2e/{feature}.spec.ts and page objects in e2e/pages/
        (read for UI structure expectations — data-testid attrs, element roles,
        text content)
3.  Extract UI requirements from the Playwright specs:
      - Page routes and URLs the specs navigate to
      - UI elements referenced by data-testid, role, or text
      - User interaction patterns (clicks, form fills, navigation)
      - Expected visual states (text content, visibility, counts)
4.  Implement frontend pages, components, and client logic:
      - Pages: src/web/src/app/{route}/page.tsx
      - Components: src/web/src/app/components/{Component}.tsx
      - API client functions that return contract types (mock-ready)
5.  Verify the build succeeds:
      cd src/web && npm run build
6.  Run any component-level tests:
      cd src/web && npx vitest run
7.  All Web tests/build green → commit and update state:
      git add -A && git commit -m "[impl] {feature-id}/web — slice green"
      Set slices.web.status = "done" in state.json.
```

## Rules

- Import types from `src/shared/types/{feature}.ts` — never define inline
  response types.
- Build the UI to satisfy the Playwright spec expectations (data-testid
  attributes, element roles, text content) even before e2e tests run.
- **API calls may use mocks during this slice.** Implement API client functions
  with the correct signatures and contract types, but they may return mock/stub
  data or use MSW (Mock Service Worker) to intercept requests. The integration
  slice will replace these mocks with real fetch calls.
- Clearly isolate mock logic (e.g., in a `src/web/src/mocks/` directory or
  behind an environment flag) so the integration slice can find and replace it.
- Do NOT start a dev server during this slice. Build verification (`npm run
  build`) is sufficient.
- If a Playwright spec expects a `data-testid` or text, your component MUST
  render it — even if the data comes from a mock until integration.

## Test Commands

```bash
# Build check
cd src/web && npm run build

# Component tests (if any)
cd src/web && npx vitest run
```

## File Locations

| Artifact | Path |
|----------|------|
| Contract types | `src/shared/types/{feature}.ts` |
| Pages | `src/web/src/app/{route}/page.tsx` |
| Layouts | `src/web/src/app/{route}/layout.tsx` |
| Components | `src/web/src/app/components/{Component}.tsx` |
| Mocks | `src/web/src/mocks/` |
| E2E specs | `e2e/{feature}.spec.ts` |
| Page objects | `e2e/pages/` |
