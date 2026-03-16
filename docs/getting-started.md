# Getting Started

## Prerequisites

- VS Code with GitHub Copilot extension
- Node.js 20+ (for JavaScript/TypeScript shells)
- Azure Developer CLI (azd) for deployment
- Git

## Option 1: Shell Template (New Project)

Choose a shell template:

| Shell | Stack |
|-------|-------|
| [spec2cloud-shell-nextjs-typescript](https://github.com/EmeaAppGbb/spec2cloud-shell-nextjs-typescript) | Next.js + Express + TypeScript |
| [shell-dotnet](https://github.com/EmeaAppGbb/shell-dotnet) | ASP.NET Core + Blazor |
| [agentic-shell-dotnet](https://github.com/EmeaAppGbb/agentic-shell-dotnet) | .NET + AI Agents |
| [agentic-shell-python](https://github.com/EmeaAppGbb/agentic-shell-python) | Python + AI Agents |

Create from template:

```bash
gh repo create my-app --template EmeaAppGbb/spec2cloud-shell-nextjs-typescript
cd my-app
```

## Option 2: Install Into Existing Project (Brownfield)

```bash
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/vNext/scripts/quick-install.sh | bash
```

This installs:

- 43 skills in `.github/skills/`
- 10 agents in `.github/agents/`
- 12 prompts in `.github/prompts/`
- `.spec2cloud/` state management
- `AGENTS.md` orchestrator
- `.mcp.json` MCP configuration

## Greenfield: Your First Project

1. Write your PRD in `specs/prd.md`
2. The orchestrator will guide you through Phase 1 (discovery) and Phase 2 (delivery)
3. Human gates pause for your approval at each transition

## Brownfield: Spec-Enabling an Existing App

1. Install spec2cloud into your project
2. The orchestrator detects existing code and enters brownfield mode
3. Phase B1 extracts factual documentation from your codebase
4. Phase B2 generates PRD and FRDs from the extraction
5. You choose your path: modernize, rewrite, extend, etc.
6. The pipeline handles the rest

## Key Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Orchestrator instructions |
| `.spec2cloud/state.json` | Current progress state |
| `.spec2cloud/audit.log` | Action history |
| `.spec2cloud/models.json` | Model assignments per role |
| `.github/skills/` | All 43 skills |
| `.github/copilot-instructions.md` | Coding conventions |
| `specs/` | All specifications, assessments, ADRs |
