# Stack-Specific Implementation Patterns

## Frontend Patterns (Next.js App Router)

This shell uses **Next.js with App Router** (not Pages Router):

- **Pages**: `src/web/src/app/{route}/page.tsx` — every route needs a `page.tsx`
- **Layouts**: `src/web/src/app/{route}/layout.tsx` — shared layout per route segment
- **Route handlers**: `src/web/src/app/api/{route}/route.ts` — API routes using
  `GET`, `POST`, etc. exports
- **Server Components** are the default — use `'use client'` directive only when
  the component needs:
  - `useState`, `useEffect`, `useRef`, or other React hooks
  - Browser APIs (`window`, `document`, `localStorage`)
  - Event handlers (`onClick`, `onSubmit`, etc.)
  - Third-party client-only libraries
- **Loading/Error states**: `loading.tsx` and `error.tsx` per route segment
- **Metadata**: Export `metadata` or `generateMetadata` from `page.tsx`/`layout.tsx`
- **Styling**: Tailwind CSS utility classes — avoid custom CSS unless absolutely
  necessary
- **Data fetching**: Use `fetch()` in Server Components with appropriate caching;
  use React hooks or SWR/React Query in Client Components

## Backend Patterns (Express.js + TypeScript)

This shell uses **Express.js with TypeScript** (not a framework like NestJS):

- **Routes**: Define in modular files under `src/api/src/routes/`:
  ```typescript
  import { Router } from 'express';

  const router = Router();
  router.get('/', getAll);
  router.post('/', create);

  export { router as userRouter };
  ```
- **App setup**: Configure middleware and mount routes in `src/api/src/app.ts`
- **Dependency Injection**: Use factory functions or constructor injection for services
- **Configuration**: Use environment variables via `process.env`, validated in a
  config module
- **Strict TypeScript**: Enabled — all types explicit, no `any`, no implicit returns
- **Async/await**: All I/O-bound operations must be async with proper try/catch
- **Health check**: Already configured at `GET /health`

## API Integration

The frontend calls the backend API via environment variable:

- **`API_URL`**: Set in `src/web/.env.local` for local dev (e.g.,
  `http://localhost:5000`), injected as container env var in production
- Server Components fetch directly: `fetch(\`\${process.env.API_URL}/api/...\`)`
- Client Components use Next.js API routes as a proxy, or fetch from the browser
  if CORS is configured

## State Management

- Prefer **Server Components** with direct data fetching over client-side state
- For interactive UI state, use `useState` / `useReducer` in Client Components
- For shared state across components, lift state up or use React Context
- Avoid external state libraries unless the PRD/FRD requires complex client-side
  state

## Stack-Specific Test Commands

### Contract slice (type checking)

```bash
npx tsc --noEmit --project tsconfig.json
```

### API slice (unit tests)

```bash
# Watch mode for rapid iteration
cd src/api && npm run test:watch

# Single run
cd src/api && npm test
```

### Web slice (build + component tests)

```bash
# Build check
cd src/web && npm run build

# Component tests (if any)
cd src/web && npx vitest run
```

### Integration slice (Cucumber + Playwright per feature)

```bash
# Start Aspire environment
aspire start
aspire wait api --status healthy
aspire wait web --status healthy

# Cucumber for a specific feature
npx cucumber-js --tags "@{feature}"

# Playwright for a specific feature
npx playwright test e2e/{feature}.spec.ts

# Interactive debugging with UI mode
npx playwright test --ui
```

### Regression check (full suite)

```bash
# All backend tests
cd src/api && npm test

# Cucumber.js Gherkin tests
npx cucumber-js

# All Playwright e2e tests
npx playwright test --config=e2e/playwright.config.ts

# Or combined
npm run test:all
```
