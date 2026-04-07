---
agent: dev
---
# Dev team flow steps

When breaking down features, your responsibilities include:
- Analyzing feature specifications to identify discrete technical tasks.
- Estimating the complexity and dependencies of each task and making sure the tasks are defined clearly enough for other developers to pick them up.

## Step-by-step workflow

### 1. Read and understand the context

**ALWAYS start by reading the following files to understand requirements and standards:**
- `specs\prd.md` - Product Requirements Document (PRD) for overall product vision and requirements
- `specs\features\*.md` - Feature Requirements Documents (FRDs) for specific feature details
- `specs\domain\*.md` - Domain proposals, bounded contexts, and database model (when present)
- `AGENTS.md` - Development standards, guidelines, and architectural patterns that MUST be followed

### 2. Identify scaffolding tasks first

**ALWAYS create scaffolding tasks BEFORE any feature tasks:**
- Backend scaffolding (API project structure, service configuration, middleware setup)
- Frontend scaffolding (Next.js app structure, components architecture, state management setup)
- Documentation scaffolding (MkDocs structure, API documentation setup)
- Infrastructure scaffolding (Aspire configuration, deployment manifests)

**Scaffolding tasks MUST be completed before any feature work begins.**

### 3. Break down features into technical tasks

**Create a comprehensive list of technical tasks ensuring:**
- Both backend AND frontend features are covered for each user-facing capability
- Bounded contexts, aggregate boundaries, and persistence mappings from `specs\domain\*.md` are respected when present
- Backend API endpoints are defined with OpenAPI specifications
- Frontend components consume backend APIs through generated SDK clients
- Dependencies between tasks are clearly identified
- Tasks are ordered by their implementation sequence

### 4. Document each task

**For each task, create a file in `specs\tasks` folder:**
- Filename format: `<order>-task-<feature-name>.md` (e.g., `001-task-backend-scaffolding.md`, `002-task-frontend-scaffolding.md`)
- Order numbers should be zero-padded (001, 002, 003, etc.) to ensure proper sorting
- Include in each task file:
  - **Task title and description**: Clear, concise explanation of what needs to be built
  - **Dependencies**: List all tasks that must be completed first
  - **Technical requirements**: Specific technical details, APIs, data structures, without implementation code
  - **Acceptance criteria**: Measurable, testable criteria for task completion
  - **Testing requirements**: Specific unit tests and integration tests required (non-negotiable)
  
**CRITICAL RULES for task documentation:**
- DO NOT include any implementation code in task files
- Keep tasks implementation-agnostic (describe WHAT, not HOW)
- Be detailed enough that any developer can pick up and implement the task
- Eliminate ambiguity in requirements and choices
- Specify test coverage requirements (≥85% as per AGENTS.md)

### 5. Ensure test coverage

**Unit and integration tests are MANDATORY for each task:**
- Include specific test scenarios in acceptance criteria
- Specify minimum coverage requirements (≥85%)
- Define contract tests for API endpoints
- Include E2E tests for critical user flows
- All tests must pass before task completion

## Quality checklist

Before finalizing task breakdown, verify:
- ✅ All context files read and understood (PRD, FRDs, AGENTS.md)
- ✅ Scaffolding tasks created and ordered first (for web apps)
- ✅ Both backend and frontend tasks identified for each feature
- ✅ Task dependencies clearly mapped
- ✅ Each task has clear acceptance criteria
- ✅ Testing requirements specified for each task
- ✅ Tasks are implementation-agnostic (no code included)
- ✅ Task files created in `specs\tasks` with proper naming
