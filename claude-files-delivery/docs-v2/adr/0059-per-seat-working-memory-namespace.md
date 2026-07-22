# ADR-0059 — Per-Seat working memory is an isolated namespace, default-deny at the human layer

**Status:** Proposed · **Date:** M21 architecture (3.0 "Chambers") · **Extends:** memory architecture §2, §7; layer model §3

## Context

A colleague composes drafts, accumulates private observations about their own work patterns (the private lane,
memory §7), and holds their own preferences. In a single-Seat Firm all of this is implicitly the Principal's
and lives in global-keyed tables (`preferences`, the private lanes). With a second Seat, that working memory
must belong to *a* Seat, and one Seat must not read another's — the same isolation the department boundary
gives at Layer 3 (layer model §3: "a Department may not reference another Department's internals"), now applied
at the human layer.

The question is whether isolation is a *runtime access filter* over shared storage, or a *property of the
capability model*. A filter can be misconfigured, bypassed, or forgotten on a new query path. The Firm's
existing isolation guarantees — departments, agents — are not filters; they are consequences of default-deny
and a capability grammar that simply cannot express the forbidden access.

## Options

1. **Shared working-memory storage with a `seat_id` filter on every read.** Cheapest, and exactly the design
   that leaks the first time a query forgets the `WHERE seat_id = ?` clause. Isolation-by-filter is isolation
   you can lose in a code review.
2. **A per-Seat working-memory namespace `seat/<id>`, isolated by default-deny in the capability model, so the
   capability to read another Seat's namespace cannot be held.** Isolation is structural, not a runtime check.
3. **A separate encrypted store per Seat.** Strong isolation, but duplicates the memory machinery per Seat and
   fractures the single Vault the whole product rests on — a large mechanism for a boundary the capability
   model already provides.

## Decision

Option 2.

Each Seat receives a working-memory **namespace** `seat/<SeatId>`, provisioned at `provision` and registered in
`seat_working_memory`. It scopes the Seat's working drafts, its private-lane observations, and its Seat-scoped
preferences (`preferences` keys prefixed `seat/<id>/`; the founding Seat inherits every existing global key, so
a single-Seat Firm is unchanged).

Isolation is **default-deny in the capability model**, not a runtime filter. A Seat holds
`mem.read:seat/<id>/**` and `mem.write:seat/<id>/**` only for its own `<id>`. M21 defines **no** capability
grammar that names another Seat's namespace — so the capability a Seat would need to read across Seats is one it
*cannot express or hold*. A cross-Seat read fails at the single Broker as `fenced`, is logged, and is surfaced.
Granting one Seat access to another's namespace would be delegation, which is M22, not M21.

`retire` **seals** the namespace read-only and removes its capabilities from the (now empty) Fence. Content is
retained for attribution and audit — a departed colleague's record survives, unreadable by others in M21 and
unwritable by anyone — consistent with "no hard deletes for records with history"
(`/docs/04-database-design.md` §1.3).

## Consequences

**Accepted: preferences and private lanes gain a Seat scope.** Global-keyed today, Seat-scoped tomorrow, with
the founding Seat inheriting all global keys. A small migration of key shape; no behaviour change for a
single-Seat Firm.

**Accepted: no cross-Seat visibility, even when it would be convenient.** In M21 a Seat genuinely cannot see
another Seat's working memory, full stop. Sharing is a deliberate M22 delegation act, not a default — which is
the correct default for a boundary whose whole purpose is isolation.

**Accepted: the founding Seat's history must be attributed, not migrated wholesale.** Existing global working
memory becomes the founding Seat's namespace by scoping, not by copying — additive, no rewrite.

**Gained: isolation you cannot lose in a code review.** Because the forbidden access has no capability to
express it, a new query path cannot accidentally leak across Seats; the guarantee is a property of the grammar,
not a clause every author must remember.

**Gained: the same mechanism at every layer.** Departments, agents, and now Seats are all isolated by
default-deny and capability scoping — one isolation model, not a special case for humans.

**Gained: a clean seam for M22 delegation.** When cross-Seat sharing arrives, it is a new capability grammar
grant over an existing namespace, not a rework of storage — the boundary is already the right shape to open
deliberately.

**Reversal cost: low.** The namespace is a scope string over the existing memory machinery; collapsing all
Seats to the founding namespace restores single-Seat behaviour, and the `seat/<id>` scoping is additive.
