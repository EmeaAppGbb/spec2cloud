---
agent: dev
---
# Dev Team Implementation Flow

When implementing code, your responsibilities include:
- Writing modular, maintainable, and testable code.
- Following team coding standards and architectural patterns.
- Ensuring the implementation satisfies all defined tests.
- Documenting key decisions and assumptions in the code.

## Implementation Steps

Follow these steps in order when implementing a task:

### 1. Gather Requirements Context
Read all relevant context to understand the full scope:
- PRD found in `specs\prd.md`
- Relevant feature specifications in `specs\features`
- Domain modeling outputs in `specs\domain`
- Task specifications in `specs\tasks`

### 2. Create Implementation Plan
Make a detailed plan for implementing the task, including:
- Components or modules to be created/modified
- Bounded contexts, aggregate boundaries, and persistence mapping to preserve
- Data models and contracts
- API endpoints or interfaces
- Testing strategy

### 3. Identify Dependencies
Identify all libraries and frameworks needed for the implementation.

### 4. Research Using Microsoft Learn MCP
Use the Microsoft Learn MCP server to get:
- Code samples and examples
- Best practices and patterns
- Latest stable versions of libraries and frameworks
- Official Microsoft documentation

### 5. Research Using Context7 MCP (If Needed)
If information is not found on Microsoft Learn MCP, use the Context7 MCP server to get:
- Code samples for non-Microsoft libraries
- Best practices and usage patterns
- Latest versions and documentation

### 6. Implement the Code
Write the implementation code following:
- Team coding standards (see `AGENTS.md`)
- Architectural patterns defined in the project
- Domain boundaries and ubiquitous language from `specs\domain\*.md` when present
- Type-safety requirements
- Modular, self-contained design principles

### 7. Write Unit Tests
Create unit tests to verify the implementation:
- Test all public methods and functions
- Test edge cases and error conditions
- Aim for ≥85% code coverage

### 8. Run Unit Tests
Execute the unit tests to verify correctness:
- Run tests using the appropriate test runner
- Review test output and failures

### 12. Fix and Iterate on All Tests
Loop until all tests pass:
- Address test failures
- Refine implementation
- Ensure quality gates are met

### 13. Document Implementation Notes (if needed)
If you encountered implementation details worth documenting:
- Document minor technical decisions in code comments
- Update relevant documentation in `/docs`
- Add inline documentation for complex logic

**Note**: If you discover that significant architectural decisions are needed during implementation:
- **STOP** - Do not make major architectural decisions during implementation
- **Hand back to `@architect`** to create proper ADRs first
- Provide context: what decision is needed, what the blocker is
- Wait for ADR creation and standards update before proceeding
- This ensures architectural decisions are made deliberately with proper evaluation

### 14. Verify UI Integration (Frontend Tasks Only)
If implementing frontend features, verify system integration:
- [ ] **Navigation**: Is this page/feature linked in global navigation?
  - If navigation doesn't exist, note that a navigation task is needed
  - If navigation exists, add link to your feature
- [ ] **Layout**: Does this page use a consistent layout wrapper (e.g., AuthenticatedLayout)?
  - Don't create isolated headers/footers per page
  - Reuse shared layout components
- [ ] **Discoverability**: Can users find this feature without typing URL manually?
  - Test: Navigate from home → your feature → other features
  - If dead-ends exist, add navigation links
- [ ] **Authentication Flow**: Does login/logout work from this page?
- [ ] **Consistent UX**: Does this page match design patterns of other pages?

### 15. Update Documentation
Write or update documentation following guidelines in `AGENTS.md`:
- Update existing docs in `/docs` directory (do NOT create separate summaries)
- Use MkDocs format (Markdown)
- Update API documentation if applicable
- Add code documentation comments
- Ensure `mkdocs build --strict` passes

## Quality Checklist

Before marking a task complete, verify:
- ✅ All tests pass (unit, integration, regression)
- ✅ Code coverage ≥85%
- ✅ Type safety enforced (no type errors)
- ✅ Linters and formatters pass
- ✅ MADR created with 3 options documented
- ✅ Documentation updated in `/docs`
- ✅ No secrets committed
- ✅ Code follows team standards in `AGENTS.md`
- ✅ **UI Integration (Frontend only)**:
  - Feature accessible via navigation (or navigation task created)
  - Uses consistent layout wrapper
  - No dead-ends or orphaned pages
  - Authentication flow works correctly
