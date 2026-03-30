---
name: audit-log
description: Append structured entries to .spec2cloud/audit.log for every significant action. Never overwrite, always append. Use when logging task execution, increment transitions, human gate events, or errors.
---

# Audit Log Protocol

Append every significant action to `.spec2cloud/audit.log`. Never overwrite — always append.

## Format

```
[ISO-timestamp] phase=PHASE action=ACTION result=RESULT
```

## What to Log

### Every task execution

```
[2026-02-09T14:15:00Z] increment=resource-crud step=implementation slice=api iteration=1 action=write-code result=tests-3pass-2fail
```

### Every increment transition

```
[2026-02-09T14:30:00Z] increment=walking-skeleton action=increment-delivered result=transition-to-resource-crud
```

### Every human gate event

```
[2026-02-09T14:35:00Z] increment=resource-crud step=tests action=human-gate result=gherkin-approved
[2026-02-09T14:35:00Z] phase=discovery step=specs action=human-gate result=rejected feedback="missing error states for auth"
```

### Every error

```
[2026-02-09T14:40:00Z] phase=deployment action=azd-provision result=error message="quota exceeded in eastus"
```

## Mandatory Completion Checklist

Every audit log entry MUST contain ALL of the following fields:

- [ ] ISO-8601 timestamp (e.g., `2026-02-09T14:40:00Z`)
- [ ] Context identifier: `phase=` or `increment=` (what work is being done)
- [ ] `action=` field (what specific action was taken)
- [ ] `result=` field (outcome: `done`, `error`, `approved`, `rejected`, etc.)
- [ ] `message=` field for errors and rejections (human-readable detail)

**BLOCKING**: An audit entry missing any required field makes the audit trail incomplete. The orchestrator must ensure every append follows this schema.
