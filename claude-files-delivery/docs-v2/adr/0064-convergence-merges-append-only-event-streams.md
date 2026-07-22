# ADR-0064 — Convergence merges append-only event streams under a deterministic total order

**Status:** Proposed · **Date:** 3.0 "Chambers" design phase · **Milestone:** M24 · **Supersedes:** —

## Context

M24 must let two devices that diverged offline converge on one shared history (`/MILESTONE_REGISTRY.md` §4).
The substrate is ADR-0002's append-only, hash-chained event log, of which every table is a projection
(`/docs/04-database-design.md` §1). The naive multi-device design diffs and patches the projection tables
between devices — but a projection has no history to protect, so "resolving" a projection difference means
picking one row and discarding the other: a silent overwrite, the one move the product exists to refuse
(`/docs/02-principles.md`, ADR-0002).

The event log offers a fundamentally different framing. Because it is the source of truth and everything else
derives from it, two divergent Vaults are two **grow-only sets of events**, and convergence is their **union**
— an operation that, by construction, drops nothing. `/docs/09-scalability.md` §4 anticipated exactly this:
"replicate the event log, not the tables … events carry `(device, seq)` … this makes sync a well-understood
append-and-merge problem instead of row-level conflict resolution." M24 is where that sketch becomes a
mechanism, and it needs a decision on record because it changes the event log's scope from one global chain to
one chain per device.

## Options

1. **Diff-and-patch the projection tables.** Simple to picture, and structurally a last-writer-wins overwrite
   machine: a projection has no history, so any disagreement is resolved by deletion. Fails the exit criterion
   by design.
2. **Replicate events; union them; order by arrival.** Loses nothing (union), but "order by arrival" makes the
   merged history depend on which device synced first, so two devices computing from the same set could get
   different projections. Convergence would not be a property of the set, and the merge would be neither
   commutative nor associative.
3. **Replicate events; union them; order by a deterministic key that is a pure function of each event.** Loses
   nothing (union) and converges (every device with the same set computes the same order and therefore the
   same projections). The merge is commutative and associative over event sets. Requires a per-event ordering
   key (a hybrid logical clock plus device identity) and a shift from one global sequence to one chain per
   device.
4. **A CRDT for every projection type.** Convergent by construction, but it dissolves the single source of
   truth into dozens of per-type merge semantics, and it makes "no silent overwrite" a property of each CRDT
   rather than a single auditable rule. The event log already gives grow-only-set semantics for free; layering
   CRDTs on top buys convergence the log already provides at the cost of the log's legibility.

## Decision

**Option 3.** Multi-device convergence is the **union of append-only, per-device event streams**, materialized
in a single total order by a key that depends only on the event:

```
order_key(e) = (e.hlc.wall_ms, e.hlc.counter, e.device_id, e.device_seq)
```

- Each device maintains its own append-only, hash-chained stream (`prev_hash` links within that device only).
- Convergence unions the streams by `(device_id, device_seq)` identity — **no event is dropped**.
- The merged history is the union sorted by `order_key`, a strict total order and a pure function of the set —
  so every device computes the same history and the same projections, and the merge is commutative and
  associative.
- Projections are rebuilt locally from the merged log; the merged order is materialized as an index, never as
  a rewritten chain (see ADR-0066).

The global `events.seq` (`AUTOINCREMENT`) is retained as the local materialization cursor; cross-device
identity is `(device_id, device_seq)`.

## Consequences

**Accepted: the event log's scope narrows from one global chain to one chain per device.** This is a real
conceptual change to ADR-0002's model, which assumed one writer. It is additive — a single-device Firm has one
chain, exactly the old chain (byte-identical, M24 AC12) — but it is a change, which is why it is an ADR.

**Accepted: every event now carries a hybrid logical clock and device provenance.** Storage per event grows by
a few fields, and every write path stamps them. Bounded and cheap; the log's growth envelope
(`/docs/04-database-design.md` §9) is otherwise unchanged.

**Accepted: the total order can differ from wall-clock intuition under clock skew.** The order is deterministic
regardless, and where it matters (a projection conflict) the result is a Decision, not a silent value
(ADR-0065). So skew is a cosmetic surprise, never a correctness failure.

**Gained: convergence is provable, not hoped for.** "Two devices converge" becomes "they hold the same set,
and the order is a pure function of the set" — a property test, not a field report (M24 AC6). No leader, no
quorum, no lock: devices gossip pairwise and converge because the math says they must.

**Gained: nothing is ever lost.** A union is monotone. The most dangerous outcome of sync — a device's work
vanishing — is structurally impossible, and provable by set equality (M24 AC3).

**Gained: the source of truth stays singular.** Convergence is expressed entirely in terms of the event log
the Firm already had; no second merge substrate, no per-type CRDT zoo, no new thing to audit.

**Reversal cost: high once devices have diverged and converged.** The per-device chain and the ordering key
become load-bearing the moment a second device records events; unwinding to a single global chain would mean
re-deriving a global sequence over histories that were legitimately concurrent — which is the chain rewrite
ADR-0021 spent 2.0 avoiding. The decision is cheap to make now (one device, dormant path) and expensive to
reverse later, which is the argument for settling it before M24 ships.
