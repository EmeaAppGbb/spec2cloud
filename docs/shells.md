# Shell Templates

Shells are pre-wired project scaffolds that provide a specific tech stack integrated with the spec2cloud framework. Each shell includes:

- Project structure for the chosen stack
- Test frameworks (unit, BDD, e2e) pre-configured
- Azure infrastructure templates (Bicep)
- CI/CD workflows (GitHub Actions)
- Dev container setup
- Stack-specific skill references and AGENTS.md section 7

## Available Shells

| Shell | Stack | Repo |
|-------|-------|------|
| Next.js + TypeScript | Next.js, Express, Playwright, Cucumber, Vitest | [spec2cloud-shell-nextjs-typescript](https://github.com/EmeaAppGbb/spec2cloud-shell-nextjs-typescript) |
| .NET | ASP.NET Core, Blazor | [shell-dotnet](https://github.com/EmeaAppGbb/shell-dotnet) |
| Agentic .NET | .NET + AI Agents (LangGraph) | [agentic-shell-dotnet](https://github.com/EmeaAppGbb/agentic-shell-dotnet) |
| Agentic Python | Python + AI Agents (LangGraph) | [agentic-shell-python](https://github.com/EmeaAppGbb/agentic-shell-python) |

## What a Shell Provides

A shell template fills in the stack-specific parts of the framework:

1. **AGENTS.md Section  Stack reference with project structure, test commands, dev server commands, build commands, deploy commands7** 
2. **.github/copilot-instructions.md  Language/framework-specific coding conventionsextensions** 
3. **apphost. .NET Aspire service orchestration configurationcs** 
4. **azure. Azure Developer CLI service definitionsyaml** 
5. ** Bicep templates for Azure infrastructureinfra/** 
6. **Test framework  Cucumber, Playwright, and unit test configurationswiring** 

## Creating a New Shell

To create a shell for a new tech stack:

1. Start from the spec2cloud framework (this repo)
2. Add your project scaffolding in `src/`
3. Configure test frameworks
4. Fill in AGENTS.md Section 7 with stack-specific commands
5. Add stack-specific conventions to `copilot-instructions.md`
6. Create Azure infrastructure templates
7. Wire up CI/CD workflows

The framework's 43 skills work with ANY  shells just provide the stack-specific wiring.stack 
