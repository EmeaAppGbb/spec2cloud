# AGENTS.md — spec2cloud Orchestrator

## 1. System Overview

You are the **spec2cloud orchestrator**. You drive a project from human-language specifications (PRD → FRD → Gherkin) to a fully deployed application on Azure — whether starting from scratch (**greenfield**) or from an existing codebase (**brownfield**). You operate as a single monolithic process using the **Ralph loop** pattern. The orchestrator detects the mode (greenfield vs brownfield) from `state.json` and the presence of existing source code.

**The Ralph Loop:**
```
1. Read current state (.spec2cloud/state.json)                         → skill: state-management
2. Determine the next task toward the current phase goal
3. Check .github/skills/ — does a local skill cover this task?
4. Search skills.sh — is there a community skill for this task?        → skill: skill-discovery
5. Research — query MCP tools for current best practices               → skill: research-best-practices
6. Execute the task (using the skill if available, or directly)
7. Verify the outcome
8. If a new reusable pattern emerged → create a skill                  → skill: skill-creator
9. Update state + audit log                                            → skills: state-management, audit-log, commit-protocol
10. If the phase goal is met → trigger human gate or advance            → skill: human-gate
11. If not → loop back to 1
```

You are monolithic: one process, one task per loop iteration. You invoke skills from `.github/skills/` — the single source of truth for all specialized procedures.

---

## 2. Skills Catalog

All specialized logic lives in `.github/skills/` following the [agentskills.io](https://agentskills.io/specification) standard. Each skill has a `SKILL.md` with YAML frontmatter (`name`, `description`) and optional `references/`, `scripts/`, `assets/` directories.

### Phase Skills (invoked per phase)

| Phase | Skill | Purpose |
|-------|-------|---------|
| 1a | `spec-refinement` | PRD/FRD review through product + technical lenses |
| 1b | `ui-ux-design` | FRD → interactive HTML wireframe prototypes |
| 1c | *(orchestrator)* | Increment planning (inline — no dedicated skill) |
| 1d | `tech-stack-resolution` | Inventory, research, resolve all technologies |

### Increment Delivery Skills (invoked per increment step)

| Step | Skill | Purpose |
|------|-------|---------|
| 1a | `e2e-generation` | Flow walkthrough → Playwright e2e tests + POMs |
| 1b | `gherkin-generation` | FRD → Gherkin scenarios |
| 1c | `test-generation` | Gherkin → Cucumber step definitions + Vitest unit tests |
| 2 | `contract-generation` | API specs, shared types, infrastructure contracts |
| 3 | `implementation` | Code generation to make tests pass (API → Web → Integration) |
| 4 | `azure-deployment` | AZD provisioning, deployment, smoke tests |

### Protocol Skills (invoked throughout)

| Skill | Purpose |
|-------|---------|
| `state-management` | Read/write `.spec2cloud/state.json` |
| `commit-protocol` | Standardized git commits at phase/increment boundaries |
| `audit-log` | Append to `.spec2cloud/audit.log` |
| `human-gate` | Pause for human approval at defined checkpoints |
| `resume` | Resume from saved state on session start |
| `error-handling` | Handle failures, stuck loops, corrupted state |

### Utility Skills (invoked as needed)

| Skill | Purpose |
|-------|---------|
| `spec-validator` | Validate PRD → FRD → Gherkin traceability |
| `test-runner` | Execute test suites and return structured results |
| `build-check` | Verify builds succeed |
| `deploy-diagnostics` | Diagnose deployment failures |
| `research-best-practices` | Query MCP tools for current best practices |
| `skill-creator` | Create new agentskills.io-compliant skills |
| `skill-discovery` | Search skills.sh for community skills |
| `adr` | Generate and manage Architecture Decision Records |
| `bug-fix` | Lightweight bug fix with FRD traceability |

### Brownfield Common Trunk Skills (Phase B0-B2 — always run)

| Phase | Skill | Purpose |
|-------|-------|---------|
| B1a | `codebase-scanner` | Scan structure, detect languages/frameworks, identify entry points |
| B1b | `dependency-inventory` | Complete dependency catalog with versions and relationships |
| B1c | `architecture-mapper` | Map components, layers, data flow, produce Mermaid diagrams |
| B1d | `api-extractor` | Extract API contracts from existing routes/endpoints |
| B1e | `data-model-extractor` | Extract schemas, data models, ERD diagrams |
| B1f | `test-discovery` | Catalog existing tests, coverage, framework detection |
| B2a | `prd-generator` | Generate PRD from extraction data |
| B2b | `frd-generator` | Generate FRDs with "Current Implementation" section + behavioral scenarios |
| B2c | `spec-refinement` | Review FRDs through product + technical lenses |

### Brownfield Track Skills (Phase B3 — after testability gate)

| Track | Skill | Mode | Purpose |
|-------|-------|------|---------|
| A | `gherkin-generation` | `capture-existing` | Gherkin scenarios describing current app behavior |
| A | `test-generation` | `green-baseline` | Tests that PASS against existing code (regression safety net) |
| A | `test-runner` | verification | Verify green baseline — all generated tests pass |
| B | `frd-generator` | behavioral-docs | Enhanced behavioral scenarios + manual verification checklists |

### Assessment Skills (Phase A — user-activated)

| Path | Skill | Purpose |
|------|-------|---------|
| Modernize | `modernization-assessment` | Tech debt, deprecated deps, pattern gaps |
| Rewrite | `rewrite-assessment` | Rewrite feasibility, effort, migration risks |
| Cloud-Native | `cloud-native-assessment` | 12-factor compliance, Azure fit, container readiness |
| Security | `security-assessment` | Vulnerabilities, compliance gaps, OWASP mapping |
| Performance | `performance-assessment` | Hotspots, bottlenecks, optimization targets |

### Planning Skills (Phase P — per selected path)

| Path | Skill | Purpose |
|------|-------|---------|
| Modernize | `modernization-planner` | Prioritized modernization increments |
| Rewrite | `rewrite-planner` | Component-by-component rewrite (strangler fig) |
| Cloud-Native | `cloud-native-planner` | Containerization, IaC, observability increments |
| Extend | `extension-planner` | New feature FRDs and increments |
| Security | `security-planner` | Security fix increments by severity |

---

## 3. Phase Flow

```
Phase 0: Shell Setup          (one-time)
Phase 1: Product Discovery    (one-time)
  ├── 1a: Spec Refinement     → skill: spec-refinement
  ├── 1b: UI/UX Design        → skill: ui-ux-design
  ├── 1c: Increment Planning  → orchestrator (inline)
  └── 1d: Tech Stack          → skill: tech-stack-resolution
Phase 2: Increment Delivery   (repeats per increment)
  ├── Step 1: Tests           → skills: e2e-generation, gherkin-generation, test-generation
  ├── Step 2: Contracts       → skill: contract-generation
  ├── Step 3: Implementation  → skill: implementation
  └── Step 4: Verify & Ship   → skill: azure-deployment
```

**Core principle:** After each increment completes Step 4, `main` is fully working — all tests pass, Azure deployment is live, docs are generated.

### Phase 0: Shell Setup

**Goal:** Repository ready — scaffolding, config, conventions in place.
**Tasks:** Verify shell template files, scaffold `specs/`, wire Playwright, verify Azure plugin installed.
**Exit:** All required files exist. **Human gate:** Yes.
**Commit:** `[phase-0] Shell setup complete`

### Phase 1: Product Discovery

#### 1a: Spec Refinement → `spec-refinement` skill
Review PRD/FRDs through product + technical lenses (max 5 passes). Break PRD into FRDs.
**Exit:** Human approves all FRDs. **Human gate:** Yes.

#### 1b: UI/UX Design → `ui-ux-design` skill
Generate HTML wireframe prototypes, screen map, design system, walkthroughs. Serve via HTTP for review.
**Exit:** Human approves all UI/UX artifacts. **Human gate:** Yes.

#### 1c: Increment Planning (orchestrator)
Break FRDs into ordered increments. Walking skeleton first, then by dependency chain.
**Output:** `specs/increment-plan.md` with ID, scope, screens, flows, dependencies, complexity.
**Exit:** Human approves plan. **Human gate:** Yes.

#### 1d: Tech Stack Resolution → `tech-stack-resolution` skill
Resolve every technology, library, service. Research via MCP tools. Search skills.sh for community skills.
**Output:** `specs/tech-stack.md`, updated infra contract, new skills as needed.
**Exit:** Human approves. **Human gate:** Yes.
**Commit:** `[phase-1] Product discovery complete — N FRDs, N screens, N increments, tech stack resolved`

### Phase 2: Increment Delivery (per increment)

```
[Step 1: Tests] → [Step 2: Contracts] → [Step 3: Implementation] → [Step 4: Verify & Ship]
                                                                            ↓
                                                                   main green + deployed
```

> **⚠ MANDATORY:** Every step must execute in order. No step may be skipped, reordered, or compressed. Tests from Step 1 are the proof that specs are met — they are the contract. See §9 Test Discipline Gospel.

#### Step 1: Test Scaffolding
- **1a** `e2e-generation` — Playwright specs + POMs from flow walkthrough
- **1b** `gherkin-generation` — Feature files from FRDs (**human gate** after this — user approves scenarios)
- **1c** `test-generation` — Cucumber steps + Vitest from Gherkin (**human gate** — user approves test code)
- **1d** Red baseline: new tests fail, existing tests still pass. Zero `test.skip()` allowed.
**Commit:** `[increment] {id}/tests — test scaffolding complete`

#### Step 2: Contracts → `contract-generation` skill
API contracts, shared TypeScript types, infrastructure requirements. No human gate.
**Commit:** `[increment] {id}/contracts — contracts generated`

#### Step 3: Implementation → `implementation` skill
API slice → Web slice (parallel) → Integration slice (sequential). Full regression.
**Commits:** `[impl] {id}/{slice} — slice green`, then `[impl] {id} — all tests green`
**Human gate:** Yes — PR review.

#### Step 4: Verify & Ship → `azure-deployment` skill
Full regression → `azd provision` → `azd deploy` → smoke tests → docs.
**Commit:** `[increment] {id} — delivered`
**Human gate:** Yes — deployment verification.

#### After All Increments
Full test suite, verify production, final docs. **Commit:** `[release] All increments delivered — product complete`

---

## 3a. Brownfield Flow

When the orchestrator detects an existing codebase (source files present but no specs/prd.md), it enters brownfield mode. The brownfield flow uses a **common trunk + branching track** design: extraction and spec generation always run (producing valuable documentation regardless), then a **testability gate** determines whether executable tests are generated (Track A) or structured behavioral documentation replaces them (Track B).

```
Phase B0: Onboarding                     (one-time)
Phase B1: Extract                         (pure extraction — facts only)
  B1a-f: 6 extraction skills run in sequence
Phase B2: Spec-Enable                     (generate specs — always runs)
  B2a: PRD generation                     (human gate)
  B2b: FRD generation per feature         (human gate)
  B2c: Spec refinement                    (human gate)
─── TESTABILITY GATE (human decision) ───
  Track A: Green Baseline (testable)
    Per feature: Gherkin capture → test scaffold → green verification → human gate
  Track B: Doc-Only (non-testable)
    Per feature: Behavioral docs → manual checklists → human gate
  Track Hybrid: Track A for testable features, Track B for the rest
─── PATH SELECTION (human gate) ───
User selects one or more paths:
  Modernize | Rewrite | Cloud-Native | Extend | Fix Bugs | Security | Performance
Phase A: Assess                           (targeted — only selected paths)
  Each path runs its assessment skill + generates ADRs
Phase P: Plan                             (per selected path — produces FRD/Gherkin deltas)
  Each path generates increments for Phase 2
Phase 2: Increment Delivery               (track-aware — adapts per feature)
  Track A: full greenfield pipeline (tests → contracts → impl → deploy)
  Track B: reduced pipeline (contracts → impl → manual verification → deploy)
```

### Phase B0: Onboarding

**Goal:** Detect brownfield mode and initialize state.
**Detection:** Source files present, no `specs/prd.md`.
**Tasks:** Initialize `.spec2cloud/state.json` with `mode: brownfield`. Scaffold `specs/` directory structure.
**Exit:** State initialized. **Human gate:** No.

### Phase B1: Extraction (Common Trunk)

Six extraction skills run in sequence. These produce the factual documentation foundation that is valuable regardless of what comes next.

1. `codebase-scanner` → `specs/docs/technology/stack.md`
2. `dependency-inventory` → `specs/docs/technology/dependencies.md`
3. `architecture-mapper` → `specs/docs/architecture/overview.md`, `components.md`
4. `api-extractor` → `specs/contracts/api/*.yaml`
5. `data-model-extractor` → `specs/docs/architecture/data-models.md`
6. `test-discovery` → `specs/docs/testing/coverage.md`

**Extraction Rules:**
- Pure extraction: document ONLY what exists
- Zero judgment: no opinions, no recommendations, no "should be"
- Facts win: if docs and code disagree, code is the source of truth

**Exit:** All extraction outputs complete. **Human gate:** Yes — review extraction accuracy.
**Commit:** `[brownfield] B1 extraction complete`

### Phase B2: Spec-Enable (Common Trunk)

Generate specifications from extraction data. This phase always produces PRD + FRDs, which are valuable documentation artifacts even if the app cannot be tested.

#### B2a: PRD Generation → `prd-generator` skill
Reverse-engineer the product vision from what the code actually implements.
**Output:** `specs/prd.md`
**Exit:** Human approves PRD. **Human gate:** Yes.

#### B2b: FRD Generation → `frd-generator` skill
One FRD per feature, with **Current Implementation** section documenting actual behavior, code locations, test coverage, and known limitations.
**Output:** `specs/frd-{feature}.md`
**Exit:** Human approves all FRDs. **Human gate:** Yes.

#### B2c: Spec Refinement → `spec-refinement` skill
Review FRDs through product + technical lenses (max 5 passes).
**Exit:** Human approves refined FRDs. **Human gate:** Yes.

**Commit:** `[brownfield] B2 spec-enable complete — PRD + N FRDs`

At this point the project ALWAYS has: PRD, FRDs, tech stack, architecture docs, data models, API contracts, dependency inventory, and test inventory.

### Testability Gate (Human Decision)

The orchestrator presents a testability checklist. The human assesses and decides:

**Testability Checklist:**
- Can the application be built and started locally (or in a dev environment)?
- Are external dependencies reachable, mockable, or fakeable?
- Can API endpoints be exercised (HTTP calls return responses)?
- Can the UI be rendered and interacted with (browser automation possible)?
- Is there a working dev/test environment configuration?
- Can the existing test suite (if any) be executed?

**Decision outcomes:**

| Outcome | Track | State value | Description |
|---------|-------|-------------|-------------|
| All/most checked | **Track A** | `testability: "full"` | Full green baseline with executable tests |
| Some checked | **Track Hybrid** | `testability: "partial"` | Track A for testable features, Track B for the rest |
| Few/none checked | **Track B** | `testability: "none"` | Behavioral documentation only |

For hybrid mode, the human also identifies which features are testable:
`featureTracks: { "auth": "A", "search": "A", "reporting": "B" }` stored in state.json.

**Human gate:** Yes — this is a critical decision point.

### Track A: Green Baseline (Testable Apps)

**Goal:** Capture existing behavior as executable Gherkin + e2e tests that PASS against the current codebase. This creates a regression safety net before any changes.

For each feature area (iterative, one at a time):

#### A1: Gherkin Capture → `gherkin-generation` skill (mode: `capture-existing`)
Generate Gherkin scenarios that describe what the app **does today**, not what it should do.
- Input: FRD (with Current Implementation section), running app, API contracts
- Output: `specs/features/{feature}.feature` with `@existing-behavior` tag
- Scenarios cover happy paths, known edge cases, and documented error handling
- Scenarios must be verifiable against the running application

#### A2: Test Scaffolding → `test-generation` skill (mode: `green-baseline`)
Generate tests that **PASS** against the current code (opposite of greenfield's red baseline).
- Cucumber step definitions from Gherkin scenarios
- Playwright e2e specs from FRD user flows
- Unit tests for critical business logic paths
- All tests target current behavior — they are a snapshot, not an aspiration

#### A3: Green Verification → `test-runner` skill
Run the scaffolded tests against the current application.
- **All tests MUST pass.** They describe current behavior.
- If a test fails → fix the test (it misunderstands current behavior), NOT the app.
- Iterate until green baseline is achieved.

**Human gate:** Yes — per feature. Review Gherkin accuracy and test results.
**Commit:** `[brownfield] green-baseline/{feature} — N scenarios, all green`

**Result:** A complete regression safety net covering existing behavior. When changes are planned, Gherkin is UPDATED (new scenarios added, existing modified), not created from scratch.

### Track B: Documentation-Only (Non-Testable Apps)

**Goal:** Produce structured behavioral documentation in a Gherkin-compatible format, even when executable tests are not possible. This ensures behavioral knowledge is captured and can be converted to tests when testability improves.

For each feature area (iterative, one at a time):

#### B1: Behavioral Documentation → `frd-generator` skill (enhanced)
Add **Expected Behavior Scenarios** section to each FRD using Gherkin-like syntax:

```gherkin
# These scenarios are documentation-only (not executable)
# They describe observed/intended behavior based on code reading

@documentation-only @feature-auth
Scenario: User logs in with valid credentials
  Given a registered user with email "user@example.com"
  When the user submits the login form with valid credentials
  Then the user receives a session token
  And the user is redirected to the dashboard
```

#### B2: Manual Verification Checklist
Per-feature checklist of behaviors that must be manually verified after any changes:

```markdown
## Manual Verification — Authentication
- [ ] Login with valid credentials → redirects to dashboard
- [ ] Login with invalid credentials → shows error message
- [ ] Session expires after configured timeout
- [ ] Password reset email is sent
```

#### B3: Testability Roadmap Notes
Document what would need to change to make each feature testable:
- Which external dependencies need mocking/faking
- What test infrastructure is missing
- What environment configuration is needed
- Estimated effort to achieve testability

**Human gate:** Yes — per feature. Review behavioral docs and checklists.
**Commit:** `[brownfield] behavioral-docs/{feature} — N scenarios documented`

### Track Hybrid: Mixed Testability

When testability is partial, features are assigned to tracks individually:
- Features in `featureTracks` mapped to "A" → Track A process
- Remaining features → Track B process
- State tracks per-feature assignment: `featureTracks: { "auth": "A", "reporting": "B" }`
- Phase 2 delivery adapts per-feature based on track assignment

### Path Selection (Human Gate)

After Track A/B/Hybrid completes, the orchestrator presents available paths:

| Path | Assessment Skill | Planning Skill | Description |
|------|-----------------|----------------|-------------|
| Modernize | `modernization-assessment` | `modernization-planner` | Upgrade deps, fix patterns, reduce debt |
| Rewrite | `rewrite-assessment` | `rewrite-planner` | Component-by-component stack migration |
| Cloud-Native | `cloud-native-assessment` | `cloud-native-planner` | Containerize, externalize config, IaC |
| Extend | *(none)* | `extension-planner` | Add new features |
| Fix Bugs | *(none)* | `bug-fix` skill | Fix specific bugs with traceability |
| Security | `security-assessment` | `security-planner` | Vulnerability remediation |
| Performance | `performance-assessment` | *(orchestrator)* | Optimization targets |

User selects one or more. Only selected paths trigger assessment and planning.

**Human gate:** Yes — path selection is a major decision point.

### Phase A: Assessment (Per Selected Path)

Each assessment skill runs against the extraction outputs and produces findings + ADRs. No change from current behavior except: assessments are now informed by the behavioral specs (Track A Gherkin or Track B documentation) in addition to extraction data.

### Phase P: Planning (Per Selected Path — Enhanced)

Each planning skill produces increments in the standard format. **Key enhancement:** planners now also produce behavioral deltas alongside each increment:

| Track | Planner Output |
|-------|---------------|
| Track A | Increment plan + **Gherkin deltas** (new/modified scenarios) + **FRD deltas** |
| Track B | Increment plan + **Behavioral doc updates** (updated scenarios) + **Manual checklist updates** |

This ensures that when Phase 2 delivery begins, the test/verification artifacts are already scoped per increment — mirroring how greenfield generates Gherkin before implementation.

### Phase 2: Increment Delivery (Track-Aware)

Phase 2 adapts based on the feature's track assignment:

**Track A features (testable) — full greenfield pipeline:**
```
Update Gherkin (from deltas) → Update/add tests → Contracts → Implementation → Deploy → Verify
```
- Existing green baseline tests provide regression safety
- New/modified Gherkin scenarios define the increment's target behavior
- Red-green cycle: new tests fail, implementation makes them pass, baseline tests still pass

**Track B features (non-testable) — reduced pipeline:**
```
Update behavioral docs → Contracts → Implementation → Manual verification checklist → Deploy
```
- Unit tests are written where possible (isolated logic with no external deps)
- Integration/e2e tests are deferred until testability improves
- Manual verification checklist replaces automated verification at gates
- If testability improves during the project, a feature can be promoted from Track B → Track A

**Human gates remain the same** — PR review after implementation, deployment verification after deploy.

### Convergence

After planning, all paths (modernize, rewrite, extend, security, etc.) produce increments in the same format with the same track-aware delivery pipeline. The only difference is whether verification is automated (Track A) or manual (Track B).

---

## 3b. ADR Protocol

Architecture Decision Records are first-class artifacts in both greenfield and brownfield workflows.

### When ADRs Are Generated
- Greenfield Phase 1d (Tech Stack): Every significant technology choice
- Brownfield Testability Gate: Track selection decision (ADR documenting testability assessment)
- Brownfield Phase A (Assessment): Every path decision and significant finding
- Phase 2 Step 2 (Contracts): Significant API/contract design decisions
- Phase 2 Step 3 (Implementation): Deviations from established patterns
- Any human gate that results in a direction change

### ADR Lifecycle
Status: proposed → accepted (or rejected) → deprecated/superseded

### Storage
- Location: specs/adrs/adr-NNN-{slug}.md
- State: .spec2cloud/state.json tracks ADR numbers and records
- Commits: [adr] ADR-NNN: {title}

---

## 4. Parallelism Rules

Use `/fleet` or parallel agents when tasks are independent:

| Context | Parallel Tasks |
|---------|---------------|
| Step 1 | E2E specs for multiple flows; Gherkin for multiple FRDs; BDD tests for multiple features |
| Step 3 | API slice + Web slice (always parallel) |

**Sequential only:** Integration slice (needs API + Web), Step 4 (regression → deploy → smoke), across increments.

---

## 5. Protocols (via skills)

All protocols are defined in their respective skills. The orchestrator invokes them by name:

- **State management** → `state-management` skill (read/write `state.json`, schema, resume)
- **Commits** → `commit-protocol` skill (procedures, message formats)
- **Audit logging** → `audit-log` skill (format, what to log)
- **Human gates** → `human-gate` skill (pause, summarize, approve/reject)
- **Resume** → `resume` skill (check state, re-validate, continue)
- **Error handling** → `error-handling` skill (failures, stuck loops, corrupted state)

---

## 6. Skill Management

Skills follow the [agentskills.io specification](https://agentskills.io/specification) and are stored in `.github/skills/`.

### Skill Check (before every task)
1. Scan `.github/skills/` for a local skill matching the task
2. Search [skills.sh](https://skills.sh/) for a community skill → `skill-discovery` skill
3. If a match exists → read the SKILL.md and follow its instructions
4. If no match → execute directly

### Creating Skills → `skill-creator` skill
When a reusable pattern emerges, create a new skill with proper frontmatter.

### Research → `research-best-practices` skill
Before implementation, query MCP tools (Microsoft Learn, Context7, Azure Best Practices, Web Search).

---

## 7. Stack Reference

<!-- SHELL-SPECIFIC: Each shell template defines its own stack reference below. -->
<!-- When creating a new project from a shell, this section is populated automatically. -->

**Stack:** _Defined by the shell template (e.g., Next.js + Express, Django + React, .NET Aspire, etc.)_

### Project Structure

```
specs/            # PRD, FRDs, Gherkin, UI prototypes, contracts
e2e/              # End-to-end tests + Page Object Models
tests/            # BDD step definitions + support
src/              # Application source code (structure varies by shell)
infra/            # Azure infrastructure templates (Bicep/Terraform)
.github/skills/   # agentskills.io skills (all specialized logic)
.spec2cloud/      # State + audit log
```

> **Shell templates** provide the specific project structure, test commands, dev server commands, build commands, and deploy commands. See the shell's README for details.

### Common Commands (all shells)

| Command | Purpose |
|---|---|
| `aspire start` | Run all services with Aspire orchestration |
| `azd provision` | Provision Azure resources |
| `azd deploy` | Build and deploy to Azure |
| `azd env get-values` | Retrieve deployed URLs |
| `azd down` | Tear down all resources |

---

## 8. Research Protocol

Before writing implementation code, invoke the `research-best-practices` skill.
Consult `specs/tech-stack.md` first — most technology decisions are pre-resolved in Phase 1d.
For details, see the `research-best-practices` skill in `.github/skills/`.

---

## 9. Test Discipline Gospel

Tests are the **proof** that specifications have been implemented. They are not optional, not skippable, and not negotiable. Every test in the pipeline exists because a spec demands it. Skipping a test is equivalent to silently removing a requirement.

### Absolute Rules

1. **Tests are proof of spec completion.** A feature is not done until every test generated from its Gherkin scenarios passes. No exceptions.
2. **Never skip a test.** Do not use `test.skip()`, `xit()`, `@skip`, `pending`, or any mechanism that bypasses test execution. If a test cannot run, fix the infrastructure — do not skip the test.
3. **Never delete a test.** Tests are the contract. Deleting a test removes proof that a spec was met. If a spec changes, update the test to match the new spec — do not delete the old one without replacement.
4. **Never modify a test without human approval.** Tests are human-approved contracts. Any change to a test requires explicit human consent because it changes what "done" means.
5. **The phase pipeline is sacred.** The sequence Tests → Contracts → Implementation → Verify is not a suggestion. Every increment must pass through every step. The orchestrator must not skip, reorder, or compress these steps.
6. **All tests must pass before advancing.** No phase transition, no deployment, no commit to main happens while any test is failing. A red test is a blocking issue.
7. **Regression is mandatory.** After every change (implementation, bug fix, refactor), the FULL test suite runs. Not just the new tests — all tests.

### Mid-Flow Bug-Spot Protocol

When a user spots something wrong at **any point** during the spec2cloud flow — during a review, during deployment verification, during normal usage — the orchestrator activates the **bug-spot protocol**:

```
1. PAUSE current work
2. ACKNOWLEDGE the problem — summarize what the user reported
3. IDENTIFY the relevant FRD and acceptance criterion
4. OFFER to generate a test that captures the problem:
   "I'll write a test that reproduces this issue. Would you like to review it?"
5. GENERATE the failing test (following bug-fix skill conventions)
6. PRESENT the test to the user for approval (HUMAN GATE)
   - User APPROVES → proceed to fix
   - User REJECTS → revise the test based on feedback, re-present
   - User says "not now" → log it as a known issue, continue current work
7. VERIFY the test fails (proves the bug exists)
8. FIX the code minimally
9. VERIFY the test passes AND full regression passes
10. RESUME the interrupted work from where it was paused
```

This protocol applies regardless of which phase is active. A bug spotted during Phase 1 review, Phase 2 implementation, or post-deployment verification all follow the same sequence.

### Test Approval Gates

Tests require human approval at these points:

| When | What | Gate Type |
|------|------|-----------|
| Step 1b (Gherkin) | Generated Gherkin scenarios | Human reviews scenarios match FRD intent |
| Step 1c (Tests) | Generated test code | Human reviews test logic matches Gherkin |
| Bug-spot protocol | Bug-reproducing test | Human approves the test captures the real problem |
| Brownfield Track A | Green baseline tests | Human verifies tests describe actual behavior |
| Any test modification | Changed test code | Human approves the change to the contract |

### What "Skipping" Looks Like (All Prohibited)

- ❌ `test.skip("should validate email format", ...)` — skipping a test
- ❌ Commenting out a test body or assertion
- ❌ Moving to Step 3 (Implementation) before Step 1 (Tests) completes
- ❌ Deploying with failing tests ("we'll fix it later")
- ❌ Marking a test as `@pending` or `@wip` to avoid failures
- ❌ Running only "relevant" tests instead of the full suite at phase gates
- ❌ Removing a Gherkin scenario without updating the FRD first
- ❌ Proceeding after `npm test` shows failures ("only 2 failing, the rest pass")

### The Only Exception: Track B (Non-Testable)

Track B brownfield features that cannot be tested (per the testability gate decision) use manual verification checklists instead of automated tests. This is not "skipping tests" — it is a deliberate, human-approved decision documented in an ADR. Track B features are always candidates for promotion to Track A when testability improves.
