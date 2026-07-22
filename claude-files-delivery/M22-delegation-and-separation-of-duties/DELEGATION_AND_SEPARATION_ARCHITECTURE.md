# Delegation and Separation of Duties — Architecture

**Milestone M22 · Release 3.0 "Chambers" · Layer 1 (Kernel) governing the human (Seat) layer**

| | |
|---|---|
| Milestone | M22 — Delegation and Separation of Duties (`/MILESTONE_REGISTRY.md` §4, 3.0 "Chambers") |
| Release | 3.0 "Chambers" — the Firm admits colleagues |
| Layer | 1 — Kernel enforcement over the Seat identity substrate (`/docs-v2/02-layer-model.md`) |
| New crate | `sidra-delegation` at `services/delegation/` |
| Depends on | M21 (Seats and Identity), M2 (event log / hash chain), M3 (Permission Broker, Fences, default deny) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | A Seat's own Approval Request cannot be self-approved; the refusal is **structural, not advisory** — proven by a constraint/guard rejection test, not a togglable policy |

> **Authoritative precedence.** Where this document disagrees with `/docs/07-security-model.md`, the security
> model governs the Permission Broker's choke-point semantics, the Fence intersection rule, and default deny.
> Where it disagrees with `/docs/0008-separation-of-author-and-reviewer.md` (ADR-0008) about *why* separation
> is structural rather than advisory, that ADR governs — this milestone is ADR-0008 applied one layer up, at
> the human Seat layer, and it re-decides nothing about the agent layer. Where it disagrees with
> `/docs/04-database-design.md` about the shape of `approval_requests`, `decisions`, `dissents`, or the
> `reviews` CHECK, the database design governs and this architecture only *extends* it additively. Where it
> disagrees with `/docs-v2/adr/0021-seats-defined-in-2-shipped-in-3.md` about what a Seat is, ADR-0021 governs.
> This architecture *extends* those boundaries; it never re-decides them.

---

## 1. Why this subsystem exists

### 1.1 The problem

M21 gave the Firm more than one human. A **Seat** — a human identity with its own Fences, budget, and working
memory (ADR-0021) — can now exist alongside another, and every event already carries the actor field that
tells the two apart. But M21 delivered *identity*, not *authority relationships between identities*. Two
questions it deliberately left open are the whole of M22:

1. **Can a Seat approve its own request?** Through M21, an Approval Request is raised by an agent under a Seat
   and resolved by a Principal. With exactly one Seat, "the Principal" and "the requester's Seat" were the same
   human and the question could not even be asked. With two Seats, the question is sharp and dangerous: if the
   Seat that asked for a class-3 spend is also the Seat that clicks *Approve*, the entire approval mechanism is
   theatre. The Firm would have a control that looks like separation of duties and is not.
2. **Can one Seat act for another?** A colleague goes offline; a request needs a decision; the authority to
   make it sits with a Seat that is not present. Without a mechanism, the Firm either stalls or someone shares
   a login — and a shared login erases the actor field M21 spent a whole release protecting.

The requirement is not "add an approvals UI for humans." It is: **make separation of duties at the human layer
a structural property of the schema and the choke point — the same way `reviews.reviewer_id <> author` already
makes it structural at the agent layer — and add a bounded, logged, time-boxed way for one Seat to lend a
subset of its authority to another, such that no delegation can ever widen authority and no path, mode, or
setting can ever let a Seat approve its own request.**

### 1.2 The stance

Two commitments define the milestone, and each has an ADR:

1. **Self-approval is refused structurally, not advised against.** (ADR-0060) A Seat's own Approval Request
   cannot be resolved by that same Seat. The refusal lives in two places that cannot be turned off: a database
   **CHECK constraint** on the approval-resolution record (mirroring the `reviews` table's `reviewer_id <>`
   author CHECK, `/docs/04-database-design.md`), and a **Permission Broker guard** ahead of the resolution.
   There is no mode, Review-Intensity setting, "solo operator" flag, or override that relaxes it (GUIDE §3
   item 9: *"The author never reviews their own work. No mode, no setting, no performance optimisation may
   relax this."*). It is the same rule as ADR-0008, one layer up, exactly as ADR-0008 promised: *"the property
   scales to 3.0's human separation of duties without redesign — it is the same rule at a different layer."*
2. **A delegation is bounded by the delegator's own Fence, time-boxed, and logged; it can never widen
   authority.** (ADR-0061) A Seat may grant another Seat a *subset* of what it itself holds — `scope ⊆
   delegator Fence` at grant time, intersection never union (security model §4). Every delegation carries an
   expiry, is a logged **Decision** on the hash chain, and is revocable. You cannot delegate what you do not
   hold; a delegation whose scope exceeds the delegator's Fence is refused at grant time, default-deny.

### 1.3 What the subsystem is, mechanically

M22 is **kernel machinery** (Layer 1) — a small crate, `sidra-delegation`, that sits *beside* the Permission
Broker and *in front of* the approval-resolution path. It owns two records and one guard:

- the **delegation** record (delegator Seat → delegatee Seat, a scoped, time-boxed grant), and
- the **approval resolution** record (which Seat resolved which Approval Request), carrying the structural
  approver ≠ requester constraint;
- the **approver-eligibility guard**, run by the Broker before any Approval Request is marked `granted`.

It introduces **no new trust mechanism**. It reuses the Seat identity from M21, the hash-chained event log from
M2, the Permission Broker and Fence model from M3, the Decision record from the decision engine, and the
`approval_requests` table already shipped. The parallel to ADR-0008 is deliberate and load-bearing: M22 is the
`reviews.reviewer_id <> author` CHECK, re-expressed for Seats.

```
Layer 1  sidra-delegation      ← the guard + the two records: delegation, approval-resolution   (M22, THIS DOC)
Layer 1  Permission Broker      ← unchanged choke point; M22 adds the approver-eligibility guard  (M3)
Human    a Seat                 ← a human identity with a Fence, budget, working memory           (M21, ADR-0021)
```

### 1.4 What the subsystem must never become

- **Advisory-only separation.** A prompt that says "please don't approve your own request," a linter warning, a
  UI that hides the Approve button but leaves the API open — each of these is exactly the failure ADR-0008
  rejected for agents. If the refusal can be reached by any code path that does not hit the CHECK and the
  guard, the milestone has failed. The exit-criterion test asserts a *constraint/guard rejection*, not a
  policy decision that returns "denied."
- **A delegation that widens authority.** The moment a Seat can, by delegation, hold more than the union of its
  own Fence and the subsets others lent it, the Fence model has a hole and default deny is dead. `scope ⊆
  delegator Fence` is checked at grant time and re-checked at use time (the delegator's Fence can have shrunk
  since).
- **A self-approval loophole via delegation.** Seat A delegates to Seat B; B delegates back to A; A approves
  A's own request "as B." This must be refused. The approver ≠ requester CHECK keys on the **request's
  requester Seat**, not on the authority source, so no chain of delegations can launder a self-approval. The
  threat table (§8) makes this explicit and the acceptance suite (§17) proves it.
- **A place a delegation outlives its bound.** A delegation with no expiry, or one that survives the
  delegator's Fence shrinking, is a standing grant nobody re-examines — the failure mode the decision engine's
  review dates exist to prevent. Every delegation is time-boxed and re-validated at use.
- **A bypass of the Permission Broker.** Resolving an Approval Request is an effectful act. It passes the
  Broker. M22 adds one pre-flight guard (approver-eligibility) ahead of the Broker's existing logic; it removes
  nothing and adds no side door (GUIDE §3 item 5: the Broker is the only choke point).

### 1.5 Relationship to existing concepts

| Existing concept | How M22 relates |
|---|---|
| `reviews` CHECK `reviewer_id <> author` (`/docs/04-database-design.md`) | The **structural precedent**. M22 re-expresses exactly this shape for Seats: `approver_seat_id <> (SELECT requester_seat_id …)`. Same mechanism (a DB CHECK with a subquery), one layer up. |
| ADR-0008 (author ≠ reviewer) | The **invariant** M22 lifts to the human layer. ADR-0008 §Consequences promised this scales "without redesign — the same rule at a different layer." M22 is the redemption of that promise. |
| Seat (M21, ADR-0021) | The identity M22 relates. A delegation runs Seat → Seat; an Approval Request's requester and approver are Seats. M22 adds no new identity type. |
| Permission Broker + Fence (M3) | Every resolution passes the Broker. M22 adds the approver-eligibility guard *before* the Broker's effect-class logic. A delegation's scope is a Fence subset; the Broker's intersection rule (§4 of the security model) is unchanged. |
| `approval_requests` table (`/docs/04-database-design.md`) | Extended additively: a `requester_seat_id` column (backfilled to the single M21 Seat) so the resolution's CHECK has a requester Seat to compare against. No existing column changes meaning. |
| `decisions` / `dissents` (decision engine) | A delegation grant, revocation, and every approval resolution are logged **Decisions** (`authority ∈ {delegated, escalated, principal}`; delegation is precisely the `delegated` case made explicit for Seats). No new governance primitive. |
| Event log / hash chain (M2, ADR-0002) | Every delegation and resolution event lands on the existing chain with the resolving/granting Seat as actor. No chain rewrite — the actor field ADR-0021 placed at 2.0 is what makes this possible. |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | A Seat can never resolve its own Approval Request | ADR-0060; DB CHECK `approver_seat_id <> requester_seat_id`; Broker approver-eligibility guard (§9) |
| G2 | The refusal is structural, not advisory — no mode/setting/override relaxes it | §8, §16; GUIDE §3 item 9; the exit-criterion test asserts a constraint/guard rejection (AC2) |
| G3 | A delegation can never widen authority | ADR-0061; `scope ⊆ delegator Fence` checked at grant **and** at use; intersection never union (security model §4) |
| G4 | A delegation is time-boxed and revocable | §3 lifecycle; `expires_at` NOT NULL; `revoke_delegation`; expiry re-checked at use |
| G5 | Delegation cannot launder a self-approval | §8 threat T-SA2; CHECK keys on the request's requester Seat, not the authority source |
| G6 | Every delegation and every resolution is a logged Decision on the hash chain | §7 events; ADR-0002; actor = the acting Seat |
| G7 | Separation is a compile/test property, not a configuration | §17 acceptance suite; the exit-criterion constraint-rejection test |
| G8 | Everything is additive; a one-Seat Firm behaves exactly as pre-M22 | §11 forward-only migrations; requester_seat backfilled; no delegation = pre-M22 behaviour |
| G9 | The subsystem contains no Seat-specific logic | CI grep (mirrors the kernel no-`if department ==` rule, GUIDE §3 item 12); no `if seat == "…"` anywhere |

---

## 3. Delegation lifecycle

### 3.1 States

A delegation is granted directly by the delegator Seat as a Decision — there is no proposal/acceptance
handshake in this release (a Seat lends authority; the delegatee does not negotiate it). It is `Active` while
the clock and the delegator's Fence still admit it, and terminal once expired or revoked.

```
        delegate_authority(delegator, delegatee, scope, expiry)   ← a Decision (authority = delegated)
        guard: scope ⊆ delegator Fence  AND  delegator ≠ delegatee  AND  expiry in the future
  ──────────────────────────────────────────────────────────────────────►  ACTIVE
                                                                              │
                                                    ┌─────────────────────────┼──────────────────────────┐
                                          now ≥ expires_at                    │ revoke_delegation         │ delegator Fence
                                                    ▼                         ▼ (delegator or Principal)  │ no longer ⊇ scope
                                                 EXPIRED                   REVOKED                         ▼
                                                (terminal)               (terminal)                   SUSPENDED ──(Fence restored,
                                                                                                       (not usable)   still within window)──► ACTIVE
```

`Suspended` is not a stored lifecycle row that a clock flips — it is the **use-time verdict** when an otherwise
`Active` delegation's scope is no longer a subset of the delegator's current Fence. The delegation row stays
`Active` in the table (the grant was legitimate and is on the chain), but the approver-eligibility guard treats
it as conferring nothing until the delegator's Fence again covers the scope, or until it expires. This keeps
the audit truthful (the grant happened) while keeping authority honest (it confers only what the delegator
still holds).

### 3.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | `delegate_authority` | Active | `scope ⊆ delegator Fence`; `delegator ≠ delegatee`; `expires_at` strictly in the future; recorded as a Decision |
| Active | `use` (as approver authority) | Active | evaluated at use: delegator Fence still ⊇ scope, `now < expires_at`, not revoked → confers scope; else confers nothing (Suspended verdict) |
| Active | `now ≥ expires_at` | Expired | clock; emits `DelegationExpired`; no credential/authority survives |
| Active | `revoke_delegation` | Revoked | delegator Seat or Principal; emits `DelegationRevoked`; effective immediately |
| Active | delegator Fence no longer ⊇ scope | (use-time Suspended verdict) | confers nothing until Fence restored or expiry; row remains Active |

### 3.3 Invariants

1. **A delegation never confers more than the delegator currently holds.** Checked at grant (`scope ⊆
   delegator Fence`) and re-checked at every use. A delegation is not a snapshot of past authority the
   delegatee keeps after the delegator loses it.
2. **A delegation never confers the ability to self-approve.** Authority received by delegation still passes
   the approver ≠ requester CHECK, which keys on the *request's requester Seat*. No delegation, and no chain of
   delegations, changes who the requester Seat is.
3. **A delegation is always time-bounded.** `expires_at` is NOT NULL and strictly after `granted_at`. There is
   no perpetual delegation; a standing arrangement is re-granted, which is a fresh Decision, never a silent
   extension.
4. **`Expired` and `Revoked` are terminal.** Re-delegating is a fresh Decision producing a fresh row; the prior
   row is never edited (ADR-0002 event log). History is append-only.

---

## 4. Domain model

### 4.1 Core types

```
SeatId(String)              // a human identity from M21 (ADR-0021); the actor the chain already carries
DelegationId(String)
ApprovalRequestId(String)   // from the existing approval_requests table
Capability(String)          // domain "." action [":" scope] — the existing grammar (security model §4)
Scope(Set<Capability>)      // a bounded set of capabilities; a Fence subset
Instant(Timestamp)
```

### 4.2 `Delegation` — the scoped-authority primitive

```
Delegation {
    id:            DelegationId,
    delegator:     SeatId,                 // the Seat lending authority
    delegatee:     SeatId,                 // REQUIRED, and ≠ delegator (a Seat cannot delegate to itself)
    scope:         Scope,                  // ⊆ delegator's Fence at grant; re-checked ⊆ at use (ADR-0061)
    granted_at:    Instant,
    expires_at:    Instant,                // REQUIRED, strictly after granted_at (invariant §3.3.3)
    granted_by:    SeatId,                 // the actor of the grant Decision — normally = delegator
    decision_id:   DecisionId,             // the Decision that recorded this grant
    revoked_at:    Option<Instant>,
    revoked_by:    Option<SeatId>,
}
```

The delegation is scoped authority compressed into one record: *who lends* (delegator), *who receives*
(delegatee), *what* (scope, a Fence subset), *until when* (expires_at). It confers, at use time, only the
intersection of its `scope` with the delegator's *current* Fence — never a union, never a snapshot.

### 4.3 `ScopedAuthority` — the effective authority a Seat holds

Not a stored row; a computed view the guard consults.

```
ScopedAuthority(seat) =
      own_fence(seat)                                    // what the Seat holds in its own right (M21/M3)
    ⋃  ⋃ { d.scope ∩ own_fence(d.delegator)             // each active, unexpired, unrevoked delegation TO this seat,
           :  d ∈ delegations_to(seat),                 //   bounded by the delegator's CURRENT fence (ADR-0061)
              d.state = Active,
              now < d.expires_at,
              d.revoked_at is None }
```

The union is over *delegated* scopes, but each delegated scope is itself intersected with the delegator's
current Fence before it counts. A Seat's effective authority can therefore only ever be its own Fence widened
by subsets others legitimately hold and have lent — and it shrinks the instant a delegator's Fence shrinks or a
delegation expires. This is the mechanical meaning of "scoped authority."

### 4.4 The approver ≠ requester constraint (the structural heart)

The exit criterion is one relation, enforced in two independent places so neither can be the only guard:

```
For every ApprovalResolution r resolving ApprovalRequest q:
        r.approver_seat_id  <>  q.requester_seat_id                 (the invariant)

Enforced by:
  (1) a DB CHECK on the approval-resolution row — mirrors reviews.reviewer_id <> author
      CHECK (approver_seat_id <> (SELECT requester_seat_id FROM approval_requests
                                  WHERE approval_requests.id = approval_resolutions.request_id))
  (2) a Permission Broker approver-eligibility guard evaluated BEFORE the resolution is written (§9)
```

The two are redundant on purpose. The Broker guard gives a *typed refusal an agent/UI can act on*
(`Deny{self_approval}`) before any write; the CHECK gives a *last-line database refusal* that fires even if a
future code path forgot the guard. ADR-0060 records why both, not one: a single guard in application code is
exactly the "advisory that could be edited out" ADR-0008 rejected. The reviews table did not trust application
code alone; neither does M22.

### 4.5 Relationships

```
Seat            1 ──── * Delegation          (as delegator — authority lent out)
Seat            1 ──── * Delegation          (as delegatee — authority received)
Delegation      *  ──── 1 SeatId (delegator) ≠ SeatId (delegatee)          (self-delegation forbidden)
Delegation      1  ──── 1 DecisionId          (the grant is a Decision, on the chain)
ApprovalRequest 1 ──── 1 SeatId (requester)   (requester_seat_id, additive column)
ApprovalRequest 1 ──── 0..1 ApprovalResolution (a request is resolved at most once)
ApprovalResolution * ── 1 SeatId (approver)  WHERE approver ≠ the request's requester   (the CHECK)
Delegation.scope ⊆ own_fence(delegator) at grant, ∩ own_fence(delegator) at use          (ADR-0061)
```

---

## 5. Seats, Fences, and scoped authority

### 5.1 What a Seat brings from M21

A Seat (ADR-0021) is a human identity carrying its own **Fence** (a capability ceiling, the human analogue of
an agent's standing capabilities — security model §4), its own budget, and its own working memory. Every event
carries the Seat as actor. M22 adds **relationships between Seats' authorities**; it does not touch what a Seat
*is*.

### 5.2 The Fence is the ceiling a delegation cannot exceed

The effective-capability rule from the security model — `charter ∩ work_order_grant ∩ firm_policy ∩
session_grants`, *"Intersection, never union — a Work Order can only narrow, never widen"* — is the exact rule
M22 applies to delegation:

```
delegated authority = delegation.scope  ∩  delegator's current Fence          (never a union)
```

A Seat holding `org.decide` and `fs.read:vault/Sources/**` can delegate any subset of those. It cannot delegate
`org.decide:budget/unbounded` (it does not hold it) — that grant is refused at grant time, default deny. If the
delegator's Fence is later narrowed to remove `org.decide`, every delegation that lent `org.decide` stops
conferring it at the next use, with no edit to the delegation row. This is what makes "scoped authority" a
mechanical fact and not a promise.

### 5.3 Delegation and the "widening requires an Approval Request" rule

The security model already says: *"Widening requires an Approval Request from the Principal and is recorded as
a Decision."* M22 does not create a back door around that. A delegation cannot widen — it can only transfer a
subset downward. If a Seat needs authority *neither* it *nor* any delegator holds, the path is unchanged: an
Approval Request to the Principal, recorded as a Decision. Delegation is lateral transfer within existing
ceilings, never expansion of them.

---

## 6. Approval-request approver-eligibility state machine

An Approval Request (from the existing `approval_requests` table) moves `pending → granted | denied | expired`.
M22 inserts an **approver-eligibility** evaluation ahead of the `granted` transition. This is where the exit
criterion lives.

```
                          Approval Request in state PENDING
                                       │
                     approve_request(request, approver_seat)
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │  approver-eligibility guard   │  (Broker pre-flight, §9)
                        └──────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────────────┐
        ▼                              ▼                                        ▼
  approver == requester?        approver lacks authority              approver ≠ requester AND
        │                       for this request kind                 holds authority (own Fence
        ▼                       (own Fence ∪ ScopedAuthority)          or via active delegation)
  Deny{self_approval}                  │                                        │
  (STRUCTURAL — before                 ▼                                        ▼
   the Broker effect logic;      Deny{insufficient_authority}          Broker authorize_action
   nothing written; the CHECK                                          (effect-class policy, unchanged)
   would also reject the write)                                                 │
                                                                        write ApprovalResolution
                                                                        (CHECK approver ≠ requester
                                                                         fires here too, §4.4)
                                                                                │
                                                                                ▼
                                                                     request → GRANTED; emit
                                                                     ApprovalResolved(approver actor)
```

`denied` and `expired` are unchanged from the existing table (the Principal or a delegate may deny; the clock
may expire). Only the path to `granted` gains the guard. The order is fixed and unskippable: **self-approval
check first**, then authority, then the Broker, then the write (whose CHECK is the last line).

---

## 7. Persistence, events, and the Markdown mirror

### 7.1 Schema changes — additive, forward-only (migrations `0047`–`0048`)

Two migrations. Both additive; a Firm with no delegations and no second Seat behaves exactly as it did before
M22.

**`0047_delegations.sql`** — the scoped-authority primitive.

```sql
CREATE TABLE delegations (
  id            TEXT PRIMARY KEY,
  delegator_id  TEXT NOT NULL REFERENCES seats(id),
  delegatee_id  TEXT NOT NULL REFERENCES seats(id),
  scope         TEXT NOT NULL,            -- JSON array of capability strings; ⊆ delegator Fence at grant
  granted_at    INTEGER NOT NULL,
  expires_at    INTEGER NOT NULL,         -- REQUIRED; a delegation is always time-boxed (invariant §3.3.3)
  granted_by    TEXT NOT NULL REFERENCES seats(id),
  decision_id   TEXT NOT NULL REFERENCES decisions(id),   -- the grant is a Decision
  revoked_at    INTEGER,
  revoked_by    TEXT REFERENCES seats(id),
  CHECK (delegatee_id <> delegator_id),   -- a Seat cannot delegate to itself (invariant §3.3, structural)
  CHECK (expires_at > granted_at)         -- always strictly time-boxed
);
CREATE INDEX idx_delegations_delegatee ON delegations(delegatee_id) WHERE revoked_at IS NULL;
```

**`0048_approval_resolutions.sql`** — the structural self-approval guard.

```sql
-- Additive column on the existing approval_requests table: which Seat raised the request.
-- Backfilled to the single M21 Seat for all pre-M22 rows (a one-Seat Firm's requester is unambiguous).
ALTER TABLE approval_requests ADD COLUMN requester_seat_id TEXT REFERENCES seats(id);

-- The resolution record. A request is resolved at most once. The CHECK is the structural
-- refusal of self-approval — the exact shape of reviews.reviewer_id <> author, one layer up.
CREATE TABLE approval_resolutions (
  id                TEXT PRIMARY KEY,
  request_id        TEXT NOT NULL UNIQUE REFERENCES approval_requests(id),
  approver_seat_id  TEXT NOT NULL REFERENCES seats(id),
  authority_source  TEXT NOT NULL CHECK (authority_source IN ('own_fence','delegation')),
  delegation_id     TEXT REFERENCES delegations(id),   -- non-null iff authority_source = 'delegation'
  verdict           TEXT NOT NULL CHECK (verdict IN ('granted','denied')),
  decision_id       TEXT NOT NULL REFERENCES decisions(id),
  created_at        INTEGER NOT NULL,
  -- THE EXIT CRITERION, made structural. Mirrors /docs/04-database-design.md reviews:
  --   CHECK (reviewer_id <> (SELECT assigned_to FROM work_orders … ))
  CHECK (approver_seat_id <> (SELECT requester_seat_id FROM approval_requests
                              WHERE approval_requests.id = approval_resolutions.request_id)),
  -- a delegation-sourced resolution must name the delegation it used
  CHECK ((authority_source = 'delegation') = (delegation_id IS NOT NULL))
);
```

No existing column's meaning changes. `requester_seat_id` is the only addition to `approval_requests`, and it
is nullable-then-backfilled so the migration is independently deployable and reversible in the M21→M22 window.

> **Note for AntiGravity on the CHECK subquery.** SQLite evaluates a subquery in a CHECK at row-write time
> against committed state; because `approval_requests.requester_seat_id` is set before an Approval Request can
> be resolved, the subquery is well-defined at resolution-insert time. This is the identical pattern the
> shipped `reviews` CHECK already relies on (`/docs/04-database-design.md`), so it introduces no new database
> assumption. The Broker guard (§9) is the primary refusal; the CHECK is the backstop that fires even if a
> future code path bypasses the guard. Both must be present (ADR-0060) — the acceptance test exercises the
> CHECK directly by attempting a raw insert (AC2).

### 7.2 Domain events

Every event carries the acting `seat_id` as actor and lands on the hash chain (ADR-0002). No chain rewrite —
the actor field ADR-0021 placed at 2.0 is precisely what lets these events distinguish Seats without touching
history.

`DelegationGranted` · `DelegationRevoked` · `DelegationExpired` · `ApprovalResolved` (carries `approver_seat`,
`requester_seat`, `verdict`, `authority_source`) · `SelfApprovalRefused` (carries the requester Seat, the
attempted approver Seat — always equal — and the request; emitted on every structural refusal so the attempt is
never silent) · `DelegationUseSuspended` (a use where an Active delegation conferred nothing because the
delegator's Fence no longer covers the scope).

`SelfApprovalRefused` is deliberately a first-class, audited event. A Seat trying to approve its own request is
exactly the signal the Principal should see — the human-layer analogue of the security model's rule that a
neutralized injection attempt is always surfaced (security model §7).

### 7.3 Vault Markdown mirror (v1 rule — the archive outlives the software)

```
~/Sidra/
└── governance/
    ├── delegations/
    │   └── <delegation-id>.md      delegator Seat, delegatee Seat, scope in plain language, window,
    │                               granting Decision, revocation if any — never a credential
    └── approvals/
        └── <request-id>.md         the ask, who requested (Seat), who resolved (Seat), verdict,
                                    authority source, and — if refused — the SelfApprovalRefused note
```

Written on state transitions, not continuously. A Principal who abandons Sidra OS keeps a readable record of
every delegation ever granted, every approval and who resolved it, and every self-approval that was refused —
proof, in plain language, that no Seat ever approved its own request.

---

## 8. Security

Separation of duties is a *governance* control, and the attack surface is a human (or an agent under a Seat)
trying to give itself authority it should not have or an approval it must not grant. Every mitigation below is
either an application of an existing M3 control or the new structural constraint that is the point of the
milestone.

| Threat | How M22 addresses it |
|---|---|
| **T-SA1 — a Seat approves its own Approval Request** (the primary threat; the exit criterion) | Refused **structurally** in two places: the Broker approver-eligibility guard returns `Deny{self_approval}` before the effect logic and before any write (§9); the `approval_resolutions` CHECK rejects the row even if the guard is bypassed (§4.4). No mode, Review-Intensity setting, "solo" flag, or override relaxes either (GUIDE §3 item 9). Every attempt emits `SelfApprovalRefused`. |
| **T-SA2 — self-approval laundered through delegation** (A→B→A, then A approves "as B") | Refused. The CHECK and the guard key on the *request's requester Seat*, not on the authority source. Whatever chain of delegations produced the approver's authority, if the approver Seat equals the requester Seat, it is refused. Delegation transfers *capability*, never *identity*. |
| **T-D1 — a delegation widens authority** (delegate something the delegator does not hold) | Refused at grant: `scope ⊆ delegator Fence`, intersection never union (security model §4, ADR-0061). Re-checked at use against the delegator's *current* Fence, so a later-widened scope cannot be smuggled in by shrinking then re-granting. |
| **T-D2 — a delegation outlives its purpose** | Every delegation is time-boxed (`expires_at` NOT NULL, invariant §3.3.3) and revocable by the delegator or the Principal. An expired or revoked delegation confers nothing at the next use. There is no perpetual delegation. |
| **T-D3 — a stale delegation confers authority the delegator has since lost** | The use-time re-check (`scope ∩ delegator current Fence`, §4.3) means a delegation confers only what the delegator *still* holds. Fence shrinkage propagates to every delegation immediately, without editing any delegation row (the Suspended verdict, §3.1). |
| **T-D4 — self-delegation to escalate** (a Seat delegates to itself to construct a second authority path) | Structurally impossible: `CHECK (delegatee_id <> delegator_id)` in migration 0047 and the grant guard both refuse it. And even if constructed, it would confer no more than the Seat already holds (intersection), and would not defeat T-SA1 (the requester Seat is unchanged). |
| **T-G1 — bypassing the Broker to resolve an approval** | Resolving an Approval Request is an effectful act routed through `approve_request`, which routes through the Broker. There is no side door (GUIDE §3 item 5); the CHECK backstops any that a defect might create. |
| **T-G2 — an agent under a Seat forges the approver identity** | The approver Seat is the authenticated actor from M21's identity substrate, taken from the session, never from a parameter an agent supplies. An Approval Request cannot be resolved from an untrusted-content Turn (security model §7.3: such Turns hold no effect-class ≥1 tools). |

**The single choke point holds.** Resolving an Approval Request is a tool call that passes
`PermissionBroker::authorize_action`. M22 adds one pre-flight check — approver-eligibility, which contains the
self-approval refusal — *ahead* of the Broker's existing effect-class logic. It removes none, and the database
CHECK sits behind everything as a last line that cannot be reached around.

---

## 9. Authorization path and the approver-eligibility guard (ADR-0060 + ADR-0061 in mechanism)

On `approve_request(approver_seat, request, verdict)`:

1. **Resolve the approver Seat** from the authenticated session (M21 identity). Never from a caller-supplied
   parameter — the acting Seat is who is logged in, not who an agent names.
2. **Self-approval check (structural, first).** Load the request's `requester_seat_id`. If `approver_seat ==
   requester_seat`, deny with `self_approval`, emit `SelfApprovalRefused`, and stop — **before** any authority
   evaluation, before the Broker, and before any write. This is the exit criterion. Nothing is resolved; the
   request stays `pending`. (The database CHECK would also reject a resolution row for this case, but control
   never reaches the write.)
3. **Authority check.** The operation the approval authorizes has an effect class and a required capability.
   The approver Seat must hold that capability in its `ScopedAuthority` (§4.3) — its own Fence, or a live
   delegation whose scope, intersected with its delegator's *current* Fence, still covers it. If not, deny with
   `insufficient_authority`, naming the missing capability. A delegation used here is recorded as the
   `authority_source` on the resolution.
4. **Broker.** Call `authorize_action` with the operation's effect class. The Broker applies the unchanged
   effect-class policy (security model §5), Fences, and revocation. A class-3 resolution is itself subject to
   the standing policy that class-3 always asks.
5. **Write the resolution.** Insert the `approval_resolutions` row. The CHECK (§4.4) fires here as the last
   line. On success, transition the request to `granted`/`denied` and emit `ApprovalResolved` with the approver
   actor on the hash chain, plus the resolution as a Decision.

Steps 2–3 are the *pre-flight* M22 adds. Step 4 is the choke point that already existed. Step 5's CHECK is the
structural backstop. No step is skippable and the order is fixed. **Step 2 is the exit criterion and the last
thing in the acceptance suite to go green.**

On `delegate_authority(delegator_seat, delegatee_seat, scope, expires_at)`:

1. **Self-delegation check.** `delegator ≠ delegatee`, else deny (structural; CHECK also refuses).
2. **Scope check.** `scope ⊆ delegator's current Fence`, else deny `scope_exceeds_fence`, naming the offending
   capability (ADR-0061; default deny — anything not held cannot be lent).
3. **Window check.** `expires_at` strictly in the future.
4. **Record the Decision, write the delegation, emit `DelegationGranted`** on the chain (actor = delegator).

---

## 10. Effect classes and the resolution act (unchanged from the security model)

M22 changes no effect-class semantics. It is worth stating precisely how the existing classes apply to the two
new acts:

| Act | Effect class | Policy |
|---|---|---|
| `delegate_authority` | 2 (reversible governance write) | Auto-allowed within the delegator's Fence; recorded as a Decision; undoable via `revoke_delegation`; the delegation is versioned by the append-only chain |
| `revoke_delegation` | 2 (reversible write) | Recorded; the revocation is itself an event; re-granting is a fresh Decision |
| `approve_request` resolving a class-≤2 operation | inherits the operation's class | Standard effect-class policy; the approver-eligibility guard runs first |
| `approve_request` resolving a class-3 operation | 3 (the underlying operation is irreversible) | **Always** an Approval Request in the first place; the resolution is the answer to it; no standing `always` grant for class 3 (security model §5). The approver-eligibility guard still runs first — a class-3 approval by the requester's own Seat is refused before the class-3 policy is even consulted. |

There is no effect class that lets a Seat resolve its own request — the guard is ahead of effect-class logic
entirely.

---

## 11. Component structure

```
                     approve_request(approver_seat, request, verdict)
                                    │
                                    ▼
             ┌──────────────────────────────────────────────────────────┐
             │              sidra-delegation (kernel, Layer 1)           │
             │                                                           │
             │   EligibilityGuard                                        │
             │     │  1. resolve approver Seat (from M21 session)        │
             │     │  2. self-approval check  ── approver == requester? ─┼──► Deny{self_approval}
             │     │        (STRUCTURAL, first)                          │     emit SelfApprovalRefused
             │     ▼                                                     │
             │   AuthorityResolver                                       │
             │     │  3. ScopedAuthority(approver) ⊇ required cap?       │
             │     │     (own Fence ∪ active delegations ∩ delegator Fence)
             │     ▼                                                     │
             │   DelegationStore ──► Delegation rows, use-time re-check  │
             │     │                                                     │
             └─────┼─────────────────────┬──────────────────────────────┘
                   ▼                     ▼
            PermissionBroker      approval_resolutions (write)
            (sidra-security)      4→ authorize_action    5→ INSERT with CHECK
                   │                     │   approver_seat_id <> requester_seat_id
                   └─────────────────────┴───────────────► GRANTED / DENIED
                                         │
                                         ▼
                              audited ApprovalResolved event (hash chain, ADR-0002)
                              + Decision (authority = delegated | escalated | principal)
```

Internal modules of `sidra-delegation`:

| Module | Responsibility |
|---|---|
| `domain` | `Delegation`, `Scope`, `ScopedAuthority`, value objects; rejects invalid construction |
| `delegation` | grant / revoke / expire; the delegation store; use-time re-check against the delegator's current Fence |
| `eligibility` | the approver-eligibility guard: self-approval check (first), then authority, then hand to the Broker |
| `resolution` | write the `approval_resolutions` row; emit `ApprovalResolved`; record the Decision |
| `events` | the six event variants; hash-chain emission |
| `mirror` | the Vault Markdown mirror writer (on transitions) |
| `conformance` | the acceptance harness, including the structural self-approval-refusal proof (the exit criterion) |

**Dependency direction (ADR-0011).** `packages/domain ← services/delegation ← apps/*`. `services/delegation`
depends on `services/security` (Broker, Fences), `services/store` (the two migrations), and the Seat identity
substrate from M21 (`services/seats` or its equivalent — confirm the crate name against M21's delivery before
importing). It does **not** depend on `services/orchestrator` or `services/mission`; the absence of that edge is
a compile-time property enforced in CI, exactly as the Mission Engine and Connector Framework packages do it.

---

## 12. Public APIs

### 12.1 Commands

| Command | Effect | Notes |
|---|---|---|
| `delegate_authority(delegator, delegatee, scope, expires_at)` → `DelegationId` | grants a delegation | a **Decision** (`authority = delegated`); refused if `scope ⊄ delegator Fence`, if `delegator == delegatee`, or if `expires_at` not in the future |
| `revoke_delegation(delegation)` | Revoked | delegator Seat or Principal; effective immediately; emits `DelegationRevoked` |
| `approve_request(approver_seat, request, verdict)` → `Result` | resolves an Approval Request | the §9 path; returns `self_approval` / `insufficient_authority` / `fenced` / `ok`; **structural self-approval refusal is first**, before the Broker and before any write |

### 12.2 Queries

| Query | Returns |
|---|---|
| `list_delegations_from(seat)` | delegations this Seat has granted, with scope, window, status |
| `list_delegations_to(seat)` | delegations this Seat has received (its borrowed authority) |
| `scoped_authority(seat)` | the effective capability set (own Fence ∪ live, in-Fence delegated scopes) |
| `approval_resolution(request)` | who resolved a request, verdict, authority source — or `unresolved` |
| `eligible_approvers(request)` | the Seats that *could* resolve this request (holds the authority, and ≠ the requester) — never includes the requester Seat |

### 12.3 API rules

1. **No API resolves a request whose requester Seat equals the approver Seat.** `approve_request` refuses it
   structurally; `eligible_approvers` never returns the requester Seat. This is not a filter that can be turned
   off — it is the guard plus the CHECK.
2. **The approver Seat is the authenticated session Seat, never a parameter.** An agent cannot name a different
   Seat as the approver.
3. **`delegate_authority`, `revoke_delegation`, and every resolution are Decisions** — logged on the hash
   chain, with the scope shown in plain language before the act (the approval-UX contract, security model §6).
4. **No API returns authority a Seat does not currently hold.** `scoped_authority` reflects live delegations
   intersected with delegators' current Fences — it is a computed view, never a cached grant that outlives its
   bound.

---

## 13. Sequence diagrams

### 13.1 The exit-criterion path — a Seat tries to approve its own request (refused structurally)

```
Seat-A (requester)     EligibilityGuard        approval_requests / _resolutions
   │ (earlier) an agent under Seat-A raised request q (requester_seat_id = A)
   │
   │ approve_request(approver = A, q, "granted")
   ├─────────────────────────►│ resolve approver Seat = A (from session)
   │                          │ load q.requester_seat_id = A
   │                          │ approver A  ==  requester A  ?  YES
   │◄── Deny{self_approval} ──┤ emit SelfApprovalRefused(requester=A, attempted_approver=A, q)
   │                          │
   │  (nothing evaluated for authority, nothing sent to the Broker, nothing written —
   │   the refusal is STRUCTURAL, before the Broker; and had control reached the write,
   │   the approval_resolutions CHECK  approver_seat_id <> requester_seat_id  would
   │   reject the INSERT. Two independent refusals; neither is a togglable policy.)
```

### 13.2 A valid cross-Seat delegation, then a cross-Seat approval (the happy path)

```
Seat-A (delegator)   DelegationStore   Seat-B (delegatee)   EligibilityGuard   Broker   _resolutions
   │ delegate_authority(A→B, scope={org.decide:approve/spend}, expires=+7d)
   ├────────────────►│ scope ⊆ A's Fence?  yes                 │                │        │
   │                 │ A ≠ B?  yes ;  expires in future?  yes   │                │        │
   │                 │ record Decision; write Delegation; emit DelegationGranted │        │
   │◄── DelegationId ┤                                         │                │        │
   │                                                           │                │        │
   │        (later) an agent under Seat-A raises request q (requester_seat_id = A, a spend)
   │                                                           │                │        │
   │                              Seat-B: approve_request(approver = B, q, "granted")     │
   │                                        ├─────────────────►│ approver B == requester A?  NO
   │                                        │                  │ B holds org.decide:approve/spend?
   │                                        │                  │   via delegation A→B, and
   │                                        │                  │   scope ∩ A's CURRENT Fence still covers it?  yes
   │                                        │                  ├── authorize_action(effect=class of q) ──►│
   │                                        │                  │◄──────────── Allow ──────────────────────┤
   │                                        │                  │ INSERT resolution(approver=B, source=delegation,
   │                                        │                  │   delegation_id=…)  — CHECK B<>A passes  ►│
   │                                        │◄── granted ──────┤ emit ApprovalResolved(approver=B, requester=A)
   │                                        │                  │ record Decision (authority = delegated)  │
```

### 13.3 A delegation that tries to widen authority (refused at grant)

```
Seat-A (delegator)          DelegationStore
   │ delegate_authority(A→B, scope={org.decide:budget/unbounded}, expires=+7d)
   ├───────────────────────►│ scope ⊆ A's Fence ?
   │                        │   A holds org.decide but NOT org.decide:budget/unbounded
   │◄── Deny{scope_exceeds_fence: org.decide:budget/unbounded} ┤
   │  (default deny — a Seat cannot delegate what it does not hold; nothing written, no Decision recorded)
```

---

## 14. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | A Seat invokes `approve_request` on its own request | `Deny{self_approval}` at §9 step 2, before the Broker; `SelfApprovalRefused` emitted; request stays `pending` (exit criterion) |
| F2 | A code path bypasses the guard and attempts to write a self-resolution | The `approval_resolutions` CHECK rejects the INSERT; the transaction fails; no resolution row exists (the structural backstop, AC2) |
| F3 | A Seat delegates a capability it does not hold | `Deny{scope_exceeds_fence}` at grant, naming the capability; nothing written (T-D1) |
| F4 | A delegator's Fence is narrowed after a delegation was granted | At the next use, the delegation confers only `scope ∩ delegator's current Fence`; the now-uncovered part confers nothing; `DelegationUseSuspended` emitted; delegation row unchanged (T-D3) |
| F5 | A delegation expires mid-decision | The use-time check finds `now ≥ expires_at`; the delegation confers nothing; the approver falls back to own-Fence authority or is denied `insufficient_authority` |
| F6 | Seat A delegates to B, B delegates back to A, A approves A's own request | Refused: the CHECK and guard key on the requester Seat (A), not the authority source; `self_approval` (T-SA2) |
| F7 | An agent supplies a forged approver Seat id as a parameter | Ignored: the approver Seat is the authenticated session Seat (M21), never a parameter (T-G2) |
| F8 | A revoked delegation is used | The store finds `revoked_at` set; the delegation confers nothing; the approver is evaluated on remaining authority only |
| F9 | Two Seats race to resolve the same request | `approval_resolutions.request_id` is `UNIQUE`; the second write fails; the request is resolved exactly once |
| F10 | A one-Seat Firm (no second Seat yet) raises and needs to resolve a request | With one Seat, `eligible_approvers` is empty and self-approval is refused — the request escalates to the Principal exactly as pre-M22; separation of duties is not silently waived (the refusal is the point, not a bug) |

---

## 15. Performance

- **The guard is O(1) plus a bounded delegation scan.** The self-approval check is a single equality on two
  Seat ids. The authority check scans the requesting Seat's active delegations (indexed by delegatee,
  `WHERE revoked_at IS NULL`); the count is bounded by how many Seats have lent to this one — small by
  construction in a Firm of colleagues.
- **No delegation or resolution blocks the scheduler.** Both are governance writes handled outside the Mission
  scheduler's hot path; the Mission Engine's scheduling determinism (M15) is untouched because approval
  resolution was always an out-of-band act the Mission waits on.
- **The CHECK subquery is a single indexed lookup** by `approval_requests.id` (the primary key) at
  resolution-write time — the same cost profile as the shipped `reviews` CHECK.
- **Delegation expiry is lazy, evaluated at use, not by a sweeper.** A delegation does not need a background
  job to expire; the use-time check reads `expires_at`. An optional periodic `DelegationExpired` emitter is a
  cosmetic audit convenience, off the hot path, and never a correctness dependency.

---

## 16. Why the refusal is structural, not advisory (the milestone's whole point)

The exit criterion says the refusal must be *structural, not advisory*. This section states exactly what that
means mechanically, because it is the one claim the whole package must earn:

1. **Two independent enforcement points, neither in advisory code.** The Broker guard (§9 step 2) and the
   database CHECK (§4.4). An advisory control is one that lives in a prompt, a lint, or a single `if` a future
   refactor can delete. M22 has neither as its *only* line: the CHECK fires at the database regardless of what
   the application code does.
2. **No mode, setting, or override reaches it.** GUIDE §3 item 9 is explicit: *"No mode, no setting, no
   performance optimisation may relax this. Review Intensity changes how much review, never whether."* There is
   no `allow_self_approval` flag, no "solo operator" mode, no Review-Intensity level that turns it off. The
   acceptance suite includes a test (AC3) that scans for any configuration key that could disable the guard and
   fails the build if one exists (a CI assertion mirroring the "no `if department ==`" grep).
3. **The proof is a constraint/guard rejection, not a policy result.** The exit-criterion test (AC2) does two
   things a policy check could not satisfy: it asserts the Broker guard returns `Deny{self_approval}` *before*
   the Broker's effect logic runs, and it attempts a **raw INSERT** of a self-resolution and asserts the
   database CHECK rejects it. A togglable policy would pass the first and fail the second; a structural refusal
   passes both. That asymmetry is the exact difference between advisory and structural, and it is what the test
   encodes.

This is the same standard ADR-0008 held for agents — the orchestrator *refuses* to mark a Deliverable reviewed
if `reviewer_id == author_id`, and the `reviews` CHECK backs it in the schema. M22 holds Seats to that
identical standard.

---

## 17. Acceptance criteria

The exit criterion decomposed into testable claims. **These are the contract with AntiGravity.**

| # | Claim | Proven by |
|---|---|---|
| AC1 | An Approval Request records its requester Seat; a resolution records its approver Seat; both are the authenticated Seats, never parameters | resolution-provenance test asserting the approver equals the session Seat, not a supplied id |
| AC2 | **A Seat's own Approval Request cannot be self-approved — the refusal is structural.** The Broker guard returns `Deny{self_approval}` before the effect logic, **and** a raw INSERT of a self-resolution is rejected by the `approval_resolutions` CHECK | the exit-criterion test (§13.1): a guard-rejection assertion *and* a direct constraint-violation assertion — the last thing to go green |
| AC3 | No mode, setting, Review-Intensity level, or override can disable the self-approval refusal | CI assertion scanning for any config key toggling the guard; build fails on a hit (mirrors GUIDE §3 item 9) |
| AC4 | Self-approval attempted via a delegation chain (A→B→A) is still refused | test constructing the chain, asserting `self_approval` because the CHECK/guard key on the requester Seat |
| AC5 | A delegation whose scope exceeds the delegator's current Fence is refused at grant, naming the capability | grant-refusal test over an over-broad scope (T-D1) |
| AC6 | A delegation confers only `scope ∩ delegator's current Fence` at use; a delegator's Fence shrinking narrows every delegation it granted, with no row edit | Fence-shrink test asserting `DelegationUseSuspended` and reduced conferred authority (T-D3) |
| AC7 | Every delegation is time-boxed; an expired or revoked delegation confers nothing | expiry test (forced clock) and revoke test asserting zero conferred authority afterwards |
| AC8 | A valid cross-Seat approval succeeds: a different Seat holding the authority (own Fence or live delegation) resolves the request, and the resolution names its authority source | happy-path test (§13.2) asserting `granted`, `ApprovalResolved(approver ≠ requester)`, and `authority_source` |
| AC9 | A Seat cannot delegate to itself | grant-refusal test and a direct INSERT asserting the `delegatee_id <> delegator_id` CHECK (T-D4) |
| AC10 | Every delegation grant/revoke/expire and every approval resolution (including every refusal) is an audited event on the hash chain | `audit.verify` over a delegation-and-approval lifecycle fixture; asserts `SelfApprovalRefused` present for each refusal (AC10) |
| AC11 | A one-Seat Firm behaves exactly as pre-M22: no delegations, requester Seat backfilled, self-request escalates to the Principal | additive-migration test asserting identical behaviour with a single Seat |
| AC12 | The subsystem contains no Seat-specific identifier, and `services/delegation` has no dependency edge to `services/orchestrator` or `services/mission` | CI grep (no `if seat == "…"`) and dependency-direction check; build fails on a hit |

---

## 18. Dependencies, assumptions, risks

### 18.1 Dependencies

| On | For |
|---|---|
| M21 — Seats and Identity | the Seat as delegator/delegatee/requester/approver; the authenticated session Seat; per-Seat Fence |
| M3 — Permission Broker, Fences, default deny | the choke point the guard sits ahead of; the Fence a delegation cannot exceed; intersection-never-union |
| M2 — event log / hash chain (ADR-0002) | audited delegation and resolution events with the Seat actor; no chain rewrite |
| decision engine (`/docs/03-decision-engine.md`) | a delegation grant and every resolution are logged Decisions; `authority = delegated` |
| existing `approval_requests` / `reviews` schema (`/docs/04-database-design.md`) | the table M22 extends additively; the `reviews` CHECK is the structural precedent M22 copies |

### 18.2 Assumptions

1. **M21 shipped a per-Seat Fence and an authenticated session Seat.** M22 delegates *within* and *between*
   those Fences and reads the acting Seat from the session. If M21's Fence is coarser than assumed, the scope
   check degrades gracefully (a coarser Fence simply admits or refuses at a coarser granularity) but the
   self-approval refusal is unaffected — it keys only on Seat identity, which M21 guarantees. Confirm the
   Seat-Fence API against M21's delivery before implementing E3.
2. **`approval_requests` exists and is writable additively.** The `requester_seat_id` column is added and
   backfilled to the single M21 Seat; if M21 already added a Seat dimension to `approval_requests`, E5 uses it
   instead of adding a duplicate — confirm before writing migration 0048.
3. **Exactly-once resolution is acceptable in this release.** A request is resolved by one Seat; multi-party /
   quorum approval (N-of-M Seats) is out of scope and would need its own ADR. The `UNIQUE(request_id)`
   constraint encodes the single-resolver assumption.

### 18.3 Risks

| # | Risk | Mitigation |
|---|---|---|
| DR-1 | The self-approval refusal is implemented only in application code and a refactor removes it | Two enforcement points; the CHECK is in the schema and cannot be refactored away without a migration; AC2 tests the CHECK directly, AC3 forbids a disabling config |
| DR-2 | A delegation becomes a de-facto permanent grant nobody re-examines | `expires_at` NOT NULL and strictly future (invariant §3.3.3); use-time re-check; revocation is a first-class act |
| DR-3 | Delegation is used to launder a self-approval | CHECK/guard key on the requester Seat, not the authority source (T-SA2, AC4) |
| DR-4 | A shrunk delegator Fence leaves stale conferred authority | Use-time intersection with the delegator's *current* Fence; `DelegationUseSuspended` audited (T-D3, AC6) |
| DR-5 | Migration breaks a pre-M22 Firm | Forward-only, additive; `requester_seat_id` nullable-then-backfilled; independently deployable; null delegations = pre-M22 behaviour (AC11) |
| DR-6 | The subsystem accretes Seat-specific logic | CI grep for Seat ids in the crate fails the build (G9, AC12) |

---

## 19. Testing strategy

- **The exit-criterion test is the spine (AC2).** It has two halves that must *both* pass: a guard-level
  assertion (`approve_request` on one's own request returns `Deny{self_approval}` before the Broker) and a
  schema-level assertion (a raw `INSERT INTO approval_resolutions` with `approver_seat_id = requester_seat_id`
  is rejected by the CHECK). A test that only exercises the guard would pass against an advisory implementation
  and is therefore insufficient; the raw-INSERT half is what proves *structural*.
- **Property tests over `ScopedAuthority`.** For any Seat, delegation set, and Fence, the conferred authority
  is always ⊆ (own Fence ∪ each delegator's current Fence) — never a strict superset. A generated
  counter-example is a milestone-blocking bug.
- **Delegation-chain adversarial tests (AC4).** Enumerate short delegation chains (A→B, A→B→A, A→B→C→A) and
  assert that in every case where the approver Seat equals the requester Seat, the resolution is refused.
- **Fence-mutation tests (AC6).** Grant a delegation, shrink the delegator's Fence, assert the delegation
  confers less at the next use with no edit to its row.
- **Additive-migration tests (AC11).** A one-Seat fixture behaves identically before and after the 0047/0048
  migrations; the backfill sets `requester_seat_id` to the single Seat.
- **Audit-chain tests (AC10).** `audit.verify` over a full lifecycle (grant → use → refuse → revoke → expire)
  confirms every act is on the chain and every refusal emitted `SelfApprovalRefused`.

---

## 20. CI requirements

| # | Check | Fails the build when |
|---|---|---|
| CI-1 | **Self-approval-refusal cannot be disabled** | any configuration key, feature flag, mode, or Review-Intensity level is found that could toggle the approver-eligibility guard off (AC3; the mechanical expression of GUIDE §3 item 9) |
| CI-2 | The `approval_resolutions` CHECK exists in the committed schema | the migration is present but the `approver_seat_id <> requester_seat_id` CHECK is absent or altered |
| CI-3 | No Seat-specific identifier in the crate | a `if seat == "…"` or a hardcoded Seat id appears in `services/delegation` (G9, mirrors GUIDE §3 item 12) |
| CI-4 | Dependency direction | an edge `services/delegation → services/orchestrator` or `→ services/mission` exists (AC12) |
| CI-5 | The exit-criterion test runs and its raw-INSERT half is present | the constraint-rejection assertion is missing (a guard-only test is not sufficient proof of *structural*) |

CI-1 and CI-5 together are what turn "the refusal is structural, not advisory" from a claim into a build gate.

---

## Appendix A — Glossary additions

- **Seat** — a human identity with its own Fence, budget, and working memory (ADR-0021). The unit between which
  authority is delegated and by which an Approval Request is requested and resolved.
- **Delegation** — a scoped, time-boxed, logged grant of a *subset* of one Seat's Fence to another Seat.
  Confers at use only `scope ∩ delegator's current Fence`. Never widens authority.
- **Scoped authority** — the effective capability set a Seat holds: its own Fence, unioned with each live
  delegation's scope intersected with that delegation's delegator's current Fence.
- **Approver-eligibility guard** — the kernel pre-flight, ahead of the Permission Broker, that refuses a
  self-approval structurally and then checks the approver holds the authority.
- **Structural refusal** — a refusal enforced by a schema constraint and/or a choke-point guard that no mode,
  setting, or override can relax — as opposed to an *advisory* refusal that lives in a prompt or a togglable
  policy. The exit criterion demands the structural kind.
- **Self-approval refusal** — the invariant that a Seat cannot resolve its own Approval Request; the human-layer
  analogue of ADR-0008's author ≠ reviewer, enforced the way `reviews.reviewer_id <> author` is.

## Appendix B — Repository placement

```
services/
└── delegation/                 NEW — crate sidra-delegation
    ├── domain
    ├── delegation
    ├── eligibility
    ├── resolution
    ├── events
    ├── mirror
    └── conformance

services/store/migrations/      EXTENDED — 0047_delegations.sql, 0048_approval_resolutions.sql (forward-only)

infrastructure/testing/
└── delegation/                 NEW — the exit-criterion proof (guard + raw-INSERT halves),
                                delegation-chain adversarial tests, Fence-mutation tests, additive-migration
                                tests, audit-chain tests

infrastructure/ci/              EXTENDED — CI-1 (no disabling config), CI-3 (no Seat id), CI-4 (dep direction),
                                CI-5 (exit-criterion raw-INSERT present)
```

Dependency direction (ADR-0011): `packages/domain ← services/delegation ← apps/*`. `services/delegation`
depends on `services/security`, `services/store`, and the M21 Seat substrate; it does **not** depend on
`services/orchestrator` or `services/mission`.

## Appendix C — Implementation position

M22 is the second milestone of 3.0 "Chambers". It depends strictly on M21 (Seats): there is no self-approval
question and no delegation without more than one Seat, and no Seat-to-Seat relationship without the Seat
identity M21 ships. Building M22 before M21 would mean enforcing separation of duties over an identity that
does not yet exist — which is why the registry lists M21 as M22's sole dependency
(`/MILESTONE_REGISTRY.md` §4).

The milestone is small on purpose. It adds two records, one guard, and one CHECK. Its weight is entirely in the
*structural* standard the exit criterion holds it to: the refusal of self-approval must be as un-turn-off-able
as the `reviews` CHECK that has enforced author ≠ reviewer since 1.0. ADR-0008 promised this would scale to the
human layer "without redesign — the same rule at a different layer." M22 is that promise kept.

**Exit criterion.** A Seat's own Approval Request cannot be self-approved; the refusal is structural, not
advisory — proven by a constraint/guard rejection test, not a togglable policy (AC2).
