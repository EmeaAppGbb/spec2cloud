# Workflows

## Greenfield Workflow (Forward: Idea → Code)

```mermaid
graph TB
    Start[("👤 User<br/>High-level app description")]

    Start --> PRD["<b>/prd</b><br/>📝 PM Agent creates<br/>Product Requirements Document"]

    PRD --> FRD["<b>/frd</b><br/>📋 PM Agent breaks down<br/>Feature Requirements Documents"]

    FRD --> DDD["<b>/ddd</b><br/>🧭 DDD Agent proposes<br/>bounded contexts + data model"]

    DDD --> GenAgents["<b>/generate-agents</b><br/>📦 Dev Lead reads standards<br/>Generates AGENTS.md"]

    GenAgents --> Plan["<b>/plan</b><br/>🔧 Dev Agent creates<br/>Technical Task Breakdown"]

    Plan --> Choice{"Implementation<br/>Choice"}

    Choice -->|Local| Implement["<b>/implement</b><br/>💻 Dev Agent<br/>implements code locally"]

    Choice -->|Delegated| Delegate["<b>/delegate</b><br/>🎯 Dev Agent creates<br/>GitHub Issue + assigns<br/>Copilot Coding Agent"]

    Implement --> Deploy["<b>/deploy</b><br/>☁️ Azure Agent<br/>creates IaC + deploys to Azure"]

    Delegate --> Deploy

    Deploy --> Done[("✅ Production-Ready<br/>Application on Azure")]

    style Start fill:#e1f5ff
    style PRD fill:#fff4e6
    style FRD fill:#fff4e6
    style DDD fill:#e8f0fe
    style GenAgents fill:#e3f2fd
    style Plan fill:#e8f5e9
    style Implement fill:#e8f5e9
    style Delegate fill:#e8f5e9
    style Deploy fill:#f3e5f5
    style Done fill:#e1f5ff
    style Choice fill:#fff9c4
```

## Brownfield Workflow (Reverse: Code → Documentation → Evolution)

```mermaid
graph TB
    StartBrown[("📦 Existing Codebase<br/>Undocumented or<br/>poorly documented")]

    StartBrown --> RevEng["<b>/rev-eng</b><br/>📋 Reverse Engineering Agent<br/>Analyzes code & documents<br/>current state + extension points"]

    RevEng --> DDDReverse["<b>/ddd</b><br/>🧭 DDD Agent proposes<br/>domain + database model"]

    DDDReverse --> Choice{"Evolution<br/>Choice"}

    Choice -->|Improve Quality| Modernize["<b>/modernize</b><br/>🔧 Modernization Agent<br/>Plans technical improvements"]

    Choice -->|Add Features| Extend["<b>/extend</b><br/>✨ Extension Agent<br/>Plans new capabilities"]

    Modernize --> Plan["<b>/plan</b><br/>💻 Developer Agent<br/>Implements changes"]

    Extend --> Plan

    Plan --> Deploy["<b>/deploy</b><br/>☁️ Azure Agent<br/>creates IaC + deploys to Azure"]

    Deploy --> Done[("✅ Evolved Application<br/>Modernized and/or Extended<br/>on Azure")]

    RevEng --> DocOnly[("📚 Documentation Only<br/>Comprehensive technical docs")]

    style StartBrown fill:#ffe0b2
    style RevEng fill:#e8f5e9
    style DDDReverse fill:#e8f0fe
    style Choice fill:#fff9c4
    style Modernize fill:#e3f2fd
    style Extend fill:#f3e5f5
    style Plan fill:#e8f5e9
    style Deploy fill:#f3e5f5
    style Done fill:#e1f5ff
    style DocOnly fill:#e1f5ff
```

## Greenfield Workflow Steps (Forward)

1. **`/prd`** - Product Requirements Document
   - PM Agent engages in conversation to understand the product vision
   - Creates `specs/prd.md` with goals, scope, requirements, and user stories
   - Living document that evolves with feedback

2. **`/frd`** - Feature Requirements Documents
   - PM Agent decomposes the PRD into individual features
   - Creates files in `specs/features/` for each feature
   - Defines inputs, outputs, dependencies, and acceptance criteria

3. **`/ddd`** - Domain Modeling (Optional, recommended for business-heavy domains)
   - DDD Agent creates `specs/domain/proposals.md`
   - Creates Mermaid domain diagrams in `specs/domain/domain-model.md`
   - Creates Mermaid database diagrams in `specs/domain/database-model.md`

4. **`/generate-agents`** - Generate Agent Guidelines (Optional)
   - Dev Lead Agent reads all standards from `standards/` directory
   - Consolidates engineering standards into comprehensive `AGENTS.md`
   - Can be run at project start or deferred until before `/plan` and `/implement`
   - **Must be completed before planning and implementation begins**

5. **`/plan`** - Technical Planning
   - Dev Agent analyzes FRDs and creates technical task breakdowns
   - Creates files in `specs/tasks/` with implementation details
   - Identifies dependencies, estimates complexity, defines scaffolding needs

6. **`/implement`** OR **`/delegate`** - Implementation
   - **Option A (`/implement`)**: Dev Agent writes code directly in `src/backend` and `src/frontend`
   - **Option B (`/delegate`)**: Dev Agent creates GitHub Issues with full task descriptions and assigns to GitHub Copilot Coding Agent

7. **`/deploy`** - Azure Deployment
   - Azure Agent analyzes the codebase
   - Generates Bicep IaC templates
   - Creates GitHub Actions workflows for CI/CD
   - Deploys to Azure using Azure Dev CLI and MCP tools

## Brownfield Workflow Steps (Reverse)

1. **`/rev-eng`** - Reverse Engineer Codebase
   - Reverse Engineering Agent analyzes existing codebase
   - Creates technical documentation, feature requirements, and current state analysis
   - **NEW**: Identifies extension points, capability gaps, and integration opportunities
   - Follows strict rules to ensure accuracy and honesty about existing functionality
    - **Critical Rules**:
      - ⚠️ **NEVER modifies code** - Read-only analysis
      - ⚠️ **Documents ONLY what exists** - No fabrication
      - ⚠️ **Honest about gaps** - Notes missing tests, incomplete features
      - Links each finding to actual code files and implementations
    - **Output supports two pathways**: Modernization OR Extension

2. **`/ddd`** - Domain Modeling (Optional)
   - DDD Agent reads reverse-engineered documentation and feature specifications
   - Creates bounded-context proposals plus Mermaid domain and database diagrams in `specs/domain/`
   - Clarifies aggregate boundaries before modernization or extension work

3. **`/modernize`** - Create Modernization Plan (Option A)
   - Modernization Agent assesses existing codebase for technical improvements
   - Creates files in `specs/modernize/` with modernization analysis
   - Creates files in `specs/tasks/` with specific modernization tasks
   - Develops risk assessment and mitigation strategies
   - **Focus**: Technical debt, security, performance, architecture improvements
   - **Critical Rules**:
     - ⚠️ **NEVER modifies code** - Read-only analysis
     - ⚠️ **Evidence-based** - Recommendations based on actual code quality
     - ⚠️ **Honest about feasibility** - Notes technical debt and potential risks

4. **`/extend`** - Create Extension Plan (Option B) **NEW**
   - Extension Agent gathers requirements from the user for new features
   - **Creates FRDs** in `specs/features/` for user-requested capabilities (same format as greenfield)
   - Creates extension strategy in `specs/extend/` (how to integrate with existing system)
   - Creates implementation tasks in `specs/tasks/`
   - **Focus**: New features, API extensions, data model extensions, UI additions
   - **Critical Rules**:
     - ⚠️ **User defines features** - Always ask user what they want to add
     - ⚠️ **FRDs in standard location** - New features go in `specs/features/`
     - ⚠️ **Leverages existing patterns** - New features follow established conventions
     - ⚠️ **Preserves stability** - Extensions must not break existing functionality

5. **`/plan`** - Implement Tasks (Optional)
   - Dev Agent reads tasks from `specs/tasks/` (modernization OR extension)
   - Implements tasks in the codebase
   - Follows best practices and existing architectural patterns
   - Ensures comprehensive testing of both new and existing functionality

6. **`/deploy`** - Azure Deployment (Optional)
   - Azure Agent deploys the evolved application to Azure
   - Generates updated Bicep IaC templates and CI/CD workflows
   - Uses Azure Dev CLI and MCP tools for deployment

## Why Use Brownfield Workflow?

### Documentation-Only Use Cases

- **Onboard new team members** - Comprehensive documentation of existing systems
- **Legacy system understanding** - Reverse engineer undocumented codebases
- **Pre-acquisition due diligence** - Document technical assets before purchase
- **Audit and compliance** - Document what the system actually does
- **Knowledge preservation** - Capture tribal knowledge before team changes

### Modernization Use Cases (Option A: `/modernize`)

- **Technical debt reduction** - Upgrade dependencies, fix code smells
- **Security improvements** - Patch vulnerabilities, implement security patterns
- **Performance optimization** - Fix bottlenecks, improve scalability
- **Architecture evolution** - Refactor toward modern patterns
- **Cloud migration** - Prepare legacy apps for cloud deployment

### Extension Use Cases (Option B: `/extend`) **NEW**

- **Feature additions** - Add new business capabilities to existing systems
- **API expansion** - Add new endpoints to existing APIs
- **Integration additions** - Connect new external services
- **UI enhancements** - Add new pages and user interactions
- **Workflow extensions** - Add new business processes

### Combined Use Cases

- **Comprehensive evolution** - First modernize, then extend (or vice versa)
- **Iterative improvement** - Alternate between modernization and extension phases
- **Prioritized evolution** - Address critical technical debt before adding features

Back to [docs index](index.md).
