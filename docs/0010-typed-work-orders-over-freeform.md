# ADR-0010 — Typed Work Orders over free-form delegation

**Status:** Accepted · **Date:** design phase · **Supersedes:** —

## Context

Kai must hand work to specialists. The obvious mechanism is the one every multi-agent framework uses: pass a
natural-language instruction from one agent to another and let the receiving agent interpret it.

Natural language between agents is lossy in a way that is invisible until it matters. There is no place to put
a budget, no way to express an acceptance criterion the receiver can check itself against, no boundary the
Permission Broker can read, and no artifact that survives the conversation. When the Engagement is inspected
three weeks later, the delegation exists only as prose inside a prompt.

## Options

1. **Free-form message passing.** Flexible, trivially implemented, and structurally unable to carry a budget,
   a fence, an acceptance criterion, or a resumption point.
2. **A rigid function-call schema.** Fully typed and machine-checkable; too brittle for work whose shape is
   not known in advance, which is most of it.
3. **A typed envelope carrying a natural-language body.** Structure where structure has meaning — objective,
   acceptance criteria, budget, deadline, capability set, inputs, effect ceiling, reviewer — and prose where
   nuance has meaning.

## Decision

Option 3. A Work Order is a durable, typed, schema-validated record persisted as an event before the receiving
agent's first Turn begins. Its `brief` field is natural language; everything the system must enforce or
inspect is a field.

## Consequences

**Accepted:** Kai must fill in a structured record rather than write a sentence, which costs tokens and one
schema-validation round-trip on malformed output. Validation failures re-prompt with the validator error,
which resolves almost all of them.

**Accepted:** a fixed set of fields will occasionally be a poor fit for an unusual task. Adding a field
requires an ADR, deliberately, because delegation is the most load-bearing interface in the system and it
should be difficult to widen casually.

**Gained:** budgets are enforceable, because the ceiling is a number in a record rather than a wish in a
sentence.

**Gained:** the Permission Broker can read the capability set before the first Turn, so a Work Order that
requests more than its issuer holds is refused at issue time rather than discovered mid-execution.

**Gained:** durability. A Work Order survives a crash and resumes, because it is state rather than
conversation — which is what makes the `kill -9` guarantee possible for delegated work.

**Gained:** acceptance criteria written by the delegator and checkable by the reviewer, which is what makes
ADR-0008's separation meaningful. Without them the reviewer is guessing at the standard.

**Gained:** the Engagement tree is a real data structure, so the Progress Spine, the trace view, cost
attribution, and Brief provenance all read from one source instead of parsing prose.
