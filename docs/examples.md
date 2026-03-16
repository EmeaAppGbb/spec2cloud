# Examples

## Greenfield: Building a Task Management App

### 1. Write a PRD
Create specs/prd.md describing your task management application.

### 2. Phase 1: Product Discovery
The orchestrator runs through:
- Spec refinement (5 review passes through product + technical lenses)
- UI/UX design (interactive HTML prototypes served via HTTP)
- Increment planning (walking skeleton first, then features by dependency)
- Tech stack resolution (every technology researched, ADRs generated)

### 3. Phase 2: Increment Delivery
For each increment:
- Tests scaffolded (e2e + Gherkin + unit) — red baseline verified
- API contracts generated from Gherkin scenarios
- Implementation: API slice → Web slice → Integration slice
- Full regression, Azure deployment, smoke tests

## Brownfield: Modernizing a Legacy Express App

### 1. Install spec2cloud
```
curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/vNext/scripts/quick-install.sh | bash
```

### 2. Phase B1: Extract
The orchestrator scans your codebase and produces factual documentation:
- Stack: Express 4.18, React 17, PostgreSQL
- Architecture: Monolith, MVC pattern, 3 layers
- Dependencies: 47 direct, 12 dev
- Tests: 23 Jest unit tests, no e2e tests
- APIs: 15 endpoints across 4 route files

### 3. Phase B2: Spec-Enable
PRD and FRDs generated from extraction. Each FRD includes "Current Implementation" documenting existing code.

### 4. Choose Path
You select: Modernize + Cloud-Native

### 5. Phase A: Assess
- Modernization assessment: 3 critical (Express 4 → 5, React 17 → 19, Node 16 → 20), 8 high, 15 medium
- Cloud-native assessment: No Dockerfile, hardcoded config, no health checks, no structured logging
- ADRs generated: "Express upgrade vs Fastify migration", "Container Apps vs AKS"

### 6. Phase P: Plan
12 increments planned:
- mod-001: Upgrade Node.js 16 → 20
- mod-002: Upgrade Express 4 → 5
- cn-001: Add Dockerfile and health checks
- cn-002: Externalize configuration
- ...

### 7. Phase 2: Deliver
Each increment goes through tests → implementation → deployment. After each, the app works.

## Bug Fix Example

A user reports: "Login fails when email contains a plus sign"

The bug-fix skill:
1. Links to FRD: frd-auth.md
2. Creates failing test: it("should authenticate user with + in email")
3. Fixes the email validation regex
4. Runs full regression — all 47 tests pass
5. Commits: [bugfix] frd-auth: fix email validation for plus signs

## ADR Example

During tech stack resolution, the orchestrator generates:

**ADR-003: API Framework**
- Context: Current app uses Express 4.18, which needs upgrade
- Options: Express 5 (familiar, incremental) vs Fastify (faster, modern) vs Hono (edge-ready)
- Decision: Express 5 — team familiarity, migration effort is minimal
- Consequences: Straightforward upgrade path, keep existing middleware
