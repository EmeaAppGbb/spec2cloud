# Brownfield: Modernizing Existing Code

Transform existing codebases into spec-driven projects, then modernize, extend, or rewrite with the same quality guarantees as greenfield.

![Brownfield Pipeline — from existing code to cloud](assets/brownfield-pipeline.svg)

## The Approach

Brownfield is harder than greenfield because you're not starting from a blank slate. spec2cloud handles this by first understanding what exists (extraction), then generating specifications from that understanding (spec-enable), and finally feeding those specs into the same delivery pipeline used for new applications.

## Phase B1: Extract (Pure Facts)

Six extraction skills scan the codebase without making any judgments:

- **Codebase Scanner** — Languages, frameworks, entry points, conventions → specs/docs/technology/stack.md
- **Dependency Inventory** — Complete catalog of all dependencies
- **Architecture Mapper** — Components, layers, data flow
- **API Extractor** — Existing API contracts and endpoints
- **Data Model Extractor** — Database schemas, ERDs, relationships
- **Test Discovery** — Existing test coverage and gaps

This phase produces pure documentation of what exists.

## Phase B2: Spec-Enable

Two generators create formal specifications from the extraction output:

- **PRD Generator** — Product Requirements Document reverse-engineered from the codebase
- **FRD Generator** — Feature Requirement Documents with "Current Implementation" sections

The result: your existing codebase now has the same specification foundation as a greenfield project.

## Choose Your Path

**Human Gate:** This is the critical decision point. You choose which paths to pursue:

| Path | When to Use | Assessment Skill | Planning Skill |
|------|-------------|-----------------|----------------|
| **Modernize** | Update tech debt, deprecated deps | modernization-assessment | modernization-planner |
| **Rewrite** | Replace components entirely | rewrite-assessment | rewrite-planner |
| **Cloud-Native** | Move to containers/serverless | cloud-native-assessment | cloud-native-planner |
| **Extend** | Add new features | — | extension-planner |
| **Security** | Address vulnerabilities | security-assessment | security-planner |
| **Performance** | Fix bottlenecks | performance-assessment | — |

Multiple paths can be selected simultaneously.

## Phase A: Assess

Each selected path runs its assessment skill with adaptive depth:

- **Level 1 (Surface)**: Quick scan, 5-15 minutes
- **Level 2 (Moderate)**: Code complexity, anti-patterns, 15-45 minutes
- **Level 3 (Deep)**: Architectural debt, scalability limits, 45-90 minutes

Assessment generates findings and Architecture Decision Records (ADRs).

## Phase P: Plan

Each path planner generates increments in the standard format, ready for Phase 2.

## Phase 2: Delivery

Same as greenfield: Tests → Contracts → Implementation → Deploy & Verify. All paths—modernization, rewrites, extensions, bug fixes—are just increments in the same pipeline.

---

## Brownfield Advantages

- **Preserve existing investment** — Keep working features, rewrite only what matters
- **Continuous value delivery** — Deploy after each increment, not at the end
- **Risk mitigation** — Assessments identify and prioritize debt
- **Parallel paths** — Modernize tech while extending features
- **Spec-driven** — Capture institutional knowledge in specifications
