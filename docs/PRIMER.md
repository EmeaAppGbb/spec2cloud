# spec2cloud Primer

## What is spec2cloud?

spec2cloud is a framework that transforms product specifications into deployed cloud applications using AI-powered skills. It works in two directions:

 AI builds, tests, and deploys
 modernize, extend, or rewrite

## Core Concepts

### Skills

Reusable, specialized procedures stored in `.github/skills/` following the [agentskills.io](https://agentskills.io) standard. Each skill has a `SKILL.md` with instructions, references, and optional scripts. spec2cloud ships with **43 skills** (22 greenfield, 20 brownfield, plus `find-skills`).

### The Ralph Loop

A single orchestrator drives all work in an 11-step loop:

1. Read state
2. Decide next action
3. Check available skills
4. Research (if needed)
5. Execute the skill
6. Verify the result
7. Update state
8. Repeat

Every action is logged. Every state change is committed to git.

### State Management

- **`.spec2cloud/state. tracks exactly where you are in the pipelinejson`** 
- **`.spec2cloud/audit. records everything that happenedlog`** 
- **`.spec2cloud/models. model assignments per rolejson`** 

All state files are committed to git, enabling resume from any interruption.

### Human Gates

The orchestrator pauses for human approval at critical  phase boundaries, deployment decisions, and path selection. Nothing ships without sign-off.transitions 

### ADRs

Architecture Decision Records are first-class artifacts in both greenfield and brownfield flows. They track every significant choice with context, options considered, rationale, and consequences. Stored in `specs/adrs/`.

---

## Greenfield Flow

```
 tech stack resolution
 Azure deployment)
```

**Phase  Discovery**: PRD authoring, FRD breakdown, UI/UX prototyping, tech stack ADRs, increment planning.1 

 Azure deployment. Human gates between increments.

## Brownfield Flow

```
 delivery pipeline
```

**Phase  Extraction**: Codebase scanner produces factual  technology inventory, architecture map, dependency catalog, test coverage. No opinions, just facts.documentation B1 

**Phase  Spec Generation**: PRD and FRDs are generated from extraction data. FRDs include "Current Implementation" sections documenting what exists today.B2 

**Phase  Path Selection**: The user chooses one or more paths:B3 

| Path | Purpose |
|------|---------|
| **Modernize** | Upgrade frameworks, dependencies, patterns |
| **Rewrite** | Replace components with new implementations |
| **Cloud-Native** | Containerize, add managed services, scale |
| **Extend** | Add new features to existing codebase |
| **Fix** | Address bugs, tech debt, reliability |
| **Security** | Harden authentication, authorization, data protection |
| **Performance** | Optimize latency, throughput, resource usage |

Each selected path gets a targeted assessment with ADRs, then flows into the same delivery pipeline as greenfield.

---

## Getting Started

1. **Pick a shell template** (greenfield) or **install into an existing project** (brownfield)
2. **Write a PRD** (greenfield) or **run extraction** (brownfield)
3. **Follow the  the orchestrator guides you through each phase, pausing at human gates for your approvalpipeline** 
