# ADR-0005 — Route by Model Class, not by vendor

**Status:** Accepted · **Date:** design phase · **Supersedes:** —

## Context

Agents need models with different characteristics: deep reasoning for strategy and review, competent
throughput for drafting, cheap and instant for classification and routing, embeddings for retrieval, and
vision for documents. The frontier changes every few months, and any model name written into an agent charter
is a liability with a short half-life.

## Options

1. **Name models in charters.** Direct and legible; requires editing eleven charters every time the frontier
   moves, and mixes a capability decision into a personality document.
2. **One model for everything.** Simple; either wastes money on trivial Turns or under-serves hard ones.
3. **Abstract Model Classes with a deterministic routing table.** Charters request a class; a table maps class
   → provider binding; bindings change without touching agents.
4. **Learned router.** Optimal in principle; non-deterministic, unexplainable, and unbuildable before there is
   usage data.

## Decision

Five classes — `reasoner`, `worker`, `fast`, `embed`, `vision` — with a deterministic routing table from
(class, agent role, Turn kind) to a provider binding. Charters and Work Orders name a class. Escalation is
permitted one class upward, at most twice per Turn, and is logged with its reason.

## Consequences

**Accepted:** an indirection between the agent and the model. Debugging "why was this answer weak" requires
one extra lookup, which the Console's trace view provides directly.

**Accepted:** class boundaries are judgement calls, and a poorly placed boundary shows up as either cost or
quality. The routing table is data with an evaluation set attached, so a boundary change is measurable.

**Gained:** vendor independence is structural rather than aspirational. A new frontier model is a binding
change and an evaluation run, not a migration.

**Gained:** local models slot in as bindings for `fast` and `embed` today and for `worker` later, which is the
mechanism by which 4.0 moves most inference on-device.

**Gained:** determinism. Given the same inputs the router picks the same binding, which makes the cost model,
the budget ceilings, and the cache all tractable.

**Constraint:** 4.0's learned routing must remain deterministic at inference time and must be able to explain
any routing choice with the evidence behind it. A router that cannot be explained does not ship.
