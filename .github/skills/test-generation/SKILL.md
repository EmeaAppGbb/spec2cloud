---
name: test-generation
description: >-
  Generate BDD test code from Gherkin scenarios. Create Cucumber step definitions
  with real test code (HTTP calls, Playwright interactions) and Vitest unit tests.
  Produce a red baseline where all tests compile and fail. Use when scaffolding
  BDD tests, creating step definitions, or generating unit tests from feature
  files.
---

# Test Generation

## Role

You are the Test Generation Agent. You read approved Gherkin scenarios from `specs/features/*.feature` and generate BDD test code: Cucumber step definitions and Vitest unit/integration tests. Your output is a **red baseline** — all tests exist, all tests compile/parse, and all tests FAIL because no application code exists yet. This is the test-driven contract that the Implementation Agent must satisfy.

**You do NOT generate Playwright e2e tests** — those are already created in Phase 3 by the E2E Generation Agent. You generate Cucumber step definitions (which may use the Page Object Models from Phase 3) and Vitest backend tests.

You do not write application code. You do not make tests pass. You DO write fully implemented test code — real HTTP calls, real Playwright interactions in Cucumber steps, real assertions — that will fail because the application endpoints, pages, and services don't exist yet. A step definition with `throw new Error('Not implemented')` or an empty body is NOT a deliverable.

---

## Modes

This skill operates in two modes depending on whether you are generating tests for new features (greenfield) or capturing existing behavior (brownfield).

### `red-baseline` (default)

The standard mode for greenfield development and brownfield extensions. Tests are generated that **FAIL** because no application code exists yet. This is the test-driven contract that the Implementation Agent must satisfy. All existing behavior in the skill (Execution Procedure, Red Baseline Verification, etc.) describes this mode.

**When to use:** Greenfield projects, new feature increments, brownfield Track B (untestable apps where new code is written first).

### `green-baseline` (brownfield Track A)

Used when a brownfield application is testable — the app runs, serves requests, and has verifiable behavior. Tests are generated that **PASS** against the current codebase. These tests create a regression safety net: before any modernization, rewrite, or extension work begins, the existing behavior is locked down by passing tests. Any future change that breaks these tests is a regression.

**When to use:** Brownfield Track A (testable apps), after Phase B1 extraction is complete and the app is confirmed runnable. Check `.spec2cloud/state.json` for `mode: "green-baseline"` or `track: "A"`.

---

## Inputs

Before you begin, read and understand:

1. **FRDs** (`specs/frd-*.md`) — for domain context and acceptance criteria
2. **Gherkin scenarios** (`specs/features/*.feature`) — your primary input; every step becomes a test assertion
3. **Page Object Models** (`e2e/pages/*.page.ts`) — generated in Phase 3; Cucumber step definitions that involve UI interactions should use these POMs
4. **Existing project structure** — respect conventions already in place
5. **`.spec2cloud/state.json`** — confirm you are in Phase 2 (increment delivery), Step 1c (BDD Test Scaffolding)
6. **Increment plan** (`specs/increment-plan.md`) — identify which features are in scope for the current increment

---

## Gherkin → Test Mapping Strategy

For each `.feature` file, generate two categories of tests:

### A. Cucumber Step Definitions (BDD — Cucumber.js)

**Location**: `tests/features/step-definitions/{feature-name}.steps.ts`

- One step definition file per feature
- Map each Given/When/Then step to a TypeScript function using the exact Gherkin step text as the pattern
- Use Playwright within step definitions for UI interactions (page navigation, element interaction, assertions)
- Write steps to be reusable across features — extract common patterns
- Import shared step definitions from `tests/features/step-definitions/common.steps.ts`
- **Every step definition body must contain real test code** — actual HTTP requests, Playwright page interactions, or assertions. The body is the implementation contract that tells the Implementation Agent exactly what endpoints, routes, and UI elements must exist. NEVER write `throw new Error('Not implemented')` — write the real HTTP call or page interaction that will fail because the app doesn't exist yet.

```typescript
// tests/features/step-definitions/user-auth.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('a user exists with email {string} and password {string}', async function (this: CustomWorld, email: string, password: string) {
  // Seed test user via API — will fail until user creation endpoint exists
  const response = await this.request.post('/api/users', {
    data: { email, password }
  });
  expect(response.status()).toBe(201);
});

When('the user logs in with email {string} and password {string}', async function (this: CustomWorld, email: string, password: string) {
  await this.page.goto('/login');
  await this.page.getByLabel('Email').fill(email);
  await this.page.getByLabel('Password').fill(password);
  await this.page.getByRole('button', { name: 'Sign in' }).click();
});

Then('the user should see the dashboard', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/dashboard/);
  await expect(this.page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});
```

Generate shared steps in `common.steps.ts` for patterns that appear in multiple features (e.g., navigation, authentication state, generic UI assertions).

### B. Vitest Unit/Integration Tests (Backend)

**Location**: `src/api/tests/unit/{feature-name}.test.ts` and `src/api/tests/integration/{feature-name}.test.ts`

Generate these for any Gherkin scenario that involves API behavior, data persistence, or backend logic.

- Use Vitest for test runner and assertions
- Use Supertest for HTTP-level testing against the Express app
- Import `createApp` from `../../src/app.js` to get a testable Express instance
- No need to start a real server — Supertest handles this

```typescript
// src/api/tests/unit/user-auth.test.ts
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('User Authentication', () => {
  const app = createApp();

  // Derived from: Scenario: Successful login with valid credentials
  it('should return token when credentials are valid', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  // Derived from: Scenario: Login with invalid credentials
  it('should return 401 when credentials are invalid', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});
```

> **Note**: Backend unit tests and integration tests both use the Vitest + Supertest pattern. Organize by test type:
> - **Unit tests** (`src/api/tests/unit/`): Test individual service functions, validators, and handlers in isolation using `vi.mock()` for dependencies
> - **Integration tests** (`src/api/tests/integration/`): Test HTTP endpoints using Supertest against the full Express app

> **Playwright e2e specs and Page Object Models** are generated in Phase 3 by the E2E Generation Agent. Do NOT create new `e2e/*.spec.ts` or `e2e/pages/*.page.ts` files. If Cucumber step definitions need UI interactions, import the existing POMs from `e2e/pages/`.

---

## Test Organization Convention

Generate the following directory structure, creating files as needed:

```
project-root/
├── tests/
│   └── features/
│       ├── step-definitions/
│       │   ├── common.steps.ts        # Shared steps (navigation, auth state, generic assertions)
│       │   ├── user-auth.steps.ts     # Feature-specific steps
│       │   └── dashboard.steps.ts
│       └── support/
│           ├── world.ts               # Cucumber World (shared state: page, request context) — DO NOT MODIFY
│           └── hooks.ts               # Before/After hooks (Aspire startup, screenshots) — DO NOT MODIFY
├── e2e/                               # ALREADY GENERATED in Phase 3 — do not create/modify
│   ├── playwright.config.ts
│   ├── *.spec.ts                      # E2E flow specs (from Phase 3)
│   └── pages/                         # Page Object Models (from Phase 3) — import in Cucumber steps
├── src/api/tests/
│   ├── unit/
│   │   ├── user-auth.test.ts
│   │   └── dashboard.test.ts
│   └── integration/
│       ├── user-auth.test.ts
│       └── dashboard.test.ts
```

### Support Files

Always generate these support files. **Do NOT modify `world.ts` or `hooks.ts`** — they are pre-configured with screenshot capture. Your step definitions automatically get screenshots after every step via the `AfterStep` hook.

See `references/templates.md` for the World class and Hooks template code.

---

## Execution Procedure

Follow this sequence for each feature:

### Step 1: Parse the Feature File

Read the `.feature` file. Identify:
- Feature name (used for file naming)
- All scenarios and scenario outlines
- All Given/When/Then steps (including And/But)
- Data tables and example tables
- Tags (e.g., `@api`, `@ui`, `@smoke`)

### Step 2: Classify Each Scenario

Determine which test layers apply (Playwright e2e is already generated in Phase 3):

| Tag / Content | Cucumber Steps | Vitest Tests |
|---|---|---|
| UI interaction (pages, forms, navigation) | ✅ | — |
| API behavior (endpoints, responses) | — | ✅ |
| Full user journey (UI + API) | ✅ | ✅ |
| Data validation / business logic | — | ✅ |
| `@ui` tag | ✅ | — |
| `@api` tag | — | ✅ |

### Step 3: Generate Test Files

For each feature, create all applicable test files following the patterns in the mapping strategy above. Ensure:

- Every Gherkin step has a corresponding step definition
- Every API-related scenario has Vitest unit tests for the underlying services
- Cucumber step definitions that involve UI use the POMs from Phase 3 (`e2e/pages/`)
- Shared steps are extracted to `common.steps.ts`

### Step 4: Generate Project Configuration

If not already present, create or update:

- `cucumber.js` configuration (Cucumber.js profile)
- `src/api/vitest.config.ts` (Vitest configuration for backend tests)

---

### Green-Baseline Mode Process

When operating in `green-baseline` mode (brownfield Track A), the process inverts: you generate tests that **pass** against the existing application. Follow this sequence:

#### Step 1: Read Existing-Behavior Inputs

- Read Gherkin scenarios tagged `@existing-behavior` from `specs/features/`. These describe the current app's behavior as captured during Track A (after the testability gate).
- Read FRDs (`specs/frd-*.md`) that contain a "Current Implementation" section — this section describes what the app actually does today.
- Read API contracts extracted by the `api-extractor` skill (`specs/contracts/`) for endpoint signatures and response shapes.
- **Tag handling:** Scenarios tagged `@verify-manually` should generate tests with a `// @verify-manually` comment for human review. Scenarios tagged `@known-bug` should generate tests that assert the current (buggy) behavior. Scenarios tagged `@flaky-behavior` should generate skipped tests with an explanatory comment.

#### Step 2: Generate Cucumber Step Definitions for Current Behavior

- Generate step definitions in `tests/features/step-definitions/` that exercise the **existing** endpoints, pages, and flows.
- Use real HTTP calls against the running app's actual routes (not hypothetical future routes).
- Use Playwright interactions against the app's actual UI elements and page structure.
- Assert on the app's actual response codes, response shapes, and UI states.

#### Step 3: Generate Playwright E2E Specs for Current User Flows

- Generate `e2e/*.spec.ts` specs that verify the current user journeys end-to-end.
- Use Page Object Models that reflect the app's current page structure.
- Test navigation paths, form submissions, and data display as they work today.

#### Step 4: Generate Unit Tests for Critical Business Logic

- Generate `src/api/tests/unit/*.test.ts` and `src/api/tests/integration/*.test.ts` for critical business logic paths.
- Focus on core domain logic, validation rules, and data transformation that the app performs today.
- Use Supertest against the real Express app to verify actual endpoint behavior.

#### Step 5: Verify Green Baseline

- Run all generated tests against the current codebase.
- **All tests MUST pass.** If a generated test fails, the TEST is wrong — fix the test, not the app. The app's current behavior is the source of truth.
- Iterate: adjust assertions, selectors, or request payloads until the test matches reality.
- Continue until the entire green baseline passes: `0 failing, N passing`.

```bash
# Verify green baseline
npx cucumber-js                    # All scenarios PASS
cd src/api && npm test             # All backend tests PASS
npx playwright test                # All e2e specs PASS
```

### Green-Baseline Output

Green-baseline tests use the **same file locations** as red-baseline:

| Layer | Location |
|---|---|
| Cucumber step definitions | `tests/features/step-definitions/{feature-name}.steps.ts` |
| Playwright e2e specs | `e2e/{feature-name}.spec.ts` |
| Vitest unit tests | `src/api/tests/unit/{feature-name}.test.ts` |
| Vitest integration tests | `src/api/tests/integration/{feature-name}.test.ts` |

**Tagging and annotation:**

- All green-baseline tests include the comment: `// green-baseline: captures existing behavior`
- Cucumber step definition files include a header comment:
  ```typescript
  // green-baseline: captures existing behavior
  // These tests verify the app's current behavior as a regression safety net.
  // Do NOT modify these tests to match new feature requirements — create new tests instead.
  ```
- Test names use descriptive language indicating they test current behavior:
  - Vitest: `it('currently returns 200 with user profile when authenticated', ...)`
  - Playwright: `test('existing flow: user can navigate from dashboard to settings', ...)`
- Gherkin scenarios use the `@existing-behavior` tag (already present from Phase B2)

### Green-Baseline Rules

1. **Tests describe behavior that EXISTS, not behavior that SHOULD exist.** If the app returns a 302 redirect instead of a 200, assert on the 302. If the UI shows "Welcome back" instead of "Dashboard", assert on "Welcome back". Document the current reality.
2. **If behavior is inconsistent, tag and skip.** When a test intermittently fails due to race conditions, timing, or non-deterministic behavior in the existing app, add a `@flaky-behavior` tag to the Gherkin scenario and `test.skip()` the generated test with a comment explaining the inconsistency:
   ```typescript
   // @flaky-behavior: Login endpoint intermittently returns 503 under load
   test.skip('existing flow: concurrent login sessions', ...);
   ```
3. **Never assert on unverified behavior.** Every assertion must be validated against the running application. Do not guess what the app does — run it, observe it, test it.
4. **Mock external services at the boundary.** Stub third-party APIs, payment gateways, email services, and other external dependencies. Test the app's handling of responses from these services, not the services themselves. Use realistic response patterns observed in the existing app.
5. **Test data should use realistic patterns.** Use data shapes, field lengths, and value ranges that reflect the existing app's actual usage. If the app stores emails as lowercase, use lowercase emails in tests. If IDs are UUIDs, use UUIDs.

---

## Red Baseline Verification

After generating all tests, verify the red baseline:

### 1. Cucumber.js
```bash
npx cucumber-js --dry-run
```
All scenarios should parse successfully. A live run (`npx cucumber-js`) should result in all scenarios **pending** or **failing** — zero passing.

### 2. Backend Tests
```bash
cd src/api && npm run build
cd src/api && npm test
```
All tests should **compile** but **fail** at runtime because no application logic exists yet.

### 3. Playwright E2E (from Phase 3)
```bash
npx playwright test --list
```
Verify all e2e tests from Phase 3 are still listed. Do NOT modify or re-generate them.

### 4. Validation Rule
**If any test passes, something is wrong.** A passing test means either:
- The test is not asserting anything meaningful
- The test is checking a trivially true condition
- Implementation code already exists (which shouldn't be the case in Phase 4)

Investigate and fix any passing tests.

### 5. Step Definition Completeness Check

Scan ALL generated step definition files. Every step body must contain at least one of:
- An HTTP request (`this.request.post`, `this.request.get`, `request(app).post`, `request(app).get`, `fetch`)
- A Playwright page interaction (`this.page.goto`, `this.page.getByRole`, `this.page.getByLabel`, `this.page.click`)
- An assertion (`expect(...)`, `.toBe(...)`, `.toBeDefined()`)

**If ANY step body contains `throw new Error(...)` or has no executable code, the generation is incomplete.** Fix it by writing the actual test code — determine what API endpoint or UI interaction the Gherkin step implies, and write the HTTP call or Playwright interaction that exercises it.

---

## Test Quality Rules

1. **Every step definition must contain real test code** — actual HTTP requests (`this.request.post(...)`, `request(app).post(...)`), Playwright interactions (`this.page.goto(...)`, `this.page.getByRole(...).click()`), and assertions (`expect(response.status()).toBe(201)`, `expect(res.status).toBe(...)`). The test body IS the implementation contract.
2. **NEVER use placeholder stubs** — the following patterns are **strictly forbidden** in step definitions:
   - `throw new Error('Not implemented')`
   - Empty function bodies `async function () { }`
   - Bodies with only comments and no executable code
   Each of these provides zero signal to the Implementation Agent about what endpoints, routes, or UI elements to build. If you find yourself writing `throw new Error(...)`, stop and instead write the actual HTTP call, Playwright interaction, or assertion that the step requires.
3. **Tests must fail because the application doesn't exist** — not because the test is unimplemented. A step that calls `POST /api/resources` and asserts `201` will fail with a connection error or 404 — that's the correct red baseline. A step that throws `Error('Not implemented')` fails because the *test* is incomplete, which is your failure.
4. **Include TODO comments alongside real code** — use comments to explain intent (e.g., `// Seed test user via API`), but always pair them with actual test code that exercises the not-yet-existing application.
5. **Avoid `test.skip()`** — tests should exist and fail, never be skipped
6. **No hardcoded waits** in Playwright — use `waitFor`, `toBeVisible()`, `toHaveURL()`, `expect.poll()` instead of `page.waitForTimeout()`
7. **No hardcoded test data** in assertions — use constants or fixtures that can be shared across tests
8. **Each test is independent** — no test should depend on another test's side effects
9. **Scenario Outline examples** should each generate a distinct test case via parameterization

---

## Type Definitions for Compilation

In TypeScript, interfaces don't require stubs to compile — they are erased at runtime. However, when tests reference types that don't exist yet (services, models, repositories), create **type interface files** so the test project compiles:

- **Service interfaces**: `src/api/src/services/` — define the contract for each service (e.g., `IUserRepository`, `ITokenService`)
- **Model types**: `src/api/src/models/` — define data shapes (e.g., `User`, `LoginResponse`)

```typescript
// src/api/src/models/user.ts
export interface User {
  email: string;
  passwordHash: string;
}

// src/api/src/services/user-repository.ts
import { User } from '../models/user.js';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
}
```

Place these in the source directories with a comment: `// Stub: Implement during implementation phase`. The Implementation Agent will replace these with real implementations.

---

## Test Naming Conventions

| Layer | Convention | Example |
|---|---|---|
| Cucumber steps | Exact Gherkin step text as pattern | `Given('a user exists with email {string}')` |
| Vitest tests | `it('should [behavior] when [condition]')` | `it('should return token when credentials are valid')` |
| Test files | Match feature file names | `user-auth.feature` → `user-auth.steps.ts`, `user-auth.test.ts` |

---

## State Updates

After completing test generation for all features:

1. Update `.spec2cloud/state.json` — set phase to `test-generation-complete`
2. Append to `.spec2cloud/audit.log`:
   ```
   [TIMESTAMP] test-generation: Generated BDD test scaffolding for N features
   [TIMESTAMP] test-generation: Cucumber — N scenarios (N pending/failing, 0 passing)
   [TIMESTAMP] test-generation: Vitest — N tests (N failing, 0 passing)
   [TIMESTAMP] test-generation: Red baseline verified ✅
   ```
3. Commit all generated test files with message: `[test-gen] scaffold BDD tests for all features — red baseline`
