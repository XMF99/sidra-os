# Seats and Identity — Architecture

**Milestone M21 · Release 3.0 "Chambers" · The human layer becomes plural**

| | |
|---|---|
| Milestone | M21 — Seats and Identity (`/MILESTONE_REGISTRY.md` §4, 3.0 "Chambers") |
| Release | 3.0 "Chambers" — the Firm admits colleagues (M21 is its **first** milestone) |
| Layer | Cuts across Layer 1 (kernel identity, Fences, budgets, memory) — introduces no new layer |
| New crate | `sidra-seats` at `services/seats/` |
| Depends on | **M2** (event log & hash chain), **ADR-0021** (Seats defined in 2.0, one shipped), M3 (Permission Broker, capability model), M5 (budget ceilings, ADR-0020), M6 (memory namespaces) |
| Realizes | ADR-0021 — the decision that put `events.actor` in the chain at 2.0 precisely so this milestone rewrites nothing |
| Status | Documented (this package) · implementation Open |
| Exit criterion | A second Seat is created; every event distinguishes the two; **no historical event is rewritten** — proven by a hash-chain integrity assertion over the pre-existing events, not by configuration |

> **Authoritative precedence.** Where this document disagrees with `/docs/07-security-model.md`, the security
> model governs the capability grammar, default-deny, and the single-Broker choke point. Where it disagrees
> with `/docs/04-database-design.md` about the `events` table, the `actor` column, or `budget_ledger`, that
> document governs — this architecture adds tables and one index and **repurposes no column**. Where it
> disagrees with `/docs-v2/adr/0021-seats-defined-in-2-shipped-in-3.md` about what a Seat is and why the
> chain already carries an actor, ADR-0021 governs; this architecture is its realization, not its revision.
> This document *extends* those boundaries; it never re-decides them.

---

## 1. Why this subsystem exists

### 1.1 The problem

Through M20 the Firm has exactly one human in it. Every Directive, every Approval, every Principal edit, every
capability grant carries the actor value `'principal'` (`/docs/04-database-design.md` §4, `events.actor`
`-- agent id | 'principal' | 'system'`). The whole enterprise model — twenty-one departments, four Offices,
the Mission Engine — coordinates the work of *agents*, but authority still flows from a singleton human, and
the system has no vocabulary for a second colleague. Sidra Systems is a company. Companies have more than one
person. The mission statement has been implying colleagues since 2.0 and the software has been shipping exactly
one (ADR-0021, "honesty about the mission gap").

The requirement is not "add a users table." A users table bolted onto a hash-chained, single-actor audit log
is the exact trap ADR-0021 was written to avoid: *"Adding a second actor later means adding an actor field to a
hash-chained log — which is not a schema migration, it is a chain that has to be rewritten, and a hash chain
you have rewritten is a hash chain that has lost its point."* The requirement is: **admit a second human
identity such that every event already distinguishes who acted, the second identity has its own capability
ceiling and its own budget and its own working memory, one identity cannot read or spend or act as another,
and not one byte of the existing chain is touched.** The payoff of ADR-0021 is that this is *possible* — the
actor field has been on every event since 2.0. M21 is the machinery that spends that preparation.

### 1.2 The stance

Three commitments define this milestone, and each has an ADR:

1. **A Seat is a first-class human identity, distinct from an agent, keyed on the existing `actor` field.**
   (ADR-0057) A Seat is a colleague admitted to the Firm — a human. It is not an agent, not a Role Archetype,
   not an Agent Instance. The one Seat that has existed since 2.0 is the founding Seat, and it is **bound** to
   the pre-existing actor sentinel `'principal'`; a second Seat gets a fresh Seat identity and a fresh actor
   value. Because the binding is a projection layered *over* the actor strings already in the chain, admitting
   a second Seat writes new events and rewrites none.
2. **A Seat's Fence and budget nest under the firm ceilings and are enforced by the one Broker that already
   exists.** (ADR-0058) Each Seat has a per-Seat Fence — its capability ceiling, default-deny — and a per-Seat
   budget ceiling that nests under the firm monthly ceiling exactly as the department ceiling does (ADR-0020,
   "cost follows the requester"). Both are enforced by the single Permission Broker (`/docs/07-security-model.md`
   §4). M21 adds a Seat-scoped intersection term ahead of the Broker's existing effect-class logic; it does
   not add a second choke point.
3. **Each Seat has its own working-memory namespace, isolated like a department boundary but at the human
   layer.** (ADR-0059) A Seat's private working memory — the drafts it is composing, its private-lane
   observations, its scoped preferences — lives in a namespace only that Seat may read. Isolation is
   default-deny and enforced by the same capability model: `mem.read:seat/<id>/**` is a capability a Seat holds
   only for its own namespace. One Seat reading another Seat's working memory is a `fenced` denial, not a policy
   footnote.

### 1.3 What this subsystem is, mechanically

`sidra-seats` is **kernel machinery (Layer 1)**. A Seat is not a Layer-3 department or a Layer-4 agent; it is a
human-identity primitive that sits alongside the actor field, the Fence model, the budget ledger, and the
memory namespaces the kernel already owns. This parallel is deliberate and load-bearing: it means M21
introduces *no new trust mechanism*. It reuses the hash-chained event log (M2, ADR-0002), the capability model
and Permission Broker (M3), the nested budget ceilings (M5, ADR-0020), and the memory-namespace machinery (M6).
The novelty is entirely in a new *subject of authority* — a human that is no longer a singleton — expressed in
terms the kernel already understands.

```
Layer 1  sidra-seats        ← the identity machinery: Seat records, Fences, budgets, memory namespaces  (M21, THIS DOC)
Layer 1  events.actor       ← UNCHANGED — the column ADR-0021 placed here in 2.0; M21 binds Seats to it
Layer 1  PermissionBroker   ← UNCHANGED choke point; M21 adds a Seat-scoped pre-flight term
```

### 1.4 What this subsystem must never become

- **A history rewrite.** No API, migration, or code path in M21 issues an `UPDATE` or `DELETE` against `events`,
  against any historical row's `actor`, or against the hash chain. Admitting a Seat is *append-only*: new
  `Seat*` events on the chain, new rows in additive tables. The exit criterion is a hash-chain integrity
  assertion proving this structurally (AC3). A design that needs to backfill `actor` on old rows has
  misunderstood ADR-0021 and must be rejected.
- **A second Broker.** The temptation is a "Seat authorization service" that decides what a Seat may do. There
  is one choke point (`/docs/07-security-model.md` §4). M21 adds a Seat-scoped *intersection term* to the
  effective-capability computation the Broker already performs — `effective = charter ∩ work_order_grant ∩
  firm_policy ∩ session_grants ∩ seat_fence`. It adds no parallel decision path. A connector call, a Directive,
  an Approval — all still pass the same `authorize_action`.
- **A Seat that is really an agent.** A Seat is a human. It has no charter, no Role Archetype, no KPIs, no
  autoscaling, no Turns of its own. It *originates* work (Directives, Approvals) and *bounds* work (its Fence,
  its budget), but it does not *do* work — agents do. Conflating the two would put a human in the org chart's
  delivery line and an agent in the authority seat, and both are category errors. The domain model (§4) keeps
  `seats` and `agents` in separate tables with no shared identifier space.
- **Delegation.** M21 is identity + isolation. It does **not** ship cross-Seat delegation, separation of
  duties, or "Seat A may act for Seat B" — those are M22, and shipping them here would collapse the very
  boundary M21 exists to establish. A Seat in M21 acts only as itself. Self-approval prohibition and delegation
  are explicitly out of scope (§16.2).

### 1.5 Relationship to ADR-0021 and existing concepts

M21 is the sole realization of ADR-0021's Option 3. ADR-0021 committed 2.0 to four things (§Decision): every
event carries a Seat ID; every Fence, budget, and working-memory scope is expressed against a Seat; the org
graph knows authority flows from a Seat rather than a singleton; and exactly one Seat exists with no interface
to create a second. M21 delivers the fifth thing ADR-0021 deferred: *"3.0 adds Seat creation, per-Seat Fences
and budgets in the UI, cross-Seat delegation, and separation of duties."* M21 takes the first three of those
(creation, Fences, budgets — plus working memory) and leaves delegation and separation of duties to M22, per
the release table (`/MILESTONE_REGISTRY.md` §4).

| Existing concept | How M21 relates |
|---|---|
| `events.actor` (M2, `/docs/04-database-design.md` §4) | The column ADR-0021 placed in 2.0. **Unchanged.** M21 binds each Seat to an actor value; the founding Seat binds to the pre-existing `'principal'` sentinel, so historical rows already distinguish it with no rewrite. |
| Hash chain (M2, ADR-0002) | `Seat*` events append to the existing chain and verify under `audit.verify` exactly like every other event. M21 adds no second log and re-hashes nothing. |
| Permission Broker & capability model (M3, security §4) | A Seat's Fence is one more intersection term in the Broker's effective-capability computation. The single choke point is preserved (ADR-0058). |
| Budget ceilings (M5, ADR-0020) | The per-Seat ceiling is an attribution-and-containment ceiling nesting under the firm month, orthogonal to the department ceiling exactly as ADR-0020's department ceiling is orthogonal to the engagement chain. "Cost follows the requester" becomes "cost follows the originating Seat". |
| Memory namespaces (M6, memory §7 private lanes, §2 working) | A Seat namespace isolates a human's private working memory the way a department namespace isolates a department's — same mechanism, human-layer subject. |
| `preferences` (`/docs/04-database-design.md` §7) | Global-keyed today. M21 introduces Seat-scoped preference keys; the founding Seat inherits every existing global key so pre-M21 behaviour is preserved. |
| Agents (`/docs/04-database-design.md` §3) | A Seat is **not** an agent. Separate table, separate identifier space, no `reports_to`, no `charter`, no version history of the agent kind. The org chart's line authority still flows Principal → Kai → Divisions; a Seat is a human occupying the Principal role, now potentially more than one. |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | A second Seat can be created as a logged, append-only act | ADR-0057; `create_seat` emits `SeatCreated` on the chain; no historical row touched |
| G2 | Every event distinguishes which Seat acted | `events.actor` carries the Seat's actor value; the founding Seat binds to `'principal'`; per-Seat timeline query (§11) |
| G3 | **No historical event is rewritten** — structurally, not by policy | ADR-0057; append-only invariant (§3.3); hash-chain integrity assertion over the pre-existing prefix (AC3, §13.3) |
| G4 | Each Seat has a capability ceiling, default-deny | ADR-0058; `seat_fences`; Broker intersection term (§8); a Seat with no Fence grant can do nothing |
| G5 | Each Seat has a budget ceiling nesting under the firm month | ADR-0058; `seat_budgets`; ledger scope `seat:<id>`; containment consistent with ADR-0020 (§9) |
| G6 | Each Seat has an isolated working-memory namespace | ADR-0059; `seat_working_memory`; `mem.*:seat/<id>/**` scoping (§10) |
| G7 | One Seat cannot read, spend, or act as another | §7 threat table; default-deny isolation; every cross-Seat access is a `fenced` denial |
| G8 | The founding Seat and a single-Seat Firm behave exactly as pre-M21 | §11.1; founding Seat binds to `'principal'`, inherits global preferences and the firm ceiling; null second-Seat = pre-M21 |
| G9 | The single Broker choke point is preserved | ADR-0058; no second authorization path; Seat Fence is an intersection term, not a parallel decision |
| G10 | Everything is additive | §11 forward-only migrations 0042–0046; `events.actor` unchanged; a Firm that never creates a second Seat is bit-for-bit pre-M21 in behaviour |

---

## 3. Seat lifecycle

### 3.1 States

A Seat is admitted, activated, and — because a colleague can leave — suspended or retired, without any of those
acts rewriting history. Every transition is an appended event.

```
        invite (an admitting Seat performs a logged act; capabilities in that Seat's Fence)
  ──────────────────────────────────────────────►  INVITED
                                                       │  accept (identity confirmed; actor value assigned)
                                                       ▼
                                                    CREATED ────────────────┐
                                                       │  provision          │  (Fence + budget + memory
                                                Fence/budget/memory set      │   namespace provisioned)
                                                       ▼                     │
                                                    ACTIVE ◄─────────────────┘
                                                       │   │
                                       suspend (revoke │   │ resume (restore Fence)
                                        active Fence)  │   │
                                                       ▼   │
                                                   SUSPENDED
                                                       │  retire (Fence emptied; namespace sealed)
                                        retire ────────┤
                                                       ▼
                                                    RETIRED   ← terminal; identity & history preserved, never deleted
```

The founding Seat is a special case: it is **not** created through `invite`/`accept`. It is *materialized* at
M21 migration time in state `ACTIVE`, bound to the pre-existing `'principal'` actor value, with its Fence
seeded from the firm policy and its budget seeded from the existing firm ceiling. It never passes through
`INVITED` because it predates the interface (ADR-0021: "there is no interface for creating a second").

### 3.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | `materialize_founding` | Active | runs once, at migration; binds to `'principal'`; refused if a founding Seat already exists |
| — | `invite` | Invited | performed by an Active Seat whose Fence permits `org.admit`; display name unique |
| Invited | `accept` | Created | a fresh actor value assigned, provably distinct from every existing actor value (§5.3) |
| Invited | `withdraw` | Retired | invitation rescinded before acceptance; no Fence/budget/memory ever provisioned |
| Created | `provision` | Active | Fence set (⊆ admitting Seat's Fence), budget ceiling set (≤ remaining firm headroom), memory namespace created |
| Active | `set_fence` | Active | new Fence ⊆ admitting authority; a Seat cannot widen its own Fence (§8.3) |
| Active | `set_budget` | Active | new ceiling keeps Σ Seat ceilings ≤ firm month (§9.2) |
| Active | `suspend` | Suspended | active Fence emptied to default-deny; budget frozen; in-flight work of that Seat is fenced at the next Broker check |
| Suspended | `resume` | Active | Fence restored from its last active value; budget unfrozen |
| Active \| Suspended | `retire` | Retired | Fence emptied permanently; working-memory namespace sealed read-only; identity retained |

### 3.3 Invariants

1. **Append-only over history.** No transition issues an `UPDATE` or `DELETE` against `events` or against any
   historical row's `actor`. Every transition appends a `Seat*` event to the chain (§11.2). This is the
   milestone's defining invariant and the exit criterion tests it directly (AC3).
2. **One founding Seat, bound to `'principal'`.** Exactly one Seat carries `is_founding = 1` and
   `actor_value = 'principal'`. `materialize_founding` is refused if one already exists. This is what makes the
   entire pre-M21 history attributable to a Seat without a single row being rewritten.
3. **Actor values are distinct and permanent.** No two Seats share an actor value, and a Seat's actor value is
   assigned once at `accept` and never changes — because the actor value is what already appears (or will
   appear) in the immutable chain (§5.3).
4. **Retired is terminal; identity is never deleted.** A retired Seat keeps its row, its actor value, its
   sealed namespace, and its entire event history. A colleague who leaves is not erased — their work stays
   attributable. "No hard deletes for records with history" (`/docs/04-database-design.md` §1.3) applies with
   full force to Seats.
5. **A Fence never widens itself.** `set_fence` can only produce a Fence that is a subset of the admitting
   Seat's authority; a Seat cannot escalate its own ceiling (§8.3). Widening is an act by a higher authority,
   recorded as a Decision.

---

## 4. Domain model

### 4.1 Core types

```
SeatId(Ulid)                   // stable identity of a human colleague; ULID (db-design §1.1)
ActorValue(String)             // the string that appears in events.actor; 'principal' for the founding Seat
DisplayName(String)            // human-facing name, unique among non-retired Seats
SeatStatus                     // Invited | Created | Active | Suspended | Retired
Capability(String)             // reused verbatim from the security model §4 grammar
SeatFence(Set<Capability>)     // the per-Seat capability ceiling, default-deny (empty = can do nothing)
BudgetCents(i64)               // reused from budget_ledger
MemoryNamespace(String)        // 'seat/<SeatId>' — the working-memory isolation scope
```

`SeatId` and `AgentId` are **disjoint identifier spaces**. A `SeatId` can never be used where an `AgentId` is
expected and vice versa; the type system enforces the ADR-0057 stance that a Seat is not an agent.

### 4.2 `Seat` — the identity aggregate

The whole human identity in one record.

| Field | Type | Meaning |
|---|---|---|
| `id` | `SeatId` | stable ULID identity |
| `actor_value` | `ActorValue` | what this Seat writes into `events.actor`; `'principal'` iff founding |
| `display_name` | `DisplayName` | human-facing, unique among non-retired |
| `status` | `SeatStatus` | lifecycle state (§3) |
| `is_founding` | `bool` | exactly one Seat is `true`, bound to `'principal'` |
| `invited_by` | `Option<SeatId>` | the admitting Seat (null for the founding Seat) |
| `created_at` | `Timestamp` | when the identity was accepted |
| `retired_at` | `Option<Timestamp>` | set on retire; the row is never deleted |

A `Seat` holds **no** capabilities inline — its Fence is a separate aggregate (§4.3) so a Fence change is its
own logged event and the Seat identity record is stable across Fence churn, mirroring how `agent_versions`
separates the mutable charter from the stable `agents` row (`/docs/04-database-design.md` §3).

### 4.3 `SeatFence` — the per-Seat capability ceiling (ADR-0058)

```
SeatFence {
    seat_id:      SeatId,
    capabilities: Set<Capability>,   // default-deny: absent = denied
    set_by:       ActorValue,        // the admitting Seat — a Decision
    set_at:       Timestamp,
    active:       bool,              // false while Suspended
}
```

The Fence is the Seat's ceiling. A Seat's effective authority for any act it originates is
`seat_fence ∩ firm_policy` — never a union, and never wider than the admitting Seat's Fence at the time of
provision. The Broker consumes it as one intersection term (§8). An empty Fence means the Seat can do nothing —
default-deny is the ground state, exactly as for agents (`/docs/07-security-model.md` §4).

### 4.4 `SeatBudget` — the per-Seat ceiling (ADR-0058, consistent with ADR-0020)

```
SeatBudget {
    seat_id:       SeatId,
    period:        String,          // '2026-07', matching budget_ledger.period
    ceiling_cents: i64,             // this Seat's monthly ceiling
    spent_cents:   i64,             // spend attributed to Engagements this Seat originated
}
```

The per-Seat ceiling nests under the firm monthly ceiling: `Σ over Seats(ceiling_cents) ≤ firm_month_ceiling`.
It is an attribution-and-containment dimension **orthogonal** to the department ceiling (ADR-0020): the
department ceiling contains spend *within a department across Seats*; the Seat ceiling contains spend *by a Seat
across departments*. Both sit under the firm month. Exhaustion **pauses that Seat's originated work** and
raises one Approval Request — it does not stop the Firm and does not silently downgrade the Model Class
(ADR-0020's rule, unchanged). "Cost follows the requester" (ADR-0020) is realized as "cost follows the
originating Seat": an Engagement originated by Seat B spends Seat B's budget, even when a department Seat A also
uses does the work.

### 4.5 `SeatWorkingMemory` — the isolation namespace (ADR-0059)

```
SeatWorkingMemory {
    seat_id:    SeatId,
    namespace:  MemoryNamespace,    // 'seat/<SeatId>'
    sealed:     bool,               // true once the Seat is Retired (read-only)
}
```

The namespace scopes a Seat's private working memory: the drafts it is composing, its private-lane observations
(memory §7), and its Seat-scoped preferences. Access is default-deny: a Seat holds `mem.read:seat/<id>/**` and
`mem.write:seat/<id>/**` **only for its own** namespace. There is no capability grammar that grants a Seat
another Seat's namespace in M21 (that would be delegation — M22). Isolation is therefore structural: the
capability a Seat would need to read another Seat's memory is one it cannot hold.

### 4.6 The `actor` field — the binding that makes the milestone free

`events.actor` is a `TEXT NOT NULL` column that has been on every event since 2.0. M21 does not alter it. It
adds a *binding* — the `Seat.actor_value` field — that maps each Seat to the string it writes. The founding
Seat's binding is `'principal'`, which is the value already stamped on every historical event. Reading "which
Seat produced event E" is a lookup from `E.actor` to the Seat whose `actor_value` matches — a projection
computed at read time, requiring no write to `E`. This single indirection is the whole reason M21 costs a
migration instead of a chain rebuild.

### 4.7 Aggregates and relationships

```
Seat 1 ─────────── 1   SeatFence            (the ceiling; separate so Fence churn does not touch identity)
Seat 1 ─────────── *   SeatBudget           (one per period)
Seat 1 ─────────── 1   SeatWorkingMemory    (the isolation namespace)
Seat 1 ─────────── 1   ActorValue           (unique, permanent; 'principal' iff founding)
ActorValue 1 ───── *   events.actor         (READ-ONLY projection; historical rows never rewritten)
Seat.invited_by  ──►   Seat                  (the admitting Seat; null for founding — a self-rooted forest)

  founding Seat (is_founding=1, actor_value='principal')
        │ invite → accept → provision
        ▼
   second Seat (is_founding=0, actor_value=<fresh ULID-derived value>)

  Seat ✗──✗ Agent   (DISJOINT identifier spaces; a Seat is never an agent — ADR-0057)
```

---

## 5. The actor field and the no-rewrite property

This section is the structural heart of the milestone; the exit criterion lives or dies here.

### 5.1 The pre-existing prefix

At the moment M21 runs, the `events` table holds the Firm's entire history: `seq = 1 … N`, every row carrying
`actor` (mostly `'principal'`, some `agent.*`, some `'system'`) and a hash chained to its predecessor
(`hash = SHA-256(prev_hash ‖ canonical_json(row))`, security §8). Call this the **pre-existing prefix**. The
no-rewrite property is precisely: *after M21 admits a second Seat, the pre-existing prefix is byte-for-byte
identical and its hash chain verifies unchanged.*

### 5.2 Binding, not backfilling

The naïve design adds a `seat_id` column to `events` and backfills it — which rewrites every historical row,
changes every canonical serialization, and breaks every hash from that row forward. That is the chain rebuild
ADR-0021 forbids. M21 does the opposite: it leaves `events` untouched and adds the `Seat.actor_value` binding
in a *separate* table. Attribution is a **join at read time** (`events.actor = seats.actor_value`), never a
write. The founding Seat's `actor_value = 'principal'` means the join already attributes the entire prefix to
the founding Seat, with zero writes to `events`.

### 5.3 A distinct, permanent actor value for the second Seat

When the second Seat is accepted, it is assigned an actor value derived from its `SeatId` (e.g.
`seat:<ULID>`), which is:

- **distinct** from `'principal'`, from `'system'`, from every `agent.*` id, and from every other Seat's actor
  value — checked at `accept` against the full actor namespace (invariant §3.3.3);
- **permanent** — never reassigned, because it is what will appear in the immutable chain from this point
  forward.

From `accept` onward, every event the second Seat originates carries *its* actor value; every event the
founding Seat originates continues to carry `'principal'`. Two Seats, two actor values, and any event
distinguishes them by a column that already existed. That is G2 and the second clause of the exit criterion.

### 5.4 Why this is safe under compaction

Compaction (memory §3, events older than 24 months collapse into daily digests) records the hash range it
replaces so `audit.verify` still passes. Because M21 never rewrites `actor` and never re-hashes, compaction and
Seat attribution are independent: a compacted digest's `actor` is `'system'` (the Night Shift), and the
original events it summarizes retain their own actor values in `.snapshots`. Adding a Seat does not disturb any
compaction boundary.

---

## 6. Component structure

```
                          ┌───────────────────────────────────────────────────┐
   an act by a Seat       │                 sidra-seats (kernel)               │
  (Directive, Approval,   │                                                    │
   capability grant) ────►│  SeatRegistry                                      │
                          │    │  1. resolve acting Seat (actor value → Seat)   │
                          │    ▼                                               │
                          │  Lifecycle ──► Seat, SeatStatus, transitions       │
                          │    │                                               │
                          │    ▼  2. load the Seat's Fence, budget, namespace  │
                          │  FenceProvider · BudgetProvider · MemoryScope       │
                          │    │                                               │
                          └────┼──────────────────┬──────────────────┬─────────┘
                               ▼                   ▼                  ▼
                        PermissionBroker      BudgetLedger      MemoryNamespaces
                        (sidra-security)      (sidra-store)     (sidra-memory)
                        3. authorize_action   4. seat ceiling    5. mem scope check
                           WITH seat_fence       under firm month    seat/<id>/** only
                           as an ∩ term          (ADR-0020)          (default-deny)
                               │                   │                  │
                               └───────────────────┴──────────────────┘
                                                   ▼
                                        the act proceeds or is fenced
                                                   ▼
                                     appended Seat* / actor-stamped event
                                        on the existing hash chain (M2)
```

Internal modules of `sidra-seats`:

| Module | Responsibility |
|---|---|
| `registry` | installed Seats; resolve `actor_value → Seat`; the org-facing "who is admitted" source of truth |
| `lifecycle` | the §3.2 state machine and its guards; `materialize_founding`; append the transition event |
| `fence` | the per-Seat capability ceiling; the intersection term handed to the Broker; the no-self-widen check |
| `budget` | the per-Seat ceiling; nesting validation (Σ ≤ firm month); attribution of originated spend |
| `memory` | provision/seal the `seat/<id>` namespace; the scope predicate for `mem.*` capabilities |
| `binding` | the `actor_value` allocation (distinct, permanent) and the read-time attribution join |
| `mirror` | the human-readable Vault Markdown mirror, written on state transitions |
| `integrity` | the chain-integrity harness: assert the pre-existing prefix is unchanged after a Seat is added |

**Dependency direction (ADR-0011).** `packages/domain ← services/seats ← apps/*`. `services/seats` depends on
`services/security` (the Broker, capability model), `services/store` (the ledger, migrations, events table),
and `services/memory` (namespaces). It does **not** depend on `services/orchestrator` or `services/mission` —
identity is more fundamental than the work engines and must not import them. The absence of that edge is a
compile-time property enforced in CI (§19), exactly as the Connector Framework (M16 §6) and the Mission Engine
(Appendix B) do it.

---

## 7. Security

A Seat is a new *subject* of authority, so it enlarges the authorization surface — but every mitigation below
is an application of an existing M3 control, not a new one. Default-deny, the single Broker, and the immutable
chain are the whole toolkit.

| Threat (security §3, extended) | How M21 addresses it |
|---|---|
| T6 silent history tampering (a Seat added by rewriting the chain) | **Structurally impossible in M21's design** — no code path writes `events` except by appending; the integrity harness (§13.3, AC3) asserts the pre-existing prefix's hashes are unchanged after a Seat is added; `audit.verify` names the first bad `seq` if any row moved. |
| Cross-Seat memory read (Seat B reads Seat A's working memory) | Default-deny: the capability `mem.read:seat/A/**` is one Seat B cannot hold in M21 (no grammar grants another Seat's namespace); the Broker returns `fenced`; the attempt is logged (§10, AC6). |
| Cross-Seat spend (Seat B spends against Seat A's ceiling) | Spend is attributed to the *originating* Seat resolved from the actor value; the ledger scope is `seat:<originator>`; there is no path by which one Seat's act debits another's ceiling (§9, AC5). |
| Seat self-escalation (a Seat widens its own Fence) | `set_fence` produces only a subset of the admitting authority; a Seat cannot be the widener of its own Fence (§8.3); widening is a higher-authority Decision (invariant §3.3.5). |
| Impersonation via a forged actor value | Actor values are assigned by the kernel at `accept`, checked distinct against the full actor namespace, and permanent; a Seat cannot choose or reuse an actor value (§5.3). |
| A retired Seat's authority lingering | `retire` empties the Fence permanently and seals the namespace; the Broker's intersection with an empty Fence denies everything; the identity is retained only for attribution, holds no live capability. |
| Founding-Seat ambiguity (two Seats claim `'principal'`) | Exactly one Seat carries `is_founding` and `actor_value='principal'`; `materialize_founding` is refused if one exists (invariant §3.3.2). |

**The single choke point holds.** Every act a Seat originates is still a tool call or a Directive that passes
`PermissionBroker::authorize_action`. M21 adds one pre-flight — resolve the acting Seat and load its Fence —
and hands the Fence to the Broker as an intersection term *ahead of* the Broker's existing effect-class,
fence, and revocation logic. It removes nothing and adds no side door (ADR-0058).

---

## 8. Per-Seat Fence enforcement via the Broker (ADR-0058 in mechanism)

### 8.1 The intersection term

The security model computes effective capability as `charter ∩ work_order_grant ∩ firm_policy ∩
session_grants` (security §4). For any act attributed to a Seat, M21 adds one term:

```
effective = charter ∩ work_order_grant ∩ firm_policy ∩ session_grants ∩ seat_fence(originating_seat)
```

Intersection, never union — the Seat Fence can only *narrow*. An agent working a Work Order that originated
from Seat B can do no more than Seat B's Fence permits, regardless of the agent's own charter. This is the
human-layer ceiling: the Firm can never do, on a Seat's behalf, more than that Seat is allowed to authorize.

### 8.2 Order of checks

On any Broker-mediated act:

1. **Resolve the originating Seat** from the act's actor value (the Directive's or Approval's actor, propagated
   to the Work Order and its Turns). Every act has exactly one originating Seat.
2. **Load the Seat's Fence** (default-deny if absent; empty if Suspended/Retired).
3. **Broker.** Call `authorize_action` with `seat_fence` supplied as an intersection term. The Broker applies
   its unchanged effect-class policy (security §5), fences, and revocation over the narrowed capability set.

Steps 1–2 are the pre-flight M21 adds. Step 3 is the choke point that already existed. The order is fixed and
no step is skippable.

### 8.3 No self-widening

`set_fence(target_seat, new_caps)` requires the *acting* Seat to hold `org.admit` and every capability in
`new_caps` within its own Fence: `new_caps ⊆ acting_seat.fence`. A Seat therefore cannot widen its own Fence
(it would need a capability it does not have), and cannot grant another Seat more than it itself holds. Fence
changes are Decisions — logged, with the capability delta shown in plain language before the act.

---

## 9. Per-Seat budget (ADR-0058, consistent with ADR-0020)

### 9.1 The ceiling and the ledger

The per-Seat ceiling is stored in `seat_budgets` and mirrored into `budget_ledger` under a new scope value
`seat:<SeatId>` (`budget_ledger.scope` already admits `'firm' | agent id | engagement id` — `seat:<id>` is an
additive scope string, no schema change to the ledger's shape). Month-to-date Seat spend is
`SELECT cents FROM budget_ledger WHERE period=? AND scope='seat:'||?`.

### 9.2 Nesting under the firm month

The invariant is `Σ over active Seats(ceiling_cents) ≤ firm_month_ceiling`. `set_budget` validates this and
refuses a ceiling that would breach it, naming the remaining headroom. The founding Seat's ceiling defaults to
the full firm ceiling (preserving pre-M21 single-Seat behaviour, G8); carving a second Seat's ceiling reduces
the founding Seat's available headroom rather than inventing new money — the firm month is the hard cap
(ADR-0020: "Autoscaling never raises spend"; here, "admitting a Seat never raises spend").

### 9.3 Attribution and exhaustion

Spend is attributed to the Seat that *originated* the Engagement, resolved from the actor value on the
originating Directive. When a Seat's ceiling is reached, that Seat's originated work **pauses** and one
Approval Request is raised stating both the Seat total and the firm remaining — it does not stop other Seats'
work and does not downgrade the Model Class (ADR-0020, unchanged). A cross-department Engagement originated by
Seat B spends Seat B's ceiling wherever the work runs, so a department used by several Seats is not punished
for being useful — the ADR-0020 attribution rule, lifted to the Seat dimension.

---

## 10. Per-Seat working-memory namespace (ADR-0059 in mechanism)

### 10.1 Provisioning

On `provision`, a namespace `seat/<SeatId>` is registered in `seat_working_memory`. It scopes three things:

1. **Working drafts** — Directives a Seat is composing, scratch context it is assembling before issuing work.
2. **The Seat's private lane** — observations about that human's work patterns and preferences (memory §7),
   now keyed per Seat instead of globally.
3. **Seat-scoped preferences** — `preferences` keys prefixed `seat/<id>/`; the founding Seat inherits every
   existing global key so nothing changes for a single-Seat Firm (G8).

### 10.2 Isolation is default-deny, not a filter

A Seat holds `mem.read:seat/<id>/**` and `mem.write:seat/<id>/**` **only for its own** `<id>`. There is no
capability grammar in M21 that names another Seat's namespace, so the capability required to read across Seats
is one a Seat *cannot hold*. Isolation is therefore a property of the capability model, not a runtime access
filter that could be misconfigured. An attempt to read `seat/A/**` from Seat B fails at the Broker as
`fenced`, is logged, and is surfaced — exactly the department-boundary guarantee (layer model §3), applied to
humans.

### 10.3 Retirement seals, never deletes

`retire` sets `sealed = true`: the namespace becomes read-only and its capabilities are removed from the
retired Seat's (now empty) Fence. The content is retained for attribution and audit — a departed colleague's
working record survives, unreadable by others in M21 and unwritable by anyone, consistent with "no hard
deletes for records with history" (`/docs/04-database-design.md` §1.3).

---

## 11. Persistence, events, and the Vault mirror

### 11.1 New tables — all additive (forward-only migrations, band `0042`–`0046`)

| Migration | Table | Purpose |
|---|---|---|
| `0042_seats.sql` | `seats` | identity: id, actor_value (UNIQUE), display_name, status, is_founding, invited_by, timestamps |
| `0043_seat_fences.sql` | `seat_fences` | per-Seat capability ceiling: seat_id, capabilities (JSON set), set_by, set_at, active |
| `0044_seat_budgets.sql` | `seat_budgets` | per-Seat ceiling: seat_id, period, ceiling_cents, spent_cents; UNIQUE(seat_id, period) |
| `0045_seat_working_memory.sql` | `seat_working_memory` | namespace registry: seat_id, namespace (UNIQUE), sealed |
| `0046_seat_actor_index.sql` | *(index only)* | additive covering index `idx_events_actor ON events(actor, seq)` for per-Seat timeline queries — **no column added or repurposed, no row rewritten** |

`events.actor` **already exists** and is not modified. `budget_ledger` gains no column — the Seat ceiling uses
the existing `scope` string with a `seat:<id>` value. `preferences` gains no column — Seat scoping uses the
existing `key` string with a `seat/<id>/` prefix. Additive-only, no meaning of any existing column changes.
A Firm that never creates a second Seat behaves exactly as it did before M21 — the founding Seat bound to
`'principal'` is a fully supported terminal state, not a migration artifact (G8, G10). Per the migration policy
(`/docs/04-database-design.md` §10): forward-only, one transaction each, additive, each shipped with a test
that runs it against a fixture Vault from the previous release.

### 11.2 Domain events

Every event carries `actor` (the Seat performing the act) and lands on the existing hash chain (ADR-0002). All
are appended; none rewrites a prior row:

`SeatMaterialized` (founding) · `SeatInvited` · `SeatAccepted` · `SeatWithdrawn` · `SeatProvisioned` ·
`SeatActivated` · `SeatFenceChanged` · `SeatBudgetChanged` · `SeatWorkingMemoryProvisioned` · `SeatSuspended` ·
`SeatResumed` · `SeatRetired`.

`SeatInvited`, `SeatFenceChanged`, and `SeatBudgetChanged` carry the *admitting* Seat as `actor` (the act is
performed by an existing Seat); `SeatAccepted` onward for a given Seat may carry that Seat's own actor value
once assigned. The subject of each event is the Seat being acted upon (`subject_type='seat'`,
`subject_id=<SeatId>`), so the per-Seat lifecycle is reconstructable from the chain alone.

### 11.3 Per-Seat event queries

"Every event distinguishes the two Seats" (the exit criterion) is answered by the actor value on each event:

```
-- every event attributed to a given Seat, over the whole history including the pre-existing prefix
SELECT * FROM events WHERE actor = (SELECT actor_value FROM seats WHERE id = ?) ORDER BY seq;   -- idx_events_actor
```

For the founding Seat this returns the entire pre-M21 history (all `actor='principal'` rows) plus its post-M21
acts — with no row rewritten. For the second Seat it returns only rows from `accept` onward. The two result
sets are disjoint by construction: distinct actor values (invariant §3.3.3).

### 11.4 Vault Markdown mirror (v1 rule — the archive outlives the software)

```
~/Sidra/
└── seats/
    ├── <founding-seat>/
    │   ├── seat.md          identity, actor value ('principal'), status — human-readable
    │   ├── fence.md         current capability ceiling, in plain language
    │   └── budget.md        this Seat's ceiling and month-to-date, plain language
    └── <second-seat>/
        ├── seat.md          identity, actor value, who admitted it, when
        ├── fence.md         capability ceiling
        └── budget.md        ceiling and spend
```

Written on state transitions, not continuously. A Principal who abandons Sidra OS keeps a readable record of
every colleague admitted, what each could do, and what each could spend — but the working-memory namespace
content stays in the encrypted Vault, isolated as in life.

---

## 12. Public APIs

### 12.1 Commands

| Command | Effect | Notes |
|---|---|---|
| `invite_seat(display_name, proposed_fence)` → `SeatId` | Invited | performed by an Active Seat holding `org.admit`; `proposed_fence ⊆ acting Seat's Fence`; a Decision |
| `accept_seat(seat)` | Created | kernel assigns a distinct, permanent actor value (§5.3) |
| `provision_seat(seat, fence, budget_ceiling)` | Active | Fence set, budget carved (Σ ≤ firm month), namespace created |
| `set_seat_fence(seat, capabilities)` | Active | `capabilities ⊆ acting Seat's Fence`; no self-widen (§8.3); a Decision |
| `set_seat_budget(seat, ceiling_cents)` | Active | keeps Σ Seat ceilings ≤ firm month (§9.2); a Decision |
| `suspend_seat(seat)` / `resume_seat(seat)` | Suspended / Active | empties / restores the active Fence; freezes / unfreezes budget |
| `retire_seat(seat)` | Retired | empties Fence permanently, seals namespace; identity retained, never deleted |

### 12.2 Queries

| Query | Returns |
|---|---|
| `list_seats()` | admitted Seats + status (founding flagged) |
| `seat_fence(seat)` | the Seat's current capability ceiling |
| `seat_budget(seat, period)` | ceiling and month-to-date spend |
| `seat_timeline(seat)` | every event attributed to the Seat's actor value (§11.3), including the pre-existing prefix for the founding Seat |
| `who_acted(event)` | the Seat resolved from `events.actor` — a read-time join, never a stored column |

### 12.3 API rules

1. **No API rewrites history.** No command in this crate issues an `UPDATE` or `DELETE` against `events` or any
   historical row's `actor`. Every state change is an appended event (invariant §3.3.1). A code path that
   would rewrite history is a defect that fails the integrity test (AC3), not a feature.
2. **Every Seat-originated act goes through the Broker** with the Seat's Fence as an intersection term. There
   is no side door and no second authorization path (ADR-0058).
3. **`invite`, `provision`, `set_seat_fence`, `set_seat_budget`, `retire` are Decisions** — logged, with the
   capability or budget delta shown in plain language before the act.
4. **The founding Seat is materialized, never created.** No API creates the founding Seat at runtime;
   `materialize_founding` runs once at migration and binds to `'principal'` (invariant §3.3.2).
5. **Actor values are kernel-assigned and permanent.** No API lets a caller choose, change, or reuse an actor
   value (§5.3).

---

## 13. Sequence diagrams

### 13.1 Admit and provision a second Seat

```
Founding Seat        Kernel(seats)            Store(events)        Broker
   │ invite("Sam", fence⊆mine) │                    │                │
   ├──────────────────────────►│ check org.admit ───┼───────────────►│  authorize (a Decision)
   │                           │◄─── Allow ─────────┼────────────────┤
   │                           │ append SeatInvited (actor='principal') ──►│
   │ accept(seat)              │                    │                │
   ├──────────────────────────►│ assign actor_value='seat:01J…'      │
   │                           │  (distinct vs all actors, permanent)│
   │                           │ append SeatAccepted ───────────────►│
   │ provision(seat,fence,budget)                   │                │
   ├──────────────────────────►│ Σ ceilings ≤ firm month? yes        │
   │                           │ create namespace seat/01J…          │
   │                           │ append SeatProvisioned, SeatActivated ──►│
   │◄──── Active ──────────────┤                    │                │
   (nothing in the pre-existing prefix was touched — every step appended)
```

### 13.2 The second Seat originates work under its own Fence and budget

```
Second Seat    Kernel(seats)   Broker      BudgetLedger    Engine
  │ directive "…" │                │            │            │
  ├──────────────►│ resolve Seat from actor 'seat:01J…'      │
  │               │ load fence(seat) + budget(seat)          │
  │               ├── authorize_action(∩ seat_fence) ►│      │
  │               │◄──────── Allow (narrowed) ────────┤      │
  │               ├── ceiling check: seat:01J… under firm month ►│ ok
  │               │ append actor-stamped events ('seat:01J…')│
  │               ├── dispatch Work Order ──────────────────►│
  │◄─── result ───┤ spend debited to scope 'seat:01J…'       │
  (the founding Seat's ceiling and namespace are untouched; attribution is by actor value)
```

### 13.3 The exit criterion — a second Seat, distinguished events, no history rewritten

```
Test harness            Kernel(seats)              Store(events)
  │ H0 = audit.verify(prefix seq 1..N)  ─────────────────►│  record every hash
  │◄── OK, root hash R0 ──────────────────────────────────┤
  │ create + provision second Seat (13.1) ───────────────►│  APPENDS seq N+1..N+k
  │ second Seat originates one act (13.2) ────────────────►│  APPENDS seq N+k+1
  │ H1 = audit.verify(prefix seq 1..N)  ─────────────────►│  re-hash the SAME prefix
  │◄── OK, root hash R1 ──────────────────────────────────┤
  │ ASSERT R1 == R0        (no historical hash changed)   │   ← AC3, the structural proof
  │ ASSERT events at seq>N carry actor='seat:01J…'        │   ← AC2, the two are distinguished
  │ ASSERT every seq≤N still carries its original actor   │   ← AC2, the prefix is untouched
  │ ASSERT no UPDATE/DELETE ran against events            │   ← AC3, append-only (statement log)
  (a second Seat exists, every event distinguishes the two, and the pre-existing chain is byte-identical)
```

---

## 14. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | An `UPDATE events SET actor=…` is attempted anywhere in M21 code | There is no such path; the integrity test (§13.3) and a CI statement-scan (§19) fail the build on any write to `events` other than append |
| F2 | Second Seat's assigned actor value collides with an existing one | `accept` checks distinctness against the full actor namespace and retries the derivation; a genuine collision is impossible (ULID-derived) and would be refused, not overwritten |
| F3 | `provision` would push Σ Seat ceilings over the firm month | Refused, naming the remaining headroom; no ceiling is silently created (§9.2) |
| F4 | Seat B attempts to read `seat/A/**` working memory | `fenced` at the Broker — the capability cannot be held (§10.2); logged and surfaced (AC6) |
| F5 | A Seat attempts `set_seat_fence` to widen its own Fence | Refused — `new_caps ⊄ acting Seat's Fence` (§8.3); widening is a higher-authority Decision |
| F6 | A retired Seat's credential/session tries to act | Its Fence is empty; the Broker's intersection denies everything; the identity persists only for attribution (§10.3) |
| F7 | Two callers race `materialize_founding` | One transaction wins; the second is refused because a founding Seat now exists (invariant §3.3.2) — no second `'principal'` binding |
| F8 | A Seat is suspended mid-Engagement | In-flight Turns are fenced at their next Broker check; no new act is authorized; budget frozen; history of the work stays intact |
| F9 | Compaction runs after a second Seat exists | Independent of Seats: `actor` is never rewritten, so the compaction hash-range record and Seat attribution do not interfere (§5.4) |

---

## 15. Performance and offline

- **Identity resolution is a keyed lookup.** `actor_value → Seat` and `Seat → fence/budget/namespace` are
  primary-key or unique-index reads; they add one indexed lookup to the Broker pre-flight, off any hot loop.
- **The Broker intersection is set arithmetic.** Adding `seat_fence` as an intersection term is a set operation
  over small capability sets — negligible against the existing effective-capability computation.
- **Per-Seat timeline queries are indexed.** `idx_events_actor` (migration 0046) makes "every event for a Seat"
  a range scan rather than a table scan; without it the query would degrade as the chain grows.
- **Offline is unaffected.** Seats are a local identity primitive; admitting, fencing, budgeting, and isolating
  Seats require no network (there is no account, no server — security §10, ADR-0009). The Firm's offline
  behaviour is identical with one Seat or many.
- **The integrity harness is O(prefix) but runs off the hot path.** Re-verifying the pre-existing prefix is a
  linear hash walk executed in CI and at the exit-criterion test, not on every Seat act.

---

## 16. Dependencies, assumptions, risks

### 16.1 Dependencies

| On | For |
|---|---|
| M2 — event log & hash chain (ADR-0002) | the immutable chain that `Seat*` events append to and that the no-rewrite proof verifies; `events.actor` |
| ADR-0021 — Seats defined in 2.0 | the decision M21 realizes; the reason `events.actor` already exists and no rewrite is needed |
| M3 — Permission Broker, capability model (security §4) | the single choke point; the Fence as an intersection term; default-deny |
| M5 — budget ceilings (ADR-0020) | the nesting model the per-Seat ceiling extends; the ledger; "cost follows the requester" |
| M6 — memory namespaces (memory §7) | the isolation mechanism the per-Seat working-memory namespace reuses |

### 16.2 Assumptions and explicit non-scope

1. **The chain is intact at M21.** `audit.verify` passes over the pre-existing prefix before M21 runs; if it
   does not, that is an M2 integrity failure to resolve first, not something M21 masks.
2. **`events.actor` has carried a Seat-distinguishable value since 2.0.** ADR-0021's 2.0 preparation is in
   place: the founding Seat's acts are `'principal'`, agents are `agent.*`, system is `'system'`. If a Firm's
   history predates that discipline, a one-time *classification* (never a rewrite) maps legacy actor strings to
   the founding Seat via the binding — still additive.
3. **Delegation, separation of duties, and self-approval prohibition are OUT OF SCOPE.** They are M22
   (`/MILESTONE_REGISTRY.md` §4). In M21 a Seat acts only as itself; there is no "Seat A acts for Seat B" and
   no cross-Seat approval. Building any of it here would collapse the isolation boundary M21 establishes.
4. **No UI multi-user session management.** M21 is the identity + isolation substrate. Login, session
   switching, and multi-device Seat presence are downstream (M23 kernel extraction, M24 sync) and out of scope.

### 16.3 Risks

| # | Risk | Mitigation |
|---|---|---|
| SR-1 | A well-meaning "backfill `seat_id` on events" is added, rewriting the chain | The no-rewrite invariant is the exit criterion (AC3); a CI statement-scan fails on any non-append write to `events`; the binding design makes backfill unnecessary |
| SR-2 | A second authorization path grows around Seats | ADR-0058 states one Broker; the Fence is an intersection term; a CI check asserts `authorize_action` remains the sole gate for Seat-originated acts |
| SR-3 | A Seat becomes an agent (or vice versa) by identifier reuse | Disjoint `SeatId`/`AgentId` types; separate tables; no shared identifier space (ADR-0057) |
| SR-4 | Σ Seat ceilings quietly exceed the firm month | `set_budget`/`provision` validate the sum and refuse; admitting a Seat never raises spend (ADR-0020 analogue) |
| SR-5 | Cross-Seat memory leak through a mis-scoped capability | Isolation is default-deny by *absence of grammar*, not a filter; the capability to read another Seat's namespace cannot be expressed in M21 |
| SR-6 | Migration breaks a single-Seat Firm | Forward-only, additive; founding Seat bound to `'principal'` = pre-M21 behaviour; each migration independently deployable and fixture-tested (§11.1) |

---

## 17. Acceptance criteria

The exit criterion — *a second Seat is created; every event distinguishes the two; no historical event is
rewritten* — decomposed into testable claims. **These are the contract with AntiGravity.**

| # | Claim | Proven by |
|---|---|---|
| AC1 | A second Seat can be created through invite → accept → provision, as append-only logged acts, with a Fence ⊆ the admitting Seat's and a budget ceiling that keeps Σ ≤ the firm month | the Seat-creation test; asserts new `Seat*` events and the lifecycle end state `Active` |
| AC2 | **Every event distinguishes the two Seats** — the founding Seat's acts carry `'principal'`, the second Seat's carry its distinct permanent actor value, and the two result sets are disjoint | the per-Seat timeline test (§11.3) over a mixed-actor fixture |
| AC3 | **No historical event is rewritten** — the pre-existing prefix is byte-identical and its hash chain verifies unchanged after a second Seat is admitted and acts | the chain-integrity harness (§13.3): assert `audit.verify(prefix)` root hash is identical before and after; assert no `UPDATE`/`DELETE` ran against `events` |
| AC4 | A Seat's Fence is default-deny and enforced by the single Broker as an intersection term; an empty Fence permits nothing; a Seat cannot widen its own Fence | Broker-integration test over a Fence corpus; self-widen-refusal test (§8.3) |
| AC5 | A per-Seat budget ceiling nests under the firm month; exhaustion pauses only that Seat's originated work; spend is attributed to the originating Seat, never another | budget-nesting + attribution test; forced-exhaustion test asserting one Approval Request and no Firm-wide stop |
| AC6 | One Seat cannot read another Seat's working-memory namespace — the required capability cannot be held; the attempt is `fenced` and logged | cross-Seat memory-isolation test (§10.2) |
| AC7 | The founding Seat and a single-Seat Firm behave exactly as pre-M21 (binds to `'principal'`, inherits global preferences and the firm ceiling) | pre-M21-equivalence test over a fixture Vault with no second Seat |
| AC8 | Every Seat lifecycle act is an audited event on the existing hash chain; the per-Seat lifecycle is reconstructable from the chain alone | `audit.verify` over a Seat-lifecycle fixture |
| AC9 | A retired Seat retains its identity and history, holds an empty Fence, and its namespace is sealed read-only — never deleted | retire test asserting no row deletion and zero live capability |
| AC10 | `services/seats` has no dependency edge to `services/orchestrator` or `services/mission`; `authorize_action` remains the sole gate for Seat-originated acts | dependency-direction + single-choke-point checks in CI (§19) |

---

## 18. Testing strategy

| Layer | What it proves | Form |
|---|---|---|
| Unit | value objects reject invalid construction; `SeatId`/`AgentId` are disjoint; Fence intersection narrows only; ceiling-sum arithmetic | property tests per type |
| Lifecycle | the §3.2 transition table and guards; illegal transitions rejected; `materialize_founding` runs once | state-machine test over every edge |
| Broker integration | `seat_fence` is applied as an intersection term ahead of effect-class logic; default-deny; self-widen refused | integration test against `sidra-security` |
| Budget | Σ ceilings ≤ firm month enforced; attribution to the originating Seat; exhaustion pauses one Seat only | ledger integration test with forced exhaustion |
| Memory isolation | cross-Seat read is `fenced`; the required capability cannot be expressed; retirement seals | negative-authorization test over two Seats |
| **Chain integrity (exit criterion)** | the pre-existing prefix is unchanged; two Seats are distinguished by actor value; append-only | the §13.3 harness — **the last test to go green** |
| Migration | 0042–0046 run forward-only against a previous-release fixture Vault; single-Seat behaviour preserved | migration test per file (db-design §10) |
| Equivalence | a Firm that never admits a second Seat is behaviourally identical to pre-M21 | golden-run comparison |

Fixtures include a **mixed-actor pre-existing prefix** (events from `'principal'`, several `agent.*`, and
`'system'`) so the no-rewrite proof runs against a realistic chain, and a **two-Seat fixture** for isolation
and attribution tests.

## 19. CI requirements

| Check | Asserts | Fails build when |
|---|---|---|
| **Chain-integrity test** | admitting a Seat changes no historical hash: `audit.verify(prefix)` root identical before/after (AC3) | any historical hash differs after a Seat is added |
| **No-history-rewrite statement scan** | `services/seats` contains no `UPDATE`/`DELETE` against `events` (only appends) | a non-append write to `events` appears in the crate |
| **Dependency-direction check** | no edge `services/seats → services/orchestrator` or `→ services/mission` (AC10) | such an import edge exists |
| **Single-choke-point check** | `authorize_action` is the sole authorization gate for Seat-originated acts; no parallel decision path (ADR-0058) | a second authorization entry point is introduced |
| **Disjoint-identity check** | `SeatId` and `AgentId` are never interconverted (ADR-0057) | a cast or shared identifier space appears |
| **Migration forward-only check** | 0042–0046 are additive; no column repurposed; `events.actor` untouched | a migration alters an existing column's meaning |

The chain-integrity test is the CI embodiment of the exit criterion: it must pass on every commit once E6
lands, and its failure blocks the milestone.

---

## Appendix A — Glossary additions

- **Seat** — a human identity admitted to the Firm: a colleague. It holds a Fence, a budget ceiling, and a
  working-memory namespace. It is **not** an agent — it originates and bounds work but does not perform it
  (ADR-0057). Exactly one Seat, the **founding Seat**, existed before M21.
- **Founding Seat** — the single Seat that has existed since 2.0, bound to the pre-existing actor value
  `'principal'`. Materialized (not created) at M21 migration; its acts are the entire pre-M21 history, and
  binding it to `'principal'` is why admitting a second Seat rewrites nothing.
- **Actor value** — the string a Seat writes into `events.actor`. `'principal'` for the founding Seat; a
  distinct, permanent, kernel-assigned value for every other Seat. The column that already distinguishes who
  acted (ADR-0021).
- **Per-Seat Fence** — a Seat's capability ceiling, default-deny, enforced by the single Broker as an
  intersection term. A Seat cannot widen its own Fence (ADR-0058).
- **Per-Seat budget** — a Seat's monthly spending ceiling, nesting under the firm month; spend is attributed to
  the originating Seat (ADR-0058, consistent with ADR-0020).
- **Per-Seat working memory** — a Seat's private working-memory namespace `seat/<id>`, isolated by default-deny
  so no other Seat can read it (ADR-0059).
- **No-rewrite property** — the structural guarantee that admitting a Seat appends events and never mutates the
  pre-existing chain; the exit criterion (AC3).

## Appendix B — Repository placement

```
services/
└── seats/                      NEW — crate sidra-seats
    ├── registry
    ├── lifecycle
    ├── fence
    ├── budget
    ├── memory
    ├── binding
    ├── mirror
    └── integrity

packages/domain/                EXTENDED — SeatId, ActorValue, SeatStatus, SeatFence value objects

services/store/migrations/      EXTENDED — 0042_seats.sql … 0046_seat_actor_index.sql (forward-only, additive)

infrastructure/testing/
└── seats/                      NEW — chain-integrity proof, isolation, budget-nesting, equivalence, migration
```

Dependency direction (ADR-0011): `packages/domain ← services/seats ← apps/*`. `services/seats` depends on
`services/security`, `services/store`, `services/memory`; it does **not** depend on `services/orchestrator` or
`services/mission`.

## Appendix C — Implementation position

M21 is the **first milestone of 3.0 "Chambers"** — the release in which the Firm admits colleagues
(`/MILESTONE_REGISTRY.md` §4). It depends structurally on only two things: **M2** (the event chain and its
`actor` field) and **ADR-0021** (the decision that put that field in the chain at 2.0 so this milestone would
be additive rather than a chain rebuild). Everything else it touches — the Broker, the budget ceilings, the
memory namespaces — it *reuses*, never re-decides.

Building multi-Seat any earlier was the mistake ADR-0021 exists to prevent: "Adding a second actor later means
adding an actor field to a hash-chained log … a chain that has to be rewritten." Because 2.0 paid the cost of
the actor field up front, 3.0 pays only for a UI-and-policy release, exactly as ADR-0021 predicted ("3.0's cost
drops substantially … a UI and policy release rather than a schema and integrity release").

**Exit criterion.** A second Seat is created; every event distinguishes the two; no historical event is
rewritten — proven by a hash-chain integrity assertion over the pre-existing events, not by configuration
(AC1, AC2, AC3).

**Then STOP.** M21 is identity and isolation only. Delegation, separation of duties, and the self-approval
prohibition are **M22** and must not be started until M21 is implemented, integrated, and the second-Seat /
no-history-rewritten exit criterion is demonstrated.
