# Spec2Cloud Integration Guide

This guide explains how to add the spec2cloud workflow to your existing projects.

## What is Spec2Cloud?

Spec2cloud is an AI-powered spec-driven development framework. It provides 43 specialized skills that transform how you build software:

- **Greenfield**: Turn product ideas into deployed applications through structured specification-driven development
- **Brownfield**: Extract specifications from existing codebases, then modernize, extend, rewrite, or fix

## Installation Methods

### Method 1: npx (Recommended)

```bash
# Full installation (skills, devcontainer, MCP config)
npx spec2cloud init

# Minimal installation (skills and AGENTS.md only)
npx spec2cloud init --minimal

# Install from a specific branch or tag
npx spec2cloud init --ref main

# Install into a specific directory
npx spec2cloud init --target /path/to/project
```

### Method 2: Quick Install Script

```bash
# Full installation
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/vNext/scripts/quick-install.sh | bash

# Minimal installation
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/vNext/scripts/quick-install.sh | bash -s -- --minimal

# Install to specific directory
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/vNext/scripts/quick-install.sh | bash -s -- --target /path/to/project

# Install from a specific branch or tag
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/vNext/scripts/quick-install.sh | bash -s -- --ref main
```

### Method 3: Clone and Copy

```bash
git clone --depth 1 --branch vNext https://github.com/EmeaAppGbb/spec2cloud.git /tmp/spec2cloud
cp -r /tmp/spec2cloud/.github/skills your-project/.github/skills
cp /tmp/spec2cloud/AGENTS.md your-project/AGENTS.md
cp /tmp/spec2cloud/skills-lock.json your-project/skills-lock.json
rm -rf /tmp/spec2cloud
```

## Installation Options

| Flag | Description |
|------|-------------|
| `--minimal` | Install only skills and AGENTS.md |
| `--full` | Install all components (default) |
| `--force` | Overwrite existing files without prompting |
| `--ref <ref>` | Branch or tag to install from (default: vNext) |
| `--target <dir>` | Target directory (default: current) |

## What Gets Installed

### Full Installation

```
your-project/
  .github/
    skills/              # 43 agentskills.io skills (core framework)
    copilot-instructions.md
    lsp.json
  .spec2cloud/           # State management
    state.json           # Current phase/increment tracking
    audit.log            # Action history
    models.json          # Model assignments per role
    models-schema.json   # Model config schema
  .vscode/
    mcp.json             # MCP server configuration (full install)
  .devcontainer/
    devcontainer.json    # Dev container config (full install)
  AGENTS.md              # Orchestrator instructions
  skills-lock.json       # Skills version lock
  .mcp.json              # Repo-level MCP config
  specs/                 # Specifications (generated or authored)
    features/
    tasks/
    docs/
```

### Minimal Installation

```
your-project/
  .github/
    skills/              # 43 agentskills.io skills
  AGENTS.md              # Orchestrator instructions
  skills-lock.json       # Skills version lock
  .spec2cloud/           # State management
  specs/                 # Specifications directory
```

## Integration Scenarios

### Scenario 1: New Project (Greenfield)

```bash
mkdir my-new-project && cd my-new-project
git init
npx spec2cloud init
code .

# Start a conversation with Copilot:
# "Create a PRD for a task management app with real-time collaboration"
```

### Scenario 2: Existing Codebase (Brownfield)

```bash
cd my-existing-project
npx spec2cloud init

# Start a conversation with Copilot:
# "Analyze this codebase and extract specs"
# The orchestrator detects existing code and enters brownfield mode
```

### Scenario 3: Active Project (Non-Destructive)

```bash
cd my-active-project

# Install with merge mode (default — existing files preserved)
npx spec2cloud init

# Conflicting configs saved as *.spec2cloud for manual merge
```

## Configuration

### MCP Servers

If you have existing `.vscode/mcp.json`, the installer will:
1. Save spec2cloud's MCP config as `mcp.json.spec2cloud`
2. Allow you to manually merge configurations

### Dev Container

If you have existing `.devcontainer/devcontainer.json`, the installer will:
1. Save spec2cloud's config as `devcontainer.json.spec2cloud`
2. Allow you to manually merge configurations

## Using Spec2Cloud

After installation, open VS Code and start a conversation with GitHub Copilot. The orchestrator (AGENTS.md) will guide you through the workflow:

### Greenfield Workflow

1. **Phase 0: Shell Setup** — Scaffolding and config
2. **Phase 1: Product Discovery** — PRD → FRD → UI/UX → Increment Plan → Tech Stack
3. **Phase 2: Increment Delivery** — Tests → Contracts → Implementation → Deploy (repeats per increment)

### Brownfield Workflow

1. **Phase B0: Onboarding** — Detect brownfield mode, initialize state
2. **Phase B1: Extract** — Scan codebase, extract architecture, APIs, data models, test inventory
3. **Phase B2: Spec-Enable** — Generate PRD and FRDs from code
4. **Testability Gate** — Assess whether the app can be tested:
   - **Track A (Testable)** — Generate Gherkin + tests that pass on current code (green baseline)
   - **Track B (Non-Testable)** — Generate behavioral documentation + manual verification checklists
   - **Hybrid** — Track A for testable features, Track B for the rest
5. **Choose Path(s)** — Modernize, Rewrite, Cloud-Native, Extend, Security, Performance
6. **Phase A: Assess** — Targeted assessment for chosen paths
7. **Phase P: Plan** — Generate increments with behavioral deltas (Gherkin or doc updates)
8. **Phase 2: Deliver** — Track-aware delivery: full pipeline (Track A) or reduced pipeline (Track B)

## Troubleshooting

### Skills Not Loading

**Solution**: Ensure `.github/skills/` directory exists and contains skill folders with `SKILL.md` files.
```bash
find .github/skills -name "SKILL.md" | wc -l    # Should be 43
```

### MCP Servers Not Loading

**Solution**: Check MCP configuration
1. Open `.vscode/mcp.json`
2. Verify server configurations
3. Check that required tools are installed (Docker, uvx, etc.)
4. Restart VS Code

### Conflicting Configuration Files

**Solution**: Manually merge `.spec2cloud` files
1. Find `*.spec2cloud` files in your project
2. Compare with your existing configurations
3. Merge desired settings
4. Delete `.spec2cloud` files after merging

## Verification

```bash
# Check installed skills
find .github/skills -name "SKILL.md" | wc -l    # Should be 43

# Check orchestrator
test -f AGENTS.md && echo "AGENTS.md exists"

# Check state management
test -d .spec2cloud && echo ".spec2cloud exists"
```

## Updating

```bash
# Re-run installer (preserves existing files by default)
npx spec2cloud init --ref vNext

# Force update (overwrites all files)
npx spec2cloud init --force
```

## Uninstalling

```bash
rm -rf .github/skills
rm -f AGENTS.md skills-lock.json
rm -rf .spec2cloud
# Optionally: rm -rf specs/  (careful — may contain your work!)
```

## Additional Resources

- **Main Documentation**: [README.md](README.md)
- **GitHub Repository**: https://github.com/EmeaAppGbb/spec2cloud
- **agentskills.io**: https://agentskills.io/specification
- **skills.sh**: https://skills.sh

## License

See [LICENSE.md](LICENSE.md) for details.
