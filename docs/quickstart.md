# Quick Start

Get spec2cloud running in your project in under 5 minutes.

## Prerequisites

- GitHub Copilot (Chat enabled) or Claude Code
- VS Code with Copilot extension
- Azure CLI + Azure Developer CLI (azd)
- Node.js 20+ or .NET 8+

## Option 1: npx (Recommended)

```bash
npx spec2cloud init
```

## Option 2: One-Line Install

```bash
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/vNext/scripts/quick-install.sh | bash
```

## Option 3: Shell Template (Recommended for New Projects)

Use a pre-configured shell:

- **Next.js + TypeScript**: `shell-typescript`
- **.NET**: `shell-dotnet`
- **Agentic .NET**: `agentic-shell-dotnet`
- **Agentic Python**: `agentic-shell-python`

## Option 4: Add to Existing Project

```bash
npx spec2cloud init --minimal
```

## Your First Workflow

1. Open your project in VS Code with GitHub Copilot
2. Start a conversation with Copilot — the orchestrator (AGENTS.md) activates automatically
3. Describe your app idea or ask Copilot to analyze your existing codebase
4. At each human gate, review and approve
5. Watch as tests, contracts, implementation, and deployment happen automatically

## What Happens Next

**Greenfield:** Phase 1 Discovery (spec → UI → plan → tech stack) → Phase 2 Delivery (tests → contracts → code → deploy) × N increments

**Brownfield:** Phase B1 Extract → Phase B2 Spec-Enable → Testability Gate (can you test it?) → Track A (green baseline tests) or Track B (behavioral docs) → Choose paths → Assess → Plan → Phase 2 Delivery
