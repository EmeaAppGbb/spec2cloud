# Contributing

## Ways to Contribute

### Create New Skills
The most impactful contribution is creating new skills. Skills follow the [agentskills.io specification](https://agentskills.io/specification).

1. Create a directory in .github/skills/{skill-name}/
2. Add SKILL.md with YAML frontmatter (name, description) and detailed instructions
3. Optionally add references/, scripts/, assets/ subdirectories
4. Test the skill in a real project
5. Submit a PR

Use the skill-creator skill for guidance on creating well-structured skills.

### Build Shell Templates
Create shells for new tech stacks:
1. Fork an existing shell template
2. Replace the stack-specific code (src/, infra/, test configs)
3. Update AGENTS.md Section 7 with your stack's commands
4. Update copilot-instructions.md with your stack's conventions
5. Test the full pipeline end-to-end

### Improve Existing Skills
- Add references/ for additional context
- Improve output format for downstream compatibility
- Add framework-specific detection patterns
- Fix bugs in skill logic

### Publish to skills.sh
Share your skills with the community on [skills.sh](https://skills.sh/).

### Improve Documentation
- Add examples and walkthroughs
- Improve getting-started guides
- Translate documentation

## Development Setup

1. Clone the repo
2. Open in VS Code with Copilot extension
3. Use the Dev Container for a consistent environment
4. Test changes against a real project

## Commit Conventions

- feat: New features or skills
- fix: Bug fixes
- docs: Documentation changes
- refactor: Code restructuring
