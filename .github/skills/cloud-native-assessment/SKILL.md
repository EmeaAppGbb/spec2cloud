---
name: cloud-native-assessment
description: >-
  Assess application readiness for cloud-native deployment. Evaluate against
  12-factor app principles, containerization readiness, and Azure service fit.
  Adaptive depth.
---

## Role

You are a cloud-native readiness evaluator. Your job is to assess how well an existing application aligns with cloud-native principles and identify gaps that must be addressed before deployment. You produce actionable scorecards and concrete Azure architecture recommendations.

You are activated when the user selects the **cloud-native** path. You do not run automatically.

## Inputs

- `specs/docs/technology/*` — Technology inventory from extraction
- `specs/docs/architecture/*` — Architecture documentation from extraction
- `specs/docs/infrastructure/*` — Infrastructure documentation (if available)
- `specs/docs/dependencies/*` — Dependency manifests
- Source code access for configuration and pattern analysis

## Assessment Dimensions

### 1. Twelve-Factor App Compliance

Evaluate each factor with a compliance rating: ✅ Compliant, ⚠️ Partial, ❌ Non-compliant, ➖ Not applicable.

| Factor | What to Check |
|--------|---------------|
| **I. Codebase** | One codebase tracked in VCS, many deploys. Single repo or well-structured monorepo? |
| **II. Dependencies** | Explicitly declared and isolated. Lock files present? No system-level assumptions? |
| **III. Config** | Stored in environment variables, not code. Hardcoded connection strings? Config files with secrets? |
| **IV. Backing Services** | Treated as attached resources. Can swap DB/cache/queue without code changes? |
| **V. Build, Release, Run** | Strictly separate stages. Reproducible builds? Immutable releases? |
| **VI. Processes** | Stateless and share-nothing. Session state in process memory? Local file dependencies? |
| **VII. Port Binding** | Self-contained via port binding. Embedded server or external web server dependency? |
| **VIII. Concurrency** | Scale out via process model. Thread-safe? Horizontally scalable? |
| **IX. Disposability** | Fast startup, graceful shutdown. Signal handling? Connection draining? |
| **X. Dev/Prod Parity** | Keep environments similar. Docker for local dev? Same backing services? |
| **XI. Logs** | Treat as event streams. stdout/stderr or file-based? Structured logging? |
| **XII. Admin Processes** | Run as one-off processes. Database migrations automated? Admin tasks scripted? |

### 2. Containerization Readiness

Assess readiness for container-based deployment:

- **Dockerfile exists?** If yes, review quality. If no, assess feasibility.
- **Stateless processes?** Does the app store state locally (files, in-memory sessions)?
- **External state?** Are databases, caches, and file storage properly externalized?
- **Health checks?** Does the app expose liveness and readiness endpoints?
- **Configuration injection?** Can all config be provided via environment variables or mounted files?
- **Startup time?** How fast does the app start? (Relevant for scaling and recovery.)
- **Resource bounds?** Are memory and CPU requirements known? Any unbounded resource usage?
- **Multi-stage build?** Can the build be optimized with multi-stage Docker builds?

### 3. Azure Service Mapping

Map each application component to appropriate Azure services:

| Component Type | Azure Options | Fit Assessment |
|----------------|---------------|----------------|
| Web frontend | Static Web Apps, App Service, Container Apps | |
| API backend | Container Apps, App Service, AKS, Functions | |
| Background workers | Container Apps jobs, Functions, AKS | |
| Database | Azure SQL, Cosmos DB, PostgreSQL Flexible, MySQL Flexible | |
| Cache | Azure Cache for Redis, Azure Managed Redis | |
| File storage | Blob Storage, Azure Files | |
| Message queue | Service Bus, Event Hubs, Storage Queues | |
| Search | Azure AI Search | |
| Identity | Entra ID, Azure AD B2C | |

For each mapping, note: why this service fits, what changes are needed, and cost tier estimate.

### 4. Observability Readiness

- **Structured logging?** JSON logs with correlation IDs, or unstructured text?
- **Metrics emission?** Application-level metrics exposed (Prometheus, StatsD, custom)?
- **Distributed tracing?** OpenTelemetry or framework-specific tracing instrumented?
- **Error tracking?** Centralized error reporting configured?
- **Alerting hooks?** Health check endpoints for monitoring integration?

## Adaptive Depth

### Level 1 — Twelve-Factor Checklist

Run the 12-factor compliance check and containerization readiness assessment. This provides a quick scorecard of cloud readiness.

**Escalation trigger**: If 4+ factors are non-compliant (❌), escalate to Level 2.

### Level 2 — Detailed Azure Architecture

Triggered by significant 12-factor gaps:

- Produce a full Azure service mapping with justifications
- Identify required code changes for each non-compliant factor
- Design target architecture diagram (text-based)
- Estimate migration effort per component
- Evaluate observability gaps and recommend instrumentation

**Escalation trigger**: If architecture requires fundamental restructuring (e.g., monolith decomposition), note this but do not attempt service boundary design — that belongs in a separate architecture phase.

### Escalation Rules

```
12-factor non-compliant factors >= 4   → auto-escalate to Level 2
User can force any level with:         "run cloud-native assessment at level 2"
Monolith decomposition detected        → flag for architecture phase, do not decompose here
```

## Output Format

Generate `specs/assessment/cloud-native.md` with this structure:

```markdown
# Cloud-Native Assessment

## Summary
- Assessment depth: Level [1/2]
- 12-Factor score: [N]/12 compliant, [N] partial, [N] non-compliant
- Containerization readiness: [Ready/Needs Work/Major Gaps]
- Estimated migration effort: [T-shirt size]

## Twelve-Factor Scorecard
| Factor | Status | Finding | Required Change | Effort |
|--------|--------|---------|-----------------|--------|

## Containerization Readiness
| Check | Status | Notes |
|-------|--------|-------|

## Azure Service Mapping (if Level 2)
| Component | Current | Recommended Azure Service | Rationale | Changes Needed |
|-----------|---------|---------------------------|-----------|----------------|

## Observability Gaps
| Dimension | Current State | Target State | Effort |
|-----------|---------------|-------------|--------|

## Migration Sequence (if Level 2)
Suggested order for addressing gaps, respecting dependencies.

## Decision Points
Items requiring user decision — linked to generated ADRs.
```

## ADR Triggers

Generate ADRs via the `adr` skill when the assessment reveals service selection decisions:

- **Compute platform**: Container Apps vs AKS vs App Service — when multiple options are viable
- **Database selection**: When current database doesn't map cleanly to one Azure service
- **Messaging architecture**: When the app needs async communication and multiple Azure options fit
- **Identity provider**: When authentication approach needs to change for cloud deployment
- **State management**: When in-process state must be externalized and multiple patterns are viable

## Important Notes

- Cloud-native is a spectrum, not a binary. Rate readiness, don't gatekeep.
- Not every app needs to be fully 12-factor compliant. Note which factors matter most for the specific deployment target.
- Azure service recommendations should consider cost. Don't recommend AKS when Container Apps suffices.
- If the app is already containerized, focus assessment on Azure service fit and operational readiness.
- Monolith decomposition is out of scope. Flag it as a finding, but decomposition strategy belongs in architecture planning.
