# Companion — Implementation Plan

**Milestone M18 · crate `sidra-companion` + client `apps/companion` · for AntiGravity**

| | |
|---|---|
| Architecture | `COMPANION_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0049 (no-desktop-present sync & idempotent reconciliation) · 0050 (paired, untrusted client) · 0051 (canonical render payload; display-only, no authoring) |
| Crate | `sidra-companion` at `services/companion/` |
| Client | `apps/companion` — the mobile surface, untrusted |
| Depends on | `sidra-security`, `sidra-store`, `sidra-domain`; reads `briefs` (M10), `approval_requests`/`decisions` (M15); the hash chain (M2) |
| Must not depend on | `sidra-orchestrator`, `sidra-mission`, `sidra-departments` (CI-enforced) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR.

### 0.2 Task conventions (inherited from the Mission Engine / M16 plan §0, unchanged)

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
| E1 | Pairing & device trust | ADR-0050: device keypair, pairing act, revocation, the device registry |
| E2 | Sync protocol (Briefs + Approval Requests pull) | ADR-0049: the bounded snapshot, the transport, the optional dumb relay |
| E3 | Identical Brief rendering on mobile | ADR-0051: the canonical render payload, the content hash, the display-only painter |
| E4 | Approval capture & outbox | the signed, append-only outbox on the phone; the option set per effect class |
| E5 | Reconciliation into the event log | ADR-0049: idempotent, append-only apply keyed to `approval_request.id` |
| E6 | The no-desktop-present acceptance harness | the exit criterion, made a test — **the last thing green** |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──┐
     │      ├──► E4 ──► E5 ──► E6
     └► E3 ─┘
       (E3 needs the snapshot shape from E2; E4 needs a paired device from E1 and the snapshot from E2)
```

E1 first (nothing syncs to an unpaired device; the device key signs everything downstream). E2 next (the
snapshot is the vehicle everything else rides in). E3 runs alongside E2 once the snapshot shape exists (the
render payload is a snapshot member). E4 needs a paired device (E1) and a pending-request view (E2). E5
assembles the kernel side of E4's captures. E6 closes the milestone; **E6 is the exit criterion and must be
the last thing green.**

---

## E1 — Pairing & device trust (ADR-0050)

### Purpose
Establish and revoke a per-device trust: a keypair, a logged pairing Decision, a device registry, and a
signature every downstream write is checked against.

### Scope
In: the device keypair (enclave-bound on the phone), the pairing challenge + `complete_pairing` validation
(§5.2), the `companion_devices` registry, suspend/resume/revoke, the signature primitive. Out: the snapshot
(E2), the outbox (E4), reconciliation (E5).

### Dependencies
`sidra-domain`; `sidra-security` (Ed25519, keychain, redaction, the untrusted-client boundary); `sidra-store`
(registry persistence — schema from E1/T1.6).

### Public APIs
`begin_pairing() -> PairingChallenge`; `complete_pairing(challenge, device_pubkey, proof) -> Result<DeviceId>`;
`suspend_device` / `resume_device` / `revoke_device`; `list_devices()`; `device_status(id)`;
`verify_entry_signature(entry) -> Result<()>`.

### Acceptance criteria
Pairing is a logged Principal Decision; the kernel stores a public key only; a revoked device's signatures are
refused structurally; no secret crosses in either direction.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `sidra-companion` crate + `apps/companion` client shell; CI wiring incl. dependency-direction and no-authoring checks | S | — | `services/companion/Cargo.toml`, `src/lib.rs`, `apps/companion/`, `infrastructure/ci/` | Crate + client build; CI fails on any edge `sidra-companion → orchestrator|mission|departments` (AC12) and on any author command (AC5) |
| **T1.2** | Domain value objects: `DeviceId`, `DevicePublicKey`, `PairingChallenge`, `Signature`, `ContentHash`, `SyncCursor` | S | T1.1 | `domain/values.rs` | Types reject invalid construction; `DevicePublicKey` is public-only (no private field); property tests |
| **T1.3** | `CompanionDevice` aggregate + `status` state machine (§3.1/§3.2) | S | T1.2 | `domain/device.rs` | Illegal transitions rejected; `Revoked` terminal; construction records `paired_by = principal` |
| **T1.4** | Device keypair in the phone secure enclave; passphrase-wrap fallback where no enclave exists | M | T1.2, `sidra-security` | `apps/companion/DeviceKey`, `pairing/key.rs` | Private key never leaves the phone; fallback mirrors M3 keychain fallback; unit tests |
| **T1.5** | Pairing: `begin_pairing` (short-TTL challenge) + `complete_pairing` with the six §5.2 checks | M | T1.3, T1.4 | `pairing/mod.rs` | Each §5.2 check has a failing fixture naming the rule; challenge never sent through the relay; expired challenge writes no device row |
| **T1.6** | Device registry: pair/list/status/suspend/resume/revoke; persist to `companion_devices`; emit chain events | M | T1.5, E-persist/T-DEV | `registry/mod.rs`, `migrations/0033_companion_devices.sql` | Public key only in DB; `DevicePaired`/`DeviceRevoked` on the chain; revoke is one-way |
| **T1.7** | `verify_entry_signature`: check a signed payload against a device pubkey and active status | S | T1.6 | `pairing/verify.rs` | Wrong/absent signature refused; revoked/suspended device refused (AC8, AC9) |

---

## E2 — Sync protocol (Briefs + Approval Requests pull) (ADR-0049)

### Purpose
Build the bounded, secret-free snapshot and move it to the phone — over LAN or an optional dumb relay — and
carry the outbox back.

### Scope
In: `build_snapshot` (the day's Briefs + pending Approval Requests), the `SyncEnvelope` framing, LAN transport,
the optional relay client, `companion_sync_state` bookkeeping. Out: the render payload internals (E3), capture
(E4), reconciliation (E5).

### Dependencies
E1 (a paired device to scope a snapshot to); `sidra-store` (read `briefs`, `approval_requests`).

### Public APIs
`build_snapshot(device_id) -> SyncSnapshot`; `pending_snapshot_size(device_id)`; `push_snapshot(device_id)`;
`receive_outbox(device_id, envelope)`.

### Acceptance criteria
A snapshot is bounded and contains no secret; the relay carries only opaque envelopes; sync completes with no
relay over LAN.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | `ApprovalRequestView` builder: mirror a *pending* `approval_requests` row into the §6 plain-language fields + `effect_class` + `expires_at` — **no capability material** | M | E1, `sidra-store` | `snapshot/approvals.rs` | Only pending requests included; no `KeychainRef`/capability/Vault path present (AC6) |
| **T2.2** | `build_snapshot`: assemble the day's Briefs (payloads from E3) + pending approvals into a bounded, cursored `SyncSnapshot` | M | T2.1, E3/T3.2 | `snapshot/build.rs` | Snapshot is bounded (day's Briefs + pending only); `pending_snapshot_size` matches; no history/artifact/Vault sync |
| **T2.3** | `SyncEnvelope` framing (opaque payload; `pairing_scope` + `direction` only) | S | E1 | `transport/envelope.rs` | Envelope exposes only routing fields; payload opaque; serde round-trip |
| **T2.4** | LAN transport: discover the paired peer, push snapshot, receive outbox — no relay required | M | T2.3 | `transport/lan.rs` | Full cycle completes with no relay (AC10) |
| **T2.5** | Optional relay client: store-and-forward of opaque envelopes on the Principal's own endpoint; holds no key, reads no content | M | T2.3 | `transport/relay.rs` | Relay-stub test asserts it forwards only; cannot read a Brief or apply an approval (AC10, T-C4) |
| **T2.6** | `companion_sync_state` bookkeeping: cursor, last snapshot, last reconcile | S | T2.2, E-persist/T-SYNC | `snapshot/state.rs`, `migrations/0034_companion_sync_state.sql` | Cursor advances monotonically; forward-only migration |

---

## E3 — Identical Brief rendering on mobile (ADR-0051)

### Purpose
Render each Brief once, in the kernel, into a canonical hashed payload; paint it verbatim on the phone; prove
identity by hash.

### Scope
In: the `BriefRenderPayload` node tree, the `content_hash`, `brief_render_cache`, and the display-only painter
with no parser and no sanitizer. Out: transport (E2), any authoring surface (forbidden).

### Dependencies
`sidra-store` (read `briefs`); the M10 sanitizing pipeline (reused, not re-implemented).

### Public APIs
`render_brief(brief_id) -> BriefRenderPayload`; `content_hash(payload) -> ContentHash`; the client
`BriefPainter`.

### Acceptance criteria
Desktop and phone render paths yield equal `content_hash`; the phone runs no markdown parser/sanitizer; the
payload carries no secret and no dereferenceable URL.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | `BriefRenderPayload` node tree: six sections in fixed order, allowlisted nodes (M10 allowlist), structured `the_ask`/`confidence`; versioned schema | M | — | `render/payload.rs` | Nodes limited to the M10 allowlist; no raw HTML/script/remote-image node; trace-link is a trace id, not a URL (AC6) |
| **T3.2** | `render_brief`: run the M10 sanitizing pipeline over the `briefs` fields into a payload; `content_hash = SHA-256(canonical_json)` | M | T3.1, M10 pipeline | `render/build.rs` | Same pipeline as desktop; deterministic canonical hash; property test over the Brief corpus |
| **T3.3** | `brief_render_cache`: persist `(brief_id, payload_version, payload, content_hash)`; re-push does not re-render | S | T3.2, E-persist/T-CACHE | `render/cache.rs`, `migrations/0036_brief_render_cache.sql` | Cache hit skips re-render; no secret in the cached payload; forward-only migration |
| **T3.4** | Client `BriefPainter`: walk the node tree with native primitives — **no markdown parser, no sanitizer** | M | T3.1 | `apps/companion/BriefPainter` | Painter has no parser/sanitizer; renders every allowlist node; unknown-node handling is a known-compatible subset (F9) |
| **T3.5** | Render-identity test: desktop payload hash == phone-path payload hash over a corpus incl. adversarial markdown | M | T3.2, T3.4 | `infrastructure/testing/companion/render_identity.rs` | `content_hash` equal for all four `kind`s and adversarial inputs (AC2) |

---

## E4 — Approval capture & outbox

### Purpose
Let the phone capture the Principal's verdict on a mirrored request as a signed, append-only outbox entry —
offline, with the desktop absent.

### Scope
In: the `ApprovalOutboxEntry`, the per-effect-class option set (§10), signing with the device key, the
append-only phone outbox, `submit_outbox` into `approval_outbox`. Out: applying anything (E5).

### Dependencies
E1 (device key + signing), E2 (the mirrored pending requests).

### Public APIs
`capture_approval(approval_request_id, verdict, grant_scope) -> ApprovalOutboxEntry` (client-side, signs);
`submit_outbox(device_id, entries)` (kernel-side, enqueues — does not apply).

### Acceptance criteria
Capture works with no network; every entry is signed and keyed to `approval_request.id`; the phone offers only
the options the effect class permits; nothing captured is authoritative.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | `ApprovalOutboxEntry` type + option set per effect class (§10): class 3 never offers `Always` | S | E1 | `domain/outbox.rs` | Class-3 option set excludes `Always`; option set derives from the mirrored `effect_class`, not a phone judgement |
| **T4.2** | Client `ApprovalCapture`: build + sign an entry with the enclave device key; append to the local append-only outbox — works offline | M | T4.1, E1/T1.4 | `apps/companion/ApprovalCapture`, `Outbox` | Capture needs no network; outbox is append-only; entry signed; keyed to `approval_request_id` (AC1) |
| **T4.3** | `submit_outbox`: accept signed entry batches into `approval_outbox` with `reconcile_state = pending`; **does not apply** | M | T4.2, E-persist/T-OUT | `outbox/receive.rs`, `migrations/0035_approval_outbox.sql` | Entries stored as intent, not Decisions; no chain append here; forward-only migration |
| **T4.4** | `ApprovalCaptured` event (a device recorded intent — *not yet a Decision*) on the chain | S | T4.3 | `outbox/events.rs` | Event distinguishes capture (intent) from resolution (Decision); serde round-trip |

---

## E5 — Reconciliation into the event log (ADR-0049)

### Purpose
Turn signed outbox intent into logged Decisions on the hash chain — idempotently, keyed to
`approval_request.id`, as a pure append.

### Scope
In: `reconcile_outbox`, the four-step §9 path (verify → dedupe → staleness → append), the Decision write that
matches a desktop approval, the reject/duplicate outcomes and re-surfacing. Out: nothing new — this epic
applies E1/E2/E4.

### Dependencies
E1 (signature verification), E4 (the outbox), `sidra-store` (`approval_requests`, `decisions`, the chain
writer).

### Public APIs
`reconcile_outbox() -> ReconcileReport`.

### Acceptance criteria
Each applied entry is one hash-chain Decision; a duplicate is a no-op; a stale entry is re-surfaced; a
forged/revoked entry is refused; the chain is never rewritten.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | Step 1 — trust check: `verify_entry_signature` + active-device check → `REJECTED_UNTRUSTED` | S | E1/T1.7, E4 | `reconcile/verify.rs` | Forged/absent signature and revoked/suspended device refused; logged `ApprovalCaptureRejected{untrusted}` (AC8, AC9) |
| **T5.2** | Step 2 — dedupe: existing Decision for `approval_request_id` → `DUPLICATE_IGNORED` (no-op) | S | T5.1 | `reconcile/dedupe.rs` | Second entry for a resolved request appends nothing; one Decision per id (AC4, T-C3) |
| **T5.3** | Step 3 — staleness: request not `pending` → `REJECTED_STALE`, re-surfaced | M | T5.1, `sidra-store` | `reconcile/staleness.rs` | Expired/superseded/resolved request refused and re-surfaced; kernel copy wins (AC7, T-C5) |
| **T5.4** | Step 4 — apply: append the `decisions` row (`authority = principal`, capture `device_id`) + `ApprovalResolved` + `approval_requests.status` update, as a pure append | M | T5.2, T5.3, ADR-0002 | `reconcile/apply.rs` | Same Decision a desktop approval writes; `audit.verify` passes; chain not rewritten (AC3) |
| **T5.5** | `reconcile_outbox` driver: fixed-order pipeline; runs on kernel start, on a timer, and on demand | M | T5.1–T5.4 | `reconcile/mod.rs` | Order fixed and unskippable; each entry ends in exactly one terminal state; report returned |

---

## E6 — The no-desktop-present acceptance harness

### Purpose
The exit criterion, made a test. **The last thing to go green.**

### Scope
In: the exit-criterion harness (desktop offline at capture; phone clears the day; reconciliation appends
Decisions; Brief renders identically), plus the AC coverage suite. Out: any authoring path (forbidden), any
connector (M17), any headless kernel (M23).

### Dependencies
All prior epics.

### Acceptance criteria
AC1–AC12 each covered by a named test; the no-desktop-present proof (AC1+AC3) captures a day's approvals with
the kernel stopped and reconciles them all to hash-chain Decisions; the Brief render-identity proof (AC2)
asserts equal content hashes.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | Render-identity + no-secret proofs | M | E3, E2 | `.../render_identity.rs`, `.../no_secret_scan.rs` | AC2 — equal content hashes; AC6 — zero secret patterns in snapshot/payload |
| **T6.2** | Idempotency + staleness property tests | M | E5 | `.../idempotency.rs`, `.../staleness.rs` | AC4 — one Decision per request id under replay/cross-approval; AC7 — stale re-surfaced |
| **T6.3** | Security proofs: revoke-then-deliver, forged signature, relay-stub | M | E1, E5, E2 | `.../revoke.rs`, `.../forgery.rs`, `.../relay_stub.rs` | AC8, AC9, AC10 — refusals structural; relay forwards only |
| **T6.4** | Null-pairing + migration-independence proofs | S | E-persist | `.../null_pairing.rs`, `.../migrations.rs` | AC11 — no paired device = pre-M18 behaviour; migrations forward-only and independent |
| **T6.5** | CI static checks: no authoring, no secret, dependency direction | S | E1 | `infrastructure/ci/` | AC5, AC6, AC12 — build fails on a hit |
| **T6.6** | **The no-desktop-present exit proof (the exit criterion):** build a snapshot, **stop the kernel**, capture a day's approvals on the client, restart the kernel, reconcile, assert every approval is a hash-chain Decision and the Brief rendered identically | L | E1–E5, T6.1–T6.3 | `infrastructure/testing/companion/no_desktop_present.rs` | AC1 + AC2 + AC3 — the Principal cleared the day with the kernel stopped at capture; every capture reconciled to a Decision; **the last thing to go green** |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | pairing + device trust (ADR-0050) |
| E2 | the bounded, secret-free sync snapshot + transport + optional dumb relay (ADR-0049) |
| E3 | the canonical render payload + display-only painter (ADR-0051) |
| E4 | signed, append-only approval capture + outbox |
| E5 | idempotent reconciliation onto the hash chain (ADR-0049) |
| E6 | the no-desktop-present exit proof + AC coverage (the exit criterion) |

**Migrations:** `0033_companion_devices` · `0034_companion_sync_state` · `0035_approval_outbox` ·
`0036_brief_render_cache` — forward-only, additive; null pairing = pre-M18 behaviour.
