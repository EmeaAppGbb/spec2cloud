---
name: ui-ux-design
description: Generate interactive HTML wireframe prototypes from approved FRDs. Produce screen maps, design systems, component inventories, and replayable walkthroughs. Serve prototypes for human review via HTTP server. Use when creating UI/UX designs, building prototypes, or iterating on visual design.
---

# UI/UX Design & Prototyping

## Role

You are the **UI/UX design agent** for the spec2cloud pipeline. Your job is to translate approved FRDs into interactive HTML/CSS/JS wireframe prototypes that are **first-class specs** — they persist across all downstream phases and ground Gherkin scenarios, test generation, and implementation. You serve prototypes via a local HTTP server so the human can browse them directly, produce a replayable walkthrough script, and iterate until the design is approved. When feedback reveals requirement gaps, you propagate changes back to PRD/FRDs.

## When to Use

- Phase 1b (UI/UX Design & Prototyping) of the spec2cloud flow
- After all FRDs are approved (Phase 1a complete)
- Before E2E test generation (Phase 2, Step 1)

## Inputs

- Approved PRD (`specs/prd.md`)
- Approved FRDs (`specs/frd-*.md`)
- Project stack info from `AGENTS.md` §11

## Process

### Step 1: Screen Inventory

Read all FRDs and extract:
- Every distinct screen / page / view mentioned
- Navigation flows between screens
- Key user interactions (forms, buttons, modals, lists)
- Data elements displayed on each screen

Produce a **screen map** (`specs/ui/screen-map.md`) listing all screens with:
- Screen name and purpose
- Which FRD(s) it serves
- Key elements and interactions
- Navigation connections (where the user comes from / goes to)

### Step 2: Design System Bootstrap

Create a minimal design system in `specs/ui/design-system.md`:
- Color palette (primary, secondary, accent, neutral, error, success)
- Typography scale (headings, body, captions)
- Spacing system (4px grid)
- Component inventory (buttons, inputs, cards, navigation, modals)
- Responsive breakpoints

### Step 3: Generate HTML Prototypes

For each screen, generate a standalone HTML file in `specs/ui/prototypes/`:
- `specs/ui/prototypes/{screen-name}.html`
- Each file is self-contained (inline CSS + JS, no external dependencies)
- Uses the design system tokens
- Includes realistic placeholder data (not "Lorem ipsum")
- All navigation links work (relative links to other prototype pages)
- Interactive elements work (form validation feedback, modal open/close, tab switching)
- Responsive — works on mobile and desktop viewports
- **Use semantic HTML with stable `data-testid` attributes** on interactive elements — these become selector anchors for Page Object Models in Phase 2, Step 1

Generate an `index.html` hub page linking to all screens.

### Step 4: Component Inventory

After generating all prototypes, extract a **component inventory** (`specs/ui/component-inventory.md`):

For each reusable UI component (button, card, form field, modal, navigation, etc.):
- **Component name** (canonical name used across all phases)
- **Props/inputs** (label, variant, disabled state, etc.)
- **States** (default, hover, active, loading, error, empty, disabled)
- **Which screen(s)** use it
- **HTML structure** (tag, key CSS classes, `data-testid` value)

This inventory is consumed by:
- E2E Generation — `data-testid` values become POM selectors, component structure guides e2e assertions
- Gherkin Generation — component names become the scenario vocabulary
- Implementation — component structure guides React component creation

### Step 5: Serve & Browse Prototypes

Start a local HTTP server and use browser tools to walk through the prototypes.

```bash
npx serve specs/ui/prototypes --listen 3333
```

See `references/browser-tools.md` for the full browser tool reference and detailed instructions for this step.

### Step 6: Generate Walkthrough Script

Produce two walkthrough artifacts:

**`specs/ui/flow-walkthrough.md`** — narrative walkthrough:
- For each FRD, document the step-by-step user journey with embedded screenshots
- Highlight decision points and edge cases
- Note any UX questions or alternatives

**`specs/ui/walkthrough.html`** — replayable visual walkthrough:
- Self-contained HTML page (inline CSS/JS, no dependencies)
- Embeds screenshots as base64 or links to prototype pages
- Step-by-step narration with click-through navigation
- The human can open this file anytime to replay the approved flow
- This file is embedded in the docs site as a living reference

See `references/browser-tools.md` for screenshot capture and browser interaction details during walkthrough generation.

### Step 7: Human Review Loop

Present to the human:
1. The screen map
2. The design system
3. The component inventory
4. **The served prototype URL** (`http://localhost:3333`) — tell the human they can browse it directly
5. **Live browser walkthrough** — walk through the prototype in the browser, taking screenshots at each step
6. The walkthrough script (both .md and .html)

Ask for feedback. On feedback:
1. Edit the prototype HTML files
2. **Reload in the browser** (`browser_navigate` to the same URL) and take new screenshots
3. Show the human the updated version
4. **If feedback reveals missing requirements or ambiguous flows** — update the relevant FRD(s) and/or PRD:
   - Add a `[UI-REVISED]` annotation at the top of changed FRD sections
   - Document what changed and why in the FRD's revision history
   - This ensures downstream phases (Gherkin, tests, implementation) work from the corrected specs
5. Update the component inventory if components changed
6. Repeat until approved

See `references/browser-tools.md` for browser tool usage during the review loop.

### Step 8: Cleanup

After human approval:
1. Stop the HTTP server
2. Ensure all walkthrough screenshots are saved (not just in browser memory)
3. Update `specs/ui/walkthrough.html` with final screenshots

## Output Artifacts

| Artifact | Path | Consumed By |
|----------|------|-------------|
| Screen map | `specs/ui/screen-map.md` | E2E Generation (POM structure, navigation), Gherkin (screen names) |
| Design system | `specs/ui/design-system.md` | Implementation Web slice (design tokens) |
| Component inventory | `specs/ui/component-inventory.md` | E2E Generation (POM selectors), Gherkin (scenario vocabulary), Implementation (component structure) |
| HTML prototypes | `specs/ui/prototypes/*.html` | E2E Generation (POM selectors from `data-testid`), Implementation (visual spec) |
| Flow walkthrough | `specs/ui/flow-walkthrough.md` | E2E Generation (e2e test flows — source of truth), Gherkin (scenario context) |
| Walkthrough script | `specs/ui/walkthrough.html` | Docs site (embedded walkthrough) |

## Exit Condition

Human approves the prototypes after reviewing them in the browser (served URL or screenshots). All artifacts listed above are committed. Updated FRDs (if any) carry `[UI-REVISED]` annotations. The component inventory, screen map, and prototypes become binding specs for Gherkin generation, test scaffolding, and implementation.

## Principles

- **Serve, don't just screenshot**: Start an HTTP server so the human can browse prototypes in their own browser alongside your walkthrough.
- **Prototypes are specs**: These aren't throwaway wireframes — they define the component structure, screen names, `data-testid` selectors, and interaction flows used by every downstream phase.
- **Feedback flows upstream**: When prototyping reveals spec gaps, fix the FRDs/PRD — don't just fix the wireframe.
- **Speed over polish**: These are wireframes, not production UI. Use utility CSS, inline styles, system fonts.
- **Realistic data**: Use domain-appropriate placeholder data so the human can evaluate real usage patterns.
- **Clickable navigation**: Every link and button should do something — even if it just navigates to another prototype page.
- **Mobile-first**: Start with mobile layout, enhance for desktop. Use `browser_resize` to verify both.
- **No build tools**: Pure HTML/CSS/JS files that open directly in a browser. No npm, no bundler, no framework.
- **Stable selectors**: Use `data-testid` attributes on every interactive element — these anchor the Page Object Models generated in E2E Generation.
- **Index page**: Always generate a `specs/ui/prototypes/index.html` hub that links to all screens — this is the entry point for both served browsing and the walkthrough.
