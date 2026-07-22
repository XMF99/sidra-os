# Sync and Conflict Resolution — Implementation Plan

**Milestone M24 · crate `sidra-sync` · for AntiGravity**

| | |
|---|---|
| Architecture | `SYNC_AND_CONFLICT_RESOLUTION_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0064 (union under a deterministic total order) · 0065 (a projection conflict is a Decision) · 0066 (per-device chain; no rewrite) |
| Crate | `sidra-sync` at `services/sync/` |
| Depends on | `sidra-store`, `sidra-security`, `sidra-seats` (M21), `sidra-domain`, the M23 kernel-host boundary |
| Must not depend on | `sidra-orchestrator`, `sidra-mission` (CI-enforced) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR.

### 0.2 Task conventions (inherited from the M16 / Mission Engine plans §0, unchanged)

- **One task = one commit = one review.** A task that cannot be reviewed in one sitting is too large; split it
  before starting.
- **Complexity is reviewer load, not calendar time.** **S** ≈ under 200 lines, one concept · **M** ≈ 200–600
  lines or one concept with real edge cases · **L** ≈ 600+ lines or cross-module. **There are no XL tasks.**
- **Every task ships its own tests.** No "tests follow later." A task without tests is not done.
- **Every task leaves `main` green.** Feature-flag if incomplete; never break the build.
- **No production code in this package.** This plan is the specification AntiGravity implements.

### 0.3 Epic map

| Epic | Name | Delivers |
|---|---|---|
| E1 | Device/peer identity & event provenance | the vocabulary: devices, peers, the HLC, per-event provenance, the per-device chain |
| E2 | The sync protocol (pull/push of event ranges) | ADR-0064 transport-agnostic: version vectors, anti-entropy exchange, admission with verification |
| E3 | The deterministic merge ordering | ADR-0064/0066: union, the total-order key, insert-only, no rewrite |
| E4 | Projection rebuild from the merged log | full + incremental rebuild; the "rebuild and diff" oracle across devices |
| E5 | Conflict detection → Decision | ADR-0065: fork detection, `sync_conflicts`, the raised `decisions` row, resolution |
| E6 | Persistence 0050–0053 & events | migrations, the provenance columns, event variants, the Vault mirror |
| E7 | Diverge-and-converge / conflicts-as-Decisions acceptance | the exit criterion, made a test — **the last thing green** |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──► E3 ──► E4 ──► E5 ──► E7
        │              ▲
        └──────────────┘
   E6 runs alongside E1→E3 (schema + provenance columns before the protocol writes to them)
```

E1 first (everything types against provenance). E6 lands the schema just ahead of E1/E2 writes. E2 needs E1
(a version vector is over device provenance). E3 assembles the union + order once events replicate. E4 rebuilds
from E3's merged order. E5 detects forks during E4's rebuild. **E7 is the exit criterion and must be the last
thing green.**

---

## E1 — Device/peer identity & event provenance

### Purpose
The vocabulary every other epic types against: device identity, peers, the hybrid logical clock, per-event
provenance, and the per-device hash chain.

### Scope
In: value objects and provenance types in `packages/domain` (or `services/sync/domain` per the crate's
dependency rules); the HLC; the per-device chain-hashing and single-event signature. Out: the protocol (E2),
the merge order (E3), persistence (E6 lands the columns).

### Dependencies
`sidra-domain` (`Ulid`, `EventId`); `sidra-seats` (`SeatId`, M21); `sidra-security` (Ed25519 keypair,
keychain — the plugin-signing primitive, ADR-0006).

### Public APIs
Constructors that reject invalid construction; `Hlc::tick`/`Hlc::observe`; `Provenance::chain_hash`;
`sign`/`verify` over an event hash.

### Acceptance criteria
`DeviceSeq` is monotonic per device; the HLC advances on local append and on observing a higher clock;
`chain_hash` matches ADR-0002's formula scoped per device; a single device reduces to exactly one chain
(AC12).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `sidra-sync` crate: manifest, module skeleton, CI wiring, dependency-direction + crate-neutrality checks | S | — | `services/sync/Cargo.toml`, `src/lib.rs`, `infrastructure/ci/` | Crate builds; CI fails on any edge `sidra-sync → sidra-orchestrator`/`sidra-mission` (AC14) and on any `if device ==`/`if transport ==` (G11) |
| **T1.2** | Value objects: `DeviceId`, `DeviceSeq`, `PeerId`, `ProjectionCell`, `VersionVector` | S | T1.1 | `domain/values.rs` | `VersionVector` is a `Map<DeviceId,DeviceSeq>`; `DeviceSeq` monotone; property tests |
| **T1.3** | `Hlc` hybrid logical clock: `tick` on local append, `observe(other)` advances past a higher clock | M | T1.2 | `domain/clock.rs` | An event that observed another has a strictly greater HLC; total-order key is strict (no ties) with `(device,seq)` tiebreak |
| **T1.4** | Event provenance: `device_id`, `device_seq`, `hlc`, `prev_hash`, `hash`, `sig`, `supersedes_event` | M | T1.3, `sidra-security` | `domain/provenance.rs` | `chain_hash` = ADR-0002 formula per device; `sig` verifies against the device pubkey; single device ⇒ one chain identical to pre-M24 (AC12) |
| **T1.5** | `Device` and `Peer` aggregates: identity, Seat owner, pubkey, transport, cursor | S | T1.2 | `domain/device.rs` | A `Device` belongs to exactly one `SeatId`; `Peer.cursor` is a `VersionVector`; immutable constructors |
| **T1.6** | `SyncConflict` type: cell, fork (≥2 events), provisional, **required** `decision_id`, status | S | T1.2 | `domain/conflict.rs` | Cannot construct without a `decision_id` — a conflict without a Decision is unrepresentable (ADR-0065); unit tests |

---

## E2 — The sync protocol (pull/push of event ranges with cursors)

### Purpose
Anti-entropy between two peers: exchange version vectors, transfer the delta, verify and admit each incoming
event. Transport-agnostic (ADR-0064).

### Scope
In: version-vector exchange, delta computation, pull/push of event ranges, admission with chain + signature
verification, the `Transport` plugin surface, cursor bookkeeping. Out: the merge order (E3), projection rebuild
(E4).

### Dependencies
E1; `sidra-store` (read/write events — schema from E6); `sidra-security` (device auth, redaction); the M23
kernel-host boundary (an already-authenticated peer identity).

### Public APIs
`sync_with_peer(peer) -> SyncReport`; `Transport` trait (`send(batch)`, `receive() -> batch`); `admit(event)`.

### Acceptance criteria
An interrupted sync admits only a contiguous verified prefix; a re-received event is idempotent; a peer with
an equal version vector transfers nothing.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | Version-vector exchange + delta computation (the ranges one peer owes the other) | M | E1, E6/T6.2 | `protocol/vectors.rs` | Delta = ranges where one vector exceeds the other; an equal pair transfers nothing but vectors |
| **T2.2** | `Transport` plugin trait (folder + relay stubs); opaque encrypted batches | M | T2.1 | `peer/transport.rs` | Merge logic references no concrete transport (G11); a relay stub sees ciphertext only (E2E) |
| **T2.3** | Admission: verify contiguous `device_seq` + matching `prev_hash` + valid `sig`, then insert-only | M | T2.1, E1/T1.4 | `provenance/admit.rs` | A gap suspends admission; a hash/sig mismatch → `ChainVerificationFailed`, quarantine, zero admitted (AC9) |
| **T2.4** | Idempotent + atomic transfer: re-received event is a no-op; interrupted transfer admits only a contiguous verified prefix, else rolls back | M | T2.3 | `protocol/transfer.rs` | Re-receipt is identity-matched, not re-inserted; interruption leaves `DIVERGED`, union uncorrupted (F5) |
| **T2.5** | Cursor bookkeeping: update `sync_cursors` after admission; `sync_status(peer)` query | S | T2.4, E6/T6.2 | `protocol/cursor.rs` | Cursor reflects the highest admitted `device_seq` per device; status reports CONVERGED/DIVERGED/SYNCING |

---

## E3 — The deterministic merge ordering (ADR-0064, ADR-0066)

### Purpose
Union the replicated events and place them in one deterministic total order, rewriting nothing.

### Scope
In: the union by `(device_id, device_seq)` identity, the `order_key` total order, materializing the order as a
replay index, the no-rewrite guarantee. Out: what the order feeds (projection rebuild, E4).

### Dependencies
E1 (provenance + HLC), E2 (events have replicated).

### Public APIs
`merge_order(events) -> Vec<EventRef>`; `union(local, peer) -> Set<Event>`.

### Acceptance criteria
The order is a pure function of the event set (same set ⇒ same order, any input order); no stored event's bytes
or hash change.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | Union by `(device_id, device_seq)` identity; duplicates collapse, nothing dropped | S | E1, E2 | `merge/union.rs` | Post-union set = input union; count + hash-set equality (AC3) |
| **T3.2** | `order_key = (hlc.wall, hlc.counter, device_id, device_seq)`; strict total order over the union | M | T3.1 | `merge/order.rs` | Strict (no ties); same set ⇒ identical order regardless of insertion order |
| **T3.3** | Materialize the order as a replay index/cursor; never renumber, re-hash, or edit `prev_hash` | M | T3.2 | `merge/index.rs` | Before/after snapshot: every pre-existing event's bytes + hash identical (AC7, ADR-0066) |
| **T3.4** | Merge-algebra property test: commutative + associative over random event sets across N devices | M | T3.2 | `merge/tests/algebra.rs` | Same projection hash for every pairwise merge order/topology (AC6) |

---

## E4 — Projection rebuild from the merged log

### Purpose
Rebuild the projection tables locally by replaying the merged log in deterministic order — full (the oracle)
and incremental (the hot path).

### Scope
In: full rebuild from genesis (ADR-0002's existing "rebuild and diff," extended to merge order), incremental
rebuild from the merge frontier, the affected-cell computation. Out: fork detection (E5, which hooks the
rebuild).

### Dependencies
E3 (the merged order); `sidra-store` (projection tables).

### Public APIs
`rebuild_full() -> ProjectionHash`; `rebuild_incremental(frontier) -> AffectedCells`.

### Acceptance criteria
Full and incremental rebuild agree on every projection cell; incremental cost is bounded by the delta, not by
history.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | Full rebuild: replay every event in merge order; produce a projection hash | M | E3 | `projection/full.rs` | Deterministic; matches a single-device pre-M24 rebuild over the same Directives (AC12 support) |
| **T4.2** | Merge-frontier computation: the earliest order position an admitted event occupies | S | T4.1 | `projection/frontier.rs` | Frontier bounds the replay window; correct under out-of-order admission |
| **T4.3** | Incremental rebuild: replay from the frontier; recompute only touched cells; assert equality vs full | M | T4.2 | `projection/incremental.rs` | Incremental result = full result on every cell; cost O(delta), not O(history) (G10, SR-2) |
| **T4.4** | Forward-compat: an unknown event kind is stored, chained, ordered; its projection deferred, never dropped | S | T4.1 | `projection/unknown.rs` | Log converges independent of projectability; unknown kind never dropped (F7, SR-6) |

---

## E5 — Conflict detection → Decision (ADR-0065)

### Purpose
Detect a fork on a single-valued audit-bearing cell during rebuild and raise it as a Decision — never a silent
overwrite.

### Scope
In: the audit-bearing/ephemeral cell classification, fork detection over the `supersedes_event` forest, the
provisional winner, the `sync_conflicts` + `decisions` row, `resolve_sync_conflict`, per-subject batching. Out:
the Decision Engine surfaces themselves (they exist; `/docs/03-decision-engine.md`).

### Dependencies
E4 (rebuild is where forks appear); `sidra-store` (`decisions`, `sync_conflicts`).

### Public APIs
`detect_forks(frontier) -> [Fork]`; `raise_decision(cell, fork) -> DecisionId`;
`resolve_sync_conflict(conflict, chosen) -> EventId`.

### Acceptance criteria
A concurrent divergent write to an audit-bearing cell yields a `sync_conflicts` + `decisions` row and a
contested (not silently replaced) projection; an ephemeral cell takes declared LWW; resolution appends a
superseding event.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | Cell classification: declared audit-bearing (default) vs. ephemeral allowlist (`ui_state`, `preferences`) | S | E1 | `conflict/classify.rs` | Classification is static/declared, not runtime-guessed; default is audit-bearing (ADR-0065) |
| **T5.2** | Fork detection over the `supersedes_event` forest: a node with ≥2 children on one cell | M | E4/T4.3, T5.1 | `conflict/detect.rs` | Two concurrent same-cell writes detected as a fork; a write that observed the other is **not** a fork (§9.2) |
| **T5.3** | Provisional winner + contested marking; raise `sync_conflicts` + `decisions` (options=values, evidence=events, authority=principal); emit `ConflictDetected` | M | T5.2, E6/T6.4 | `conflict/raise.rs` | Fork ⇒ a `sync_conflicts` row + a `decisions` row + a `ConflictDetected` event; projection contested, not silently replaced (AC4, AC5) |
| **T5.4** | Declared-LWW path for ephemeral cells only: `(hlc,device_id)`-max, silent by policy | S | T5.1 | `conflict/ephemeral.rs` | Only allowlisted cells take LWW; an audit-bearing cell never reaches this path (AC4) |
| **T5.5** | `resolve_sync_conflict`: append a superseding event over both forked events; close the fork; converge on next sync | M | T5.3 | `conflict/resolve.rs` | Resolution is insert-only (appends, never edits); the choice replicates and converges (§4, §13.1) |
| **T5.6** | Per-subject conflict batching into one Decision where possible | S | T5.3 | `conflict/batch.rs` | Multiple cells of one subject batch into one Decision; convergence never blocks on Decisions (F6, AC10) |

---

## E6 — Persistence 0050–0053 & events

### Purpose
Additive, forward-only schema; the provenance columns; event variants; the human-readable Vault mirror.

### Scope
In: migrations `0050`–`0053`, the additive `events` provenance columns, the `SyncEvent` variants, the Vault
mirror writer. Out: business logic.

### Dependencies
`sidra-store`; the 3.0 migration band starts at `0050` (`/MILESTONE_REGISTRY.md` numbering).

### Acceptance criteria
Forward-only, idempotent, independently deployable; a single-device Vault is byte-identical after the
`events` provenance migration (AC12); the mirror holds no key.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | `0050_sync_devices.sql` — `sync_devices` + `sync_peers` | S | — | `services/store/migrations/` | Forward-only; idempotent; `device_id` belongs to a `seat_id`; independently deployable |
| **T6.2** | `0051_sync_cursors.sql` — per-peer version-vector position | S | T6.1 | `migrations/` | One row per `(peer, device)` frontier; rebuildable from admitted events |
| **T6.3** | `0052_event_provenance.sql` — additive `events` columns (`device_id`, `device_seq`, `hlc_*`, `sig`, `supersedes_event`) + `merge_log` | M | — | `migrations/` | Nullable, single-device default; a pre-M24 Vault verifies unchanged post-migration (AC12); no column repurposed |
| **T6.4** | `0053_sync_conflicts.sql` — the conflict primitive linking a fork to its `decisions` row | S | T6.1 | `migrations/` | `decision_id` FK NOT NULL; fork event ids stored; status tracked |
| **T6.5** | `SyncEvent` enum — all 13 variants with `actor`, `device_id`, `hlc` | M | E1 | `domain/events.rs` | Every kind in §8.3 present; serde round-trip; schema snapshot committed |
| **T6.6** | Vault Markdown mirror writer (on state transitions, not continuously): `devices.md`, `peers.md`, `conflicts/`, `merges/` | M | T6.5 | `mirror/write.rs` | Written on register/sync/conflict/resolve; no device key, no duplicated payload appears |

---

## E7 — Diverge-and-converge / conflicts-as-Decisions acceptance

### Purpose
The exit criterion, made a test. **The last thing to go green.**

### Scope
In: the diverge-and-converge proof (the exit criterion), the chaos partition/heal harness, the conflict-as-
Decision proof, the adversarial-stream proof, and the acceptance-criteria coverage. Out: any transport
implementation beyond the test stubs.

### Dependencies
All prior epics.

### Acceptance criteria
AC1–AC14 each covered by a named test; the diverge-and-converge proof (AC2/AC3/AC4/AC5) is the last task and
the last thing green.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T7.1** | Union losslessness + no-rewrite property tests | S | E3 | `infrastructure/testing/sync/union.rs` | Post-merge set = union (AC3); every pre-existing event byte+hash identical (AC7) |
| **T7.2** | Adversarial forged/tampered-stream test | S | E2 | `.../forged_stream.rs` | Broken chain / bad sig rejected + quarantined; union unchanged (AC9) |
| **T7.3** | Chaos partition/heal over ≥3 devices; random concurrent writes incl. same-cell divergence | L | E4, E5 | `.../chaos.rs` | All devices converge to one set; per-device `audit.verify` passes; every same-cell divergence raised a Decision, none silently overwritten (AC8, AC11) |
| **T7.4** | Single-device equivalence test vs. the pre-M24 baseline | M | E4 | `.../single_device.rs` | One-device chain + projections byte-identical to pre-M24 over the same Directives (AC12) |
| **T7.5** | Liveness: a device that never returns blocks no other's convergence | S | E2 | `.../liveness.rs` | Reachable devices converge and continue with one peer permanently offline (AC10) |
| **T7.6** | Audit coverage over the full sync lifecycle | S | E6 | `.../audit_lifecycle.rs` | `audit.verify` passes over register→sync→merge→conflict→resolve; every path logged (AC13) |
| **T7.7** | **The exit-criterion proof:** two devices diverge offline, reconnect, converge with no lost event and no silent overwrite; a conflicting write yields a `decisions` row, not an auto-resolution | M | T7.1–T7.6 | `.../diverge_and_converge.rs` | AC2, AC3, AC4, AC5 — proven by test, not configured; **the last thing to go green** |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | device/peer identity, HLC, per-event provenance, per-device chain |
| E2 | anti-entropy protocol: version vectors, pull/push, verified admission (ADR-0064) |
| E3 | union + deterministic total order, insert-only, no rewrite (ADR-0064/0066) |
| E4 | projection rebuild from the merged log (full + incremental) |
| E5 | fork detection → `sync_conflicts` → Decision (ADR-0065) |
| E6 | migrations 0050–0053, provenance columns, events, Vault mirror |
| E7 | diverge-and-converge / conflicts-as-Decisions acceptance (exit criterion) |
