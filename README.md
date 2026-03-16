# spec2cloud

**Spec2Cloud** is an AI-powered development workflow that transforms high-level product ideas into production-ready applications deployed on  using specialized GitHub Copilot skills and agents working together.Azure 

## Overview

spec2cloud provides a complete framework for **spec-driven development**: specifications are the source of truth, tests are generated from specs, and implementation is driven by making tests pass. AI agents orchestrate the entire pipeline with human approval gates at every critical transition.

### What is New in vNext

The vNext release introduces a **skills-based architecture** built on the [agentskills.io](https://agentskills.io/specification) standard:

| Feature | Previous (v1) | vNext |
|---------|---------------|-------|
| **Architecture** | Multi-agent delegation (10 agents) | Monolithic orchestrator + 43 skills |
| **State Management** | None (stateless) | .spec2cloud/state.json + audit log |
| **Orchestration** | Agent-to-agent handoffs | Ralph Loop (read, decide, execute, verify, commit) |
| **Extensibility** | Edit agent .md files | Create/install skills (agentskills.io) |
| **Resumability** | Start from scratch each session | Resume from exact position after interruption |
| **Model Selection** | Fixed per agent | Configurable per role (.spec2cloud/models.json) |
| **Ecosystem** | Closed |  search and install community skills from skills.sh |Open 

> **Note:** The existing agents and prompts are preserved for compatibility and can complement the skills-based workflow.

### Workflow Modes

- **Greenfield (Build New)**: PRD -> FRD -> UI Prototypes -> Tests -> Contracts -> Implementation -> Azure Deployment
- **Greenfield (Shell-Based)**: Start from a predefined shell template and let agents fill in the gaps
- **Brownfield (Modernize)**: Reverse engineer existing codebases -> documentation -> modernization

## Quick Start

### Option 1: Use a Shell Template (Recommended for New Projects)

Shell templates provide a complete, pre-wired project scaffold:

| Shell | Stack | Repository |
|-------|-------|-----------|
| Next.js + TypeScript | Next.js, Express, Playwright, Cucumber | [spec2cloud-shell-nextjs-typescript](https://github.com/EmeaAppGbb/spec2cloud-shell-nextjs-typescript) |
| .NET | ASP.NET Core, Blazor | [shell-dotnet](https://github.com/EmeaAppGbb/shell-dotnet) |
| Agentic .NET | .NET + AI Agents | [agentic-shell-dotnet](https://github.com/EmeaAppGbb/agentic-shell-dotnet) |
| Agentic Python | Python + AI Agents | [agentic-shell-python](https://github.com/EmeaAppGbb/agentic-shell-python) |

### Option 2: Install Into Existing Project

One-line install (full):

    curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/vNext/scripts/quick-install.sh | bash

Minimal install (skills, agents, prompts only):

    curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/vNext/scripts/quick-install.sh | bash -s -- --minimal

### Option 3: Use as Template Repository

1. Click "Use this template" on GitHub
2. Open in Dev Container (everything pre-configured)
3. Describe your app idea and follow the workflow

See **[INTEGRATION.md](INTEGRATION.md)** for detailed installation options.

## Architecture

### The Ralph Loop

spec2cloud uses a single monolithic orchestrator that follows the **Ralph Loop** pattern:

    1. Read current state (.spec2cloud/state.json)             -> skill: state-management
    2. Determine the next task toward the current phase goal
    3. Check .github/ does a local skill cover this?skills/ 
    4. Search skills. is there a community skill?           -> skill: skill-discoverysh 
    5.  query MCP tools for best practices            -> skill: research-best-practicesResearch 
    6. Execute the task (using the skill or directly)
    7. Verify the outcome
    8. If a new reusable pattern emerged -> create a skill      -> skill: skill-creator
    9. Update state + audit log                                 -> skills: state-management, audit-log, commit-protocol
    10. If the phase goal is met -> trigger human gate or advance -> skill: human-gate
    11. If not -> loop back to 1

### Phase Pipeline

    Phase 0: Shell Setup           (one-time)
    Phase 1: Product Discovery     (one-time)
      1a: Spec Refinement          -> skill: spec-refinement
      1b: UI/UX Design             -> skill: ui-ux-design
      1c: Increment Planning       -> orchestrator (inline)
      1d: Tech Stack               -> skill: tech-stack-resolution
    Phase 2: Increment Delivery    (repeats per increment)
      Step 1: Tests                -> skills: e2e-generation, gherkin-generation, test-generation
      Step 2: Contracts            -> skill: contract-generation
      Step 3: Implementation       -> skill: implementation
      Step 4: Verify and Ship      -> skill: azure-deployment

### Brownfield Flow

For existing codebases, spec2cloud provides a modular brownfield pipeline:

```
Extract (pure facts) → Spec-Enable (PRD/FRDs) → User Picks Path(s)
→ Assess (targeted + ADRs) → Plan (increments) → Phase 2 Delivery
```

**Phase B1: Extract** — 6 skills scan the codebase and produce factual documentation. Zero judgment — only what exists.

**Phase B2: Spec-Enable** — Generate PRD and FRDs from extraction data. FRDs include a "Current Implementation" section.

**User Choice Point** — Select one or more paths:
- Modernize | Rewrite | Cloud-Native | Extend | Fix Bugs | Security | Performance

**Phase A: Assess** — Only selected paths run. Each produces findings + ADRs.

**Phase P: Plan** — Each path generates increments for the standard Phase 2 pipeline.

### Skills Catalog (43 skills)

#### Greenfield Skills (22)

| Category | Skills |
|----------|--------|
| **Phase** | spec-refinement, ui-ux-design, tech-stack-resolution |
| **Increment Delivery** | e2e-generation, gherkin-generation, test-generation, contract-generation, implementation, azure-deployment |
| **Protocol** | state-management, commit-protocol, audit-log, human-gate, resume, error-handling |
| **Utility** | spec-validator, test-runner, build-check, deploy-diagnostics, research-best-practices, skill-creator, skill-discovery, find-skills |

#### Brownfield Skills (20)

| Category | Skills |
|----------|--------|
| **Extraction (B1)** | codebase-scanner, dependency-inventory, architecture-mapper, api-extractor, data-model-extractor, test-discovery |
| **Spec Generation (B2)** | prd-generator, frd-generator |
| **Assessment (A)** | modernization-assessment, rewrite-assessment, cloud-native-assessment, security-assessment, performance-assessment |
| **Planning (P)** | modernization-planner, rewrite-planner, cloud-native-planner, extension-planner, security-planner |
| **Cross-cutting** | adr, bug-fix |

#### find-skills

The `find-skills` skill searches both local (.github/skills/) and community (skills.sh) catalogs to locate skills for any task.

Skills follow the [agentskills.io specification](https://agentskills.io/specification) and live in .github/skills/.

### State Management

    .spec2cloud/
      state.json            - Current position (phase, increment, status)
      audit.log             - Full history (every action, in order)
      models.json           - Model assignments per agent role
      models-schema.json    - JSON Schema for model config
      audit-log-format.md   - Audit log format reference
      README.md             - State persistence documentation

State is committed to the repo after every action, enabling resume from any interruption, shared state across machines, and full audit trail via git history.

## What Gets Installed

### Full Installation

    your-project/
      .github/
        agents/             - 10 specialized AI agents (Copilot Chat)
        prompts/            - 12 workflow prompts (/prd, /frd, /plan, etc.)
        skills/             - 43 agentskills.io skills (22 greenfield + 20 brownfield + find-skills)
        copilot-instructions.md
        lsp.json
      .spec2cloud/          - State management framework
      .mcp.json             - MCP server configuration
      .devcontainer/        - Dev container setup
      AGENTS.md             - Orchestrator instructions
      skills-lock.json      - Skills lock file
      apm.yml               - APM configuration

## Agents and Prompts (Copilot Chat)

The existing multi-agent system is preserved for complementary use:

**Agents:** @spec2cloud (orchestrator), @pm, @devlead, @architect, @planner, @dev, @azure, @tech-analyst, @modernizer, @extender

**Prompts:** /prd, /frd, /plan, /implement, /delegate, /deploy, /rev-eng, /modernize, /extend, /adr, /generate-agents, /bootstrap-agents

## Documentation

Explore the **[full documentation](docs/README.md)** with animated infographics and visual guides:

| Guide | Description |
|-------|-------------|
| [Visual Overview](docs/overview.md) | See the big picture with animated SVG infographics |
| [Quick Start](docs/quickstart.md) | Get running in 5 minutes |
| [Architecture](docs/architecture.md) | The Ralph Loop, state persistence, and how it all fits |
| [Greenfield Guide](docs/greenfield.md) | Build new applications from spec to Azure |
| [Brownfield Guide](docs/brownfield.md) | Modernize, extend, or rewrite existing code |
| [Skills Catalog](docs/skills.md) | All 43 skills with visual architecture map |
| [State & Human Gates](docs/state-and-gates.md) | Resumability, auditability, and approval checkpoints |
| [Shell Templates](docs/shells.md) | Pre-configured project scaffolds |
| [Examples](docs/examples.md) | Step-by-step walkthroughs with visuals |

Reference files: [AGENTS.md](AGENTS.md) | [INTEGRATION.md](INTEGRATION.md) | [SPEC2CLOUD.md](SPEC2CLOUD.md)

## Contributing

Contributions welcome! You can:
- Create new skills following the [agentskills.io spec](https://agentskills.io/specification)
- Build new shell templates for different tech stacks
- Improve existing agents, prompts, or documentation
- Publish skills to [skills.sh](https://skills.sh/)

## License

See [LICENSE.md](LICENSE.md) for details.

---

**From idea to  spec-driven, AI-powered, human-approved.**production 
