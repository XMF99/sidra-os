# ADR-0057 — A Seat is a first-class human identity, keyed on the existing actor field

**Status:** Accepted · **Date:** M21 architecture (3.0 "Chambers") · **Realizes:** ADR-0021

## Context

ADR-0021 defined the Seat in 2.0 and shipped exactly one, placing an `actor` field on every event
(`/docs/04-database-design.md` §4) precisely so that admitting a second human later would not require rewriting
a hash-chained log. M21 ships the second Seat. The question this ADR settles is *what a Seat is, in the data
model, and how the founding Seat relates to the history already recorded under the actor value `'principal'`.*

Two failure modes are in play. First, treating a Seat as a variety of agent: agents have charters, Role
Archetypes, KPIs, versions, and autoscaling; a human colleague has none of those and holds authority rather
than performing work. Conflating them puts a human in the delivery line and an agent in the authority seat.
Second, adding a `seat_id` column to `events` and backfilling it — which changes every historical row's
canonical serialization and breaks every hash from that row forward. That is the chain rebuild ADR-0021 was
written to avoid.

## Options

1. **A Seat is a kind of agent, in the `agents` table with a `is_human` flag.** Reuses machinery, but drags
   charter/version/KPI columns onto an entity that has none of those, and lets a `SeatId` be used wherever an
   `AgentId` is expected — the category error that puts a human in the org chart's delivery line.
2. **A Seat is a first-class identity in its own table, bound to the existing actor value; the founding Seat
   binds to `'principal'`.** A separate `seats` table, a disjoint identifier space, and an `actor_value`
   binding computed as a read-time join over `events.actor`. Admitting a Seat appends events and rewrites
   nothing.
3. **A Seat is a first-class identity, and `events` gains a `seat_id` column backfilled from `actor`.** Clean
   forward queries, but the backfill rewrites the chain — the exact cost ADR-0021 paid to avoid.
4. **Start a fresh event chain at 3.0, one chain per Seat.** Avoids touching the old chain, but splits the
   Firm's history at the point it becomes most valuable — the alternative ADR-0021 explicitly rejected.

## Decision

Option 2.

A **Seat** is a first-class human identity, stored in a `seats` table with an identifier space
(`SeatId`, a ULID) **disjoint** from `AgentId`. A Seat has an `actor_value` — the string it writes into the
pre-existing `events.actor` column. The one Seat that has existed since 2.0 is the **founding Seat**, bound to
`actor_value = 'principal'`; it is *materialized* once at migration time, never created through the invite
interface (ADR-0021: "there is no interface for creating a second"). Every other Seat receives a distinct,
permanent, kernel-assigned actor value at acceptance.

Attribution — "which Seat produced event E" — is a **read-time join** from `E.actor` to the Seat whose
`actor_value` matches. Because the founding Seat's actor value is `'principal'`, the entire pre-M21 history is
already attributed to it with **no write to `events`**. Admitting a second Seat appends `Seat*` events and adds
rows to additive tables; it issues no `UPDATE` or `DELETE` against `events` or any historical row's `actor`.

A Seat holds no charter, no Role Archetype, no KPIs, no Turns. It originates work (Directives, Approvals) and
bounds work (its Fence, its budget — ADR-0058) but does not perform it. The type system keeps `SeatId` and
`AgentId` non-interconvertible.

## Consequences

**Accepted: a read-time join instead of a stored column.** "Which Seat acted?" is a join, not a column read,
and per-Seat timeline queries need an index on `events(actor)` (migration 0046). Mildly less convenient than a
denormalized `seat_id`, and the price of never rewriting the chain — a price the whole milestone exists to pay.

**Accepted: two identity spaces to keep disjoint.** Seats and agents are separate tables with separate
identifier types, and code must not blur them. Enforced by types and a CI check; the alternative (one table,
one flag) is the category error itself.

**Accepted: the founding Seat is a special case in the lifecycle.** It skips invite/accept and is materialized
in `Active`. A small irregularity, and the honest representation of a Seat that predates its own creation
interface.

**Gained: the chain is never rewritten.** The founding Seat binds to `'principal'`, so the pre-existing prefix
is byte-identical after a second Seat is admitted and `audit.verify` passes unchanged — the exit criterion,
made structural. This is the entire payoff ADR-0021 deferred to 3.0.

**Gained: the history stays one chain.** No per-Seat chain split; the Firm's whole past remains a single
verifiable log, attributable to Seats by a projection rather than a rebuild.

**Gained: a human is never mistaken for an agent.** Disjoint identifier spaces make "a Seat is not an agent" a
compile-time fact, not a convention, which keeps humans out of the delivery line and agents out of the
authority seat.

**Reversal cost: low.** The `seats` table and the `actor_value` binding are additive; a Firm that never admits
a second Seat is bit-for-bit pre-M21 in behaviour. Removing the binding later is a migration nobody needs to
run — the same low-reversal property ADR-0021 secured.
