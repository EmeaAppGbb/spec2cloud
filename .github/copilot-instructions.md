# Copilot Instructions

## Project Overview
This project uses the **spec2cloud** framework — a spec-driven development process
where specifications (PRD → FRD → Gherkin) are the source of truth, and implementation
is driven by automated tests generated from those specifications.

## Framework
- Orchestration: See `AGENTS.md` for the master orchestrator instructions
- Skills: See `.github/skills/*/SKILL.md` ([agentskills.io](https://agentskills.io/specification) standard)
- Ecosystem: Search [skills.sh](https://skills.sh/) for community skills via `npx skills find [query]`
- State: See `.spec2cloud/state.json` for current project state
- Audit: See `.spec2cloud/audit.log` for execution history

## Coding Conventions
- Write minimal code to pass tests — no gold-plating
- Follow existing patterns in the codebase
- All code must be covered by tests (unit, integration, or e2e). **Exception:** Brownfield Track B features use manual verification checklists when automated tests are not feasible (see AGENTS.md Testability Gate).
- No hardcoded secrets — use environment variables
- No hardcoded URLs — use configuration
- Error handling: every external call must have error handling
- Logging: use structured logging (not console.log/print)
- Comments: only when code intent is non-obvious

## Spec-Driven Development Rules
- **Never implement features not in the specs** (specs/frd-*.md)
- **Never modify tests** without human approval — tests are the contract
- **Never skip tests** — no `test.skip()`, no `xit()`, no `@pending`, no commenting out. Tests are proof that specs are met.
- **Always check Gherkin scenarios** before implementing a feature
- **Always run tests** after making changes — the FULL suite, not just "relevant" tests
- If a spec seems wrong, flag it — do not silently deviate

## Test Discipline Gospel
Tests are the **proof** that specifications have been implemented correctly. They are not optional, not skippable, and not negotiable. See AGENTS.md §9 for the full protocol.

Key rules:
- **Tests = proof of spec completion.** A feature without passing tests is not done.
- **Phase order is sacred.** Tests → Contracts → Implementation → Verify. Never skip or reorder.
- **All tests must pass before advancing.** No deployment, no commit to main while any test fails.
- **Regression is mandatory.** After every change, run ALL tests — not just new ones.

### When the User Spots a Problem
At any point during the flow, if the user identifies something wrong:
1. **Pause** current work
2. **Offer** to generate a test that captures the problem
3. **Present** the test for user approval (mandatory human gate)
4. **Fix** minimally after approval
5. **Verify** the test passes and full regression is green
6. **Resume** the interrupted work

This is the **bug-spot protocol** — it applies in every phase. The user's approval of the test is mandatory because the test defines what "fixed" means.

## File Organization
```
specs/          → Specifications (PRD, FRDs, Gherkin)
specs/contracts/→ Contracts (API specs per feature, infrastructure resources)
specs/ui/       → UI/UX design artifacts (screen-map, design-system, component-inventory, prototypes/, walkthroughs)
specs/features/ → Gherkin feature files (greenfield + brownfield Track A)
specs/adrs/     → Architecture Decision Records
specs/docs/     → Brownfield extraction outputs (technology/, architecture/, testing/)
specs/assessment/ → Assessment outputs (modernization, security, cloud-native, etc.)
specs/increment-plan.md → Ordered increment delivery plan
specs/tech-stack.md → Resolved tech stack (all technology decisions, wiring, deployment)
e2e/            → Playwright end-to-end tests (integration slice)
tests/          → Cucumber.js BDD tests (integration slice)
src/shared/     → Contract types shared between API and Web
src/api/        → Express.js backend (API slice)
src/web/        → Next.js frontend (Web slice)
infra/          → Azure infrastructure (Bicep)
.spec2cloud/    → Framework state and config
```

## Git Conventions
- Commit messages: `[impl] {feature}/{slice} — slice green` (e.g., `[impl] user-auth/api — slice green`)
- Branch naming: `spec2cloud/{phase}/{feature}` (e.g., `spec2cloud/impl/user-auth`)
- Always commit `.spec2cloud/state.json` and `.spec2cloud/audit.log` with changes
- Never commit secrets, .env files, or node_modules

## Testing Hierarchy
1. **Unit tests** — API slice: fastest feedback, run on every backend change
2. **Component tests** — Web slice: build verification and component tests
3. **Playwright e2e** — Full user flow tests, run against Aspire environment
4. **Gherkin step definitions** — BDD behavioral tests, run against Aspire environment
5. **Smoke tests** — post-deployment verification (per increment)

> **All Cucumber and Playwright tests run against the Aspire environment** (`aspire start` + `aspire wait`), which orchestrates API and Web services identically to production.
> **Iterative delivery:** Each increment goes through the full test → implement → deploy cycle. After each increment, ALL tests pass and the app is deployed.

## Human Gates
The agent MUST pause and ask for human approval at these points:
- After FRD review (before UI/UX design)
- After UI/UX design (before increment planning)
- After increment plan approval (before tech stack resolution)
- After tech stack resolution (before first increment) — technology choices must be approved
- Per increment: after Gherkin generation (before BDD test scaffolding) — **user approves scenarios**
- Per increment: after test generation (before contracts) — **user approves test code**
- Per increment: after implementation (before deployment) — via PR review
- Per increment: after deployment (verify it works)
- **Bug-spot protocol: user must approve the bug-reproducing test before any fix proceeds**

## State Management
- Read `.spec2cloud/state.json` at the start of every session
- Update it after completing each task
- Append to `.spec2cloud/audit.log` after every action
- If state.json is missing, start from Phase 0

## Agentic Solutions & Workflows

When the project requires AI agents, agentic workflows, or human-in-the-loop AI features, use the following frameworks:

- **LangGraph** (backend — `src/api/`): Use LangGraph.js for building stateful, multi-step agent workflows. Define agents as graphs with nodes (tools, LLM calls, logic) and edges (conditional routing, cycles). Use checkpointing for persistence and human-in-the-loop patterns. Prefer `@langchain/langgraph` for orchestration and `@langchain/core` for primitives.
- **CopilotKit** (frontend — `src/web/`): Use CopilotKit for embedding AI copilot experiences in the Next.js frontend. Use `<CopilotKit>` provider, `useCopilotAction` for frontend actions, `useCopilotReadable` for context, and `CopilotSidebar`/`CopilotPopup` for UI. Connect to LangGraph backends via CopilotKit's `CoAgents` integration for full-stack agentic flows.

**When to use:**
- Any feature involving AI agents, chatbots, or multi-step AI workflows → LangGraph + CopilotKit
- Backend-only agent orchestration (no UI) → LangGraph alone
- Frontend copilot/assistant UX without custom agent logic → CopilotKit alone

**Conventions:**
- Agent graphs live in `src/api/src/agents/` — one file per agent graph
- CopilotKit actions live alongside their React components in `src/web/`
- Always define agent state as a TypeScript interface in `src/shared/types/`
- Use streaming for all agent responses — no blocking LLM calls in request handlers

## Brownfield Rules
- **Extraction is not assessment** — Phase B1 documents what exists. No opinions, no recommendations.
- **User chooses the path** — Never run assessment or planning without the user selecting which path(s) to pursue.
- **Testability is a human decision** — After B2 (Spec-Enable), the testability gate determines Track A (testable), Track B (doc-only), or Hybrid. Never assume testability.
- **Green baseline before changes** — Track A: capture existing behavior as passing tests before any modifications. Tests describe what IS, not what SHOULD BE.
- **Behavioral docs when untestable** — Track B: produce Gherkin-like documentation and manual verification checklists. Structured for future conversion to executable tests.
- **ADRs for all decisions** — Every significant technical decision (brownfield or greenfield) gets an ADR in specs/adrs/. The testability gate decision also gets an ADR.
- **Existing code is truth** — When docs, comments, and code disagree, code wins. Document reality, not intent.
- **Existing tests are sacred** — Never modify or delete existing tests. New tests are added alongside.
- **Incremental always** — Every change must leave the application in a working state. No big-bang transformations.
- **Track promotion** — Features can be promoted from Track B → Track A when testability improves. Never demote from A → B.

## Brownfield File Organization
```
specs/
  prd.md                    # Product Requirements (generated from code in brownfield)
  frd-{feature}.md          # Feature Requirements (with Current Implementation section)
  features/                 # Gherkin scenarios
    {feature}.feature       # Track A: @existing-behavior tagged scenarios
                            # Track B: none (behavioral docs in FRDs instead)
  adrs/                     # Architecture Decision Records
    adr-001-{slug}.md
    adr-002-{slug}.md
  assessment/               # Assessment outputs (per selected path)
    modernization.md
    security.md
    cloud-native.md
  docs/                     # Extraction outputs (factual documentation)
    technology/
      stack.md
      dependencies.md
    architecture/
      overview.md
      components.md
      data-models.md
    testing/
      coverage.md
  contracts/                # Extracted + generated API contracts
    api/
      {feature-id}.yaml
  increment-plan.md         # Unified increment plan (all paths)
```

## Bug Fix Protocol
- Bug fixes use the `bug-fix` skill — lightweight path through the pipeline
- Every bug fix MUST: link to an FRD, create a failing test, **get user approval on the test**, fix minimally, verify regression
- The user approves the test because it defines what "fixed" means — this gate is not optional
- Commit format: `[bugfix] {frd-id}: {description}`
- Tracked as micro-increments in state.json

## Shell-Specific Extensions
<!-- Shells should add stack-specific instructions below this line -->
<!-- Examples: language-specific conventions, framework patterns, test commands -->

<!-- Shell templates add stack-specific conventions below this line. -->
<!-- Examples: language-specific conventions, framework patterns, test commands, naming conventions. -->
<!-- When using a shell template, this section will be populated with the shell's coding standards. -->
