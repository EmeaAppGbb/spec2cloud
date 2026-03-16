# Benefits

## Spec-Driven Development
- Specifications are the source of truth — implementation follows specs, not the reverse
- Traceability from PRD → FRD → Gherkin → Tests → Code → Deployment
- Changes start with spec updates, flow through tests, then implementation

## Resumable Workflows
- State persisted in .spec2cloud/state.json after every action
- Resume from exact position after interruption
- Shared state across developers and machines via git
- Full audit trail in .spec2cloud/audit.log

## Human-in-the-Loop
- Human gates at every critical transition
- Nothing deploys without explicit approval
- Interactive prototypes for UI review before coding
- Gherkin scenarios for behavior review before test generation

## Modular Brownfield Support
- Pure extraction first — understand before changing
- User chooses the path — no assumptions about intent
- Assessment adapts depth based on findings
- ADRs document every significant decision

## Skills Ecosystem
- 43 built-in skills covering the full lifecycle
- Community skills available via skills.sh
- Create custom skills following agentskills.io standard
- Skills are versioned and locked via skills-lock.json

## Stack Agnostic
- Framework works with any tech stack
- Shell templates provide stack-specific wiring
- Skills operate at the spec level, not the code level
- Same pipeline handles Next.js, .NET, Python, and more

## Test-First Everything
- Tests generated before implementation code
- Red baseline verified — new tests must fail initially
- Implementation makes tests green
- Full regression after every change

## Azure-Ready Deployment
- Azure Container Apps deployment via azd
- Infrastructure-as-code with Bicep
- CI/CD workflows with GitHub Actions
- Smoke tests verify production after every deployment
