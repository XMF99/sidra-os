# Seats and Identity — Implementation Plan

**Milestone M21 · crate `sidra-seats` · for AntiGravity**

| | |
|---|---|
| Architecture | `SEATS_AND_IDENTITY_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0057 (Seat is a first-class human identity, keyed on the actor field) · 0058 (per-Seat Fence & budget nest under the firm ceilings, one Broker) · 0059 (per-Seat working-memory namespace, default-deny) |
| Realizes | ADR-0021 (Seats defined in 2.0, one shipped) |
| Crate | `sidra-seats` at `services/seats/` |
| Depends on | `sidra-security`, `sidra-store`, `sidra-memory`, `sidra-domain` |
| Must not depend on | `sidra-orchestrator`, `sidra-mission` (CI-enforced) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR. In particular, **no task writes an `UPDATE` or `DELETE` against `events`** — the
no-history-rewrite invariant (architecture §3.3.1, §12.3.1) is the ground rule of the whole milestone.

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
| E1 | Seat domain model & the actor-field binding | the vocabulary — `SeatId`, `ActorValue`, Fence, budget, namespace — and the read-time attribution join (ADR-0057) |
| E2 | Seat creation & lifecycle | invite → accept → provision → active → suspended → retired; `materialize_founding` (architecture §3) |
| E3 | Per-Seat Fences via the Broker | the Fence as an intersection term; default-deny; no self-widen (ADR-0058) |
| E4 | Per-Seat budgets | the ceiling nesting under the firm month; `seat:<id>` ledger scope; attribution & exhaustion (ADR-0058) |
| E5 | Per-Seat working-memory namespace | `seat/<id>` isolation, default-deny; retirement seals (ADR-0059) |
| E6 | The second-Seat / no-history-rewritten acceptance | the chain-integrity proof — the exit criterion, the last thing green |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──┬──► E3 ──┐
            ├──► E4 ──┼──► E6
            └──► E5 ──┘
   (persistence: migrations 0042–0046 land inside E1/E2 just ahead of the first write to each table)
```

E1 first — everything types against the Seat model and the binding. E2 next — nothing exists until a Seat can
be materialized and admitted. E3, E4, and E5 are independent once E2 lands (Fence, budget, and memory are
orthogonal facets of a Seat) and may proceed in parallel. E6 assembles the acceptance harness over all of them;
**E6 is the exit criterion and its chain-integrity test is the last thing to go green.**

---

## E1 — Seat domain model & the actor-field binding

### Purpose
The vocabulary every other epic types against, plus the mechanism that makes the milestone free: attribution as
a read-time join over `events.actor`, never a write (ADR-0057).

### Scope
In: value objects, the `Seat`/`SeatFence`/`SeatBudget`/`SeatWorkingMemory` aggregates, the `actor_value`
binding, the attribution join, and the additive migrations that back them. Out: lifecycle transitions (E2),
enforcement (E3–E5).

### Dependencies
`sidra-domain` (`Capability`, `BudgetCents`); `sidra-store` (the existing `events` and `budget_ledger` tables —
read-only w.r.t. their existing columns).

### Public APIs
Constructors that reject invalid construction; `who_acted(event) -> Seat` as a read-time join; no mutator that
writes `events`.

### Acceptance criteria
`SeatId` and `AgentId` are disjoint types; attribution is a join, never a stored column on `events`; every
value object rejects invalid construction.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `sidra-seats` crate: manifest, module skeleton, CI wiring, dependency-direction check | S | — | `services/seats/Cargo.toml`, `src/lib.rs`, `infrastructure/ci/` | Crate builds; CI fails on any edge `sidra-seats → sidra-orchestrator` or `→ sidra-mission` (AC10) |
| **T1.2** | Value objects: `SeatId` (ULID), `ActorValue`, `DisplayName`, `SeatStatus`, `MemoryNamespace` | S | T1.1 | `domain/values.rs` | `SeatId` and `AgentId` are non-interconvertible types; `ActorValue` opaque; property tests |
| **T1.3** | `Seat` aggregate: id, actor_value, display_name, status, is_founding, invited_by, timestamps | S | T1.2 | `domain/seat.rs` | Immutable identity; holds no capabilities inline; `is_founding ⇒ actor_value='principal'` enforced at construction |
| **T1.4** | `SeatFence` value: capability set (default-deny), set_by, set_at, active | S | T1.2 | `domain/fence.rs` | Empty set = deny-all; intersection helper narrows only; no field holds a widening operation |
| **T1.5** | `SeatBudget` & `SeatWorkingMemory` values | S | T1.2 | `domain/budget.rs`, `domain/memory.rs` | `SeatBudget` keyed on (seat, period); namespace is exactly `seat/<id>`; unit tests |
| **T1.6** | Migrations `0042_seats.sql`, `0043_seat_fences.sql`, `0044_seat_budgets.sql`, `0045_seat_working_memory.sql` | M | T1.3–T1.5, `sidra-store` | `services/store/migrations/` | Forward-only, additive, one transaction each; `seats.actor_value` UNIQUE; `events.actor` untouched; each runs against a previous-release fixture Vault (db-design §10) |
| **T1.7** | Migration `0046_seat_actor_index.sql` — additive covering index `idx_events_actor ON events(actor, seq)` | S | T1.6 | `migrations/` | Index only; **no column added or repurposed; no row rewritten**; per-Seat timeline query uses it |
| **T1.8** | The attribution binding: `who_acted(event)` and `seat_timeline(seat)` as read-time joins over `events.actor` | M | T1.3, T1.7 | `binding/attribute.rs` | Attribution is a join; no code path writes `events`; founding Seat's timeline returns the full `'principal'` prefix (AC2 foundation) |

---

## E2 — Seat creation & lifecycle

### Purpose
Admit a Seat as append-only logged acts and move it through its lifecycle; materialize the founding Seat bound
to `'principal'`.

### Scope
In: the §3.2 state machine and guards, `materialize_founding`, actor-value assignment at `accept`, the `Seat*`
event variants, the Vault mirror. Out: Fence/budget/memory enforcement (E3–E5).

### Dependencies
E1; `sidra-store` (append to `events`); the hash chain (M2, ADR-0002).

### Public APIs
`materialize_founding()`; `invite_seat`; `accept_seat`; `provision_seat`; `suspend_seat`; `resume_seat`;
`retire_seat`.

### Acceptance criteria
Every transition appends a `Seat*` event and rewrites nothing; the founding Seat binds to `'principal'` and is
materialized once; a second Seat's actor value is distinct and permanent.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | Lifecycle state machine: the §3.2 transition table and guards | M | E1 | `lifecycle/state.rs` | Illegal transitions rejected; `withdraw` from Invited reachable; retired is terminal |
| **T2.2** | `materialize_founding`: bind the founding Seat to `'principal'`, seed Fence from firm policy and budget from the firm ceiling, in `Active` | M | T2.1 | `lifecycle/founding.rs` | Runs once; refused if a founding Seat exists (invariant §3.3.2); skips invite/accept; appends `SeatMaterialized` |
| **T2.3** | `invite_seat` / `accept_seat`: assign a distinct, permanent actor value at accept | M | T2.1 | `lifecycle/admit.rs` | `invite` requires the acting Seat to hold `org.admit`; accepted actor value checked distinct vs the full actor namespace and never reassigned (§5.3) |
| **T2.4** | `provision_seat`: set Fence (⊆ admitting), carve budget (Σ ≤ firm month), create namespace | M | T2.3, E3/T3.1, E4/T4.1, E5/T5.1 | `lifecycle/provision.rs` | Provision refused if any precondition fails; on success appends `SeatProvisioned`, `SeatActivated` |
| **T2.5** | `suspend_seat` / `resume_seat` / `retire_seat`: empty/restore/permanently-empty the Fence, freeze budget, seal namespace | M | T2.4 | `lifecycle/transition.rs` | Suspend empties active Fence; retire seals namespace and retains the row (no delete, AC9) |
| **T2.6** | `SeatEvent` enum — all 12 variants with `actor` and `subject_type='seat'`; append-only | M | E1 | `domain/events.rs` | Every kind in §11.2 present; serde round-trip; schema snapshot committed; each append lands on the hash chain (AC8) |
| **T2.7** | Vault Markdown mirror writer (on state transitions, not continuously) | M | T2.6 | `mirror/write.rs` | `seat.md`/`fence.md`/`budget.md` per Seat; no working-memory content leaks to the mirror |

---

## E3 — Per-Seat Fences via the Broker (ADR-0058)

### Purpose
The per-Seat capability ceiling, enforced by the single Broker as an intersection term — default-deny, no
self-widen.

### Scope
In: the Fence store, the intersection term handed to `authorize_action`, the resolve-originating-Seat
pre-flight, the no-self-widen check. Out: the budget (E4) and memory (E5) facets.

### Dependencies
E1, E2; `sidra-security` (`PermissionBroker`, capability model).

### Public APIs
`set_seat_fence(seat, capabilities)`; `seat_fence(seat)`; `resolve_originating_seat(act) -> Seat`.

### Acceptance criteria
An empty Fence permits nothing; a Seat cannot widen its own Fence; the Broker remains the sole gate with the
Fence supplied as an intersection term ahead of its existing logic.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | Fence store: set, get, activate/deactivate; persist to `seat_fences` | M | E2, T1.6 | `fence/store.rs` | Fence change is a `SeatFenceChanged` event; default-deny when absent; empty when Suspended |
| **T3.2** | Broker wiring: resolve the originating Seat, load its Fence, pass it to `authorize_action` as an intersection term ahead of effect-class logic | M | T3.1, `sidra-security` | `fence/authorize.rs` | Order fixed: resolve Seat → load Fence → Broker; `effective = … ∩ seat_fence`; a narrowed grant still obeys effect-class policy (§8.2) |
| **T3.3** | No-self-widen check: `set_seat_fence` requires `new_caps ⊆ acting Seat's Fence` | S | T3.1 | `fence/widen.rs` | A Seat cannot widen its own Fence; a grant beyond the acting Seat's Fence is refused, naming the offending capability (§8.3, AC4) |
| **T3.4** | Suspend/retire Fence effects: empty the effective Fence so the Broker denies everything | S | T3.1, E2/T2.5 | `fence/store.rs` | Suspended/Retired Seat's intersection is empty; every act by it is `fenced` (F6) |

---

## E4 — Per-Seat budgets (ADR-0058)

### Purpose
A per-Seat monthly ceiling nesting under the firm month, with spend attributed to the originating Seat and
exhaustion pausing only that Seat.

### Scope
In: the Seat budget store, the `seat:<id>` ledger scope, the Σ ≤ firm-month validation, attribution of
originated spend, exhaustion handling. Out: the Fence (E3).

### Dependencies
E1, E2; `sidra-store` (`budget_ledger`); the firm-ceiling model (ADR-0020).

### Public APIs
`set_seat_budget(seat, ceiling_cents)`; `seat_budget(seat, period)`; `attribute_spend(act, cents)`.

### Acceptance criteria
Σ Seat ceilings ≤ firm month is enforced; spend follows the originating Seat; exhaustion pauses one Seat and
raises one Approval Request without a Firm-wide stop or Model-Class downgrade.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | Seat budget store: set ceiling, read month-to-date; mirror into `budget_ledger` scope `seat:<id>` | M | E2, T1.6 | `budget/store.rs` | Additive `seat:<id>` scope; `budget_ledger` shape unchanged; ceiling change is a `SeatBudgetChanged` event |
| **T4.2** | Nesting validation: `Σ over Seats(ceiling) ≤ firm_month_ceiling` at set/provision | S | T4.1 | `budget/nesting.rs` | A ceiling breaching the sum is refused, naming remaining headroom (§9.2, AC5); founding Seat defaults to the firm ceiling |
| **T4.3** | Attribution: resolve the originating Seat from the act's actor value; debit that Seat's ledger scope | M | T4.1, E3/T3.2 | `budget/attribute.rs` | A cross-department Engagement debits the originating Seat wherever it runs; no act debits another Seat (§9.3, AC5) |
| **T4.4** | Exhaustion: pause the Seat's originated work; one Approval Request stating Seat total + firm remaining; no Model-Class downgrade | M | T4.3 | `budget/exhaustion.rs` | Exhaustion pauses one Seat only; other Seats continue; ADR-0020 rules preserved (AC5) |

---

## E5 — Per-Seat working-memory namespace (ADR-0059)

### Purpose
Give each Seat an isolated working-memory namespace; make isolation a property of the capability model, not a
runtime filter.

### Scope
In: namespace provisioning, `mem.*:seat/<id>/**` scoping, Seat-scoped preferences, retirement sealing, the
cross-Seat denial. Out: cross-Seat sharing (that is M22 delegation).

### Dependencies
E1, E2; `sidra-memory` (namespaces, private lanes); `sidra-security` (capability scoping).

### Public APIs
`provision_namespace(seat)`; `seal_namespace(seat)`; the `mem.*:seat/<id>/**` capability scope predicate.

### Acceptance criteria
A Seat holds `mem.*:seat/<id>/**` only for its own id; no grammar names another Seat's namespace; a cross-Seat
read is `fenced` and logged; retirement seals read-only.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | Namespace provisioning: register `seat/<id>` in `seat_working_memory`; scope drafts, private lane, preferences | M | E2, T1.6 | `memory/provision.rs` | Namespace created at provision; founding Seat inherits existing global preference keys (G8) |
| **T5.2** | Capability scoping: a Seat holds `mem.read/write:seat/<id>/**` only for its own id; no grammar names another Seat's namespace | M | T5.1, `sidra-security` | `memory/scope.rs` | The capability to read another Seat's namespace cannot be constructed; default-deny (§10.2) |
| **T5.3** | Cross-Seat denial: a read of `seat/A/**` from Seat B is `fenced` at the Broker and logged | S | T5.2, E3/T3.2 | `memory/isolate.rs` | Cross-Seat read denied and surfaced (AC6, F4) |
| **T5.4** | Retirement sealing: `retire` sets `sealed=true`, removes namespace capabilities, retains content | S | T5.1, E2/T2.5 | `memory/seal.rs` | Sealed namespace is read-only and unwritable; content retained, never deleted (§10.3, AC9) |

---

## E6 — The second-Seat / no-history-rewritten acceptance

### Purpose
The exit criterion, made a test. **The last thing to go green.**

### Scope
In: the chain-integrity proof harness, the per-Seat attribution assertions, the pre-M21-equivalence check, and
the AC coverage. Out: any new behaviour — this epic proves the others.

### Dependencies
All prior epics.

### Acceptance criteria
AC1–AC10 each covered by a named test; the chain-integrity proof (AC3) asserts the pre-existing prefix's hashes
are identical before and after a second Seat is admitted and acts, and that no `UPDATE`/`DELETE` ran against
`events`.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | **Chain-integrity proof (the exit criterion):** over a mixed-actor pre-existing prefix, record its `audit.verify` root; admit + provision a second Seat; have it act; re-verify the same prefix; assert identical root and zero writes to `events` | M | E2, E3, E4, E5 | `infrastructure/testing/seats/chain_integrity.rs` | AC3 — the pre-existing chain is byte-identical; no historical hash changed; no `UPDATE`/`DELETE` against `events` (§13.3) |
| **T6.2** | Two-Seats-distinguished test: after admission, events at `seq>N` carry the second Seat's actor value, every `seq≤N` retains its original actor, the two timelines are disjoint | S | T6.1 | `.../distinguished.rs` | AC2 — every event distinguishes the two Seats |
| **T6.3** | Second-Seat-created test: invite → accept → provision produces an `Active` second Seat via append-only events | S | E2 | `.../create.rs` | AC1 — a second Seat exists as logged acts |
| **T6.4** | Fence-enforcement test: default-deny; intersection narrows; no self-widen | S | E3 | `.../fence.rs` | AC4 |
| **T6.5** | Budget-nesting + attribution + exhaustion test | M | E4 | `.../budget.rs` | AC5 |
| **T6.6** | Cross-Seat memory-isolation test | S | E5 | `.../memory.rs` | AC6 |
| **T6.7** | Pre-M21-equivalence test: a Firm that never admits a second Seat is behaviourally identical to pre-M21 | M | E2 | `.../equivalence.rs` | AC7 — founding Seat binds to `'principal'`, inherits global preferences and the firm ceiling |
| **T6.8** | Retire test: identity retained, Fence empty, namespace sealed, no row deleted | S | E2, E5 | `.../retire.rs` | AC9 |
| **T6.9** | CI checks: no-history-rewrite statement scan; dependency-direction; single-choke-point; disjoint-identity; migration forward-only | S | E1 | `infrastructure/ci/` | AC10 + architecture §19 — build fails on a hit |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | Seat domain types + the actor-field binding (ADR-0057) + migrations 0042–0046 |
| E2 | Seat creation & lifecycle; `materialize_founding`; `Seat*` events; Vault mirror |
| E3 | per-Seat Fence enforcement via the single Broker (ADR-0058) |
| E4 | per-Seat budget nesting under the firm month (ADR-0058) |
| E5 | per-Seat working-memory namespace, default-deny isolation (ADR-0059) |
| E6 | the chain-integrity proof — the second-Seat / no-history-rewritten exit criterion |
