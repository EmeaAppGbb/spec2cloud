# spec2cloud

**Spec2Cloud** is an AI-powered development workflow that transforms high-level product ideas into production-ready applications deployed on Azure using specialized GitHub Copilot skills working together.

## Overview

spec2cloud provides a complete framework for **spec-driven development**: specifications are the source of truth, tests are generated from specs, and implementation is driven by making tests pass. The orchestrator manages the entire pipeline with human approval gates at every critical transition.

### Architecture

spec2cloud uses a **monolithic orchestrator + 43 skills** architecture built on the [agentskills.io](https://agentskills.io/specification) standard:

| Feature | Description |
|---------|-------------|
| **Architecture** | Monolithic orchestrator + 43 specialized skills |
| **State Management** | `.spec2cloud/state.json` + audit log |
| **Orchestration** | Ralph Loop (read → decide → execute → verify → commit) |
| **Extensibility** | Create/install skills via [agentskills.io](https://agentskills.io) |
| **Resumability** | Resume from exact position after interruption |
| **Model Selection** | Configurable per role (`.spec2cloud/models.json`) |
| **Ecosystem** | Search and install community skills from [skills.sh](https://skills.sh) |

### Workflow Modes

- **Greenfield (Build New)**: PRD → FRD → UI Prototypes → Tests → Contracts → Implementation → Azure Deployment
- **Brownfield (Modernize)**: Extract specs from existing code → Assess → Plan → Deliver

## Adding spec2cloud to Your Project

### Option 1: npx (Recommended)

```bash
# Navigate to your project
cd my-project

# Full installation (skills, AGENTS.md, devcontainer, MCP config)
npx spec2cloud init

# Or minimal installation (skills and AGENTS.md only)
npx spec2cloud init --minimal
```

### Option 2: Quick Install Script

```bash
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/vNext/scripts/quick-install.sh | bash
```

### Option 3: Use a Shell Template (New Projects)

Shell templates provide a complete, pre-wired project scaffold:

| Shell | Stack | Repository |
|-------|-------|-----------|
| Next.js + TypeScript | Next.js, Express, Playwright, Cucumber | [spec2cloud-shell-nextjs-typescript](https://github.com/EmeaAppGbb/spec2cloud-shell-nextjs-typescript) |
| .NET | ASP.NET Core, Blazor | [shell-dotnet](https://github.com/EmeaAppGbb/shell-dotnet) |
| Agentic .NET | .NET + AI Agents | [agentic-shell-dotnet](https://github.com/EmeaAppGbb/agentic-shell-dotnet) |
| Agentic Python | Python + AI Agents | [agentic-shell-python](https://github.com/EmeaAppGbb/agentic-shell-python) |

### What Gets Installed

```
your-project/
  .github/
    skills/             # 43 agentskills.io skills (22 greenfield + 20 brownfield + find-skills)
    copilot-instructions.md
    lsp.json
  .spec2cloud/          # State management framework
  .mcp.json             # MCP server configuration
  .devcontainer/        # Dev container setup (full install only)
  AGENTS.md             # Orchestrator instructions
  skills-lock.json      # Skills lock file
```

### After Installation

1. **Open your project** in VS Code with GitHub Copilot
2. **Start a conversation** — the orchestrator reads `AGENTS.md` and activates skills automatically
3. **Greenfield**: Tell Copilot about your app idea. It will walk you through PRD → FRD → Implementation → Deployment.
4. **Brownfield**: Tell Copilot to analyze your existing codebase. It will extract specs, then offer modernization/extension paths.

The orchestrator manages all state in `.spec2cloud/state.json` and pauses for human approval at every critical transition.

See **[INTEGRATION.md](INTEGRATION.md)** for detailed installation options and configuration.

## The Ralph Loop

```
1. Read current state (.spec2cloud/state.json)             → skill: state-management
2. Determine the next task toward the current phase goal
3. Check .github/skills/ — does a local skill cover this?
4. Search skills.sh — is there a community skill?           → skill: skill-discovery
5. Research — query MCP tools for best practices             → skill: research-best-practices
6. Execute the task (using the skill or directly)
7. Verify the outcome
8. If a new reusable pattern emerged → create a skill        → skill: skill-creator
9. Update state + audit log                                  → skills: state-management, audit-log
10. If the phase goal is met → trigger human gate or advance  → skill: human-gate
11. If not → loop back to 1
```

## Phase Pipeline

```
Phase 0: Shell Setup           (one-time)
Phase 1: Product Discovery     (one-time)
  1a: Spec Refinement          → skill: spec-refinement
  1b: UI/UX Design             → skill: ui-ux-design
  1c: Increment Planning       → orchestrator (inline)
  1d: Tech Stack               → skill: tech-stack-resolution
Phase 2: Increment Delivery    (repeats per increment)
  Step 1: Tests                → skills: e2e-generation, gherkin-generation, test-generation
  Step 2: Contracts            → skill: contract-generation
  Step 3: Implementation       → skill: implementation
  Step 4: Verify and Ship      → skill: azure-deployment
```

### Brownfield Flow

For existing codebases, spec2cloud provides a modular brownfield pipeline:

```
Extract (pure facts) → Spec-Enable (PRD/FRDs) → User Picks Path(s)
→ Assess (targeted + ADRs) → Plan (increments) → Phase 2 Delivery
```

**Phase B1: Extract** — 6 skills scan the codebase and produce factual documentation. Zero judgment — only what exists.

**Phase B2: Spec-Enable** — Generate PRD and FRDs from extraction data.

**User Choice Point** — Select one or more paths:
- Modernize | Rewrite | Cloud-Native | Extend | Fix Bugs | Security | Performance

**Phase A: Assess** — Only selected paths run. Each produces findings + ADRs.

**Phase P: Plan** — Each path generates increments for the standard Phase 2 pipeline.

## Skills Catalog (43 skills)

### Greenfield Skills (22)

| Category | Skills |
|----------|--------|
| **Phase** | spec-refinement, ui-ux-design, tech-stack-resolution |
| **Increment Delivery** | e2e-generation, gherkin-generation, test-generation, contract-generation, implementation, azure-deployment |
| **Protocol** | state-management, commit-protocol, audit-log, human-gate, resume, error-handling |
| **Utility** | spec-validator, test-runner, build-check, deploy-diagnostics, research-best-practices, skill-creator, skill-discovery, find-skills |

### Brownfield Skills (20)

| Category | Skills |
|----------|--------|
| **Extraction (B1)** | codebase-scanner, dependency-inventory, architecture-mapper, api-extractor, data-model-extractor, test-discovery |
| **Spec Generation (B2)** | prd-generator, frd-generator |
| **Assessment (A)** | modernization-assessment, rewrite-assessment, cloud-native-assessment, security-assessment, performance-assessment |
| **Planning (P)** | modernization-planner, rewrite-planner, cloud-native-planner, extension-planner, security-planner |
| **Cross-cutting** | adr, bug-fix |

Skills follow the [agentskills.io specification](https://agentskills.io/specification) and live in `.github/skills/`.

### State Management

```
.spec2cloud/
  state.json            - Current position (phase, increment, status)
  audit.log             - Full history (every action, in order)
  models.json           - Model assignments per agent role
  models-schema.json    - JSON Schema for model config
```

State is committed to the repo after every action, enabling resume from any interruption, shared state across machines, and full audit trail via git history.

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
- Publish skills to [skills.sh](https://skills.sh/)

## License

See [LICENSE.md](LICENSE.md) for details.

---

**From idea to production — spec-driven, AI-powered, human-approved.**
