# Walkthrough: Building a Task Board App (Greenfield)

Build a kanban Task Board app — from a one-page PRD to a live Azure deployment — in about 2 hours. This walkthrough mirrors the [spec2cloud Microhack](https://github.com/EmeaAppGbb/spec2cloud-microhack-greenfield) and shows what each phase looks like in practice.

> **The core idea:** The most valuable asset in a codebase is not the code — it's the specification. Code is an implementation detail. With AI agents, it's also increasingly throwable. Given a good enough spec, you can regenerate the implementation at any time. What you can't regenerate is a precise, verified description of what the software is supposed to do.

## What You'll Build

A minimal kanban board: create tasks, move them through *To Do → In Progress → Done*, delete when finished. No login, no database — just an in-memory store. Simple enough to build in one session, complex enough to exercise the full pipeline.

## Starting Point

A one-page PRD you write yourself, describing the Task Board in your own words. 5 user stories is plenty — the agents will ask clarifying questions if anything is ambiguous.

---

## Phase 0: Shell Setup (~15 min)

Create a repo from a shell template and connect to Azure:

```bash
gh repo create my-task-board --template EmeaAppGbb/spec2cloud-shell-nextjs-typescript
cd my-task-board
npm install && cd src/web && npm install && cd ../.. && cd src/api && npm install && cd ../..
azd auth login && azd env new microhack && azd env set AZURE_LOCATION swedencentral
```

You get: Next.js + Express + Playwright + Cucumber + Vitest + Bicep — all pre-wired with Aspire orchestration and 45 agentskills.io skills.

> **Alternative shells:** The same pipeline works with [Python (FastAPI)](https://github.com/EmeaAppGbb/shell-python), [Java (Spring Boot)](https://github.com/EmeaAppGbb/shell-java), or [.NET (ASP.NET Core)](https://github.com/EmeaAppGbb/shell-dotnet). The orchestrator and skills are stack-agnostic.

## Step 1: Write Your PRD (~20 min)

This is the only step where you write anything substantial. Open `specs/prd.md` and describe your Task Board — what it does, who uses it, what the key user stories are, and any constraints (in-memory, no auth).

> **Why this matters:** Your PRD is the ground truth everything traces back to. The more deliberately you write it, the more meaningful the verification is at every downstream gate. Vague requirements lead to passing tests that don't actually prove anything.

Then kick off the orchestrator. Start Copilot CLI in autonomous mode and use fleet to begin:

```bash
copilot --yolo
```

Then in the Copilot session:

```
/fleet I want to start the spec2cloud flow, the prd is already created, lets start with the review process and continue
```

---

## Phase 1: Product Discovery (~30 min)

### 1a — Spec Refinement
The orchestrator reviews your PRD through product and technical lenses, splits it into FRDs, and flags gaps. Expect files like `specs/frd-tasks.md` and `specs/frd-board.md`.

> **💡 Best practice:** Don't just accept the agent's fixes wholesale. Ask it to address gaps **one by one** and really pay attention to each proposed change. It's good practice to run the review multiple times until you're confident the PRD captures exactly what you want. Once the PRD is solid, ask the agent to review each FRD with the same rigour — treat FRDs as first-class specs, not just generated artifacts.

🚦 **Human Gate — spec verification:** Check that every user story from your PRD is represented in an FRD with clear acceptance criteria. If something is wrong here, fix it now — anything that slips through will be tested, implemented, and deployed as-is.

### 1b — UI/UX Design
Interactive HTML wireframe prototypes are generated and served on localhost. Walk through the board layout, task creation, edit/delete flows.

🚦 **Human Gate — prototype verification:** Does the UI match what you had in mind when you wrote the PRD? An adjustment here costs seconds. The same change post-implementation costs much more.

### 1c — Increment Planning
FRDs are broken into ordered increments. A typical plan:

| Increment | What ships |
|-----------|-----------|
| 1 | Walking skeleton — empty board, API health check, wired up and deployed |
| 2 | Task CRUD — create, read, delete tasks; board renders tasks in correct column |
| 3 | Status transitions — move tasks forward/back; edit title and description |

🚦 **Human Gate:** Approve the plan or ask to reorder.

### 1d — Tech Stack Resolution
Every library is inventoried, researched via live docs, and pinned. Output: `specs/tech-stack.md` with ADRs for key decisions.

🚦 **Human Gate:** Tech stack approved.

---

## Phase 2: Increment Delivery (~60–75 min)

Each increment runs four steps automatically:

### Step 1 — Test Scaffolding
Tests are derived **directly from the Gherkin scenarios** in your FRDs — before any implementation code is written:
- **Gherkin feature files** — plain-English scenarios from your acceptance criteria
- **Playwright e2e tests** — browser-level flows (create task → move → delete)
- **Cucumber step definitions** — wiring Gherkin to executable code
- **Vitest unit tests** — API endpoint coverage

🚦 **Human Gate — test verification:** Read the Gherkin scenarios. Do they describe the behaviour you wrote in your PRD? This is the most important gate in the entire pipeline — tests are the spec in executable form. If they're wrong, the implementation will be wrong too, and it will pass every test while doing so.

After approval, the **red baseline** is established: all new tests fail (proving they're real), existing tests still pass.

### Step 2 — Contracts
API contracts, shared TypeScript types, and infrastructure requirements are generated. No human gate — contracts flow directly from the tests.

### Step 3 — Implementation
Three slices run:

| Slice | What gets built |
|-------|----------------|
| **API slice** | Express routes, in-memory store, input validation |
| **Web slice** | Next.js board page, task cards, create/edit form, status controls |
| **Integration** | API + Web running together, full regression green |

> **💡 Try it live:** Aspire is already running in the background. Ask the agent for the Aspire dashboard URL and open your app in the browser. Click around, test the flows, and see if anything feels off. If you spot bugs or issues, ask the agent to fix them — it can use the Aspire and Playwright MCP tools to diagnose and resolve problems interactively. It's much cheaper to catch issues here than after deployment.

🚦 **Human Gate — implementation verification:** Review the diff. Does this match what you approved in the Gherkin? Tests passing is necessary — but not sufficient. You're verifying the *right* implementation, not just a green one.

### Step 4 — Deploy to Azure
```bash
azd provision   # Container Apps, ACR, monitoring
azd deploy      # Build containers, push, deploy
```

Smoke tests run against the live URL — the same tests derived from your spec.

🚦 **Human Gate — deployment verification:** Open the live app and walk through your original PRD user stories. Not the tests — *your original words*.

---

## Verify Your Live App (~10 min)

```bash
azd env get-values | grep SERVICE_WEB_ENDPOINT_URL
```

Open the URL and manually verify:
1. Create three tasks — one for each column
2. Move a task from To Do → In Progress → Done
3. Edit a task title
4. Delete a task

---

## What Just Happened?

| Phase | What the agents did | What you verified |
|-------|-------------------|------------------|
| Spec Refinement | Turned your PRD into traceable FRDs | Every user story is correctly interpreted |
| UI/UX Design | Generated interactive wireframes | The UI matches your intent |
| Increment Planning | Ordered delivery, walking skeleton first | Scope and ordering make sense |
| Tech Stack | Pinned correct library versions via live docs | Stack is appropriate |
| Test Scaffolding | Derived full test suite from FRDs | Tests faithfully express your acceptance criteria |
| Contracts | Generated API specs and shared types | — |
| Implementation | Wrote backend + frontend to make tests green | Implementation matches the Gherkin |
| Deployment | Provisioned Azure infra, ran smoke tests | PRD user stories work end-to-end in production |

You wrote zero production code. You wrote a spec — and that spec drove every test, every line of implementation, and every deployment check.

---

## Tear Down

```bash
azd down
```

---

## Going Further

- **Change your PRD mid-hack:** Add a new user story to an FRD and run Phase 2 for a new increment.
- **Explore the skills:** Read `.github/skills/spec-refinement/SKILL.md` to see how the agent reasons through a spec.
- **Try a different shell:** Replace the TypeScript shell with Python, Java, or .NET — the pipeline doesn't care what stack you're on.
- **Add persistence:** Write a `specs/frd-persistence.md` and let agents wire up Cosmos DB or PostgreSQL.
- **Run the full lab:** The structured [Microhack Lab](https://github.com/EmeaAppGbb/spec2cloud-microhack-greenfield/tree/main/docs/microhack-lab) has challenges, solutions, and detailed facilitator guides.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Agent stuck in a loop | Ask: *"read the resume skill and continue from current state"* |
| Tests failing after implementation | Ask: *"run the test runner skill and fix any failures"* |
| Smoke tests fail after deploy | Agent auto-rolls back — review failure and re-approve |
| Wireframes not loading | Check terminal for the HTTP server URL |

---

[← Back to Examples](../examples/) | [Brownfield: Testable App →](brownfield-testable.md)
