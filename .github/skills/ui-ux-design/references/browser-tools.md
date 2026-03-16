# Browser Tools Reference

Reference for browser tool usage during UI/UX prototyping — Steps 5, 6, and 7.

## Tool Reference

| Tool | Purpose | Example |
|------|---------|---------|
| `browser_navigate` | Open served prototype: `http://localhost:3333` or a specific page | Navigate to index or `http://localhost:3333/dashboard.html` |
| `browser_take_screenshot` | Capture current page state to show the human | Screenshot after each navigation or interaction |
| `browser_snapshot` | Get accessibility tree — verify semantic HTML, labels, headings | Verify `data-testid` attributes, heading hierarchy, ARIA labels |
| `browser_click` | Click buttons, links, navigation items to test interactions | Test navigation flow, modal triggers, form submissions |
| `browser_fill_form` | Fill in form fields to test input flows | Fill login form, registration form, search fields |
| `browser_type` | Type into text inputs | Enter text in search bars, text areas, input fields |
| `browser_resize` | Test responsive layouts at different breakpoints | `{width: 375, height: 667}` (mobile), `{width: 1280, height: 800}` (desktop) |
| `browser_evaluate` | Run JS to inspect state, trigger animations, or test dynamic behavior | Check form validation state, toggle visibility, inspect DOM |

## Step 5: Serve & Browse Prototypes

### Starting the Server

```bash
npx serve specs/ui/prototypes --listen 3333
```

The human can also browse `http://localhost:3333` directly in their own browser while you work.

### Browser Walkthrough Procedure

1. **Navigate** to `http://localhost:3333` (the index page) using `browser_navigate`
2. **Take screenshots** of each screen using `browser_take_screenshot` to capture the current state
3. **Interact** with the prototype using `browser_click`, `browser_fill_form`, `browser_type` — test navigation, forms, buttons, modals
4. **Capture accessibility snapshots** using `browser_snapshot` to verify semantic HTML, heading hierarchy, ARIA labels
5. **Test responsive layouts** with `browser_resize`:
   - Mobile: `{width: 375, height: 667}`
   - Desktop: `{width: 1280, height: 800}`
   - Screenshot at each breakpoint
6. **Walk through each FRD flow** end-to-end — navigate between screens, fill forms, click through the user journey, screenshot each step

## Step 6: Walkthrough Generation with Browser Tools

During walkthrough generation, use browser tools to capture visual evidence:

1. **Start at the index page** — `browser_navigate` to `http://localhost:3333`
2. **For each FRD flow:**
   - Navigate to the starting screen for the flow
   - Take a screenshot at each step of the user journey
   - Use `browser_click` and `browser_fill_form` to simulate user actions
   - Capture the result of each interaction with `browser_take_screenshot`
3. **Test edge cases:**
   - Empty states (no data loaded)
   - Error states (invalid form input, failed actions)
   - Loading states (if prototyped)
4. **Capture responsive views:**
   - `browser_resize` to mobile dimensions, screenshot key screens
   - `browser_resize` back to desktop, screenshot the same screens
5. **Save all screenshots** — reference them in `specs/ui/flow-walkthrough.md` and embed in `specs/ui/walkthrough.html`

## Step 7: Human Review Loop with Browser Tools

During the feedback iteration cycle:

### Presenting the Design

1. Walk through the prototype live using `browser_navigate`, `browser_click`, and `browser_take_screenshot`
2. Show the human each screen with screenshots — don't just describe, show
3. Point out the served URL (`http://localhost:3333`) so the human can browse independently

### Incorporating Feedback

1. After editing prototype HTML files, **reload in the browser**:
   - Use `browser_navigate` to the same URL to pick up changes
   - Take new screenshots to show the updated version
2. If a component changed:
   - Navigate to each screen that uses the component
   - Screenshot to verify consistent updates across screens
3. If navigation flow changed:
   - Walk through the entire flow again end-to-end
   - Screenshot each step to verify the new flow works
4. **Accessibility re-check:**
   - Run `browser_snapshot` after significant changes
   - Verify heading hierarchy and ARIA labels are still correct

### Feedback-to-Specs Loop

When human feedback reveals missing requirements or ambiguous flows:
1. Update the relevant FRD(s) and/or PRD
2. Add a `[UI-REVISED]` annotation at the top of changed FRD sections
3. Document what changed and why in the FRD's revision history
4. Update prototypes to reflect the spec change
5. Reload and re-screenshot to confirm the update
