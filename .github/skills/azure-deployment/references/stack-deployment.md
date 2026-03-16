# Stack-Specific Deployment Details

## AZD Service Structure

The `azure.yaml` defines two services:

```yaml
services:
  web:
    project: ./src/web
    language: ts
    host: containerapp
    docker:
      path: ./src/web/Dockerfile
  api:
    project: ./src/api
    language: ts
    host: containerapp
    docker:
      path: ./src/api/Dockerfile
```

## Container Apps Configuration

| Service | Container Port | Dockerfile | Health Endpoint |
|---------|---------------|------------|-----------------|
| web | 3000 | `src/web/Dockerfile` (Next.js standalone output) | `GET /` → 200 |
| api | 8080 | `src/api/Dockerfile` (Node.js build) | `GET /health` → 200 |

## Dockerfiles

- **`src/web/Dockerfile`**: Multi-stage build — `npm install` → `npm run build`
  → Next.js standalone server on port 3000
- **`src/api/Dockerfile`**: Multi-stage build — `npm ci` → `npm run build` →
  Node.js on port 8080

## Infrastructure (Bicep Templates)

Bicep templates in `infra/`:

| File | Purpose |
|------|---------|
| `infra/main.bicep` | Root template — orchestrates all modules |
| `infra/modules/container-app.bicep` | Container App resource definition |
| `infra/modules/container-apps-environment.bicep` | Shared Container Apps environment |
| `infra/modules/container-registry.bicep` | Azure Container Registry (ACR) |
| `infra/modules/monitoring.bicep` | Application Insights + Log Analytics |

## Environment Variables

Configure these on the **web** container to connect to the **api** container:

| Variable | Description | How to set |
|----------|-------------|-----------|
| `API_URL` | Internal URL of the api Container App (e.g., `https://api.<env>.azurecontainerapps.io`) | `azd env set API_URL <api-internal-url>` or auto-wired in Bicep outputs |

## Smoke Test Commands

After deployment, run smoke tests against the live URL:

```bash
# Get deployed URLs
azd env get-values | grep SERVICE_WEB_ENDPOINT_URL

# Run smoke tests against live deployment
PLAYWRIGHT_BASE_URL=<deployed-web-url> npx playwright test --grep @smoke --config=e2e/playwright.config.ts

# Manual health checks
curl -f https://<api-url>/health
curl -f https://<web-url>/
```

## Deployment Verification Sequence

1. `azd provision` — creates Container Apps environment, ACR, monitoring
2. `azd deploy` — builds Docker images, pushes to ACR, deploys to Container Apps
3. Health checks: `GET /health` (api), `GET /` (web)
4. Smoke tests: `PLAYWRIGHT_BASE_URL=<url> npx playwright test --grep @smoke`
