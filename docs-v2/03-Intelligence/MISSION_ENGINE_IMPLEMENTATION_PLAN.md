# Mission Engine — Implementation Plan

**The implementation roadmap for the Mission Engine.** Converts
[`MISSION_ENGINE_ARCHITECTURE.md`](MISSION_ENGINE_ARCHITECTURE.md) into an executable backlog of
Epics and independently committable tasks.

| | |
|---|---|
| Milestone | **M10 — Mission Engine** |
| Subsystem | `services/mission/` — crate `sidra-mission` |
| Source of truth | `docs-v2/03-Intelligence/MISSION_ENGINE_ARCHITECTURE.md`. This plan implements it and never amends it. |
| Epics | 12 |
| Tasks | 113 |
| Status | Plan only. **No implementation has begun.** |

---

## 0. How to use this document

### 0.1 The relationship to this document and the architecture

**The architecture document decides. This document sequences.** If a task here appears to specify behaviour
the architecture does not, the task is wrong. Every acceptance criterion below traces to an architecture
section, cited as `ARCH §n`.

Where this plan makes a *choice the architecture left open* — a module boundary, a task split, an ordering —
it says so explicitly. Those are implementation decisions and may be revised by the implementing team without
an ADR. Anything citing `ARCH §n` may not.

### 0.2 Milestone numbering

This plan labels the Mission Engine delivery milestone **M10**, per the instruction that produced it.

The repository-wide sequence in
[`/MASTER_IMPLEMENTATION_GUIDE.md`](../../MASTER_IMPLEMENTATION_GUIDE.md) currently runs M1–M14, and
`ARCH Appendix C` positions the Mission Engine *after* M14 because it depends on the department substrate
(M11–M13). **Both cannot be true.** Two readings are available and the team must pick one before starting:

| Reading | Meaning | Consequence |
|---|---|---|
| **A — Mission Engine track** (assumed here) | "M10" is the tenth milestone *of the Mission Engine track*, independent of the repository-wide sequence | No renumbering needed. This document is internally consistent. Epic 12 depends on department substrate being present. |
| **B — Repository-wide renumber** | The Mission Engine becomes M10 in the master guide's sequence, displacing the current M10 (Hardening and 1.0) | Requires renumbering the master guide and `ARCH Appendix C`, and resolves the department-substrate dependency by moving the Mission Engine earlier — which `ARCH Appendix C` argues against. |

This document assumes **Reading A** throughout and does not renumber anything. Flagged here rather than
resolved silently, because a milestone number that means two things is how two teams build to two schedules.

### 0.3 Epic map against the suggested structure

| Suggested | This plan | Note |
|---|---|---|
| Epic 1 — Mission Domain Model | **E1** | As suggested |
| Epic 2 — Mission Repository | **E2** | As suggested |
| Epic 3 — Mission State Machine | **E3** | As suggested |
| Epic 4 — Dependency Graph | **E4** | As suggested |
| — | **E5 — Planner & Estimation** | **Added.** `ARCH §5–6` requires decomposition and department estimates; these belong to neither Graph nor Scheduler. |
| Epic 7 — Risk Engine | **E6** | Moved earlier: risk determines verification depth, checkpoint policy, retry budget and dispatch gating (`ARCH §11.4`), so it must exist before E7 and E8. |
| Epic 6 — Verification Engine | **E7** | Depends on E6 |
| Epic 5 — Scheduler | **E8** | Moved later: needs graph, risk, and budget reservation |
| — | **E9 — Orchestrator Integration** | **Added.** The Dispatch/Outcome seam (`ARCH §22`) is the subsystem's defining boundary and is too large to bury inside the Scheduler. |
| Epic 8 — Recovery Engine | **E10** | As suggested |
| Epic 9 — Mission APIs | **E11** | As suggested |
| Epic 10 — Desktop Integration | **E12** | As suggested |

Ten suggested epics, twelve delivered. Both additions are seams the architecture treats as first-class and
neither fits inside a neighbour without making that neighbour undeliverable in one review.

### 0.4 Task conventions

- **One task = one commit = one review.** A task that cannot be reviewed in one sitting is too large and must
  be split before it is started.
- **Complexity** is reviewer load, not calendar time. **S** ≈ under 200 lines changed, one concept. **M** ≈
  200–600 lines, or one concept with real edge cases. **L** ≈ 600+ lines or cross-module. **There are no XL
  tasks** — anything larger was split.
- **Every task ships its own tests.** No "tests follow in a later commit". A task without tests is not done
  (§6, DoD).
- **Every task leaves `main` green.** Feature-flagged if incomplete; never broken.

---

## E1 — Mission Domain Model

### Purpose
Establish the vocabulary and invariants of the subsystem as pure, I/O-free types. Everything else in M10
depends on these, so they are built first and changed reluctantly.

### Scope
**In:** Mission aggregate, Charter, Objective, Task, Subtask, plan version, value objects, domain events,
domain-level invariant enforcement.
**Out:** persistence (E2), state transitions (E3), graph algorithms (E4), anything that performs I/O.

### Dependencies
`packages/domain` (v1). No other epic. **E1 blocks every other epic.**

### Components to build
| Component | Responsibility |
|---|---|
| `Mission` aggregate | Identity, charter, objectives, plan versions, current state, policy |
| `Charter` | Constraint envelope — v1 Mandate extended (`ARCH §5.1`) |
| `Objective` | Statement, kind, weight, criteria, verification spec, falsifiability |
| `Task` | Addressing, contract, constraints, graph refs, policy, estimate |
| `Subtask` | Department-owned telemetry record (`ARCH §7.2`) |
| `PlanVersion` | Immutable snapshot: objectives, tasks, edges, rationale, supersedes |
| Value objects | `MissionId`, `TaskId`, `ObjectiveId`, `PlanVersion(u32)`, `Weight`, `PriorityTier`, `EffectClass`, `Money`, `Duration`, `IdempotencyKey`, `ContractRef`, `ArtifactRef` |
| `MissionEvent` | The 30 event kinds from `ARCH §19.2` as a closed enum |

### Public APIs
Constructors returning `Result` on invariant violation; accessors; no setters on authorised plan versions.
`Mission::draft`, `Mission::current_plan`, `Mission::objective`, `Mission::task`, `Objective::is_falsifiable`,
`PlanVersion::supersede`, `MissionEvent::actor`, `MissionEvent::mission_id`.

### Internal APIs
Invariant validators (`validate_weights_sum`, `validate_task_serves_objective`), private constructors used
by the event replay path in E2.

### Data model
Pure in-memory types only. Owns **no** tables. See E2 for persistence.

### Events
Defines all 30 `MissionEvent` variants (`ARCH §19.2`) with payloads, actor, and correlation fields. Emits
none — E1 is types, not behaviour.

### Tests
Unit tests for every invariant; property tests for weight arithmetic and ID uniqueness; serde round-trip for
every event variant; a compile-fail test asserting no I/O crate is reachable from the module.

### Acceptance Criteria
1. Every type in `ARCH §5–7` and `§19.2` is represented.
2. Invariants are unconstructable-around: weights sum to 1.0, ≥1 objective, every task serves ≥1 objective,
   every objective has ≥1 verification method that is not self-report (`ARCH §12.3`).
3. Zero I/O dependencies — enforced by `cargo-deny` and a CI check.
4. Every event serialises and deserialises losslessly.

### Estimated implementation order
First. Nothing proceeds without it.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `sidra-mission` crate: manifest, module skeleton, CI wiring, dependency-direction check | S | — | `services/mission/Cargo.toml`, `services/mission/src/lib.rs`, `infrastructure/ci/` | Crate builds; CI fails on any dependency from `sidra-mission` → `sidra-orchestrator` (`ARCH Appendix B`) |
| **T1.2** | Value objects: IDs, `Weight`, `Money`, `Duration`, `EffectClass`, `PriorityTier`, `IdempotencyKey` | S | T1.1 | `domain/values.rs` | Each rejects invalid construction; `Weight` in [0,1]; `EffectClass` in 0–3; property tests |
| **T1.3** | `Charter` type with all `ARCH §5.1` fields and widening rules | S | T1.2 | `domain/charter.rs` | Charter cannot be narrowed-then-widened except through an explicit principal-authored change; unit tests |
| **T1.4** | `Objective`: kinds, criteria, weight, falsifiability, verification spec | M | T1.2 | `domain/objective.rs` | Objective kind constrains legal verification methods per `ARCH §5.3` table; non-falsifiable objective is rejected at construction |
| **T1.5** | `Task`: addressing by contract, constraints, policy block, estimate block | M | T1.2 | `domain/task.rs` | A task addressing a department **by name** fails construction (`ARCH §6.3` rule 2); effect class ≤ charter enforced |
| **T1.6** | `Subtask` telemetry type, depth cap of one | S | T1.2 | `domain/subtask.rs` | A subtask with a parent subtask fails construction (`ARCH §7.4`) |
| **T1.7** | `PlanVersion`: immutable snapshot, supersession chain | M | T1.4, T1.5 | `domain/plan.rs` | An authorised plan version exposes no mutating method; supersession records rationale (`ARCH §8.5`, ADR-0023) |
| **T1.8** | `Mission` aggregate assembling charter, objectives, plan versions, policy | M | T1.3, T1.7 | `domain/mission.rs` | All aggregate invariants from Acceptance §2 hold; cannot construct an invalid mission |
| **T1.9** | `MissionEvent` enum — all 30 variants with payloads and actor | L | T1.8 | `domain/events.rs` | Every kind in `ARCH §19.2` present; every variant carries actor and mission_id; exhaustive match enforced |
| **T1.10** | Serde and schema round-trip tests for all events and aggregates | M | T1.9 | `domain/tests/roundtrip.rs` | 100% of variants round-trip; schema snapshot committed to detect accidental breaking changes |

---

## E2 — Mission Repository

### Purpose
The single door to Mission state. Append-only writes, version-addressable reads, projections rebuildable from
the log. This is what structurally prevents the Orchestrator from reaching into planning state.

### Scope
**In:** event append, projection tables and rebuild, query layer, read isolation by capability, version
addressing.
**Out:** state transition rules (E3), any domain logic (E1).

### Dependencies
E1. `services/store` (v1 SQLite + event log, ADR-0002). `services/security` for read gating.

### Components to build
| Component | Responsibility |
|---|---|
| `MissionRepository` trait | The interface in `ARCH §18.2` |
| `SqliteMissionRepository` | The only implementation |
| Projection builders | One per table; pure functions from events to rows |
| Rebuild driver | Drop-and-replay for all projections |
| Query layer | Filters, version resolution, evidence and history queries |
| Read gate | Capability check on every query (`ARCH §18.3` rule 4) |

### Public APIs
`append(MissionEvent)` — the only mutation. Reads: `get`, `get_plan`, `list`, `ready_set`, `graph`,
`evidence`, `history`, `outcome_record`, `projection` (`ARCH §18.2`).

### Internal APIs
`apply(event, &mut projections)` per table; `rebuild_all()`; `resolve_version(mission_id, at)`;
`assert_read_allowed(actor, mission_id)`.

### Data model
The ten tables in `ARCH §20.2` plus the four additive columns in `ARCH §20.3`. Migrations
`0019_missions.sql` … `0024_mission_outcomes.sql`, forward-only and idempotent.

### Events
Consumes all 30. Emits none.

### Tests
Projection-rebuild equivalence (drop all, replay, byte-identical); property test that no query path can
write; capability-gating tests; migration idempotency tests; crash-during-append test.

### Acceptance Criteria
1. `append` is the only mutation path in the entire crate — enforced by a visibility test.
2. Dropping every projection table and replaying produces byte-identical rows (`ARCH §18.3` rule 5).
3. `get(id, at_version = n)` returns exactly what version *n* said, forever.
4. A query from an actor without a grant for that Mission is refused, not filtered.
5. Every migration is idempotent and touches no existing column's meaning (`ARCH §20.1`).

### Estimated implementation order
Second. E3 onward all read and write through it.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | `MissionRepository` trait definition | S | E1 | `repository/mod.rs` | Signature matches `ARCH §18.2` exactly; write surface is a single method |
| **T2.2** | Migrations `0019`–`0021`: `missions`, `mission_plans`, `mission_objectives` | M | T2.1 | `services/store/migrations/` | Idempotent; forward-only; rollback rehearsed |
| **T2.3** | Migrations `0022`–`0024`: tasks, edges, evidence, dispatches, risk, outcomes, resources | M | T2.2 | `services/store/migrations/` | As above; foreign keys and indexes declared |
| **T2.4** | Additive columns on `work_orders`, `engagements`, `deliverables`, `budgets` | S | T2.3 | `services/store/migrations/` | All nullable; a null behaves exactly as v1 (`ARCH §20.3`) |
| **T2.5** | Event append path into the existing hash chain | M | T2.1 | `repository/append.rs` | Mission events extend the v1 chain, not a new one; `sidractl vault verify` covers them |
| **T2.6** | Projection builders for mission, plan, objective tables | M | T2.5 | `repository/projections/` | Pure functions; no I/O; unit-tested per event kind |
| **T2.7** | Projection builders for task, edge, dispatch, evidence tables | M | T2.6 | `repository/projections/` | As above |
| **T2.8** | Rebuild driver and equivalence test | M | T2.7 | `repository/rebuild.rs` | Drop-all-and-replay produces byte-identical projections |
| **T2.9** | Query layer: `get`, `get_plan`, `list`, `history`, version resolution | M | T2.7 | `repository/query.rs` | `get(id, at_version)` verified against a multi-version fixture |
| **T2.10** | Query layer: `evidence`, `outcome_record`, `projection`, `graph` | M | T2.9 | `repository/query.rs` | Evidence returns hashes; no query can mutate (property test) |
| **T2.11** | Capability read-gating on every query | M | T2.10, `sidra-security` | `repository/gate.rs` | Ungranted cross-mission read is refused with `permission_denied`, not silently filtered |
| **T2.12** | Markdown mirror writer for `~/Sidra/missions/` | M | T2.9 | `repository/mirror.rs` | Written on state transitions only (`ARCH §20.4`); output readable without the app |

---

## E3 — Mission State Machine

### Purpose
Make illegal state transitions unrepresentable, and make every legal one an event before it is a projection.

### Scope
**In:** states, transitions, guards, actor authorisation, phase gates, invariant enforcement.
**Out:** what happens *inside* a phase (E5–E10).

### Dependencies
E1, E2.

### Components to build
| Component | Responsibility |
|---|---|
| `MissionState` enum | The 14 states in `ARCH §4.1` |
| `TaskState` enum | The 9 task states in `ARCH §6.2` |
| Transition table | Declarative; the `ARCH §4.2` table as data, not `match` arms |
| Guard evaluator | Phase gates from `ARCH §3.3` |
| Actor authoriser | Who may trigger what (`ARCH §4.2` column 4) |
| Invariant checker | The six invariants in `ARCH §4.3` |

### Public APIs
`attempt_transition(mission, to, trigger, actor) -> Result<MissionEvent, TransitionError>`;
`legal_transitions(state) -> Vec<MissionState>`; `gate_status(mission, target_phase)`.

### Internal APIs
`evaluate_gate(mission, gate_id)`; `is_authorised(actor, transition)`; `assert_terminal_is_terminal`.

### Data model
No new tables. Writes `mission.state_changed` and reads current state from E2 projections.

### Events
Emits `mission.state_changed`, `mission.paused`, `mission.resumed`, `mission.rejected`,
`mission.superseded`, and the phase-specific events (`mission.planned`, `mission.authorised`, …).

### Tests
Exhaustive transition matrix test (every state × every trigger × every actor class); property test that no
sequence of legal transitions leaves a terminal state; authorisation tests for the three Principal-only
transitions.

### Acceptance Criteria
1. Every transition in `ARCH §4.2` is permitted; **every transition not in it is refused.**
2. `AWAITING_AUTH → READY`, `→ ABANDONED`, and objective waiver are refusable to every actor except the
   Principal, including Kai and every Office (`ARCH §4.3` invariants 1–2).
3. Terminal states have zero outgoing transitions.
4. Entering `BLOCKED` always emits an event (`ARCH §4.3` invariant 3).
5. State is never written except as a projection of an event.

### Estimated implementation order
Third. E5–E10 all drive transitions.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | `MissionState` and `TaskState` enums with terminality marking | S | E1 | `state/states.rs` | Terminal states identifiable at type level; exhaustive matching enforced |
| **T3.2** | Declarative transition table as data | M | T3.1 | `state/table.rs` | Table is data, not code; a new transition is a data change reviewable in a diff |
| **T3.3** | Transition engine over the table | M | T3.2 | `state/engine.rs` | Exhaustive matrix test passes; unlisted transitions refused |
| **T3.4** | Actor authorisation layer | M | T3.3, `sidra-security` | `state/authorise.rs` | The three Principal-only transitions are refused to all agent actors |
| **T3.5** | Phase gate evaluators for the seven gates in `ARCH §3.3` | L | T3.3, E4 (partial) | `state/gates.rs` | Each gate is independently testable; failure names the specific unmet condition |
| **T3.6** | Invariant checker for the six `ARCH §4.3` invariants | M | T3.3 | `state/invariants.rs` | Property test: no legal transition sequence violates any invariant |
| **T3.7** | Task state machine and terminal classification (incl. `FAILED_ACCEPTED`) | M | T3.1 | `state/task_state.rs` | `FAILED_ACCEPTED` distinct from `SUCCEEDED` in all queries (`ARCH §6.2`) |

---

## E4 — Dependency Graph

### Purpose
Build, validate, and derive properties from the Task graph. Everything the Scheduler does depends on this
being correct and fast.

### Scope
**In:** graph construction, six edge kinds, validation rules, derived properties, immutability per plan
version.
**Out:** deciding what to dispatch (E8); creating tasks (E5).

### Dependencies
E1, E2.

### Components to build
| Component | Responsibility |
|---|---|
| `TaskGraph` | Adjacency structure per plan version |
| Edge kind evaluator | Satisfaction predicate per kind (`ARCH §8.2`) |
| Validator | The six rules in `ARCH §8.3` |
| Property deriver | Ready set, critical path, slack, blocking factor, fan-in risk, SPOF (`ARCH §8.4`) |
| Immutability guard | Graph is frozen within a plan version (`ARCH §8.5`) |

### Public APIs
`TaskGraph::build(plan_version)`; `validate() -> Result<(), Vec<GraphError>>`; `ready_set(state)`;
`critical_path()`; `slack(task_id)`; `blocking_factor(task_id)`; `derived_properties()`.

### Internal APIs
`topological_order()`; `detect_cycles() -> Option<Vec<TaskId>>`; `longest_path(weights)`;
`transitive_closure()`; `is_satisfied(edge, state)`.

### Data model
`mission_edges` (E2). Derived properties are computed and cached in-memory, invalidated on any Outcome.

### Events
Emits none directly. Supplies `task.ready` / `task.blocked` determinations to E8.

### Tests
Property tests on generated DAGs; cycle detection with the cycle path asserted; critical path against
hand-computed fixtures; each edge kind's satisfaction predicate; performance test at 40-task depth and
200-task width.

### Acceptance Criteria
1. All six edge kinds implemented with distinct satisfaction semantics (`ARCH §8.2`).
2. A cycle is refused with the **cycle path named**; no auto-resolution (`ARCH §8.3` rule 1).
3. `artifact` edges require the artifact to exist **and pass its Guards** — not merely that the predecessor
   finished.
4. Depth > 40 and unresolvable contracts fail validation with the specific item named.
5. Derived properties recompute in < 50 ms for a 200-task graph.
6. No API permits edge mutation within an authorised plan version.

### Estimated implementation order
Fourth, parallel with E6.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | `TaskGraph` structure and construction from a plan version | M | E1, E2 | `graph/mod.rs` | Builds from `mission_edges`; immutable once constructed |
| **T4.2** | Six edge kinds with satisfaction predicates | M | T4.1 | `graph/edges.rs` | `artifact` edge unsatisfied when the artifact exists but fails a Guard |
| **T4.3** | Cycle detection returning the cycle path | M | T4.1 | `graph/cycles.rs` | Error names every task in the cycle, in order |
| **T4.4** | Validator: the six `ARCH §8.3` rules | M | T4.2, T4.3 | `graph/validate.rs` | Each rule independently testable; orphan tasks and objectives both caught |
| **T4.5** | Ready-set computation | M | T4.2 | `graph/ready.rs` | Correct against fixtures covering all six edge kinds |
| **T4.6** | Critical path and slack via p90 back-propagation | L | T4.1 | `graph/critical_path.rs` | Matches hand-computed fixtures; uses p90 not p50 (`ARCH §10.2`) |
| **T4.7** | Blocking factor, fan-in risk, single-point-of-failure detection | M | T4.1 | `graph/properties.rs` | Transitive closure correct; SPOF definition matches `ARCH §8.4` |
| **T4.8** | Property caching and invalidation on Outcome | M | T4.5, T4.6 | `graph/cache.rs` | 200-task recompute < 50 ms; cache never serves stale data after an event |
| **T4.9** | Resource-edge deadlock detection at validation time | M | T4.2 | `graph/resources.rs` | Two tasks sharing an exclusive resource without a path or explicit edge fail validation (`ARCH §8.3` rule 6) |

---

## E5 — Planner & Estimation

### Purpose
Turn Objectives into a Task graph: decompose, resolve contracts, gather department estimates, and produce a
plan version that can be appraised. **Added epic** — `ARCH §5–6` requires this and it belongs to neither E4
nor E8.

### Scope
**In:** decomposition into Tasks, contract resolution via the Registrar, estimate solicitation via the
Exchange, estimate calibration from memory, plan version assembly, PLANNING gate satisfaction.
**Out:** risk (E6), verification specs (E7), scheduling (E8), replanning mechanics (E10).

### Dependencies
E1, E2, E3, E4. `sidra-departments` (Registrar, contract resolution). `sidra-orchestrator` (Exchange, for
estimate requests — read-only use of an existing mechanism). `sidra-memory`.

### Components to build
| Component | Responsibility |
|---|---|
| `Decomposer` | Objective → candidate Tasks. **Model-assisted**, and the only such component in M10. |
| `ContractResolver` | Task contract → installed departments providing it |
| `EstimateCollector` | Exchange requests to department heads for cost and duration |
| `EstimateCalibrator` | Adjust estimates from historical actuals (`ARCH §23.2`) |
| `PlanAssembler` | Assemble tasks + edges into an immutable `PlanVersion` |

### Public APIs
`plan(mission) -> Result<PlanVersion, PlanError>`; `estimate(task) -> Estimate`;
`resolve_contract(contract) -> Vec<DepartmentId>`.

### Internal APIs
`propose_tasks(objective)`; `derive_edges(tasks)`; `request_estimate(task, department)`;
`historical_actuals(task_signature)`; `calibrate(raw, history)`.

### Data model
Writes `mission_plans`, `mission_tasks`, `mission_edges`. Reads procedural and episodic memory.

### Events
`mission.planned` with plan version, task set, graph, estimates. `mission.objective_revised` when planning
reveals an objective needs restating.

### Tests
Golden-file tests: fixed objectives + stubbed model responses → expected task set. Contract resolution
against fixture department manifests. Estimate calibration against synthetic history. **Planning-cost budget
test** asserting the G9 ratio.

### Acceptance Criteria
1. Every produced Task addresses a **contract**, never a department name (`ARCH §6.3` rule 2).
2. An unresolvable contract produces `INFEASIBLE` naming the contract — never a silent fallback to a
   general-purpose agent (`ARCH §8.3` rule 3).
3. Estimates cite their source: `department`, `historical`, or `heuristic` (`ARCH §23.5` rule 3).
4. Absent history raises the estimate spread; it never narrows it (`ARCH §11.5` rule 4).
5. Planning cost is recorded per Mission and the G9 ratio (median ≤8%, p95 ≤15%) is measurable from day one.
6. A plan contradicting Canon fails the gate with the specific fact named (`ARCH §23.5` rule 2).

### Estimated implementation order
Fifth. The first epic that consumes a model, and the only one.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | `ContractResolver` over the Registrar | M | E1, `sidra-departments` | `planner/contracts.rs` | Unresolvable contract returns a named error, not an empty list |
| **T5.2** | Canon and Registry constraint loading for the affected domain | M | T5.1, `sidra-memory` | `planner/constraints.rs` | Constraints returned with provenance; missing Canon access fails closed |
| **T5.3** | `Decomposer`: objective → candidate tasks (model-assisted) | L | T5.2 | `planner/decompose.rs` | Golden-file tests with stubbed responses; output is always contract-addressed |
| **T5.4** | Edge derivation from task inputs and outputs | M | T5.3, E4 | `planner/edges.rs` | `artifact` edges derived from declared outputs; produced graph passes E4 validation |
| **T5.5** | `EstimateCollector` via Exchange requests to department heads | M | T5.3 | `planner/estimates.rs` | Cost charged to the requesting Mission's budget; timeout falls back to `heuristic` with widened spread |
| **T5.6** | Historical calibration from procedural memory | M | T5.5, `sidra-memory` | `planner/calibrate.rs` | Absent history widens spread; source field always populated |
| **T5.7** | `PlanAssembler` producing an immutable `PlanVersion` | M | T5.4, T5.6 | `planner/assemble.rs` | Assembled version passes the PLANNING gate or reports every unmet condition |
| **T5.8** | Planning cost accounting and the G9 ratio metric | S | T5.7 | `planner/cost.rs` | Ratio queryable per Mission; exceeding p95 is flagged at conclusion |

---

## E6 — Risk Engine

### Purpose
Score risk mechanically across six dimensions and **use the score to set policy**. Moved ahead of
verification and scheduling because both consume its output.

### Scope
**In:** six dimensions, aggregation, banding, policy derivation, recomputation on Outcome, Security Office
override.
**Out:** applying the derived policies (E7 verification depth, E8 dispatch gating, E10 checkpointing).

### Dependencies
E1, E2, E4 (graph properties), `sidra-memory` (novelty scoring).

### Components to build
| Component | Responsibility |
|---|---|
| Six dimension scorers | Reversibility, specification, novelty, dependency fragility, cost variance, blast radius |
| `RiskAggregator` | The `max ⊕ mean` formula in `ARCH §11.3` |
| `RiskBander` | Score → Low / Moderate / High / Severe |
| `PolicyDeriver` | Band → verification count, checkpoint policy, retry budget, review requirement, autonomy |
| Recomputer | Re-score on every Outcome |

### Public APIs
`assess_task(task, graph, history) -> TaskRisk`; `assess_mission(mission) -> MissionRisk`;
`derive_policy(band) -> RiskPolicy`; `override_band(task, band, actor, reason)`.

### Internal APIs
One scorer per dimension; `aggregate(dimensions)`; `band(score)`.

### Data model
`mission_risk` — per-dimension scores with recompute history.

### Events
`mission.risk_changed` on any band change, with cause.

### Tests
Table-driven test per dimension against the `ARCH §11.2` 0-and-3 anchors. Aggregation test asserting that a
class-3 effect **cannot** be averaged into a comfortable band. Policy derivation matrix test against
`ARCH §11.4`. Monotonicity property: no input change lowers a band without evidence.

### Acceptance Criteria
1. All six dimensions derive mechanically — **no model call anywhere in this epic**.
2. Reversibility and blast radius enter via `max`, never a mean (`ARCH §11.3`).
3. Severe band forces: approval before dispatch, no auto-retry, three verification methods, pre-effect
   checkpointing (`ARCH §11.4`).
4. Unknown scores as 3, never 0 (`ARCH §11.5` rule 4).
5. The Security Office can raise a band and no Division executive can lower it (`ARCH §11.5` rule 3).

### Estimated implementation order
Fourth, parallel with E4.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | Reversibility and blast-radius scorers | S | E1 | `risk/dimensions/effect.rs` | Derived from effect class and declared outputs; table-driven tests |
| **T6.2** | Specification scorer from verification-method coverage of criteria | M | E1 | `risk/dimensions/specification.rs` | Criteria with no mechanical method raise the score |
| **T6.3** | Novelty scorer from procedural memory task-signature lookup | M | `sidra-memory` | `risk/dimensions/novelty.rs` | Absent history → 3; ≥5 successful comparables → 0 |
| **T6.4** | Dependency-fragility scorer from graph properties | S | E4 | `risk/dimensions/fragility.rs` | Fan-in ≥4 and critical-path SPOF both detected |
| **T6.5** | Cost-variance scorer from estimate spread and source | S | E5 | `risk/dimensions/variance.rs` | p90/p50 ≥3.0 or absent basis → 3 |
| **T6.6** | Aggregator with the `max ⊕ mean` formula and banding | M | T6.1–T6.5 | `risk/aggregate.rs` | Property test: no combination averages a class-3 effect below High |
| **T6.7** | `PolicyDeriver` implementing the `ARCH §11.4` matrix | M | T6.6 | `risk/policy.rs` | All four rows produce the exact specified policy; matrix test |
| **T6.8** | Recomputation on Outcome and `mission.risk_changed` emission | M | T6.6, E2 | `risk/recompute.rs` | Band change always emits with cause; no silent downgrade |
| **T6.9** | Security Office band override path | S | T6.8, `sidra-security` | `risk/override.rs` | Division executive cannot lower an Office-raised band |

---

## E7 — Verification Engine

### Purpose
Evaluate Objectives against evidence. The mechanism that makes ADR-0025 real: no self-reported progress is
ever authoritative.

### Scope
**In:** ten verification methods, evidence collection and hashing, objective outcome evaluation, waiver
handling, verifier-department separation.
**Out:** review (Offices, existing v2 mechanism); progress display (E12).

### Dependencies
E1, E2, E6 (risk sets required evidence count), `sidra-security` (Guard results), `sidra-orchestrator`
(independent agent checks are dispatched like any other work).

### Components to build
| Component | Responsibility |
|---|---|
| Ten method evaluators | One per row of `ARCH §12.2` |
| `EvidenceStore` | Immutable, hash-referenced evidence records |
| `ObjectiveEvaluator` | Evidence set → `met` / `partially_met` / `unmet` / `inconclusive` |
| `VerifierSelector` | Chooses an independent agent from a different department |
| `WaiverHandler` | Principal-only, creates a Decision |

### Public APIs
`verify_objective(objective) -> ObjectiveOutcome`; `add_evidence(objective, evidence)`;
`required_evidence_count(objective, risk_band)`; `waive(objective, principal, rationale)`.

### Internal APIs
One `evaluate_*` per method; `select_verifier(task, exclude_department)`; `hash_evidence(artifact)`.

### Data model
`mission_evidence` — objective, method, artifact hash, verifier, verdict, timestamp.

### Events
`objective.evidence_added`, `objective.evaluated`, `objective.waived`.

### Tests
One test per method, positive and negative. A test asserting **`self_report` is not a constructible method**.
Verifier-selection test asserting rejection when the verifier's department equals the author's.
`inconclusive` never defaults to `met` under any input, including deadline pressure.

### Acceptance Criteria
1. `self_report` is absent from the method enum — unrepresentable, not merely rejected (ADR-0025).
2. `independent_agent_check` refuses a verifier from the author's department (`ARCH §12.3` rule 3).
3. Evidence is immutable and referenced by hash; re-verification after change is a new evaluation.
4. `inconclusive` escalates and never becomes `met` by default or by time (`ARCH §12.3` rule 5).
5. `waived` is Principal-only and produces a Decision record (`ARCH §12.4`).
6. Required evidence count comes from the risk band, not from the task author.

### Estimated implementation order
Sixth, after E6.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T7.1** | Method enum and evidence types; hashing | S | E1 | `verify/methods.rs` | `self_report` unrepresentable; evidence carries an artifact hash |
| **T7.2** | Deterministic evaluators: `artifact_exists`, `content_pattern`, `metric_threshold` | M | T7.1 | `verify/deterministic.rs` | Positive and negative tests each; no I/O beyond the Vault read |
| **T7.3** | Integration evaluators: `guard_pass`, `test_pass` | M | T7.2, `sidra-security` | `verify/guards.rs` | Guard verdict consumed, not re-derived |
| **T7.4** | Record evaluators: `decision_recorded`, `registry_entry_added` | S | T7.2 | `verify/records.rs` | Reads v1 decision engine and v2 registries without duplicating them |
| **T7.5** | Judgement evaluators: `office_review`, `principal_confirmation` | M | T7.1 | `verify/judgement.rs` | Verdict recorded with actor and reasoning; never inferred |
| **T7.6** | `independent_agent_check` with department-separation enforcement | L | T7.5, E9 | `verify/independent.rs` | Same-department verifier refused before dispatch (`ARCH §12.3` rule 3) |
| **T7.7** | `ObjectiveEvaluator` producing the five outcomes | M | T7.2–T7.6, E6 | `verify/evaluate.rs` | `partially_met` records the criterion-by-criterion split |
| **T7.8** | Waiver path creating a Decision | S | T7.7 | `verify/waive.rs` | Principal-only; rejected for every agent actor including Kai |

---

## E8 — Scheduler

### Purpose
Decide what runs next, deterministically, with no model call. The component that must be explicable at 2 a.m.

### Scope
**In:** the six-step loop, filtering, ordering, budget and resource reservation, concurrency caps, fairness,
preemption at checkpoint boundaries, quiet hours.
**Out:** emitting the Dispatch envelope and handling the Outcome (E9).

### Dependencies
E1–E4, E6. `sidra-security` (capability filter), `sidra-models` (budget ceilings), `sidra-departments`
(autoscale ceilings).

### Components to build
| Component | Responsibility |
|---|---|
| `TickDriver` | Event-driven wake on Outcome, budget restore, approval, deadline, resource release |
| `Admitter` | Collect READY and RUNNING missions |
| `Filter` | The seven drop conditions in `ARCH §17.2` step 3 |
| `Orderer` | Tier then five lexicographic keys (`ARCH §9.3`) |
| `Reserver` | Budget and exclusive-resource reservation before dispatch |
| `ConcurrencyGovernor` | Four simultaneous caps (`ARCH §17.3`) |
| `FairnessGuard` | Anti-starvation, P3 floor, department fairness |
| `PriorityInheritor` | Inversion resolution (`ARCH §9.4`) |

### Public APIs
`tick() -> Vec<DispatchCandidate>`; `reserve(candidate) -> Result<Reservation>`;
`release(reservation)`; `explain(candidate) -> OrderingTrace`.

### Internal APIs
`ready_set_all()`; `apply_filters()`; `sort_keys(task)`; `check_caps()`; `inherit_priority(path)`.

### Data model
`mission_resources` for exclusive locks. Reservations held in-memory with durable intent recorded as events.

### Events
`task.ready`, `task.blocked`, `mission.priority_changed` (including inheritance).

### Tests
**Determinism property test: identical state → identical selection, 10,000 randomised states.** Starvation
test over a long horizon. P0 cap test asserting refusal of a third. Priority inversion test. Budget
double-reservation test under concurrency. Quiet-hours test.

### Acceptance Criteria
1. **Zero model calls.** Enforced by a test asserting `sidra-models` is unreachable from this module.
2. Identical state produces identical Dispatch selection (G5).
3. Filtering happens **before** ordering, so an unaffordable task never blocks the queue head
   (`ARCH §17.2`).
4. Budget is reserved before dispatch; two candidates cannot both claim the last of a ceiling.
5. A third concurrent P0 is refused, requiring explicit demotion (`ARCH §9.2`).
6. Priority inheritance resolves inversion and emits an event (`ARCH §9.4`).
7. `explain()` returns the ordering keys that produced a decision, so it is auditable after the fact.

### Estimated implementation order
Seventh. The critical-path epic.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T8.1** | `TickDriver` with the six wake sources | M | E2, E3 | `scheduler/tick.rs` | Event-driven, not polled; no wake source missed |
| **T8.2** | Admission and cross-mission ready-set assembly | S | E4 | `scheduler/admit.rs` | Includes READY and RUNNING missions only |
| **T8.3** | Filter: budget, capability, effect ceiling, severe-band approval | M | T8.2, E6, `sidra-security` | `scheduler/filter.rs` | Each condition independently testable; severe band without approval always dropped |
| **T8.4** | Filter: department autoscale, parallelism caps, resource locks | M | T8.3, `sidra-departments` | `scheduler/filter.rs` | Four concurrency levels evaluated; minimum applies |
| **T8.5** | Orderer: tier plus five lexicographic keys | M | T8.4 | `scheduler/order.rs` | Deterministic; `explain()` returns the key values used |
| **T8.6** | Budget and resource reservation with release | L | T8.5, `sidra-models` | `scheduler/reserve.rs` | Concurrency test: no double-reservation of the final ceiling amount |
| **T8.7** | Priority inheritance along dependency paths | M | T8.5, E4 | `scheduler/inherit.rs` | Transitive along the path; released when blocking ends; event emitted |
| **T8.8** | Fairness: anti-starvation, P3 floor, department fairness | M | T8.5 | `scheduler/fairness.rs` | Starvation test over 10,000 ticks; P3 floor honoured whenever budget permits |
| **T8.9** | P0 cap of two with explicit-demotion requirement | S | T8.5 | `scheduler/tiers.rs` | Third P0 refused with a message naming the two active |
| **T8.10** | Quiet hours and unattended-execution gating | S | T8.4 | `scheduler/hours.rs` | Class ≥2 queues outside working hours; Night Shift unaffected |
| **T8.11** | Determinism property test harness | M | T8.5 | `scheduler/tests/determinism.rs` | 10,000 randomised states, identical repeated selection |

---

## E9 — Orchestrator Integration

### Purpose
Build the seam. Two envelopes, one write direction each, and a compile-time guarantee that neither subsystem
can perform the other's function. **Added epic** — this is the defining boundary of the architecture
(ADR-0022) and is too large to bury inside E8.

### Scope
**In:** Dispatch envelope emission, Outcome intake, failure classification, dispatch correlation,
pre-flight capability validation, retry decisions.
**Out:** anything the Orchestrator does internally; scheduling (E8).

### Dependencies
E1–E3, E6, E8. `sidra-orchestrator` (additive changes only). `sidra-security` (pre-flight).

### Components to build
| Component | Responsibility |
|---|---|
| `DispatchEmitter` | Work Order + five fields (`ARCH §22.2`) |
| `OutcomeIntake` | The single write path from execution into planning |
| `FailureClassifier` | Eight classes from the structured error (`ARCH §13.2`) |
| `RetryDecider` | Eligibility, backoff, retry budget, hard prohibitions |
| `PreflightValidator` | Whole-plan capability and budget projection (ADR-0027) |
| `DispatchCorrelator` | Dispatch ↔ Work Order ↔ Engagement mapping |

### Public APIs
`emit_dispatch(candidate, reservation) -> DispatchId`; `record_outcome(outcome) -> Result<()>`;
`classify(error) -> FailureClass`; `preflight(plan) -> PreflightResult`.

### Internal APIs
`build_work_order(task)`; `decide_retry(task, class, attempt)`; `backoff(attempt)`;
`reconcile_inflight()` (used by E10).

### Data model
`mission_dispatches`. Additive `mission_id` / `task_id` / `plan_version` on `work_orders`.

### Events
`task.dispatched`, `task.outcome`, `task.failed` (with class), `task.retried`,
`mission.preflight_passed` / `.failed`.

### Tests
Envelope round-trip. **Compatibility test: a v1-shaped Orchestrator handed a Dispatch ignores the five new
fields and executes correctly.** Classification table test for all eight classes. Retry prohibition tests
(class 3, Severe band, missing idempotency key). Pre-flight test against fixture grants.

### Acceptance Criteria
1. `task.record_outcome` is the **only** write from Orchestrator into Mission state — enforced by a
   visibility test (G3, ADR-0022).
2. No path from `sidra-mission` invokes a model, tool, or agent — enforced by the dependency check from T1.1.
3. Classification derives from the **structured error**, never the agent's prose (ADR-0028).
4. `retryable_hint` is advisory; the Mission Engine may refuse a retry the Orchestrator believed safe.
5. No auto-retry at effect class 3, in the Severe band, or without an idempotency key.
6. Pre-flight is a **projection, not a grant**; every Dispatch is still checked individually at execution
   (ADR-0027).
7. A revoked grant between planning and dispatch causes a clean `permission` failure, not a crash.

### Estimated implementation order
Eighth. Cannot start before E8; blocks E10 and E11.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T9.1** | Dispatch envelope type and builder from a Task | M | E1, E8 | `integration/dispatch.rs` | Five new fields plus the unchanged v1 Work Order contract |
| **T9.2** | Orchestrator-side acceptance of the Dispatch envelope | M | T9.1 | `services/orchestrator/` (additive) | v1-shaped handling test: five fields ignored, execution correct |
| **T9.3** | Outcome envelope type with structured error block | M | T9.1 | `integration/outcome.rs` | Structured `class`, `code`, `detail`, `retryable_hint` |
| **T9.4** | Orchestrator emits Outcome; `task.record_outcome` as the single write | M | T9.3 | `services/orchestrator/`, `integration/intake.rs` | Visibility test: no other Orchestrator → Mission write path compiles |
| **T9.5** | `FailureClassifier` for all eight classes | M | T9.4 | `integration/classify.rs` | Table test; `unknown` treated as `deterministic` (never permissive) |
| **T9.6** | `RetryDecider`: eligibility, backoff with jitter, retry budget | M | T9.5, E6 | `integration/retry.rs` | Retries draw on task budget; exhaustion fails terminally regardless of `max` |
| **T9.7** | Retry hard prohibitions | S | T9.6 | `integration/retry.rs` | Class 3, Severe band, and missing idempotency key each independently block retry |
| **T9.8** | `PreflightValidator` against the Permission Broker | L | E5, `sidra-security` | `integration/preflight.rs` | Ungrantable → INFEASIBLE naming the capability; grantable-ungranted → one consolidated request |
| **T9.9** | Dispatch correlation table and queries | S | T9.4 | `integration/correlate.rs` | Dispatch ↔ Work Order ↔ Engagement resolvable in both directions |
| **T9.10** | Subtask telemetry intake (upward-only) | M | T9.4 | `integration/subtask.rs` | No API exists by which the Mission Engine writes a subtask (`ARCH §7.3`) |

---

## E10 — Recovery Engine

### Purpose
Keep a Mission alive through failure, crash, and being wrong. Checkpoints, cascade evaluation, replanning,
and crash reconciliation.

### Scope
**In:** checkpoint policies, cascade evaluation, replanning with supersession, delta authorisation, crash
recovery and in-flight reconciliation.
**Out:** retry of a single Task (E9); the planning itself (E5, reused).

### Dependencies
E1–E6, E9.

### Components to build
| Component | Responsibility |
|---|---|
| `Checkpointer` | Four policies driven by risk band (`ARCH §14.1`) |
| `CascadeEvaluator` | Blast radius of a terminal failure; objective reachability |
| `Replanner` | Open version *n+1*, preserve completed work as inputs |
| `DeltaAuthoriser` | Classify what changed → notification or approval (`ARCH §14.4`) |
| `CrashRecoverer` | Replay to checkpoint; reconcile in-flight dispatches |

### Public APIs
`checkpoint(mission)`; `evaluate_cascade(failed_task) -> CascadeResult`; `replan(mission, trigger)`;
`recover_on_start() -> Vec<RecoveredMission>`.

### Internal APIs
`reachable_objectives(graph, state)`; `alternative_path(objective)`; `preserve_completed(old, new)`;
`classify_delta(old, new)`; `reconcile_dispatch(dispatch)`.

### Data model
Checkpoints are events, not rows. Replans write new `mission_plans` rows and set `superseded_by`.

### Events
`mission.replanned` (from/to version, trigger, preserved work); checkpoint markers within
`mission.state_changed`.

### Tests
**Chaos suite: `kill -9` at every Mission state transition**, restart, assert resumption with no duplicated
effect. Cascade tests for the four `ARCH §14.2` situations. Replan-preserves-evidence test. `replan_max`
exhaustion test. Reconciliation test for lost dispatch with and without an idempotency key.

### Acceptance Criteria
1. `kill -9` at any state transition recovers with no duplicated effect (G7).
2. A lost dispatch **without** an idempotency key is marked `unknown` and escalated — never assumed
   incomplete (`ARCH §14.5` rule 3).
3. Replanning preserves all completed Tasks and evidence as inputs (ADR-0029).
4. Version *n* is never mutated by replanning; it is superseded with rationale.
5. `replan_max` exhaustion concludes `partially_completed` — it never loops (`ARCH §14.3`).
6. Delta authorisation asks the Principal only for the four cases in `ARCH §14.4`.

### Estimated implementation order
Ninth. Depends on E9's reconciliation surface.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T10.1** | `Checkpointer` with four risk-driven policies | M | E6, E2 | `recovery/checkpoint.rs` | Severe band checkpoints before every effect |
| **T10.2** | Objective reachability and alternative-path analysis | L | E4 | `recovery/reachability.rs` | Correct against fixtures with and without alternative paths |
| **T10.3** | `CascadeEvaluator` covering the four `ARCH §14.2` outcomes | M | T10.2 | `recovery/cascade.rs` | `critical` objectives declared at planning, not decided at failure |
| **T10.4** | `Replanner`: open version n+1, preserve completed work | L | T10.3, E5 | `recovery/replan.rs` | Evidence and completed tasks appear as inputs to the new plan |
| **T10.5** | `replan_max` bounding and `partially_completed` conclusion | S | T10.4 | `recovery/replan.rs` | Exhaustion concludes with a Brief stating why planning failed twice |
| **T10.6** | `DeltaAuthoriser` classifying changes into notify vs approve | M | T10.4 | `recovery/delta.rs` | The four approval-requiring cases each tested; scope reduction notifies only |
| **T10.7** | Crash recovery: replay to checkpoint, rebuild projections | L | E2, T10.1 | `recovery/crash.rs` | Projections rebuilt, never trusted; resumption from last durable point |
| **T10.8** | In-flight dispatch reconciliation with the Orchestrator | L | T10.7, E9 | `recovery/reconcile.rs` | Idempotency key present → re-dispatch; absent → `unknown` + escalate |
| **T10.9** | Chaos harness: kill at every state transition | L | T10.8 | `infrastructure/testing/chaos/mission/` | Every transition covered; zero duplicated effects across the suite |

---

## E11 — Mission APIs

### Purpose
Expose the subsystem through the v1 command/query surface, with the three Principal-only commands enforced
at the API boundary rather than deeper.

### Scope
**In:** 19 commands, 12 queries, capability gating, command idempotency, Office plan-review endpoints.
**Out:** the UI that calls them (E12).

### Dependencies
E1–E10. `sidra-security`, `sidra-kernel` (command bus).

### Components to build
| Component | Responsibility |
|---|---|
| Command handlers | The 19 commands in `ARCH §21.1` |
| Query handlers | The 12 queries in `ARCH §21.2` |
| `CommandAuthoriser` | Actor gating, including the three Principal-only commands |
| Idempotency layer | Command-ID deduplication |
| Plan-review endpoints | Office submission and verdict recording |

### Public APIs
The full `mission.*`, `task.*`, `subtask.*`, `objective.*` command and query surface.

### Internal APIs
`dispatch_command(cmd, actor)`; `assert_principal(actor)`; `dedupe(command_id)`.

### Data model
No new tables. Idempotency keyed on command ID with a bounded retention window.

### Events
Every command emits its corresponding event through E2. Queries emit none.

### Tests
Authorisation matrix: every command × every actor class. Idempotency test: replayed command applies once.
Query-purity property test. Contract tests against `ARCH §21.1–21.2` signatures.

### Acceptance Criteria
1. `mission.authorise`, `mission.abandon`, and `mission.waive_objective` are refused to **every** agent actor
   including Kai and all four Offices (`ARCH §21.3` rule 2).
2. `task.record_outcome` is callable only by the Orchestrator.
3. Commands are idempotent by command ID (`ARCH §21.3` rule 3).
4. No query mutates — property test over the full surface.
5. Queries are capability-gated; a department sees only Missions it participates in.
6. No API mutates a plan version (`ARCH §21.3` rule 5).

### Estimated implementation order
Tenth. Depends on everything it exposes.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T11.1** | Command bus registration and envelope types | S | E2, `sidra-kernel` | `api/mod.rs` | Follows the v1 command/query split exactly |
| **T11.2** | Lifecycle commands: create, add_objective, plan, appraise | M | E3, E5 | `api/lifecycle.rs` | Each drives a state transition through E3, never a direct write |
| **T11.3** | Authorisation commands: submit_for_review, record_review, authorise, reject | M | T11.2, E3 | `api/authorise.rs` | `authorise` refused to Kai and all Offices |
| **T11.4** | Control commands: pause, resume, supersede, abandon, set_priority | M | T11.2 | `api/control.rs` | `abandon` Principal-only; Security Office pause permitted |
| **T11.5** | Execution commands: task.cancel, task.record_outcome, subtask.report | M | E9 | `api/execution.rs` | `record_outcome` callable only by the Orchestrator |
| **T11.6** | Objective commands: add_evidence, waive_objective | S | E7 | `api/objective.rs` | `waive_objective` Principal-only and creates a Decision |
| **T11.7** | Query handlers: get, get_plan, list, graph, history | M | E2 | `api/queries.rs` | Version-addressable; capability-gated |
| **T11.8** | Query handlers: progress, projection, evidence, risk, outcome, cost_breakdown | M | T11.7, E6, E7 | `api/queries.rs` | `progress` returns three separate figures, never merged |
| **T11.9** | Command idempotency layer | M | T11.1 | `api/idempotency.rs` | Replayed command applies exactly once |
| **T11.10** | Authorisation matrix tests across all commands and actor classes | M | T11.1–T11.6 | `api/tests/authz.rs` | Every cell of the matrix asserted |

---

## E12 — Desktop Integration

### Purpose
Make the plan visible. The Principal reads a Mission before authorising it, and sees verified progress
rather than a comfortable number.

### Scope
**In:** Mission list, Mission detail, plan view, graph view, approval flow, progress display, Brief
integration, palette verbs, keyboard bindings.
**Out:** any new design tokens or components outside the Night Atrium contract.

### Dependencies
E11. `packages/ui`, `packages/design`, `packages/bindings`, `apps/desktop`.

### Components to build
| Component | Responsibility |
|---|---|
| `MissionList` | Filterable list by state, tier, department, deadline |
| `MissionDetail` | Charter, objectives, progress, risk, cost |
| `PlanView` | The plan as authorised, version-selectable |
| `GraphView` | Dependency graph with critical path highlighted |
| `ProgressStrip` | Three figures: Verified, Executed, Reported |
| `ApprovalPanel` | Single authorisation with the capability list in plain language |
| Palette verbs | `Plan…`, `Approve mission…`, `Pause mission…`, `Show mission…` |

### Public APIs
React components consuming generated bindings only. No hand-written types crossing the boundary.

### Internal APIs
Query hooks per `ARCH §21.2`; graph layout; state colour mapping within existing Division hues.

### Data model
None. Read-only over E11 queries.

### Events
Emits commands through E11. Consumes projections.

### Tests
Component tests per view. Performance test: plan view renders in < 400 ms for a 60-task Mission (G1).
Accessibility audit at WCAG AA. Token-contract test asserting no colour, type, or spacing outside the design
tokens. **Progress-labelling test asserting Reported is never presented as Verified.**

### Acceptance Criteria
1. Full plan renders in **< 400 ms** for a 60-task Mission (G1).
2. **One** approval interaction per Mission, showing objectives, cost range, risk band, and requested
   capabilities in plain language (G12, `ARCH §25.1`).
3. Progress shows *Verified* by default; *Executed* and *Reported* live in the Inspector and are labelled
   (`ARCH §15.3`).
4. No new design tokens; only Night Atrium primitives (v1 design system, unchanged).
5. Mission detail is **pull, never push** — no Mission notification outside the existing five conditions
   (`ARCH §15.5`).
6. Keyboard-navigable; WCAG AA contrast throughout.

### Estimated implementation order
Eleventh and last. Can begin against stubbed queries once E11 signatures are frozen.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T12.1** | Generate TypeScript bindings for Mission domain types | S | E1, E11 | `packages/bindings/` | Generated only; hand-editing fails CI (ADR-0011) |
| **T12.2** | `MissionList` with filters | M | T12.1 | `apps/desktop/src/features/mission/` | Filters by state, tier, department, deadline; virtualised |
| **T12.3** | `MissionDetail`: charter, objectives, cost, risk | M | T12.2 | `.../mission/Detail.tsx` | Renders all charter fields; risk band shown with its cause |
| **T12.4** | `PlanView` with version selector | M | T12.3 | `.../mission/PlanView.tsx` | Superseded versions viewable; < 400 ms for 60 tasks |
| **T12.5** | `GraphView` with critical path highlighting | L | T12.4 | `.../mission/GraphView.tsx` | Six edge kinds visually distinct; critical path highlighted; 60 fps pan and zoom |
| **T12.6** | `ProgressStrip` with three labelled figures | M | T12.3 | `.../mission/Progress.tsx` | Reported never presented as Verified; test asserts the labelling |
| **T12.7** | `ApprovalPanel` with plain-language capability list | M | T12.3, E9 | `.../mission/Approval.tsx` | One interaction; capabilities described by consequence, not identifier |
| **T12.8** | Palette verbs and keyboard bindings | S | T12.2 | `apps/desktop/src/features/palette/` | Verb-first; no conflict with the existing keymap |
| **T12.9** | Brief integration: mission conclusions into the daily Brief | M | T12.3 | `.../brief/` | Brief stays ≤600 words with one ask regardless of active mission count |
| **T12.10** | Performance and accessibility gates in CI | M | T12.5 | `infrastructure/ci/` | 400 ms render and WCAG AA both gate the build |

---

## 1. Recommended implementation order

```
   E1 Domain Model
        │
   E2 Repository
        │
   E3 State Machine
        │
   ┌────┴─────┐
   E4 Graph   E6 Risk          ← parallel
   └────┬─────┘
        │
   E5 Planner ─────────┐
        │              │
   E7 Verification     │       ← E7 needs E6; can overlap E5's tail
        │              │
   E8 Scheduler ◀──────┘
        │
   E9 Orchestrator Integration
        │
   E10 Recovery
        │
   E11 APIs
        │
   E12 Desktop                 ← may start early against frozen E11 signatures
```

| Order | Epic | Why here |
|---|---|---|
| 1 | E1 Domain Model | Every other epic imports it |
| 2 | E2 Repository | The only mutation path; everything writes through it |
| 3 | E3 State Machine | E5–E10 all drive transitions |
| 4a | E4 Graph | Needs only E1–E2 |
| 4b | E6 Risk | Needs E4's properties but scores independently — genuine parallelism |
| 5 | E5 Planner | Needs graph to assemble a valid plan |
| 6 | E7 Verification | Risk determines required evidence count |
| 7 | E8 Scheduler | Needs graph, risk, and budget reservation |
| 8 | E9 Orchestrator Integration | Needs a scheduler with something to dispatch |
| 9 | E10 Recovery | Needs E9's reconciliation surface |
| 10 | E11 APIs | Exposes everything above |
| 11 | E12 Desktop | Consumes E11 |

---

## 2. Critical path

**E1 → E2 → E3 → E4 → E5 → E8 → E9 → E10 → E11.**

Nine of twelve epics. E6 and E7 sit just off it; E12 hangs off the end.

**The three longest single tasks on the path**, and where schedule risk actually lives:

| Task | Cx | Why it is the risk |
|---|---|---|
| **T8.6** Budget and resource reservation | L | Concurrency correctness under contention. Getting this subtly wrong produces double-spending that only appears under load. |
| **T9.8** Pre-flight validation | L | Requires a Broker projection query that does not exist yet, and correctness depends on modelling the full capability union of a plan. |
| **T10.8** In-flight dispatch reconciliation | L | The "did the effect happen?" problem. Wrong in the permissive direction produces duplicated irreversible effects — the one failure F23 says must never be handled quietly. |

**Shortening the path.** T9.8's Broker projection query is the one dependency that can be pulled forward: it
is specifiable from `ARCH §25.1` alone and could be built during E2–E3 by whoever is not on the domain
model. That is the only genuine compression available; the rest of the path is real dependency, not
sequencing convenience.

---

## 3. Parallelizable work

| Stream | Epics / tasks | Can start when | Independent because |
|---|---|---|---|
| **A — Core path** | E1 → E2 → E3 → E4 → E5 → E8 → E9 → E10 → E11 | Immediately | — |
| **B — Risk** | E6 (T6.1–T6.9) | After E1 and E4's property API is frozen | Scores from graph properties and memory; writes only `mission_risk` |
| **C — Verification** | E7 (T7.1–T7.5, T7.8) | After E1; T7.6 needs E9 | Method evaluators are pure functions over evidence |
| **D — Migrations** | T2.2, T2.3, T2.4 | After T2.1 | Schema work is separable from the code that reads it |
| **E — Broker projection** | The pre-flight query in `sidra-security` | Immediately | Specified fully by `ARCH §25.1`; unblocks T9.8 |
| **F — Chaos harness** | T10.9 scaffolding | After E3 | Transition list is known once E3's table exists; assertions come later |
| **G — Desktop** | E12 T12.1–T12.6 against stubs | Once E11 signatures are frozen | Read-only; stubbed queries return fixtures |
| **H — Orchestrator additive changes** | T9.2, T9.4 | After T9.1 and T9.3 types exist | Lives in `sidra-orchestrator`; a different crate and reviewer |

**Practical team shape.** Three streams sustain a small team without contention: one engineer on A, one
alternating B/C, one on D/E/G. Stream A is the constraint; adding people to it will not compress it, because
E1→E2→E3 is strictly serial.

---

## 4. Suggested Git commit boundaries

### 4.1 The rule

**One task = one commit.** 113 tasks, 113 commits. A commit that implements two tasks is a commit that cannot
be reverted cleanly, and a task that needs two commits was too large and should have been split before it
started.

### 4.2 Message format

```
mission(<epic>): <imperative summary>

<what and why — not how; the diff shows how>

Task: T<n.m>
Arch: ARCH §<section>[, ADR-00nn]
Tests: <what was added>
```

Example:

```
mission(scheduler): reserve budget before dispatch

Two candidates could previously both pass the budget filter and both
dispatch against the same remaining ceiling. Reservation is now taken
before the Dispatch is emitted and released on Outcome or timeout.

Task: T8.6
Arch: ARCH §17.2 step 5, ADR-0020
Tests: concurrency property test, 1000 racing candidates against a
       single-dispatch ceiling
```

### 4.3 Branch and merge

- One branch per **epic**, one commit per **task**, squash-merge disabled — the task-level history is the
  point.
- An epic branch merges only when its full Acceptance Criteria list passes.
- `main` is green after every commit. Incomplete work sits behind a feature flag.

### 4.4 Commits requiring an ADR in the same commit

Per `/MASTER_IMPLEMENTATION_GUIDE.md` §8, any commit that changes a boundary, an invariant, a
Principal-facing behaviour, a post-M5 schema, or a shipped default carries its ADR. Within M10 the
foreseeable cases are:

| Likely trigger | Task |
|---|---|
| Any change to the Dispatch or Outcome envelope shape | T9.1, T9.3 |
| Adding or removing a failure class | T9.5 |
| Changing a risk dimension or the aggregation formula | T6.6 |
| Adding a verification method | T7.1 |
| Changing an ordering key or adding a priority tier | T8.5 |
| Any schema change beyond migrations `0019`–`0024` | T2.2–T2.4 |

ADRs continue from **0031**.

### 4.5 Commits that must never be combined

- Schema migration + the code that reads it. Migrations must be independently revertible.
- Generated bindings + hand-written code. `packages/bindings` is generated; mixing makes the CI check
  unreadable.
- Orchestrator changes + Mission Engine changes. Different crates, different reviewers, and combining them
  hides the seam that ADR-0022 exists to protect.

---

## 5. Risks during implementation

| # | Risk | L × I | Signal | Mitigation |
|---|---|---|---|---|
| **IR-1** | **The seam leaks.** Under deadline pressure someone adds a second write path from Orchestrator to Mission state "just for status." | M × H | Any PR touching both crates; any new `pub` on Mission state | The visibility test in T9.4 and the dependency check in T1.1 both fail the build. Not a review responsibility. |
| **IR-2** | **The Planner becomes the product.** E5 is the only model-consuming epic and is infinitely elaborable. | H × M | Planning cost ratio above the G9 gate; T5.3 growing past its complexity estimate | T5.8 makes the ratio visible from the first Mission. Treat a breach as a defect in E5, not in the Mission. |
| **IR-3** | **Scheduler determinism erodes.** A "small heuristic" gets added to handle an awkward case. | M × H | Any import of `sidra-models` into `scheduler/` | T8.11's 10,000-state property test plus a module-level dependency ban |
| **IR-4** | **Reconciliation is wrong in the permissive direction.** T10.8 assumes a lost dispatch did not happen. | M × H | Any duplicated effect in the chaos suite | `ARCH §14.5` rule 3 is an acceptance criterion, not guidance. F23 halts the Mission rather than handling it quietly. |
| **IR-5** | **E1 churn.** The domain model changes after five epics depend on it. | M × M | Repeated changes to `domain/` after E4 starts | Freeze E1's public surface at the end of E3. Later changes need an ADR. |
| **IR-6** | **Verification is skipped as "too slow".** `independent_agent_check` costs a Turn and will be the first thing proposed for removal. | M × H | Objectives shipping with only mechanical methods at High or Severe risk | Required evidence count comes from the risk band (T7.7), not from the task author |
| **IR-7** | **Progress labelling collapses.** Someone merges the three figures into one percentage because the UI is cleaner. | M × H | Any single completion number in E12 | T12.6's labelling test. This is ADR-0025's entire practical content. |
| **IR-8** | **Migrations block the path.** Schema work stalls E2 and therefore everything. | M × M | T2.2–T2.4 slipping | Stream D runs them in parallel; each is independently deployable |
| **IR-9** | **E12 waits on E11.** Eleven epics of backend before anything is visible, which is demoralising and hides UX problems until the end. | H × M | No demonstrable UI until month N | Stream G builds against stubbed queries as soon as E11 signatures are frozen — before E11 is implemented |
| **IR-10** | **Milestone numbering ambiguity** (§0.2) produces two schedules. | M × M | Any planning artifact citing "M10" without saying which reading | Resolve Reading A or B before T1.1 |
| **IR-11** | **The 400 ms render target is missed** at realistic graph sizes. | M × M | T12.4 or T12.5 exceeding budget | Gate in CI from T12.10. If missed, reduce what is rendered — never raise the number. |
| **IR-12** | **Departments cannot supply estimates**, so everything falls back to heuristics. | M × M | `estimate.source = heuristic` dominating | Acceptable at first — T5.6's calibration improves it as history accrues. The risk is treating heuristics as measured, which the source field prevents. |

---

## 6. Definition of Done for M10

M10 is done when **all** of the following hold. Each is demonstrable, and the demonstration is to someone who
did not build it.

### 6.1 Functional

- [ ] A Mission spanning **three departments, twelve Tasks, and two days** runs from Directive to conclusion
      (`ARCH Appendix C`).
- [ ] Every Objective concludes with verification evidence recorded in the event log.
- [ ] **One** Principal approval for the whole Mission. Not one per Task.
- [ ] **One** Brief at conclusion: ≤600 words, one ask.
- [ ] **Zero** self-reported progress figures presented as fact anywhere in the UI.
- [ ] At least one deliberate failure is classified correctly and handled per its class.
- [ ] At least one successful replan preserving completed work and evidence.
- [ ] At least one cross-department Exchange request during a Mission, charged to the requesting department.
- [ ] The fast lane still bypasses the Mission Engine entirely, and its share is measured at ≥65%.

### 6.2 Architectural

- [ ] No code path from `sidra-orchestrator` writes Mission state except `task.record_outcome` (G3).
- [ ] No code path from `sidra-mission` invokes a model, tool, or agent (G3).
- [ ] `append` is the only mutation path in `sidra-mission` (`ARCH §18.3`).
- [ ] Dropping all projections and replaying produces byte-identical rows.
- [ ] No plan version is mutated after authorisation (ADR-0023, ADR-0029).
- [ ] Pre-flight is a projection; every Dispatch is still individually checked by the Broker (ADR-0027).
- [ ] `self_report` is unrepresentable in the verification method enum (ADR-0025).
- [ ] Zero model calls in the scheduler (ADR-0026).

### 6.3 Quality gates

- [ ] Chaos: `kill -9` at **every** Mission and Task state transition, recovered, **zero duplicated effects**.
- [ ] Determinism: 10,000 randomised states produce identical repeated Dispatch selection.
- [ ] Authorisation matrix: every command × every actor class asserted; the three Principal-only commands
      refused to Kai and all four Offices.
- [ ] Every Guard and failure class has at least one input it must reject.
- [ ] Plan view renders in < 400 ms for a 60-task Mission; graph pans at 60 fps.
- [ ] Cold start ≤ 1.2 s, idle ≤ 400 MB with three active Missions — the v1 budgets, unmoved.
- [ ] Planning cost: median ≤ 8%, p95 ≤ 15% of Mission budget (G9).
- [ ] WCAG AA throughout the Mission views.

### 6.4 Documentation and process

- [ ] Every acceptance criterion in E1–E12 demonstrated, not asserted.
- [ ] Any divergence from `/MISSION_ENGINE_ARCHITECTURE.md` carries an ADR from 0031.
- [ ] `/MASTER_IMPLEMENTATION_GUIDE.md` §5 and §9 updated with M10's milestone row and routing entries.
- [ ] The milestone-numbering ambiguity in §0.2 is resolved and recorded.
- [ ] 113 commits, one per task, each green on `main`.

### 6.5 The single test that decides it

> Give the Firm a Directive that requires work from Backend, Cybersecurity, and Infrastructure over two days.
> Approve the plan once. Do nothing else.
>
> **At the end, the Brief must state what was achieved and what was not — and every claim in it must be
> traceable to evidence in the event log, not to an agent's assertion that it was finished.**

If that holds, M10 is done. If it does not, no other checkbox matters.
