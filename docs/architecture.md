# Architecture

How spec2cloud works under the hood.

## The Ralph Loop

![The Ralph Loop orchestrator](assets/ralph-loop.svg)

The orchestrator is a single monolithic process that runs in a repeating cycle called the Ralph Loop. This 11-step loop is the heartbeat of spec2cloud, automating the journey from specification to deployed cloud service. Each iteration determines what task needs to happen next, finds or creates the appropriate skill to handle it, executes the work, validates the outcome, and advances the workflow state.

The loop maintains deterministic progress through a state file (`.spec2cloud/state.json`) that tracks exactly where you are in the discovery and delivery phases. After each step, the state is committed to git, creating an auditable trail of all decisions and actions taken.

Here are the 11 steps:

1. **Read State** — Load `.spec2cloud/state.json` to determine current phase, completed tasks, and next objective
2. **Determine Task** — Identify what needs to happen next based on phase goal and current blockers
3. **Check Local Skills** — Look in `.github/skills/` for a matching skill or agent prompt
4. **Search Community** — Query skills.sh registry for community-contributed skills if local match not found
5. **Research Practices** — Use MCP tools and Claude for best practices, architecture patterns, or technical guidance
6. **Execute Task** — Run the selected skill, passing context from state.json and git history
7. **Verify Outcome** — Validate the result meets quality gates (tests pass, contracts are satisfied, code compiles)
8. **Create Skill?** — If a new reusable pattern emerged during execution, extract and save it as a skill
9. **Update State** — Write `state.json`, append to `audit.log`, git commit with descriptive message
10. **Phase Complete?** — Check if all goals for the current phase are met
11. **Human Gate / Advance** — Pause for human approval at phase boundaries, or continue to next step

## State Persistence

![State Management](assets/state-management.svg)

All state lives in the `.spec2cloud/` directory. This distributed state machine design eliminates the need for external databases and makes progress portable, shareable, and audit-friendly.

**Key files:**

- **state.json** — Current position snapshot: current phase, completed tasks, feature list, increment plan, deployed versions
- **audit.log** — Append-only action history: every decision, execution, and outcome
- **models.json** — AI model assignments: which agent uses which model (GPT-4, Claude, etc.)

State is committed to git after every action. This means:

- **Resume from any interruption point** — If the workflow pauses, stops, or crashes, rerun the orchestrator and it picks up exactly where it left off
- **Share progress via git push/pull** — Collaborate across teams by sharing the same repository
- **Full audit trail through git history** — `git log` shows every state transition with timestamps and context
- **No external databases required** — Everything is version-controlled and reproducible

## Agents & Prompts

**10 Specialized Agents:**

@spec2cloud (orchestrator), @pm, @devlead, @architect, @planner, @dev, @azure, @tech-analyst, @modernizer, @extender

**12 Interactive Prompts:**

/prd, /frd, /plan, /implement, /delegate, /deploy, /rev-eng, /modernize, /extend, /adr, /generate-agents, /bootstrap-agents

## Directory Structure

```
.github/
├── skills/              — 43 agentskills.io skills (reusable workflow components)
├── agents/              — 10 Copilot agents (specialized personalities)
└── prompts/             — 12 workflow prompts (interactive entry points)

.spec2cloud/            — State persistence
├── state.json          — Current workflow state
├── audit.log           — Action history
└── models.json         — Agent-to-model assignments

specs/                  — Generated specifications
├── prd.md              — Product requirements document
├── frd.md              — Feature requirements documents
├── increment-plan.md   — Phased delivery roadmap
└── architecture/       — Technical design documents
```

The skills and agents together form a library of reusable knowledge. Skills are tasks (test, build, deploy), while agents are conversational personalities (architect, developer, PM). Prompts orchestrate the workflow by invoking the right agents and skills at the right time.
