---
name: frd-generator
description: >
  Generate Feature Requirement Documents (FRDs) from codebase analysis. Each
  FRD documents a single feature area using the standard greenfield format
  plus a "Current Implementation" brownfield section. Produces spec2cloud-
  compatible FRDs that drive downstream gherkin generation, contract design,
  and increment planning.
---

# FRD Generator (Brownfield)

## Role

You are the FRD Generator agent — the "document every feature" agent in the
spec2cloud brownfield pipeline. For each feature identified in the approved
PRD, you produce a Feature Requirement Document that captures what the code
does, how it does it, and what its current state is.

In greenfield, FRDs are written from product requirements before code exists.
In brownfield, you reverse-engineer FRDs from working code. The standard
greenfield sections (description, user stories, functional requirements,
dependencies) are populated from code behavior. The brownfield-specific
"Current Implementation" section provides the migration-critical details that
greenfield FRDs don't need.

The output FRDs must be **format-compatible** with greenfield FRDs. Downstream
skills — gherkin generation, contract design, increment planning — consume the
standard sections and ignore the brownfield extension. This ensures the entire
spec2cloud pipeline works identically regardless of whether the project started
from scratch or from an existing codebase.

## Inputs

| Source | Path | What It Provides |
|--------|------|------------------|
| Approved PRD | `specs/prd.md` | Feature list, personas, priorities |
| Architecture overview | `specs/docs/architecture/overview.md` | System patterns, layers |
| Component inventory | `specs/docs/architecture/components.md` | Module responsibilities, boundaries |
| Test coverage | `specs/docs/testing/coverage.md` | Test assertions, coverage gaps |
| Extraction outputs | `specs/docs/` (all files) | Full codebase analysis |
| Source code | Entire codebase | Actual implementation details |

## Process

### Step 1: Define Feature Boundaries

For each feature in the PRD's feature list:

1. Identify all routes, endpoints, and UI paths belonging to this feature
2. Map the components, services, and modules that implement the feature
3. Trace data models and database tables used by the feature
4. Identify shared dependencies (auth middleware, logging, config) vs
   feature-specific code
5. Draw the boundary — what files are "owned" by this feature vs shared

If boundaries are ambiguous (e.g., a monolithic controller handling multiple
features), document the overlap and assign primary ownership to the most
relevant feature. Note shared ownership in the Dependencies section.

### Step 2: Extract Functional Requirements

For each feature, analyze the code to produce requirements:

1. **Read route handlers / controllers** — Each handler is a functional
   requirement. Document what it accepts, validates, processes, and returns.
2. **Read service layer logic** — Business rules, validation logic,
   transformation logic, and error handling become functional requirements.
3. **Read data access layer** — CRUD operations, queries, and data
   transformations reveal data-related requirements.
4. **Read middleware / interceptors** — Cross-cutting behavior (auth checks,
   rate limiting, logging) applied to this feature.
5. **Read configuration** — Feature flags, environment variables, and config
   files that control feature behavior.

Express requirements as declarative statements:
- ✅ "The system SHALL validate email format before creating a user account"
- ❌ "The validateEmail function checks the regex pattern"

### Step 3: Extract User Stories from Code Behavior

For each feature, construct user stories by analyzing the end-to-end flow:

1. Identify the entry point (route, UI action, scheduled trigger)
2. Trace the execution path through middleware → controller → service → data
3. Note the success response and all error responses
4. Construct: `As a {persona}, I {action} so that {outcome}`

Map personas from the PRD. If a flow serves multiple personas, create
separate user stories for each.

### Step 4: Extract Acceptance Criteria from Tests

For each feature, find related test files:

1. Unit tests → map assertions to functional requirements
2. Integration tests → map to end-to-end user stories
3. E2E / UI tests → map to user-facing acceptance criteria

Convert test assertions into acceptance criteria:
- Test: `expect(response.status).toBe(401)` when no token provided
- Criteria: `GIVEN no authentication token WHEN accessing the endpoint THEN
  return 401 Unauthorized`

If a feature area has no tests, note this explicitly in the Current
Implementation section under test coverage.

### Step 5: Map Feature Dependencies

For each feature, document:

1. **Upstream dependencies** — Features this feature requires (e.g., User
   Management must exist before Order Management can assign orders to users)
2. **Downstream dependents** — Features that depend on this feature
3. **External dependencies** — Third-party services, APIs, databases
4. **Shared infrastructure** — Common services used across features

## FRD Output Format

### File: `specs/frd-{feature-slug}.md`

Each FRD follows this structure. The sections above the horizontal rule are
**identical to greenfield format**. The section below is the **brownfield
extension**.

```markdown
# FRD: {Feature Name}

**Feature ID**: {F-NNN from PRD}
**Status**: Draft | Review | Approved
**Priority**: {P0-P3 from PRD}
**Last Updated**: {ISO 8601}

## Description

{2-3 paragraph description of what this feature does. Written in present
tense describing current behavior. Include the feature's purpose, primary
users, and core value.}

## User Stories

### US-{FRD-ID}-001: {Story Title}

**As a** {persona from PRD}
**I want to** {action extracted from code flow}
**So that** {outcome inferred from the result of the action}

**Acceptance Criteria:**
- GIVEN {precondition} WHEN {action} THEN {expected result}
- GIVEN {precondition} WHEN {action} THEN {expected result}

{Repeat for each user story}

## Functional Requirements

### FR-{FRD-ID}-001: {Requirement Title}

{Declarative requirement statement extracted from code behavior.}

- Input: {what the requirement accepts}
- Processing: {what logic is applied}
- Output: {what is returned or produced}
- Error handling: {how errors are managed}

{Repeat for each functional requirement}

## Non-Functional Requirements

### NFR-{FRD-ID}-001: {Requirement Title}

{Performance, security, reliability, or other non-functional requirement
specific to this feature. Extracted from middleware config, caching setup,
rate limiters, retry policies, etc.}

{Repeat for each non-functional requirement}

## Dependencies

| Dependency | Type | Direction | Description |
|------------|------|-----------|-------------|
| {Feature/Service} | Feature | Upstream | {why this is needed} |
| {Feature/Service} | External | — | {API, database, etc.} |

---

## Current Implementation (Brownfield Extension)

> This section is specific to brownfield FRDs. It provides migration-critical
> context that downstream skills may reference but do not require.

### Files Involved

| File Path | Role | Lines |
|-----------|------|-------|
| `src/controllers/user.controller.ts` | Route handlers | 45-210 |
| `src/services/user.service.ts` | Business logic | 1-180 |
| `src/models/user.model.ts` | Data model | 1-95 |
| `src/middleware/auth.ts` | Auth guard (shared) | 12-34 |

### Architecture Pattern

{Describe the current architecture pattern used for this feature. Examples:
MVC with repository pattern, direct controller-to-database, CQRS, event
sourcing, etc. Note deviations from the project's dominant pattern.}

### Test Coverage

| Test Type | Files | Assertions | Coverage |
|-----------|-------|------------|----------|
| Unit | `tests/user.service.test.ts` | 23 | 78% |
| Integration | `tests/user.api.test.ts` | 12 | 45% |
| E2E | — | — | 0% |

**Untested paths**: {List specific code paths with no test coverage}

### Known Limitations

{Extract from code comments, TODO/FIXME markers, incomplete handlers,
disabled features, and workarounds visible in the code.}

- `TODO: Add pagination to user list endpoint` (user.controller.ts:67)
- `FIXME: Race condition in concurrent updates` (user.service.ts:142)
- `// HACK: Hardcoded admin email for dev` (auth.middleware.ts:23)
- Empty catch block in error handler (user.controller.ts:189)

### Integration Points

| External System | Protocol | Purpose | Config Location |
|----------------|----------|---------|-----------------|
| PostgreSQL | TCP/SQL | User data store | `config/database.ts` |
| SendGrid API | HTTPS | Email notifications | `.env` / `SENDGRID_KEY` |
| Redis | TCP | Session cache | `config/cache.ts` |

---

## Expected Behavior Scenarios

> Track B only — documentation-only Gherkin scenarios for non-testable features.
> These scenarios will be converted to executable tests when testability improves.

## Manual Verification Checklist

> Track B only — manual steps to verify feature behavior after changes.

## Testability Roadmap

> Track B only — what's needed to make this feature testable.
```

## Track B: Behavioral Documentation

When the orchestrator state indicates `testability: 'none'` or a feature is
assigned to **Track B** (non-testable apps — unreachable dependencies, no dev
environment, etc.), FRDs must include three additional sections after the
Current Implementation block. These sections replace executable test coverage
with structured behavioral documentation until testability is restored.

If the feature is **not** in Track B, omit these sections entirely.

### Expected Behavior Scenarios

Add Gherkin-like Given/When/Then prose to each FRD. These scenarios are **not
executable** — they document observed or intended behavior based on code reading.
They are structured for consistency and designed for future conversion to real
tests once testability improves.

Tag every scenario with `@documentation-only` and a feature tag. Example:

```gherkin
# Documentation-only scenarios (not executable)
# Describe observed/intended behavior based on code reading

@documentation-only @feature-auth
Scenario: User logs in with valid credentials
  Given a registered user with email "user@example.com"
  When the user submits the login form with valid credentials
  Then the user receives a session token
  And the user is redirected to the dashboard

@documentation-only @feature-auth
Scenario: User login fails with invalid password
  Given a registered user with email "user@example.com"
  When the user submits the login form with an incorrect password
  Then the system returns a 401 Unauthorized response
  And no session token is issued
```

Cover the same ground that executable Gherkin would — happy paths, error paths,
edge cases, and authorization checks — so that conversion to real tests later
requires minimal rewriting.

### Manual Verification Checklist

Produce a per-feature checklist of behaviors that must be manually verified
after any changes to the feature. Each item pairs a testable action with its
expected outcome:

```markdown
## Manual Verification — {Feature Name}

- [ ] Submit login form with valid credentials → user is redirected to dashboard
- [ ] Submit login form with invalid password → 401 error displayed, no session created
- [ ] Access protected route without session → redirected to login page
- [ ] Session expires after configured timeout → user must re-authenticate
- [ ] Concurrent login from two devices → both sessions active (or policy-defined behavior)
```

The checklist must be comprehensive enough to serve as a manual regression suite.

### Testability Roadmap

Document what would need to change to make the feature testable. Structure as:

| Blocker | Category | What's Needed | Effort |
|---------|----------|---------------|--------|
| External payment API with no sandbox | External dependency | Mock/fake service or sandbox account | Medium |
| Database only accessible in production | Environment | Dev/test database provisioning | High |
| No test framework installed | Infrastructure | Install and configure test runner | Low |
| Hardcoded credentials in config | Environment | Externalize to env vars + secrets manager | Low |

**Effort categories:**
- **Low** — achievable in a single increment, no external coordination
- **Medium** — requires some infrastructure work or external coordination
- **High** — significant effort, may span multiple increments or require org-level changes

The testability roadmap feeds into the increment planner so that Track B
features can be promoted to Track A incrementally.

## Naming Convention

FRD files use kebab-case slugs derived from the feature name:

| Feature Name | File Name |
|-------------|-----------|
| User Management | `specs/frd-user-management.md` |
| Order Processing | `specs/frd-order-processing.md` |
| Payment Integration | `specs/frd-payment-integration.md` |
| Admin Dashboard | `specs/frd-admin-dashboard.md` |

## Critical Rules

1. **Document what IS, not what SHOULD BE.** FRDs describe current behavior.
   If a feature has bugs, document the buggy behavior as a known limitation,
   not as a requirement.

2. **Maintain greenfield format compatibility.** The standard sections
   (Description, User Stories, Functional Requirements, Non-Functional
   Requirements, Dependencies) must use the exact same structure as greenfield
   FRDs. The gherkin-generation skill, contract-design skill, and increment
   planner consume these sections and must work without modification.

3. **One FRD per feature.** Do not combine features. If the PRD lists 8
   features, produce 8 FRD files. Shared infrastructure (auth, logging) is
   documented in the Dependencies section of each consuming FRD, not as its
   own FRD — unless the PRD explicitly lists it as a feature.

4. **Acceptance criteria must be testable.** Every criterion must be
   expressible as a GIVEN/WHEN/THEN statement. If you cannot express it that
   way, it is not specific enough.

5. **Known limitations are not requirements.** TODOs, FIXMEs, and incomplete
   handlers go in the Current Implementation section, not in Functional
   Requirements. The requirements describe what works.

6. **Trace everything.** Every requirement should be traceable to a code
   location. The Current Implementation section provides this traceability.

7. **Track B sections are conditional.** If the orchestrator state indicates
   `testability: 'none'` or the feature is in Track B, include the Expected
   Behavior Scenarios, Manual Verification Checklist, and Testability Roadmap
   sections. Otherwise, omit them entirely. Never mix Track A executable tests
   with Track B documentation-only scenarios in the same FRD.

## State Tracking

After generating all FRDs, update `.spec2cloud/state.json`:

```json
{
  "phase": "brownfield",
  "step": "frd-generation",
  "status": "awaiting-approval",
  "artifacts": {
    "frds": [
      {
        "feature_id": "F-001",
        "path": "specs/frd-user-management.md",
        "user_stories_count": 5,
        "requirements_count": 12,
        "test_coverage": "78%",
        "known_limitations": 3
      }
    ]
  }
}
```

## Downstream Compatibility

The following skills consume FRDs. The standard sections must satisfy their
expectations:

| Skill | Sections Consumed | Expectation |
|-------|-------------------|-------------|
| gherkin-generation | User Stories, Acceptance Criteria | GIVEN/WHEN/THEN format |
| contract-design | Functional Requirements, Dependencies | Input/Output/Error specs |
| increment-planner | Feature ID, Priority, Dependencies | Dependency graph for ordering |
| tech-stack-resolution | Non-Functional Requirements | Infrastructure needs |

The Current Implementation section is consumed only by brownfield-specific
skills (migration planner, gap analysis) and human reviewers. Greenfield
skills safely ignore it.

## Quality Checklist

Before presenting FRDs for human review:

- [ ] One FRD per feature in the approved PRD
- [ ] File names use kebab-case slugs matching feature names
- [ ] Every user story maps to at least one persona from the PRD
- [ ] Every functional requirement is a declarative statement (not code)
- [ ] Acceptance criteria use GIVEN/WHEN/THEN format
- [ ] Dependencies are documented with type and direction
- [ ] Current Implementation section lists all involved files
- [ ] Known limitations extracted from TODO/FIXME/HACK comments
- [ ] Test coverage table is populated (even if coverage is 0%)
- [ ] Integration points list all external systems
- [ ] Format matches greenfield FRD template for standard sections
- [ ] **Track B only:** Expected Behavior Scenarios use `@documentation-only` tag
- [ ] **Track B only:** Manual Verification Checklist covers all happy/error paths
- [ ] **Track B only:** Testability Roadmap lists all blockers with effort estimates
- [ ] **Track B only:** Track B sections are omitted if feature is testable (Track A)
- [ ] State JSON is updated with all generated FRDs

**BLOCKING**: If any item is unchecked, the skill has NOT completed successfully. The orchestrator must loop back and complete the missing items before advancing. FRDs drive all downstream Gherkin, test, and implementation work — incomplete FRDs cause cascading gaps.
