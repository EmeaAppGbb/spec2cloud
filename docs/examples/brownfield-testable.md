# Walkthrough: Modernizing an Express API (Brownfield — Track A)

A team has a legacy Express.js API (Node 14, JavaScript, minimal tests) and wants to modernize it. The app can be built and run locally.

## Starting Point
An Express API with 45 routes, MongoDB via Mongoose, no TypeScript, 12% test coverage.

## Phase B1: Extract
- **Codebase Scanner:** Node.js 14, Express 4.17, MongoDB/Mongoose, 3 middleware layers
- **Dependency Inventory:** 67 dependencies, 12 vulnerable, 8 deprecated
- **Architecture Mapper:** Monolithic, 3 layers (routes → services → models)
- **API Extractor:** 45 REST endpoints documented, 7 undocumented
- **Data Model Extractor:** 8 Mongoose models, 3 with no indexes
- **Test Discovery:** 12% coverage, integration tests only

🚦 **Human Gate:** Extraction reviewed — accurate.

## Phase B2: Spec-Enable
- **PRD generated** from codebase analysis
- **6 FRDs generated**, each with "Current Implementation" documenting how features work today

🚦 **Human Gate:** PRD and FRDs approved.

## Testability Gate

The team assesses:
- ☑ Can build and start locally (`npm start` works)
- ☑ MongoDB runs in Docker (`docker-compose up`)
- ☑ API endpoints return responses
- ☐ No frontend (API only)
- ☑ Dev environment config exists (`.env.development`)
- ☑ Existing tests run (`npm test` — 12 pass)

**Decision: Track A** — the app is testable.

## Track A: Green Baseline

For each of the 6 feature areas:

### Feature 1: Authentication
1. **Gherkin capture:** 12 scenarios describing login, logout, token refresh, password reset as they work today. Tagged `@existing-behavior`.
2. **Test scaffolding:** Cucumber steps + Supertest API tests. All target current behavior.
3. **Green verification:** All 12 tests pass against the running app.

🚦 **Human Gate:** Gherkin reviewed — accurate.

### Features 2-6: Same process
User management (8 scenarios), Search (6), Orders (14), Notifications (4), Admin (7).

**Total green baseline: 51 scenarios, all passing.** This is the regression safety net.

## Path Selection

Team selects: **Modernize** (update deps, add TypeScript) + **Security** (fix vulnerabilities)

## Phase A: Assess
- **Modernization:** Node 14 EOL, 8 deprecated packages, callback patterns, missing error handling
- **Security:** 12 vulnerable deps, 3 injection risks, missing rate limiting

## Phase P: Plan with Behavioral Deltas

4 increments planned, each with Gherkin deltas:

1. **sec-001: Patch critical vulnerabilities**
   - Gherkin deltas: 3 new scenarios for injection prevention
   - 51 existing scenarios must still pass

2. **mod-001: Migrate to TypeScript**
   - Gherkin deltas: 0 new (behavior unchanged)
   - 51 existing + 3 security scenarios must pass

3. **mod-002: Update to Node 20 + Express 5**
   - Gherkin deltas: 2 modified (API behavior changes slightly)
   - All existing scenarios must pass

4. **mod-003: Add comprehensive test coverage**
   - Gherkin deltas: 24 new scenarios for uncovered paths
   - All existing scenarios must pass

## Phase 2: Delivery

Each increment: update Gherkin → update tests → contracts → implement → deploy.

The green baseline catches any regressions — if modernization breaks existing behavior, the tests fail immediately.

## Result
The legacy API now has TypeScript, Node 20, Express 5, patched vulnerabilities, 80%+ test coverage — without a full rewrite. Every change was verified against the green baseline.

---

[← Greenfield Walkthrough](greenfield-walkthrough.md) | [Brownfield: Non-Testable App →](brownfield-doc-only.md)
