# ADR-0039 — Hardening adds no authoritative tables; release bookkeeping is a projection

**Status:** Proposed · **Date:** M10 design phase · **Supersedes:** — · **Source:** `/docs/02-system-design.md`
§2/§6, ADR-0002 (event log is the source of truth), `/MASTER_IMPLEMENTATION_GUIDE.md` §3/§8

## Context

M10 produces facts that want to be recorded: which days of the dogfood window were clean, when an incident
reset the counter, whether the release gate was evaluated, when each pre-migration snapshot was taken and last
verified. The obvious instinct is to add a table — a `dogfood_days` table, a `release_gate` table, a
`snapshot_manifest` table — to hold this bookkeeping.

Doing so would violate the substrate rule the whole system rests on. **The event log is the source of truth;
tables are projections and are rebuildable from the log** (ADR-0002; system-design §2). A new authoritative
table is state that is *not* derived from an event, which is precisely what non-negotiable 1 forbids (GUIDE §3).
It would also require a migration, and M10's charter is to add none: the migration bands are already allocated
(`0001` v1 base; `0002–0018` M11–M14; `0019–0024` M15; `0025–0029` M16), and hardening is meant to change
proofs, not schema (architecture §11.1). Any schema change after M5 needs an ADR and a rehearsed migration
(GUIDE §3.3, §8) — a cost with no benefit here, because the facts M10 records already have event homes.

So the question M10 must decide — and it is a schema/boundary decision, which per GUIDE §8 needs a record — is
where hardening bookkeeping lives.

## Options

1. **Add authoritative tables for the dogfood ledger, release gate, and snapshot manifest.** Familiar and
   direct. Violates ADR-0002 (state not derived from an event), forces a migration M10 is chartered not to add,
   and creates rows that a full rebuild-from-events would not reproduce — which the projection rebuild-and-diff
   gate (testing §1) would then flag as drift.
2. **Record nothing durably; compute the dogfood status in memory during the window.** No schema, no events.
   Loses the audit trail for the release decision — the one decision that most needs to be on the tamper-evident
   chain — and cannot survive a restart or be demonstrated after the fact.
3. **Record the facts as events on the existing hash chain and expose the bookkeeping as projections.** The
   window markers are additive `system.*` variants; the release-gate sign-off and each defect acceptance are
   `decision.*` events (they are Principal Decisions); the ledger, gate record, and snapshot manifest are
   projections rebuilt from these. No new table, no migration.
4. **Reuse the diagnostics/metrics store for the ledger.** Metrics are local, lossy, and downsampled after 90
   days (logging §4) — wrong durability class for a release-decision audit trail, which must be permanent and
   tamper-evident.

## Decision

Option 3. **M10 adds no authoritative table and no migration.** Hardening bookkeeping is recorded as events on
the existing hash chain and surfaced as projections.

- **Recovery** uses the existing `system.recovered` event (system-design §6).
- **Snapshots and restore-verification** use existing `system.*` health facts, surfaced in the health strip
  (logging §6: "last snapshot 02:31 · restore verified Sunday").
- **The dogfood window** — window-open, day-recorded, incident/reset — is a small set of **additive `system.*`
  variants**. The event-kind namespace is closed (system-design §2); adding a variant to the closed enum is
  additive and does not migrate a table.
- **The release-gate Decision and every defect acceptance** are **`decision.*` events** — they are Principal
  Decisions (GUIDE §6), not a new mechanism.
- **The dogfood ledger, the release-gate record, and the snapshot manifest are projections** rebuilt from these
  events on demand (ADR-0002). Like every other projection, they are reproducible by a full rebuild from the
  log and are subject to the rebuild-and-diff gate (testing §1).

The only additive artifacts M10 ships to the repository are under `infrastructure/ci/` and
`infrastructure/testing/`, which are not schema (architecture Appendix B).

## Consequences

**Accepted: querying the dogfood ledger means projecting from events, not reading a table.** Slightly more work
to read than a dedicated table, and it means the ledger view must be kept as a genuine projection (rebuildable),
not a cache that drifts. Mitigated by the fact that this is how every other read model in the system already
works (system-design §2) — the ledger is not special.

**Accepted: adding `system.*` variants touches the closed event enum.** This is a schema-adjacent change and is
recorded here precisely because GUIDE §8 requires it. It is additive — no existing variant changes meaning — so
a Firm at the end of M10 replays every pre-M10 event exactly as before.

**Accepted: the snapshot manifest cannot hold state the snapshots themselves do not.** The manifest is a
projection over snapshot events; it describes what was taken and verified, never a second source of truth about
the Vault's contents. If it and the `vault/.snapshots` directory disagree, the events and the files win, not
the projection.

**Gained: no migration, exactly as chartered.** M10 leaves the schema untouched; a Firm's behaviour on every
product path at the end of M10 is identical to M9 (architecture §11.1).

**Gained: the release decision is on the tamper-evident chain.** The single most consequential Decision in 1.0
— that it may ship — is a `decision.*` event that `audit.verify` covers, demonstrable after the fact and
impossible to rewrite silently (logging §1; system-design §2).

**Gained: the bookkeeping cannot drift from reality.** Because the ledger is a projection, the rebuild-and-diff
gate (testing §1) would catch any divergence between the ledger and the events it derives from — the
bookkeeping is self-checking.

**Reversal cost: low.** If a future release genuinely needs an authoritative hardening table, it adds a
forward-only migration in its own band with its own ADR (GUIDE §3.3, §8). Nothing here forecloses that; this
decision only declines to pay that cost at M10, where the events already carry the facts.
