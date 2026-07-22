# ADR-0066 — The hash chain is preserved across branches by per-device provenance; a merge rewrites no event

**Status:** Accepted · **Date:** 3.0 "Chambers" design phase · **Milestone:** M24 · **Supersedes:** —

## Context

ADR-0002's integrity guarantee is a single hash chain: `events.seq` is a global `AUTOINCREMENT` and each row's
`hash = SHA-256(prev_hash ‖ canonical(row))` chains over its one predecessor
(`/docs/04-database-design.md` §4). Tamper with any row and `audit.verify` names the first broken sequence
(`/docs/07-security-model.md` §11). That guarantee assumes one writer. The moment two devices append offline
(ADR-0064), the single global chain forks — two events at the "next" sequence — and the question becomes: what
does chain integrity *mean* across two branches, and how does a merge reconcile them without destroying it?

The wrong answer is to re-thread the two branches into one global chain on merge — renumbering sequences and
recomputing hashes so the result looks like a single writer's history. That is precisely a chain rewrite, and
ADR-0021 already established the principle at stake: "a hash chain you have rewritten is a hash chain that has
lost its point." A merge that re-hashes events retroactively makes every device's prior verification
conditional on a future merge, which is no guarantee at all.

## Options

1. **Re-thread branches into one global chain on merge (renumber + re-hash).** Produces a tidy single chain
   and destroys the integrity guarantee: every merge rewrites history, so no `audit.verify` result is stable.
   The chain rewrite ADR-0021 forbids.
2. **Keep one chain per device; a merge inserts the peer's events and derives a total order over the union,
   rewriting nothing.** Each device's chain verifies in isolation, before and after any merge; the "merged
   history" is an ordering (an index), not a new set of hash edges. Integrity becomes "every device's chain
   verifies, and the union is exactly those chains."
3. **A Merkle DAG chaining each event to all its causal predecessors across devices.** Cryptographically
   elegant and far heavier: it introduces cross-device hash edges that must be computed at merge time, which
   reintroduces merge-time hashing and a more complex verification than the exit criterion needs. The Firm's
   requirement is "no event forged, no event rewritten," which per-device chains plus signatures already meet.

## Decision

**Option 2.** The hash chain is **per device**. Each device's events chain over that device's own predecessor
(`prev_hash` links within one device's stream), and each event is **signed** by its authoring device
(Ed25519, the plugin-signing primitive, ADR-0006). Reconciliation across branches is:

- **On admission**, a peer's event is verified to chain to that device's prior event this device already holds
  (contiguous `device_seq`, matching `prev_hash`) and to carry a valid device signature. A failure is a hard
  rejection (`ChainVerificationFailed`), never a repair.
- **A merge inserts** the peer's events (insert-only) and **derives** the total order (ADR-0064) as an index.
  It renumbers nothing, re-hashes nothing, edits no `prev_hash`. Every pre-existing event's stored bytes and
  `hash` are identical before and after (M24 AC7).
- **Integrity is verified per chain**: `audit.verify` runs over each device's stream independently and names
  the first broken `(device, device_seq)`; the union is checked to equal exactly the set of those chains.

A single-device Firm has one chain — exactly ADR-0002's chain, byte-identical (M24 AC12).

## Consequences

**Accepted: there is no single global hash chain across devices.** The mental model "one chain, one
`audit.verify`" becomes "one chain per device, verified independently, unioned." A reviewer must understand
provenance to reason about integrity. Documented in the glossary and §6.

**Accepted: every event must be signed by its device.** A signing cost per append and a keypair per device
(private key in the keychain, `/docs/07-security-model.md` §8). Cheap — the same primitive already used for
plugins — and it is what makes a forged event detectable rather than merely unchained.

**Accepted: cross-device causality is not carried by the hash chain.** The chain proves per-device order and
authorship; causality for conflict detection is carried separately by `supersedes_event` (ADR-0064/§10.3). Two
mechanisms where a Merkle DAG would use one — accepted because it keeps merge-time work to inserts and keeps
verification a linear per-device walk.

**Gained: no merge ever rewrites history.** The most corrosive failure — a convergence that quietly alters what
a device recorded — is structurally impossible: merges insert and order, never edit (M24 AC7). Every device's
prior `audit.verify` result stays true forever.

**Gained: a forged or tampered stream is rejected before it can enter the log.** Verify-before-insert means the
union is never contaminated; a malicious peer's fabricated event fails the chain or the signature and is
quarantined (M24 AC9). Integrity is enforced at the boundary, not discovered later.

**Gained: integrity scales to N devices without a coordinator.** Each device verifies its own chain; the union
check is a set comparison. No global sequence to contend over, no leader to trust.

**Reversal cost: high.** Once devices have signed and chained their own streams and converged, retrofitting a
single global chain means re-hashing legitimately concurrent histories into a fictional single-writer order —
the chain rewrite this ADR and ADR-0021 both exist to prevent. Settle it before M24 ships, while there is one
device and the merge path is dormant.
