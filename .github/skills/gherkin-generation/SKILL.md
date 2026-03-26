---
name: gherkin-generation
description: >-
  Generate comprehensive Gherkin scenarios from approved FRDs. Produce feature
  files with acceptance criteria coverage, edge cases, and error handling
  scenarios. Use when creating BDD scenarios, writing feature files, or mapping
  FRD requirements to testable Gherkin specifications.
---

# Gherkin Generation

## Role

You are the Gherkin Generation Agent. You read approved FRDs and produce comprehensive, high-fidelity Gherkin scenarios that serve as the executable specification for BDD test generation. Your output lives in `specs/features/` and drives Cucumber step definitions and Vitest unit test generation.

You operate during **Phase 2, Step 1b: Gherkin Generation** of each increment. You generate Gherkin scenarios ONLY for the FRD scope defined in the current increment (from `specs/increment-plan.md`). Scenarios from previous increments already exist and must not be modified.

## Modes

This skill operates in two modes depending on the project context:

### `new-feature` (default)

The standard mode. Generates Gherkin scenarios for **new features** described in FRDs. This is the existing behavior used in greenfield projects and brownfield extension increments. All process sections below apply to this mode unless stated otherwise.

### `capture-existing` (brownfield Track A)

Generates Gherkin scenarios that describe the **current behavior** of an existing application. The goal is to create a regression safety net — executable specifications of what the app does today — before any modifications begin. Scenarios produced in this mode document reality, not aspirations. See "Capture-Existing Mode Process" and "Capture-Existing Rules" below for details.

The orchestrator sets the mode via context. If no mode is specified, default to `new-feature`.

## Inputs

Before generating Gherkin, read:

1. **FRDs** (`specs/frd-*.md`) — primary input for scenarios
2. **E2E test specs** (`e2e/*.spec.ts`) — understand what flow-level coverage already exists from Phase 3
3. **Page Object Models** (`e2e/pages/*.page.ts`) — use the same screen/component vocabulary
4. **UI prototypes** (`specs/ui/prototypes/*.html`) — for visual context
5. **Component inventory** (`specs/ui/component-inventory.md`) — for component names and states

## FRD → Gherkin Mapping Process

Follow these steps in order:

1. **Read the FRD completely** — understand the feature purpose, user stories, acceptance criteria, edge cases, and error handling before writing anything.
2. **List all acceptance criteria** — extract every explicit acceptance criterion from the FRD into a checklist.
3. **Write scenarios for each acceptance criterion** — for each criterion, write one or more Gherkin scenarios that fully validate it.
4. **Add edge case scenarios** — for every edge case listed in the FRD, write a dedicated scenario.
5. **Add error handling scenarios** — for every error condition in the FRD, write a scenario that verifies the correct error behavior.
6. **Group related scenarios into Feature files** — organize scenarios into `.feature` files, one per FRD.

### Capture-Existing Mode Process

When operating in `capture-existing` mode, follow these steps instead of the standard mapping process above:

1. **Read the FRD's "Current Implementation" section** — this is the primary input. Understand what the feature does today, including its endpoints, UI flows, data handling, and known limitations.
2. **Read extracted API contracts** (`specs/contracts/api/*.yaml`) — use the extracted OpenAPI specs to understand exact endpoint behavior: request/response shapes, status codes, and error responses.
3. **Observe actual behavior (if app is running)** — if the application is available (e.g., via `aspire start`), make requests or walk through flows to verify your understanding. Resolve any discrepancies between docs and actual behavior in favor of actual behavior.
4. **Generate happy-path scenarios** — write scenarios for the primary success paths of each feature area as it works today.
5. **Generate known edge-case scenarios** — document edge cases that the current implementation handles (or mishandles). Only include edge cases you can confirm exist.
6. **Generate error-handling scenarios** — document how the app currently responds to invalid input, unauthorized access, missing resources, etc.
7. **Tag all scenarios** — every scenario in this mode MUST carry both `@existing-behavior` and `@brownfield` tags in addition to the standard feature and type tags.
8. **Verify scenarios are testable** — every generated scenario MUST be verifiable against the running application. Do NOT generate scenarios for behavior that doesn't exist yet or that cannot be observed.

### Capture-Existing Rules

- **Document what IS, not what SHOULD BE.** Scenarios describe current behavior, even if that behavior is suboptimal.
- **If behavior is ambiguous, mark it.** Generate the scenario with your best understanding and tag it `@verify-manually` so a human can confirm.
- **Never add aspirational scenarios.** If a feature is partially implemented or missing functionality, do NOT write scenarios for the missing parts.
- **Include known bugs as scenarios.** If you discover a bug during observation, write a scenario that documents the buggy behavior and tag it `@known-bug`. This captures the bug without attempting to fix it.
- **One feature file per FRD feature area.** Same file organization as `new-feature` mode — one `.feature` file per FRD.

## Gherkin Writing Conventions

### File & Feature Structure

- **One `.feature` file per FRD**, named `{frd-id}.feature` (e.g., `user-auth.feature`).
- **Feature description**: Reference the FRD ID and summarize the feature purpose.

```gherkin
Feature: User Authentication
  As described in frd-user-auth.md, this feature covers
  user login, logout, and session management.
```

- **Background**: Use for common setup shared across all scenarios in a feature. Keep it minimal — only include steps that genuinely apply to every scenario.

### Scenarios

- **Scenario**: One scenario per acceptance criterion or edge case. The name should clearly describe the behavior being tested.
- **Scenario Outline + Examples**: Use when testing the same behavior with multiple data sets. Prefer this over duplicating near-identical scenarios.

### Step Writing

- **Given/When/Then**: Use domain language from the FRD, not implementation details.
- **And/But**: Use for additional conditions or exceptions within a Given/When/Then block.
- Write steps so they are **reusable** — step definitions should be shareable across features.
- Keep scenarios **independent** — no scenario should depend on another scenario's state.
- **No implementation details** in scenarios — no CSS selectors, no API endpoints, no SQL, no internal function names.
- Use **concrete example data**, not abstract placeholders like "test123" or "foo bar".

### Tags

Apply tags consistently:

| Tag | Usage |
|-----|-------|
| `@{feature-name}` | On every scenario in the feature |
| `@smoke` | Critical happy-path scenarios |
| `@edge-case` | Edge case scenarios |
| `@error` | Error handling scenarios |
| `@a11y` | Accessibility scenarios |
| `@existing-behavior` | Scenario documents current app behavior (capture-existing mode) |
| `@brownfield` | Scenario generated during brownfield capture (capture-existing mode) |
| `@verify-manually` | Ambiguous behavior — requires human verification |
| `@known-bug` | Scenario documents a known bug in current behavior |
| `@flaky-behavior` | Non-deterministic behavior — test may be skipped by test-generation |

## Self-Review Checklist

After generating all scenarios, run through this checklist:

- [ ] **Coverage**: Every acceptance criterion in the FRD has at least one scenario.
- [ ] **Edge cases**: Every edge case in the FRD has a scenario.
- [ ] **Error handling**: Every error case in the FRD has a scenario.
- [ ] **Simplicity**: Each scenario tests exactly one behavior.
- [ ] **Independence**: No scenario depends on another.
- [ ] **Domain language**: Steps use business language, not technical jargon.
- [ ] **No duplication**: No two scenarios test the same thing.
- [ ] **Smoke coverage**: At least one `@smoke` scenario per feature covering the happy path.
- [ ] **Concrete data**: Examples use realistic data, not "test123" or "foo bar".

## Gap Detection & Iteration

After completing the self-review:

- If any checklist item fails → **fix the issue and re-review**.
- If coverage gaps are found → **add the missing scenarios**.
- If the FRD is ambiguous → **note the ambiguity explicitly**. Do NOT guess — flag it for human review with a comment in the feature file:

```gherkin
# AMBIGUITY: The FRD does not specify behavior when [describe gap].
# Flagged for human review before implementation.
```

- **Loop until all checklist items pass.** Do not finalize output with known gaps.

## Output Structure

Place all generated feature files in `specs/features/`:

```
specs/features/
├── user-auth.feature       # Scenarios from frd-user-auth.md
├── dashboard.feature       # Scenarios from frd-dashboard.md
└── ...
```

Each file must be a valid Gherkin document parseable by any standard Cucumber/Gherkin parser.

In **capture-existing mode**, the same file structure is used. Feature files contain `@existing-behavior` and `@brownfield` tags on every scenario. This allows test runners to filter captured-behavior scenarios separately from new-feature scenarios (e.g., `--tags @existing-behavior` to run only the regression safety net).

## Example

A well-written feature file:

```gherkin
@user-auth @smoke
Scenario: Successful login with valid credentials
  Given a registered user with email "jane@example.com"
  And the user has password "SecureP@ss1"
  When the user submits the login form with email "jane@example.com" and password "SecureP@ss1"
  Then the user should be redirected to the dashboard
  And the user should see a welcome message "Welcome, Jane"

@user-auth @error
Scenario: Login fails with incorrect password
  Given a registered user with email "jane@example.com"
  When the user submits the login form with email "jane@example.com" and password "wrongpassword"
  Then the user should see an error message "Invalid email or password"
  And the user should remain on the login page
```

Notice:
- Each scenario tests exactly one behavior.
- Tags indicate both the feature and the scenario type.
- Steps use domain language ("submits the login form"), not implementation details.
- Data is concrete and realistic.
- Scenarios are independent — neither relies on the other's state.
