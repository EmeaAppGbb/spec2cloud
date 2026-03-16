# Workflows

## Greenfield Workflow (New Applications)

### Phase 0: Shell Setup
Select a shell template for your tech stack. The shell provides project scaffolding, test frameworks, and infrastructure templates.

Available shells: Next.js + TypeScript, .NET, Agentic .NET, Agentic Python

### Phase 1: Product Discovery

| Sub-phase | Skill | What Happens |
|-----------|-------|-------------|
| 1a: Spec Refinement | spec-refinement | PRD/FRDs reviewed through product + technical lenses (max 5 passes). Human gate. |
| 1b: UI/UX Design | ui-ux-design | Interactive HTML wireframe prototypes generated. Human gate. |
| 1c: Increment Planning | orchestrator | FRDs broken into ordered increments. Walking skeleton first. Human gate. |
| 1d: Tech Stack Resolution | tech-stack-resolution | Every technology researched and resolved. ADRs generated. Human gate. |

### Phase 2: Increment Delivery (repeats per increment)

| Step | Skill(s) | What Happens |
|------|----------|-------------|
| 1: Tests | e2e-generation, gherkin-generation, test-generation | Playwright + Cucumber + unit tests scaffolded. Red baseline verified. |
| 2: Contracts | contract-generation | API specs, shared types, infra requirements generated. |
| 3: Implementation | implementation | Code written to make tests pass. API → Web → Integration slices. Human gate (PR review). |
| 4: Verify & Ship | azure-deployment | Full regression, azd provision, azd deploy, smoke tests. Human gate. |

After each increment, main is fully working — all tests pass, Azure deployment is live.

## Brownfield Workflow (Existing Applications)

### Phase B1: Extract (Pure Facts)

6 extraction skills scan the codebase and produce factual documentation with zero judgment:

| Skill | Output |
|-------|--------|
| codebase-scanner | specs/docs/technology/stack.md |
| dependency-inventory | specs/docs/technology/dependencies.md |
| architecture-mapper | specs/docs/architecture/overview.md, components.md |
| api-extractor | specs/contracts/ (OpenAPI YAML) |
| data-model-extractor | specs/docs/architecture/data-models.md |
| test-discovery | specs/docs/testing/coverage.md |

Human gate: Review extraction accuracy.

### Phase B2: Spec-Enable

| Skill | Output |
|-------|--------|
| prd-generator | specs/prd.md (product vision, personas, features from code) |
| frd-generator | specs/frd-{feature}.md (standard format + Current Implementation section) |

Human gate: Review and approve generated specs.

### User Choice Point

After extraction and spec generation, you choose your path(s):

| Path | Assessment Skill | Planning Skill | Purpose |
|------|-----------------|----------------|---------|
| Modernize | modernization-assessment | modernization-planner | Upgrade deps, refactor architecture |
| Rewrite | rewrite-assessment | rewrite-planner | Rewrite in different language/framework |
| Cloud-Native | cloud-native-assessment | cloud-native-planner | Containerize, add observability, deploy to Azure |
| Extend | (none needed) | extension-planner | Add new features |
| Fix Bugs | (none needed) | (uses bug-fix skill) | Test-first bug fixes |
| Security | security-assessment | security-planner | Audit and fix vulnerabilities |
| Performance | performance-assessment | (modernization-planner) | Identify and resolve bottlenecks |

Select one or more paths. Each generates targeted assessments and ADRs.

### Phase A: Assess (Per Selected Path)

Each assessment skill uses adaptive depth — starts surface-level, escalates based on findings. Significant decisions produce ADRs in specs/adrs/.

Human gate: Review assessments and ADRs.

### Phase P: Plan (Per Selected Path)

Each planner generates increments in the standard format. All feed into Phase 2.

Human gate: Approve plan.

### Phase 2: Increment Delivery

Same pipeline as greenfield. Modernization tasks, rewrites, extensions, and bug fixes are all just increments.

## Bug Fix Workflow

Lightweight entry point via the bug-fix skill:
1. Link bug to relevant FRD
2. Generate failing test
3. Fix code (minimal change)
4. Run regression
5. Commit: [bugfix] {frd-id}: {description}

## ADR Workflow

ADRs are generated throughout both flows:
- Greenfield: technology choices, contract decisions
- Brownfield: path decisions, migration approaches
- Format: specs/adrs/adr-NNN-{slug}.md
- Status lifecycle: proposed → accepted → deprecated/superseded

## Human Gates

The orchestrator pauses for approval at:
- Phase boundaries (spec review, UI/UX approval, plan approval)
- After Gherkin generation (test contract review)
- After implementation (PR review)
- After deployment (verification)
- After extraction (brownfield accuracy review)
- Path selection (brownfield choice point)
- After assessment (brownfield finding review)

## Resume

All state is persisted in .spec2cloud/state.json. If interrupted:
1. Next session reads state.json
2. Re-validates by running relevant tests
3. Resumes from exact position
4. Continues the Ralph Loop

Back to [docs index](index.md).
