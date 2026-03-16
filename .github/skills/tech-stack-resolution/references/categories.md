# Technology Categories Reference

Systematically evaluate each category. Not every project needs every
category — skip what's irrelevant.

## 1. Data Storage

- **Questions:** Does the app need persistent data? What's the data model
  (relational, document, key-value, graph)? What volume and access patterns?
- **Options to evaluate:** Azure Cosmos DB (NoSQL), Azure Database for
  PostgreSQL, Azure SQL, SQLite (dev/small), Azure Table Storage
- **Resolve:** Which database, which SDK, connection pattern (connection string
  vs. managed identity), data modeling approach, migration strategy

## 2. Caching

- **Questions:** Does the app need caching? What data is cached (sessions, API
  responses, computed results)? What's the invalidation strategy?
- **Options to evaluate:** Azure Managed Redis, in-memory (Node.js Map/LRU),
  CDN caching (static assets), Next.js ISR/SSG
- **Resolve:** Whether caching is needed, which layer(s), invalidation strategy,
  TTL defaults

## 3. AI / Machine Learning

- **Questions:** Does the app use AI? What capabilities (text generation, image
  generation, embeddings, classification)? What models?
- **Options to evaluate:** Azure OpenAI Service (GPT-4o, GPT-5, DALL-E), GitHub
  Models, Hugging Face, custom models
- **Agent frameworks:** LangGraph.js, Semantic Kernel, AutoGen, direct SDK
- **Frontend integration:** CopilotKit, Vercel AI SDK, custom streaming
- **Resolve:** Which models, which framework, streaming patterns, token limits,
  cost considerations, fallback models

## 4. Voice / Speech

- **Questions:** Does the app need voice input, voice output, or real-time voice
  conversation?
- **Options to evaluate:** Azure Speech Services (STT/TTS), Azure Voice Live API
  (real-time), Web Speech API (browser-native), Whisper
- **Resolve:** Which service, real-time vs. batch, language support, audio
  format, latency requirements

## 5. Authentication & Authorization

- **Questions:** Who are the users? How do they authenticate? What authorization
  model?
- **Options to evaluate:** Microsoft Entra ID (enterprise), MSAL.js,
  NextAuth.js, API keys (service-to-service), Azure AD B2C (consumer)
- **Resolve:** Auth provider, token management, session strategy, role-based
  access, protected routes (frontend + API)

## 6. Real-time Communication

- **Questions:** Does the app need real-time updates? Push notifications? Live
  collaboration?
- **Options to evaluate:** Azure SignalR, Azure Web PubSub, Server-Sent Events,
  WebSockets (raw), polling
- **Resolve:** Which mechanism, scaling model, reconnection strategy, message
  format

## 7. Search

- **Questions:** Does the app need search beyond simple database queries?
  Full-text? Semantic/vector?
- **Options to evaluate:** Azure AI Search (full-text + vector + semantic),
  database full-text search, client-side filtering, Algolia
- **Resolve:** Search type, indexing strategy, query patterns, relevance tuning

## 8. File Storage

- **Questions:** Does the app handle file uploads, downloads, or media? What
  formats and sizes?
- **Options to evaluate:** Azure Blob Storage, Azure Files, CDN integration,
  local filesystem (dev only)
- **Resolve:** Storage type, upload flow (direct vs. presigned URLs), CDN
  configuration, access control

## 9. Messaging & Events

- **Questions:** Does the app need async processing, event-driven workflows, or
  service-to-service messaging?
- **Options to evaluate:** Azure Service Bus (queues/topics), Azure Event Grid,
  Azure Event Hubs, direct HTTP calls
- **Resolve:** Messaging pattern, retry/dead-letter strategy, ordering
  guarantees, throughput needs

## 10. Observability & Monitoring

- **Questions:** How is the app monitored? What metrics, logs, and traces are
  needed?
- **Options to evaluate:** Azure Application Insights, Azure Monitor, structured
  logging (pino), custom metrics, OpenTelemetry
- **Resolve:** Telemetry SDK, log levels, custom events/metrics, alert
  thresholds, dashboard needs

## 11. Infrastructure & Deployment

- **Questions:** Where does the app run? How does it scale? What's the
  networking model?
- **Options to evaluate:** Azure Container Apps, Azure App Service, Azure Static
  Web Apps, Azure Kubernetes Service
- **Resolve:** Hosting platform per service, scaling rules, environment
  variables, managed identity, networking (VNET, ingress)

## 12. Frontend Libraries

- **Questions:** What UI component library? State management? Form handling?
  Data fetching?
- **Options to evaluate:**
  - Components: shadcn/ui, Radix UI, Headless UI, Material UI, custom
  - State: React Context, Zustand, Jotai, Redux (unlikely for new projects)
  - Forms: React Hook Form, Formik, native forms
  - Data fetching: SWR, TanStack Query, native fetch
- **Resolve:** Component approach, state management pattern, form validation
  library, data fetching strategy

## 13. Backend Libraries

- **Questions:** What ORM/data access? Validation? Rate limiting? Background
  jobs?
- **Options to evaluate:**
  - Data access: Prisma, Drizzle, raw Azure SDKs, TypeORM
  - Validation: Zod, Joi, class-validator
  - Rate limiting: express-rate-limit, Azure API Management
  - Background: BullMQ, Azure Functions (timer triggers), in-process
- **Resolve:** Data access pattern, validation library, middleware stack

---

## Tech Stack Document Template

Use this structure for `specs/tech-stack.md`:

```markdown
# Tech Stack

## Overview
[Brief summary of the application's technology footprint]

## Resolved Technologies

### [Category Name]

#### [Technology Name]
- **Purpose:** Why this technology is needed
- **Choice:** [Selected option] (over [alternatives considered])
- **Version:** [exact version to use]
- **Rationale:** Why this was chosen
- **Wiring:**
  - SDK/package: `npm install [package]`
  - Configuration: [env vars, config files]
  - Integration pattern: [code snippet or description]
- **Deployment:**
  - Azure resource: [Bicep resource type]
  - Environment variables: [list]
  - Managed identity: [yes/no, role assignments needed]
- **Key Patterns:**
  - [Pattern to follow with brief example]
- **Anti-patterns:**
  - [What to avoid and why]
- **Documentation:** [Link to authoritative docs]

## Infrastructure Resources

[Summary table of all Azure resources needed across all increments]

| Resource | Type | Purpose | First Needed In |
|----------|------|---------|-----------------|
| ... | ... | ... | ... |

## Per-Increment Technology Map

[Which technologies each increment uses]

| Increment | Technologies Used |
|-----------|-------------------|
| walking-skeleton | Express, Next.js, Container Apps, App Insights |
| resource-crud | + Cosmos DB, Zod validation |
| ai-generation | + Azure OpenAI, LangGraph, CopilotKit |
```
