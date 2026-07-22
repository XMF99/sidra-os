# Sync and Conflict Resolution — Architecture

**Milestone M24 · Release 3.0 "Chambers" · the merge substrate**

| | |
|---|---|
| Milestone | M24 — Sync and Conflict Resolution (`/MILESTONE_REGISTRY.md` §4, 3.0 "Chambers") |
| Release | 3.0 "Chambers" — the Firm admits colleagues, and it stops living on one machine |
| New crate | `sidra-sync` at `services/sync/` |
| Depends on | M23 (kernel extraction / hosted topology), M21 (Seats & device identity), M2 (the hash-chained event log), the Decision Engine (`/docs/03-decision-engine.md`) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | Two devices diverge offline and converge with **no lost event** and **no silent overwrite**; conflicts surface as **Decisions** — proven by test, not by configuration |

> **Authoritative precedence.** Where this document disagrees with `ADR-0002`
> (`/docs/0002-event-log-as-source-of-truth.md`) about the append-only, hash-chained event log, ADR-0002
> governs and this architecture is a defect to be reported. Where it disagrees with
> `/docs/04-database-design.md` §1 about "the `events` table is the source of truth; entity tables are
> projections," that document governs. Where it disagrees with `/docs/03-decision-engine.md` about what a
> Decision is and how it is recorded, the Decision Engine governs. Where it disagrees with
> `/docs/07-security-model.md` about device/peer authentication, redaction, or egress, the security model
> governs. This architecture *extends* those substrates to more than one device; it never re-decides them.
>
> One deliberate refinement is called out where it occurs (§1.5): `/docs/09-scalability.md` §4 sketched
> "last-writer-wins for UI state" as a 2.0 note. That narrow allowance survives, as a **declared per-field
> policy for non-audit, ephemeral cells only**. The registry's exit criterion — *conflicts surface as
> Decisions* — governs everything audit-bearing, and the registry supersedes the guide's milestone text
> (`/MILESTONE_REGISTRY.md` header). Last-writer-wins is never the default here, and never touches a cell the
> Principal would want to have been asked about.

---

## 1. Why this subsystem exists

### 1.1 The problem

Through M23 the Firm's kernel runs headless: `services/*` is a hosted process, the desktop app is one client
of it, and nothing moved to make that true (`/MILESTONE_REGISTRY.md` §4, M23). A hosted kernel with one
client is still, in every respect that matters, a single-machine system — one Vault, one `sidra.db`, one
append-only hash chain, one writer. M24 is the milestone where the Firm stops living on one machine.

The moment a second device holds the Vault, the substrate that made the Firm trustworthy becomes the thing
that breaks. ADR-0002's event log is **one linear chain**: `events.seq` is an `INTEGER PRIMARY KEY
AUTOINCREMENT` and each row's `hash = SHA-256(prev_hash ‖ canonical(row))` chains over its single predecessor
(`/docs/04-database-design.md` §4). That model has exactly one writer by construction. Put the Vault on a
laptop and a desktop, take both offline, and each appends its own event at the next `seq` — two different
events, same sequence number, two forks of a chain that was designed never to fork. Reconnect them and the
naive answer is "pick one and overwrite," which is the single move this entire product exists to refuse.

The requirement is not "make the databases equal." Two SQLite files can be made equal by copying one over the
other, and that is precisely the catastrophe: it silently destroys whatever the losing device did. The
requirement is: **let two devices that diverged offline each keep everything they recorded, converge on a
single shared history in which no event is dropped and no event is rewritten, and — where the two histories
genuinely disagree about a mutable value — surface that disagreement to the Principal as a Decision rather
than resolving it behind their back.**

### 1.2 The stance

Three commitments define the subsystem, and each has an ADR:

1. **Convergence is a merge of append-only event streams under a deterministic total order; no event is
   dropped.** (ADR-0064) Because the event log is the source of truth (ADR-0002) and every table is a
   projection of it (`/docs/04-database-design.md` §1), multi-device convergence is fundamentally the **union
   of two grow-only event sets**, not a reconciliation of mutable rows. Each device appends to its own
   per-device chain; on reconnect the devices exchange the events the other lacks; the merged history is the
   union, ordered by a function that depends only on the set of events, never on the order they arrived. Union
   means nothing is dropped. A deterministic order means every device computes the same history from the same
   set — the merge is commutative and associative (§18, AC6).
2. **A projection conflict surfaces as a Decision; it is never auto-resolved silently.** (ADR-0065) The event
   streams always merge cleanly — a union has no conflicts. A *conflict* is a semantic event at the projection
   layer: two concurrent events that set the **same single-valued projection cell** to **different values**,
   with neither causally after the other. Replaying the merged log does not last-writer-wins such a cell. It
   records the fork as a `sync_conflicts` row linked to a `decisions` row (`/docs/03-decision-engine.md`,
   `/docs/04-database-design.md` §5) and lets the Principal choose. This is the exit criterion.
3. **The hash chain's integrity is preserved across branches by per-device provenance; a merge rewrites no
   existing event.** (ADR-0066) Each device's events form its own append-only, hash-chained stream
   (`prev_hash` links within that device's stream only). Convergence never re-hashes, re-orders in place, or
   edits a stored event — it *inserts* the peer's events and *derives* a total order over the union. Every
   device's chain remains independently verifiable end-to-end, before and after every merge (AC8). Integrity
   is a property of each provenance chain plus a version vector over the union, not of a single global `seq`
   that multi-writer reality has already made impossible.

### 1.3 What the subsystem is, mechanically

`sidra-sync` is **kernel machinery** (a `services/*` crate in the hosted topology M23 established). It owns
device identity, the anti-entropy protocol between peers, the deterministic merge order over the event union,
the rebuild of projections from the merged log, and the detection of projection conflicts into Decisions. It
introduces **no new source of truth**: the event log remains the only one (ADR-0002). It introduces **no new
trust mechanism**: peers authenticate as Seats/devices through the M21 identity substrate and the M23 client
boundary, and every sync activity is itself an audited event on the hash chain.

```
Layer: services  sidra-sync   ← the merge substrate: device identity, protocol, merge order,     (M24, THIS DOC)
                              projection rebuild, conflict→Decision
                 sidra-store  ← the events table + projections it merges over                     (M2, unchanged)
                 sidra-security ← device/peer auth, redaction, the Permission Broker choke point   (M3, unchanged)
apps             the desktop app, one client of the hosted kernel                                 (M23, unchanged)
```

The parallel to M16 is deliberate and load-bearing: as the Connector Framework added a mediated *outward*
surface without inventing a new credential store, M24 adds a mediated *between-devices* surface without
inventing a new source of truth. The merge substrate is the event log the Firm already had; M24 is the
machinery that lets two copies of it become one.

### 1.4 What the subsystem must never become

- **A last-writer-wins silent overwrite.** The instant a converging merge picks one device's value for a
  contested cell and discards the other's without telling the Principal, the product's central claim — nothing
  important is ephemeral, no effect is silent (`/docs/02-principles.md`, ADR-0002) — has a hole exactly where
  it is most visible. The exit criterion tests that a concurrent divergent write yields a Decision, not an
  auto-pick (AC4, AC5).
- **A lossy merge.** No event the other device recorded may be dropped, deduplicated away, or "compacted" out
  of existence during convergence. Convergence is a set union; the post-merge event set is provably the union
  of the two inputs (AC3). Compaction remains what ADR-0002 and `/docs/04-database-design.md` §9 already say
  it is — a hot/cold tiering that preserves the hash of every compacted range — and it never runs *as part of*
  a merge.
- **A mutable-state sync.** M24 does not diff and patch the projection tables (`engagements`, `canon`, …)
  between devices. Those are derived; syncing them directly would be syncing shadows. It replicates the events
  and rebuilds the projections locally, which is the only design under which "no silent overwrite" is even
  expressible (a projection has no history to protect; the log does).
- **A rewrite of the hash chain to add a device.** ADR-0021's entire argument is that a hash chain you rewrite
  to add an actor is a hash chain that has lost its point. M24 holds the same line for devices: it adds a
  `device_id`/provenance dimension **additively** (§8), so a single-device Firm is byte-identical to its
  pre-M24 self (AC12), exactly as ADR-0021 kept one Seat byte-identical and M16 kept a null grant byte-
  identical.
- **A consensus protocol.** There is no leader, no quorum, no global lock. Devices gossip pairwise and
  converge because the merge is a pure function of the event set (§18). A device that never returns blocks
  nothing (§16, F2).

### 1.5 Relationship to existing concepts

| Existing concept | How M24 relates |
|---|---|
| Event log (ADR-0002, M2) | The merge substrate. M24 replicates events and unions them; it never edits, re-hashes, or drops one. The chain becomes **per-device** (§6); a single device is exactly the existing single chain (AC12). |
| Projections (`/docs/04-database-design.md` §1) | Rebuilt locally from the merged log. M24 adds **incremental** rebuild from a merge frontier (§13); the existing full-rebuild path is unchanged and remains the correctness oracle ("rebuild and diff," ADR-0002). |
| Decision Engine (`/docs/03-decision-engine.md`) | The destination of a conflict. A projection conflict becomes a `decisions` row with the two values as options and the two events as evidence — a class-1 or class-2 reversibility Decision (§9). No new decision mechanism is invented. |
| Canon `reconciliations` (`/docs/04-database-design.md` §6) | The precedent. Canon already routes two contradictory statements into a Reconciliation the Principal resolves. M24 **generalizes reconciliation** from Canon to any single-valued projection cell, via `sync_conflicts` (§8). |
| Seats & device identity (M21, ADR-0021) | Peers authenticate as devices owned by a Seat. The `actor`/Seat field ADR-0021 put on every event in 2.0 is what makes a per-device, per-Seat event attributable after the merge — no chain rewrite needed. |
| Kernel extraction (M23) | The topology M24 needs. A device is a client of a hosted kernel; sync is between kernels (or a kernel and a relay). M23's "no file moved, no import rewritten" is why `sidra-sync` slots in as one more `services/*` crate. |
| Companion outbox (M18) | The conceptual precedent. M18 established a local-first approval-outbox that reconciles a phone's queued actions against the desktop on reconnect. M24 **generalizes** that one-way, single-table reconciliation to full multi-device Vault convergence over the whole event log. |
| Scalability §4 (`/docs/09-scalability.md`) | The seed. §4 already said "replicate the event log, not the tables; events carry `(device, seq)`; projections rebuilt locally." M24 makes that concrete. §4's "last-writer-wins for UI state" survives only as a declared per-field policy for `ui_state`/`preferences` (§9.4); it is not the default and never touches an audit-bearing cell. |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | Two devices that diverged offline converge to one shared history | ADR-0064; anti-entropy protocol (§7) + deterministic merge order (§10) |
| G2 | No event is ever lost — convergence is a set union | ADR-0064; union is monotone (grow-only); post-merge event set = union proven (§17, AC3) |
| G3 | No event is ever rewritten — merge is insert-only | ADR-0066; §10.4; every pre-existing event's stored bytes and hash are unchanged post-merge (AC7) |
| G4 | A concurrent divergent write to a single-valued cell surfaces as a Decision, never a silent overwrite | ADR-0065; conflict detector (§11) raises a `decisions` row; the exit-criterion test (§15.2, AC4/AC5) |
| G5 | Each device's chain is independently verifiable, before and after every merge | ADR-0066; per-device provenance chain (§6); `audit.verify` per device (AC8) |
| G6 | The merge is commutative and associative over event sets | ADR-0064; order is a pure function of the set (§10.2); property test (§18, AC6) |
| G7 | A single-device Firm behaves exactly as it did pre-M24 | §8 additive migrations; one device = one chain, no peers, no merge — byte-identical (AC12) |
| G8 | A malicious peer cannot inject an event or forge a device's history | §12; per-device chain verification on admission + device authentication rejects it (AC9) |
| G9 | A device that never returns blocks no other device's convergence | §16 F2; anti-entropy is pairwise and liveness-preserving (AC10) |
| G10 | Merge cost is bounded and rebuild is incremental | §14; O(new events) admission + O(affected cells) rebuild, not O(whole log) |
| G11 | The crate contains no device-specific or transport-specific logic | §6.4 CI grep (mirrors the kernel-neutrality rule); no `if device == …` anywhere |

---

## 3. Device sync lifecycle

### 3.1 States

A device is always in exactly one sync state *with respect to the shared history it knows about*. Local work
never blocks on this state — a `DIVERGED` device is a fully working Firm.

```
        ┌──────────────────────────────────────────────────────────────┐
        │                                                              │
        ▼                                                              │
    CONVERGED ──local append │ peer append observed──►  DIVERGED       │
   (version vectors          │                            │           │
    equal with all           │                 begin_sync │           │
    known peers)             │                            ▼           │
        ▲                    │                        SYNCING          │
        │                    │            (exchange version vectors,   │
        │                    │             pull/push event deltas,     │
        │                    │             verify each device chain)   │
        │                    │                            │           │
        │           union applied,                        │ delta admitted
        │           projections rebuilt                   ▼           │
        └──────────────── MERGED ◄───────────────────────┘           │
                            │  conflicts detected? ──raise Decisions──┘
                            │  (convergence completes regardless;
                            │   a Decision is data, not a blocker)
                            └── peer unreachable ──► DIVERGED (retry later; no data loss)
```

`MERGED` is a transient state: applying the union and rebuilding projections. It resolves to `CONVERGED` when
this device's version vector equals the peer's for every device both know about. Detecting a conflict during
`MERGED` does **not** hold the state — the projection is made total by a deterministic provisional value and
the fork is raised as a Decision (§11); convergence is a property of the event set, not of whether a human has
answered yet.

### 3.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | `register_device` | Converged | device identity created; genesis provenance recorded (§6.2) |
| Converged | `local_append` \| `peer_has_more` | Diverged | a new local event, or a version-vector gap observed from a peer |
| Diverged | `begin_sync(peer)` | Syncing | peer authenticated as a device of a known Seat (§12); transport reachable |
| Syncing | `delta_verified` | Merged | every incoming event chained to its origin device's prior hash (§6.3); no gap |
| Syncing | `chain_verification_failed` | Diverged | offending peer quarantined; `ChainVerificationFailed` logged (§12, F3) |
| Syncing | `peer_unreachable` | Diverged | partial delta rolled back atomically; retry scheduled; **no data loss** |
| Merged | `union_applied` | Converged | version vectors equal for all shared devices; projections rebuilt |
| Merged | `conflict_detected` | Merged \| Converged | provisional value applied; `sync_conflicts` + `decisions` row raised; convergence proceeds |
| Converged \| Diverged | `revoke_device(d)` | (same) | `d` marked revoked; its already-replicated events are retained; no future delta accepted from `d` |

### 3.3 Invariants

1. **Local work never waits on a sync state.** Appending an event, running a Turn, producing a Brief — none of
   these consult the sync state or block on a peer. A device with no reachable peer is `DIVERGED` and fully
   functional (the offline-default-safe stance inherited from M16 §15 and `/docs/02-system-design.md` §6).
2. **A merge is atomic or it did not happen.** `Syncing → Merged` applies the whole verified delta in one
   kernel transaction (`/docs/02-system-design.md` §5) or rolls it all back. There is no state in which half a
   peer's events are admitted.
3. **Convergence is decided by the event set, not by conflict resolution.** Two devices are `CONVERGED` the
   moment they hold the same event set, whether or not every raised Decision has been answered. An open
   conflict is a pending `decisions` row, not an unmerged state (this is what makes G9/AC10 possible).
4. **No transition rewrites a stored event.** Every transition is insert-only over `events` (ADR-0066). The
   only mutation is to *projections*, which are derived and rebuildable by definition.

---

## 4. Conflict lifecycle

A conflict is a distinct object with its own short lifecycle, because it outlives the merge that detected it —
it lives until the Principal resolves it.

```
   detected ─────────────────►  raised_as_decision ─────────────►  resolved
 (during projection rebuild:   (a sync_conflicts row links a       (Principal chooses; a superseding
  two concurrent events         decisions row; both values are      event is appended on THIS device;
  supersede the same cell       options, both events are            the next merge carries the choice;
  value — a fork, §11)          evidence; provisional winner        the fork is closed, never edited)
                                already applied so the
                                projection is total)
```

- **detected → raised_as_decision** is automatic and immediate, inside the same rebuild that found the fork.
  The provisional winner (the deterministic-order maximum of the two, §10.2) is what the projection shows
  meanwhile, so the UI is never blank or wrong-by-omission — it is *marked contested*, exactly as
  `canon.status = 'contested'` already works (`/docs/04-database-design.md` §6).
- **raised_as_decision → resolved** is a Principal act (`/docs/03-decision-engine.md` §8). Resolving appends a
  **new** event that supersedes both forked events for that cell (mirroring `decisions.supersedes` /
  `canon.supersedes`). Because resolution is itself an event, it replicates and converges like any other — the
  choice made on one device reaches the others by the same anti-entropy path, and re-running the rebuild
  everywhere yields the resolved value with no further conflict.
- A conflict is **never** resolved by editing the projection or by deleting a forked event. The forked events
  are permanent evidence (Principle 3, ADR-0002). Only a superseding event closes a fork.

---

## 5. Domain model

### 5.1 Core types

```
DeviceId(Ulid)              // stable identity of one device holding the Vault
SeatId(Ulid)               // the human the device belongs to (M21); every event already carries it
PeerId = DeviceId          // a remote device this device syncs with
DeviceSeq(u64)             // monotonic append counter WITHIN one device's chain (per-device, not global)
Hlc { wall_ms: u64, counter: u32, device: DeviceId }   // hybrid logical clock stamped on every event
EventHash(Sha256)          // sha256(prev_hash ‖ canonical(event)) — chained within the device's stream
VersionVector = Map<DeviceId, DeviceSeq>   // "the highest device_seq I hold from each device"
ProjectionCell { table: String, row_id: Ulid, field: String }   // the addressable unit of a conflict
```

`DeviceSeq` replaces the role a single global `seq` played in ADR-0002's one-writer world. The global
`events.seq` (`AUTOINCREMENT`) is retained unchanged as the **local materialization order** — a device's own
rowid cursor for replay and for the event bus's durable tail (`/docs/02-system-design.md` §2) — but it is no
longer the cross-device identity of an event. Cross-device identity is `(device_id, device_seq)`, and the
chain hashes over `(prev_hash, device_id, device_seq, hlc, kind, payload)` within a device's stream.

### 5.2 Event provenance — the additive dimension

Every event gains provenance. For a single-device Firm these fields have exactly one value each and the chain
is exactly ADR-0002's chain (AC12).

| Field | Type | Meaning |
|---|---|---|
| `device_id` | `DeviceId` | which device authored this event |
| `device_seq` | `DeviceSeq` | its position in that device's own append-only chain |
| `hlc` | `Hlc` | hybrid logical clock — the total-order key (§10.2) |
| `prev_hash` | `EventHash` | the hash of this device's previous event (chain link, **within this device only**) |
| `hash` | `EventHash` | `sha256(prev_hash ‖ canonical(row))` — unchanged formula, now scoped per device |
| `sig` | `Signature` | the device's signature over `hash` (§12); makes a forged event detectable |
| `supersedes_cell` | `Option<(EventId, ProjectionCell)>` | for a single-valued-cell write: the event whose value this observed and replaces (the causal parent for conflict detection, §11) |

`supersedes_cell` is the quiet keystone. It reuses the pattern already present as `decisions.supersedes`,
`canon.supersedes`, and `artifacts.supersedes` (`/docs/04-database-design.md` §5–§7): a write to a mutable
single-valued cell records which prior value it saw. Two writes that both supersede the same prior value are a
**fork** — the definition of a conflict (§11).

### 5.3 `Device` and `Peer`

```
Device {
    id:         DeviceId,
    seat_id:    SeatId,          // the owner (M21); a device belongs to exactly one Seat
    name:       String,          // "Laptop", "Studio desktop" — human-readable
    pubkey:     PublicKey,       // Ed25519; the counterpart to sig (§12), same primitive as plugin signing
    status:     DeviceStatus,    // active | revoked
    created_at: Timestamp,
    last_seen:  Option<Timestamp>,
}

Peer {
    device_id:  DeviceId,        // the remote device
    transport:  Transport,       // folder | relay  (a plugin surface, §7.4; scalability §4)
    endpoint:   String,          // opaque to the merge; the transport interprets it
    cursor:     VersionVector,   // what this device believes the peer already holds (§7.2)
    added_at:   Timestamp,
    last_sync:  Option<Timestamp>,
}
```

A `Device` is authenticated by its `pubkey`; a `Peer` is a `Device` this one exchanges events with over a
`Transport`. The `Transport` is deliberately a plugin surface (folder-based syncers such as iCloud/Dropbox, or
a self-hosted relay), and the merge logic knows nothing about which one is in use (G11) — end-to-end
encryption is preserved so a relay sees ciphertext only (`/docs/09-scalability.md` §4).

### 5.4 `SyncConflict` — the conflict primitive

```
SyncConflict {
    id:            Ulid,
    cell:          ProjectionCell,        // table + row_id + field
    fork:          [EventId; 2..],        // the concurrent events that disagree (≥2)
    provisional:   EventId,               // the deterministic-order winner shown meanwhile (§10.2)
    decision_id:   DecisionId,            // the decisions row this conflict raised (REQUIRED — §9)
    status:        ConflictStatus,        // detected | raised | resolved
    detected_at:   Timestamp,
    resolved_by:   Option<EventId>,       // the superseding event that closed it
}
```

`decision_id` is required and non-null. A `SyncConflict` that did not raise a Decision is a contradiction in
terms — it would be a silent overwrite wearing a record's face. The `decisions` row it points to has the two
forked values as `options`, the two events as `evidence_refs`, and `authority = principal` pending resolution
(`/docs/03-decision-engine.md` §2).

### 5.5 Relationships (ASCII)

```
Seat 1 ──── * Device                     (a device belongs to one Seat, M21)
Device 1 ──── * Event                    (per-device append-only chain: prev_hash links within one device)
Device 1 ──── 0..1 Peer.cursor           (one version-vector cursor per known peer)
Event  * ──── 1 DeviceId                 (provenance: who authored it)
Event  0..1 ── supersedes_cell ──► Event (the causal parent for a single-valued-cell write)
SyncConflict * ──── 1 ProjectionCell     (the contested cell)
SyncConflict 1 ──── 2..* Event           (the fork: concurrent events that disagree)
SyncConflict 1 ──── 1 Decision           (REQUIRED — the conflict IS a Decision, ADR-0065)
VersionVector : Map<DeviceId → DeviceSeq> (the compact "what I hold" summary exchanged at sync)
MergedHistory = ⋃ device chains, ordered by (hlc, device_id, device_seq)   (a pure function of the set)
```

---

## 6. The event log across devices (ADR-0066 in mechanism)

### 6.1 One chain per device, not one chain

ADR-0002's chain is preserved in structure and purpose; only its *scope* narrows from global to per-device.
Each device maintains its own append-only, hash-chained stream:

```
Device L (laptop):     eL0 ← eL1 ← eL2 ← eL3        (prev_hash links, Device L only)
Device D (desktop):    eD0 ← eD1 ← eD2              (prev_hash links, Device D only)

Merged history (a derived total order over the UNION — no new hash edges):
        eL0 · eD0 · eL1 · eL2 · eD1 · eL3 · eD2      ordered by (hlc, device_id, device_seq)
```

The merge introduces **no new `prev_hash` edges**. It does not chain `eD0` onto `eL0`. Each device's chain
stays exactly as that device wrote it, verifiable in isolation. The "merged history" is a *sequence computed
from the set* (§10), materialized as an index, not as a rewritten chain. This is the whole of ADR-0066: the
integrity guarantee is "every device's chain verifies end-to-end, and the union is exactly the two chains,"
not "there is one global chain" — which multi-writer reality already ruled out.

### 6.2 Genesis and the single-device identity

At `register_device`, the device records a genesis provenance: `device_seq = 0`, `prev_hash = genesis pin`
(the same genesis mechanism ADR-0002 pins in `preferences`, `/docs/07-security-model.md` §8). A Firm that
never adds a second device has exactly one device chain, which is exactly ADR-0002's single chain — same
formula, same verification, byte-identical behaviour (AC12, G7). M24 costs a single-device Firm nothing at
runtime; the provenance columns carry one constant value and the merge path is never entered.

### 6.3 Admission: verify before you union

An incoming event from a peer is admitted **only if** it chains correctly to that peer's prior event that
this device already holds (or to genesis):

```
admit(e from device d):
    prior = local_head_of(d)                      // highest device_seq we hold from d, or genesis
    require e.device_seq == prior.device_seq + 1   // no gap, no reorder
    require e.prev_hash  == prior.hash             // chains to the exact predecessor
    require verify_sig(e.hash, e.sig, device_pubkey(d))   // authored by d, not forged (§12)
    → insert e (never edit, never re-hash)
```

A gap (a missing intermediate event) suspends admission of `d`'s later events until the gap is filled by a
subsequent delta — the protocol re-requests from the cursor. A hash or signature mismatch is a hard rejection:
`ChainVerificationFailed`, the peer is quarantined, nothing is admitted (§12, F3). Admission is monotone and
insert-only (G3).

### 6.4 Neutrality

`sidra-sync` contains no device-specific and no transport-specific branching. There is no `if device == …`
and no `if transport == "dropbox"` in the merge or conflict logic — the transport is a plugin surface and the
merge is a pure function of provenance-stamped events. A CI grep asserts this, mirroring the kernel-neutrality
gate that forbids department identifiers in the kernel (`/MASTER_IMPLEMENTATION_GUIDE.md` §7, G11).

---

## 7. The sync protocol (anti-entropy, pull/push of event ranges)

### 7.1 Shape

Sync is **anti-entropy gossip**, not consensus. Two peers exchange compact summaries of what they hold, then
transfer only the difference. There is no leader and no lock.

```
Device A                          Device B
   │  1. authenticate (§12)          │
   │◄───────────────────────────────►│   each proves its device identity to the other
   │  2. exchange version vectors     │
   ├─ VV_A = {A:3, D:2} ────────────►│
   │◄──────────────── VV_B = {A:1, D:2, L:4} ┤
   │  3. compute deltas               │
   │     A needs: {L:1..4}            │   (B has L-events A lacks)
   │     B needs: {A:2..3}            │   (A has A-events B lacks)
   │  4. transfer + verify + admit    │
   ├─ push A2,A3 ───────────────────►│   B verifies each against A's chain, admits
   │◄──────────── push L1..L4 ────────┤   A verifies each against L's chain, admits
   │  5. rebuild projections          │   each device rebuilds locally from its merged union
   │  6. update cursors               │   VV_A = VV_B = {A:3, D:2, L:4}  → CONVERGED
```

### 7.2 The version vector is the cursor

A `VersionVector` maps every `DeviceId` the device has ever heard of to the highest `DeviceSeq` it holds from
that device. It is the entire "what do you have" question compressed to O(devices) integers — and 3.0 is
"server + clients" with a handful of devices (`/docs/09-scalability.md` §1), so the vector is tiny. The delta
one peer owes another is exactly the ranges where its vector exceeds the other's. `Peer.cursor` caches the
last-known peer vector so an unchanged peer transfers nothing.

This is the direct, concrete realization of scalability §4's "events carry `(device, seq)`": the version
vector *is* the per-device seq frontier, and it makes sync "a well-understood append-and-merge problem instead
of row-level conflict resolution" (`/docs/09-scalability.md` §4), exactly as that document promised the 2.0
design would.

### 7.3 Pull, push, and idempotency

- **Pull** = "send me everything after my vector." **Push** = "here is everything after your vector." A full
  sync is both, in either order — the merge is commutative (§18), so which happens first cannot change the
  result.
- Every transferred event is idempotent to admit: it carries its own `(device_id, device_seq, hash)`, so
  re-receiving one already held is a no-op (matched by identity, not re-inserted). Retries over an unreliable
  transport are safe (the idempotency stance from `/docs/09-scalability.md` §2 and `/docs/02-system-design.md`
  §5, unchanged).
- A partial transfer that is interrupted admits only the contiguous, verified prefix of each device's stream
  (§6.3 forbids gaps), then leaves the peer `DIVERGED` for a later retry. Nothing partial corrupts the union.

### 7.4 Transport is a plugin

The bytes-on-the-wire layer is a `Transport` extension point (folder syncer or self-hosted relay), consistent
with `/docs/09-scalability.md` §4 ("Transport is a plugin … No first-party cloud") and the extension-point
model of `/docs/02-system-design.md` §8. The merge substrate hands the transport an opaque, encrypted event
batch and a peer endpoint; the transport moves it. End-to-end encryption means a relay sees ciphertext only.

### 7.5 Sync is itself audited

Every sync produces events on this device's own chain: `SyncStarted`, `EventsPulled`, `EventsPushed`,
`SyncCompleted` (§12.2 list). These are ordinary events — they replicate and converge like any other. The
audit trail therefore records not only what the Firm did, but every occasion two devices exchanged history,
who they were, and what moved — with no secret and no event payload duplicated, only counts and version
vectors.

---

## 8. Persistence, events, and the Vault mirror

### 8.1 New tables and additive columns (forward-only migrations `0050`–`0053`)

The migration band is `0050`–`0053` (`/MILESTONE_REGISTRY.md` numbering for 3.0; connector migrations ended
well before). All are additive; a Firm with one device and no peers is unaffected (AC12,
`/docs/04-database-design.md` §10).

| Migration | Object | Purpose |
|---|---|---|
| `0050_sync_devices.sql` | `sync_devices` | device identity registry: `device_id`, `seat_id`, `name`, `pubkey`, `status`, `created_at`, `last_seen` |
| | `sync_peers` | known peers + transport: `device_id`, `transport`, `endpoint`, `added_at`, `last_sync` |
| `0051_sync_cursors.sql` | `sync_cursors` | per-peer replication position (the version vector): `peer_device_id`, `for_device_id`, `device_seq`, `updated_at` — one row per `(peer, device)` frontier |
| `0052_event_provenance.sql` | `events` (additive columns) | `device_id`, `device_seq`, `hlc_wall`, `hlc_counter`, `sig`, `supersedes_event` — all nullable, defaulting to the single local device for pre-M24 rows |
| | `merge_log` | one row per merge operation: `id`, `peer_device_id`, `events_admitted`, `conflicts_raised`, `vv_before`, `vv_after`, `at` — audit of convergence |
| `0053_sync_conflicts.sql` | `sync_conflicts` | the conflict primitive linking a fork to the Decision it raised: `id`, `cell_table`, `cell_row_id`, `cell_field`, `fork_event_ids` (JSON), `provisional_event_id`, `decision_id` (FK → `decisions`), `status`, `detected_at`, `resolved_by_event_id` |

No existing column's meaning changes. `events.seq` remains the local `AUTOINCREMENT` materialization cursor
(§5.1); the provenance columns added in `0052` carry the cross-device identity. The `0052` columns are
nullable with a single-device default precisely so the migration is a no-op transformation for an existing
Vault — the pre-M24 rows become "device L, sequential device_seq" under one device, and the chain still
verifies (AC12).

### 8.2 Projections are rebuilt from the merged log

Convergence never writes projection rows from a peer. It admits the peer's *events* (§6.3) and then rebuilds
the affected projections locally by replaying the merged union in deterministic order (§10). Two rebuild
paths exist:

1. **Full rebuild** — replay every event from genesis in merge order. This is ADR-0002's existing "rebuild
   and diff" oracle, unchanged; it is the correctness reference every integration test asserts against.
2. **Incremental rebuild** (§14) — replay only from the *merge frontier* (the earliest deterministic-order
   position an admitted event occupies) forward, recomputing only the projection cells those events touch.
   This is what runs after a routine sync; it is bounded by the size of the delta, not the size of history
   (G10).

A projection row's value after convergence is a function purely of the merged event set. That is the property
that makes "no silent overwrite" *provable*: there is nothing to overwrite — the projection is derived, and
the log it derives from lost nothing.

### 8.3 Domain events (on the hash chain)

Every event carries `actor` (Seat), `device_id`, and `hlc`, and lands on its device's chain (ADR-0002):

`DeviceRegistered` · `DeviceRevoked` · `PeerAdded` · `PeerRemoved` · `SyncStarted` · `EventsPulled` ·
`EventsPushed` · `SyncCompleted` · `MergeApplied` · `ConflictDetected` (raises a `decisions` row) ·
`ConflictResolved` (the superseding event that closes a fork) · `ChainVerificationFailed` (a rejected /
quarantined peer) · `PeerUnreachable`.

`ConflictDetected` is the pivotal one: emitting it is inseparable from writing the `sync_conflicts` row and
its `decisions` row (§9). There is no code path that detects a fork without raising a Decision (AC5).

### 8.4 Vault Markdown mirror (the archive outlives the software)

```
~/Sidra/
└── sync/
    ├── devices.md          this Firm's devices, their Seats, when each was seen — human-readable, no key
    ├── peers.md            who this device syncs with, over which transport, last sync time
    ├── conflicts/          one file per raised conflict: the cell, the two values, the Decision it became
    └── merges/             per-sync record: peer, counts, version vectors before/after — no event payloads
```

Written on state transitions (register, sync, conflict, resolve), not continuously — the same discipline as
M16 §11.3. A Principal who abandons Sidra OS keeps a readable record of every device, every sync, and every
conflict-that-became-a-Decision, but no device private key (which lives only in the keychain) and no
duplicated event payloads (the events themselves are the archive).

---

## 9. Conflict → Decision (ADR-0065 in mechanism)

### 9.1 What is and is not a conflict

The event streams never conflict — a union is conflict-free. A conflict is strictly a **projection** event,
and only for a specific shape of cell:

| Cell shape | On concurrent divergent writes | Why |
|---|---|---|
| **Append-only** (events, decisions, dissents, meeting_turns, canon-as-history) | **Union.** Both survive. No conflict. | There is no single value to disagree about; both are kept, ordered (§10). |
| **Multi-valued / set** (an engagement's tags, a work-order's inputs list) | **Union.** Both contributions survive. No conflict. | Set-CRDT semantics: the merged set is both, deterministically ordered. |
| **Single-valued, mutable, audit-bearing** (an engagement `title`, a canon `statement`, a decision `chosen_option`, a mandate `objective`) | **Decision.** Raise `sync_conflicts` + `decisions`. | Picking one silently would be a last-writer-wins overwrite of a Principal-meaningful value — the forbidden move (§1.4). |
| **Single-valued, non-audit, ephemeral** (`ui_state`, `preferences` — panel sizes, last room) | **Declared last-writer-wins**, by explicit per-field policy only (§9.4). | Honors `/docs/09-scalability.md` §4's narrow allowance; never touches anything the Principal would want to have been asked about. |

The classification is a **declared, static property of each projection cell**, not a runtime guess — a
manifest fact, exactly as M16 made effect class a manifest fact rather than a runtime inference (M16 §5.2). A
cell not on the ephemeral allowlist is audit-bearing by default; the safe default is "raise a Decision."

### 9.2 Fork detection

During projection rebuild (§8.2), for each single-valued audit-bearing cell, the rebuilder follows
`supersedes_event` (§5.2) to reconstruct the cell's supersession forest. A node with **two children** — two
concurrent events each claiming to supersede the same prior value — is a fork:

```
        eL0: title = "Q3 plan"
        ╱          ╲
 eL3: "Q3 roadmap"   eD1: "Q3 strategy"      ← both supersede eL0, neither supersedes the other
      (device L)          (device D)              → FORK on (engagements, e_id, title)
```

Neither `eL3` nor `eD1` observed the other (each recorded `supersedes_event = eL0`), so neither is causally
after the other — they are concurrent. That is the mechanical definition of the conflict, and it needs no wall
clock and no heuristic: it is a fork in a supersession tree the schema already models everywhere else
(`decisions.supersedes`, `canon.supersedes`, `artifacts.supersedes`).

### 9.3 Raising the Decision

On detecting a fork, the rebuilder, in the same transaction:

1. Applies the **provisional winner** — the deterministic-order maximum of the forked events (§10.2) — so the
   projection cell is total and the UI shows a definite (contested) value.
2. Marks the cell **contested** (the `canon.status = 'contested'` pattern, generalized).
3. Writes a `sync_conflicts` row (§5.4) and a `decisions` row (`/docs/04-database-design.md` §5) whose
   `question` names the cell, whose `options` are the two forked values with their authoring device and Seat,
   whose `evidence_refs` are the two events, whose `reversibility` is assessed from the cell (a title is
   class 1; a `chosen_option` on a one-way-door Decision inherits its class), and whose `authority` is
   `principal` pending resolution.
4. Emits `ConflictDetected`.

This is a Decision by every criterion of `/docs/03-decision-engine.md` §1 — it overrides one device's recorded
value with another's, and the Principal should remember it — so it belongs in the Decision Engine, not in a
bespoke resolver. It appears wherever Decisions appear: Boardroom → Decisions, the Archive, the Inspector, and
the Morning Brief (`/docs/03-decision-engine.md` §9). Conflicts on the same subject are **batched** into one
Decision where possible, mirroring the Approval batching rule (`/docs/07-security-model.md` §6) — the Firm
asks once about a subject, not once per field.

### 9.4 The narrow last-writer-wins allowance

`ui_state` and `preferences` are the only cells eligible for declared last-writer-wins, and only because they
are non-audit, non-Principal-meaningful, and explicitly listed in `/docs/09-scalability.md` §4. Their
"resolution" is `(hlc, device_id)`-max — the deterministic order, applied silently *because the policy for
that cell says so, in a declared allowlist*, not because the merge fell through to a default. Every other
single-valued cell is audit-bearing and raises a Decision. There is no path by which an audit-bearing cell is
silently overwritten (AC4).

---

## 10. The deterministic merge order (ADR-0064 in mechanism)

### 10.1 Union first, always

Merging two devices' histories is, at the event layer, set union:

```
merged_events = local_events ∪ peer_events        // by (device_id, device_seq) identity; duplicates collapse
```

Union is monotone and loses nothing (G2, AC3). Nothing in the merge deletes, drops, or deduplicates by
content — only by exact identity, which is idempotency, not loss.

### 10.2 The total-order key

The merged events are placed in a single total order by a key that is a **pure function of each event**:

```
order_key(e) = (e.hlc.wall_ms, e.hlc.counter, e.device_id, e.device_seq)
```

- `hlc` is a **hybrid logical clock**: `wall_ms` tracks real time loosely, `counter` breaks ties and advances
  on every local event and on receipt of any event with a higher clock, so the clock respects causality (an
  event that observed another has a strictly greater `hlc`).
- `(device_id, device_seq)` is unique per event, so `order_key` is a **strict total order** — no two events
  tie, the sort is fully determined, and it depends only on the set of events, never on the order they
  arrived or the topology that delivered them.

Because the order is a pure function of the set, every device that holds the same event set computes the
**same** merged history and therefore the **same** projections. This is the mathematical content of "converge"
(G1) and of "commutative and associative" (G6, §18).

### 10.3 Causality vs. order

The total order (§10.2) decides *materialization sequence*. **Causality** — needed only to decide whether two
writes to one cell are concurrent (§9.2) — is decided by `supersedes_event`, not by the clock. This separation
is deliberate: a clock can be skewed, but `supersedes_event` records exactly which value an author actually
observed, so "are these concurrent?" is answered by structure, not by trusting a timestamp. Clock skew can
only affect which forked value is the *provisional* winner (§10.4), and a fork is a Decision regardless — so
skew never causes a silent wrong answer (§16, SR-1).

### 10.4 Merge rewrites nothing

Producing the total order never mutates a stored event. `order_key` is computed from fields the event already
carries; the order is materialized as an **index / replay cursor**, not by renumbering `device_seq`, not by
re-hashing, not by editing `prev_hash`. Every pre-existing event's stored bytes and `hash` are identical
before and after any merge (G3, AC7). This is ADR-0066's guarantee made operational: the only writes a merge
performs to `events` are inserts of the peer's events; everything else it produces is derived.

---

## 11. Conflict detection, precisely

Restating §9.2 as the exact algorithm the rebuilder runs, because it is the heart of the exit criterion:

```
for each single-valued audit-bearing cell C touched in the merge frontier:
    writers = events in merged history where supersedes_event refers to C's value chain
    build supersession forest over writers by supersedes_event
    for each node N with ≥2 direct children:            # a fork
        fork = children(N)
        provisional = max(fork, by order_key)           # §10.2 — total, deterministic
        set projection(C) = value(provisional); mark C contested
        write sync_conflicts{cell:C, fork, provisional, decision_id: raise_decision(C, fork)}
        emit ConflictDetected
```

Properties this guarantees:

- **Deterministic.** Every device computes the same forks and the same provisional winners from the same set
  (the forest and `order_key` are pure functions of the events) — so the raised Decision is identical
  everywhere, and resolving it once, anywhere, converges everywhere.
- **Total.** The projection is always defined (the provisional value), so no surface is ever blank or stale.
- **Non-silent.** A fork *always* produces a `sync_conflicts` + `decisions` row and a `ConflictDetected`
  event. There is no branch that picks a value and moves on quietly (AC4). The provisional value is *marked
  contested*, not *silently chosen*.

---

## 12. Security

Sync is the second-largest attack surface the Firm has, after connectors — it accepts history authored
elsewhere and folds it into the source of truth. Every mitigation below is an application of an existing
control (the hash chain, device identity, redaction, the Broker), not a new one.

| Threat | How M24 addresses it |
|---|---|
| **A malicious peer injects a fabricated event** | Admission verifies the event chains to that device's prior hash **and** carries a valid device signature (§6.3, §5.2). A fabricated event either breaks the chain or fails the signature → `ChainVerificationFailed`, peer quarantined, nothing admitted (AC9). |
| **A peer forges another device's history** | An event may be admitted only under a `device_id` whose `pubkey` verifies its `sig`. A peer relaying device L's events must relay L's *intact, L-signed* chain; it cannot author events as L (it lacks L's key). |
| **A peer replays or reorders a device's stream** | `device_seq` must be contiguous and `prev_hash` must match the exact predecessor (§6.3). A replayed event is idempotent (already held); a reordered one fails the `prev_hash` check. |
| **T6 silent history tampering (`/docs/07-security-model.md` §3)** | Extended to multi-device: `audit.verify` runs **per device chain**; a tampered stored event breaks its device's chain and names the first bad `device_seq`. The merge cannot launder a tampered event because admission re-verifies (§6.3). |
| **T2/T3 exfiltration or key theft via the transport** | The transport is a plugin carrying **ciphertext only**; a relay sees no plaintext and no key (E2E, `/docs/09-scalability.md` §4). Device private keys live in the keychain, never in an event, log, or the transport; redaction strips any key pattern on every write path (`/docs/07-security-model.md` §9), unchanged. |
| **An unauthenticated device joins the mesh** | A peer must authenticate as a device of a **known Seat** (M21) before any exchange (§7.1, §3.2 guard). An unknown device is refused; adding a device is a logged act (`DeviceRegistered`), never implicit. |
| **A conflict is resolved without the Principal** | Resolution requires a Principal Decision (`/docs/03-decision-engine.md` §8); the resolving superseding event records `authority = principal`. No agent and no merge auto-resolves an audit-bearing fork (AC4). |

**The single choke point holds.** Admitting a peer's events is a kernel command: it validates (chain +
signature), authorizes (the peer is a known device), persists (insert-only), and emits — the
`/docs/02-system-design.md` §1 command contract, unchanged. Sync adds pre-admission verification *ahead* of
the persist; it removes no existing check. A conflict's Decision passes through the Decision Engine exactly as
every other Decision does.

### 12.1 Device authentication

Each device holds an Ed25519 keypair (the same primitive as plugin signing, `/docs/07-security-model.md` §8,
ADR-0006) — the private key in the OS keychain, the public key in `sync_devices`. A device signs the `hash` of
each event it authors. Peer authentication at sync time is a challenge-response over these identities,
mediated by the M21 Seat substrate and the M23 client boundary. The merge substrate consumes an *already-
authenticated* peer identity; it does not implement transport auth itself (that is M23/security territory —
authoritative precedence, §0).

### 12.2 Sync events for audit

`SyncStarted` · `EventsPulled` · `EventsPushed` · `SyncCompleted` · `MergeApplied` · `ConflictDetected` ·
`ConflictResolved` · `ChainVerificationFailed` · `PeerUnreachable` · `DeviceRegistered` · `DeviceRevoked` ·
`PeerAdded` · `PeerRemoved`. Each is redaction-filtered (no key, no duplicated payload) and lands on the
authoring device's chain, so the audit trail of *convergence itself* is as complete and verifiable as the
audit trail of the work.

---

## 13. Public APIs

### 13.1 Commands

| Command | Effect | Notes |
|---|---|---|
| `register_device(name) -> DeviceId` | a device identity + genesis provenance | keypair generated, private key to keychain (§12.1); a logged act |
| `add_peer(device_id, transport, endpoint)` | a `sync_peers` row | the transport is a plugin (§7.4); adding a peer is logged, never implicit |
| `sync_with_peer(peer) -> SyncReport` | pull + push + merge + rebuild | the §7 anti-entropy path; returns events admitted, conflicts raised, resulting version vector |
| `resolve_sync_conflict(conflict, chosen) -> EventId` | appends a superseding event | a Principal **Decision** (`/docs/03-decision-engine.md` §8); closes the fork; converges on next sync |
| `revoke_device(device_id)` | marks a device revoked | its already-replicated events are **retained** (Principle 3); no future delta accepted from it |
| `remove_peer(peer)` | drops a `sync_peers` row | stops syncing with a peer; retains everything already merged |

### 13.2 Queries

| Query | Returns |
|---|---|
| `list_devices()` | this Firm's devices, Seats, last-seen — no private key |
| `list_peers()` | peers, transports, last-sync times, current version-vector gap |
| `sync_status(peer)` | `CONVERGED` / `DIVERGED` / `SYNCING`, and the version vectors on each side |
| `list_sync_conflicts()` | open conflicts, each as its pending `decisions` row (§9) |
| `verify_merged_chain()` | per-device `audit.verify` results + the union-equals-both check (AC3, AC8) |

### 13.3 API rules

1. **No API rewrites an event.** Convergence is insert-only; `resolve_sync_conflict` *appends* a superseding
   event and never edits a forked one (ADR-0066, ADR-0002).
2. **No API returns a device private key.** Only a `pubkey` where a key is structurally needed; never the
   secret, never over IPC to the renderer (`/docs/07-security-model.md` §2).
3. **`resolve_sync_conflict` is a Decision** — logged, with the two values shown in plain language before the
   choice (`/docs/03-decision-engine.md` §8). It is the only way to close a fork.
4. **Convergence never blocks on a conflict.** `sync_with_peer` returns `CONVERGED` with a list of raised
   Decisions; it does not wait for a human (invariant §3.3.3, AC10).
5. **Every incoming event is verified before admission.** Chain + signature (§6.3); a failure is a hard
   rejection, never a "best effort" merge.

---

## 14. Performance

- **Merge cost is bounded by the delta, not by history.** Admission is O(new events); incremental projection
  rebuild (§8.2) touches only the cells the delta's events write, replaying from the merge frontier forward,
  not from genesis (G10). A device offline for a month at the measured ~500 events/day
  (`/docs/09-scalability.md` §6) returns with ~15 k events — admitted and rebuilt in seconds, well inside a
  desktop's budget; `audit.verify` over that range is a linear hash walk.
- **Version-vector exchange is O(devices).** 3.0 is "server + clients," a handful of devices
  (`/docs/09-scalability.md` §1); the summary exchanged before any transfer is a few integers, so an
  already-converged pair transfers nothing but the vectors.
- **Sync is off the hot path.** It runs as background work under the scheduler's fairness cap
  (`/docs/02-system-design.md` §4, background ≤25% when interactive work is queued); it never blocks a Turn, a
  Mission, or a Brief. Local work proceeds on a `DIVERGED` device at full speed (invariant §3.3.1).
- **Large divergence stays within budget.** The full rebuild (the correctness oracle) is O(history) and is
  reserved for verification and first-time replication; routine convergence uses the incremental path. The
  event-log growth envelope (`/docs/04-database-design.md` §9, ~120 k events/year, ~1.2 GB) is unchanged by
  M24 — replication moves the same events between devices, it does not multiply them.

---

## 15. Sequence diagrams

### 15.1 The exit-criterion path: diverge offline, reconnect, converge with no lost event

```
Device L (laptop, offline)        Device D (desktop, offline)          later: reconnect
   │ append eL1 (work)                │ append eD1 (work)                    │
   │ append eL2 (decision)            │ append eD2 (canon)                   │
   │  chain: eL0←eL1←eL2              │  chain: eD0←eD1←eD2                   │
   │                                  │                                      │
   │═══════════════════ both come online, sync_with_peer ═══════════════════│
   │                                  │                                      │
   ├─ VV_L = {L:2, D:0} ─────────────────────────────────────────────────►  │
   │  ◄──────────────────────────────────────────── VV_D = {L:0, D:2} ──────┤
   │  delta L needs: {D:1..2}         │  delta D needs: {L:1..2}             │
   ├─ push eL1,eL2 ──────────────────────────────────────────────────────►  │  verify vs L-chain, admit
   │  ◄──────────────────────────────────────────── push eD1,eD2 ───────────┤  verify vs D-chain, admit
   │  union = {eL0,eL1,eL2,eD0,eD1,eD2}     union = same set                 │
   │  order by (hlc,device,seq) → identical on both                         │
   │  rebuild projections (incremental)     rebuild projections             │
   │  VV_L = {L:2,D:2} = VV_D  → CONVERGED   → CONVERGED                     │
   │  NO event dropped (union proven); NO event rewritten (insert-only)     │
```

### 15.2 A conflicting mutable value surfaces as a Decision

```
Device L (offline)                 Device D (offline)
   │ engagement E title = "Q3 plan" (from eL0, both hold)                    │
   │ edit title → "Q3 roadmap"        │ edit title → "Q3 strategy"           │
   │  eL3: supersedes_event = eL0     │  eD1: supersedes_event = eL0         │  ← same parent, concurrent
   │                                  │                                      │
   │══════════════════════════ sync_with_peer ═════════════════════════════ │
   │  union admits eL3 and eD1 (both kept — NO loss)                         │
   │  rebuild: cell (engagements,E,title) has fork {eL3, eD1} superseding eL0│
   │  provisional = max(eL3,eD1 by order_key) → projection shows it, CONTESTED│
   │  write sync_conflicts{cell, fork:[eL3,eD1], decision_id}                │
   │  write decisions{ question:"title of E",                               │
   │                   options:[{"Q3 roadmap", device L}, {"Q3 strategy", device D}],
   │                   evidence:[eL3, eD1], authority: principal }          │
   │  emit ConflictDetected            (NO silent overwrite — AC4/AC5)       │
   │                                                                        │
   │  Principal: resolve_sync_conflict(conflict, "Q3 roadmap")              │
   │  → append eL4: supersedes_event = {eL3, eD1}  (closes the fork)        │
   │  next sync carries eL4 to D → both converge on "Q3 roadmap", fork closed│
```

### 15.3 A tampered / forged event is rejected at admission

```
Device D               Malicious peer M
   │  sync_with_peer(M)      │
   ├─ VV_D ─────────────────►│
   │  ◄─── push e' claiming device L, seq 3, but e'.sig invalid ──┤
   │  admit(e'): verify_sig(e'.hash, e'.sig, pubkey(L)) → FAIL    │
   │  reject; nothing admitted; emit ChainVerificationFailed      │
   │  quarantine peer M; VV_D unchanged                           │
   │  (the union is never contaminated — verify precedes insert)  │
```

---

## 16. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | **Three-way divergence** — L, D, and a phone all append offline | Pairwise anti-entropy converges the mesh: any connected pair unions their sets; because the order is a pure function of the set (§10.2), the order in which pairs meet cannot change the final history. All three reach the same `CONVERGED` state once the events have propagated (AC11, §18 associativity). |
| F2 | **A device that never returns** | Its already-replicated events are permanently retained (union is monotone); its version-vector frontier simply stops advancing. No other device blocks: convergence among the reachable devices is unaffected (G9, AC10). Liveness is never gated on a missing peer — there is no quorum. |
| F3 | **A tampered / forged event stream** | Admission (§6.3, §12) rejects it: broken chain or bad signature → `ChainVerificationFailed`, peer quarantined, nothing admitted. The union is never contaminated because verification precedes insertion (§15.3). |
| F4 | **Clock skew across devices** | The total order is still deterministic (§10.2). Skew can only affect which forked value is the *provisional* winner; a fork is a Decision regardless (§10.3), so skew never yields a silent wrong answer (SR-1). Causality uses `supersedes_event`, not the clock. |
| F5 | **A sync interrupted mid-transfer** | Only the contiguous verified prefix of each device's stream is admitted (gaps forbidden, §6.3); the peer stays `DIVERGED`; a retry resumes from the cursor. Nothing partial corrupts the union (invariant §3.3.2). |
| F6 | **A conflict storm** (many cells forked after a long divergence) | Conflicts on one subject are batched into one Decision (§9.3, mirroring Approval batching); the Firm asks about a subject once, not per field. Convergence still completes immediately; the Decisions queue, they do not block (AC10). |
| F7 | **An event kind an older device does not understand** | Forward-compatibility (ADR-0002 "an event written in 1.0 must be readable in 4.0"): the event is stored, chained, and ordered like any other; its projection is deferred, never dropped. Convergence of the log is independent of whether every device can project every kind (SR-6). |
| F8 | **A device revoked while it still holds unreplicated events** | Its events already replicated are retained; revocation stops *future* deltas. If unreplicated events matter, they are recovered by one last sync before revoke; revoke never deletes history (Principle 3, §13.1). |

---

## 17. Dependencies, assumptions, risks

### 17.1 Dependencies

| On | For |
|---|---|
| **M23 — kernel extraction / hosted topology** | a device is a client of a hosted kernel; sync is between kernels (or kernel↔relay). Without M23 there is one process and nothing to sync (`/MILESTONE_REGISTRY.md` §4). |
| **M21 — Seats & device identity, ADR-0021** | a device belongs to a Seat; the `actor`/Seat field already on every event makes a merged event attributable with no chain rewrite. |
| **M2 — the hash-chained event log (ADR-0002)** | the merge substrate itself: append-only, hash-chained, projections rebuildable. |
| **Decision Engine (`/docs/03-decision-engine.md`)** | the destination of every conflict; `decisions`/`dissents` tables, the Boardroom/Archive surfaces. |
| **M3 — security kernel** | device keypairs (Ed25519, plugin-signing primitive), redaction on every write path, the Broker command contract. |

### 17.2 Assumptions

1. The M23 topology is in place: `services/*` runs hosted and the desktop app is a client. A Firm still
   running as a single embedded process has one device and never enters the merge path (AC12) — the model is
   unchanged, sync is simply dormant.
2. Every device belongs to a Seat (M21). If a Firm runs one Seat (the 3.0-minimum, ADR-0021), all its devices
   are that Seat's; the model is unchanged.
3. Transports are folder-based or a self-hosted relay (`/docs/09-scalability.md` §4); a first-party cloud is
   out of scope and would need its own ADR. The relay sees ciphertext only.
4. Clocks are loosely synchronized (within minutes); correctness does not depend on it (§10.3, F4) — only the
   provisional-winner choice does, and that is a Decision regardless.

### 17.3 Risks

| # | Risk | Mitigation |
|---|---|---|
| SR-1 | Clock skew makes the provisional winner surprising | Order is deterministic regardless; a fork is a Decision regardless; causality uses `supersedes_event`, not the clock (§10.3). The provisional value is *contested*, not final. |
| SR-2 | Projection rebuild is costly after a long divergence | Incremental rebuild from the merge frontier (§14, G10); the full rebuild is reserved for verification. Bounded by delta size, not history size. |
| SR-3 | A conflict storm floods the Decision queue | Per-subject batching (§9.3, F6); convergence never blocks on Decisions (AC10). |
| SR-4 | Version vectors grow with devices | 3.0 is few devices (`/docs/09-scalability.md` §1); retired devices are prunable from the vector once fully replicated and revoked; the vector is O(devices), not O(events). |
| SR-5 | A malicious peer contaminates the union | Verify-before-insert (§6.3, §12); a forged event is rejected before admission and can never enter the log (§15.3, AC9). |
| SR-6 | An unknown event kind breaks an older device's projection | Forward-compat (ADR-0002): stored, chained, ordered; projection deferred, never dropped (F7). |
| SR-7 | A merge silently overwrites an audit-bearing cell (the cardinal failure) | Structurally impossible for an audit-bearing cell: a fork *always* raises a Decision, the only silent path is the declared ephemeral allowlist (§9.4); the exit-criterion test proves it (AC4). |

---

## 18. Testing strategy

- **Property test — merge is commutative and associative over event sets.** Generate random sets of
  provenance-stamped events across N devices; merge them in every pairwise order and topology; assert the
  resulting projection hash is identical for all orderings (AC6). This is the formal content of "converge":
  because `order_key` and the supersession forest are pure functions of the set, order of arrival cannot
  matter, and the test is what proves it did not sneak in.
- **Property test — union is lossless.** For any two event sets, the post-merge set equals their union by
  `(device_id, device_seq)` identity: no member dropped, none invented (AC3).
- **Property test — no rewrite.** Snapshot every pre-existing event's stored bytes and `hash` before a merge;
  assert identity after (AC7).
- **Chaos — diverge-and-converge.** Partition N devices, drive random concurrent writes (including deliberate
  same-cell divergent writes), heal the partition in a random order, assert: all devices reach the same
  `CONVERGED` event set; every device chain still `audit.verify`s; every same-cell divergence produced a
  `sync_conflicts` + `decisions` row and **no** silent overwrite (AC4, AC5, AC8, AC11). This is the M24 analogue
  of the existing chaos gate (`/MASTER_IMPLEMENTATION_GUIDE.md` §7).
- **Adversarial — forged stream.** Inject events with broken chains and bad signatures; assert every one is
  rejected at admission and quarantined, and the union is unchanged (AC9).
- **Equivalence — single device is byte-identical.** A one-device Firm's chain and projections are identical
  to a pre-M24 build over the same Directives (AC12), the M24 analogue of M11's replay-equivalence gate.

---

## 19. CI requirements

Live from the first M24 commit, mirroring `/MASTER_IMPLEMENTATION_GUIDE.md` §7:

| Gate | Fails when |
|---|---|
| Dependency direction | any edge `sidra-sync → sidra-orchestrator` or `→ sidra-mission` (§6.4, AC14) |
| Crate neutrality | `sidra-sync` contains a device identifier or a transport identifier (`if device ==`, `if transport ==`) (G11) |
| Audit coverage | a sync/merge/conflict path exists with no log-entry assertion (AC13) |
| No silent overwrite | a same-cell divergent-write fixture does not produce a `sync_conflicts` + `decisions` row (AC4) |
| Merge algebra | the commutativity/associativity property test regresses (AC6) |
| Chaos | a partition/heal run fails to converge, loses an event, or rewrites one (AC3, AC7, AC11) |
| Chain integrity | per-device `audit.verify` fails, or a forged event is admitted (AC8, AC9) |
| Single-device equivalence | a one-device build diverges from the pre-M24 baseline (AC12) |
| Forward-compat | an unknown event kind is dropped rather than stored-and-deferred (SR-6, F7) |

---

## 20. Acceptance criteria

The exit criterion decomposed into testable claims. **These are the contract with AntiGravity.**

| # | Claim | Proven by |
|---|---|---|
| AC1 | Two devices each append events while offline, and each device's own chain verifies independently | offline-divergence test; per-device `audit.verify` before any sync |
| AC2 | On reconnect the two devices converge to the same shared event set | the exit-criterion diverge-and-converge test (§15.1); assert equal version vectors and equal event sets |
| AC3 | **No event is lost** — the post-merge event set is exactly the union of both inputs | union property test; count + hash-set equality of `(device_id, device_seq)` identities |
| AC4 | **No silent overwrite** — a concurrent divergent write to a single-valued audit-bearing cell is not last-writer-wins; it produces a contested projection + a raised conflict | the conflicting-write test (§15.2); assert a `sync_conflicts` row exists and the projection cell is marked contested, not silently replaced |
| AC5 | **Conflicts surface as Decisions** — the conflicting-write test yields a `decisions` row with both values as options and both events as evidence | assert the `decisions` row's `options`, `evidence_refs`, and `authority = principal`; assert a `ConflictDetected` event on the chain |
| AC6 | The merge is commutative and associative over event sets — same projections regardless of sync order or topology | the merge-algebra property test (§18) |
| AC7 | Convergence rewrites no existing event — merge is insert-only | before/after snapshot of every pre-existing event's bytes and hash |
| AC8 | Each device's chain verifies independently, before and after every merge | per-device `audit.verify` over a diverge-and-converge fixture |
| AC9 | A forged or tampered incoming event is rejected at admission and quarantined | adversarial-stream test; assert `ChainVerificationFailed` and an unchanged union |
| AC10 | A device that never returns blocks no other device's convergence | liveness test: one peer offline, the rest converge and continue |
| AC11 | Three-way (N-way) divergence converges to one history | chaos partition/heal test over ≥3 devices |
| AC12 | A single-device Firm is byte-identical to its pre-M24 self | single-device equivalence test vs. the pre-M24 baseline |
| AC13 | Every register/sync/merge/conflict/resolve is an audited event on the hash chain | `audit.verify` over a full sync-lifecycle fixture |
| AC14 | `services/sync` has no dependency edge to `services/orchestrator` or `services/mission` | dependency-direction check in CI |

---

## Appendix A — Glossary additions

- **Device** — one machine holding a copy of the Vault, with its own Ed25519 identity and its own append-only,
  hash-chained event stream. Belongs to a Seat (M21).
- **Peer** — a remote device this device exchanges events with, over a transport (folder or relay).
- **Event provenance** — the `(device_id, device_seq, hlc, sig)` an event carries, making it attributable and
  chain-verifiable after a merge without any global sequence.
- **Version vector** — a map from each known `DeviceId` to the highest `DeviceSeq` this device holds from it;
  the compact "what do you have" summary exchanged at sync.
- **Merged history** — the total order over the union of all devices' event streams, computed by
  `order_key = (hlc, device_id, device_seq)`; a pure function of the event set, materialized as an index, never
  as a rewritten chain.
- **Fork** — two concurrent events that supersede the same single-valued cell value with different values; the
  mechanical definition of a conflict.
- **Sync conflict** — a fork on an audit-bearing cell, recorded as a `sync_conflicts` row and raised as a
  `decisions` row for the Principal; never auto-resolved.
- **Provisional winner** — the deterministic-order maximum of a fork, shown (marked *contested*) so the
  projection stays total until the Principal resolves the Decision.
- **Anti-entropy** — the pairwise gossip protocol by which two peers exchange version vectors and transfer the
  events the other lacks; no leader, no quorum.

## Appendix B — Repository placement

```
services/
└── sync/                       NEW — crate sidra-sync
    ├── device                  device identity, keypair, genesis provenance
    ├── peer                    peers + the Transport plugin surface
    ├── clock                   the hybrid logical clock (HLC)
    ├── protocol                anti-entropy: version vectors, pull/push of event ranges
    ├── provenance              per-device chain verification on admission
    ├── merge                   the deterministic total order over the event union (insert-only)
    ├── projection              rebuild from the merged log (full + incremental)
    ├── conflict                fork detection → sync_conflicts → Decision
    └── conformance             the diverge-and-converge harness + the exit-criterion proof

services/store/migrations/      EXTENDED — 0050_sync_devices.sql … 0053_sync_conflicts.sql (forward-only)

infrastructure/testing/
└── sync/                       NEW — merge-algebra property tests, chaos partition/heal, forged-stream,
                                single-device equivalence, conflict-as-Decision
```

Dependency direction (ADR-0011): `packages/domain ← services/sync ← apps/*`. `services/sync` depends on
`services/store` (events + projections), `services/security` (device auth, redaction, Broker),
`services/seats` (M21 identity), and the M23 kernel-host boundary; it does **not** depend on
`services/orchestrator` or `services/mission` (CI-enforced, AC14).

## Appendix C — Implementation position

M24 is the fourth milestone of 3.0 "Chambers" and depends on M23 (the hosted topology that makes more than one
client possible) and M21 (Seats & device identity). Building it before M23 is the mistake the dependency graph
exists to prevent: without a kernel that runs as a hosted process with clients, there is one embedded process
and nothing to converge — sync would have to invent a topology M23 is responsible for. Building it before M21
means a device with no Seat to belong to and no actor field to attribute a merged event to, which is exactly
the chain-rewrite trap ADR-0021 spent 2.0 avoiding.

**Exit criterion.** Two devices diverge offline and converge with no lost event and no silent overwrite;
conflicts surface as Decisions — proven by test, not by configuration (AC2, AC3, AC4, AC5).
