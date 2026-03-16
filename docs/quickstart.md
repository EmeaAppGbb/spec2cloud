# Quick Start

Get spec2cloud running in your project in under 5 minutes.

## Prerequisites

- GitHub Copilot (Chat enabled) or Claude Code
- VS Code with Copilot extension
- Azure CLI + Azure Developer CLI (azd)
- Node.js 20+ or .NET 8+

## Option 1: One-Line Install

```bash
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/vNext/scripts/quick-install.sh | bash
```

## Option 2: Shell Template (Recommended for New Projects)

Use a pre-configured shell:

- **Next.js + TypeScript**: `spec2cloud-shell-nextjs-typescript`
- **.NET**: `shell-dotnet`
- **Agentic .NET**: `agentic-shell-dotnet`
- **Agentic Python**: `agentic-shell-python`

## Option 3: Add to Existing Project

```bash
./scripts/install.sh --merge
```

## Your First Workflow

1. Write your PRD in `specs/prd.md`
2. Open Copilot Chat, type: `/prd`
3. The orchestrator refines your spec, generates UI prototypes, plans increments
4. At each human gate, review and approve
5. Watch as tests, contracts, implementation, and deployment happen automatically

## What Happens Next

**Phase 1: Discovery** (spec → UI → plan → tech stack)

**Phase 2: Delivery** (tests → contracts → code → deploy) × N increments

## Useful Commands

- `/prd` — Start spec refinement
- `/frd` — Generate feature documents
- `/plan` — Create increment plan
- `/implement` — Begin coding
- `/deploy` — Ship to Azure
