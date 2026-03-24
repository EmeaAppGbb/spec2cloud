# Walkthrough: Documenting a Legacy System (Brownfield — Track B)

A team has a legacy enterprise system with external mainframe dependencies, proprietary middleware, and no local dev environment. They want to plan a cloud-native migration.

## Starting Point
A Java EE application deployed on WebSphere, connected to a DB2 mainframe database and a proprietary ESB (Enterprise Service Bus). No one can run it locally.

## Phase B1: Extract
- **Codebase Scanner:** Java 8, JSF frontend, EJB services, JPA entities
- **Dependency Inventory:** 145 dependencies including proprietary JARs
- **Architecture Mapper:** 3-tier (JSF → EJB → JPA/DB2), ESB integration layer
- **API Extractor:** 23 REST endpoints + 12 SOAP services
- **Data Model Extractor:** 34 JPA entities, complex relationships
- **Test Discovery:** 8% coverage, mostly unit tests for utility classes

🚦 **Human Gate:** Extraction reviewed.

## Phase B2: Spec-Enable
- **PRD generated** — describes 5 major business domains
- **8 FRDs generated** — with "Current Implementation" sections

🚦 **Human Gate:** PRD and FRDs approved.

## Testability Gate

The team assesses:
- ☐ Cannot build locally (requires WebSphere + DB2 + ESB)
- ☐ External dependencies unreachable (mainframe, ESB)
- ☐ API endpoints only accessible in staging
- ☐ JSF UI requires full app server
- ☐ No dev environment config
- ☑ Some unit tests run in isolation

**Decision: Track B** — the app is not testable locally.

## Track B: Behavioral Documentation

For each of the 8 feature areas:

### Feature 1: Customer Management
**Behavioral scenarios** (documentation-only):
```gherkin
@documentation-only @feature-customer
Scenario: Create new customer
  Given an authenticated agent in the CRM module
  When the agent submits the new customer form
  Then a customer record is created in DB2
  And the ESB publishes a CustomerCreated event
```

**Manual verification checklist:**
- [ ] Create customer → record appears in DB2
- [ ] Customer data validates (required fields, formats)
- [ ] ESB event published within 30 seconds
- [ ] Duplicate detection prevents double-creation

**Testability roadmap:**
- Mock ESB with WireMock → Medium effort
- Replace DB2 with PostgreSQL for testing → High effort
- Containerize with Liberty instead of WebSphere → Medium effort

🚦 **Human Gate:** Behavioral docs reviewed per feature.

### Features 2-8: Same process
Each feature gets behavioral scenarios, manual checklists, and testability notes.

## Path Selection

Team selects: **Cloud-Native** (migrate to containers) + **Modernize** (update Java, replace WebSphere)

## Phase A: Assess
- **Cloud-Native:** 4/12 twelve-factor compliance, no containerization, hardcoded config
- **Modernization:** Java 8 → 17, WebSphere → Liberty/Quarkus, JSF → modern frontend

## Phase P: Plan

8 increments planned with behavioral doc updates:

1. **cn-001: Containerize with Liberty** — Updated behavioral docs for container deployment
2. **cn-002: Externalize configuration** — Updated manual checklist for config validation
3. **mod-001: Upgrade to Java 17** — No behavioral changes (internal only)
4. **cn-003: Replace ESB with Azure Service Bus** — Major behavioral doc updates

## Phase 2: Delivery (Track B)

Each increment: update behavioral docs → contracts → implement → manual verification → deploy.

Unit tests are written where possible (isolated business logic). Integration tests are deferred until containerization makes local testing feasible.

**Track Promotion:** After cn-001 (containerization), the team re-assesses testability. Docker containers + Liberty can run locally → promote features to Track A! Green baseline tests can now be generated.

## Result
The enterprise system has comprehensive behavioral documentation, a cloud-native migration plan, and the first containerization increments completed. As testability improves, features graduate from Track B to Track A.

---

[← Brownfield: Testable App](brownfield-testable.md) | [Back to Documentation](../README.md)
