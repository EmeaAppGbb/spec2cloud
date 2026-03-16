# Spec Refinement Checklists

Detailed review checklists for the spec-refinement skill. Run both lenses on every pass. Do not skip items — an unchecked item is a potential defect.

## Product Lens Checklist

### Completeness

- Are all user personas explicitly defined? Can you name every type of user who touches this system?
- Are all user journeys covered end-to-end, from entry point to terminal state?
- Are onboarding, first-use, and returning-user experiences addressed?

### Edge Cases

- What happens with empty data? Zero items, blank fields, no search results?
- What happens at maximum scale? Max characters, max file size, max items in a list?
- What happens with invalid input? Malformed data, wrong types, out-of-range values?
- What happens with concurrent users? Race conditions, stale data, conflicting edits?
- What happens on timeout? Network failure, service unavailable, partial completion?

### Error States

- Every user action must have a defined failure mode. If the user clicks a button and something goes wrong, what do they see?
- Are error messages user-friendly and actionable, not raw stack traces or generic "something went wrong"?
- Are retry, cancel, and undo behaviors defined for destructive or long-running actions?

### Accessibility

- Are WCAG 2.1 AA requirements addressed?
- Is keyboard navigation defined for all interactive elements?
- Are screen reader expectations documented (ARIA labels, landmark roles, live regions)?
- Are color contrast and text sizing requirements stated?

### User Story Quality

- Each story must follow the format: *As a [persona], I want [goal], so that [benefit]*.
- No vague stories. "As a user, I want a good experience" is not a user story.
- Each story must be small enough to implement and verify independently.
- Acceptance criteria must be concrete and testable.

### Conflicting Requirements

- Do any requirements contradict each other? (e.g., "real-time updates" and "batch processing only")
- Are there implicit assumptions that conflict across different sections?
- Do non-functional requirements (performance, security) conflict with functional ones?

### Missing Requirements

- Based on the stated problem, what is NOT listed that should be?
- Are there implied features that users would expect but are not specified?
- Are admin/operator workflows documented, or only end-user flows?

### Security

- Are authentication and authorization requirements defined for every endpoint and action?
- Is data privacy addressed? PII handling, data retention, right to deletion?
- Is input validation specified at every boundary?
- Are audit logging requirements stated for sensitive operations?

## Technical Lens Checklist

### Feasibility

- Can every requirement be built with the chosen stack? Flag anything that requires technology not in scope.
- Are there any requirements that are technically impossible or prohibitively expensive?
- Are there requirements that assume capabilities the target platform doesn't have?

### Performance

- Do any requirements imply high load? (e.g., "all users see updates instantly")
- Are there real-time requirements? What latency is acceptable?
- Are there large data requirements? Bulk imports, large file uploads, full-text search across millions of records?
- Are performance targets quantified (response time, throughput) or left vague?

### Architectural Complexity

- Does this require complex distributed patterns — event sourcing, CQRS, saga orchestration?
- Are there synchronization requirements across multiple services?
- Does the data model require multi-tenancy, soft deletes, or temporal versioning?
- Is the complexity justified by the requirements, or can it be simplified?

### Dependency Risks

- Are there external API dependencies? What are their SLAs, rate limits, and failure modes?
- Are there third-party services that could be deprecated, change pricing, or go down?
- Are there licensing constraints on dependencies?
- What happens when a dependency is unavailable — graceful degradation or hard failure?

### Data Model Implications

- Is the schema complexity proportional to the problem?
- Are relationships (one-to-many, many-to-many) clearly defined?
- Are migration requirements considered? Will schema changes require data backfills?
- Is data consistency model defined (strong, eventual)?

### Security Implications

- What is the attack surface? Every input, API, and integration point is a potential vector.
- Are secrets managed properly? No hardcoded credentials, proper rotation policies?
- Is data encrypted at rest and in transit?
- Are there compliance requirements (SOC 2, GDPR, HIPAA) that affect architecture?

### Scalability

- Will this work at 10x current expected load? 100x? 1000x?
- Are there bottlenecks — single databases, synchronous calls, shared locks?
- Are caching and CDN strategies defined where appropriate?

### Testability

- Can every requirement be verified with an automated test?
- Are there requirements that can only be verified manually? Flag these — they need rethinking.
- Are integration points mockable for testing?
- Are acceptance criteria specific enough to write Gherkin scenarios directly?
