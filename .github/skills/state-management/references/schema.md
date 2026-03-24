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
  "brownfield": {
    "testability": "partial",
    "track": "hybrid",
    "testabilityChecklist": {
      "canBuild": true,
      "externalDepsReachable": false,
      "apiExercisable": true,
      "uiRenderable": true,
      "devEnvExists": true,
      "existingTestsRunnable": true
    },
    "featureTracks": {
      "auth": "A",
      "search": "A",
      "reporting": "B",
      "legacy-import": "B"
    },
    "greenBaseline": {
      "features": {
        "auth": { "scenarios": 12, "testsPass": true, "lastVerified": "2026-02-08T10:00:00Z" },
        "search": { "scenarios": 8, "testsPass": true, "lastVerified": "2026-02-08T10:05:00Z" }
      }
    },
    "behavioralDocs": {
      "features": {
        "reporting": { "scenarios": 6, "manualChecklist": 10 },
        "legacy-import": { "scenarios": 3, "manualChecklist": 5 }
      }
    },
    "extraction": {
      "codebaseScanner": "specs/docs/technology/stack.md",
      "dependencyInventory": "specs/docs/technology/dependencies.md",
      "architectureMapper": "specs/docs/architecture/overview.md",
      "apiExtractor": "specs/contracts/api/",
      "dataModelExtractor": "specs/docs/architecture/data-models.md",
      "testDiscovery": "specs/docs/testing/coverage.md"
    },
    "prdGenerated": true,
    "frdCount": 4,
    "selectedPaths": ["modernize", "security"]
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

## Brownfield Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `testability` | `"full"` \| `"partial"` \| `"none"` | Overall testability verdict set after the B3 testability gate. `"full"` = all features exercisable, `"partial"` = some features exercisable, `"none"` = no automated testing possible. |
| `track` | `"A"` \| `"B"` \| `"hybrid"` | Delivery track. `"A"` = all features follow test-first with green baseline. `"B"` = all features follow doc-only behavioral documentation. `"hybrid"` = per-feature assignment via `featureTracks`. |
| `testabilityChecklist` | object | Six boolean checks evaluated during the testability gate. All `true` → `testability: "full"`. Mix → `"partial"`. All `false` → `"none"`. |
| `featureTracks` | object | Map of feature ID → `"A"` or `"B"`. Present only when `track` is `"hybrid"`. Each feature inherits its delivery path from this map during Phase 2. |
| `greenBaseline` | object | Track A results. `features` maps feature ID → `{ scenarios, testsPass, lastVerified }`. Populated after green baseline tests pass. |
| `behavioralDocs` | object | Track B results. `features` maps feature ID → `{ scenarios, manualChecklist }`. Populated after behavioral documentation is complete. |
| `extraction` | object | Paths to extraction outputs from Phase B1 skills. |
| `prdGenerated` | boolean | Whether the PRD was generated during Phase B2. |
| `frdCount` | number | Number of FRDs generated during Phase B2. |
| `selectedPaths` | array | Paths chosen by the user at the path-selection human gate (e.g., `["modernize", "security"]`). |

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
