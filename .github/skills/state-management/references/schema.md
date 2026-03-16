# State File Schema

## Full JSON Schema Example

```json
{
  "currentPhase": "increment-delivery",
  "productDiscovery": {
    "specRefinement": { "status": "done", "frdCount": 5 },
    "uiuxDesign": { "status": "done", "screenCount": 12 },
    "incrementPlanning": { "status": "done", "incrementCount": 4 },
    "techStackResolution": {
      "status": "done",
      "categoriesResolved": 8,
      "decisionsPresented": 3,
      "skillsCreated": ["azure-cosmosdb", "langraph-agents"],
      "techStackDoc": "specs/tech-stack.md"
    }
  },
  "incrementPlan": [
    {
      "id": "walking-skeleton",
      "name": "Walking Skeleton",
      "scope": ["Basic layout", "Auth flow", "Landing page", "Health endpoints"],
      "frdScope": ["specs/frd-auth.md (login/logout only)", "specs/frd-layout.md"],
      "screens": ["landing", "login", "dashboard-shell"],
      "dependsOn": [],
      "complexity": "medium"
    },
    {
      "id": "resource-crud",
      "name": "Resource Management",
      "scope": ["Create/edit/delete resources", "Resource list view"],
      "frdScope": ["specs/frd-resources.md (CRUD only)"],
      "screens": ["resource-list", "resource-editor"],
      "dependsOn": ["walking-skeleton"],
      "complexity": "large"
    },
    {
      "id": "ai-generation",
      "name": "AI Content Generation",
      "scope": ["Generate content", "Content generation", "Content preview"],
      "frdScope": ["specs/frd-ai-content.md"],
      "screens": ["content-studio", "content-preview"],
      "dependsOn": ["resource-crud"],
      "complexity": "large"
    }
  ],
  "currentIncrement": "resource-crud",
  "increments": {
    "walking-skeleton": {
      "status": "done",
      "steps": {
        "tests": {
          "status": "done",
          "e2eSpecs": ["e2e/auth-flow.spec.ts", "e2e/landing.spec.ts"],
          "gherkinFiles": ["specs/features/auth.feature", "specs/features/layout.feature"],
          "cucumberSteps": ["tests/features/step-definitions/auth.steps.ts"],
          "vitestFiles": ["src/api/tests/unit/auth.test.ts"]
        },
        "contracts": {
          "status": "done",
          "apiContracts": ["specs/contracts/api/auth.yaml"],
          "sharedTypes": ["src/shared/types/auth.ts"],
          "infraUpdated": true
        },
        "implementation": {
          "status": "done",
          "slices": {
            "api": { "status": "done", "modifiedFiles": ["src/api/src/routes/auth.ts"], "lastTestRun": { "pass": 8, "fail": 0 } },
            "web": { "status": "done", "modifiedFiles": ["src/web/src/app/login/page.tsx"], "lastTestRun": { "pass": 4, "fail": 0 } },
            "integration": { "status": "done", "lastTestRun": { "cucumber": { "pass": 6, "fail": 0 }, "playwright": { "pass": 3, "fail": 0 } } }
          }
        },
        "verification": {
          "status": "done",
          "regression": { "unit": { "pass": 12, "fail": 0 }, "cucumber": { "pass": 6, "fail": 0 }, "playwright": { "pass": 3, "fail": 0 } },
          "deployment": { "status": "done", "url": "https://myapp-abc123.azurecontainerapps.io" },
          "smokeTests": { "pass": 2, "fail": 0 },
          "docs": { "status": "done" }
        }
      }
    },
    "resource-crud": {
      "status": "in-progress",
      "steps": {
        "tests": { "status": "done" },
        "contracts": { "status": "done" },
        "implementation": {
          "status": "in-progress",
          "slices": {
            "api": {
              "status": "in-progress",
              "modifiedFiles": ["src/api/src/routes/resources.ts"],
              "failingTests": [{ "name": "should create resource", "file": "src/api/tests/unit/resources.test.ts", "error": "Expected 201, got 404" }],
              "lastTestRun": { "pass": 5, "fail": 2 },
              "iteration": 2
            },
            "web": { "status": "pending" },
            "integration": { "status": "pending" }
          }
        },
        "verification": { "status": "pending" }
      }
    }
  },
  "humanGates": {
    "phase0-approved": true,
    "discovery-specs-approved": true,
    "discovery-uiux-approved": true,
    "discovery-plan-approved": true,
    "discovery-techstack-approved": true,
    "increment-walking-skeleton-tests-gherkin-approved": true,
    "increment-walking-skeleton-impl-approved": true,
    "increment-walking-skeleton-shipped": true,
    "increment-resource-crud-tests-gherkin-approved": true,
    "increment-resource-crud-impl-approved": false,
    "increment-resource-crud-shipped": false
  },
  "testsStatus": {
    "unit": { "pass": 17, "fail": 2 },
    "cucumber": { "pass": 6, "fail": 0 },
    "playwright": { "pass": 3, "fail": 0 }
  },
  "lastUpdated": "2026-02-09T14:30:00Z"
}
```

## Increment Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"pending"` \| `"in-progress"` \| `"done"` | Overall increment delivery status. `"done"` only when Step 4 (Verify & Ship) completes. |
| `steps` | object | Per-step status tracking: `tests`, `contracts`, `implementation`, `verification`. |

## Step Object Fields

| Step | Key Fields | Description |
|------|-----------|-------------|
| `tests` | `e2eSpecs`, `gherkinFiles`, `cucumberSteps`, `vitestFiles` | Files generated for this increment's test scaffolding. |
| `contracts` | `apiContracts`, `sharedTypes`, `infraUpdated` | Contract artifacts for this increment. |
| `implementation` | `slices` (api, web, integration) | Per-slice tracking with `modifiedFiles`, `failingTests`, `lastTestRun`, `iteration`. |
| `verification` | `regression`, `deployment`, `smokeTests`, `docs` | Full regression results, deployment URL, smoke test results, docs status. |
