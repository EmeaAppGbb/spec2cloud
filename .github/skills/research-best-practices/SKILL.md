---
name: research-best-practices
description: >
  Research current best practices, latest package versions, and official guidance
  before writing implementation code. Uses MCP tools (Microsoft Learn, Context7,
  DeepWiki) and available Copilot skills to ground decisions in up-to-date,
  first-party documentation rather than stale training data.
---

# Research Best Practices

Ground every implementation decision in current, authoritative sources before writing code.

## When to Use

- **Always** at the start of Step 3 (Implementation) — before the first line of code
- When adding a new Azure service, SDK, or infrastructure resource not covered by `specs/tech-stack.md`
- When choosing between libraries, patterns, or architectural approaches
- When a package version may have breaking changes since last known state
- When the task involves an area you haven't recently verified (auth, storage, AI, etc.)
- **Note:** Phase 1d (Tech Stack Resolution) performs comprehensive upfront research. This skill handles targeted, increment-specific research that builds on those resolved decisions.

## Inputs

- **`specs/tech-stack.md`** — Pre-resolved technology decisions from Phase 1d (check this FIRST)
- Feature contracts from Step 2 (API specs, shared types, infra contract)
- The project's current `package.json` dependencies and versions
- The specific technologies and services the feature requires

## Research Tools

Use these MCP tools in priority order:

| Tool | Use For | Example |
|------|---------|---------|
| **Microsoft Learn MCP** (`microsoft_docs_search`, `microsoft_code_sample_search`, `microsoft_docs_fetch`) | Azure SDKs, Azure best practices, .NET Aspire, Azure Container Apps, Entra ID, any Microsoft/Azure technology | "Azure Container Apps health probes", "MSAL Node.js token caching" |
| **Context7** | Latest docs and usage examples for any open-source library or framework — npm packages, Next.js, Express, Tailwind, Playwright, etc. | "next.js app router server actions", "express middleware error handling" |
| **DeepWiki** | Deep architectural understanding of open-source repos — how a library works internally, patterns used, extension points | "How does next-auth handle session rotation?", "Playwright test isolation model" |
| **Azure Best Practices** (`get_azure_bestpractices`) | Azure-specific code generation and deployment best practices — call before writing any Azure infra or SDK code | "Container Apps deployment", "Cosmos DB SDK usage" |
| **Web Search** (`web_search`) | Recent releases, changelogs, migration guides, community consensus on emerging patterns | "Express 5 migration guide", "Next.js 15 breaking changes" |

### Also check local resources

- **`.github/skills/`** — Scan for an existing skill that covers the task
- **`specs/contracts/`** — Re-read the API and infra contracts to confirm scope
- **`package.json`** — Check current dependency versions before assuming APIs

## Steps

1. **Consult tech stack** — Read `specs/tech-stack.md` first. Most technology decisions, versions, and patterns should already be resolved from Phase 1d. Only research further if the current increment needs something not covered.
2. **Inventory** — List the technologies, SDKs, and services needed for the current feature/slice that are NOT already covered by `specs/tech-stack.md`
3. **Check skills** — Scan `.github/skills/` for existing skills that cover any of these technologies
3. **Research each technology** — For each item in the inventory:
   a. Query **Microsoft Learn MCP** for Azure/Microsoft technologies
   b. Query **Context7** for latest framework/library docs and examples
   c. Query **DeepWiki** if you need to understand library internals
   d. Query **Azure Best Practices** if Azure resources are involved
   e. Use **Web Search** for recent changelogs or migration guides
4. **Check versions** — Verify that the package versions in `package.json` are current; note any that need updating
5. **Summarize findings** — Produce a concise research summary:
   - Recommended patterns and APIs (with source links)
   - Package versions to use or update
   - Anti-patterns or deprecations to avoid
   - Any relevant skills found in `.github/skills/`
6. **Record in state** — Save key findings in `state.json` under the current feature's metadata so future sessions don't repeat the research

## Output Format

```markdown
## Research Summary: <feature-name>

### Technologies Researched
| Technology | Version | Source | Key Finding |
|------------|---------|--------|-------------|
| @azure/cosmos | 4.2.0 | MS Learn | Use `iterateAll()` instead of `fetchAll()` for large datasets |
| next.js | 15.1.0 | Context7 | Server Actions stable; use `revalidatePath` for cache invalidation |

### Patterns to Follow
- <pattern description> (source: <link>)

### Anti-patterns / Deprecations
- <what to avoid> (source: <link>)

### Package Updates Needed
- <package>: <current> → <recommended> (reason)

### Skills Available
- <skill-name>: <how it applies>
```

## Notes

- **Do not skip this step.** Stale knowledge causes subtle bugs, deprecated API usage, and security vulnerabilities.
- Research is scoped to the current feature — don't boil the ocean.
- If a technology is well-established and unchanged (e.g., basic Express routing), a quick verification is sufficient.
- Cache-friendly: if you researched a technology for Feature A, reuse those findings for Feature B unless the context differs.
