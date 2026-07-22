# Companion — Architecture

**Milestone M18 · Release 2.5 "Field" · Layer 1 (kernel machinery) + a new untrusted client**

| | |
|---|---|
| Milestone | M18 — Companion (`/MILESTONE_REGISTRY.md` §4, 2.5 "Field") |
| Release | 2.5 "Field" — the Firm reaches outside the building |
| Layer | 1 — Core Platform machinery (`/docs-v2/02-layer-model.md` §1); the client is a surface, not a layer |
| New crate | `sidra-companion` at `services/companion/` |
| New client | `apps/companion` — a mobile surface, untrusted, like the desktop renderer |
| Depends on | M10 (Brief format & the sanitizing render pipeline), M15 (Approval Requests), M3 (security kernel, keychain, redaction), M2 (event log & hash chain) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | A Principal clears a day's approvals from a phone **with no desktop present**, and the Brief renders **identically** — proven by test, not by configuration |

> **Authoritative precedence.** Where this document disagrees with `/docs/07-security-model.md`, the security
> model governs the trust boundaries, the effect classes, and the approval UX contract. Where it disagrees
> with `/docs/01-technical-architecture.md` §4 about the untrusted-client boundary, that document governs.
> Where it disagrees with `/MILESTONE_REGISTRY.md` about what M18 means or what it depends on, the registry
> governs. Where it disagrees with ADR-0002 about the event log being the single source of truth, ADR-0002
> governs. This architecture *extends* those boundaries; it never re-decides them.

---

## 1. Why this subsystem exists

### 1.1 The problem

Through M17 the Firm plans, works, reaches outside the building, and produces one Brief and — at most — one
Approval Request per Mission (`/docs-v2/03-Intelligence/MISSION_ENGINE_ARCHITECTURE.md` §25.4). Both the Brief
and the Approval Request are, today, things the Principal can see and act on **only at the desktop**. The
desktop is where the kernel runs, where the Vault is decrypted, and where the renderer paints the Brief.

But the Principal is not always at the desktop, and the two things they most need when away are exactly the
two smallest, most bounded things the Firm produces: *the day's Briefs* (what happened, one page each) and
*the pending Approval Requests* (a decision is waiting on you). A Mission concludes with one approval
(`/MILESTONE_REGISTRY.md` §4, M15 exit criterion); a day may accumulate a handful across Missions. Clearing
them should not require walking to a machine.

M18 is the machinery that lets a phone read Briefs and clear approvals — and nothing else. It is not "the app
on your phone." It is the narrowest possible second surface: a courier for the Principal's attention, carrying
Briefs out and signed approvals back, to a kernel that remains the only authority.

### 1.2 The stance

Three commitments define the Companion, and each has an ADR:

1. **"No desktop present" is a local-first cache, not a live kernel.** (ADR-0049) The desktop pushes a bounded
   snapshot — the day's Briefs and pending Approval Requests — to the phone while it is online. The Principal
   acts against that cache with the desktop absent. Approvals land in an append-only outbox and are
   **reconciled idempotently** into the event log when the kernel next runs. This needs neither the headless
   hosted kernel of **M23** nor any cloud service. It is the load-bearing decision of the milestone.
2. **The phone is a paired, untrusted client.** (ADR-0050) It joins the untrusted-renderer class
   (`/docs/01-technical-architecture.md` §4): no secret, no Vault, no ambient network to a model provider.
   Pairing is a logged Principal Decision that binds a device keypair; every phone-originated write is signed;
   a lost phone is revoked with one Decision, structurally, without rewriting history.
3. **The Brief travels as a canonical render payload; the phone displays, never re-renders or authors.**
   (ADR-0051) The kernel renders the Brief once, into an allowlisted node tree with a content hash; the phone
   paints it verbatim. "Identically" becomes a hash equality. The phone has no composition engine, so *no
   authoring* is a fact about what code exists, not a disabled button.

### 1.3 What the Companion is, mechanically

The **companion service** is kernel machinery (Layer 1). The **companion client** is a surface — a mobile app
that is to the phone what the WebView renderer is to the desktop: a view over records it does not own. This
parallel is deliberate and load-bearing: M18 introduces no new trust class. It reuses the untrusted-client
boundary (`/docs/01-technical-architecture.md` §4), the hash-chained event log (ADR-0002), the keychain and
redaction of the security kernel (M3), and the Brief format and sanitizing pipeline shipped in M10.

```
Layer 1  sidra-companion   ← the service: pairing, snapshot, reconciliation, render payload   (M18, THIS DOC)
Surface  apps/companion    ← the client: pair, display a Brief payload, capture an approval    (M18, THIS DOC)
```

The kernel remains the single source of truth (`/docs/01-technical-architecture.md` §1). The phone is a
courier; the desktop kernel is the authority; the hash chain is the ledger.

### 1.4 What the Companion must never become

- **An authoring surface.** No Directive creation, no Mission drafting, no free-text composition of any record.
  Authoring by voice is M19, and even there not on this client. The phone paints a render payload the kernel
  produced (ADR-0051); it holds no composition engine to author from. A "reply" to a Brief is not offered.
- **A second source of truth.** The phone's snapshot is a cache and its outbox is signed *intent*, not a
  ledger. Authority never leaves the kernel; a phone approval becomes real only when the kernel appends the
  Decision to the one hash chain (ADR-0002, ADR-0049). There is no phone-side event log to merge — that would
  be M24, and M18 needs none of it.
- **A telemetry channel.** Sync is between the Principal's own devices over their own infrastructure
  (ADR-0009, ADR-0049). No behavioural data, no usage counts, nothing reaches Anthropic or any Sidra server.
  The optional relay is dumb store-and-forward for opaque envelopes and can be absent entirely.
- **A place a secret lives.** No provider key, no Vault key, no `KeychainRef`, no Vault content ever crosses to
  the phone. The phone holds display content and pending requests, plus a device keypair that authenticates
  *the device to the kernel* and can decrypt nothing (ADR-0050).
- **A bypass of the approval semantics.** A phone approval obeys the same approval UX contract
  (`/docs/07-security-model.md` §6) and produces the same logged Decision as a desktop approval. The phone
  adds a capture surface; it never adds a new way to grant.

### 1.5 Relationship to existing concepts

| Existing concept | How M18 relates |
|---|---|
| Untrusted renderer (`/docs/01-technical-architecture.md` §4) | The phone joins this exact class, extended to a networked device by a device keypair and pairing (ADR-0050). "Assume compromised" covers the phone by the same reasoning it covers the WebView. No API returns a secret to it. |
| Brief format (M10; `briefs` table) | Unchanged. M18 renders the existing six fields (`situation`, `actions`, `findings`, `recommendation`, `the_ask`, `confidence`) once into a canonical payload (ADR-0051). It reads Briefs; it never writes one. |
| Approval Request (M15; `approval_requests` table) | Unchanged in meaning. M18 mirrors a *pending* request to the phone and captures a response, which reconciles into the same Decision the desktop would record. The five-condition interrupt budget (`/docs/06-notification-system.md` §2) is honored — the phone surfaces what already qualifies. |
| Decision (`decisions` table; `/docs/07-security-model.md` §6) | A phone approval **is** a Decision, `authority = 'principal'`, appended to the hash chain (ADR-0002). M18 adds the capture device to its provenance; it adds no new decision authority. |
| Event log & hash chain (M2, ADR-0002) | Every pairing, capture, and reconciliation is an event. The reconciled approval is a pure append keyed to `approval_request.id`. Nothing is rewritten. |
| Keychain & redaction (M3) | The device keypair's private half lives in the phone's secure enclave; the kernel stores only the device public key. Redaction covers every new write path (`/docs/07-security-model.md` §9). |
| Notification system (`/docs/06-notification-system.md`) | The Companion is a delivery *surface* for approvals that already qualify to interrupt; it does not invent urgency. Batching (§3) still applies: the phone shows the day's approvals as one cleared-together set, not one modal per item. |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | The Companion reads Briefs and acts on Approval Requests, and can do **nothing else** | §1.4; ADR-0051 (no composition engine); §12 API surface has no author command |
| G2 | The Brief renders **identically** — byte-for-byte in content | ADR-0051; canonical render payload + `content_hash` equality (§8, §17 AC2) |
| G3 | An approval made on the phone is a **logged Decision on the hash chain**, applied exactly once | ADR-0049; idempotent reconciliation keyed to `approval_request.id` (§9); ADR-0002 |
| G4 | No secret, key, or Vault content ever reaches the phone | ADR-0050; §7 threat table; §12.3 API rule "no API returns a secret" (inherited from M16 §12.3) |
| G5 | The Principal clears approvals **with no desktop present**, without M23 and without a cloud service | ADR-0049; snapshot + outbox + deferred reconciliation; the optional dumb relay (§6, §13) |
| G6 | A lost phone is revocable; its later outbox is refused | ADR-0050; `revoke_device`; signature refusal at reconciliation (§9, §14 F6) |
| G7 | Telemetry stays off; sync is device-to-device on the Principal's own infrastructure | ADR-0009; ADR-0049; the relay carries opaque envelopes and decides nothing (§6) |
| G8 | Everything is additive; a Firm with no paired device behaves exactly as pre-M18 | §11 forward-only migrations; null pairing = no companion, exactly pre-M18 behaviour |
| G9 | No department-specific kernel change; the sync seam respects ADR-0011 | §6 dependency direction; `sidra-companion` knows nothing of departments (Layer-1 rule) |
| G10 | Sync is **bounded** and the Brief is fast on mobile | §15; a snapshot is the day's Briefs + pending approvals, a small, capped set |

---

## 3. State machines

### 3.1 Device pairing lifecycle

```
                       begin_pairing (desktop mints a short-lived challenge)
   ───────────────────────────────────────────────────────────────►  UNPAIRED
                                                                         │  phone answers challenge
                                                                         ▼
                                                                     PAIRING
                                                        (challenge valid, device keypair proven)
                                                                         │  complete_pairing
                                                                         ▼
                                                                      PAIRED  ◄──────────┐
                                                                         │               │ (device offline;
                                                    suspend (optional,    │               │  trust intact)
                                                    Principal or policy)  ▼               │
                                                                     SUSPENDED ───────────┘
                                                                         │  resume
                                                    revoke_device        │
                                                    (lost/stolen,         ▼
                                                     a Decision)      REVOKED   (terminal for this device_id)
```

### 3.2 Pairing transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | `begin_pairing` | Pairing | desktop online; challenge minted, short TTL, shown out-of-band (code/QR) |
| Pairing | `complete_pairing` | Paired | challenge unexpired and matched; device pubkey recorded; `DevicePaired` on chain |
| Pairing | `challenge_expired` | Unpaired | TTL elapsed; no device row written |
| Paired | `suspend` | Suspended | Principal or policy; snapshots stop; existing pairing retained |
| Suspended | `resume` | Paired | Principal Decision |
| Paired \| Suspended | `revoke_device` | Revoked | a Principal Decision; `DeviceRevoked` on chain; future signatures refused |

### 3.3 An Approval Request's states across desktop ↔ phone

The Approval Request lifecycle is owned by M15 on the desktop; M18 adds a **mirrored** shadow of a *pending*
request on the phone and a capture that reconciles back. The kernel's copy is always authoritative.

```
        (kernel, M15)                         (phone, M18 cache)                 (kernel, M18 reconcile)

   PENDING ──── included in snapshot ───►  MIRRORED_PENDING
     │                                          │  Principal approves / denies
     │  (desktop resolves it first)             ▼
     │                                     CAPTURED_IN_OUTBOX  ── delivered ──►  RECONCILING
     │                                          (append-only, signed)               │
     ▼                                                                              ├─ request still pending
   RESOLVED (desktop) ─────────────────────────────────────────────────────────────┤     └► APPLIED  (Decision appended;
     │                                                                              │             approval_requests.status set)
     │  a later phone entry for the same id arrives                                 ├─ Decision already exists
     └──────────────────────────────────────────────────────────────────────────► │     └► DUPLICATE_IGNORED (no-op)
                                                                                    └─ request expired/superseded
                                                                                          └► REJECTED_STALE (re-surfaced)
```

### 3.4 Approval reconciliation state machine

```
   OUTBOX_PENDING
        │  reconcile_outbox (kernel running; entry delivered)
        ▼
   VERIFYING ── signature invalid / device revoked ──►  REJECTED_UNTRUSTED  (discarded, logged)
        │  signature valid, device active
        ▼
   RESOLVING ── Decision already exists for approval_request_id ──►  DUPLICATE_IGNORED  (pure no-op)
        │  no prior Decision
        ├─ request no longer PENDING (expired / superseded / resolved) ──►  REJECTED_STALE  (re-surfaced)
        │  request still PENDING
        ▼
   APPLIED   (append Decision + ApprovalResolved to hash chain; set approval_requests.status)
```

### 3.5 Invariants

1. **The phone writes only to its own outbox.** It never writes the Vault, the `decisions` table, the
   `approval_requests` table, or the event log. Those are kernel-only, and reconciliation is the sole path.
2. **A Decision for an `approval_request.id` is written at most once.** Reconciliation checks for an existing
   Decision before appending; a second entry for the same id is `DUPLICATE_IGNORED`. Idempotency is
   structural (ADR-0049), not a retry guard.
3. **Authority never leaves the kernel.** No phone state is authoritative. `CAPTURED_IN_OUTBOX` is signed
   intent; only `APPLIED` — a kernel append — is a fact (ADR-0002, ADR-0049).
4. **A revoked device is terminal.** `Revoked` is one-way for that `device_id`; its later outbox entries are
   `REJECTED_UNTRUSTED` regardless of what the phone does (ADR-0050).
5. **The kernel's copy of a request wins.** The phone's `MIRRORED_PENDING` is a cache; if the kernel resolved
   or expired the request, the phone's capture is `REJECTED_STALE` and re-surfaced, never silently applied.

---

## 4. Domain model

### 4.1 Core types

```
DeviceId(String)                 // stable id for a paired phone, e.g. "dev.7f3a…"
DevicePublicKey(Bytes)           // Ed25519 public half; the private half never leaves the phone enclave
PairingChallenge(String)         // short-lived, out-of-band, never sent through the relay
ApprovalRequestId(String)        // from M15's approval_requests.id — the reconciliation key
Verdict(enum)                    // Approve | Deny
GrantScope(enum)                 // Once | Session   (Always is class ≤2 only; §10 — phone never offers it for class 3)
SyncCursor(u64)                  // monotonic snapshot position; the phone advances it as it pulls
ContentHash(String)             // SHA-256 over a canonical render payload (ADR-0051)
Signature(Bytes)                 // device-key signature over an outbox entry (ADR-0050)
```

### 4.2 `CompanionDevice` — the trust record

```
CompanionDevice {
    device_id:    DeviceId,
    device_pubkey: DevicePublicKey,   // public only; kernel never holds the private key
    label:        String,             // "Principal's phone" — human-readable
    paired_at:    Timestamp,
    paired_by:    Actor,              // 'principal' — a Decision (ADR-0050)
    status:       enum { Active, Suspended, Revoked },
    revoked_at:   Option<Timestamp>,
}
```

### 4.3 `SyncSnapshot` — the outbound cache (holds no secret)

```
SyncSnapshot {
    cursor:        SyncCursor,
    generated_at:  Timestamp,
    briefs:        [BriefRenderPayload],      // the day's Briefs, canonical, hashed (ADR-0051)
    pending:       [ApprovalRequestView],     // pending Approval Requests, plain-language fields only
}

BriefRenderPayload {                          // ADR-0051 — an allowlisted node tree, already sanitized
    brief_id:      String,
    kind:          enum { engagement, morning, digest, incident },  // mirrors briefs.kind
    sections:      { situation, actions, findings, recommendation, the_ask, confidence },  // fixed order
    content_hash:  ContentHash,               // the identity check for "renders identically"
}

ApprovalRequestView {                         // the §6 approval UX fields — NO capability material
    approval_request_id: ApprovalRequestId,
    who: String, what: String, why: String,   // plain language (/docs/07-security-model.md §6)
    cost_or_change: String, if_you_say_no: String,
    effect_class: 1 | 2 | 3,                   // drives which options are offered (§10)
    expires_at: Option<Timestamp>,             // the phone shows staleness; the kernel enforces it
}
```

### 4.4 `ApprovalOutboxEntry` — the courier's cargo (the only phone-written record)

```
ApprovalOutboxEntry {
    approval_request_id: ApprovalRequestId,    // THE reconciliation key — applying twice is a no-op (ADR-0049)
    verdict:             Verdict,              // Approve | Deny
    grant_scope:         Option<GrantScope>,   // Once | Session; never Always for a class-3 request (§10)
    decided_at:          Timestamp,
    device_id:           DeviceId,             // which paired device captured it (provenance, ADR-0050)
    signature:           Signature,            // device-key signature over the entry (ADR-0050)
}
```

An outbox entry is *signed intent*, never a Decision. It becomes a Decision only when reconciliation appends
one to the hash chain. The entry is append-only on the phone and idempotent at the kernel.

### 4.5 `SyncEnvelope` — what crosses the wire

```
SyncEnvelope {
    pairing_scope: DeviceId,        // which pairing this belongs to; the relay routes on this and nothing else
    direction:     enum { SnapshotToPhone, OutboxToKernel },
    payload:       Bytes,           // opaque to the relay; a SyncSnapshot or a batch of ApprovalOutboxEntry
}
```

The relay (if any) sees only `pairing_scope` and `direction`. It cannot read a Brief, cannot read an
approval, holds no key, and decides nothing (ADR-0049).

### 4.6 Relationships

```
CompanionDevice 1 ──── * ApprovalOutboxEntry     (a device signs the approvals it captured)
SyncSnapshot    1 ──── * BriefRenderPayload       (the day's Briefs)
SyncSnapshot    1 ──── * ApprovalRequestView       (the pending requests, mirrored)
ApprovalOutboxEntry 1 ── 1 ApprovalRequestId       (the reconciliation key; a Decision is written once)
BriefRenderPayload  1 ── 1 briefs.id (M10)          (rendered, not owned — read-only)
ApprovalRequestView 1 ── 1 approval_requests.id (M15) (mirrored, not owned — read-only)
Reconciled approval ── 1 decisions row (append)     (authority = 'principal'; ADR-0002)
```

---

## 5. The pairing act and its validation

### 5.1 Shape

Pairing is a two-device, Principal-confirmed act, out-of-band by design so the relay never sees the secret
that establishes trust.

```
Desktop:  begin_pairing()  ──►  PairingChallenge (code + QR, short TTL, shown on screen)
Phone:    scans/enters the challenge; generates a device keypair in the secure enclave
Phone:    complete_pairing(challenge, device_pubkey, proof)  ──►  kernel
Kernel:   validate challenge (unexpired, matched); record CompanionDevice{status: Active}
Kernel:   emit DevicePaired on the hash chain; Principal confirms in plain language
```

### 5.2 Pairing validation checks (hard refusal, no override)

Mirrors the connector framework's "everything the kernel trusts is validated at the boundary" discipline
(M16 §5.4). Each failure names its rule.

1. The challenge is unexpired and matches the one minted by `begin_pairing`.
2. The pairing is confirmed as an explicit **Principal Decision** (`/docs-v2/05-marketplace-and-packs.md`
   trust rule); pairing is never silent.
3. The device presents a **public** key only; the kernel stores no private key and asks for none (ADR-0050).
4. The challenge is not, and was never, transmitted through the relay — it is out-of-band (code/QR).
5. No secret, key, `KeychainRef`, or Vault content is part of the pairing exchange in either direction.
6. A `device_id` already `Revoked` cannot be re-paired under the same id; a fresh pairing mints a fresh id
   (terminal-revocation invariant §3.5.4).

### 5.3 What pairing grants — and what it does not

Pairing grants exactly one thing: the ability for a specific device to (a) receive snapshots scoped to its
pairing and (b) submit signed outbox entries the kernel will *consider* at reconciliation. It grants **no**
capability, **no** Vault access, and **no** authority to decide anything — the reconciled Decision is the
Principal's, captured on a device the Principal paired, applied by the kernel. This mirrors the marketplace
rule that installing an artifact grants nothing (`/docs-v2/02-layer-model.md` §8): pairing a device grants
nothing but a courier route.

---

## 6. Component structure

```
   ┌──────────────────────────────┐        opaque SyncEnvelope         ┌───────────────────────────────┐
   │  DESKTOP (the authority)     │  (LAN direct, or via dumb relay)   │  PHONE (apps/companion)       │
   │                              │◄──────────────────────────────────►│  untrusted client, no secrets │
   │  ┌────────────────────────┐  │                                    │  ┌─────────────────────────┐  │
   │  │ sidra-companion (kernel)│ │        SnapshotToPhone  ─────────►  │  │ SnapshotStore (cache)   │  │
   │  │                        │  │        OutboxToKernel   ◄─────────  │  │ Outbox (append-only)    │  │
   │  │  Pairing               │  │                                    │  │ BriefPainter (ADR-0051) │  │
   │  │  SnapshotBuilder ──────┼──┼── reads Briefs (M10), pending      │  │ ApprovalCapture (signs) │  │
   │  │  RenderPayload  ───────┼──┼── approvals (M15); renders once    │  │ DeviceKey (enclave)     │  │
   │  │  Reconciler   ─────────┼──┼── appends Decisions (ADR-0002)     │  └─────────────────────────┘  │
   │  │  DeviceRegistry        │  │                                    │   (no Vault, no provider net) │
   │  └───────────┬────────────┘  │                                    └───────────────────────────────┘
   │              │  reads/writes                                          
   │   ┌──────────▼───────────────────────────────────────────────┐
   │   │ sidra-store · sidra-security (keychain, redaction) ·      │
   │   │ event log / hash chain (M2) · briefs (M10) ·             │
   │   │ approval_requests, decisions (M15)                        │
   │   └───────────────────────────────────────────────────────────┘
   └──────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────────┐
   │  OPTIONAL RELAY (Principal's own infrastructure)                 │
   │  store-and-forward of opaque SyncEnvelope, routed on pairing_scope│
   │  holds no key · reads no content · applies no approval · optional │
   └──────────────────────────────────────────────────────────────────┘
```

Internal modules of `sidra-companion`:

| Module | Responsibility |
|---|---|
| `pairing` | mint challenge, validate `complete_pairing`, write `CompanionDevice`, the six §5.2 checks |
| `registry` | installed devices + status; the source of truth for "which devices are paired and active" |
| `snapshot` | build a bounded `SyncSnapshot`: the day's Briefs (read-only) + pending Approval Requests (read-only) |
| `render` | render each Brief once into a canonical `BriefRenderPayload` + `content_hash` (ADR-0051), reusing the M10 sanitizing pipeline |
| `outbox` | receive signed `ApprovalOutboxEntry` batches from a paired device; hold pending reconciliation |
| `reconcile` | the §9 idempotent path: verify → dedupe → staleness → append Decision on the hash chain |
| `transport` | frame/deframe `SyncEnvelope`; LAN discovery and the optional relay client; carries opaque bytes only |

Modules of `apps/companion` (the untrusted client): `SnapshotStore` (the cache), `Outbox` (append-only),
`BriefPainter` (walks a node tree; no parser, no sanitizer — ADR-0051), `ApprovalCapture` (signs an entry with
the enclave key), `DeviceKey` (secure-enclave keypair). It holds **no Vault, no provider network, no secret**.

**Dependency direction (ADR-0011).** `packages/domain ← services/companion ← apps/companion`.
`services/companion` depends on `services/security` (keychain, redaction, the hash chain writer),
`services/store`, and reads the `briefs`, `approval_requests`, and `decisions` projections. It does **not**
depend on `services/orchestrator`, `services/mission`, or `services/departments` — the Companion is
department-agnostic Layer-1 machinery (`/docs-v2/02-layer-model.md` §1), and the absence of those edges is a
compile-time property enforced in CI, exactly as M16 §6 does it. The sync seam is a new kernel service, **not**
a change to any department or to the orchestrator.

---

## 7. Security

The Companion adds a networked device and a deferred write path to a system whose entire threat model assumes
the client is compromised (`/docs/07-security-model.md` §2). Every mitigation below is an application of an
existing control or a direct consequence of the three ADRs — not a new trust mechanism.

| Threat | How M18 addresses it |
|---|---|
| **T-C1 Lost or stolen phone** | The phone holds no Vault, no key, no `KeychainRef` — only display content, the day's pending requests, and a device key that can decrypt nothing (ADR-0050). `revoke_device` refuses every later outbox entry from that `device_id`, structurally, without history rewrite. Exposure is bounded to the cached day's approvals on an unlocked device — the same exposure a stolen unlocked laptop has to the desktop renderer. |
| **T-C2 Forged approval envelope** | Every `ApprovalOutboxEntry` is signed by the device key (Ed25519, the §8-crypto primitive the plugin/connector chain already uses). Reconciliation refuses an unsigned or wrongly-signed entry (`REJECTED_UNTRUSTED`); it can never become a Decision. |
| **T-C3 Replayed approval** | The entry is keyed to `approval_request.id`; a Decision for a request is written at most once (invariant §3.5.2). A replayed entry — from the relay, a duplicate drain, or a captured envelope — is `DUPLICATE_IGNORED`, a pure no-op (ADR-0049). |
| **T-C4 Malicious or compromised relay** | The relay sees only `pairing_scope` and `direction`; payloads are opaque. It holds no key, reads no Brief, applies no approval, and can be absent (ADR-0049). A relay that drops, duplicates, or reorders envelopes cannot forge intent (T-C2) and cannot cause double-apply (T-C3); the worst it does is delay reconciliation, which the append-only outbox tolerates without data loss. |
| **T-C5 Stale approval applied against kernel state** | The kernel's copy of a request is authoritative (invariant §3.5.5). If the request expired, was superseded, or was already resolved, the phone's capture is `REJECTED_STALE` and re-surfaced — never silently applied (ADR-0049). |
| **T3 Key theft** (M3) | No secret crosses to the phone. The device private key is enclave-bound and is not a Vault or provider key. Redaction covers every new write path (`/docs/07-security-model.md` §9). |
| **T10 Renderer XSS via model output** (M3) | The phone runs no markdown parser and no sanitizer; it paints an allowlisted node tree the kernel already sanitized (ADR-0051). The injection boundary is not duplicated on a second platform. |
| **Authoring by the phone** | Structurally impossible: the client has a node-tree *painter*, not a composition engine, and the API surface (§12) has no author command. No Directive path exists (ADR-0051, §1.4). |
| **Telemetry via sync** | Sync is device-to-device on the Principal's own infrastructure; the relay is dumb and optional. Nothing reaches Anthropic or any Sidra server (ADR-0009, §1.4). |

**The single authority holds.** A phone approval is not a new way to grant. It is the Principal's signed intent,
carried to the kernel, where it passes signature and staleness checks and becomes the *same* logged Decision a
desktop approval produces (ADR-0002). M18 adds a capture surface and a courier; it adds no authority and removes
no check.

---

## 8. The Brief render payload (ADR-0051 in mechanism)

1. **Render once, in the kernel.** For each Brief in a snapshot, the `render` module runs the M10 sanitizing
   pipeline over the six `briefs` fields and emits a `BriefRenderPayload`: the sections in fixed order, each an
   allowlisted node tree (heading, paragraph, list, list-item, emphasis, code-span, trace-link — the M10
   allowlist), with `the_ask` and `confidence` as structured fields.
2. **Hash it.** `content_hash = SHA-256(canonical_json(payload))`. The desktop renderer consumes the same
   payload shape; there is one render implementation and one allowlist.
3. **Cache it.** The payload and its hash are written to `brief_render_cache` keyed by `(brief_id,
   payload_version)`, so a snapshot re-push does not re-render and the exit-criterion test can compare hashes.
4. **Paint it, don't parse it.** The client's `BriefPainter` walks the node tree with native primitives. It
   runs **no** markdown parser and **no** sanitizer — there is nothing left to sanitize — and it produces no
   content the kernel did not. "Renders identically" is `content_hash` equality (§17 AC2); screen size and
   font metrics differ, content does not.

No payload carries a secret, a Vault path, a `KeychainRef`, or a dereferenceable remote URL — a trace-link is
a trace id the kernel resolves later, on the desktop, not a URL the phone fetches (ADR-0051, §7 T10).

---

## 9. Reconciliation path and idempotency (ADR-0049 in mechanism)

On `reconcile_outbox()` (kernel running; outbox entries delivered directly or drained from the relay), for
each `ApprovalOutboxEntry`:

1. **Verify trust.** Check the signature against the entry's `device_id` public key and that the device is
   `Active` (not `Suspended` or `Revoked`). Failure → `REJECTED_UNTRUSTED`, discard, log
   `ApprovalCaptureRejected{reason: untrusted}` (ADR-0050; §7 T-C2).
2. **Dedupe.** If a `decisions` row already exists for `approval_request_id`, the entry is `DUPLICATE_IGNORED`
   — a pure no-op. Idempotency is structural (invariant §3.5.2; §7 T-C3).
3. **Check staleness.** Look up the `approval_requests` row. If its `status` is no longer `pending` (expired,
   granted/denied elsewhere, or superseded), the entry is `REJECTED_STALE`, logged, and the item is
   re-surfaced to the Principal (invariant §3.5.5; §7 T-C5).
4. **Apply.** Otherwise append to the hash chain the *same* records a desktop approval produces: a `decisions`
   row (`authority = 'principal'`, `chosen_option` from the verdict, the capture `device_id` in its
   provenance), an `ApprovalResolved` event, and the `approval_requests.status` update. This is a pure append
   (ADR-0002).

Steps 1–3 are the courier checks the Companion adds; step 4 is the approval write that already existed on the
desktop. No step is skippable and the order is fixed. Reconciliation runs whenever the kernel next starts, on
a timer while it runs, and on demand when the Principal opens the desktop and the phone is reachable.

---

## 10. Effect classes and which options the phone offers (unchanged from the security model)

The phone mirrors the M15 request and offers exactly the options the security model already permits
(`/docs/07-security-model.md` §5–§6). M18 changes no policy.

| Class | Meaning | Options the phone offers |
|---|---|---|
| 1 | External read requiring approval for a new host | `Once` · `Session` · `No` |
| 2 | Reversible write | `Once` · `Session` · `Always` · `No` |
| 3 | Irreversible / external effect (spend, publish, send, delete outside Vault) | `Once` · `No` — **never `Always`** (no standing class-3 grant, `/docs/07-security-model.md` §5) |

The phone never invents an option the desktop would not offer, and it never offers `Always` for a class-3
request. Because the pending request already carries its `effect_class` in the snapshot (§4.3), the option set
is a display fact, not a phone-side judgement.

---

## 11. Persistence, events, and the Markdown mirror

### 11.1 New tables — all additive projections (forward-only migrations, `0033`–`0036`)

| Migration | Table | Purpose |
|---|---|---|
| `0033_companion_devices.sql` | `companion_devices` | the trust record: `device_id`, `device_pubkey`, `label`, `paired_at/by`, `status`, `revoked_at` — **public key only, never a secret** |
| `0034_companion_sync_state.sql` | `companion_sync_state` | per-device sync bookkeeping: `device_id`, `cursor`, `last_snapshot_at`, `last_reconciled_at` |
| `0035_approval_outbox.sql` | `approval_outbox` | approvals captured on the phone awaiting reconciliation: `approval_request_id`, `verdict`, `grant_scope`, `decided_at`, `device_id`, `signature`, `reconcile_state` — **signed intent, never a Decision** |
| `0036_brief_render_cache.sql` | `brief_render_cache` | canonical render payloads: `brief_id`, `payload_version`, `payload`, `content_hash` — **display content, no secret** |

Additive columns only elsewhere; no existing column's meaning changes. A Firm with **no paired device**
behaves exactly as it did before M18 — a null pairing is a fully supported state, not a migration artifact
(G8). Migration numbering continues after the connector framework band (M16 used `0025`–`0029`), with room
reserved for M17; M18 begins at `0033`.

### 11.2 Domain events

Every event carries `actor` and lands on the hash chain (ADR-0002). Where a device is involved, `device_id` is
recorded:

`DevicePaired` · `DeviceSuspended` · `DeviceResumed` · `DeviceRevoked` · `SnapshotPushed` · `SnapshotPulled` ·
`ApprovalCaptured` (a device recorded intent — *not yet a Decision*) · `ApprovalReconciled` ·
`ApprovalResolved` (the Decision on the hash chain — the same event a desktop approval emits) ·
`ApprovalCaptureRejected` (with `reason ∈ {untrusted, stale}`) · `OutboxDrained`.

`ApprovalResolved` is not a new event kind invented for M18 — it is the existing approval-resolution event
(M15), now reachable from a reconciled phone capture as well as a desktop click. That is the point: a phone
approval and a desktop approval are the same Decision (ADR-0049, G3).

### 11.3 Vault Markdown mirror (v1 rule — the archive outlives the software)

```
~/Sidra/
└── companion/
    ├── devices.md         which devices are paired, their labels, when paired, which revoked — human-readable
    └── captures/          per-day log of approvals captured on a phone and how each reconciled — plain language
```

Written on state transitions, not continuously (the M15/M16 mirror discipline). A Principal who abandons Sidra
OS keeps a readable record of every device that could clear an approval and every approval a phone captured —
but never a secret, because none ever existed on the phone or in the mirror.

---

## 12. Public APIs

### 12.1 Commands

| Command | Effect | Notes |
|---|---|---|
| `begin_pairing()` → `PairingChallenge` | Pairing | desktop mints a short-lived, out-of-band challenge (code/QR) |
| `complete_pairing(challenge, device_pubkey, proof)` | Paired | runs §5.2 checks; a Principal **Decision**; records the device, public key only |
| `suspend_device(device_id)` / `resume_device(device_id)` | Suspended / Paired | pauses/resumes snapshots; pairing retained |
| `revoke_device(device_id)` | Revoked | a Principal **Decision**; refuses every later outbox entry from the device (ADR-0050) |
| `build_snapshot(device_id)` → `SyncSnapshot` | — | the day's Briefs (rendered) + pending Approval Requests; **no secret, no Vault content** |
| `submit_outbox(device_id, entries)` | — | accepts signed `ApprovalOutboxEntry` batches into `approval_outbox`; does **not** apply them |
| `reconcile_outbox()` | appends Decisions | the §9 idempotent path; each `APPLIED` entry is a hash-chain Decision |

There is **no** author command — no `create_directive`, no `compose`, no `edit_brief`, no `reply`. The absence
is the enforcement of the no-authoring constraint (G1, ADR-0051).

### 12.2 Queries

| Query | Returns |
|---|---|
| `list_devices()` | paired devices + status |
| `device_status(device_id)` | lifecycle state |
| `pending_snapshot_size(device_id)` | count of Briefs + pending approvals bound for the phone (bounds check, G10) |
| `outbox_state(device_id)` | per-entry reconcile state (pending / applied / duplicate / rejected) |

### 12.3 API rules

1. **No API returns a secret.** Not a Vault key, not a provider key, not a `KeychainRef`, not Vault content —
   only a device **public** key where a public key is structurally required. (Inherited verbatim from the
   connector framework, M16 §12.3.)
2. **The phone never writes an authoritative record.** `submit_outbox` enqueues signed intent;
   `reconcile_outbox` — kernel-only — is the sole path to a Decision.
3. **`complete_pairing`, `revoke_device`, and every reconciled approval are Decisions** — logged on the hash
   chain, with the plain-language who/what/why shown before the act (`/docs/07-security-model.md` §6;
   marketplace trust rule).
4. **No command authors.** There is no API that composes or edits a Brief, a Directive, or any record. A phone
   approval selects a verdict on an existing request; it originates nothing (G1).

---

## 13. Sequence diagrams

### 13.1 Pairing

```
Principal   Desktop(companion)   Phone(apps/companion)   Kernel(chain)
   │  begin_pairing   │                  │                    │
   ├─────────────────►│ mint challenge   │                    │
   │◄── code + QR ────┤ (short TTL)       │                    │
   │  shows code to phone (out-of-band) ─►│ generate enclave keypair
   │                  │  complete_pairing(challenge, pubkey, proof)
   │                  │◄─────────────────┤                    │
   │                  │ validate §5.2     │                    │
   │                  ├──────────────────┼───────────────────►│ write CompanionDevice
   │                  │                   │                    │ emit DevicePaired
   │◄── "Paired: Principal's phone" (plain-language confirm) ──┤
```

### 13.2 The exit-criterion path — desktop offline, phone clears the day's approvals

```
 (evening, desktop online)                              (later, desktop OFF)              (next morning, desktop returns)

Desktop(companion)        Phone                          Principal   Phone                 Kernel(reconcile)   Chain
   │ build_snapshot        │                                │          │                       │               │
   │  day's Briefs         │                                │          │                       │               │
   │  (rendered, hashed)   │                                │          │                       │               │
   │  + pending approvals  │                                │          │                       │               │
   ├── SnapshotToPhone ───►│ SnapshotStore := snapshot      │          │                       │               │
   │  (no secret crosses)  │                                │          │                       │               │
   │ (desktop goes offline)│                                │          │                       │               │
   │                       │  ── DESKTOP NOT PRESENT ──     │  reads Brief (painted from       │               │
   │                       │                                │   payload; content_hash matches) │               │
   │                       │                                │  clears the day's approvals      │               │
   │                       │                                ├─ Approve/Deny each ─────────────►│               │
   │                       │  ApprovalCapture: sign entry, append to Outbox (offline)          │               │
   │                       │  outbox = [entry(req1), entry(req2), …]  (append-only, signed)    │               │
   │                       │                                                                   │               │
   │ (desktop returns; phone reachable over LAN or relay drains)                               │               │
   │◄── OutboxToKernel (opaque envelope) ─────────────────────────────────────────────────────┤               │
   │                       │                                                                   │ for each entry:│
   │                       │                                                                   │ verify sig ✓   │
   │                       │                                                                   │ dedupe (none)  │
   │                       │                                                                   │ still pending ✓│
   │                       │                                                                   ├── APPLIED ────►│ append Decision
   │                       │                                                                   │                │ + ApprovalResolved
   │◄── snapshot next push reflects resolved state ────────────────────────────────────────────┤               │
```

The Principal's action happens with **no desktop present** (middle column). The authoritative record happens
when a kernel is present (right column), as a pure append keyed to each `approval_request.id`. The two are
different moments, and the exit criterion is about the first (ADR-0049).

### 13.3 The idempotent / stale refusals

```
Kernel(reconcile)                                   Chain
   │ entry(req1): Decision already exists?  YES  →  DUPLICATE_IGNORED   (no append — a pure no-op; T-C3)
   │ entry(req2): request still pending?    NO   →  REJECTED_STALE      (logged; re-surfaced to Principal; T-C5)
   │ entry(req3): device revoked?           YES  →  REJECTED_UNTRUSTED  (discarded; logged; T-C2)
   │ entry(req4): all checks pass           ─────►  APPLIED             (append Decision + ApprovalResolved)
```

---

## 14. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | **Desktop absent when the Principal acts** | Expected, not a failure. The phone works from the cached snapshot; approvals queue in the append-only outbox; reconciliation is deferred to when a kernel is present (ADR-0049; §13.2). No data loss. |
| F2 | **Two approvals for the same request** (phone approved; desktop also approved) | Idempotent. The second entry is `DUPLICATE_IGNORED`; a Decision for the `approval_request.id` is written once (§9 step 2; §3.5.2; T-C3). |
| F3 | **Stale sync** — request expired or resolved before the phone acts | `REJECTED_STALE` at reconciliation; re-surfaced to the Principal; the kernel's copy wins (§9 step 3; §3.5.5; T-C5). |
| F4 | **Lost or stolen phone** | `revoke_device` (a Decision); every later outbox entry from that `device_id` is `REJECTED_UNTRUSTED`; no history rewrite; the phone holds no secret to leak (ADR-0050; T-C1; F6-analogue of M16). |
| F5 | **Relay unavailable, dropping, or duplicating envelopes** | Sync waits or falls back to LAN; the append-only outbox tolerates delay; dropped envelopes redeliver; duplicates collapse to a no-op (T-C4, T-C3). Reconciliation is deferred, never corrupted. |
| F6 | **Forged or tampered outbox entry** | Signature check fails → `REJECTED_UNTRUSTED`; it never becomes a Decision (§9 step 1; T-C2). |
| F7 | **Snapshot is stale on the phone** (desktop resolved items after the last push) | The phone shows what it last cached; any capture against a since-resolved request is caught as `REJECTED_STALE` at reconciliation and re-surfaced. The cache never claims authority (§3.5.5). |
| F8 | **Phone offline for days** | The outbox is durable and append-only; captures accumulate; all reconcile on next contact with a kernel. No expiry on the phone side beyond what the kernel enforces on the request itself (§3.5.5). |
| F9 | **Payload version drift** (phone built against an older render schema) | The render payload is versioned (ADR-0051, ADR-0002 forward-compat); an older painter renders a known-compatible subset; the `content_hash` check is scoped to the shared version. |

---

## 15. Performance and offline

- **Offline is the default-and-intended state.** The whole milestone is built around the desktop being absent
  when the Principal acts (ADR-0049). The phone reads a cached Brief and captures approvals with no network at
  all; reconciliation is asynchronous. This is the Layer-6/local-first posture (`/docs-v2/02-layer-model.md`
  §9) applied to a second device: disconnect everything and the Principal can still clear the day.
- **Sync is bounded.** A snapshot is *the day's Briefs* plus *the pending Approval Requests* — a small, capped
  set (a Mission concludes with at most one approval; a day accrues a handful). `pending_snapshot_size`
  exposes the bound. There is no bulk Vault sync, no history sync, no artifact sync — those never leave the
  desktop (G4, G10).
- **The Brief is fast on mobile.** The phone paints a pre-rendered node tree; it runs no markdown parser and
  no model call. Rendering is a tree walk, not a pipeline (ADR-0051, §8).
- **Reconciliation is off the interaction path.** Capturing an approval is a local append and a signature — no
  round-trip. The Decision is written later, when a kernel is present, without the Principal waiting.

---

## 16. Dependencies, assumptions, risks

### 16.1 Dependencies

| On | For |
|---|---|
| M10 — Brief format & the sanitizing render pipeline | the six `briefs` fields and the node allowlist the render payload reuses (ADR-0051) |
| M15 — Approval Requests | the `approval_requests` the phone mirrors and the Decision reconciliation appends |
| M3 — security kernel (keychain, redaction, Ed25519, the untrusted-client boundary) | pairing signatures, redaction on every new write path, the client trust class |
| M2 — event log & hash chain (ADR-0002) | pairing, capture, and reconciliation events; the reconciled approval as a pure append |

M18 depends on **M10 and M15**, not on M17. The connector suite is orthogonal — the Companion carries Briefs
and approvals, which exist independent of any connector (`/MILESTONE_REGISTRY.md` §4, M18 row).

### 16.2 Assumptions

1. A Brief exists in the `briefs` shape M10 defines, and an Approval Request in the `approval_requests` shape
   M15 defines. M18 reads both and writes neither.
2. The platform provides a secure enclave (iOS Secure Enclave / Android Keystore) for the device keypair. On a
   platform without one, pairing falls back to a passphrase-wrapped key store, mirroring the M3 keychain
   fallback (`/docs/07-security-model.md` §8) — the private key still never leaves the phone.
3. The desktop is online *at some point in each cycle* — to push a snapshot before, and to reconcile after.
   "No desktop present" is about the moment of action, not the whole cycle (ADR-0049). A desktop that never
   comes online is out of scope; that is M23, not M18.
4. The optional relay, when used, is the Principal's own infrastructure. Sidra operates no relay; none is
   required (ADR-0009, ADR-0049).

### 16.3 Risks

| # | Risk | Mitigation |
|---|---|---|
| CR-1 | The Companion accretes an authoring path under feature pressure | No composition engine ships (ADR-0051); the API surface has no author command (§12); a CI check asserts `apps/companion` exposes no compose/edit/create-directive entry point (§18) |
| CR-2 | "Renders identically" quietly weakens to "renders similarly" | It is a `content_hash` equality, tested (AC2); one render implementation and one allowlist (ADR-0051) |
| CR-3 | A secret leaks to the phone through a snapshot or payload | No API returns a secret (§12.3, inherited M16); a CI scan asserts no token/key/`KeychainRef`/Vault-path pattern in any snapshot or payload fixture (§18) |
| CR-4 | Double-apply of an approval | Structural idempotency: keyed to `approval_request.id`, a Decision written once (§3.5.2, §9); tested over replayed/duplicated outboxes (AC5) |
| CR-5 | The design drifts toward a headless kernel or a cloud service | ADR-0049 fixes the boundary; a CI dependency check asserts `sidra-companion` has no edge to orchestrator/mission/departments and no network authority beyond snapshot/outbox transport (§18) |
| CR-6 | A lost phone clears approvals before revocation | Exposure bounded to the cached day on an unlocked device; revocation refuses all later entries; same posture as a stolen unlocked laptop (T-C1, ADR-0050) |
| CR-7 | Migration breaks a pre-M18 Firm | Forward-only, additive; null pairing = pre-M18 behaviour; each migration independently deployable (G8) |

---

## 17. Acceptance criteria

The exit criterion decomposed into testable claims. **These are the contract with AntiGravity.**

| # | Claim | Proven by |
|---|---|---|
| AC1 | **The Principal clears a day's approvals from the phone with no desktop present** — the desktop is offline when each approval is captured, and every capture lands in the append-only outbox | the exit-criterion harness (§13.2): desktop offline, phone captures N approvals, outbox holds N signed entries |
| AC2 | **The Brief renders identically** — the phone's Brief content is byte-for-byte the desktop's | render-payload test asserting `content_hash(desktop) == content_hash(phone)` for a corpus of Briefs across all four `kind`s (ADR-0051) |
| AC3 | **Every approval is a Decision on the hash chain**, `authority = 'principal'`, recording the capture device | reconciliation test asserting a `decisions` row + `ApprovalResolved` event per applied entry; `audit.verify` over the lifecycle fixture (ADR-0002) |
| AC4 | An approval is **applied exactly once**; a duplicate/replayed entry is a no-op | idempotency test replaying an outbox and cross-approving on the desktop; asserts one Decision per `approval_request.id` (T-C3, §9 step 2) |
| AC5 | **No authoring path exists** — the client has no compose/edit/create-directive surface and no such command | API-surface test + CI check asserting the absence (CR-1, §12, §18) |
| AC6 | **No secret leaves the kernel** — no snapshot or payload contains a key, token, `KeychainRef`, or Vault content | redaction/scan test over snapshot and payload fixtures; zero secret patterns (T3, §12.3) |
| AC7 | A **stale** capture (request expired/resolved) is refused and re-surfaced, never silently applied | staleness test resolving a request on the desktop, then reconciling a phone entry for it → `REJECTED_STALE` (T-C5) |
| AC8 | A **lost phone** is revocable; its later outbox is refused without history rewrite | revoke test: revoke a device, deliver its outbox, assert `REJECTED_UNTRUSTED` and an untouched chain (T-C1, ADR-0050) |
| AC9 | A **forged/tampered** outbox entry never becomes a Decision | signature test with a wrong/absent signature → `REJECTED_UNTRUSTED` (T-C2, §9 step 1) |
| AC10 | The **relay is optional and authority-free** — sync completes over LAN with no relay, and a relay never applies an approval | transport test: full cycle with no relay; and a relay-stub test asserting the relay only forwards opaque envelopes (T-C4, ADR-0049) |
| AC11 | **No paired device = pre-M18 behaviour**; migrations are additive and forward-only | null-pairing test asserting byte-identical desktop behaviour; migration-independence test (G8, CR-7) |
| AC12 | `sidra-companion` has **no dependency edge** to orchestrator, mission, or departments, and holds no network authority beyond transport | dependency-direction check in CI (G9, CR-5, §6) |

---

## 18. Testing strategy

- **The exit-criterion harness (AC1) is the spine.** It scripts the §13.2 path end to end with the desktop
  process stopped at the moment of capture: build a snapshot, stop the kernel, capture a day's approvals on a
  simulated client, restart the kernel, reconcile, and assert every approval is a hash-chain Decision. It is
  the last thing to go green.
- **Render-fidelity is a hash equality (AC2).** A corpus of Briefs — one per `kind`, including ones with long
  findings, lists, code spans, and adversarial markdown — is rendered on both paths and compared by
  `content_hash`. Any drift fails the build.
- **Idempotency and staleness are property tests (AC4, AC7).** Over generated sequences of captures,
  duplicates, desktop cross-approvals, and expiries, assert: one Decision per request id, and every stale
  entry re-surfaced.
- **Security is fixture-driven (AC6, AC8, AC9, T-C1..T-C5).** Redaction scans over snapshot/payload fixtures;
  a revoke-then-deliver test; a forged-signature test; a relay-stub that forwards opaque bytes and is asserted
  to read nothing.
- **CI static checks (AC5, AC12, CR-1, CR-3, CR-5).** Grep-style checks assert: no author/compose/edit command
  in `apps/companion`; no secret pattern in any payload/snapshot type; no dependency edge from
  `sidra-companion` to orchestrator/mission/departments. Build fails on a hit, mirroring the M16 kernel-purity
  checks (M16 §6, AC11–AC12).
- **Every task ships its own tests** (the Mission Engine / M16 plan convention). No "tests follow later."

## 19. CI requirements

| Check | Asserts | Fails build on |
|---|---|---|
| `companion-no-authoring` | `apps/companion` exposes no compose/edit/create-directive/reply surface, and `sidra-companion` has no author command | any author entry point (AC5, CR-1) |
| `companion-no-secret` | no snapshot or `BriefRenderPayload` type or fixture carries a key/token/`KeychainRef`/Vault-path pattern | any secret pattern (AC6, CR-3) |
| `companion-dep-direction` | `sidra-companion` has no edge to `sidra-orchestrator`, `sidra-mission`, or `sidra-departments` | any forbidden edge (AC12, CR-5) |
| `companion-render-identity` | the desktop and phone render paths produce equal `content_hash` over the Brief corpus | any hash mismatch (AC2, CR-2) |
| `companion-idempotency` | replaying an outbox and cross-approving yields one Decision per request id | any double-apply (AC4, CR-4) |
| `companion-audit-verify` | `audit.verify` passes over the pairing→capture→reconcile lifecycle fixture | any chain break (AC3) |

These run in `infrastructure/ci/`, alongside the M16 checks, per ADR-0031 (CI checks in
`infrastructure/ci/`, workflows in `.github/`).

---

## Appendix A — Glossary additions

- **Companion** — the mobile surface (`apps/companion`) that reads Briefs and captures approvals. An untrusted
  client in the class of the desktop renderer (`/docs/01-technical-architecture.md` §4); holds no secret, no
  Vault, no model network. Cannot author.
- **Companion service** — the Layer-1 kernel machinery (`sidra-companion`) that pairs devices, builds
  snapshots, renders Briefs into payloads, and reconciles approvals onto the hash chain.
- **Snapshot** — a bounded, secret-free package pushed to a paired phone: the day's Briefs (as render
  payloads) and the pending Approval Requests. A cache, never a source of truth.
- **Outbox** — the phone's append-only store of signed approval *intent*, awaiting reconciliation. Not a
  Decision until the kernel applies it.
- **Reconciliation** — the kernel's idempotent application of outbox entries onto the hash chain: verify →
  dedupe → staleness → append a Decision, keyed to `approval_request.id`.
- **Pairing** — the logged Principal Decision that binds a device keypair, establishing a revocable courier
  route. Grants no capability and no authority.
- **Render payload** — the canonical, allowlisted, hashed node tree the kernel produces for a Brief and the
  phone paints verbatim. "Renders identically" is `content_hash` equality.
- **Relay** — an optional, dumb store-and-forward for opaque sync envelopes on the Principal's own
  infrastructure. Holds no key, reads no content, applies no approval.

## Appendix B — Repository placement

```
services/
└── companion/                  NEW — crate sidra-companion (Layer-1 kernel machinery)
    ├── pairing
    ├── registry
    ├── snapshot
    ├── render
    ├── outbox
    ├── reconcile
    └── transport

apps/
└── companion/                  NEW — the mobile client (untrusted surface): SnapshotStore, Outbox,
                                       BriefPainter, ApprovalCapture, DeviceKey. No Vault, no secret.

services/store/migrations/      EXTENDED — 0033_companion_devices.sql … 0036_brief_render_cache.sql (forward-only)

infrastructure/testing/
└── companion/                  NEW — exit-criterion harness, render-identity corpus, idempotency/staleness
                                       property tests, revoke/forgery/relay security fixtures

infrastructure/ci/              EXTENDED — the six §19 checks
```

Dependency direction (ADR-0011): `packages/domain ← services/companion ← apps/companion`. `services/companion`
depends on `services/security` and `services/store` and reads the `briefs`, `approval_requests`, and
`decisions` projections; it does **not** depend on `services/orchestrator`, `services/mission`, or
`services/departments`.

## Appendix C — Implementation position

M18 is the third milestone of 2.5 "Field". It depends on **M10** (Brief format and the sanitizing render
pipeline) and **M15** (Approval Requests) — both Documented — and reuses **M3** (security kernel) and **M2**
(event log). It does **not** depend on M17 (the connector suite is orthogonal to Briefs and approvals), which
is why M18 can be architected while M17 is only Defined (see `00-M17-AUDIT.md`).

Building the "no desktop present" mechanism as a headless hosted kernel is the mistake ADR-0049 exists to
prevent: that is M23 (Kernel Extraction), five milestones away, and pulling it forward would turn a personal
desktop app into a network service years before the programme intends. M18 instead satisfies "no desktop
present" with a local-first cache and idempotent reconciliation — the smallest thing that can be true.

**Exit criterion.** A Principal clears a day's approvals from a phone with no desktop present, and the Brief
renders identically — proven by test, not by configuration (AC1, AC2, AC3).
