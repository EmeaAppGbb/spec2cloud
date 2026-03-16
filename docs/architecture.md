# Architecture

## Overview

spec2cloud uses a **skills-based architecture** built on the [agentskills.io](https://agentskills.io/specification) standard. A single monolithic orchestrator (the Ralph Loop) drives the process, invoking specialized skills for each task.

## The Ralph Loop

The orchestrator follows an 11-step loop:

1. Read current state (.spec2cloud/state.json)
2. Determine the next task toward the current phase goal
3. Check .github/skills/ for a local skill
4. Search skills.sh for a community skill
5. Research best practices via MCP tools
6. Execute the task
7. Verify the outcome
8. If a reusable pattern emerged, create a skill
9. Update state + audit log
10. If phase goal met, trigger human gate or advance
11. Loop back to 1

## Skills Catalog (43 skills)

### Greenfield Skills (22)

| Category | Skills |
|----------|--------|
| Phase | spec-refinement, ui-ux-design, tech-stack-resolution |
| Increment Delivery | e2e-generation, gherkin-generation, test-generation, contract-generation, implementation, azure-deployment |
| Protocol | state-management, commit-protocol, audit-log, human-gate, resume, error-handling |
| Utility | spec-validator, test-runner, build-check, deploy-diagnostics, research-best-practices, skill-creator, skill-discovery, find-skills |

### Brownfield Skills (20)

| Category | Skills |
|----------|--------|
| Extraction (B1) | codebase-scanner, dependency-inventory, architecture-mapper, api-extractor, data-model-extractor, test-discovery |
| Spec Generation (B2) | prd-generator, frd-generator |
| Assessment (A) | modernization-assessment, rewrite-assessment, cloud-native-assessment, security-assessment, performance-assessment |
| Planning (P) | modernization-planner, rewrite-planner, cloud-native-planner, extension-planner, security-planner |
| Cross-cutting | adr, bug-fix |

## State Management

State is persisted in .spec2cloud/ and committed after every action:

- **state.json** — Current position (phase, increment, status, active paths, ADRs)
- **audit.log** — Append-only history of every action
- **models.json** — AI model assignments per role
- **models-schema.json** — JSON Schema for model config

This enables resume from any interruption, shared state across machines, and full audit trail via git history.

## Phase Pipeline

### Greenfield

Phase 0 (Shell Setup) → Phase 1 (Product Discovery: spec refinement, UI/UX, increment planning, tech stack) → Phase 2 (Increment Delivery: tests → contracts → implementation → deployment)

### Brownfield

Phase B1 (Extract) → Phase B2 (Spec-Enable) → User Choice Point → Phase A (Assess) → Phase P (Plan) → Phase 2 (same delivery pipeline)

### Convergence

Both flows produce the same artifacts (PRD, FRDs, increment plan) and converge at Phase 2. From Phase 2 onward, greenfield and brownfield projects are identical.

## ADR Protocol

Architecture Decision Records are first-class artifacts generated at every significant decision point:
- Technology choices (greenfield Phase 1d)
- Path decisions (brownfield Phase A)
- Contract design decisions (Phase 2 Step 2)
- Implementation deviations (Phase 2 Step 3)

ADRs are stored in specs/adrs/ and tracked in state.json.

## MCP Integration

spec2cloud uses Model Context Protocol servers for live research:
- Microsoft Learn, Context7, DeepWiki for documentation
- Azure MCP for cloud infrastructure
- Playwright MCP for browser-based prototyping
- Aspire MCP for local orchestration

## Compatibility

The v1 multi-agent system (10 agents, 12 prompts) is preserved for Copilot Chat compatibility. Agents provide interactive, conversational access to the same functionality that skills provide in structured, orchestrated form.

Back to [docs index](index.md).
