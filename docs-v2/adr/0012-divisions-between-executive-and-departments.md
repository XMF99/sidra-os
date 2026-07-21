# ADR-0012 — Divisions between the Executive and Departments

**Status:** Accepted · **Date:** v2 design phase · **Supersedes:** the four-department structure in
`/docs/03-agents/02-org-chart.md` §1, and the autonomous delegation depth of 2 in
`/docs/03-agents/04-ceo-protocol.md`

## Context

v1 had one Executive and four departments. Kai's span of control was four, comfortably inside any workable
bound, and the delegation path was two hops: Kai → head → specialist.

The enterprise mission requires twenty-one departments. Kai supervising twenty-one is not a structure; it is
a queue with a person at the front of it. Every Directive would pass through one agent holding twenty-one
domains in context, and that agent's context frame would be the system's bottleneck, its blast radius, and
its cost centre simultaneously.

## Options

1. **Flat: Kai supervises twenty-one departments.** No new concept. Kai's frame must hold twenty-one domain
   summaries; routing quality degrades as departments are added; the fast lane cannot be preserved because
   Kai must reason about the whole catalogue on every Directive.
2. **Deeper departments: fewer, larger departments with sub-departments.** Preserves span of control by
   nesting. But "Backend" and "Frontend" inside a "Software" department that also contains "Mobile" produces
   a department whose boundary means nothing — and Principle 11 says a department is a boundary.
3. **Divisions: a routing and arbitration layer between the Executive and Departments.** One new concept.
   Kai supervises eight; each Division supervises one to four departments.
4. **Dynamic routing with no fixed hierarchy** — a router selects departments per Directive with no standing
   structure. Maximally flexible; no stable place for budget allocation, cross-department arbitration, or
   accountability, and no stable object for the Principal to form a mental model of.

## Decision

Option 3. Eight Divisions: Engineering, Platform, Intelligence, Security, Product, Game Studio, Commercial,
Corporate.

A Division routes, arbitrates, and holds budget. It performs no domain work — ADR-0004's five-tool
constraint extends to every Division executive.

Autonomous delegation depth rises from 2 to 3 (Kai → Division → Department → specialist), and the fast-lane
target rises from 50% to 65% to compensate.

## Consequences

**Accepted: one more hop.** Every non-fast-lane Directive traverses an additional routing step, costing
latency and a model call. Mitigated by making the routing deterministic wherever the Directive names a known
department, artifact path, or Application — Principle 8 — and by raising the fast-lane target so that most
Directives never see the Division layer at all.

**Accepted: two new named agents.** Corvus and Lyra. Thirteen named agents instead of eleven, which is real
pressure on Principle 10's small memorable cast. Bounded by a hard limit of eight Divisions.

**Accepted: a layer that could become bureaucracy.** A Division executive with nothing to arbitrate is
overhead with a name. Mitigated by the same quarterly review that governs departments (Principle 13) and by
the rule that a Division of one is legitimate when independence requires it (Security) and suspicious
otherwise.

**Gained: Kai's frame stays constant as the Firm grows.** Kai reasons about eight Divisions whether the Firm
runs seven departments or twenty-one. This is the property that makes the architecture scale past twenty-one
without a further redesign.

**Gained: a stable place for budget and arbitration.** Division budget allocation is a natural unit;
cross-department conflicts within a Division resolve one level below Kai; only cross-Division conflicts reach
the Executive.

**Gained: v1's four department names survive as Division names** with expanded membership, so the reorganisation
reads as growth rather than replacement.

**Reversal cost: moderate.** Removing Divisions means re-pointing every department's reporting line and
Kai's routing table — both manifest data. Nothing in the event log becomes invalid, because a Division is a
field on a record, not a container.
