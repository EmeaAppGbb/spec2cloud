# Contract Schema Reference

## API Contract YAML Format

Each feature produces one API contract file at
`specs/contracts/api/{feature-id}.yaml`. The format is a simplified
OpenAPI-inspired YAML schema optimized for agent consumption.

### Full Example

```yaml
feature: user-auth
version: "1.0"
basePath: /api/auth

endpoints:
  - path: /register
    method: POST
    description: Register a new user account
    auth: none
    request:
      body:
        type: object
        required: [username, password, email]
        properties:
          username:
            type: string
            minLength: 3
            maxLength: 50
          password:
            type: string
            minLength: 8
          email:
            type: string
            format: email
    responses:
      201:
        description: User registered successfully
        body:
          type: object
          properties:
            message: { type: string }
            role: { type: string, enum: [user, admin] }
      420:
        description: Validation error
        body:
          type: object
          properties:
            error: { type: string }
            details: { type: array, items: { type: string } }
      409:
        description: Username already taken
        body:
          type: object
          properties:
            error: { type: string }
```

### Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `feature` | Yes | kebab-case feature identifier |
| `version` | Yes | Contract version string |
| `basePath` | Yes | URL prefix for all endpoints in this feature |
| `endpoints[]` | Yes | Array of endpoint definitions |
| `endpoints[].path` | Yes | Path relative to basePath |
| `endpoints[].method` | Yes | HTTP method (GET, POST, PUT, PATCH, DELETE) |
| `endpoints[].description` | Yes | Human-readable description |
| `endpoints[].auth` | Yes | `none`, `jwt`, `api-key`, or role name |
| `endpoints[].request` | No | Request schema (body, query, params) |
| `endpoints[].responses` | Yes | Map of status code → response schema |

---

## Infrastructure Contract YAML Format

A single infrastructure contract lives at
`specs/contracts/infra/resources.yaml`. It aggregates all Azure resource needs
across the increment.

### Full Example

```yaml
version: "1.0"
target: azure-container-apps

resources:
  - name: api
    type: Microsoft.App/containerApps
    description: Express.js API backend
    sku: Consumption
    scaling:
      minReplicas: 0
      maxReplicas: 3
      rules:
        - type: http
          metadata:
            concurrentRequests: "50"
    resources:
      cpu: "0.5"
      memory: "1Gi"
    ingress:
      external: true
      targetPort: 8080
      cors:
        allowedOrigins: ["https://{web-app-url}"]
    env:
      - name: NODE_ENV
        value: production
      - name: JWT_SECRET
        secretRef: jwt-secret

  - name: web
    type: Microsoft.App/containerApps
    description: Next.js frontend
    sku: Consumption
    scaling:
      minReplicas: 0
      maxReplicas: 3
    resources:
      cpu: "0.5"
      memory: "1Gi"
    ingress:
      external: true
      targetPort: 3000
    env:
      - name: API_URL
        value: "https://{api-app-url}"

  - name: registry
    type: Microsoft.ContainerRegistry/registries
    description: Container image registry
    sku: Basic
    justification: "Basic tier sufficient for MVP — single region, low image count"

dependencies:
  - from: api
    to: registry
    reason: "API container images stored in registry"
  - from: web
    to: registry
    reason: "Web container images stored in registry"
  - from: web
    to: api
    reason: "Web app calls API endpoints"
```

### Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `version` | Yes | Contract version string |
| `target` | Yes | Deployment target (e.g., `azure-container-apps`) |
| `resources[]` | Yes | Array of Azure resource definitions |
| `resources[].name` | Yes | Logical name for the resource |
| `resources[].type` | Yes | Azure resource type (ARM format) |
| `resources[].description` | Yes | Purpose of the resource |
| `resources[].sku` | Yes | SKU/tier with justification |
| `resources[].scaling` | No | Scaling configuration (replicas, rules) |
| `resources[].resources` | No | CPU/memory allocation |
| `resources[].ingress` | No | Networking: port, external/internal, CORS |
| `resources[].env` | No | Environment variables and secret references |
| `dependencies[]` | No | Resource dependency graph |
