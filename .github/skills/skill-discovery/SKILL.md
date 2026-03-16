---
name: skill-discovery
description: >-
  Search the skills.sh open ecosystem for community skills relevant to the
  current task. Install discovered skills into the project. Use before starting
  any new task, when resolving technology decisions, or when the user asks to
  find a skill for a specific capability.
---

# Skill Discovery

Search [skills.sh](https://skills.sh/) for community skills before building from scratch.

## When to Search

- Before starting any task in the Ralph loop (after checking local `.github/skills/`)
- During Phase 1d (Tech Stack Resolution) — search for technology-specific skills
- When the user asks "is there a skill for X?" or "find a skill for X"
- When you encounter a domain where a community best-practice skill likely exists

## How to Search

```bash
npx skills find [query]
```

Examples:
- `npx skills find react performance` — React optimization patterns
- `npx skills find playwright testing` — E2E testing best practices
- `npx skills find azure deployment` — Azure deployment patterns
- `npx skills find nextjs` — Next.js development patterns

## How to Install

Install a skill for the project (stored in `.github/skills/`):

```bash
npx skills add <owner/repo@skill-name> -y
```

Install a skill globally (shared across projects):

```bash
npx skills add <owner/repo@skill-name> -g -y
```

## Presenting Results

When you find relevant skills:

1. Present the skill name and what it does
2. Show the install command
3. Link to the skills.sh page: `https://skills.sh/<owner>/<repo>/<skill-name>`
4. Ask the user if they want to install it

Example:
```
Found: "vercel-react-best-practices" — React and Next.js optimization guidelines from Vercel Engineering.

Install: npx skills add vercel-labs/agent-skills@vercel-react-best-practices -y
Details: https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices

Would you like to install this skill?
```

## Common Skill Sources

| Source | Skills |
|--------|--------|
| `vercel-labs/agent-skills` | React best practices, web design guidelines |
| `anthropics/skills` | Frontend design, code review |
| `microsoft/github-copilot-for-azure` | Azure services (AI, storage, deployment, etc.) |

## When No Skills Are Found

1. Acknowledge that no existing skill was found
2. Offer to help with the task directly
3. If a reusable pattern emerges, suggest creating a project skill via the `skill-creator` skill

## Check for Updates

Periodically check for skill updates:

```bash
npx skills check
npx skills update
```
