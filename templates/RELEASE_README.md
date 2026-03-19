# Spec2Cloud - AI-Powered Development Workflows

Transform any project into a spec2cloud-enabled development environment with specialized GitHub Copilot skills.

## What's Included

This package contains:

✅ **43 Specialized Skills** ([agentskills.io](https://agentskills.io/specification) standard)
- 22 greenfield skills (spec refinement, UI/UX, testing, contracts, implementation, deployment)
- 20 brownfield skills (extraction, assessment, planning, modernization)
- find-skills (discover and install community skills)

✅ **Orchestrator** (AGENTS.md)
- Ralph Loop pattern: read state → decide → execute → verify → commit
- Automatic phase management with human gates
- State persistence and resumability

✅ **Additional Components** (Full Package Only)
- MCP server configuration for enhanced AI capabilities
- Dev container setup with all required tools
- Directory structure templates

## Quick Start

### Installation

```bash
# Using npx (recommended)
npx spec2cloud init

# Minimal installation (skills only)
npx spec2cloud init --minimal
```

### Verification

After installation:

1. Open your project in VS Code
2. Start a conversation with GitHub Copilot
3. The orchestrator activates automatically via AGENTS.md
4. Describe your app idea or ask to analyze existing code

```bash
# Verify installation
find .github/skills -name "SKILL.md" | wc -l    # Should be 43
test -f AGENTS.md && echo "Orchestrator installed"
```

## Usage

### Greenfield (New Project)

Start a conversation with Copilot:
```
"Create a PRD for a task management app with real-time collaboration"
```

The orchestrator walks you through:
1. **Phase 1: Discovery** — PRD → FRD → UI/UX → Increment Plan → Tech Stack
2. **Phase 2: Delivery** — Tests → Contracts → Implementation → Deploy (per increment)

### Brownfield (Existing Code)

Start a conversation with Copilot:
```
"Analyze this codebase and generate specs"
```

The orchestrator walks you through:
1. **Extract** — Scan codebase, document architecture, APIs, data models
2. **Spec-Enable** — Generate PRD and FRDs from code
3. **Choose Path** — Modernize, Rewrite, Cloud-Native, Extend, Security, Performance
4. **Assess & Plan** — Targeted assessment, generate increments
5. **Deliver** — Same Phase 2 pipeline as greenfield

## Directory Structure

After installation:

```
your-project/
├── .github/
│   └── skills/             # 43 agentskills.io skills
├── .spec2cloud/            # State management
├── .devcontainer/          # Dev container (full install)
├── specs/                  # Generated specifications
├── AGENTS.md               # Orchestrator instructions
└── skills-lock.json        # Skills version lock
```

## Configuration

### MCP Servers (Full Install)

Model Context Protocol servers provide enhanced capabilities:
- **context7** - Up-to-date library documentation
- **github** - Repository management
- **microsoft.docs.mcp** - Microsoft/Azure docs
- **playwright** - Browser automation

### Dev Container (Full Install)

Pre-configured development container includes:
- Python 3.12, Node.js, TypeScript
- Azure CLI & Azure Developer CLI
- Docker-in-Docker
- VS Code extensions (Copilot, Azure, AI Toolkit)

## Installation Options

| Flag | Description |
|------|-------------|
| `--minimal` | Install only skills and AGENTS.md |
| `--force` | Overwrite existing files without prompting |
| `--ref <ref>` | Branch or tag (default: vNext) |
| `--target <dir>` | Target directory (default: current) |

## Troubleshooting

### Skills Not Loading
- Verify `.github/skills/` exists with SKILL.md files
- Reload VS Code: `Ctrl+Shift+P` → "Reload Window"

### MCP Servers Not Loading
- Check `.vscode/mcp.json` configuration
- Verify Docker, uvx, Node.js are installed
- Restart VS Code

### Conflicting Configurations
- Check for `*.spec2cloud` files
- Manually merge with your existing configs
- Delete `.spec2cloud` files after merging

## Learn More

- **Integration Guide**: See `INTEGRATION.md` for detailed setup
- **GitHub Repository**: https://github.com/EmeaAppGbb/spec2cloud
- **agentskills.io**: https://agentskills.io/specification
- **skills.sh**: https://skills.sh

## License

See LICENSE.md for details.

---

**Ready to start?** Run `npx spec2cloud init` and open your project in VS Code! 🚀
