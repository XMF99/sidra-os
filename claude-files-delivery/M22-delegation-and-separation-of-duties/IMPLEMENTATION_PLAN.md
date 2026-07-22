# Delegation and Separation of Duties — Implementation Plan

**Milestone M22 · crate `sidra-delegation` · for AntiGravity**

| | |
|---|---|
| Architecture | `DELEGATION_AND_SEPARATION_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0060 (self-approval refused structurally) · 0061 (delegation bounded by the delegator Fence, time-boxed, logged) |
| Crate | `sidra-delegation` at `services/delegation/` |
| Depends on | `sidra-security` (Broker, Fences), `sidra-store`, the M21 Seat substrate, `sidra-domain` |
| Must not depend on | `sidra-orchestrator`, `sidra-mission` (CI-enforced) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR.

### 0.2 Task conventions (inherited from the Mission Engine plan §0.4, unchanged)

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
| E1 | The structural approver ≠ requester constraint + Broker guard | ADR-0060: the exit criterion's two enforcement points |
| E2 | Delegation domain model | the vocabulary: `Delegation`, `Scope`, `ScopedAuthority`, value objects |
| E3 | Scoped authority bounded by the delegator Fence | ADR-0061: grant-time and use-time `scope ⊆ Fence`; the intersection rule |
| E4 | Delegation lifecycle (grant / revoke / expire) | the states, the store, the use-time re-check, revocation |
| E5 | Events + persistence (migrations 0047–0048) | the two migrations, the six event variants, the Vault mirror |
| E6 | The structural self-approval-refusal acceptance | the exit-criterion proof (guard half + raw-INSERT half) and the AC suite |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──► E3 ──► E4 ──┐
 │                         ├──► E6
 └────────► E5 ────────────┘
        (schema before E1's CHECK and E4's writes have somewhere to land)

E1 first: the constraint + guard are the milestone's spine, and everything else exists to serve them.
E5's migration 0048 (the approval_resolutions CHECK) lands with E1 — the guard and the CHECK are two halves
of one decision (ADR-0060) and must not drift. E2 then E3 build the delegation model and its Fence bound;
E4 gives it a lifecycle. E6 is the exit criterion, made a test, and MUST be the last thing green.
```

E1 lands the guard and, jointly with E5/T5.2, the CHECK — the two enforcement points of ADR-0060, together so
neither ships without the other. E2 is the domain vocabulary. E3 adds the Fence bound (ADR-0061). E4 wires the
lifecycle. E5 lands the schema and events. **E6 is the exit criterion and must be the last thing green.**

---

## E1 — The structural approver ≠ requester constraint + Broker guard (ADR-0060)

### Purpose
The milestone's spine: the two independent enforcement points that make self-approval refusal *structural* —
the Permission Broker approver-eligibility guard, and the database CHECK. Neither alone is sufficient; both
ship in this epic (the CHECK jointly with E5/T5.2).

### Scope
In: the approver-eligibility guard (self-approval check first, before the Broker's effect logic); the
`approve_request` entry point wired through the Broker; the `approval_resolutions` CHECK definition;
the `SelfApprovalRefused` refusal path. Out: delegation-sourced authority (E3), the delegation model (E2).

### Dependencies
`sidra-security` (`PermissionBroker`); the M21 Seat session; E5/T5.1–T5.2 (the schema the CHECK lives in — land
jointly).

### Public APIs
`approve_request(approver_seat, request, verdict) -> Result<Resolution, DenyReason>` with the self-approval
refusal as the first, structural stage.

### Acceptance criteria
A Seat resolving its own request is refused before the Broker (`Deny{self_approval}`); a raw INSERT of a
self-resolution is rejected by the CHECK; neither is reachable around by any mode or setting.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `sidra-delegation` crate: manifest, module skeleton, CI wiring, dependency-direction check | S | — | `services/delegation/Cargo.toml`, `src/lib.rs`, `infrastructure/ci/` | Crate builds; CI fails on any edge `sidra-delegation → sidra-orchestrator` or `→ sidra-mission` (AC12) |
| **T1.2** | Resolve the approver Seat from the authenticated M21 session (never a parameter) | S | T1.1, M21 | `eligibility/session.rs` | The approver Seat is the session Seat; a supplied approver-id parameter is ignored (AC1) |
| **T1.3** | **Self-approval check (structural, first stage of the guard):** load the request's `requester_seat_id`; if approver == requester → `Deny{self_approval}` before any authority or Broker step | M | T1.2, E5/T5.1 | `eligibility/self_approval.rs` | Refusal fires before the Broker effect logic and before any write; request stays `pending` (AC2 guard half) |
| **T1.4** | `SelfApprovalRefused` emission on every structural refusal | S | T1.3, E5/T5.3 | `eligibility/self_approval.rs` | Every refusal emits the event with requester + attempted-approver Seats; never silent |
| **T1.5** | The `approval_resolutions` CHECK `approver_seat_id <> (SELECT requester_seat_id …)` — authored here, migrated in E5/T5.2 | S | E5/T5.2 | `services/store/migrations/0048_*` (CHECK text) | A raw INSERT with approver == requester is rejected by the CHECK (AC2 schema half); shape mirrors the `reviews` CHECK |
| **T1.6** | Broker wiring: after the self-approval and authority stages pass, call `authorize_action` with the operation's effect class; then write the resolution (CHECK is the last line) | M | T1.3, `sidra-security`, E3/T3.4 | `resolution/write.rs` | Order fixed: self-approval → authority → Broker → write; a passing case still obeys effect-class policy (AC8) |
| **T1.7** | No-disabling-config assertion: a build check that no flag/mode/Review-Intensity level toggles the guard | S | T1.3 | `infrastructure/ci/` | Build fails if any config key could disable the self-approval guard (AC3; GUIDE §3 item 9) |

---

## E2 — Delegation domain model

### Purpose
The vocabulary every later epic types against: the delegation record, the scope, the scoped-authority view, and
the value objects — all rejecting invalid construction.

### Scope
In: value objects (`SeatId`, `DelegationId`, `Scope`), the `Delegation` aggregate, the `ScopedAuthority`
computed view (its type, not yet its Fence-bounded computation — that is E3). Out: persistence (E5), the guard
(E1), the Fence intersection (E3).

### Dependencies
`sidra-domain` (`Capability`, and `SeatId` if M21 exported it — reuse M21's `SeatId`, do not duplicate; confirm
before introducing).

### Public APIs
Constructors that reject invalid construction; no mutating methods on `Delegation`.

### Acceptance criteria
`Delegation` cannot be constructed with `delegatee == delegator`, or with `expires_at ≤ granted_at`; `Scope`
parses only capability strings; property tests over each.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | Value objects: `DelegationId`, `Scope` (a `Set<Capability>`), reuse M21 `SeatId` | S | E1/T1.1, M21 | `domain/values.rs` | `Scope` admits only valid capability strings; `SeatId` is M21's, not a duplicate; property tests |
| **T2.2** | `Delegation` aggregate: delegator, delegatee, scope, granted_at, expires_at, granted_by, decision_id, revoked_at/by | M | T2.1 | `domain/delegation.rs` | Rejects `delegatee == delegator` and `expires_at ≤ granted_at` at construction (invariants §3.3); immutable; no mutator |
| **T2.3** | `ScopedAuthority` type: the effective-capability view (shape only; computation is E3) | S | T2.2 | `domain/scoped_authority.rs` | Type expresses own-Fence ∪ delegated-scopes; unit tests over the type's algebra |
| **T2.4** | `DenyReason` enum: `self_approval`, `insufficient_authority`, `scope_exceeds_fence`, `self_delegation`, `fenced` | S | T2.1 | `domain/deny.rs` | Every refusal in the architecture §9 has a typed variant; serde round-trip |

---

## E3 — Scoped authority bounded by the delegator Fence (ADR-0061)

### Purpose
Make "you cannot delegate what you do not hold" a mechanical fact: `scope ⊆ delegator Fence` at grant, and
`scope ∩ delegator's current Fence` at use. Intersection, never union.

### Scope
In: the grant-time scope check; the use-time re-check against the delegator's *current* Fence; the
`ScopedAuthority` computation; the authority stage of the eligibility guard. Out: the lifecycle/store (E4),
the grant Decision record (E4).

### Dependencies
E1, E2; `sidra-security` (the Fence / effective-capability model); M21 (per-Seat Fence).

### Public APIs
`compute_scoped_authority(seat) -> ScopedAuthority`; `check_scope_within_fence(scope, delegator) -> Result`.

### Acceptance criteria
An over-broad delegation is refused at grant naming the capability; a shrunk delegator Fence narrows every
delegation it granted at the next use; conferred authority is never a superset of the union of relevant Fences.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | Grant-time scope check: `scope ⊆ delegator's current Fence`, else `Deny{scope_exceeds_fence}` naming the capability | M | E2, `sidra-security` | `delegation/scope_check.rs` | An over-broad scope is refused at grant; the offending capability is named (AC5; ADR-0061) |
| **T3.2** | Self-delegation refusal at grant (`delegator ≠ delegatee`) | S | T3.1 | `delegation/scope_check.rs` | A self-delegation is refused; backstopped by the 0047 CHECK (AC9) |
| **T3.3** | `ScopedAuthority` computation: own Fence ∪ (each active delegation's scope ∩ delegator's current Fence) | L | T3.1, E4/T4.1 | `delegation/scoped_authority.rs` | Conferred authority ⊆ union of relevant current Fences; property test asserts never a strict superset |
| **T3.4** | Authority stage of the eligibility guard: approver's `ScopedAuthority` ⊇ the required capability, else `Deny{insufficient_authority}`; record the `authority_source` | M | T3.3, E1/T1.6 | `eligibility/authority.rs` | Own-Fence and delegation-sourced approvals both resolve; the source is recorded on the resolution (AC8) |
| **T3.5** | Use-time re-check: a delegation confers only `scope ∩ delegator's current Fence`; a shrunk Fence narrows it with no row edit; emit `DelegationUseSuspended` for the uncovered part | M | T3.3 | `delegation/use_check.rs` | Fence-shrink narrows conferred authority at next use; `DelegationUseSuspended` emitted; row unchanged (AC6; T-D3) |

---

## E4 — Delegation lifecycle (grant / revoke / expire)

### Purpose
The state machine and the store: granting a delegation as a Decision, revoking it, and expiring it lazily at
use. All time-boxed, all logged, all append-only.

### Scope
In: `delegate_authority`, `revoke_delegation`, the lazy use-time expiry, the delegation store, the grant
Decision record. Out: the scope/Fence checks (E3), persistence DDL (E5).

### Dependencies
E2, E3; the decision engine (`decisions` table); `sidra-store` (schema from E5).

### Public APIs
`delegate_authority(delegator, delegatee, scope, expires_at) -> DelegationId`;
`revoke_delegation(delegation)`; `list_delegations_to(seat)`; `list_delegations_from(seat)`.

### Acceptance criteria
A grant is a logged Decision within the delegator's Fence; a revoked or expired delegation confers nothing;
history is append-only.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | Delegation store: create, list-by-delegatee, list-by-delegator, revoke; persist to `delegations` | M | E3, E5/T5.1 | `delegation/store.rs` | Grant requires delegator, delegatee, scope, and a future `expires_at`; revoke sets `revoked_at`; history immutable |
| **T4.2** | `delegate_authority`: run §9 grant guards (self-delegation, scope ⊆ Fence, future expiry), record the Decision, write the row, emit `DelegationGranted` | M | T4.1, T3.1, decision engine | `delegation/grant.rs` | A valid grant is a Decision (`authority = delegated`) on the chain; an invalid one is refused before any write (AC5, AC7) |
| **T4.3** | `revoke_delegation`: delegator Seat or Principal; effective immediately; emit `DelegationRevoked` | S | T4.1 | `delegation/revoke.rs` | A revoked delegation confers nothing at the next use; the revocation is an event (AC7; F8) |
| **T4.4** | Lazy use-time expiry: `now ≥ expires_at` → confers nothing; optional cosmetic `DelegationExpired` emitter off the hot path | S | T4.1 | `delegation/expire.rs` | An expired delegation confers nothing without a background sweeper; correctness does not depend on the emitter (AC7; §15) |
| **T4.5** | Exactly-once resolution guard via `approval_resolutions.request_id UNIQUE`; racing resolvers | S | T4.1, E5/T5.2 | `resolution/once.rs` | Two Seats racing to resolve the same request → the second write fails; resolved exactly once (F9) |

---

## E5 — Events + persistence (migrations 0047–0048)

### Purpose
Additive, forward-only schema; the six event variants; the human-readable Vault mirror.

### Scope
In: migrations `0047_delegations.sql` and `0048_approval_resolutions.sql` (including the additive
`requester_seat_id` column and its backfill), the `DelegationEvent` variants, the Vault mirror writer. Out:
business logic (E1–E4).

### Dependencies
`sidra-store`; the existing `approval_requests`, `decisions`, `seats` tables; the seat migrations from M21 end
below `0047`, so delegation migrations start at `0047`.

### Acceptance criteria
Forward-only, idempotent, independently deployable; a one-Seat Firm is unchanged; the `approval_resolutions`
CHECK is present; the mirror holds no credential.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | `0047_delegations.sql` — the delegation table with `CHECK (delegatee_id <> delegator_id)` and `CHECK (expires_at > granted_at)`; index on delegatee | S | — | `services/store/migrations/` | Forward-only; idempotent; independently deployable; self-delegation and un-bounded expiry unrepresentable |
| **T5.2** | `0048_approval_resolutions.sql` — additive `requester_seat_id` on `approval_requests` (backfilled to the single M21 Seat) + `approval_resolutions` with the structural CHECK `approver_seat_id <> requester_seat_id` | M | T5.1, E1/T1.5 | `migrations/` | The CHECK mirrors the `reviews` CHECK; `requester_seat_id` backfilled; `UNIQUE(request_id)`; independently deployable (AC2 schema half, AC11) |
| **T5.3** | `DelegationEvent` enum — the six variants (`DelegationGranted`, `DelegationRevoked`, `DelegationExpired`, `ApprovalResolved`, `SelfApprovalRefused`, `DelegationUseSuspended`) with the Seat actor | M | E2 | `events/mod.rs` | Every kind in architecture §7.2 present; serde round-trip; schema snapshot committed |
| **T5.4** | Vault Markdown mirror writer (on state transitions, not continuously) | M | T5.3 | `mirror/write.rs` | `delegations/`/`approvals/` written in plain language; no credential; a `SelfApprovalRefused` note recorded for each refusal |

---

## E6 — The structural self-approval-refusal acceptance

### Purpose
The exit criterion, made a test. **The last thing to go green.** Proves the refusal is *structural, not
advisory* by asserting both a guard rejection and a raw constraint rejection.

### Scope
In: the exit-criterion proof (both halves), the delegation-chain adversarial suite, the Fence-mutation suite,
the additive-migration suite, the audit-chain suite, and the CI gates that make "structural" a build gate. Out:
any new behaviour — this epic proves the prior epics.

### Dependencies
All prior epics.

### Acceptance criteria
AC1–AC12 each covered by a named test; the exit-criterion test (AC2) has a guard half **and** a raw-INSERT half
and both pass; CI-1 and CI-5 gate the build.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | Delegation-chain adversarial test (A→B, A→B→A, A→B→C→A): every case where approver == requester is refused | M | E1, E3, E4 | `infrastructure/testing/delegation/self_approval_chain.rs` | AC4 — laundering a self-approval through delegation is refused |
| **T6.2** | Scope-exceeds-Fence grant-refusal test | S | E3 | `.../scope_refusal.rs` | AC5 — over-broad delegation refused at grant, capability named |
| **T6.3** | Fence-shrink test: a delegation confers less at next use; `DelegationUseSuspended` emitted | M | E3 | `.../fence_shrink.rs` | AC6 — conferred authority tracks the delegator's current Fence |
| **T6.4** | Expiry + revoke tests: an expired or revoked delegation confers nothing | S | E4 | `.../expiry_revoke.rs` | AC7 — time-box and revocation enforced |
| **T6.5** | Happy-path cross-Seat approval test: a different Seat resolves; `authority_source` recorded | M | E1, E3 | `.../cross_seat_approval.rs` | AC8 — a valid cross-Seat resolution succeeds and names its source |
| **T6.6** | Audit-chain test over the full lifecycle; every refusal emitted `SelfApprovalRefused` | M | E5 | `.../audit_chain.rs` | AC10 — `audit.verify` passes; refusals are on the chain |
| **T6.7** | Additive-migration test: a one-Seat Firm is unchanged; requester Seat backfilled | S | E5 | `.../additive_migration.rs` | AC11 — pre-M22 behaviour preserved |
| **T6.8** | CI checks: no disabling config (CI-1), CHECK present (CI-2), no Seat id (CI-3), dep direction (CI-4), raw-INSERT assertion present (CI-5) | S | E1 | `infrastructure/ci/` | AC3, AC12 — build fails on a hit |
| **T6.9** | **The exit-criterion proof (AC2):** a Seat resolving its own request is refused by the guard *before* the Broker, **and** a raw `INSERT INTO approval_resolutions` with `approver == requester` is rejected by the CHECK | M | all prior | `.../exit_criterion.rs` | AC2 — both halves pass; the raw-INSERT half is what proves *structural*; **the last thing green** |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | the approver-eligibility guard + the `approval_resolutions` CHECK (ADR-0060) — the two enforcement points |
| E2 | the delegation domain model |
| E3 | scoped authority bounded by the delegator Fence (ADR-0061) |
| E4 | the delegation lifecycle: grant / revoke / lazy expiry |
| E5 | migrations 0047–0048, the six events, the Vault mirror |
| E6 | the structural self-approval-refusal proof (the exit criterion) — the last thing green |
