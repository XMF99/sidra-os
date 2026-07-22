# ADR-0049 — No-desktop-present sync and idempotent reconciliation

**Status:** Accepted · **Date:** 2.5 "Field" (M18) · **Supersedes:** —

## Context

The M18 exit criterion is unambiguous: *a Principal clears a day's approvals from a phone with no desktop
present, and the Brief renders identically* (`/MILESTONE_REGISTRY.md` §4). "No desktop present" is the load-
bearing phrase and the one that appears to demand infrastructure M18 is not allowed to build.

The obvious reading — *a phone talks to a live kernel* — requires the kernel to be running headless and
reachable while the desktop is off. That is **Kernel Extraction, and it is M23** (`/MILESTONE_REGISTRY.md`
§4, 3.0 "Chambers"), five milestones and a release boundary away. M18 may not presuppose it. The equally
obvious escape — *a hosted cloud service the phone approves against* — is forbidden twice over: it would make
some server other than the Principal's kernel an authority over Decisions, and it would open an outbound
channel that ADR-0009 (no telemetry) exists to keep shut.

So the design must satisfy "no desktop present" with **neither a headless hosted kernel (M23) nor a cloud
service that holds authority**, while preserving three invariants that cannot bend:

1. The kernel on the Principal's desktop remains the **single source of truth**
   (`/docs/01-technical-architecture.md` §1). No other process decides anything.
2. Every approval is a **logged Decision on the append-only hash chain** (ADR-0002). Applying one is a pure
   append, never a rewrite.
3. The phone is **another untrusted client** (`/docs/01-technical-architecture.md` §4) — it holds no secret,
   no Vault, no ambient network to a model provider.

The tension is real, and resolving it correctly is the whole milestone. Everything else in M18 is plumbing
around this decision.

## Options

1. **Headless hosted kernel now (pull M23 forward).** The phone calls a live kernel over the network. Meets
   the letter of "no desktop present" directly. Rejected: it *is* M23, it needs the extraction ADR-0011 was
   written to make possible but which has not been executed, and it turns a personal desktop app into a
   network service with all the threat surface that implies — years before the programme intends to.

2. **Cloud approval service.** The phone approves against a Sidra-operated backend that later informs the
   kernel. Rejected: it makes a server the Principal does not own an authority over their own Decisions,
   violates the local-first stance, and is exactly the outbound behavioural channel ADR-0009 forbids. It also
   fabricates a second source of truth, which ADR-0002 exists to prevent.

3. **Phone re-implements a mini-kernel and merges later (CRDT / full offline authority).** The phone becomes
   a real writer to its own event log and the two logs merge. Rejected: this is **M24 (Sync and Conflict
   Resolution)**, it makes the phone an authority, and a conflict-resolution merge substrate is a large,
   separate, security-sensitive subsystem. M18 needs none of it because an approval is not free-form
   authorship — it is a bounded response to a request the kernel already created and identified.

4. **Local-first snapshot + append-only outbox + idempotent reconciliation (chosen).** While the desktop
   kernel is online, it pushes a bounded snapshot — the day's Briefs and the *currently pending* Approval
   Requests — to the paired phone. The phone works entirely from that cached snapshot. When the Principal
   approves or denies, the phone appends the decision to a local **append-only outbox**, each entry keyed to
   the `approval_request.id` it answers and signed by the paired device. Nothing is authoritative yet. Later —
   when the desktop kernel next runs, or when both devices reach a **dumb, optional relay** — the kernel
   **reconciles** the outbox: for each entry it validates the pairing signature, checks the request is still
   pending, and appends the Decision to the hash chain. Because each entry is keyed to a request id and a
   Decision for that request is written at most once, applying the same outbox entry twice is a no-op. The
   phone is never an authority; it is a courier carrying the Principal's signed intent to the one process that
   can act on it.

## Decision

Option 4. **"No desktop present" is satisfied at the moment of the Principal's action, not at the moment of
record.** Mechanically:

- **Snapshot (desktop online).** The kernel's companion service produces a `SyncSnapshot` — the day's Briefs
  as canonical render payloads (ADR-0051) plus the set of pending Approval Requests with their plain-language
  `who/what/why/cost/if-no` fields (`/docs/07-security-model.md` §6). It contains **no secret, no key, no
  Vault content, no credential** (a `KeychainRef` is never even referenced here). The snapshot is pushed to
  the paired phone over LAN or through the optional relay while the desktop is reachable.

- **Act (desktop absent).** The Principal reads the Brief and clears the day's approvals against the cached
  snapshot. The desktop need not be running, awake, or reachable. Each approval/denial becomes an
  **`ApprovalOutboxEntry`**: `{ approval_request_id, verdict, grant_scope, decided_at, device_id, signature }`,
  appended to the phone's local outbox. This is the only write the phone performs, and it writes only to its
  own outbox — never to the Vault, never to the chain.

- **Reconcile (desktop returns).** When the kernel next runs (or drains the relay), `reconcile_outbox`
  processes each entry **idempotently**:
  1. Verify the entry's signature against the pairing's device key, and that the device is not revoked
     (ADR-0050). A failed check discards the entry and logs `ApprovalCaptureRejected{reason: untrusted}`.
  2. Look up `approval_request_id`. If a Decision already exists for it (from this outbox, a prior
     reconciliation, or a desktop approval), the entry is a **duplicate and ignored** — a pure no-op.
  3. If the request is no longer pending (expired, superseded, or already resolved), the entry is **rejected
     as stale**, logged `ApprovalCaptureRejected{reason: stale}`, and the item is re-surfaced to the
     Principal. The phone's copy was a cache; the kernel's state wins.
  4. Otherwise, append the Decision to the hash chain — the *same* `decisions` row and `ApprovalResolved`
     event a desktop approval would produce, with `authority = 'principal'` and the paired device recorded as
     the capture surface — and update `approval_requests.status`. This is a pure append (ADR-0002).

- **The relay is optional, dumb, and authority-free.** It is store-and-forward for opaque, signed,
  pairing-scoped envelopes on the **Principal's own infrastructure** (a self-hosted endpoint, a synced folder,
  or a direct LAN transfer). It performs no validation of content, holds no key, cannot read a Brief, cannot
  apply an approval, and can be absent entirely — in which case sync happens whenever the two devices share a
  network. It is not a service Sidra operates and it is not a source of truth.

**Why this needs neither M23 nor a cloud service.** M23 exists to make the kernel serve clients *live and
continuously*. M18 needs neither property: the phone works from a snapshot and defers the authoritative write.
The kernel remains the sole authority and runs where it always has — on the desktop. The relay, when present,
moves opaque envelopes and decides nothing. The Principal's own infrastructure is the only infrastructure
involved, and ADR-0009 stands unqualified.

## Consequences

**Accepted: the phone shows a snapshot, not live state.** Between the last push and reconciliation the phone
can be stale — an approval may have expired or been resolved on the desktop. This is why stale capture is a
first-class, re-surfaced outcome rather than an error, and why the cache never claims authority. The Principal
sees "reconciled" state after the fact, exactly as they would returning to a desktop that ran overnight.

**Accepted: reconciliation is deferred, not instantaneous.** With no relay and no shared network, an approval
captured on the phone lands on the chain only when the two devices next meet. The approval is *made* with no
desktop present; it is *recorded* when a kernel is present. The exit criterion is about the former, and the
Firm never loses the intent because the outbox is append-only and durable.

**Accepted: a small new kernel service and a new client.** `services/companion` (Layer-1 kernel machinery,
department-agnostic) and `apps/companion` (an untrusted client). Real, mostly-once cost. The sync seam is
placed per ADR-0011; no department-specific kernel change is introduced.

**Gained: the exit criterion is met without borrowing from M23 or M24.** No headless kernel, no conflict-
resolution merge substrate, no cloud authority. The whole mechanism is a cache plus an idempotent, keyed
append — the smallest thing that can be true.

**Gained: idempotency is structural, not defensive.** Because each outbox entry is keyed to an
`approval_request.id` and a Decision for a request is written at most once, "applied twice" is impossible by
construction. Conflicting approvals, double-drains, and replayed relays all collapse to the same no-op.

**Gained: the hash chain stays the one source of truth.** A phone approval is byte-for-byte the same Decision
a desktop approval is. There is no second log to reconcile in M24's sense; there is a courier and one ledger.

**Reversal cost: low-to-moderate.** The outbox and snapshot are additive projections; a Firm with no paired
device is exactly a pre-M18 Firm. Unwinding means deleting the companion service, the client, and four
additive migrations. Nothing in the kernel's existing decision path changes, so removing M18 does not disturb
M10 or M15. The one durable commitment is the outbox entry schema, which — like every event payload
(ADR-0002) — is versioned and forward-compatible.
