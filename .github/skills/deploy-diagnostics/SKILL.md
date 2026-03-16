---
name: deploy-diagnostics
description: Diagnose and resolve Azure deployment failures by analyzing error output, checking Azure resource state, and suggesting fixes. Use when azd provision fails, azd deploy fails, smoke tests fail against live deployment, container images fail to push/pull, or any Phase 6 deployment error occurs. Trigger on deployment errors, infrastructure failures, or post-deploy smoke test failures.
---

# Deploy Diagnostics

Diagnose and resolve Azure deployment failures.

## Steps

1. **Parse error output** — Identify the error type from AZD stdout/stderr
2. **Classify the error** — Match against known patterns (see below)
3. **Check resource state** — Verify Azure resource health if accessible
4. **Suggest fix** — Provide specific remediation
5. **Verify fix** — After applying, re-run the failed command

## Known Failure Patterns

| Pattern | Symptom | Fix |
|---------|---------|-----|
| Quota exceeded | `QuotaExceeded` in error | Change region or request quota increase |
| Name conflict | `ConflictError` or DNS taken | Use a different `environmentName` |
| Image pull failure | `ImagePullBackOff` | Verify ACR push succeeded and identity has AcrPull role |
| Bicep validation | `InvalidTemplate` | Check `infra/main.bicep` syntax and parameter values |
| Permission denied | `AuthorizationFailed` | Verify subscription access and required RBAC roles |
| Region unavailable | `LocationNotAvailableForResourceType` | Deploy to a supported region |

## Diagnostic Commands

```bash
azd show                                                                    # deployment status
azd provision --debug                                                       # provisioning logs
az resource list --resource-group <rg-name> --output table                  # resource health
az containerapp logs show --name <app-name> --resource-group <rg-name>      # container app logs
```

## Output Format

```
Error: <classification>
Root Cause: <description>
Fix: <specific action>
Confidence: HIGH | MEDIUM | LOW
```
