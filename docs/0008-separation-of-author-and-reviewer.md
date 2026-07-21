# ADR-0008 — The author of a Deliverable never reviews it

**Status:** Accepted · **Date:** design phase · **Supersedes:** —

## Context

Principle 5 states separation of powers as a design principle. This ADR records why it is enforced
structurally rather than encouraged in prompts.

Self-review by a language model is weak in a specific and predictable way: asked to critique its own output,
a model tends to defend the framing it has already committed to, and its confidence is correlated with its
fluency rather than with its correctness. The failure is not random — it is systematically biased toward
approving work with exactly the flaws the author was already blind to.

## Options

1. **Prompt the author to self-review.** Free, and it catches surface errors — formatting, arithmetic,
   internal contradiction. It does not catch a wrong framing, a missing consideration, or an unfounded
   assumption, because those are the author's blind spots by definition.
2. **A generic critic agent reviews everything.** One reviewer accumulates enormous context, becomes a
   bottleneck, and lacks the domain grounding to catch specialist errors.
3. **Role-appropriate review by a different agent, structurally enforced.** The orchestrator refuses to mark a
   Deliverable reviewed if `reviewer_id == author_id`.
4. **Principal reviews everything.** Violates Principle 1 outright; the Principal's attention is what the
   product exists to conserve.

## Decision

Option 3, enforced in the orchestrator rather than requested in a charter. A Deliverable's review record names
a reviewer whose ID differs from its author's, and the reviewer is chosen by role: Argus for quality and
correctness, Rune for architecture, Cass for anything with a cost, the department head otherwise. Each holds a
scoped veto.

Self-review still happens — it is a phase of the Turn lifecycle and it catches the cheap class of error — but
it never satisfies the review requirement.

## Consequences

**Accepted:** roughly 30–40% more model spend on any Deliverable that matters. This is the single largest
cost line in the system and it is deliberate. Cheap wrong answers are the failure mode the whole product is
built to avoid.

**Accepted:** latency. A reviewed Deliverable takes longer, and the Progress Spine shows review as a distinct
phase so the wait is legible rather than mysterious.

**Accepted:** review can become theatre — a reviewer that approves everything. This is measured: per-reviewer
rejection rate is a tracked KPI, and a reviewer approving at above 95% is a defect in the charter, surfaced in
the Console.

**Gained:** the Brief can honestly say a Deliverable was reviewed, because the record proves who did it.

**Gained:** the property scales to 3.0's human separation of duties without redesign — it is the same rule at
a different layer.
