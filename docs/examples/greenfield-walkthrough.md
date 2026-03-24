# Walkthrough: Building a Task Management App (Greenfield)

A team wants to build a task management application with boards, lists, cards, and collaboration — deployed on Azure.

## Starting Point
A one-page PRD describing a task management app.

## Phase 0: Shell Setup
Clone `shell-typescript`. Get a scaffold with Next.js, Express, Playwright, Cucumber, Vitest, and Bicep pre-configured.

## Phase 1a: Spec Refinement
The orchestrator reviews the PRD. After 3 passes:
- Missing edge cases identified (1000+ cards on a board?)
- Permission model clarified (edit vs. view)
- PRD split into 4 FRDs: Board Management, Card Operations, Team Collaboration, Notifications

🚦 **Human Gate:** Team approves refined specs.

## Phase 1b: UI/UX Design
HTML prototypes generated: board view, card modal, team settings, notification panel. Served on localhost.

🚦 **Human Gate:** Approved with mobile layout feedback.

## Phase 1c: Increment Planning
3 increments:
1. Walking skeleton — Board CRUD + single card (proves architecture)
2. Full cards — Drag-and-drop, due dates, labels, attachments
3. Collaboration — Team members, permissions, notifications

## Phase 1d: Tech Stack
Researched and documented as ADRs: Next.js 14, Express + Prisma, PostgreSQL on Azure, Container Apps.

🚦 **Human Gate:** Tech stack approved.

## Phase 2, Increment 1: Walking Skeleton

**Step 1 — Tests:**
- 8 Playwright e2e specs, 12 Gherkin scenarios, 24 Vitest stubs
- All fail (red baseline ✅)

🚦 **Human Gate:** Gherkin approved.

**Step 2 — Contracts:**
- OpenAPI: 6 endpoints (boards + cards CRUD)
- TypeScript types: Board, Card, User DTOs
- Bicep: Container App + PostgreSQL

**Step 3 — Implementation:**
- API + Web slices in parallel
- Integration wires them together
- All 44 tests pass 🟢

🚦 **Human Gate:** PR approved.

**Step 4 — Deploy:**
- `azd up` provisions Azure
- Smoke tests pass
- Full e2e regression green on production URL

## Result
Working task management app live on Azure after Increment 1. Two more increments follow the same cycle.

---

[← Back to Examples](../examples/) | [Brownfield: Testable App →](brownfield-testable.md)
