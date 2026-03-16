# Spec2Cloud Integration Guide

This guide explains how to integrate spec2cloud into your existing projects to enable AI-powered development workflows.

## 🎯 What is Spec2Cloud?

Spec2cloud is an AI-powered spec-driven development framework. It provides 43 specialized skills, 10 Copilot Chat agents, and 12 workflow prompts that transform how you build software:

- **Greenfield**: Turn product ideas into deployed applications through structured specification-driven development
- **Brownfield**: Extract specifications from existing codebases, then modernize, extend, rewrite, or fix

## 📦 Installation Methods

### Method 1: Quick Install (Recommended)

One-line installation from GitHub releases:

```bash
# Full installation (agents, prompts, devcontainer, MCP)
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/main/scripts/quick-install.sh | bash

# Minimal installation (agents and prompts only)
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/main/scripts/quick-install.sh | bash -s -- --minimal

# Install to specific directory
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/main/scripts/quick-install.sh | bash -s -- --target /path/to/project
```

### Method 2: Manual Download

Download and extract manually:

```bash
# Download latest release
curl -L https://github.com/EmeaAppGbb/spec2cloud/releases/latest/download/spec2cloud-full-latest.zip -o spec2cloud.zip

# Extract
unzip spec2cloud.zip -d spec2cloud

# Run installer
cd spec2cloud
./scripts/install.sh --full

# Or on Windows
.\scripts\install.ps1 -Full
```

### Method 3: GitHub Release Download

1. Visit [Releases](https://github.com/EmeaAppGbb/spec2cloud/releases)
2. Download the desired package:
   - `spec2cloud-full-*.zip` - Complete package with all features
   - `spec2cloud-minimal-*.zip` - Agents and prompts only
3. Extract and run the installer

## 🔧 Installation Options

### Full Installation

Includes everything:
- 43 agentskills.io skills (22 greenfield + 20 brownfield + find-skills)
- 10 specialized AI agents
- 12 workflow prompts
- .spec2cloud/ state management framework
- AGENTS.md orchestrator instructions
- MCP server configuration
- Dev container setup
- APM configuration
- Directory structure templates

```bash
# Linux/Mac
./scripts/install.sh --full

# Windows
.\scripts\install.ps1 -Full
```

### Minimal Installation

Includes only:
- 43 agentskills.io skills
- 10 specialized AI agents
- 12 workflow prompts
- .spec2cloud/ state management
- AGENTS.md orchestrator

```bash
# Linux/Mac
./scripts/install.sh --agents-only

# Windows
.\scripts\install.ps1 -AgentsOnly
```

### Installation Flags

| Flag | Description |
|------|-------------|
| `--full` / `-Full` | Install all components |
| `--agents-only` / `-AgentsOnly` | Install only agents and prompts |
| `--merge` / `-Merge` | Merge with existing files (default) |
| `--force` / `-Force` | Overwrite without prompting |
| `--no-color` / `-NoColor` | Disable colored output |

## 📁 What Gets Installed

What Gets Installed:
- 43 agentskills.io skills (22 greenfield + 20 brownfield + find-skills)
- 10 specialized AI agents (Spec2Cloud, PM, Dev Lead, Dev, Azure, Tech Analyst, Modernizer, Extender, Planner, Architect)
- 12 workflow prompts
- .spec2cloud/ state management (state.json, audit.log, models.json)
- AGENTS.md orchestrator
- MCP server configuration (optional)
- Dev container setup (optional)
- APM configuration (optional)

### Directory Structure

After installation, your project will have:

```
your-project/
  .github/
    agents/              # 10 specialized AI agents
    prompts/             # 12 workflow prompts
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
    prd.md
    frd-{feature}.md
    adrs/                # Architecture Decision Records
    assessment/          # Brownfield assessment outputs
    docs/                # Brownfield extraction outputs
  apm.yml                # APM configuration (full install)
```

## 🔄 Integration Scenarios

### Scenario 1: New Project

Starting fresh? Install spec2cloud and start building:

```bash
mkdir my-new-project
cd my-new-project
git init

# Install spec2cloud
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/main/scripts/quick-install.sh | bash

# Open in VS Code
code .

# Start with /prd workflow
```

### Scenario 2: Existing Codebase (Documentation Needed)

Have existing code but no documentation? Use brownfield workflows:

```bash
cd my-existing-project

# Install spec2cloud
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/main/scripts/quick-install.sh | bash

# Open in VS Code
code .

# Reverse engineer your codebase
# Use /rev-eng workflow
```

### Scenario 3: Active Project (Non-Destructive)

Installing into an active project? Spec2cloud respects existing files:

```bash
cd my-active-project

# Install with merge mode (default)
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/main/scripts/quick-install.sh | bash

# Existing .github files preserved
# New agents/prompts added
# Conflicting configs saved as *.spec2cloud for manual merge
```

### Scenario 4: Brownfield Spec-Enablement

Have an existing codebase you want to spec-enable?

```bash
cd my-existing-project

# Install spec2cloud
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/vNext/scripts/quick-install.sh | bash

# Open in VS Code
code .

# The orchestrator will detect existing code and enter brownfield mode
# Phase B1 extracts factual documentation
# Phase B2 generates specs from your code
# Then you choose: modernize, rewrite, extend, etc.
```

## ⚙️ Configuration

### MCP Servers

If you have existing `.vscode/mcp.json`, the installer will:
1. Save spec2cloud's MCP config as `mcp.json.spec2cloud`
2. Allow you to manually merge configurations

Example merge:

```json
{
  "mcpServers": {
    // Your existing MCP servers
    "my-existing-server": {
      "command": "node",
      "args": ["server.js"]
    },
    // Add spec2cloud MCP servers from mcp.json.spec2cloud
    "context7": {
      "command": "uvx",
      "args": ["context7-mcp"]
    },
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "mcp/github"
      ]
    }
    // ... other spec2cloud servers
  }
}
```

### Dev Container

If you have existing `.devcontainer/devcontainer.json`, the installer will:
1. Save spec2cloud's config as `devcontainer.json.spec2cloud`
2. Allow you to manually merge configurations

Key features to consider merging:
- Python 3.12, Node.js, Azure CLI
- Docker-in-Docker support
- GitHub Copilot extensions
- Azure and AI Toolkit extensions

### APM Configuration

If you have existing `apm.yml`, the installer will skip creating a new one.

To use spec2cloud standards:

```yaml
dependencies:
  apm:
    - source: danielmeppiel/azure-standards
      version: latest
  # Add your existing dependencies
```

Then run:
```bash
apm install
apm compile
```

## 🚀 Using Spec2Cloud

### Greenfield Workflows

For new features and projects:

1. **`/prd`** - Create Product Requirements Document
   - Describes the product vision, goals, and requirements

2. **`/frd`** - Create Feature Requirements Documents
   - Breaks down PRD into individual features

3. **`/generate-agents`** (Optional) - Generate Agent Guidelines
   - Consolidates engineering standards from `standards/` directory

4. **`/plan`** - Create Technical Task Breakdown
   - Translates features into implementation tasks

5. **`/implement`** - Implement Features Locally
   - Dev agent writes code directly

6. **`/delegate`** - Delegate to GitHub Copilot
   - Creates GitHub issues for Copilot Coding Agent

7. **`/deploy`** - Deploy to Azure
   - Generates IaC and CI/CD pipelines

### Brownfield Workflows

For existing codebases:

1. **`/rev-eng`** - Reverse Engineer Codebase
   - Analyzes code and creates documentation
   - Generates tasks, features, and product vision

2. **`/modernize`** (Optional) - Create Modernization Plan
   - Assesses technical debt and upgrade opportunities

3. **`/plan`** (Optional) - Implement Modernization
   - Executes modernization tasks

4. **`/deploy`** (Optional) - Deploy to Azure
   - Deploys modernized application

## 🔍 Troubleshooting

### Issue: Agents Not Showing in Copilot Chat

**Solution**: Reload VS Code window
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Reload Window"
3. Press Enter

### Issue: MCP Servers Not Loading

**Solution**: Check MCP configuration
1. Open `.vscode/mcp.json`
2. Verify server configurations
3. Check that required tools are installed (Docker, uvx, etc.)
4. Restart VS Code

### Issue: Installation Script Permission Denied

**Solution**: Make script executable
```bash
chmod +x scripts/install.sh
./scripts/install.sh --full
```

### Issue: Conflicting Configuration Files

**Solution**: Manually merge `.spec2cloud` files
1. Find `*.spec2cloud` files in your project
2. Compare with your existing configurations
3. Merge desired settings
4. Delete `.spec2cloud` files after merging

### Issue: APM Not Found

**Solution**: Install APM
```bash
# Install APM
pip install git+https://github.com/danielmeppiel/apm.git

# Or follow instructions at:
# https://github.com/danielmeppiel/apm
```

### Issue: Prompts Not Working

**Solution**: Verify file structure
```bash
# Check agents
ls .github/agents/*.agent.md

# Check prompts
ls .github/prompts/*.prompt.md

# Should see 10 agents, 12 prompts, and 43 skills
```

## 📊 Verification

After installation, verify everything is working:

```bash
# 1. Check file structure
tree .github/

# 2. Count installed components
find .github/agents -name "*.agent.md" | wc -l    # Should be 10
find .github/prompts -name "*.prompt.md" | wc -l   # Should be 12
find .github/skills -name "SKILL.md" | wc -l       # Should be 43

# 3. Open in VS Code
code .

# 4. Open GitHub Copilot Chat
# Press Ctrl+Shift+I (Windows/Linux) or Cmd+Shift+I (Mac)

# 5. Type @ and verify agents appear
# Should see: @spec2cloud, @pm, @devlead, @architect, @planner, @dev, @azure, @tech-analyst, @modernizer, @extender

# 6. Type / and verify prompts appear
# Should see: /prd, /frd, /plan, /implement, /deploy, /delegate, /rev-eng, /modernize, /extend, /adr, etc.
```

## 🔄 Updating Spec2Cloud

To update to a newer version:

```bash
# Re-run quick install with desired version
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/main/scripts/quick-install.sh | bash -s -- --version v1.1.0

# Or download and run installer with --force
./scripts/install.sh --full --force
```

## 🗑️ Uninstalling

To remove spec2cloud:

```bash
# Remove agents and prompts
rm -rf .github/agents
rm -rf .github/prompts

# Remove specs directory (be careful - may contain your work!)
# Only if you want to remove generated documentation
rm -rf specs/

# Remove configurations (if no conflicts)
rm .vscode/mcp.json
rm .devcontainer/devcontainer.json
rm apm.yml

# Remove any .spec2cloud backup files
find . -name "*.spec2cloud" -delete
```

## 💡 Best Practices

### 1. Start Small
- Begin with minimal installation
- Test workflows on a small feature
- Upgrade to full installation if needed

### 2. Document as You Go
- Use `/prd` before coding new features
- Run `/rev-eng` on inherited code
- Keep specs/ directory in version control

### 3. Leverage Standards
- Install APM packages for your tech stack
- Run `apm compile` to generate `AGENTS.md`
- Agents will follow your standards

### 4. Use Dev Container
- Consistent environment across team
- All tools pre-installed
- MCP servers configured

### 5. Version Control
- Commit `.github/agents` and `.github/prompts`
- Commit `specs/` directory
- Include `apm.yml` and `AGENTS.md`
- Add `.spec2cloud` to `.gitignore`

## 📚 Additional Resources

- **Main Documentation**: [README.md](README.md)
- **Workflow Guide**: [SPEC2CLOUD.md](SPEC2CLOUD.md)
- **GitHub Repository**: https://github.com/EmeaAppGbb/spec2cloud
- **APM Documentation**: https://github.com/danielmeppiel/apm
- **GitHub Copilot**: https://github.com/features/copilot

## 🤝 Support

Need help?

1. **Check Documentation**: Start with README.md and this guide
2. **GitHub Issues**: Report bugs or request features
3. **GitHub Discussions**: Ask questions and share experiences

## 📝 License

See [LICENSE.md](LICENSE.md) for details.

---

**Ready to transform your development workflow?** Install spec2cloud and start building! 🚀
