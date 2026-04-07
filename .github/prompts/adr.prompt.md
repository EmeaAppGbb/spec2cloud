```prompt
---
agent: architect
---
# Create Architecture Decision Records (ADRs)

Your task is to create Architecture Decision Records that document key technical and architectural decisions for the project.

## When to Create ADRs

Create ADRs when significant architectural decisions need to be documented, including:
- Technology stack choices (frameworks, libraries, languages)
- Database selection and data modeling approach
- API design patterns and conventions
- Frontend architecture and state management
- Authentication and authorization strategy
- Deployment and infrastructure approach
- Agent framework and orchestration patterns (if applicable)
- Testing strategy and quality gates
- Observability and monitoring approach
- Security and compliance measures
- Caching strategies
- Messaging patterns
- Cloud service selections (Azure services)

## Input Sources

Before creating ADRs, read and analyze:
1. **Product Requirements** - `specs/prd.md`
2. **Feature Requirements** - `specs/features/*.md`
3. **Domain Model Outputs** - `specs/domain/*.md` (if present)
4. **Engineering Standards** - `AGENTS.md` (if exists) or `standards/` folder
5. **Existing ADRs** - `specs/adr/*.md` (to maintain consistency and avoid duplicates)

## ADR Format (MADR - Markdown Any Decision Records)

Create each ADR using this structure:

```markdown
# [ADR Number] [Short Title in Kebab-Case]

**Date**: YYYY-MM-DD  
**Status**: Proposed | Accepted | Deprecated | Superseded

## Context

What is the issue that motivates this decision or change?
- What problem are we trying to solve?
- What constraints exist?
- What are the business or technical drivers?

## Decision Drivers

What factors influence this decision?
- Performance requirements
- Scalability needs
- Team expertise
- Budget constraints
- Timeline pressures
- Integration requirements
- Compliance/security requirements

## Considered Options

List at least 3 options that were evaluated:

### Option 1: [Name]
**Description**: Brief description of the option

**Pros**:
- Advantage 1
- Advantage 2

**Cons**:
- Disadvantage 1
- Disadvantage 2

### Option 2: [Name]
**Description**: Brief description of the option

**Pros**:
- Advantage 1
- Advantage 2

**Cons**:
- Disadvantage 1
- Disadvantage 2

### Option 3: [Name]
**Description**: Brief description of the option

**Pros**:
- Advantage 1
- Advantage 2

**Cons**:
- Disadvantage 1
- Disadvantage 2

## Decision Outcome

**Chosen Option**: [Option Name]

**Rationale**:
- Why this option was selected
- How it best addresses the decision drivers
- What trade-offs were acceptable

## Consequences

### Positive
- Benefit 1
- Benefit 2

### Negative
- Trade-off 1
- Trade-off 2
- Mitigation strategies for negative consequences

### Neutral
- Other impacts to be aware of

## Implementation Notes (Optional)

- Key implementation considerations
- Migration path from current state (if applicable)
- Dependencies on other decisions

## References (Optional)

- Links to PRD/FRD sections
- Links to other ADRs
- External documentation
- Research sources
```

## Naming and Numbering Convention

**File Naming**: `specs/adr/NNNN-short-title.md`

**Examples**:
- `0001-database-choice.md`
- `0002-frontend-framework.md`
- `0003-authentication-strategy.md`
- `0004-deployment-platform.md`

**Sequential Numbering**:
1. Check existing ADRs to find the highest number
2. Create new ADR with next sequential number (zero-padded to 4 digits)
3. Never reuse numbers, even for superseded ADRs

## Research and Analysis

Before creating ADRs, use your tools to research best practices:

1. **Context7** - Research library documentation and patterns
2. **DeepWiki** - Analyze reference implementations in similar projects
3. **Microsoft Docs MCP** - Get official Microsoft/Azure best practices
4. **Azure MCP** - Research Azure-specific architectural patterns

## Quality Guidelines

### Must Have:
- ✅ At least 3 considered options
- ✅ Clear decision rationale
- ✅ Both positive and negative consequences
- ✅ Proper MADR format
- ✅ Sequential numbering
- ✅ Links to relevant PRD/FRD sections

### Should Have:
- ✅ Decision drivers clearly stated
- ✅ Implementation notes for complex decisions
- ✅ References to research sources
- ✅ Migration path (if changing existing architecture)

### Avoid:
- ❌ Single option (no alternatives considered)
- ❌ Missing rationale
- ❌ Vague consequences
- ❌ Implementation code (save for dev agent)
- ❌ Duplicating existing ADRs

## Workflow

1. **Receive Request**: From PM, DevLead, or manual invocation
2. **Read Context**: PRD, FRDs, AGENTS.md, existing ADRs
3. **Identify Decisions**: What architectural decisions need documentation?
4. **Research Options**: Use tools to evaluate at least 3 alternatives
5. **Create ADRs**: One ADR per decision, using MADR format
6. **Review Alignment**: Ensure ADRs align with requirements and standards
7. **Handoff**: Optionally hand to DevLead or Planner for review

## Example ADR Topics by Project Type

### Web Application
- Frontend framework (React vs Angular vs Vue)
- Backend framework (.NET vs Node vs Python)
- Database (SQL vs NoSQL)
- Authentication (OAuth, JWT, session-based)
- State management (Redux, Context, Zustand)
- API design (REST vs GraphQL)
- Deployment (App Service, Container Apps, Static Web Apps)

### Microservices
- Service communication (REST, gRPC, message queues)
- Service discovery
- API gateway
- Data consistency patterns
- Distributed tracing
- Circuit breakers and resilience

### AI/ML Application
- Model serving approach
- Agent orchestration framework
- Vector database selection
- Prompt management strategy
- Observability for AI workloads

## Important Notes

- ADRs are **living documents** - update status when decisions change
- Mark ADRs as **Superseded** when replaced, don't delete them
- Keep ADRs **focused** - one decision per ADR
- Make ADRs **actionable** - developers should understand implications
- Document **trade-offs** honestly - include negatives, not just positives
```
