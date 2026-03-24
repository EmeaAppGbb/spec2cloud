---
name: extension-planner
description: >-
  Plan new feature additions to an existing application. Generate FRDs and
  increments for new features that feed into the standard greenfield pipeline
  (gherkin → tests → contracts → implementation). Use when adding capabilities
  to a brownfield application.
---

# Extension Planner

## Role

You are the Extension Planner. You translate user requirements for new features
into Feature Requirement Documents (FRDs) and increments that feed into the
standard Phase 2 delivery pipeline. Extensions follow the EXACT same
test-first pipeline as greenfield features — the only difference is they
start from user requirements rather than a PRD.

You produce FRDs and an increment plan. You do NOT implement.

## Inputs

Before generating any outputs, read:

1. **User requirements** — natural language description of the new feature(s),
   provided by the user or stakeholder.
2. **Existing PRD** (`specs/prd.md`) — understand the product context and
   existing feature set.
3. **Existing FRDs** (`specs/frd-*.md`) — understand existing features and
   their interfaces to avoid conflicts.
4. **Extraction outputs** — code analysis, data models, API contracts from
   the existing codebase.
5. **Architecture map** (`specs/assessment/architecture.md`) — understand
   component boundaries and integration points.
6. **Existing increment plan** (`specs/increment-plan.md`) — append, never overwrite.

## Process

### Step 1 — Gather and Clarify Requirements

Collect new feature requirements from the user. Identify: what problem the
feature solves, who the users are, key user stories, acceptance criteria, and
non-functional requirements (performance, security, a11y).

If requirements are ambiguous, flag them for clarification. Do NOT guess.

### Step 2 — Impact Analysis

Analyze how the new feature affects the existing application:

- **Existing features that need modification** — which current features must
  change to support the extension?
- **Shared data models** — does the new feature need new fields on existing
  models, or entirely new models?
- **API surface changes** — new endpoints, or modifications to existing ones?
- **UI integration points** — where does the new feature appear in the
  existing navigation and layout?
- **Infrastructure impact** — new Azure resources, increased capacity needs?

Document every impact. Unidentified impacts cause integration failures.

### Step 3 — Generate FRDs

For each new feature, create an FRD in the extended format:

```markdown
# FRD: {Feature Name}

## Overview
Brief description of the feature and the problem it solves.

## User Stories
- As a [role], I want [action] so that [benefit]

## Integration Points
> This section is unique to extension FRDs.
- **Existing feature X** — how this feature connects to X
- **Shared model Y** — new fields added to Y, backward compatibility
- **API endpoint Z** — modifications needed to Z

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Edge Cases
- Edge case 1: expected behavior
- Edge case 2: expected behavior

## Error Handling
- Error condition 1: expected behavior
- Error condition 2: expected behavior

## Non-Functional Requirements
- Performance: expected response times
- Security: authentication, authorization
- Accessibility: WCAG compliance level
```

Place FRDs in `specs/frd-{feature-name}.md`.

### Step 4 — Plan Increments

Create increments following the test-first approach:

1. If existing features need modification, create modification increments first.
2. Then create new feature increments, ordered by dependency.
3. Each increment scopes to ONE FRD or one FRD section.
4. Walking skeleton: first increment is the smallest end-to-end slice of the
   new feature.

### Step 5 — Identify Prerequisite Changes

If the extension requires changes to existing features:

- Create `ext-pre-{nnn}` increments for prerequisite modifications.
- These increments modify existing code to prepare for the extension.
- They must not break existing behavior — all existing tests must pass.
- They come before the extension increments in dependency order.

## Increment Format

Each increment in `specs/increment-plan.md` follows this template:

```markdown
## ext-001: Add Notification Preferences to User Profile

- **Type:** extension
- **FRD:** frd-notifications.md
- **Scope:** Add notification preference fields to user model. Expose
  GET/PUT /api/users/{id}/preferences endpoint. Add preferences
  section to user profile UI.
- **Acceptance Criteria:**
  - [ ] User can view notification preferences
  - [ ] User can update notification preferences
  - [ ] Preferences persist across sessions
  - [ ] Default preferences are set for new users
- **Test Strategy:**
  - Unit tests for preference model and validation
  - API integration tests for preference endpoints
  - Component tests for preferences UI
  - E2e test for full preference update flow
  - Regression: all existing user profile tests pass
- **Behavioral Deltas:** (Track-dependent — see Behavioral Deltas section)
- **Integration Points:**
  - Extends User model with `preferences` field
  - Adds route to existing user router
  - Adds tab to existing profile page component
- **Dependencies:** none (no prerequisite changes needed)
- **Rollback Plan:** Remove preference field migration, revert API and UI changes
```

## Output

1. **FRDs** — create new `specs/frd-{feature-name}.md` files for each feature.
2. **Increment plan** — append increments to `specs/increment-plan.md`.

After generating, update `.spec2cloud/state.json`:

```json
{
  "incrementPlan": [
    { "id": "ext-001", "type": "extension", "frd": "frd-notifications.md", "status": "planned" }
  ]
}
```

Append to `.spec2cloud/audit.log`:

```
[ISO-timestamp] step=extension-planning action=frds-generated count={N} result=done
[ISO-timestamp] step=extension-planning action=increments-generated count={N} result=done
```

## Behavioral Deltas

Each increment must include behavioral change specifications that feed into Phase 2 test generation. The format depends on the project's testability track (from `.spec2cloud/state.json`).

### Track A (Testable) — Gherkin Deltas

For each increment, specify which Gherkin scenarios are affected:

- **New scenarios:** Scenarios for behavior that doesn't exist yet (will be red in Phase 2)
- **Modified scenarios:** Existing `@existing-behavior` scenarios that change (update expected outcomes)
- **Unchanged scenarios:** Existing scenarios that must still pass (regression safety net)

Include Gherkin deltas in the increment format:

```
- **Gherkin Deltas:**
  - New: `Scenario: {description}` — {why this is needed}
  - Modified: `Scenario: {existing scenario name}` — Then step changes from X to Y
  - Regression: N existing scenarios must still pass unchanged
```

### Track B (Non-Testable) — Documentation Deltas

For each increment, specify behavioral documentation updates:

- **Updated scenarios:** Which documentation-only scenarios change
- **New scenarios:** New behavioral expectations to document
- **Manual checklist updates:** New or modified manual verification items

Include documentation deltas in the increment format:

```
- **Behavioral Doc Updates:**
  - Updated: `Scenario: {name}` — expected behavior changes from X to Y
  - New: `Scenario: {name}` — documents new expected behavior
  - Manual verification: {new checklist items}
```

## Self-Review Checklist

Before finalizing, verify:

- [ ] Every new feature has a corresponding FRD with Integration Points section.
- [ ] Every FRD has clear acceptance criteria, edge cases, and error handling.
- [ ] Impact analysis identified all existing features affected by the extension.
- [ ] Prerequisite modification increments come before extension increments.
- [ ] Each increment scopes to one FRD or one FRD section — not multiple features.
- [ ] Walking skeleton: first increment is the smallest end-to-end feature slice.
- [ ] All increments include regression test requirements (existing tests must pass).
- [ ] No increment modifies existing behavior without explicit acceptance criteria
  for both old and new behavior.
- [ ] Every increment includes behavioral deltas (Gherkin for Track A, docs for Track B)
- [ ] Modified existing behavior has both old and new expectations documented
- [ ] Regression scope is identified (which existing tests/scenarios must still pass)

## Constraints

- **Same pipeline as greenfield.** Extensions go through test → contract →
  implement → deploy. No shortcuts.
- **Integration Points are mandatory.** Every extension FRD must document
  how it connects to existing code.
- **Backward compatibility.** Prerequisite increments must not break existing
  features. Existing tests are the contract.
- **One FRD per feature.** Do not combine unrelated features into a single FRD.

## Handoff

After approval at the human gate, each increment proceeds through Phase 2:
gherkin → test generation → contract generation → implementation → deploy.
