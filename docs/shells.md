# Shell Templates

Shells are pre-configured project scaffolds that give you a running start. Each shell provides the project structure, test frameworks, Azure infrastructure, and CI/CD workflows for a specific tech stack.

## How Shells Are Discovered

Shells are discovered **dynamically** from GitHub repositories tagged with the topic `spec2cloud-shell` in the configured organization. No central registry to maintain — just add the topic to your repo and it becomes available.

### Discovery order
1. **Topic-based discovery** — repos with topic `spec2cloud-shell` in the org (default: `EmeaAppGbb`)
2. **Static registry** — `shells.json` in the spec2cloud repo (fallback)
3. **Built-in list** — hardcoded in the CLI (offline fallback)

### Creating a New Shell

1. Create a GitHub repository in your org
2. Add the topic `spec2cloud-shell` to the repository
3. Optionally add a `shell.json` at the repo root for rich metadata:

```json
{
  "id": "my-shell",
  "name": "My Custom Shell",
  "desc": "React, FastAPI, Playwright, Pytest"
}
```

If `shell.json` is missing, the CLI derives metadata from the repository name and description.

### Using shells from a different org

```bash
npx spec2cloud init --org my-org --list-shells    # List shells from my-org
npx spec2cloud init --org my-org --shell my-shell  # Use a shell from my-org
```

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

The 46 skills are stack-agnostic. Shells provide the stack-specific wiring (which test runner to use, which build commands, which Azure resources), but the skills themselves—spec refinement, gherkin generation, implementation strategy—work identically regardless of your technology choice.

## Starting from a Shell

1. Run the installer with a shell: `npx spec2cloud init --shell <id>`
2. Open in VS Code with the dev container
3. Write your PRD in `specs/prd.md`
4. Start with `/prd` in Copilot Chat

## Adding to an Existing Project

If you already have a project, use merge mode:

```bash
npx spec2cloud init --minimal
```

This adds spec2cloud's skills, agents, and state management without overwriting your existing files. The installer detects your stack and configures accordingly.
