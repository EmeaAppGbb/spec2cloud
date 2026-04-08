# spec2cloud

Install [spec2cloud](https://github.com/EmeaAppGbb/spec2cloud) AI-powered development workflows into your project.

## Quick Start

```bash
npx spec2cloud init
```

## Usage

```bash
# Full installation (skills, devcontainer, MCP config)
npx spec2cloud init

# Minimal installation (skills only)
npx spec2cloud init --minimal

# Install from a specific branch or tag
npx spec2cloud init --ref main

# Install into a specific directory
npx spec2cloud init --target ./my-project

# Force overwrite existing files
npx spec2cloud init --force
```

## Options

| Flag | Description |
|------|-------------|
| `--minimal` | Install only skills and AGENTS.md |
| `--ref <ref>` | Branch or tag to install from (default: `vNext`) |
| `--branch <branch>` | Alias for `--ref` |
| `--tag <tag>` | Alias for `--ref` |
| `--target <dir>` | Target directory (default: current directory) |
| `--force` | Overwrite existing files without prompting |

## What Gets Installed

**Full mode** (default):
- 46 agentskills.io skills covering greenfield, brownfield, and utility workflows
- VS Code MCP configuration
- Dev container setup
- AGENTS.md orchestrator
- Directory structure (`specs/`, `specs/domain/`, `.spec2cloud/`)

**Minimal mode** (`--minimal`):
- Skills and AGENTS.md only
- Directory structure

## Requirements

- Node.js 18+
- `curl` and `tar` (available on macOS, Linux, and Windows 10+)

## License

MIT
