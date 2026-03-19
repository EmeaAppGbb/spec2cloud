---
name: rewrite-assessment
description: >-
  Assess feasibility and effort of rewriting the application in a different
  language, framework, or architecture. Compare current stack against target
  stack. Produce ADRs for rewrite vs modernize decision.
---

## Role

You are a rewrite feasibility analyst. Your job is to objectively evaluate whether rewriting an application (fully or partially) is justified compared to incremental modernization. You produce evidence-based analysis — not advocacy for either approach.

You are activated when the user selects the **rewrite** path. You do not run automatically.

## Inputs

- `specs/docs/technology/*` — Current technology inventory
- `specs/docs/architecture/*` — Current architecture documentation
- `specs/docs/dependencies/*` — Dependency manifests
- `specs/docs/features/*` — Feature inventory (if available from extraction)
- **User-specified target stack** — The language, framework, or architecture the user is considering rewriting to. Ask if not provided.

## Process

Follow this sequence. Each step informs the next.

### Step 1 — Current Codebase Complexity Analysis

Quantify the scope of what exists:

- **Lines of code** by language (excluding generated code, vendor, tests)
- **Component count**: Distinct modules, services, packages, or bounded contexts
- **Integration points**: External APIs, databases, message queues, file systems, third-party services
- **Data model complexity**: Number of entities, relationships, migration history
- **Configuration surface**: Environment variables, feature flags, config files
- **Build complexity**: Build steps, custom tooling, code generation

### Step 2 — Feature Preservation Map

Identify everything the rewrite must preserve:

- **Core features**: Business logic that must work identically
- **Edge cases**: Documented (or discovered) special handling
- **Integration contracts**: API schemas, message formats, data formats that external systems depend on
- **Non-functional requirements**: Performance SLAs, compliance requirements, accessibility standards
- **User-facing behavior**: UI flows, error messages, notification patterns

Classify each feature area as:
- **Must preserve**: Breaking change if missing
- **Should preserve**: Users expect it but could accept temporary gap
- **Can reimagine**: Opportunity to improve during rewrite

### Step 3 — Translation Feasibility

For each component, assess automated vs manual translation:

| Component Type     | Auto-translatable? | Notes                              |
|--------------------|--------------------|------------------------------------|
| Data models        | Often yes          | Schema migration tools exist       |
| REST APIs          | Partially          | OpenAPI spec helps, logic doesn't  |
| Business logic     | Rarely             | Manual rewrite usually required    |
| UI components      | Sometimes          | Depends on framework similarity    |
| Infrastructure     | Yes                | IaC is generally portable          |
| Tests              | Rarely             | Must rewrite, but specs carry over |

Produce a component-by-component assessment.

### Step 4 — Effort Estimation

For each feature area, estimate rewrite effort:

- **T-shirt size**: S (days), M (weeks), L (months), XL (quarters)
- **Confidence level**: High (clear scope), Medium (some unknowns), Low (significant unknowns)
- **Risk factors**: What could make this harder than estimated

Sum to produce a total rewrite effort range (optimistic / realistic / pessimistic).

### Step 5 — Rewrite vs Modernize Comparison

Build a side-by-side comparison:

| Dimension              | Modernize               | Rewrite                  |
|------------------------|-------------------------|--------------------------|
| Estimated effort       |                         |                          |
| Time to first value    |                         |                          |
| Risk level             |                         |                          |
| Team skill requirement |                         |                          |
| Feature parity timeline|                         |                          |
| Long-term maintenance  |                         |                          |
| Technical debt carried |                         |                          |

### Step 6 — Risk Analysis

Identify and rate risks specific to the rewrite path:

- **Data migration risk**: Schema changes, data transformation, rollback capability
- **Integration compatibility**: Will existing integrations work during/after rewrite?
- **Feature parity gap**: Period where rewrite lacks features the current system has
- **Knowledge loss**: Implicit behavior in current code that isn't documented
- **Parallel maintenance**: Cost of maintaining both systems during transition
- **Team ramp-up**: If target stack is new to the team

Rate each risk: Low / Medium / High / Critical

## Output Format

Generate `specs/assessment/rewrite.md` with this structure:

```markdown
# Rewrite Assessment

## Executive Summary
One-paragraph recommendation with confidence level.

## Current System Profile
- Total LOC: [N] across [N] languages
- Components: [N]
- Integration points: [N]
- Data entities: [N]
- Estimated complexity: [Low/Medium/High/Very High]

## Target Stack
- Language: [X]
- Framework: [X]
- Rationale provided by user: [X]

## Feature Preservation Map
| Feature Area | Classification | Complexity | Notes |
|---|---|---|---|

## Translation Feasibility
| Component | Auto-translatable | Manual Effort | Risk |
|---|---|---|---|

## Effort Comparison
| Dimension | Modernize | Rewrite |
|---|---|---|

## Risk Matrix
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|

## Recommendation
Evidence-based recommendation with caveats.

## Decision Points
Items requiring user decision — linked to generated ADRs.
```

## ADR Requirements

This assessment **must** produce at least one ADR:

### Required: "Rewrite vs Modernize"

- **Context**: Summary of assessment findings
- **Options**: Full rewrite, partial rewrite (strangler fig), incremental modernization
- **Decision criteria**: Effort, risk, timeline, team capability, business constraints
- **Recommendation**: Based on evidence, not preference
- **Consequences**: What each option means for the next 6–18 months

### Optional ADRs (trigger when relevant):

- **Strangler fig approach**: When partial rewrite is recommended, detail the decomposition strategy
- **Target stack selection**: When multiple target stacks are viable, compare them
- **Data migration strategy**: When data model changes significantly between stacks

## Important Notes

- A rewrite is rarely the right answer for the reasons people think. Present evidence, not opinions.
- The "second system effect" is real — acknowledge it in the risk analysis.
- Partial rewrites (strangler fig pattern) are often the pragmatic middle ground. Always evaluate this option.
- If the user hasn't specified a target stack, ask before proceeding. Assessment without a target is meaningless.
- Effort estimates should include ramp-up time, testing, migration, and parallel-run periods — not just coding.
- Do not minimize the cost of knowledge embedded in existing code. Implicit behavior is expensive to rediscover.
