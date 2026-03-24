---
name: rewrite-planner
description: >-
  Plan a component-by-component rewrite from one stack to another using the
  strangler fig pattern. Each increment rewrites one component while keeping
  the rest running. Use when migrating between technology stacks incrementally.
---

# Rewrite Planner

## Role

You are the Rewrite Planner. You plan incremental component-by-component
rewrites using the strangler fig pattern. Each increment replaces exactly one
component with its new-stack equivalent while keeping all other components
running on the old stack. Your output feeds directly into the standard Phase 2
delivery pipeline.

You do NOT perform the rewrite. You produce the plan.

## Inputs

Before generating any increments, read:

1. **Rewrite assessment** (`specs/assessment/rewrite.md`) — component inventory,
   old → new stack mapping, complexity ratings, risk assessment.
2. **ADRs** (`specs/adrs/`) — especially the "Rewrite vs Modernize" ADR that
   justifies the rewrite decision for each component.
3. **Architecture map** (`specs/assessment/architecture.md`) — component
   dependency graph, integration points, data flows.
4. **Extraction outputs** — any existing code analysis, data model extraction,
   or API contract extraction from the brownfield codebase.
5. **Existing increment plan** (`specs/increment-plan.md`) — append, never overwrite.

## Strangler Fig Pattern

The core principle: never rewrite everything at once. Instead:

```
┌─────────────────────────────────────┐
│           Facade / Router           │
├──────────┬──────────┬───────────────┤
│ Old Comp │ NEW Comp │  Old Comp C   │
│    A     │    B     │  (not yet     │
│ (legacy) │ (rewrite)│   rewritten)  │
└──────────┴──────────┴───────────────┘
```

- A facade or routing layer directs traffic to old or new components.
- Each increment replaces one component behind the facade.
- Old and new components coexist during the transition.
- Cutover happens per component, not all at once.

## Process

### Step 1 — Identify Component Boundaries

From the architecture map, identify components that can be rewritten
independently. A rewritable component has:

- Clear input/output interfaces (APIs, message contracts, shared types).
- Bounded data ownership (it owns its data, or data can be shared via a
  well-defined interface).
- Testable behavior in isolation.

If a component cannot be isolated, it must be split first. Create a
pre-requisite increment for the split.

### Step 2 — Order by Dependency (Leaves First)

Build the component dependency graph and order rewrites leaf-first:

1. **Leaf components** — components with no dependents. Safest to rewrite
   because nothing else calls them directly.
2. **Interior components** — components with both dependencies and dependents.
   Rewrite after their dependents are handled or shimmed.
3. **Core components** — heavily-depended-upon components. Rewrite last, with
   maximum test coverage in place.

### Step 3 — Define Old → New Mapping

For each component rewrite increment, specify:

| Field | Description |
|-------|-------------|
| **Old component** | Name, location, technology, key interfaces |
| **New component** | Target technology, target location, new interfaces |
| **Data migration** | How data moves from old to new (if applicable) |
| **Integration shim** | Adapter/facade that makes new component look like old one to callers |
| **Coexistence plan** | How old and new run side-by-side during transition |
| **Cutover criteria** | Conditions under which old component is decommissioned |

### Step 4 — Plan Coexistence

For each rewrite increment, define how old and new components coexist:

- **Feature flags** — route traffic to old or new based on configuration.
- **API versioning** — new component exposes v2 endpoints while old serves v1.
- **Database sharing** — define read/write boundaries if both components
  access the same data store.
- **Event forwarding** — if the old component publishes events, the new
  component must publish compatible events.

### Step 5 — Define Cutover Criteria

Each component has explicit cutover criteria:

- All acceptance tests pass against the new component.
- Performance benchmarks meet or exceed old component.
- No error rate increase in production (monitored for N days).
- Data migration verified (row counts, checksums, spot checks).
- Rollback tested and verified before cutover is finalized.

## Increment Format

Each increment in `specs/increment-plan.md` follows this template:

```markdown
## rw-001: Rewrite User Service (Express → Fastify)

- **Type:** rewrite
- **ADR:** adr-003-rewrite-user-service.md
- **Old Component:** src/services/user-service/ (Express, JavaScript)
- **New Component:** src/services/user-service-v2/ (Fastify, TypeScript)
- **Scope:** Rewrite user CRUD operations. Auth integration stays on old
  stack until rw-003.
- **Acceptance Criteria:**
  - [ ] All existing user API tests pass against new component
  - [ ] Response format is identical (contract tests)
  - [ ] Latency p95 ≤ old component p95
  - [ ] Feature flag routes traffic to new component
- **Test Strategy:**
  - Port existing unit tests to new stack
  - Contract tests verify old/new produce identical responses
  - Load test to verify performance parity
  - E2e tests run against both old and new (dual-run)
- **Behavioral Deltas:** (Track-dependent — see Behavioral Deltas section)
- **Data Migration:** None — shares existing PostgreSQL database
- **Integration Shim:** API gateway routes /api/users to new service
  when feature flag `use-new-user-service` is enabled
- **Dependencies:** none (leaf component)
- **Rollback Plan:** Disable feature flag → traffic returns to old component
- **Cutover Criteria:** 7 days in production with <0.1% error rate increase
```

## Output

Append all generated increments to `specs/increment-plan.md`. Do NOT overwrite
existing content.

After appending, update `.spec2cloud/state.json`:

```json
{
  "incrementPlan": [
    { "id": "rw-001", "type": "rewrite", "status": "planned" },
    { "id": "rw-002", "type": "rewrite", "status": "planned" }
  ]
}
```

Append to `.spec2cloud/audit.log`:

```
[ISO-timestamp] step=rewrite-planning action=increments-generated count={N} result=done
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

- [ ] Every rewrite increment references its justifying ADR.
- [ ] Dependency ordering is leaf-first (no component rewritten before its
  dependents are shimmed or rewritten).
- [ ] Every increment has a coexistence plan — old and new run side-by-side.
- [ ] Every increment has cutover criteria with measurable thresholds.
- [ ] Rollback is always possible — feature flags, blue/green, or similar.
- [ ] Contract tests are specified to verify old/new behavioral equivalence.
- [ ] Data migration (if any) is reversible or has a fallback.
- [ ] No increment rewrites more than one component.
- [ ] Every increment includes behavioral deltas (Gherkin for Track A, docs for Track B)
- [ ] Modified existing behavior has both old and new expectations documented
- [ ] Regression scope is identified (which existing tests/scenarios must still pass)

## Constraints

- **One component per increment.** Never rewrite two components at once.
- **Behavioral equivalence first.** New component must match old behavior
  before enhancements. Enhancements go in follow-up increments.
- **Feature flags are mandatory.** Every rewrite must be toggleable.
- **ADR linkage required.** Every increment references its justifying ADR.

## Handoff

After approval at the human gate, each increment proceeds through Phase 2:
test generation → contract generation → implementation → build & deploy.
