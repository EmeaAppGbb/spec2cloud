---
name: build-check
description: Verify that all project services (API and Web) build successfully. Check compilation errors, type errors, and lint warnings. Use before running tests, before deployment, after code changes, and on resume. Trigger when build verification, compilation check, or pre-test validation is needed.
---

# Build Check

Verify builds succeed before proceeding with tests or deployment.

## Build Commands

| Service | Source Build | Docker Build |
|---------|------------|--------------|
| API (TypeScript) | `cd src/api && npm run build` | `docker build -f src/api/Dockerfile .` |
| Web (Next.js) | `cd src/web && npm run build` | `docker build -f src/web/Dockerfile .` |

## Steps

1. **Identify services** — Read `azure.yaml` or scan `src/` for service directories
2. **Build each service** — Run the source build command for each service
3. **Capture errors** — Collect compilation errors, type errors, and warnings
4. **Docker build** (if preparing for deployment) — Run Docker build for each Dockerfile
5. **Report** — Summarize build status per service

## Output Format

```
Service: <name>
Status: PASS | FAIL
Errors: <count>
Warnings: <count>

Details:
- <file>:<line> <error message>
```

## Notes

- Web (Next.js) requires `output: 'standalone'` in `next.config.ts`
- API uses TypeScript with Express

## Mandatory Completion Checklist

The orchestrator MUST verify ALL of the following before marking build-check as complete:

- [ ] Every service (API, Web) has been built — none skipped
- [ ] Each service reports PASS or FAIL with error/warning counts
- [ ] If any service fails to build, the failure details (file, line, message) are included
- [ ] A partial build (one service passes, another not attempted) is reported as "incomplete" — not as PASS

**BLOCKING**: A build-check with any FAIL or incomplete service means the codebase is not ready for testing or deployment. The orchestrator must fix build errors before proceeding.
