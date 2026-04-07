# Core DDD Concepts

Use these concepts when applying the `ddd-modeling` skill:

- **Ubiquitous Language** — a shared business vocabulary used consistently in
  specs, diagrams, contracts, and code.
- **Subdomains** — core, supporting, and generic parts of the business problem.
- **Bounded Contexts** — explicit semantic boundaries where a model is valid.
- **Context Map** — relationships between bounded contexts and their integration
  patterns.
- **Aggregates** — consistency boundaries that protect invariants.
- **Entities and Value Objects** — identity-bearing versus attribute-based
  concepts.
- **Domain Services** — business operations that do not belong naturally to a
  single entity or value object.
- **Domain Events** — meaningful business facts that other contexts may react to.
- **Anti-Corruption Layer** — an adapter that protects one context from another
  context's model.

## Recommended Reading

- Eric Evans — *Domain-Driven Design: Tackling Complexity in the Heart of Software*
- Vaughn Vernon — *Implementing Domain-Driven Design*
- Alberto Brandolini — *Introducing EventStorming*
- Vlad Khononov — *Learning Domain-Driven Design*
- Greg Young — writings and talks on aggregates, events, and consistency boundaries
