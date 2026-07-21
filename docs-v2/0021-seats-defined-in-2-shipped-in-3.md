# ADR-0021 — Seats defined in 2.0, shipped in 3.0

**Status:** Accepted · **Date:** v2 design phase

## Context

Sidra OS v2's mission is to be the internal operating system of a technology company. Companies have
employees. The obvious inference is that v2 should support multiple humans.

v1's roadmap places multi-Principal at 3.0 "Chambers", with a stated dependency: connectors before
multi-user, because shared context is worthless without external data. That reasoning is still sound.

But there is a structural trap. The audit chain, the event log, the Fence model, and the budget model were
all built for one actor. Adding a second actor later means adding an actor field to a hash-chained log —
which is not a schema migration, it is a chain that has to be rewritten, and a hash chain you have rewritten
is a hash chain that has lost its point.

## Options

1. **Ship multi-Seat in 2.0.** Meets the company mission directly. Requires per-Seat Fences, budgets, working
   memory, delegation across humans, and separation of duties at the human layer — a release-sized amount of
   work that would displace the department architecture that makes the Firm useful to *anyone*.
2. **Ignore Seats until 3.0.** Simplest. Requires rewriting the audit chain when it arrives, and the cost of
   that grows with every Engagement recorded before it.
3. **Define the Seat concept in 2.0; ship exactly one.** The schema, the org graph, the audit chain, and the
   capability model all carry a Seat identity from 2.0. Multi-Seat behaviour ships in 3.0.
4. **Ship a read-only second Seat in 2.0.** Half the work, most of the risk, and a feature nobody asked for
   in the form nobody wanted.

## Decision

Option 3.

A **Seat** is a human identity with its own Fences, budget, and working memory. From 2.0:

- Every event carries a Seat ID.
- Every Fence, budget, and working-memory scope is expressed against a Seat.
- The org graph knows that authority flows from a Seat, not from "the Principal" as a singleton.
- Exactly one Seat exists, and there is no interface for creating a second.

3.0 adds Seat creation, per-Seat Fences and budgets in the UI, cross-Seat delegation, and separation of
duties at the human layer — the Principle 5 analogue for humans that v1's roadmap already describes.

## Consequences

**Accepted: work in 2.0 that delivers nothing in 2.0.** A Seat ID on every event, used by nobody, is pure
cost against Principle 1's demand that everything justify itself. The justification is entirely about 3.0,
and it is the kind of justification that deserves scepticism — which is why it is an ADR rather than an
implementation note.

**Accepted: a concept in the vocabulary with no visible referent.** "Seat" appears in the schema and the
glossary; a 2.0 Principal never encounters it. Mildly confusing to a new engineer, and the glossary entry
says so.

**Accepted: the guess may be wrong.** If 3.0's multi-Seat design differs from what 2.0 anticipated, some of
this preparation is wasted. Bounded by keeping the preparation minimal: an identity field and a scope, not a
permission model.

**Gained: the audit chain never needs rewriting.** This is the entire argument. A hash-chained log that must
be rebuilt to add an actor is a log whose integrity guarantee was retroactively conditional, and the
alternative — starting a new chain at 3.0 — splits the Firm's history at exactly the point where it becomes
most valuable.

**Gained: 3.0's cost drops substantially.** Multi-Seat becomes a UI and policy release rather than a schema
and integrity release.

**Gained: honesty about the mission gap.** Sidra Systems is a company and will want colleagues in the system
before 3.0. This ADR states plainly that they will not have them, and why, rather than leaving the mission
statement to imply otherwise.

**Reversal cost: low.** An unused identity field can be ignored. Removing it later is a migration nobody
needs to run.
