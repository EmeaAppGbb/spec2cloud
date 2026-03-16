# Shell Templates

Shells are pre-configured project scaffolds that give you a running start. Each shell provides the project structure, test frameworks, Azure infrastructure, and CI/CD workflows for a specific tech stack.

## Available Shells

| Shell | Tech Stack | Repository |
|-------|-----------|-----------|
| **Next.js + TypeScript** | Next.js, Express, Playwright, Cucumber, Vitest | [spec2cloud-shell-nextjs-typescript](https://github.com/EmeaAppGbb/spec2cloud-shell-nextjs-typescript) |
| **.NET** | ASP.NET Core, Blazor, .NET testing | [shell-dotnet](https://github.com/EmeaAppGbb/shell-dotnet) |
| **Agentic .NET** | .NET + AI Agents (LangGraph) | [agentic-shell-dotnet](https://github.com/EmeaAppGbb/agentic-shell-dotnet) |
| **Agentic Python** | Python + AI Agents (LangGraph) | [agentic-shell-python](https://github.com/EmeaAppGbb/agentic-shell-python) |

## What's in a Shell

Every shell provides:

- **Project structure** — Organized directories for your stack
- **Test frameworks** — Unit, BDD, and e2e testing pre-configured
- **Azure infrastructure** — Bicep templates for provisioning
- **CI/CD workflows** — GitHub Actions for build, test, and deploy
- **Dev container** — Consistent development environment
- **Stack-specific AGENTS.md** — Section 7 with commands for your stack
- **Copilot instructions** — Stack-specific guidance for AI assistants

## Skills Work With Any Stack

The 43 skills are stack-agnostic. Shells provide the stack-specific wiring (which test runner to use, which build commands, which Azure resources), but the skills themselves—spec refinement, gherkin generation, implementation strategy—work identically regardless of your technology choice.

## Starting from a Shell

1. Clone the shell repository
2. Run the installer: `./scripts/install.sh --full`
3. Open in VS Code with the dev container
4. Write your PRD in `specs/prd.md`
5. Start with `/prd` in Copilot Chat

## Adding to an Existing Project

If you already have a project, use merge mode:

```bash
./scripts/install.sh --merge
```

This adds spec2cloud's skills, agents, and state management without overwriting your existing files. The installer detects your stack and configures accordingly.
