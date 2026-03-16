---
name: contract-generation
description: >-
  Generate API contracts, shared TypeScript types, and infrastructure resource
  definitions from Gherkin scenarios and test files. Produce the stable
  foundation for parallel frontend/backend implementation. Use when generating
  contracts, creating shared types, defining API specs, or updating
  infrastructure requirements per increment.
---

# Contract Generation

## Role

You are the contract generation agent. You produce the contracts that bridge
test generation and implementation: API specifications, shared TypeScript types,
and infrastructure resource requirements. Contracts are generated **per
increment** — only for the features and endpoints scoped to the current
increment.

Your output is the stable foundation that enables frontend and backend
implementation slices to run in parallel without conflicts.

## Inputs

- The current increment's scope from `specs/increment-plan.md`
- Approved FRDs scoped to this increment (`specs/frd-*.md`)
- Gherkin feature files for this increment (`specs/features/*.feature`)
- E2E test specs for this increment (Playwright specs, Page Object Models)
- BDD test scaffolding for this increment (step definitions, unit test files)
- Existing contracts from previous increments (to extend, not conflict)
- Current `.spec2cloud/state.json`

## Outputs

| Artifact | Location | Cardinality |
|----------|----------|-------------|
| API contracts | `specs/contracts/api/{feature-id}.yaml` | One per feature |
| Shared TypeScript types | `src/shared/types/{feature-id}.ts` | One per feature |
| Infrastructure contract | `specs/contracts/infra/resources.yaml` | Single file |

## Tasks

### Task 1 — Generate API Contracts

For each feature, produce an API contract in `specs/contracts/api/{feature-id}.yaml`:

1. Extract endpoint definitions from Gherkin scenarios and test files.
2. Define for each endpoint:
   - HTTP method and path (e.g., `POST /api/auth/register`)
   - Route parameters and query parameters
   - Request body schema with required/optional fields, types, and validation rules
   - Response body schema for success (2xx) and error (4xx, 5xx) cases
   - Authentication/authorization requirements (e.g., JWT required, admin role)
   - Status codes with descriptions
3. Use the simplified OpenAPI-inspired YAML format (see `references/schemas.md`).
4. Cross-reference Gherkin scenarios to ensure every behavior is covered by an endpoint.

### Task 2 — Generate Shared TypeScript Types

For each feature, produce shared types in `src/shared/types/{feature-id}.ts`:

1. Extract TypeScript interfaces from the API contracts.
2. Include:
   - Request DTOs (e.g., `RegisterRequest`, `LoginRequest`)
   - Response DTOs (e.g., `RegisterResponse`, `UserProfile`)
   - Entity models shared between API and Web (e.g., `User`, `Session`)
   - Enum types and constants (e.g., `UserRole`, `ErrorCode`)
   - Component prop types derived from response shapes
3. Use strict TypeScript: no `any` types, explicit null/undefined handling.
4. Export all types as named exports.
5. Ensure types compile standalone (no circular dependencies, no runtime imports).

### Task 3 — Generate Infrastructure Contract

Produce a single infrastructure contract at `specs/contracts/infra/resources.yaml`:

1. Aggregate resource needs across all features in this increment.
2. Define for each Azure resource:
   - Resource type (e.g., `Microsoft.App/containerApps`)
   - SKU/tier with justification
   - Scaling: min/max replicas, CPU/memory allocation
   - Environment variables and secrets the resource needs
   - Dependencies between resources
   - Networking: ingress rules, CORS configuration, internal-only access
3. Consider the deployment target (Azure Container Apps via AZD) and existing
   `infra/` Bicep templates.
4. Flag any gaps between current infrastructure and what the features require.

See `references/schemas.md` for the full infrastructure contract YAML format.

### Task 4 — Self-Review and Cross-Validation

After generating all contracts, verify:

| Check | What to verify |
|-------|---------------|
| **Completeness** | Every Gherkin scenario maps to at least one API endpoint |
| **Consistency** | Request/response types in API contracts match shared TypeScript types |
| **Test alignment** | Test files reference endpoints and types that exist in the contracts |
| **Infra coverage** | Every service (API, Web) has a corresponding infrastructure resource |
| **No conflicts** | Endpoint paths don't collide across features; type names are unique or namespaced |

## Iteration Rules

- Generate contracts for **all features in the increment** before presenting for review.
- If a Gherkin scenario cannot be mapped to an API endpoint, flag it as a gap.
- If test files reference types not in the contracts, update the contracts.
- After self-review, present all contracts to the orchestrator for human gate approval.

## State Updates

After completing contract generation for a feature:

```json
{
  "contracts": {
    "api": {
      "{feature-id}": {
        "status": "done",
        "specFile": "specs/contracts/api/{feature-id}.yaml"
      }
    },
    "sharedTypes": {
      "{feature-id}": {
        "status": "done",
        "outputFiles": ["src/shared/types/{feature-id}.ts"]
      }
    }
  }
}
```

After completing the infrastructure contract:

```json
{
  "contracts": {
    "infra": {
      "status": "done",
      "specFile": "specs/contracts/infra/resources.yaml"
    }
  }
}
```

Append to `.spec2cloud/audit.log`:

```
[ISO-timestamp] increment={id} step=contracts action=contracts-generated result=done
```
