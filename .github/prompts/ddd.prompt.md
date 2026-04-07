---
agent: ddd
---
# Domain-Driven Design Modeling

Your task is to create a domain-driven design model for the project and produce text-based diagrams that help the team reason about business boundaries before implementation.

## When to Use `/ddd`

Use this workflow when:
- The product has meaningful business rules, workflows, or lifecycle complexity
- The team needs **bounded contexts**, **aggregates**, or a **ubiquitous language**
- Architecture or data model decisions need stronger domain grounding
- Brownfield reverse engineering has documented the current system, but the domain shape is still unclear
- The team wants a **Mermaid domain diagram** and a **Mermaid database diagram**

Typical timing:
- **Greenfield**: after `specs/prd.md` and `specs/features/*.md` exist, before `/adr` or `/plan`
- **Brownfield**: after `/rev-eng`, before `/modernize`, `/extend`, or major schema changes

## Input Sources

Read and synthesize the best available context:
1. `specs/prd.md`
2. `specs/features/*.md`
3. `specs/docs/**/*` (brownfield technical docs)
4. `specs/adr/*.md` (existing architectural decisions)
5. `AGENTS.md` (coding and architectural standards)
6. Existing code or schema artifacts if needed to resolve ambiguity

## Required Output Files

Create or update `specs/domain/` with these files:

### 1. `specs/domain/proposals.md`

Include:
- **Problem framing** - what part of the business domain is being modeled
- **Observed vs proposed model** (brownfield only)
- **Ubiquitous language glossary** - key domain terms and definitions
- **Subdomain classification** - core, supporting, generic
- **Domain decomposition options** - at least 2 alternatives, prefer 3 when justified
- **Recommended option** with rationale and trade-offs
- **Bounded contexts** - responsibilities, owners, upstream/downstream relationships
- **Aggregate proposals** - roots, invariants, consistency boundaries
- **Domain services and domain events** where they clarify behavior
- **ADR candidates** - decisions that should be formalized next
- **Open questions / assumptions**

### 2. `specs/domain/domain-model.md`

Include:
- A **Mermaid context map** showing bounded contexts and relationships
- A **Mermaid domain model diagram** showing aggregates, entities, and value objects
- Narrative notes for:
  - business invariants
  - lifecycle/state transitions
  - anti-corruption layers, shared kernels, or published language patterns when needed
  - where application services orchestrate versus where domain logic belongs

Use Mermaid diagrams that render well in GitHub. Prefer:
- `flowchart` or `graph` for context maps
- `classDiagram` or `flowchart` for aggregate/domain structure

### 3. `specs/domain/database-model.md`

Include:
- **Persistence strategy** - relational, document, or hybrid rationale
- **Aggregate-to-storage mapping**
- **Mermaid ER diagram** for the proposed database model
- Notes on:
  - transactional boundaries
  - consistency expectations
  - idempotency or outbox patterns when relevant
  - read/write separation when justified

## Modeling Guidance

### Strategic DDD
- Start with business capabilities, not tables or APIs
- Identify the **core domain** first
- Keep bounded contexts large enough to be meaningful and small enough to stay cohesive
- Avoid inventing extra contexts when a modular monolith model is sufficient

### Tactical DDD
- Model aggregates around invariants and consistency rules
- Use **entities** for identity-bearing concepts
- Use **value objects** for immutable descriptive concepts
- Introduce **domain services** only when behavior does not belong naturally inside an aggregate or value object
- Use **domain events** when they clarify important business transitions

### Brownfield Rules
- Document what exists before recommending what should change
- Be explicit when the current implementation violates or blurs domain boundaries
- Distinguish:
  - **Observed structure**
  - **Recommended refactoring target**

### Database Modeling Rules
- The database model must support the domain model rather than override it
- Do not normalize away aggregate boundaries without explanation
- If the product is simple CRUD, say so and keep the model simple
- If the storage strategy is ambiguous, state the assumption explicitly

## Quality Checklist

Before finishing, verify:
- ✅ `specs/domain/proposals.md` exists and contains clear domain proposals
- ✅ `specs/domain/domain-model.md` contains Mermaid DDD diagrams
- ✅ `specs/domain/database-model.md` contains a Mermaid ER diagram
- ✅ Bounded contexts map back to PRD/FRD capabilities
- ✅ Aggregate boundaries are justified by business invariants
- ✅ Database structures are explained in terms of domain behavior
- ✅ Brownfield outputs clearly separate observed vs proposed
- ✅ Assumptions and open questions are explicit

## Success Criteria

You are done when the repository contains a usable DDD package that:
- Gives architects better input for ADRs
- Gives developers a clearer model for implementation planning
- Gives stakeholders readable, text-based diagrams they can review in Git
- Connects the domain model to the proposed database structure without implementation code
