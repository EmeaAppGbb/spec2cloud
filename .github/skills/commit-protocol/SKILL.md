---
name: commit-protocol
description: Create standardized git commits at phase and increment boundaries. Defines commit procedures, message formats, and state bundling. Use when committing after phase completion, increment delivery, or slice implementation.
---

# Commit Protocol

At key checkpoints, create commits that bundle artifacts produced. This gives a clean, resumable history in `git log`.

## Commit Procedure

After a step or phase completes (and human gate approved, where applicable):

```
1. Stage all changes:
     git add -A
2. Commit with an appropriate tag (see table below).
3. Update state.json to reflect the new state.
4. Append an entry to audit.log.
5. Commit the state update:
     git add .spec2cloud/ && git commit -m "spec2cloud: state update"
```

## Commit Messages

| Event | Commit Message |
|-------|---------------|
| Shell setup | `[phase-0] Shell setup complete` |
| Product discovery | `[phase-1] Product discovery complete — N FRDs, N screens, N increments, tech stack resolved` |
| Increment tests | `[increment] {id}/tests — test scaffolding complete` |
| Increment contracts | `[increment] {id}/contracts — contracts generated` |
| Increment slice | `[impl] {id}/{slice} — slice green` |
| Increment all tests green | `[impl] {id} — all tests green` |
| Increment delivered | `[increment] {id} — delivered` |
| All increments complete | `[release] All increments delivered — product complete` |

## Why Increment-Level Commits

Each increment is a self-contained delivery. Commits at increment boundaries mean:
- `git log --oneline --grep="\[increment\]"` shows the delivery timeline
- Each delivered increment is a revertable, deployable unit
- Mid-increment commits at slice granularity create resumable checkpoints

## Mandatory Completion Checklist

The orchestrator MUST verify ALL of the following for every commit:

- [ ] Commit message follows the format table above (correct prefix for the phase/step)
- [ ] `.spec2cloud/state.json` is included in the commit
- [ ] `.spec2cloud/audit.log` is included in the commit
- [ ] No secrets, `.env` files, or `node_modules` are staged
- [ ] Co-authored-by trailer is present

**BLOCKING**: A commit without state.json and audit.log breaks resume capability. The orchestrator must include them before finalizing the commit.
