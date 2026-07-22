# ADR-0069 — Calibration is a revertible projection over local outcome records, never a telemetry channel

**Status:** Proposed · **Date:** M26 architecture phase (4.0 "Continuum")

## Context

M26 opens release 4.0 "Continuum" — the release in which the Firm improves itself. The Mission Engine already
writes an **outcome record** at every conclusion (plan versus reality: estimated cost and duration against
actual, which risks materialised, how novelty scored — `MISSION_ENGINE_ARCHITECTURE.md` §23.3), and it already
*promises* to use them: §23.2 says historical actuals "replace heuristic estimates with measured ones" and
§23.3 states the loop "calibrates estimates, novelty scores, and risk weights." Through M25 nothing keeps that
promise — the records accumulate and the estimates stay heuristic.

M26 closes the loop. But "the Firm learns from its own history" is exactly the shape that tempts two failures
4.0 exists to prevent. The first is a **telemetry shortcut**: an aggregate error number is small, numeric, and
apparently harmless, so "just send us the average estimate error" looks reasonable — and it is the precise
thing ADR-0009 (`/docs/0009-no-telemetry.md`) forbids absolutely. M26 is the first milestone that most tempts
that shortcut. The second is **irreversibility**: parameters that mutate in place, on the basis of the Firm's
own history, are one poisoned record away from silently changing behaviour a Principal cannot inspect or undo —
the un-revertible black box 4.0 is gated against.

So the question this ADR settles is: **what is the calibrated parameter set, architecturally — mutable state
the calibration writes, or a projection derived from append-only records — and does any part of the calibration
path ever touch the network?**

## Options

1. **Mutable parameter state, updated in place; ship an aggregate error metric for "product improvement."**
   The calibration overwrites the current parameters each run; a small anonymous error statistic is uploaded so
   the fleet improves together. Rejected twice over: in-place mutation makes revert a reconstruction (drift,
   not exactness), and *any* upload is a telemetry channel ADR-0009 forbids without exception. "There is no
   telemetry setting because there is no telemetry" is a claim M26 must not weaken.
2. **A projection, but with an opt-in "share aggregate error" toggle.** Keeps the projection discipline but
   reintroduces telemetry as a setting. Rejected: ADR-0009's whole point is that the guarantee is structural,
   not a default a user can flip. A toggle is a leak someone will enable and then forget.
3. **The calibrated parameter set is a *versioned projection* over two append-only sources — the outcome
   records (owned by M15) and an append-only `calibration_runs` log (owned here) — exactly as every entity
   table is a projection of the event log (ADR-0002). A new calibration appends a new version and moves the
   `active` pointer; a revert moves the pointer back to a retained prior version; no version is ever destroyed.
   Reading is local, writing is local, and the crate has no network client anywhere in its dependency closure,
   with a runtime socket guard as a second, redundant proof. Nothing is uploaded, ever.**
4. **No persisted parameters at all — recompute from records on every plan read.** No drift, no telemetry, but
   no provenance either (which run produced which number, and why), no cheap revert, and a per-plan
   recomputation cost on the hot path. Rejected: it throws away inspectability (ADR-0071) to avoid a storage
   problem the projection discipline already solves.

## Decision

Option 3. The `CalibrationParameterSet` is a **versioned, revertible projection**, not mutable state.

- **Projection, not state.** The active parameter set is derived from the outcome records plus the
  `calibration_runs` log, "a convenience for querying; the truth is the events" (ADR-0002). It is rebuildable:
  replaying the runs in conclusion order, applying the same clamps and guards, reproduces the active parameters
  exactly (architecture §8.4). "Rebuild and diff" is an integration-test assertion, not a maintenance tool — a
  projection bug is caught by the diff, not discovered in production.
- **Append-only versions; exact revert.** `Applied` writes `version = prior + 1` with `supersedes = prior` and
  moves the `active` pointer; the prior row persists byte for byte. `revert_calibration(v)` re-activates a
  retained version `v` — a pointer move, not a reconstruction — so revert is exact *by construction*
  (architecture §8.2–§8.3). Version 0 is the identity (pre-M26 behaviour) and exists from the first migration,
  so `active_parameters()` is well-defined from the first boot and a Firm that never calibrates behaves exactly
  as it did before M26.
- **Local only — nothing is uploaded (ADR-0009 governs).** `sidra-calibration` has no HTTP/socket crate in its
  transitive dependency closure — a CI check fails the build on any such edge — and the `guard` module installs
  a runtime no-egress assertion that aborts any run which opens a socket, verifiable by packet capture on
  ADR-0009's own standard ("the verifiability is the point"). Outcome records, error samples, and parameters
  are excluded from any automatic export; they leave the machine only through the Principal's explicit,
  redacted, previewed, Principal-transmitted export.

Where this decision and ADR-0009 could ever be read to disagree about what may leave the machine, **ADR-0009
governs, absolutely and without exception.**

## Consequences

**Accepted: no in-place update, ever — every calibration and every revert appends.** Parameter history grows
monotonically and versions are never garbage-collected while their evidence is retained (Principle 3). This is
a deliberate storage cost paid to make revert exact and provenance total; the samples collapse into their run's
summary statistic under compaction, but the version chain and the `sample_ids` remain queryable indefinitely
(architecture §12.2).

**Accepted: two redundant no-egress proofs to maintain.** The compile-time closure check and the runtime socket
guard both exist, and both must keep passing on every build. Redundancy is the point: ADR-0009 is the claim M26
is most likely to be accused of weakening, so the guarantee is proven twice, in two independent ways.

**Gained: revert is exact and cheap.** Because no version is destroyed, restoring prior parameters is a pointer
move to a row that is still there — no recomputation, no drift, no reconstruction bug. "Revertible" in the exit
criterion is a snapshot-equality test (AC4), not an aspiration.

**Gained: "nothing leaves the machine" is a build property, not a promise.** A crate that cannot link a network
client cannot make a network call; the absent dependency edge survives implementers who never read this ADR,
exactly as ADR-0009 intends. The telemetry shortcut is refused structurally, not by policy.

**Gained: the parameters are auditable and rebuildable.** Every active number traces to the run that produced
it and the outcome records that drove it, and the whole projection can be rebuilt-and-diffed against the log
(AC12). A Principal can answer "which parameters governed planning on date D" by reading the hash-chained log.

**Reversal cost: low-to-moderate, and one-directional.** Tightening is free — the projection can always be
rebuilt and a version reverted. The costly reversal would be the *wrong* one: adding any upload path would
breach ADR-0009 and is not a reversal this milestone may make. Moving from a projection back to mutable state
would forfeit exact revert and rebuild-and-diff, re-opening the black-box failure 4.0 is gated against — so in
practice this decision is not one a later milestone walks back; it is inherited by M27–M29 as the substrate
whose every adjustment is already traceable and undoable.
