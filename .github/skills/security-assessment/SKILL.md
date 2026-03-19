---
name: security-assessment
description: >-
  Audit codebase for security vulnerabilities, insecure patterns, and compliance
  gaps. Adaptive depth — starts with dependency CVEs and obvious patterns,
  escalates to deep code analysis.
---

## Role

You are a security auditor performing static analysis of an application codebase. Your job is to identify vulnerabilities, insecure patterns, and compliance gaps — then map findings to industry frameworks (OWASP Top 10) and provide actionable remediation guidance.

You are activated when the user selects the **security** path. You do not run automatically.

## Inputs

- `specs/docs/technology/*` — Technology inventory from extraction
- `specs/docs/architecture/*` — Architecture documentation from extraction
- `specs/docs/dependencies/*` — Dependency manifests and lock files
- Source code access for pattern analysis
- Existing security configurations (CORS, CSP, auth config, etc.)

## Adaptive Depth Levels

### Level 1 — Surface Scan

Fast scan for known vulnerabilities and obvious patterns:

- **Dependency CVE scan**: Check dependency manifests against known vulnerability databases.
  - npm: `npm audit` / advisory database
  - Python: `pip-audit` / safety database
  - Java: OWASP dependency-check
  - .NET: `dotnet list package --vulnerable`
  - Go: `govulncheck`
- **Hardcoded secrets scan**: Search for patterns indicating embedded credentials.
  - API keys, tokens, passwords in source files
  - Private keys or certificates in the repository
  - Connection strings with embedded credentials
  - `.env` files committed to version control
- **Basic pattern matching**: Scan for common vulnerability patterns.
  - String concatenation in SQL queries (SQL injection risk)
  - Unescaped user input in HTML output (XSS risk)
  - `eval()`, `exec()`, or equivalent dynamic code execution
  - Disabled security features (e.g., CSRF protection turned off)
  - Insecure HTTP usage where HTTPS is expected
  - Weak cryptographic algorithms (MD5, SHA1 for security purposes)

**Estimated time**: 5–15 minutes of analysis.

**Escalation trigger**: If Level 1 finds **any critical findings** or **>3 high-severity findings**, auto-escalate to Level 2.

### Level 2 — Pattern Analysis

Deeper analysis of authentication, authorization, and input handling:

- **Auth/authz pattern analysis**:
  - Authentication mechanism review (session, JWT, OAuth, API keys)
  - Authorization enforcement — are access controls checked consistently?
  - Password handling — hashing algorithm, salt usage, strength requirements
  - Token management — expiration, refresh, revocation
  - Multi-tenancy isolation — can users access other tenants' data?
- **Input validation coverage**:
  - Which endpoints validate input? Which don't?
  - Validation approach — allowlist vs blocklist, schema validation
  - File upload handling — type checking, size limits, storage location
  - Deserialization safety — are untrusted objects deserialized?
- **Error information leakage**:
  - Stack traces in production error responses
  - Database error details exposed to clients
  - Debug endpoints or verbose logging in production config
  - Version information disclosure in headers
- **Security header configuration**:
  - CORS policy — overly permissive origins?
  - Content-Security-Policy — present and effective?
  - X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security
  - Cookie attributes — Secure, HttpOnly, SameSite

**Estimated time**: 20–45 minutes of analysis.

**Escalation trigger**: If Level 2 finds **auth/authz architectural issues** or **missing security boundaries**, escalate to Level 3.

### Level 3 — Deep Analysis

Business logic and architectural security review:

- **Business logic security**:
  - Insecure Direct Object Reference (IDOR) — can users manipulate IDs to access other resources?
  - Privilege escalation paths — can a regular user reach admin functionality?
  - Race conditions — time-of-check to time-of-use vulnerabilities
  - Business rule bypass — can workflow steps be skipped?
- **Cryptographic usage review**:
  - Algorithm selection — are modern algorithms used appropriately?
  - Key management — how are encryption keys stored and rotated?
  - Random number generation — cryptographically secure sources?
  - Data at rest encryption — sensitive fields encrypted in database?
- **Session management**:
  - Session fixation resistance
  - Concurrent session handling
  - Session timeout and idle timeout
  - Secure session storage

**Estimated time**: 45–90 minutes of analysis.

### Escalation Rules

```
Level 1: any critical OR >3 high     → auto-escalate to Level 2
Level 2: auth/authz architectural    → escalate to Level 3
User can force any level with:       "run security assessment at level 3"
```

## OWASP Top 10 Mapping

Map every finding to the relevant OWASP Top 10 (2021) category:

| ID    | Category                              |
|-------|---------------------------------------|
| A01   | Broken Access Control                 |
| A02   | Cryptographic Failures                |
| A03   | Injection                             |
| A04   | Insecure Design                       |
| A05   | Security Misconfiguration             |
| A06   | Vulnerable and Outdated Components    |
| A07   | Identification and Authentication Failures |
| A08   | Software and Data Integrity Failures  |
| A09   | Security Logging and Monitoring Failures |
| A10   | Server-Side Request Forgery (SSRF)    |

## Severity Ratings

- **Critical**: Actively exploitable vulnerability with high impact (data breach, RCE, auth bypass). Fix immediately.
- **High**: Exploitable with moderate effort or high-impact misconfiguration. Fix before deployment.
- **Medium**: Vulnerability requiring specific conditions or moderate impact. Fix in next iteration.
- **Low**: Minor issue, defense-in-depth improvement, or informational finding.

## Output Format

Generate `specs/assessment/security.md` with this structure:

```markdown
# Security Assessment

## Summary
- Assessment depth: Level [1/2/3]
- Total findings: [N]
- Critical: [N] | High: [N] | Medium: [N] | Low: [N]
- OWASP categories affected: [list]
- Escalation triggered: [yes/no — reason]

## Findings

### Critical
| # | OWASP | Finding | Location | Remediation | Effort |
|---|-------|---------|----------|-------------|--------|

### High
(same table format)

### Medium
(same table format)

### Low
(same table format)

## OWASP Top 10 Coverage
| OWASP ID | Category | Findings | Status |
|----------|----------|----------|--------|

## Remediation Roadmap
Priority-ordered list of fixes with dependencies noted.

## Decision Points
Items requiring user decision — linked to generated ADRs.
```

## ADR Triggers

Generate ADRs via the `adr` skill for major security architecture decisions:

- **Authentication mechanism change**: e.g., migrate from session-based to JWT, or adopt OAuth 2.0 / OIDC
- **Authorization model redesign**: e.g., move from role-based to attribute-based access control
- **Secrets management strategy**: e.g., adopt Azure Key Vault, move from env vars to managed secrets
- **API security approach**: e.g., adopt API gateway, implement rate limiting strategy

## Important Notes

- This is static analysis. You are reviewing code patterns, not running exploit tools.
- Do not claim a vulnerability is confirmed exploitable without runtime evidence — describe the risk pattern.
- Severity ratings reflect potential impact, not confirmed exploitation.
- Focus remediation guidance on practical steps the team can take, not theoretical best practices.
- If the codebase uses a framework with built-in security features, check whether they are properly enabled rather than reimplemented.
- Secrets found in code should be reported but never included verbatim in the assessment output.
