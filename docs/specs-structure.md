# Specification Structure

spec2cloud uses a structured specification directory to maintain traceability from requirements through implementation.

## Directory Layout

```
specs/
  prd.md                        # Product Requirements Document
  frd-{feature}.md              # Feature Requirement Documents (one per feature)
  increment-plan.md             # Ordered list of delivery increments
  tech-stack.md                 # Resolved technology choices

  features/                     # Gherkin feature files
    {feature}.feature

  contracts/                    # API and type contracts
    api-{feature}.yaml          # OpenAPI specifications
    types/                      # Shared type definitions

  adrs/                         # Architecture Decision Records
    adr-001-{slug}.md
    adr-002-{slug}.md

  assessment/                   # Assessment outputs (brownfield, per path)
    modernization.md
    rewrite.md
    cloud-native.md
    security.md
    performance.md

  docs/                         # Extraction outputs (brownfield)
    technology/
      stack.md                  # Language/framework inventory
      dependencies.md           # Complete dependency catalog
    architecture/
      overview.md               # System architecture map
      components.md             # Component relationships
      data-models.md            # Database schemas, ERDs
    testing/
      coverage.md               # Existing test catalog

  ui/                           # UI/UX artifacts
    prototypes/                 # HTML wireframe prototypes
    screen-map.md               # Screen inventory
    design-system.md            # Design tokens
    components.md               # Component inventory
```

## Greenfield vs Brownfield

In greenfield projects, specs are authored by humans and refined by AI:

- Human writes `prd.md`
- `spec-refinement` skill reviews and improves
- PRD is broken into `frd-{feature}.md` files

In brownfield projects, specs are extracted from code:

- `codebase-scanner` and other extraction skills populate `specs/docs/`
- `prd-generator` creates `prd.md` from extraction data
- `frd-generator` creates `frd-{feature}.md` with "Current Implementation" sections

## ADRs

Architecture Decision Records are stored in `specs/adrs/` and tracked in `.spec2cloud/state.json`. They follow a standard format:

- ** Why this decision is neededContext** 
- **Options  What alternatives were evaluatedConsidered** 
- ** What was chosen and whyDecision** 
- ** What follows from this decisionConsequences** 

ADRs are generated at technology choices, path decisions, and significant implementation decisions in both greenfield and brownfield flows.

## Traceability Chain

```
 Deployment
```

Every artifact links back to its source. The `spec-validator` skill verifies this chain is complete and consistent.
