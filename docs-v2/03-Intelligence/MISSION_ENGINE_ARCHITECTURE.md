# Mission Engine — Architecture

**Single source of truth for the Mission Engine subsystem.**

| | |
|---|---|
| Subsystem | Mission Engine (`services/mission/` — crate `sidra-mission`) |
| Status | Design. No implementation. |
| Introduced in | Sidra OS 2.0 "Concourse" |
| Extends | `/docs` (v1 "Atrium") and `/docs-v2` (v2 "Concourse") |
| Precedence | v1 documents win on anything they cover. This document is authoritative for the Mission Engine only. |
| Decision records | ADR-0022 – ADR-0030 (§30) |

**The central claim of this document:** the Mission Engine owns the plan. The Orchestrator executes it. These
are different powers held by different subsystems, and the separation is the point.

---

## 1. Mission Philosophy

### 1.1 The problem this subsystem exists to solve

In v1 the Orchestrator held both the plan and the execution of it. A Directive arrived, Kai formed a Mandate,
the Orchestrator decomposed it into Work Orders and ran them. The plan existed — but only as orchestrator
state, distributed across in-flight records, reconstructible only by reading the event log backwards.

Three consequences followed, and all three become severe at v2 scale:

**The plan could not be reviewed before it ran.** The Firm's own Principle 5 requires that the author never
reviews their own work, and v2 built four Offices to enforce it — for *Deliverables*. Nobody reviews the
plan. A badly-sequenced, over-budget, under-verified plan is discovered by executing it.

**The plan could not be criticised without stopping the work.** Changing a running Engagement's shape meant
cancelling and restarting, because the plan was not a thing you could hold.

**The plan could not be compared to the outcome.** Which is the only way an organisation learns. v1's
procedural memory records how a *task* went; it cannot record that the *plan* was wrong, because there was no
plan object to be wrong.

### 1.2 The stance

> **A plan is an artifact, not a side effect of execution.**

Everything in this document follows from that sentence. If a plan is an artifact then it has an identity, a
version, an author, a reviewer, a lifecycle, a persistence model, and a record of how well it predicted
reality. It can be read by the Principal before a single token is spent. It can be vetoed by an Office. It
can be superseded without being destroyed. It can be replayed.

### 1.3 What a Mission is

**A Mission is a durable intention with a plan attached.**

- *Durable* — it outlives any single execution attempt, any restart, any pause. A Mission may sit dormant for
  six weeks and resume without loss.
- *Intention* — it states an outcome the Principal wants, in terms of Objectives that can be verified, not
  activities that can be performed. "The payment service tolerates a regional outage" is an Objective.
  "Write a failover runbook" is a Task.
- *With a plan attached* — Objectives decomposed into Tasks, ordered by a dependency graph, priced, fenced,
  scheduled, and carrying the policies under which they may run.

### 1.4 Planning and execution are different powers

This is the same argument v2 made for Offices, applied to machinery instead of agents.

| Power | Held by | Authority |
|---|---|---|
| **What should happen, in what order, under what constraints** | Mission Engine | Creates, versions, sequences, prices, prioritises, schedules, verifies, replans |
| **Making it happen** | Orchestrator | Runs Engagements and Turns, invokes agents, applies workflows, produces Deliverables |

The Orchestrator **may not** modify a Mission. It receives Dispatches and returns Outcomes. It has no write
path to the plan. If execution reveals the plan is wrong, the Orchestrator reports that as an Outcome and the
Mission Engine decides what to do — because a subsystem that can rewrite its own instructions when they prove
inconvenient has no instructions.

The Mission Engine **may not** run a Turn, call a model, invoke an agent, or touch a tool. It has no
execution path. Its only effect on the world is emitting a Dispatch.

### 1.5 What the Mission Engine must never become

Sidra OS's defining risk (`/docs-v2/05-risk/01-risk-analysis.md` R-01) is that the organisation becomes the
product. A planning subsystem is the single most likely place for that to happen — planning is infinitely
elaborable and always feels productive.

Hard constraints, enforced structurally rather than by intention:

1. **A Mission never produces more than one page for the Principal.** The plan is inspectable on demand; it is
   never pushed. The Brief contract is unchanged: one page, one ask, ≤600 words.
2. **The Mission Engine never plans below Task granularity.** Departments own their own decomposition
   (§7, ADR-0024). A central planner that specifies subtasks is a central planner that will be wrong about
   twenty-one domains.
3. **Planning is budgeted like everything else.** A planning Turn draws on the Mission's own budget. A Mission
   that spends 30% of its budget deciding what to do has failed before it started, and the ratio is a
   measured KPI.
4. **Most Directives never create a Mission at all.** The fast lane (`/docs/03-agents/04-ceo-protocol.md`,
   target 65%) bypasses the Mission Engine entirely. Missions are for work that spans multiple Turns,
   multiple departments, or multiple days. §3.1 states the threshold.
5. **No Mission may exist without at least one falsifiable Objective.** An Objective that cannot fail
   verification is not an Objective; it is a description of activity.

### 1.6 Relationship to existing concepts

Nothing in v1 is replaced. Two terms are extended and one relationship is inverted.

| v1 concept | Status under Mission Engine |
|---|---|
| **Directive** | Unchanged. The Principal's stated intent. |
| **Mandate** | **Extended, not replaced.** The Mandate — objective, budget, effect ceiling, fences — becomes the Mission's *Charter* section (§5.1). Every field survives with its meaning. |
| **Work Order** | Unchanged (ADR-0010). A Task becomes a Work Order at dispatch. The typed envelope is the interface between the two subsystems. |
| **Engagement** | **Unchanged, and remains the Orchestrator's unit** (ADR-0030). A Mission produces one or more Engagements. The inversion: an Engagement no longer owns its plan; it executes one. |
| **Deliverable** | Unchanged. Produced by execution, consumed by verification. |
| **Brief** | Unchanged. One page, one ask. |
| **Workflow** | Unchanged, and distinct from a Mission — see §1.7. |
| **Decision** | Unchanged. Missions raise Decisions; Decisions may create Missions. |

### 1.7 Mission is not Workflow

The two are both directed acyclic graphs and they are not the same thing. Confusing them would collapse the
subsystem into the Workflow Engine that already exists.

| | Workflow | Mission |
|---|---|---|
| What it is | A **reusable procedure** | A **specific intention** |
| Authored | Once, by a department, shipped in its Pack | Per Directive, by the Mission Engine |
| Deterministic | Yes — same inputs, same shape | No — the plan is a judgement |
| Lifetime | Permanent | From Directive to completion |
| Owns | Steps | Objectives, and the Tasks that serve them |
| Relationship | **A Task may invoke a Workflow.** A Workflow never invokes a Mission. |

A Mission is the answer to "what should we do about this?". A Workflow is the answer to "how do we do this
kind of thing?". Missions consume workflows; the reverse would be a cycle.

---

## 2. Design Goals

Each goal is falsifiable. A goal you cannot fail is a slogan.

| # | Goal | Test |
|---|---|---|
| **G1** | **The plan is readable before it runs.** | The Principal can view any Mission's full plan — objectives, tasks, order, cost estimate, risk — before approving it, rendered in under 400 ms. |
| **G2** | **The plan is reviewable by someone other than its author.** | Every Mission above a declared threshold is reviewed by at least one Office before execution. Office plan-veto rate has a floor, as with Deliverable review. |
| **G3** | **Planning and execution cannot leak into each other.** | Property test: no code path from `sidra-orchestrator` writes to Mission state. No code path from `sidra-mission` invokes a model, tool, or agent. Enforced by crate boundaries and a CI dependency check. |
| **G4** | **Progress is evidence, not assertion.** | No progress figure anywhere in the system derives from an agent's self-report. Every completed Objective has verification evidence in the event log. (ADR-0025) |
| **G5** | **Scheduling is deterministic.** | Given identical mission state, budget, and department queues, the scheduler selects the identical next Dispatch. Same input, same output, no model call. (Principle 8, ADR-0026) |
| **G6** | **Failure is classified before it is retried.** | No retry occurs without a failure classification. Deterministic, permission, budget, and semantic failures never auto-retry. (ADR-0028) |
| **G7** | **A Mission survives anything the process does.** | Chaos test: `kill -9` at every state transition; on restart the Mission resumes from the last durable point with no duplicated effect. |
| **G8** | **Replanning never destroys history.** | A revised plan is a new version superseding the old. The superseded plan, its rationale, and its outcome-to-date remain queryable forever. (ADR-0029, Principle 3) |
| **G9** | **The Mission Engine costs less than it saves.** | Planning overhead as a fraction of Mission budget is measured and gated: median ≤8%, p95 ≤15%. Above that the Engine is the problem. |
| **G10** | **A Mission cannot exceed an authority the Principal did not grant.** | Pre-flight validation: the whole plan is checked against the Permission Broker and budget ceilings *before* the first Dispatch. A plan requiring an ungranted capability fails at planning time. (ADR-0027) |
| **G11** | **Twenty-one departments do not produce twenty-one planners.** | One Mission Engine. Departments contribute estimates and decompose their own Tasks; they do not plan Missions. |
| **G12** | **The Principal's attention is spent once.** | One approval per Mission, not per Task. Interruption during execution only for the five conditions in `/docs/04-engines/06-notification-system.md`. |

---

## 3. Mission Lifecycle

### 3.1 When a Mission is created

Not for everything. The threshold is declared, deterministic, and evaluated by Kai during the Analyze phase
of the CEO protocol:

A Directive becomes a Mission when **any** of the following holds:

- it requires work from **more than one department**, or
- it requires **more than three Work Orders**, or
- it spans **more than one working day**, or
- it contains an **effect at class 2 or above**, or
- it has an **externally imposed deadline**, or
- the Principal **explicitly asks for a plan**.

Otherwise it stays on the fast lane and the Mission Engine is never invoked. This is the single most
important constraint in the subsystem: **the majority of work must never touch it.**

### 3.2 The phases

```
 ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌───────────┐   ┌───────────┐
 │ DRAFTING │──▶│ PLANNING │──▶│ APPRAISAL│──▶│ AUTHORISE │──▶│ SCHEDULED │
 └──────────┘   └──────────┘   └──────────┘   └───────────┘   └───────────┘
   intention      objectives      risk, cost,     Office review     ready set
   captured       and tasks       verification    + Principal       computed
                  and graph       spec, fences    approval               │
                                                                         ▼
 ┌───────────┐   ┌───────────┐   ┌───────────┐                    ┌───────────┐
 │ CONCLUDED │◀──│ VERIFYING │◀──│ EXECUTING │◀───────────────────│ DISPATCH  │
 └───────────┘   └───────────┘   └───────────┘                    │   LOOP    │
   Brief          objective        Orchestrator                   └───────────┘
   emitted        evidence         runs Engagements                     ▲
   outcome        checked          Outcomes returned ────────────────────┘
   recorded
```

**DRAFTING** — the Directive is captured as an intention. Objectives are proposed but not yet decomposed.
Cheap: one `reasoner` Turn. Output is a Mission with Objectives and a Charter, no Tasks.

**PLANNING** — Objectives are decomposed into Tasks; the dependency graph is built; department contracts are
resolved; estimates are requested from department heads via the Exchange; the graph is validated (acyclic,
reachable, every Objective covered). Output is Plan version 1.

**APPRAISAL** — risk is assessed per Task and per Mission (§11); verification specifications are attached to
every Objective (§12); execution policies are resolved (§16); pre-flight capability and budget validation runs
against the Permission Broker (§25). This phase is where a plan is *found to be impossible* — which is much
cheaper than discovering it in execution.

**AUTHORISE** — Office review of the plan (§2 G2), then a single Principal approval. Both are recorded. A
plan that changes after approval requires re-authorisation of the changed scope only (§14.4).

**SCHEDULED** — the Mission is admitted to the scheduler. The ready set is computed. Nothing has run yet.

**EXECUTING** — the dispatch loop. The scheduler emits Dispatches; the Orchestrator returns Outcomes; the
Mission Engine records them, updates the graph, recomputes the ready set. Verification of individual
Objectives happens continuously as their Tasks complete.

**VERIFYING** — all Tasks are terminal. Every Objective's verification specification is evaluated against
collected evidence. This is a distinct phase because an Objective can have all its Tasks complete and still
not be met — which is exactly the case that self-reported progress hides.

**CONCLUDED** — one of `completed`, `partially_completed`, `failed`, or `abandoned`. A Brief is emitted. The
outcome record — plan versus reality, cost versus estimate, which risks materialised — is written to
procedural memory.

### 3.3 Phase gates

Each transition has a gate that must pass. Gates are deterministic checks, not judgements.

| Transition | Gate |
|---|---|
| DRAFTING → PLANNING | ≥1 Objective; every Objective has a falsifiable success condition |
| PLANNING → APPRAISAL | Graph is acyclic; every Task maps to ≥1 Objective; every Objective has ≥1 Task; every Task resolves to a capability contract that an installed department provides |
| APPRAISAL → AUTHORISE | Every Objective has a verification spec with ≥1 non-self-reported method; pre-flight capability check passes; estimated cost ≤ Mission budget |
| AUTHORISE → SCHEDULED | Required Office reviews recorded; Principal approval recorded |
| SCHEDULED → EXECUTING | Ready set is non-empty |
| EXECUTING → VERIFYING | All Tasks terminal (`succeeded`, `failed_accepted`, `skipped`, or `cancelled`) |
| VERIFYING → CONCLUDED | Every Objective evaluated; outcome classification assigned |

---

## 4. Mission State Machine

### 4.1 States

```
                          ┌─────────┐
                          │ DRAFTED │
                          └────┬────┘
                               │ plan
                          ┌────▼─────┐         ┌───────────┐
                          │ PLANNING │────────▶│ INFEASIBLE│ (terminal)
                          └────┬─────┘  gate   └───────────┘
                               │ appraise         failure
                          ┌────▼─────┐
                          │APPRAISING│
                          └────┬─────┘
                               │
                       ┌───────▼────────┐  reject   ┌──────────┐
                       │ AWAITING_AUTH  │──────────▶│ REJECTED │ (terminal)
                       └───────┬────────┘           └──────────┘
                               │ approve
                          ┌────▼─────┐
              ┌──────────▶│ READY    │◀────────────┐
              │           └────┬─────┘             │
              │                │ dispatch          │ resume
              │           ┌────▼─────┐        ┌────┴────┐
              │           │ RUNNING  │───────▶│ PAUSED  │
              │           └──┬────┬──┘  pause └─────────┘
              │              │    │
              │       block  │    │ all tasks terminal
              │        ┌─────▼──┐ │
              └────────│BLOCKED │ │        (unblock)
                       └────┬───┘ │
                            │     │
                    ┌───────▼─────▼──┐
                    │   VERIFYING     │
                    └───┬─────────┬───┘
                        │         │ verification failed + replan viable
                        │         └──────────▶┌───────────┐
                        │                     │ REPLANNING│──▶ PLANNING
                        │                     └───────────┘
              ┌─────────▼──────────┐
              │     CONCLUDED      │ (terminal)
              │ completed |        │
              │ partially_completed│
              │ failed | abandoned │
              └────────────────────┘

  SUPERSEDED (terminal) — reachable from any non-terminal state when a new Mission replaces this one
  ABANDONED  (terminal) — reachable from any non-terminal state on Principal instruction
```

### 4.2 Transition table

| From | To | Trigger | Who may trigger | Guard |
|---|---|---|---|---|
| DRAFTED | PLANNING | `mission.plan` | Kai, Principal | ≥1 falsifiable Objective |
| PLANNING | APPRAISING | plan complete | Mission Engine | §3.3 gate |
| PLANNING | INFEASIBLE | no viable plan | Mission Engine | No department provides a required contract, or graph cannot be made acyclic |
| APPRAISING | AWAITING_AUTH | appraisal complete | Mission Engine | §3.3 gate |
| APPRAISING | INFEASIBLE | pre-flight failed | Permission Broker | Required capability not grantable, or estimate exceeds hard ceiling |
| AWAITING_AUTH | READY | approval | **Principal only** | Office reviews recorded |
| AWAITING_AUTH | REJECTED | rejection | Principal, or any Office veto sustained | — |
| READY | RUNNING | first dispatch | Scheduler | Ready set non-empty; budget available |
| RUNNING | BLOCKED | no dispatchable task | Scheduler | Ready set empty and Tasks remain non-terminal |
| BLOCKED | RUNNING | dependency satisfied, approval granted, or budget restored | Scheduler | Ready set non-empty |
| RUNNING/BLOCKED | PAUSED | `mission.pause` | Principal, Cost Office (budget), Security Office (any) | — |
| PAUSED | READY | `mission.resume` | Principal | Pre-flight re-validated |
| RUNNING | VERIFYING | all Tasks terminal | Mission Engine | — |
| VERIFYING | CONCLUDED | evaluation complete | Mission Engine | Every Objective evaluated |
| VERIFYING | REPLANNING | objectives unmet, replan viable | Mission Engine | Replan budget remains; replan count < policy limit |
| REPLANNING | PLANNING | new plan version opened | Mission Engine | ADR-0029: supersede, never mutate |
| *any non-terminal* | SUPERSEDED | replaced | Principal, Kai | Successor Mission exists |
| *any non-terminal* | ABANDONED | `mission.abandon` | **Principal only** | — |

### 4.3 Invariants

Enforced by the state machine, tested as properties:

1. **Only the Principal authorises.** No agent, no Office, no automation may move AWAITING_AUTH → READY.
2. **Only the Principal abandons.** The Firm may recommend abandonment; it may not perform it.
3. **BLOCKED is never silent.** Entering BLOCKED emits an event and, if it persists beyond the policy
   threshold, raises exactly one notification within the existing five-item budget.
4. **Terminal is terminal.** No transition leaves CONCLUDED, REJECTED, INFEASIBLE, SUPERSEDED, or ABANDONED.
   A resumed intention is a *new* Mission referencing the old one.
5. **A state change is an event first.** The state field in any table is a projection (ADR-0002). Recovery
   replays the log; it never trusts the projection.
6. **PAUSED preserves in-flight work.** Dispatched Tasks are allowed to complete or checkpoint; nothing is
   killed mid-effect.

---

## 5. Objective Model

### 5.1 The Mission Charter

Before Objectives, the constraints they live under. The Charter is v1's Mandate, preserved field-for-field
and extended. It is set at DRAFTING and may only be widened by the Principal.

```toml
[charter]
mission_id      = "msn_01J8K..."
directive_id    = "dir_01J8K..."           # the Principal's originating Directive
statement       = "Make the payment service survive a regional outage."
rationale       = "Single-region dependency surfaced in the Q3 architecture review."

budget          = "$45.00"                  # the Mission ceiling — a 5th nested budget scope (§16.3)
effect_ceiling  = 2                         # no Task may exceed this (v1 effect classes 0–3)
deadline        = 2026-09-15                # optional; kind declared in §10
autonomy        = 3                         # v2 delegation depth
review_intensity = "standard"               # ADR-0018
fences          = ["no_production_writes", "no_external_publication"]
departments_allowed = []                    # empty = any installed department; non-empty = allowlist
```

The Charter is the **outer boundary**. Every Objective, Task, and Dispatch is a subset of it. A plan that
requires widening the Charter cannot proceed; it returns to the Principal as an Approval Request naming the
specific field and the reason.

### 5.2 Objective

An Objective is **an outcome that can be verified**, not an activity that can be performed. This distinction
is the whole model.

```toml
[[objective]]
id              = "obj.failover"
statement       = "The payment service continues serving writes when its primary region is unavailable."
kind            = "capability"              # capability | artifact | decision | knowledge | condition
weight          = 0.5                       # share of Mission completion; weights sum to 1.0
priority        = "P1"                      # §9
owner_department = "backend"                # accountable for the outcome, not necessarily sole executor
depends_on      = []                        # Objective-level ordering (rare; most ordering is task-level)

  [objective.success]
  criteria = [
    "A documented failover procedure exists and has been executed successfully in a non-production environment",
    "Recovery time objective of ≤ 5 minutes is demonstrated, not asserted",
    "No single-region dependency remains in the write path",
  ]

  [objective.verification]                  # §12 — mandatory, ≥1 non-self-reported method
  methods = ["artifact_exists", "independent_agent_check", "guard_pass"]
  evidence_required = 2                     # how many must pass

  [objective.falsifiable]
  failure_condition = "Any write path retains a hard dependency on a single region."
```

### 5.3 Objective kinds

The kind determines which verification methods are legal, so it is not decorative.

| Kind | Meaning | Legal verification methods |
|---|---|---|
| `capability` | The system can now do something it could not | `independent_agent_check`, `test_pass`, `guard_pass`, `principal_confirmation` |
| `artifact` | A specific document or asset exists and meets its standard | `artifact_exists`, `content_pattern`, `guard_pass`, `office_review` |
| `decision` | A choice is made and recorded | `decision_recorded` (v1 decision engine), `principal_confirmation` |
| `knowledge` | The Firm now knows something it did not | `registry_entry_added`, `canon_candidate`, `office_review` |
| `condition` | A measurable state of the world holds | `metric_threshold`, `test_pass`, `independent_agent_check` |

**`self_report` is not in any row.** An agent's assertion that it finished is an input to verification, never
a verification method (ADR-0025).

### 5.4 Rules

1. **≥1 Objective per Mission, and each must be falsifiable.** If no stated condition could show the
   Objective was not met, it is a description of activity and is rejected at the DRAFTING gate.
2. **Weights sum to 1.0.** Progress is weighted by Objective, not by Task count — twenty trivial tasks do not
   outweigh one hard one (§15).
3. **Every Objective has an owner department**, which is accountable for the outcome even when other
   departments perform Tasks in service of it. Accountability does not fragment.
4. **An Objective with no Tasks fails the PLANNING gate.** An Objective nobody is working toward is a wish.
5. **Objectives are stated by the Mission Engine and confirmed by the Principal at authorisation.** They are
   the part of the plan the Principal is most likely to correct, and the cheapest part to correct.

---

## 6. Task Model

### 6.1 Definition

A **Task is the unit of delegatable work**: the smallest thing the Mission Engine plans, and the thing that
becomes a Work Order (ADR-0010) at dispatch. It is addressed to a *capability contract*, never to a
department by name (v2 Exchange rule, `/docs-v2/01-enterprise/03-department-architecture.md` §5).

```toml
[[task]]
id              = "tsk.failover.runbook"
mission_id      = "msn_01J8K..."
objectives      = ["obj.failover"]          # ≥1; a Task with no Objective is unplanned work
title           = "Author the regional failover runbook"

  [task.addressing]
  contract        = "capability.incident-response"   # resolved by the Registrar at dispatch
  resolved_to     = null                             # filled at dispatch time, not planning time
  role_hint       = "runbook-author"                 # advisory; the department chooses

  [task.contract]
  inputs          = ["art.arch.payments.v3", "reg.backend.service-boundaries"]
  outputs         = ["artifact:runbook"]
  acceptance      = [
    "Covers detection, decision, cutover, validation, and rollback",
    "Every step has an owner and an expected duration",
    "Passes the infrastructure department's runbook-completeness standard",
  ]

  [task.constraints]
  effect_class    = 1                         # ≤ charter ceiling
  budget          = "$4.00"                   # ≤ remaining mission budget
  model_class     = "worker"                  # advisory; ADR-0005 routing still decides
  deadline        = 2026-08-20                # optional
  standards       = ["infrastructure/runbook-completeness"]   # v2 Standards, injected into the frame

  [task.graph]
  depends_on      = ["tsk.failover.topology"]
  blocks          = ["tsk.failover.drill"]
  edge_kinds      = { "tsk.failover.topology" = "artifact" }   # §8.2

  [task.policy]
  retry           = { max = 2, backoff = "exponential", eligible = ["transient"] }   # §13
  verification    = ["artifact_exists", "guard_pass"]
  checkpoint      = "on_completion"           # §14.1
  idempotency_key = "tsk.failover.runbook@v1"

  [task.estimate]
  cost_p50        = "$2.60"
  cost_p90        = "$4.00"
  duration_p50    = "18m"
  source          = "department"              # department | historical | heuristic
  confidence      = "medium"
```

### 6.2 Task states

```
  PLANNED ──▶ READY ──▶ DISPATCHED ──▶ RUNNING ──┬──▶ SUCCEEDED
     │          ▲                                 ├──▶ FAILED ──▶ (retry) READY
     │          │                                 │         └──▶ FAILED_TERMINAL
     │          └──── unblocked ───┐              └──▶ CANCELLED
     └──▶ BLOCKED ─────────────────┘
     └──▶ SKIPPED   (its Objective was met another way, or a branch was pruned)
```

`FAILED_ACCEPTED` is a distinct terminal state: the Task failed, the Mission Engine classified the failure as
non-blocking under policy, and the Mission continues with the failure recorded. Silent tolerance of failure
is forbidden; *recorded* tolerance is a legitimate execution policy (§16.2).

### 6.3 Rules

1. **A Task serves ≥1 Objective.** Work that serves no Objective is not planned; it is discovered, and
   discovered work triggers replanning rather than being quietly absorbed.
2. **A Task addresses a contract, not a department.** ADR-0013's replaceability property depends on it.
3. **A Task's effect class ≤ the Charter ceiling**, and its budget ≤ the Mission's remaining budget. Checked
   at planning *and* re-checked at dispatch, because remaining budget changes.
4. **A Task is idempotent or it is not retryable.** The `idempotency_key` is mandatory for any Task whose
   retry policy permits retries at effect class ≥1.
5. **A Task carries its acceptance criteria into the Work Order.** The executing agent knows what "done"
   means before it starts — v1's Work Order contract, unchanged.
6. **A Task never specifies *how*.** It specifies outcome, inputs, acceptance, and constraints. Method belongs
   to the executing department (ADR-0024).

---

## 7. Subtask Model

### 7.1 The boundary, stated first

**The Mission Engine does not plan Subtasks.** It plans to Task granularity and stops. Below that line,
decomposition belongs to the department that owns the work (ADR-0024).

This is a deliberate refusal of authority. A central planner that decomposes a shader optimisation task, a
contract review task, and a threat model into subtasks is a central planner that is wrong about at least two
of the three. Departments hold the domain knowledge; v2 gave them Standards, Registries, Playbooks, and Role
Archetypes precisely so they could.

### 7.2 What a Subtask is

A **Subtask is a department's internal decomposition of a Task**, created during execution by the executing
department, visible to the Mission Engine as *progress telemetry* and nothing else.

```toml
[[subtask]]                                  # created by the department, not the Mission Engine
id              = "sub.runbook.detection"
task_id         = "tsk.failover.runbook"
title           = "Detection and alerting section"
state           = "succeeded"                # planned | running | succeeded | failed | skipped
weight          = 0.25                       # share of the parent Task
opened_at       = 2026-08-14T09:12:00Z
closed_at       = 2026-08-14T09:26:00Z
evidence        = ["art.runbook.draft#detection"]
```

### 7.3 The contract between department and Mission Engine

Subtasks flow **upward as information, never downward as instruction**.

| Direction | Permitted |
|---|---|
| Mission Engine → Subtask | **Nothing.** It cannot create, modify, reorder, cancel, or prioritise a Subtask. |
| Subtask → Mission Engine | Progress telemetry: declared set, state changes, weights, evidence references, and a revised estimate for the parent Task |

Three things the Mission Engine may do with Subtask telemetry, and only these:

1. **Compute intra-Task progress** for display (§15.3) — clearly marked as *reported* rather than *verified*.
2. **Detect stall** — a Task whose Subtasks have not changed state within the policy window is flagged.
3. **Update the parent Task's estimate**, feeding the schedule and the cost projection.

### 7.4 Why a Subtask is not a Task

| | Task | Subtask |
|---|---|---|
| Planned by | Mission Engine | Executing department |
| Visible in the plan | Yes | No — appears only during execution |
| Has a budget | Yes, enforced | No — draws on the parent Task's budget |
| Has a capability grant | Yes, via the Work Order | No — inherits the parent's |
| Can be dispatched | Yes | Never — it exists inside a Turn or Engagement |
| Verified by the Mission Engine | Yes | No — the parent Task's verification covers it |
| Survives replanning | Only via its parent | No |

**Depth is capped at one.** A Subtask may not have Subtasks. A department needing deeper decomposition is
describing a Task the Mission Engine should have planned, and the correct response is to report back and
trigger replanning — not to build a private hierarchy the Firm cannot see (§14.3).

---

## 8. Dependency Graph

### 8.1 Structure

A single directed acyclic graph per Mission plan version. Nodes are Tasks. Objectives are not nodes — they
are a labelling over nodes, because an Objective is satisfied by evidence, not by graph position.

```
                    tsk.topology ──────┐
                         │             │ artifact
                 artifact│             ▼
                         ▼        tsk.runbook ─────┐
                    tsk.adr                        │ finish-to-start
                         │                         ▼
                 decision│                    tsk.drill ────▶ tsk.report
                         │                         ▲
                         └─────────────────────────┘
                                  resource (env lock)
```

### 8.2 Edge kinds

The kind matters because it determines what "satisfied" means, and a graph with one edge kind cannot express
the difference between "wait for it to finish" and "wait for what it produces."

| Edge kind | Satisfied when | Typical use |
|---|---|---|
| `finish_to_start` | Predecessor reaches a terminal success state | Sequential work |
| `artifact` | The named artifact exists **and passes its Guards** | Downstream needs a specific output, not merely a finished task |
| `decision` | A Decision record exists with a chosen option (v1 decision engine) | Work that cannot start until a choice is made |
| `resource` | An exclusive resource lock is available | Two Tasks that cannot share an environment, a registry write, or a department slot |
| `approval` | A named approval is recorded | Work gated on the Principal or an Office |
| `soft` | Predecessor is terminal in **any** state | Preferred ordering, not required — the scheduler honours it only when it costs nothing |

`artifact` edges are the reason the graph is worth having. `finish_to_start` alone lets a Task start on a
predecessor that "finished" by producing something that fails its Standard — which is the most common way a
plan silently degrades.

### 8.3 Validation

Run at the PLANNING gate. All are mechanical.

1. **Acyclic.** Cycles are refused with the cycle path named. No auto-resolution — a cycle is a planning
   error and guessing which edge to cut is how a plan becomes wrong quietly.
2. **Connected to purpose.** Every Task is reachable from ≥1 Objective's task set; every Objective has ≥1
   Task. Orphans on either side fail the gate.
3. **Contracts resolvable.** Every Task's contract is provided by ≥1 installed department. Unresolvable
   contracts fail as INFEASIBLE with the missing contract named — not as a silent fallback to a
   general-purpose agent, which would make the plan's quality claims false.
4. **Depth bound.** Longest path ≤ 40 Tasks. A deeper plan is not a plan; it is a program, and it should be
   several Missions.
5. **Width bound.** Ready-set width is advisory, but a plan whose maximum parallelism exceeds the sum of
   department autoscale ceilings is flagged at appraisal, because it will schedule as if it were fast and
   execute as if it were serial.
6. **Resource edges are consistent.** Two Tasks holding the same exclusive resource have a path between them
   or an explicit `resource` edge; otherwise the plan contains a latent deadlock.

### 8.4 Derived properties

Computed at PLANNING and recomputed after every Outcome. All deterministic; no model call.

| Property | Definition | Used by |
|---|---|---|
| **Ready set** | Tasks whose incoming edges are all satisfied | Scheduler (§17) |
| **Critical path** | Longest duration-weighted path to Mission completion | Deadline model (§10), priority ordering (§9) |
| **Slack** | Latest start − earliest start, per Task | Deadline model, preemption |
| **Blocking factor** | Count of Tasks transitively unblocked by this Task | Priority ordering (§9.3) |
| **Fan-in risk** | Tasks with ≥4 incoming edges | Risk assessment (§11.2) |
| **Single point of failure** | A Task on the critical path with no alternative and blocking factor ≥ 5 | Risk assessment, checkpoint policy |

### 8.5 Graph mutation

**The graph is immutable within a plan version.** Adding, removing, or re-pointing an edge creates plan
version *n+1* via REPLANNING (ADR-0029). There is no in-place edit, because a graph that changes underneath a
running scheduler cannot be reasoned about and cannot be replayed.

---

## 9. Priority System

### 9.1 The stance: declared tiers, computed ordering

A single numeric priority score is ungovernable — everything drifts to 9, and nobody can explain why one
task outranked another. Instead: **the Principal or Kai declares a tier; the engine computes ordering within
the tier deterministically.**

### 9.2 Tiers

| Tier | Name | Meaning | Who may assign |
|---|---|---|---|
| **P0** | Critical | Something is broken, unsafe, or externally committed today | Principal; Security Office (unilaterally, for security work) |
| **P1** | Committed | Has a hard deadline or an external commitment | Principal, Kai |
| **P2** | Standard | Normal work. **The default.** | Kai |
| **P3** | Background | Runs when nothing else needs the capacity | Kai, department heads |

**P0 is rationed.** No more than **two** P0 Missions may be active at once. A third P0 requires the Principal
to demote one, explicitly, in a single interaction. Without a cap, P0 becomes the new P2 within a month —
this is the most reliably observed failure of every priority scheme ever built.

### 9.3 Ordering within a tier

Strictly lexicographic. Each key is deterministic and cheap; no model is consulted.

1. **Deadline pressure** — ascending slack (§10.3). Least slack first.
2. **Blocking factor** — descending. A Task that unblocks eleven others goes before one that unblocks none.
3. **Critical path membership** — on-path before off-path.
4. **Age** — ascending creation time. Prevents starvation of equal-ranked work.
5. **Task ID** — lexicographic. A final deterministic tiebreak so the scheduler is reproducible (G5).

Every key is checkable by a human reading the audit trail, which is the actual requirement.

### 9.4 Priority inheritance

If a Task in tier *T* has an unsatisfied dependency on a Task in a lower tier, **the dependency is promoted to
T for the duration**. Recorded as an event with the reason.

Without this, a P0 Mission waits behind a P3 Task, and the priority system produces exactly the inversion it
exists to prevent. Inheritance is transitive along the dependency path and is released when the blocking
relationship ends.

### 9.5 Rules

1. **Priority orders the queue. It never relaxes a rule.** No tier grants a wider effect class, skips a Guard,
   bypasses an Office, escapes a budget ceiling, or reduces verification. A P0 Mission with an insufficient
   capability is blocked exactly as a P3 would be.
2. **Priority is Mission-level; Tasks inherit it.** A Task may be *demoted* below its Mission's tier when it
   is off the critical path and has abundant slack. It may never be promoted above it except by §9.4.
3. **Tier changes are events.** A Mission promoted from P2 to P0 records who, when, and why.
4. **P3 has a guaranteed floor.** At least one P3 Dispatch per scheduling window whenever a P3 Task is ready
   and budget permits (§17.5). Background work that never runs is not background work; it is a backlog
   pretending to be a plan.

---

## 10. Deadline Model

### 10.1 Kinds

| Kind | Source | On breach |
|---|---|---|
| `hard` | External and immovable — a regulatory date, a customer commitment, a store deadline | Notify at the earliest projection of breach, not at breach. Escalate to the Principal as an Approval Request offering scope reduction, budget increase, or acceptance. |
| `soft` | Internal target | Record; adjust projections; **no notification** unless it also breaches a `hard` deadline downstream |
| `derived` | Computed by back-propagation from a `hard` deadline through the dependency graph | Same as the `hard` deadline it derives from |
| `none` | Most work | — |

### 10.2 Back-propagation

Given a Mission `hard` deadline, latest-finish times propagate backwards through the graph using p90
duration estimates. Every Task acquires a `derived` deadline. This is standard critical-path scheduling and
it is deliberately not clever — it is deterministic, explicable, and recomputable after every Outcome.

**p90, not p50.** A schedule built on median estimates is met roughly half the time, which is a schedule
nobody should rely on. Using p90 makes projections pessimistic and honest; the Firm reports slack it actually
has (Principle 9 — honest uncertainty).

### 10.3 Slack

```
slack(task) = latest_start(task) − earliest_start(task)
```

| Slack | State | Behaviour |
|---|---|---|
| > 2× p90 duration | Comfortable | Normal scheduling |
| ≤ 1× p90 duration | Tight | Priority ordering key 1 begins to dominate; deprioritise `soft` edges |
| ≤ 0 | Breaching | Mission flagged; projection recomputed; Principal notified once |
| < 0 and on critical path | Committed breach | Approval Request: reduce scope, raise budget, extend, or accept |

### 10.4 What a deadline may never do

The most important part of this section.

A deadline **may not**:

- reduce Review Intensity, skip an Office review, or bypass ADR-0008;
- skip or downgrade a Guard;
- raise an effect ceiling or widen a Fence;
- exceed a budget ceiling;
- suppress a notification that would otherwise fire;
- cause a Task to be marked complete without its verification evidence.

**Deadline pressure changes the order of work and the scope of work. It never changes the standard of work.**
Every organisation that has ever missed this has shipped the incident that follows from it. The Mission
Engine has no code path that accepts a deadline as an argument to a safety decision — the parameter is
absent, not merely ignored.

### 10.5 Projection reporting

The projected completion date is recomputed after every Outcome and expressed as a range (p50–p90) with the
critical-path Task named. A single date is a false claim; a range with a cause is useful.

Projections appear in the Mission view on demand. They are pushed to the Principal only when a `hard`
deadline's projection crosses from met to breaching — once, at the crossing, not repeatedly.

---

## 11. Risk Assessment

### 11.1 Purpose

Risk is not a field that gets a colour in a dashboard. **Risk determines policy**: how much verification a
Task gets, how often it checkpoints, how many retries it may have, whether an Office must review it, and
whether it may run unattended. A risk score that changes no behaviour is decoration, and this one changes six
things.

Assessed at APPRAISING, recomputed on every Outcome.

### 11.2 Dimensions

Six, each scored 0–3, each mechanically derivable. No model call is required for any of them.

| Dimension | 0 | 3 | Derived from |
|---|---|---|---|
| **Reversibility** | Class 0 — read-only | Class 3 — irreversible external effect | Task effect class (v1) |
| **Specification** | Acceptance criteria are objectively checkable | Acceptance is subjective or absent | Count of criteria with a mechanical verification method |
| **Novelty** | The Firm has done this ≥5 times successfully | Never attempted | **Memory query** — procedural memory for similar Task signatures (§23.2) |
| **Dependency fragility** | No dependencies | Fan-in ≥4, or on critical path with blocking factor ≥5 | Graph properties (§8.4) |
| **Cost variance** | p90/p50 ≤ 1.2 | p90/p50 ≥ 3.0, or no historical basis | Estimate spread and its source |
| **Blast radius** | Affects only this Mission's artifacts | Writes to a shared Registry, Canon, production, or another department's scope | Declared outputs and filesystem scope |

### 11.3 Aggregation

```
task_risk    = max(reversibility, blast_radius)          # safety dominates — never averaged away
             ⊕ mean(specification, novelty, fragility, cost_variance)

mission_risk = max(task_risk over critical path)
             ⊕ p90(task_risk over all tasks)
```

Reversibility and blast radius enter through `max`, never a mean. Averaging a class-3 irreversible effect
against four safe tasks produces a comfortable number and a real accident.

Bands: **0–3 Low · 4–6 Moderate · 7–9 High · 10–12 Severe.**

### 11.4 What risk determines

| Band | Verification | Checkpoint | Retry | Review | Autonomy |
|---|---|---|---|---|---|
| **Low** | 1 method | On completion | Policy default | None beyond standard | Unattended |
| **Moderate** | 2 methods | On completion + midpoint | Default | Quality Office on the Objective | Unattended |
| **High** | 2 methods, ≥1 independent agent | Every Subtask boundary | Halved | Quality + Architecture, or Security if blast radius = 3 | Unattended, with stall detection at half the normal window |
| **Severe** | 3 methods, ≥1 independent, ≥1 Principal-visible | Before every effect | **None — no automatic retry** | Security Office mandatory; Principal notified before dispatch | **Approval required before dispatch** |

### 11.5 Rules

1. **Severe risk always reaches the Principal before the effect occurs**, not after. This is the one place the
   Mission Engine spends attention proactively, and it is justified: the alternative is spending it on the
   consequences.
2. **Risk never decreases without evidence.** A Task's novelty score drops only when procedural memory records
   a successful comparable. Optimism is not a risk-reduction mechanism.
3. **The Security Office may raise a risk band unilaterally** and may not be overruled by a Division
   executive (`/docs-v2/02-organization/01-org-chart-v2.md` §5).
4. **Unknown is not Low.** A Task with no historical basis and unresolvable dimensions scores 3 for novelty
   and cost variance by default. The absence of information is itself information (Principle 9).

---

## 12. Verification Model

### 12.1 Verification is not review

Two different mechanisms, repeatedly conflated, and the conflation is why organisations ship things that
passed review and did not work.

| | Review | Verification |
|---|---|---|
| Question | *Is this good work?* | *Did it produce the stated outcome?* |
| Performed by | An independent agent or Office (ADR-0008) | The Mission Engine, evaluating evidence |
| Subject | The Deliverable | The Objective |
| Output | Approve / revise / veto | Met / unmet / inconclusive |
| Judgement | Yes | **No — mechanical evaluation of evidence** |

A Deliverable can pass review and fail verification. That case is not an anomaly; it is the case the
subsystem exists to detect.

### 12.2 Methods

| Method | Evidence | Deterministic |
|---|---|---|
| `artifact_exists` | Artifact ID present in the Vault with a matching content hash | Yes |
| `content_pattern` | Required sections or patterns present in a named artifact | Yes |
| `guard_pass` | A named Guard evaluated `pass` against the artifact (v2 Guards) | Yes |
| `test_pass` | A declared test or check reported success, with its output recorded | Yes |
| `metric_threshold` | A measured value crossed a declared threshold | Yes |
| `decision_recorded` | A Decision exists with a chosen option and recorded dissent | Yes |
| `registry_entry_added` | A Registry entry exists with an owner and a `revised` date | Yes |
| `office_review` | A named Office recorded approval | No — judgement, recorded |
| `independent_agent_check` | An agent **from a different department than the author** evaluated the criteria and recorded a verdict with reasoning | No — judgement, recorded |
| `principal_confirmation` | The Principal confirmed. Terminal and unappealable. | No |

### 12.3 Rules

1. **Every Objective has ≥1 verification method that is not the author's assertion.** Enforced at the
   APPRAISING gate; a plan without it cannot be authorised.
2. **`self_report` is not a method.** An agent saying "done" moves a Task to `SUCCEEDED`; it does not move an
   Objective to `met`. This is the entire content of ADR-0025.
3. **`independent_agent_check` requires a different department**, extending ADR-0008's author≠reviewer to
   author's-department ≠ verifier's-department — the same rule Offices follow.
4. **Evidence is immutable and referenced by hash.** Verification cites the artifact version it evaluated.
   Re-verification after a change is a new evaluation, not an update.
5. **Inconclusive is a legal outcome** and does not become "met" by default or by deadline pressure. It
   escalates: more evidence, an Office, or the Principal.
6. **Verification is not free and is budgeted.** `independent_agent_check` costs a Turn. High-risk Objectives
   deserve it; Low-risk Objectives get mechanical methods, which cost nearly nothing.

### 12.4 Objective outcomes

| Outcome | Condition |
|---|---|
| `met` | Required evidence count reached, all passing |
| `partially_met` | Some criteria verified, others failed, with the split recorded criterion by criterion |
| `unmet` | Required evidence absent or failing |
| `inconclusive` | Evidence collected but insufficient to decide |
| `waived` | The Principal explicitly accepted non-fulfilment. Recorded as a Decision with rationale. |

`waived` exists because the alternative is agents quietly reclassifying `unmet` as `met` under pressure.
Making the waiver explicit, attributed, and permanent is strictly better than pretending it never happens.

---

## 13. Retry Strategy

### 13.1 Classify before retrying

**No retry occurs without a failure classification** (ADR-0028). Blind retry is how a permission failure
becomes forty identical denied requests and how a semantic failure becomes four identical wrong answers at
four times the cost.

### 13.2 Failure taxonomy

| Class | Meaning | Auto-retry | Response |
|---|---|---|---|
| `transient` | Network timeout, provider 5xx, rate limit, lock contention | **Yes** | Exponential backoff with jitter |
| `deterministic` | Same input will fail identically — malformed input, missing dependency artifact, failed Guard | **No** | Replan or repair the input; one repair attempt with the failing rule quoted |
| `permission` | Capability denied, Fence blocked, effect class exceeded | **No** | Approval Request to the Principal, or plan revision |
| `budget` | Task, Mission, department, or monthly ceiling exhausted | **No** | Pause; Approval Request naming the ceiling and the amount |
| `semantic` | Work completed but did not achieve the outcome; verification failed | **No** | Verification failure path (§12); may trigger replanning |
| `capacity` | Department queue saturated, autoscale ceiling reached | **Yes, with long backoff** | Requeue at the tail of its tier |
| `dependency` | Upstream Task failed terminally | **No** | Cascade evaluation (§14.2) |
| `unknown` | Unclassifiable | **No** | Treat as `deterministic`; escalate. Never guess in the permissive direction. |

Classification is performed by the Mission Engine from the Outcome envelope's structured error, not by the
failing agent's prose — an agent describing its own failure is an unreliable narrator about the one subject
it is least objective on.

### 13.3 Retry policy

```toml
[task.policy.retry]
max          = 2                        # attempts after the first, not total
backoff      = "exponential"            # base 4s, factor 2, jitter ±25%, cap 5m
eligible     = ["transient", "capacity"]
budget_share = 0.5                      # retries may consume at most 50% of the Task's remaining budget
```

**Hard rules:**

1. **Retries draw on the Task's own budget.** A Task cannot retry its way past its ceiling; when the retry
   budget is exhausted the Task fails terminally regardless of `max`.
2. **No automatic retry at effect class 3.** Irreversible effects are attempted once. A second attempt is a
   new Task requiring a new approval.
3. **No retry without an idempotency key** at effect class ≥1. Absence of the key makes the Task ineligible
   regardless of policy.
4. **Severe risk band disables auto-retry entirely** (§11.4), whatever the Task policy says. The stricter
   rule wins.
5. **Every attempt is a separate event** with its own cost and classification. `attempt: 3` is queryable; the
   log never shows one Task that mysteriously cost triple.
6. **Retry never widens anything.** Same capabilities, same fences, same effect class, same model class. A
   retry that "tries harder" by escalating privilege is not a retry.

---

## 14. Recovery Strategy

Retry handles a failed Task. Recovery handles a damaged Mission.

### 14.1 Checkpoints

A checkpoint is a durable Mission state marker: graph state, budget consumed, evidence collected, Task
states. Written to the event log, so recovery is replay rather than restore (ADR-0002).

| Policy | When | Assigned to |
|---|---|---|
| `on_completion` | After each Task terminates | Low risk (default) |
| `on_midpoint` | Plus at 50% of the Task's estimated duration | Moderate risk |
| `on_subtask` | At every reported Subtask boundary | High risk |
| `pre_effect` | Immediately before any effect at class ≥1 | Severe risk |

### 14.2 Cascade evaluation

When a Task fails terminally, the Mission Engine evaluates the blast radius rather than failing the Mission:

1. Compute the transitive set of Tasks blocked by the failure.
2. For each blocked Task, check for an **alternative path** to its Objectives — another Task, another
   contract, a `soft` edge that can be dropped.
3. For each Objective, determine whether it is still **reachable** with the remaining graph.
4. Classify the Mission:

| Situation | Response |
|---|---|
| All Objectives still reachable | Continue. Record the failure. |
| Some Objectives unreachable, `failure_posture = continue` | Mark those Objectives `unmet`; continue the rest; report both in the Brief |
| Some Objectives unreachable, `failure_posture = fail_fast` | Cancel non-terminal Tasks; go to VERIFYING; conclude `partially_completed` |
| A **critical** Objective is unreachable | Go to REPLANNING if viable, otherwise conclude `failed` |

An Objective may be marked `critical = true`, meaning the Mission has no value without it. This is declared
at planning, not decided during a failure — deciding what was essential *after* it failed is how organisations
retrofit success onto disappointment.

### 14.3 Replanning

Triggered by: unreachable critical Objective, verification failure with a viable alternative, a department
reporting that its Task requires decomposition the Engine should have planned (§7.4), a Charter change, or
Principal instruction.

**Replanning creates plan version *n+1*. It never mutates version *n*** (ADR-0029).

1. Freeze the current plan version; record it as `superseded_by`.
2. Preserve all completed Tasks and collected evidence — completed work is an *input* to the new plan, never
   discarded.
3. Re-derive the graph for unmet Objectives only.
4. Re-run APPRAISING: risk, verification, pre-flight capability and budget.
5. Re-authorise **only the delta** (§14.4).
6. Resume.

**Replanning is bounded.** `max_replans` defaults to 2. Exhausting it concludes the Mission
`partially_completed` and returns to the Principal with what was achieved, what was not, and why the plan
failed twice. A Mission that can replan indefinitely is a Mission that never ends and never admits it.

### 14.4 Delta authorisation

Full re-approval of an unchanged plan wastes the Principal's attention (Principle 1). Re-approval of a
changed plan is mandatory. The rule:

| Change in the new version | Requires |
|---|---|
| Tasks removed; scope reduced | Notification only |
| Tasks added within existing Objectives, budget, and effect ceiling | Notification only |
| Budget increase, effect ceiling increase, Fence widening, new department, new Objective | **Principal approval**, scoped to the change |
| Risk band increase to Severe | **Principal approval + Security Office** |

### 14.5 Crash recovery

On restart, for every non-terminal Mission:

1. Replay the event log to the last checkpoint. The projection tables are rebuilt, never trusted.
2. Reconcile in-flight Dispatches with the Orchestrator: for each, ask whether it completed, is running, or
   is lost.
3. **Lost Dispatch with an idempotency key** → re-dispatch. **Without one** → mark `FAILED` with class
   `unknown` and escalate. Guessing that an effect did not happen is the expensive kind of wrong.
4. Recompute the ready set and resume.

No Mission is lost by a crash, and **no effect is duplicated by a recovery** — the two properties that make
G7 testable.

---

## 15. Progress Tracking

### 15.1 The rule

**Progress is evidence, not assertion** (ADR-0025, G4). No number displayed anywhere in Sidra OS derives from
an agent's opinion of how far along it is. Self-reported progress is the most reliably wrong data an
organisation collects, and it is wrong in a consistent direction.

### 15.2 Mission completion

```
completion = Σ (objective.weight × objective_credit)

objective_credit:  met = 1.0 · partially_met = (verified criteria / total criteria)
                   waived = 1.0 (flagged) · unmet | inconclusive = 0.0
```

Weighted by **Objective**, not by Task count. Fifteen small tasks and one hard one do not make the Mission
94% complete when the hard one has not started.

### 15.3 What is displayed

Three distinct figures, never merged into one:

| Figure | Source | Trust |
|---|---|---|
| **Verified** | §15.2 — evidence only | Authoritative |
| **Executed** | Terminal Tasks / total Tasks | Factual but not meaningful — a Task can finish without advancing an Objective |
| **Reported** | Subtask telemetry rolled up | **Explicitly labelled as reported.** Advisory only. |

The Principal sees *Verified* by default. *Executed* and *Reported* are available in the Inspector. Collapsing
these into a single percentage would be the most convenient possible lie.

### 15.4 Health signals

Computed, not judged; each maps to a defined response.

| Signal | Definition | Response |
|---|---|---|
| **Stalled** | No Task state change within the risk-adjusted window | Flag; probe the department; notify if it persists |
| **Burning** | Cost consumed / verified completion > 1.5 | Cost Office notified at 1.5; Mission paused at 2.0 |
| **Slipping** | p90 projection past a `hard` deadline | One notification at the crossing |
| **Thrashing** | Retry or replan count above policy | Escalate — the plan is wrong, not the execution |
| **Divergent** | Executed ≫ Verified (>40% gap) | Work is happening that does not serve the Objectives. Investigate before continuing. |

**Divergent** is the signal worth building the subsystem for: it is the only mechanical detector of an
organisation that is busy and not effective, and no system that trusts self-reported progress can compute it.

### 15.5 Reporting to the Principal

Unchanged from v1 and non-negotiable: **one Brief, one ask, ≤600 words**, however many Missions are running.
Mission detail is pulled, never pushed. The Mission view renders on demand in under 400 ms (G1).

---

## 16. Execution Policies

### 16.1 Policy resolution order

Policies resolve **most restrictive wins**, evaluated in this order. Nothing later may widen anything earlier.

```
Firm defaults  →  Charter  →  Department policy  →  Objective policy  →  Task policy  →  Risk band override
   (settings)     (§5.1)      (Pack manifest)                                            (§11.4, can only tighten)
```

### 16.2 The policy object

```toml
[policy]
autonomy            = 3          # delegation depth; ≤ Charter
effect_ceiling      = 2          # ≤ Charter
review_intensity    = "standard" # full | standard | lean (ADR-0018) — never disables ADR-0008
failure_posture     = "continue" # continue | fail_fast
parallelism_max     = 4          # concurrent Dispatches for this Mission
department_parallel = 2          # concurrent Dispatches into any one department
notification        = "standard" # standard | quiet — quiet suppresses nothing in the mandatory five
replan_max          = 2
approval_batching   = true       # batch non-urgent approvals into the next Brief
unattended_hours    = true       # may dispatch outside working hours at effect class ≤1
```

### 16.3 Budget: the fifth nested scope

v2 established four nested ceilings — turn → engagement → department → month (ADR-0020). The Mission
introduces a fifth **orthogonal** scope, and the distinction matters:

```
                  month  ($150 default)
                    │
        ┌───────────┴───────────┐
   department                mission        ← orthogonal: a Mission spans departments
        │                        │
   engagement ◀─────────────────┘             a Mission's Tasks execute as Engagements
        │
      turn
```

A Dispatch must satisfy **every** applicable ceiling: its Turn, its Engagement, its department's remaining
share, the Mission's remaining budget, and the month. The most constrained wins. Exhausting the Mission
budget pauses that Mission; exhausting a department's share pauses that department's Tasks across all
Missions. The two failure modes are different and are reported differently.

### 16.4 Hard limits no policy may cross

1. No policy raises an effect ceiling above the Charter's, and no Charter above what the Principal granted.
2. No policy disables verification, a Guard, an Office veto, or the ADR-0008 reviewer.
3. No policy permits an effect at class 3 without an approval.
4. No policy suppresses the five mandatory notification conditions.
5. No policy allows a Mission to spend past a ceiling. Ceilings pause; they never degrade the model class
   silently (v1 routing rule, unchanged).

---

## 17. Scheduling Strategy

### 17.1 Deterministic by construction

The scheduler makes **no model calls**. Given identical mission state, budgets, and department queues, it
emits the identical Dispatch (G5, Principle 8). A scheduler that reasons is a scheduler nobody can debug at
2 a.m.

### 17.2 The loop

```
every tick (event-driven: Outcome received, budget restored, approval granted, deadline crossed,
            resource released, or scheduled wake):

  1. ADMIT      collect all Missions in READY or RUNNING
  2. READY SET  per Mission, Tasks whose incoming edges are all satisfied (§8.2)
  3. FILTER     drop Tasks that fail any gate:
                  · Mission / department / monthly budget insufficient for the Task's p90
                  · required capability not currently granted
                  · effect class > policy ceiling
                  · Severe risk band without approval
                  · department at autoscale ceiling or parallelism cap
                  · required exclusive resource held
                  · Mission or department parallelism cap reached
  4. ORDER      sort: tier → deadline pressure → blocking factor → critical path → age → id  (§9.3)
  5. RESERVE    reserve budget and exclusive resources for the selected Task
  6. DISPATCH   emit a Dispatch envelope to the Orchestrator (§22.2)
  7. RECORD     append task.dispatched to the event log
```

Steps 3 and 5 are the ones that matter. **Filtering before ordering** means an unaffordable or ungranted Task
never reaches the front of the queue and blocks it. **Reserving before dispatching** means two Dispatches
cannot both believe they have the last $3.

### 17.3 Concurrency

Bounded at four levels simultaneously; the minimum applies:

| Level | Limit | Source |
|---|---|---|
| Global | Total concurrent Dispatches | Firm setting |
| Per department | Concurrent Dispatches into one department | Pack manifest autoscale ceiling |
| Per Mission | `parallelism_max` | Policy |
| Per resource | Exclusive lock | `resource` edges (§8.2) |

### 17.4 Preemption

**Only at checkpoint boundaries. Never mid-effect.**

A P0 Mission arriving does not kill running work. It takes the next available slot, and running Tasks are
allowed to reach their checkpoint. The only exception is a **Security Office pause**, which suspends
dispatch immediately but still does not kill an in-flight effect — it lets it checkpoint, then stops.

Killing work mid-effect creates exactly the partial-state problem that idempotency keys and checkpoints exist
to avoid, and it does so under time pressure, which is the worst moment to create it.

### 17.5 Fairness

- **Anti-starvation:** any Task ready for more than the starvation window is promoted to the front of its own
  tier. It never crosses tiers — that would make tiers meaningless.
- **P3 floor:** ≥1 P3 Dispatch per window when a P3 Task is ready and budget permits (§9.5).
- **Department fairness:** no single Mission may hold more than 50% of a department's concurrent slots while
  another Mission has a ready Task for that department.

### 17.6 Quiet hours and unattended execution

Outside declared working hours, only Tasks at effect class ≤1 with `unattended_hours = true` dispatch.
Class ≥2 work queues until working hours or an explicit approval. Night Shift memory consolidation
(v1, unchanged) is unaffected — it is not a Mission.

---

## 18. Mission Repository

### 18.1 Role

The Repository is the **only** way any component reads or writes Mission state. It is an interface over the
event log and its projections, not a database and not a cache with opinions.

Its existence is what keeps the Orchestrator from reaching into Mission state: there is one door, and the
Orchestrator does not have a key to the write side.

### 18.2 Interface

```
┌─ Writes (Mission Engine only) ──────────────────────────────────────────────┐
│ append(mission_event)          the only mutation path — everything else     │
│                                is a projection rebuilt from these           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─ Reads (Mission Engine, Orchestrator, shell, agents — capability-gated) ────┐
│ get(mission_id, at_version?)          full Mission, optionally historical   │
│ get_plan(mission_id, version)         a specific immutable plan version     │
│ list(filter)                          state, tier, department, deadline,    │
│                                       objective status, risk band          │
│ ready_set(mission_id)                 derived, cached, invalidated on event │
│ graph(mission_id, version)            nodes, edges, derived properties      │
│ evidence(objective_id)                all evidence with hashes             │
│ history(mission_id)                   every version with supersession chain │
│ outcome_record(mission_id)            plan vs. reality, post-conclusion     │
│ projection(mission_id)                cost and completion projections       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 18.3 Guarantees

1. **Append-only.** No update, no delete, at any layer.
2. **Version-addressable.** `get(id, at_version=2)` returns exactly what version 2 said, forever.
3. **Projection consistency.** Every read reflects all events appended before it, within one transaction
   boundary. No eventual consistency inside a single Vault.
4. **Read isolation by capability.** A department reads Missions it participates in. Cross-Mission reads
   require a grant. The Repository is not a back door around v2 department isolation.
5. **Rebuildable.** Drop every projection table and rebuild from the log with identical results. This is a
   tested property, not an aspiration (v1 M2 exit criterion, extended).

---

## 19. Mission Event Model

### 19.1 Events are the Mission

Mission state is a **projection of the event log** (ADR-0002). The `missions` table is a convenience for
querying; the truth is the events. Recovery replays; it never restores.

### 19.2 Event kinds

| Event | Payload highlights |
|---|---|
| `mission.drafted` | directive_id, charter, objectives |
| `mission.objective_added` / `.revised` | objective, weight, verification spec |
| `mission.planned` | plan_version, task set, graph, estimates |
| `mission.appraised` | risk per task and mission, verification specs, policy resolution |
| `mission.preflight_passed` / `.failed` | capability set, budget projection, failing item |
| `mission.reviewed` | office, verdict, findings |
| `mission.authorised` | principal, timestamp, plan_version |
| `mission.rejected` | actor, reason |
| `mission.state_changed` | from, to, trigger, actor |
| `mission.paused` / `.resumed` | actor, reason |
| `task.ready` / `.blocked` | blocking edges |
| `task.dispatched` | task_id, work_order_id, engagement_id, contract, resolved_department, reserved budget, attempt |
| `task.outcome` | result, cost, duration, artifacts, structured error |
| `task.failed` | **failure_class**, attempt, retry_eligible |
| `task.retried` | attempt, backoff, remaining retry budget |
| `task.cancelled` / `.skipped` | reason |
| `subtask.reported` | department-supplied telemetry (§7.3) |
| `objective.evidence_added` | method, artifact hash, verifier, verdict |
| `objective.evaluated` | outcome, evidence set |
| `objective.waived` | principal, rationale, decision_id |
| `mission.replanned` | from_version, to_version, trigger, preserved work |
| `mission.superseded` | successor mission_id |
| `mission.concluded` | outcome, objectives met/unmet, cost vs. estimate, duration vs. estimate |
| `mission.outcome_recorded` | plan-vs-reality record written to procedural memory |
| `mission.risk_changed` | task or mission, from band, to band, cause |
| `mission.priority_changed` | from tier, to tier, actor, reason (incl. §9.4 inheritance) |

### 19.3 Rules

1. **Every state change is an event before it is a projection.** No component writes a state field directly.
2. **Events are immutable and hash-chained** into the existing v1 chain. No separate log.
3. **Every event names its actor** — Principal, agent ID, or `system:mission-engine`.
4. **Cost is attributed on the event**, so cost queries never require joining across subsystems.
5. **No event kind is ever removed or redefined** (v2 compatibility contract). Additions only.
6. **Every dispatched Task carries its plan version**, so a Turn can always be traced to the plan that
   ordered it — including a plan since superseded.

---

## 20. Mission Persistence

### 20.1 Additive only

No existing table is dropped, no column changes meaning, no event kind is removed. Consistent with the v2
compatibility contract (`/docs-v2/04-migration/01-migration-strategy.md` §2).

### 20.2 New tables — all projections

| Table | Purpose |
|---|---|
| `missions` | Current state per Mission: charter, state, tier, current plan version, budget consumed, projections |
| `mission_plans` | Immutable plan versions: version, created_at, author, supersedes, rationale |
| `mission_objectives` | Objective, weight, kind, owner department, verification spec, current outcome |
| `mission_tasks` | Task definition per plan version, state, attempt count, estimates, actuals |
| `mission_edges` | Dependency edges per plan version: from, to, kind, satisfied_at |
| `mission_evidence` | Verification evidence: objective, method, artifact hash, verifier, verdict, timestamp |
| `mission_dispatches` | Dispatch ↔ Work Order ↔ Engagement correlation, reservation, attempt |
| `mission_risk` | Risk scores per Task and Mission, per dimension, with recompute history |
| `mission_outcomes` | Post-conclusion: plan vs. reality, cost variance, duration variance, risks materialised |
| `mission_resources` | Exclusive resource locks: resource, holder task, acquired_at |

### 20.3 Additive columns on existing tables

| Table | Column | Behaviour when null |
|---|---|---|
| `work_orders` | `mission_id`, `task_id`, `plan_version` | Exactly v1 behaviour — an unplanned Work Order |
| `engagements` | `mission_id` | Unscoped, as v1 |
| `deliverables` | `objective_id` | No verification linkage |
| `budgets` | `mission_id` | The four v2 ceilings apply unchanged |

**A null `mission_id` is a fully supported state**, not a migration artifact. Fast-lane Directives produce
Work Orders with no Mission, forever. That is the design, not a gap (§3.1).

### 20.4 Vault representation

Consistent with v1's Markdown mirror rule — the archive outlives the software.

```
~/Sidra/
├── missions/
│   └── msn_01J8K.../
│       ├── mission.md              charter, objectives, current state — human-readable
│       ├── plan-v1.md              the plan as authorised, immutable
│       ├── plan-v2.md              the replan, with its rationale
│       ├── graph-v2.mermaid        the dependency graph, renderable
│       ├── evidence/               verification evidence, hash-named
│       └── outcome.md              plan vs. reality, written at conclusion
└── artifacts/<dept>/...            unchanged (v2 department scoping)
```

The Markdown mirror is written on state transitions, not continuously. A Principal who abandons Sidra OS
keeps a readable record of every Mission, its plan, and how it actually went.

### 20.5 Migrations

`0019_missions.sql` through `0024_mission_outcomes.sql`. Forward-only, idempotent, each independently
deployable, none touching an existing column's meaning.

### 20.6 Retention

**Missions are never deleted** (Principle 3). Concluded Missions older than the retention window are
*compacted*: full event detail is retained in the log; projections are collapsed to the outcome record. The
plan, the evidence hashes, and the outcome remain queryable indefinitely.

---

## 21. Mission APIs

Follows the v1 command/query split (`/docs/02-architecture/05-api-design.md`). Commands mutate via events;
queries never mutate. Every command is capability-gated and logged.

### 21.1 Commands

| Command | Actor | Effect |
|---|---|---|
| `mission.create` | Kai, Principal | Draft a Mission from a Directive |
| `mission.add_objective` | Kai, Principal | Add or revise an Objective (pre-authorisation) |
| `mission.plan` | Kai | DRAFTED → PLANNING |
| `mission.appraise` | Mission Engine | PLANNING → APPRAISING |
| `mission.submit_for_review` | Mission Engine | Request Office plan review |
| `mission.record_review` | Office | Record verdict and findings |
| `mission.authorise` | **Principal only** | AWAITING_AUTH → READY |
| `mission.reject` | Principal, sustained Office veto | → REJECTED |
| `mission.pause` | Principal, Cost Office, Security Office | → PAUSED |
| `mission.resume` | Principal | → READY |
| `mission.replan` | Mission Engine, Principal | Open plan version n+1 |
| `mission.supersede` | Principal, Kai | → SUPERSEDED, naming the successor |
| `mission.abandon` | **Principal only** | → ABANDONED |
| `mission.set_priority` | Principal, Kai (≤P1), Security Office (P0 for security work) | Change tier |
| `mission.waive_objective` | **Principal only** | Accept non-fulfilment; creates a Decision |
| `task.cancel` | Mission Engine, Principal | Cancel a non-terminal Task |
| `task.record_outcome` | **Orchestrator only** | Report execution result |
| `subtask.report` | Executing department | Progress telemetry (§7.3) |
| `objective.add_evidence` | Mission Engine, verifying agent | Attach verification evidence |

### 21.2 Queries

`mission.get` · `mission.get_plan` · `mission.list` · `mission.graph` · `mission.ready_set` ·
`mission.progress` · `mission.projection` · `mission.evidence` · `mission.history` · `mission.risk` ·
`mission.outcome` · `mission.cost_breakdown`

### 21.3 API rules

1. **`task.record_outcome` is the Orchestrator's only write.** It is the entire write surface between the two
   subsystems (G3, ADR-0022).
2. **`mission.authorise`, `mission.abandon`, and `mission.waive_objective` are Principal-only.** No agent, no
   Office, no automation. These three are where authority actually lives.
3. **Commands are idempotent by command ID.** A retried command does not double-apply.
4. **Queries are capability-gated.** A department queries Missions it participates in; broader reads need a
   grant (§18.3).
5. **No API mutates a plan version.** Plans are created and superseded, never edited (ADR-0029).

---

## 22. Integration with Orchestrator

The most important boundary in this document.

### 22.1 The division of authority

```
┌──────────────────────────────┐                    ┌──────────────────────────────┐
│      MISSION ENGINE          │                    │       ORCHESTRATOR           │
│      sidra-mission           │                    │     sidra-orchestrator       │
├──────────────────────────────┤   Dispatch  ────▶  ├──────────────────────────────┤
│ Owns:                        │                    │ Owns:                        │
│  · Missions, plans, versions │                    │  · Engagements               │
│  · Objectives and evidence   │                    │  · Work Orders               │
│  · Tasks and the graph       │  ◀──── Outcome     │  · Turns                     │
│  · Priority and scheduling   │                    │  · Agent invocation          │
│  · Risk and verification     │                    │  · Workflow execution        │
│  · Retry and replan policy   │                    │  · Meetings, the Exchange    │
│  · Budget reservation        │                    │  · Deliverable production    │
├──────────────────────────────┤                    ├──────────────────────────────┤
│ MUST NOT:                    │                    │ MUST NOT:                    │
│  · call a model              │                    │  · create or modify a Mission│
│  · invoke an agent or tool   │                    │  · alter a plan or the graph │
│  · produce a Deliverable     │                    │  · change priority or        │
│  · write to the Vault except │                    │    scheduling order          │
│    its own Mission records   │                    │  · decide a retry or replan  │
│  · run a Turn                │                    │  · evaluate an Objective     │
└──────────────────────────────┘                    └──────────────────────────────┘
```

**Authority is one-way; information is two-way.** The Orchestrator learns what to do from the Mission Engine.
The Mission Engine learns what happened from the Orchestrator. Neither can perform the other's function, and
the crate boundary makes it a compile-time property rather than a convention (G3).

### 22.2 The Dispatch envelope

The Mission Engine's only output. It is a **v1 Work Order (ADR-0010) plus five fields** — deliberately not a
new protocol.

```toml
[dispatch]
dispatch_id     = "dsp_01J8K..."
mission_id      = "msn_01J8K..."        # NEW
task_id         = "tsk.failover.runbook" # NEW
plan_version    = 2                      # NEW
attempt         = 1                      # NEW
verification    = ["artifact_exists", "guard_pass"]   # NEW — what will be checked

# --- everything below is the v1 Work Order contract, unchanged ---
contract        = "capability.incident-response"
objective       = "Author the regional failover runbook"
inputs          = ["art.arch.payments.v3", "reg.backend.service-boundaries"]
acceptance      = ["Covers detection, decision, cutover, validation, rollback", "..."]
budget          = "$4.00"                # already reserved by the scheduler
effect_ceiling  = 1
fences          = ["no_production_writes"]
standards       = ["infrastructure/runbook-completeness"]
deadline        = 2026-08-20
reviewer        = "resolved by the answering department"   # ADR-0008 unchanged
idempotency_key = "tsk.failover.runbook@v1"
```

The Orchestrator treats it as a Work Order and needs no knowledge of Missions to execute it. A v1
Orchestrator handed a Dispatch would ignore five fields and run correctly — which is the property that makes
this non-breaking.

### 22.3 The Outcome envelope

The Orchestrator's only write into the Mission Engine.

```toml
[outcome]
dispatch_id     = "dsp_01J8K..."
engagement_id   = "eng_01J8K..."
result          = "succeeded"            # succeeded | failed | cancelled
artifacts       = ["art.runbook.v1"]     # hashes included
cost_actual     = "$3.12"
duration        = "22m"
reviewer_id     = "agent.software-engineering.code-reviewer.02"   # ADR-0008 evidence
guard_results   = [{ guard = "runbook-completeness", verdict = "pass" }]

  [outcome.error]                        # present only on failure
  class         = "transient"            # STRUCTURED — the Mission Engine classifies from this
  code          = "provider_timeout"
  detail        = "Model gateway timeout after 60s"
  retryable_hint = true                  # a hint only; the Mission Engine decides
```

`retryable_hint` is advisory. The Mission Engine applies §13.3 and may refuse a retry the Orchestrator
believed was safe — for example at effect class 3, or in the Severe risk band. **The executor never decides
whether to try again.**

### 22.4 Mission ↔ Engagement

| | Mission | Engagement |
|---|---|---|
| Owner | Mission Engine | Orchestrator |
| Spans | Objectives, days, departments | One coherent unit of execution |
| Cardinality | One Mission → **many** Engagements | One Engagement → zero or one Mission |
| Survives | Restarts, pauses, replans | Its own execution |

A Task dispatches into an Engagement. An Engagement without a `mission_id` is a fast-lane Directive — the
majority of the Firm's work, unchanged from v1 (ADR-0030).

### 22.5 What changed in the Orchestrator

Honestly, very little — which is the evidence that the seam was cut in the right place.

| Change | Nature |
|---|---|
| Accepts a Dispatch envelope | Additive: five ignorable fields on an existing contract |
| Emits an Outcome envelope | Additive: it already recorded all of this; now it returns it |
| Passes `mission_id` / `task_id` through to Work Orders and Turns | Additive columns |
| **Loses** the decision to retry | Removed responsibility |
| **Loses** decomposition of a Mandate into Work Orders | Removed responsibility — now the Mission Engine's, for Missions only. The fast lane still decomposes as in v1. |
| Gains nothing else | — |

Two responsibilities move out; nothing moves in. The Orchestrator gets smaller, which is the correct
direction for a component that was doing two jobs.

---

## 23. Integration with Memory

### 23.1 Memory layers used

The five v1 layers are unchanged. The Mission Engine reads four and writes to two.

| Layer | Mission Engine use |
|---|---|
| **Canon** | **Read-only.** Constitutional constraints that bound every plan. A plan contradicting Canon fails at PLANNING. |
| **Semantic** | Read. Domain facts and Registry entries that inform decomposition and inputs. |
| **Procedural** | **Read and write.** How similar Missions went: what worked, what the estimate error was, which risks materialised. |
| **Episodic** | Read. Prior Engagement outcomes referenced by verification and novelty scoring. |
| **Working** | Not used directly. The Mission Engine is not an agent and has no Turn. |

### 23.2 Reads during planning

| Purpose | Query | Effect on the plan |
|---|---|---|
| Constraint discovery | Canon + Registries for the affected domain | Facts the plan must not contradict |
| **Novelty scoring** | Procedural memory for comparable Task signatures | Drives risk dimension 3 (§11.2) |
| **Estimate calibration** | Historical actual cost and duration for comparable Tasks | Replaces heuristic estimates with measured ones |
| Prior-art check | Episodic memory for related Missions | Prevents re-planning solved work; may reduce scope |
| Failure precedent | Procedural memory for prior failures of this Task shape | Raises risk; may add verification |

Retrieval uses the existing hybrid pipeline (ADR-0007) unchanged and counts against the same 40% frame cap
for any agent Turn that consumes it. The Mission Engine's own queries are direct Repository and Memory reads
and do not consume a frame.

### 23.3 Writes at conclusion

On `mission.concluded`, an **outcome record** is written as a procedural memory candidate:

```
Mission shape        objectives, task count, departments, contracts, risk profile
Plan vs. reality     estimated vs. actual cost and duration, per Task and Mission
Verification         which methods caught what; which Objectives were inconclusive
Failures             classes encountered, retries, whether replanning helped
Risks                which materialised, which were over-estimated
Plan quality         replan count, divergence signal, scope drift
```

This is the closed loop that v1 could not have: **a record of whether the plan was any good**, distinct from
whether the work was any good. Over time it calibrates estimates, novelty scores, and risk weights.

### 23.4 Namespace and isolation

- Missions live in the `mission.<mission_id>.*` namespace.
- A department participating in a Mission gets **scoped, expiring read access** to that namespace for its
  Tasks only — the same mechanism as an Exchange request (v2 isolation rules, unchanged).
- Cross-Mission memory reads require a grant. A Mission is not a hole in department isolation.
- Outcome records promote to firm-wide procedural memory only through Night Shift consolidation and the
  existing Canon promotion path (Kai proposes, Principal confirms). Nothing self-promotes.

### 23.5 Rules

1. **Memory informs the plan; it never authorises it.** A precedent does not grant a capability.
2. **A plan may not contradict Canon.** Detected at PLANNING; fails the gate with the specific fact named.
3. **Estimates cite their source** (`department` / `historical` / `heuristic`) so a reader can judge them.
4. **Absent history raises risk, never lowers it** (§11.5 rule 4).

---

## 24. Integration with Agents

### 24.1 The Mission Engine is machinery, not an agent

It has no charter, no personality, no memory of its own, no Turn, and no model. It is deterministic
infrastructure. Agents *use* it; it does not participate in the organisation.

This matters because the alternative — a "Planner" agent — would need a department, a budget, an Office
reviewing it, and a seat at Cabinet, and it would become the bottleneck it exists to prevent (Principle 12:
capability is composed, not concentrated).

### 24.2 Which agents touch a Mission

| Agent | Role | Phase |
|---|---|---|
| **Kai** (`agent.exec`) | Decides a Directive warrants a Mission (§3.1); drafts Objectives; requests planning; synthesises the Brief. Uses `delegate` and `report` — **no new tool** (ADR-0004 intact). | DRAFTING, CONCLUDED |
| **Division executives** | Advise on department selection when contract resolution is ambiguous | PLANNING |
| **Department heads** | Supply estimates for Tasks addressed to their contracts, via the Exchange. Decompose into Subtasks at execution. | PLANNING, EXECUTING |
| **Quality Office** (Argus) | Reviews the **plan**: are Objectives falsifiable, is verification adequate, are acceptance criteria checkable | APPRAISAL |
| **Architecture Office** (Rune) | Reviews plans touching contracts, interfaces, or registered stances | APPRAISAL |
| **Cost Office** (Cass) | Reviews cost projection against the Charter; may pause a burning Mission | APPRAISAL, EXECUTING |
| **Security Office** (Corvus) | Mandatory review at effect class ≥2 or blast radius 3; may raise a risk band or pause unilaterally | APPRAISAL, EXECUTING |
| **Executing agents** | Receive Work Orders. **They see a Task, not a Mission.** | EXECUTING |
| **Verifying agents** | Perform `independent_agent_check`; must be from a different department than the author | VERIFYING |

### 24.3 Plan review — the new application of Principle 5

v2 built Offices to review Deliverables. Plan review extends the same structure to the plan itself, and it is
cheaper than any other review in the system because it happens before any work is done.

| Trigger | Reviewing Office |
|---|---|
| Every Mission above the review threshold | Quality |
| Any Task at effect class ≥2, or blast radius 3 | Security |
| Cost projection ≥ 60% of the Charter budget | Cost |
| Any Task changing a contract, interface, or architectural stance | Architecture |

Verdicts: `approve` · `concerns` (recorded, proceeds) · `veto` (blocks; only the Principal may override, and
the override is a Decision with the accepted risk named).

**Plan-veto rate has a floor**, exactly as Deliverable review does. An Office that approves every plan is not
reviewing plans (`/docs-v2/02-organization/02-agent-architecture-v2.md` §7).

### 24.4 What agents may never do

1. **Modify a plan.** Only the Mission Engine, via `mission.replan`, on defined triggers.
2. **Change priority above P1.** Kai may set up to P1. P0 is the Principal's, or the Security Office's for
   security work.
3. **Mark an Objective met.** Agents supply evidence; the Mission Engine evaluates it.
4. **Retry their own Task.** The failure is reported; the Mission Engine decides (§22.3).
5. **See another Mission's plan** without a grant.
6. **Create a Mission autonomously.** Kai proposes; the Principal authorises. The Firm may not decide to
   pursue an intention the Principal never expressed.

---

## 25. Integration with PermissionBroker

### 25.1 Pre-flight validation — the main idea

**The whole plan is validated against the Permission Broker before the first Dispatch** (ADR-0027).

At APPRAISING the Mission Engine computes the union of every capability every Task will require and submits
it as a single question: *given the current grants, can this plan run to completion?*

| Result | Response |
|---|---|
| All capabilities granted | Proceed to AUTHORISE |
| Some grantable but not granted | Included in the authorisation request as one plain-language list |
| Some not grantable under the Charter | **INFEASIBLE**, naming the specific capability and the Task requiring it |

This turns a mid-Mission permission failure — the most demoralising kind, because it arrives after the money
is spent — into a planning-time refusal. It is the single highest-value integration in this document.

### 25.2 The Broker remains the sole choke point

Nothing here weakens v1's model. **Pre-flight is a projection, not a grant.**

- Pre-flight tells the Mission Engine what *would* be permitted. It permits nothing.
- Every Dispatch is still checked at execution, individually, by the Broker, as in v1.
- A grant revoked between planning and dispatch causes that Dispatch to fail with class `permission`. The
  plan being "approved" is not a permission and never overrides a current denial.
- The Mission Engine holds no capability of its own beyond reading its own records. It cannot act on the
  world; it can only ask the Orchestrator to.

### 25.3 Capability scope and nesting

```
Principal's grant
   └── Charter effect ceiling and fences
         └── Department grant (v2 Pack manifest)
               └── Role Archetype capabilities
                     └── Task effect class and fences
                           └── Work Order capability set (issued per Dispatch)
```

Six nested subsets, each checked at issue time. The Mission Engine adds two levels (Charter, Task) and
removes none.

### 25.4 Approval handling

| Situation | Behaviour |
|---|---|
| Effect class 3 Task | Approval Request raised **before** dispatch; Task sits `BLOCKED` on an `approval` edge |
| Batchable approvals | Policy `approval_batching = true` collects non-urgent approvals into the next Brief |
| Approval denied | Task → `FAILED_TERMINAL`, class `permission`; cascade evaluation (§14.2) |
| Approval expired | Re-requested; never assumed |

**Batching is bounded by the five mandatory notification conditions** (v1 notification system). Anything in
that set interrupts regardless of policy, and no Mission setting can suppress it.

---

## 26. Integration with Vault

### 26.1 Storage

Mission records live in the encrypted SQLite Vault alongside everything else (ADR-0003). No new store, no
new encryption path, no new key. Mission events extend the existing hash chain rather than starting one.

### 26.2 Artifact scoping

Artifacts produced by a Mission's Tasks remain under **department scope**, not Mission scope:

```
~/Sidra/Artifacts/<department>/...        artifacts — v2 rule, unchanged
~/Sidra/missions/<mission_id>/...         mission records and Markdown mirror
```

A Mission references artifacts by ID and hash; it does not own or relocate them. Moving artifacts into a
Mission directory would break v2 department isolation for the convenience of a nicer folder — a bad trade.

### 26.3 The Markdown mirror

Written on state transitions (§20.4). Missions are the most valuable thing to preserve in readable form,
because a plan and its outcome record are exactly what a person needs when returning to work after months
away — or after abandoning the software entirely.

### 26.4 Export, backup, integrity

- **Export** includes Mission records, plan versions, evidence hashes, and outcome records.
- **Backup** is the existing Vault snapshot. Missions require no separate path.
- **`sidractl vault verify`** extends to Mission events: the chain covers them because there is one chain.
- **Portability:** a Vault carried to another machine carries its Missions, including in-flight ones, which
  resume from their last checkpoint.

---

## 27. Architecture Diagrams

### 27.1 Subsystem placement

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PRINCIPAL                          Directives ▲ │ ▼ Briefs, Approvals      │
├─────────────────────────────────────────────────────────────────────────────┤
│  SURFACE — Night Atrium (unchanged)   + Mission view, plan view, graph view  │
├─────────────────────────────────────────────────────────────────────────────┤
│  EXECUTIVE — Kai · 8 Divisions · 4 Offices                                   │
│      Kai drafts Missions      Offices review plans (§24.3)                   │
├──────────────────────────────┬──────────────────────────────────────────────┤
│    MISSION ENGINE            │            ORCHESTRATOR                       │
│    sidra-mission             │            sidra-orchestrator                 │
│  ┌────────────────────────┐  │  Dispatch  ┌──────────────────────────────┐  │
│  │ Planner                │  │ ─────────▶ │ Engagement runner            │  │
│  │ Graph engine           │  │            │ Work Order execution         │  │
│  │ Risk assessor          │  │            │ Turn lifecycle               │  │
│  │ Verifier               │  │  Outcome   │ Workflow engine              │  │
│  │ Scheduler              │  │ ◀───────── │ Meeting · Exchange           │  │
│  │ Recovery manager       │  │            └──────────────────────────────┘  │
│  │ Mission Repository     │  │                                              │
│  └────────────────────────┘  │                                              │
├──────────────────────────────┴──────────────────────────────────────────────┤
│  DEPARTMENTS (21) — agents, playbooks, standards, guards, registries         │
├─────────────────────────────────────────────────────────────────────────────┤
│  CORE PLATFORM                                                              │
│  Event Log (hash-chained) · Store · Memory (5 layers) · Model Gateway ·      │
│  Permission Broker · Registrar · Standards Engine · Guard Runner · Notify    │
├─────────────────────────────────────────────────────────────────────────────┤
│  THE VAULT — ~/Sidra/  (encrypted, local, one file + Markdown mirror)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 27.2 Internal components

```
                          ┌───────────────────────────┐
   Directive ────────────▶│   MISSION ENGINE          │
                          │                           │
   ┌──────────────────────┴───────────────────────────┴──────────────────────┐
   │                                                                          │
   │  ┌──────────┐    ┌────────────┐    ┌──────────────┐    ┌─────────────┐  │
   │  │ PLANNER  │───▶│   GRAPH    │───▶│ RISK ASSESSOR│───▶│  SCHEDULER  │  │
   │  │          │    │  ENGINE    │    │              │    │             │  │
   │  │objectives│    │ build      │    │ 6 dimensions │    │ ready set   │  │
   │  │→ tasks   │    │ validate   │    │ → policy     │    │ filter      │  │
   │  │estimates │    │ derive     │    │              │    │ order       │  │
   │  └────┬─────┘    └─────┬──────┘    └──────┬───────┘    │ reserve     │  │
   │       │                │                  │            └──────┬──────┘  │
   │       │                │                  │                   │ Dispatch│
   │       ▼                ▼                  ▼                   ▼         │
   │  ┌────────────────────────────────────────────────────────────────────┐ │
   │  │                    MISSION REPOSITORY                              │ │
   │  │            append-only · version-addressable · projections         │ │
   │  └──────────────────────────────┬─────────────────────────────────────┘ │
   │       ▲                │        │                  ▲                    │
   │       │                ▼        ▼                  │                    │
   │  ┌────┴─────┐    ┌──────────┐  ┌──────────┐   ┌────┴──────┐            │
   │  │ RECOVERY │◀───│ VERIFIER │  │ PROGRESS │   │  OUTCOME  │◀── Outcome │
   │  │ MANAGER  │    │          │  │ TRACKER  │   │  INTAKE   │            │
   │  │ cascade  │    │ evidence │  │ verified │   │ classify  │            │
   │  │ replan   │    │ → verdict│  │ /executed│   │ failures  │            │
   │  └──────────┘    └──────────┘  └──────────┘   └───────────┘            │
   └──────────────────────────────────────────────────────────────────────────┘
                                    │                    ▲
                                    ▼                    │
                              EVENT LOG            MEMORY · BROKER
```

### 27.3 Data model

```
   Directive 1 ──── 0..1 Mission
                        │
                        │ 1
              ┌─────────┼──────────┬─────────────────┐
              │ 1..n    │ 1..n     │ 1..n            │ 1..n
         Objective   PlanVersion  Policy         OutcomeRecord
              │           │
              │ 1..n      │ 1..n
              │        Task ────── n..n ── DependencyEdge
              │           │
              │ n..n      │ 1
              └───────────┤ (Task serves Objectives)
                          │
                          │ 1..n  (one per attempt)
                      Dispatch ────── 1 ── WorkOrder ── 1 ── Engagement
                                                                │ 1..n
                                                              Turn
                                                                │
                                                            Deliverable
                                                                │
              Objective ◀── Evidence ◀────────────────────────┘
```

Note the two independent chains meeting at Evidence: the plan chain (Mission → Objective → Task → Dispatch)
and the execution chain (Work Order → Engagement → Turn → Deliverable). They are joined by the Dispatch at
the top and by Evidence at the bottom, and nowhere else. That is the seam.

---

## 28. Sequence Diagrams

### 28.1 Directive to authorised Mission

```
Principal   Kai      MissionEngine   Registrar   Depts    Offices   Broker
    │        │              │            │         │         │        │
    │Directive│             │            │         │         │        │
    ├───────▶│              │            │         │         │        │
    │        │ evaluate threshold (§3.1) │         │         │        │
    │        │ mission.create            │         │         │        │
    │        ├─────────────▶│            │         │         │        │
    │        │              │ DRAFTED — objectives, charter  │        │
    │        │ mission.plan │            │         │         │        │
    │        ├─────────────▶│            │         │         │        │
    │        │              │ resolve contracts    │         │        │
    │        │              ├───────────▶│         │         │        │
    │        │              │◀───────────┤         │         │        │
    │        │              │ request estimates (Exchange)    │        │
    │        │              ├──────────────────────▶│        │        │
    │        │              │◀──────────────────────┤        │        │
    │        │              │ build + validate graph (§8.3)   │        │
    │        │              │ APPRAISING: risk, verification  │        │
    │        │              │ PRE-FLIGHT capability check     │        │
    │        │              ├────────────────────────────────────────▶│
    │        │              │◀────────────────────────────────────────┤
    │        │              │   all grantable                 │        │
    │        │              │ plan review                     │        │
    │        │              ├────────────────────────────────▶│        │
    │        │              │◀────────────────────────────────┤        │
    │        │              │   Quality: approve              │        │
    │        │              │   Security: concerns (recorded) │        │
    │◀───────┴──────────────┤ ONE approval request            │        │
    │  plan · cost range · risk · capabilities requested      │        │
    ├───────────────────────▶ mission.authorise               │        │
    │                       │ → READY                         │        │
```

### 28.2 The dispatch loop

```
Scheduler   Broker   Orchestrator   Dept Agent   GuardRunner   MissionEngine
    │          │          │             │             │              │
    │ ready set → filter → order → reserve budget     │              │
    │ Dispatch │          │             │             │              │
    ├─────────────────────▶│            │             │              │
    │          │          │ create Engagement + Work Order           │
    │          │◀─────────┤ capability check (per-dispatch)          │
    │          ├─────────▶│ granted     │             │              │
    │          │          ├────────────▶│ Turn        │              │
    │          │          │             │ subtask.report ───────────▶│
    │          │          │             │ Deliverable │              │
    │          │          │             ├────────────▶│ guards       │
    │          │          │             │◀────────────┤ pass         │
    │          │          │ independent reviewer (ADR-0008)          │
    │          │          │◀────────────┤ approved    │              │
    │          │          │ Outcome     │             │              │
    │          │          ├────────────────────────────────────────▶│
    │          │          │             │             │  classify    │
    │          │          │             │             │  add evidence│
    │          │          │             │             │  evaluate    │
    │          │          │             │             │  objective   │
    │          │          │             │             │  update graph│
    │◀─────────────────────────────────────────────────────────────┤
    │  recompute ready set → next Dispatch                          │
```

### 28.3 Failure, classification, retry

```
Orchestrator      MissionEngine        Principal
     │                  │                  │
     │ Outcome: failed  │                  │
     │ error.class = "transient"           │
     ├─────────────────▶│                  │
     │                  │ classify (§13.2) │
     │                  │ eligible? yes    │
     │                  │ retry budget? yes│
     │                  │ effect class ≤2? yes
     │                  │ risk ≠ Severe? yes
     │                  │ backoff 4s ± jitter
     │◀─────────────────┤ Dispatch attempt 2
     │                  │                  │
     │ Outcome: failed  │                  │
     │ error.class = "permission"          │
     ├─────────────────▶│                  │
     │                  │ NOT eligible     │
     │                  │ Task → FAILED_TERMINAL
     │                  │ cascade eval (§14.2)
     │                  │ obj.failover unreachable, critical
     │                  ├─────────────────▶│ Approval Request:
     │                  │                  │ "Grant integration:cloud:write,
     │                  │                  │  or reduce scope, or abandon?"
     │                  │◀─────────────────┤ grant
     │                  │ REPLANNING → plan v2, delta authorisation
```

### 28.4 Verification and conclusion

```
MissionEngine   Verifier(other dept)   GuardRunner   Memory   Kai   Principal
      │                  │                  │          │       │        │
      │ all tasks terminal → VERIFYING      │          │       │        │
      │ obj.failover: methods = [artifact_exists, independent_agent_check]
      │ artifact_exists ────────────────────▶│         │       │        │
      │◀─────────────────────────────────────┤ pass    │       │        │
      │ independent_agent_check              │         │       │        │
      ├─────────────────▶│ (dept ≠ author's dept)      │       │        │
      │◀─────────────────┤ verdict: criteria 2 of 3 met│       │        │
      │ objective → partially_met            │         │       │        │
      │ completion = Σ(weight × credit) = 0.78         │       │        │
      │ CONCLUDED: partially_completed       │         │       │        │
      │ outcome record → procedural memory   │         │       │        │
      ├───────────────────────────────────────────────▶│       │        │
      │ conclusion                           │         │       │        │
      ├───────────────────────────────────────────────────────▶│        │
      │                                      │         │  Brief: what was
      │                                      │         │  achieved, what was
      │                                      │         │  not, ONE ask
      │                                      │         ├───────────────▶│
```

---

## 29. Failure Scenarios

Concrete, with detection and response. Each is a test case.

| # | Scenario | Detection | Response |
|---|---|---|---|
| **F1** | **Plan is infeasible** — no installed department provides a required contract | PLANNING gate §3.3 | INFEASIBLE with the contract named. Never silently substitutes a general-purpose agent. |
| **F2** | **Capability missing** — plan needs a grant the Principal has not given | Pre-flight §25.1 | Surfaced in the single authorisation request, in plain language, before any spend |
| **F3** | **Capability revoked mid-Mission** | Per-dispatch Broker check | Task fails `permission`; no retry; cascade evaluation; Approval Request |
| **F4** | **Budget exhausted mid-Mission** | Scheduler reservation §17.2 | Mission → PAUSED; one Approval Request naming the ceiling and amount; no silent model downgrade |
| **F5** | **Department budget exhausted** (other Missions consumed the share) | Reservation filter | That department's Tasks block; other departments continue; Cost Office notified |
| **F6** | **Circular dependency introduced by replanning** | Graph validation §8.3 | Replan rejected; cycle path named; previous version remains authoritative |
| **F7** | **Deadlock on exclusive resources** | Resource-edge consistency check §8.3.6 | Detected at PLANNING. At runtime, lock timeout → lower-priority holder yields at its checkpoint |
| **F8** | **Task stalls** — no state change within the risk-adjusted window | Progress tracker §15.4 | Probe the department; if unresponsive, cancel at checkpoint and reclassify as `transient`; escalate on repeat |
| **F9** | **Orchestrator crashes mid-Dispatch** | Restart reconciliation §14.5 | Idempotency key present → re-dispatch. Absent → `unknown`, escalate. Never assume the effect did not occur. |
| **F10** | **Mission Engine crashes** | Event log replay | Resume from last checkpoint; in-flight Dispatches reconciled with the Orchestrator; no duplicated effect |
| **F11** | **Verification inconclusive** | §12.4 | Never defaults to `met`. Escalates: more evidence, an Office, or the Principal. |
| **F12** | **Objective unreachable, non-critical** | Cascade §14.2 | Marked `unmet`; Mission continues; both reported in the Brief |
| **F13** | **Critical Objective unreachable** | Cascade §14.2 | REPLANNING if viable and within `replan_max`; otherwise conclude `failed` |
| **F14** | **Replan loop** — `replan_max` exhausted | §14.3 | Conclude `partially_completed`; Brief states what was achieved and why planning failed twice |
| **F15** | **Estimate wildly wrong** — actual ≫ p90 | Burning signal §15.4 | Cost Office at 1.5×; pause at 2.0×; the variance enters the outcome record and recalibrates future estimates |
| **F16** | **Priority inversion** — P0 blocked by P3 | §9.4 | Automatic inheritance along the dependency path; recorded as an event |
| **F17** | **P0 saturation** — a third P0 requested | §9.2 cap | Refused. Principal must demote one explicitly, in one interaction. |
| **F18** | **Divergence** — much executed, little verified | Divergent signal §15.4 | Flagged above 40% gap. Work is happening that does not serve the Objectives; investigate before continuing. |
| **F19** | **Office vetoes a plan** | §24.3 | Mission → REJECTED unless the Principal overrides, recorded as a Decision naming the accepted risk |
| **F20** | **Department reports it needs deeper decomposition** | §7.4 | Task returns; REPLANNING splits it into planned Tasks. Departments never build private hierarchies. |
| **F21** | **Deadline unachievable** | Projection §10.5 | One notification at the crossing, with the critical-path Task named, offering scope / budget / extend / accept |
| **F22** | **Plan contradicts Canon** | PLANNING gate §23.5 | Fails with the specific Canon fact named |
| **F23** | **Duplicate effect after recovery** | Idempotency key + Guard | Prevented by design; if detected, the Mission halts immediately and escalates — this is the one failure that must never be handled quietly |
| **F24** | **Verifier is in the author's department** | Verification rule §12.3 | Rejected before it runs; a different department's verifier is requested |
| **F25** | **Mission spends >15% of budget on planning** | KPI G9 | Flagged at conclusion; recurring occurrence is a defect in the Mission Engine, not in the Mission |

---

## 30. Architectural Decision Records

Continuing the sequence: ADRs 0001–0011 in `/docs/06-implementation/adr/`, 0012–0021 in `/docs-v2/adr/`.
Format unchanged — Context → Options → Decision → Consequences, with consequences split into accepted,
gained, and reversal cost.

---

### ADR-0022 — The Mission Engine is a subsystem separate from the Orchestrator

**Status:** Accepted

**Context.** In v1 the Orchestrator held both the plan and its execution. The plan existed only as
orchestrator state — unreviewable before running, unchangeable without stopping, and uncomparable to the
outcome afterwards. At v2's scale, with 21 departments and multi-day cross-department work, all three become
severe.

**Options.**
1. **Keep planning in the Orchestrator, add a plan record.** Cheapest. The record would be written by the
   component it constrains, which is the same reason the Permission Broker is not inside the agent runtime.
2. **A Planner agent.** Fits the Firm's metaphor. Makes planning non-deterministic, unbudgetable as
   infrastructure, and creates a single agent every Mission passes through — the bottleneck Principle 12
   exists to prevent.
3. **A separate deterministic subsystem** with one-way authority over the Orchestrator.
4. **Per-department planners.** Maximum domain fit; no cross-department plan can exist, which is the case
   Missions are for.

**Decision.** Option 3. `sidra-mission` owns plans; `sidra-orchestrator` executes them. The Orchestrator has
no write path to Mission state beyond `task.record_outcome`. The Mission Engine has no execution path at all.

**Consequences.**

*Accepted:* a new subsystem, a new crate, a new set of concepts, and a hop between planning and execution on
every Task. Two components must stay in contract sync.

*Accepted:* the fast lane bypasses the Mission Engine entirely, so the system has two paths from Directive to
work. Justified — the alternative is planning overhead on trivial requests, which fails Principle 1.

*Gained:* the plan becomes reviewable by an Office before any spend — the cheapest review in the system.

*Gained:* the plan can be compared to the outcome, which is the only way an organisation learns whether its
planning is any good, as distinct from whether its work is.

*Gained:* the Orchestrator gets *smaller*. Two responsibilities leave; none arrive.

*Gained:* determinism. Scheduling and classification are testable in a way an agent's judgement is not.

*Reversal cost:* high once Missions carry history. This is a decision to make in design, before M11.

---

### ADR-0023 — Plans are versioned artifacts; they are never mutated

**Status:** Accepted · **Related:** ADR-0002, ADR-0029, Principle 3

**Context.** A plan changes during execution — failures, discoveries, scope changes. If the plan object is
edited in place, a running scheduler reasons about a graph that shifts underneath it, a Turn cannot be traced
to the instruction that ordered it, and replay is impossible.

**Options.** (1) Mutate in place — simplest, breaks replay and traceability. (2) Mutate with an audit trail of
diffs — reconstructable but expensive to query and easy to get subtly wrong. (3) Immutable versions with
supersession. (4) Immutable plan, mutable annotations — insufficient; graph changes are the common case.

**Decision.** Option 3. A plan version is immutable once authorised. Changes create version *n+1*, which
supersedes *n*. Every Dispatch carries its `plan_version`.

**Consequences.** *Accepted:* storage grows with each replan, and the Repository must be
version-addressable throughout. *Accepted:* "the current plan" always requires a version resolution.
*Gained:* every Turn traces to the exact instruction that ordered it, forever, including from superseded
plans. *Gained:* replay works, so recovery is replay rather than restore. *Gained:* plan-vs-reality
comparison has a stable subject. *Reversal cost:* moderate — mutation could be added, but the history already
written would be the last coherent history the system had.

---

### ADR-0024 — The Mission Engine plans to Task granularity; departments own Subtasks

**Status:** Accepted · **Related:** Principle 11, Principle 12, ADR-0013

**Context.** How deep should central planning go? Deep planning gives precise scheduling and precise
progress. It also requires the planner to be correct about 21 domains.

**Options.** (1) Plan to Subtask depth — precise and wrong, since the Engine has no domain knowledge and
would be re-planning constantly. (2) Plan to Task depth, ignore Subtasks — loses stall detection and
intra-Task progress. (3) **Plan to Task depth; receive Subtask telemetry.** (4) Let departments plan whole
Missions — no cross-department plan can then exist.

**Decision.** Option 3. Tasks are the planning floor. Departments decompose internally and report Subtask
telemetry upward as information only. Subtask depth is capped at one; a department needing more must report
back and trigger replanning.

**Consequences.** *Accepted:* progress within a Task is *reported*, not verified, and is labelled as such.
*Accepted:* a badly-sized Task is discovered during execution rather than planning. *Gained:* the Engine
needs no domain knowledge, which is what lets one Engine serve 21 departments. *Gained:* department
autonomy is preserved — v2's central promise. *Gained:* the plan stays small enough to read (G1).
*Reversal cost:* low in either direction.

---

### ADR-0025 — Progress is evidence-based; self-reported progress is never authoritative

**Status:** Accepted · **Related:** ADR-0008, Principle 4, Principle 9 · **Source:** the evidence-based stage
advancement pattern in Claude-Code-Game-Studios

**Context.** The default in every project-tracking system is to ask the worker how far along they are. This
data is reliably wrong and wrong in a consistent direction. With AI agents it is worse: a model asked whether
it completed a task will usually say yes, fluently.

**Options.** (1) Trust self-report — free and worthless. (2) Trust it with a confidence score — a fluent
model produces a confident wrong number. (3) **Evidence-based verification.** (4) Human verification of
everything — accurate and spends the one resource Principle 1 protects.

**Decision.** Option 3. Every Objective declares verification methods; at least one must not be the author's
assertion. Completion is computed from evidence. Self-report becomes *Reported* progress: displayed,
labelled, advisory, never authoritative.

**Consequences.** *Accepted:* verification costs money and latency, and Objectives must be written to be
verifiable — harder than writing them to sound good. *Accepted:* some genuinely finished work shows as
unverified until evidence arrives. *Gained:* the **Divergent** signal (§15.4) — a mechanical detector of an
organisation that is busy and not effective, computable no other way. *Gained:* the Brief can state
completion as fact. *Gained:* calibration data, because estimate error is measurable against something real.
*Reversal cost:* low mechanically, high in credibility — a system that once reported honestly and then
reverts is worse than one that never did.

---

### ADR-0026 — Scheduling is deterministic with declared priority tiers

**Status:** Accepted · **Related:** Principle 8, Principle 4

**Context.** Something must decide what runs next. The temptation is to ask a model, which would be flexible,
context-aware, and impossible to debug or reproduce.

**Options.** (1) Model-based scheduling — flexible, non-reproducible, unexplainable, and costs a call per
decision. (2) Single numeric priority — everything drifts to maximum. (3) **Declared tiers with computed
lexicographic ordering.** (4) FIFO — trivially fair and ignores deadlines and blocking entirely.

**Decision.** Option 3. Four tiers (P0–P3) assigned by a human or Kai; ordering within a tier computed from
five deterministic keys. No model call. P0 capped at two concurrent Missions. Priority inheritance prevents
inversion.

**Consequences.** *Accepted:* the scheduler cannot exercise judgement about a genuinely unusual situation —
that is escalated to the Principal instead, which is the correct destination. *Accepted:* four tiers is a
coarse instrument. *Gained:* reproducibility, so a scheduling decision can be explained after the fact from
the audit trail. *Gained:* no cost and no latency per decision. *Gained:* testability — G5 is a property
test. *Reversal cost:* low; a model-assisted tier *suggestion* could be added later without touching the
ordering.

---

### ADR-0027 — Capability and budget are validated pre-flight, before the first Dispatch

**Status:** Accepted · **Related:** v1 security model, ADR-0020

**Context.** In v1, permission failures surface at the moment of the effect. For a single Work Order that is
fine. For a 30-Task Mission it means discovering at Task 26 that the plan was never permitted — after 26
Tasks of spend.

**Options.** (1) Check at execution only (v1 behaviour) — no new mechanism, worst possible discovery time.
(2) **Pre-flight the whole plan, and still check every Dispatch.** (3) Pre-flight and grant up front — would
make the plan a permission, which contradicts the entire security model. (4) Pre-flight budget only —
partial, and permission failures are the more expensive kind.

**Decision.** Option 2. At APPRAISING, the union of required capabilities is submitted to the Broker as a
projection. Ungrantable → INFEASIBLE, naming the capability. Grantable but ungranted → included in the single
authorisation request. **Every Dispatch is still checked individually at execution.** Pre-flight is a
question, not a grant.

**Consequences.** *Accepted:* a plan can pass pre-flight and still fail at dispatch if a grant is revoked —
correct, and it must be documented so it is not read as a bug. *Accepted:* the Broker gains a projection
query it did not need before. *Gained:* the most demoralising failure mode is moved from execution to
planning. *Gained:* one consolidated capability request instead of a drip of approvals. *Gained:* the Broker
remains the sole choke point, unweakened. *Reversal cost:* low — removing pre-flight restores v1 behaviour.

---

### ADR-0028 — Failures are classified before any retry decision

**Status:** Accepted · **Related:** v1 workflow engine retry, Principle 9

**Context.** Retry is the reflex response to failure. Applied without classification it turns a permission
denial into forty identical denials and a semantic failure into four identical wrong answers at four times
the cost.

**Options.** (1) Retry everything with backoff — simple, wasteful, occasionally dangerous. (2) Let the
executing agent decide — the agent is the least objective party about its own failure. (3) **Classify from
the structured error; retry only eligible classes.** (4) Never retry — throws away the transient case, which
is the majority of real failures.

**Decision.** Option 3. Eight classes (§13.2). Only `transient` and `capacity` are auto-retry eligible.
Classification is performed by the Mission Engine from the Outcome's structured error, not from the agent's
prose. `unknown` is treated as `deterministic` — never guess permissively. No auto-retry at effect class 3 or
in the Severe risk band, whatever the Task policy says.

**Consequences.** *Accepted:* the Orchestrator must return structured errors, not just messages — real work
in every failure path. *Accepted:* misclassification produces wrong behaviour, so the taxonomy must stay
small and mechanically derivable. *Gained:* retry storms become structurally impossible. *Gained:* failure
class is queryable data, so "what actually goes wrong here" is answerable. *Gained:* the executor never
decides whether to try again — the same separation as the rest of this document. *Reversal cost:* low.

---

### ADR-0029 — Replanning supersedes; it never mutates or discards

**Status:** Accepted · **Related:** Principle 3, ADR-0002, ADR-0023

**Context.** When a plan proves wrong, the natural move is to fix it. Fixing means editing, editing means the
previous plan is gone, and the record of *why the Firm thought the first plan would work* is the most
valuable thing in the Mission.

**Options.** (1) Edit in place — loses the record. (2) Cancel and create a fresh Mission — preserves history
but breaks the thread; completed work and evidence would have to be re-imported by hand. (3) **Version and
supersede within the same Mission, preserving completed work and evidence as inputs.** (4) Fork into a new
Mission linked to the old — similar, but splits the outcome record across two Missions.

**Decision.** Option 3. Replanning opens version *n+1*; version *n* is marked superseded with its rationale.
Completed Tasks and collected evidence are preserved as inputs to the new plan. Bounded by `replan_max`
(default 2); exhausting it concludes the Mission `partially_completed` rather than looping.

**Consequences.** *Accepted:* Missions accumulate versions, and every query must resolve one. *Accepted:*
`replan_max` will sometimes stop a Mission that a third attempt would have rescued — correct, because a
Mission that replans indefinitely never ends and never admits it. *Gained:* the full record of what the Firm
believed and when. *Gained:* no work is ever thrown away by replanning. *Gained:* replan count becomes a
plan-quality metric. *Reversal cost:* high once history exists.

---

### ADR-0030 — The Engagement remains the Orchestrator's execution unit

**Status:** Accepted · **Related:** v1 orchestrator, ADR-0010, v2 compatibility contract

**Context.** With Missions introduced, the Engagement could have been absorbed — a Mission spans work, an
Engagement spans work. Absorbing it would have been a breaking change to the Orchestrator, the event log,
every projection, and the fast lane.

**Options.** (1) Replace Engagements with Missions — conceptually tidy, breaks v1 compatibility, forces every
fast-lane Directive to create a Mission and destroys the 65% bypass target. (2) **Keep both with a clear
relationship.** (3) Make Engagement a synonym for a Mission's execution phase — a rename, and renames of
load-bearing concepts are pure cost.

**Decision.** Option 2. A Mission produces one or more Engagements. An Engagement may have zero or one
Mission. `mission_id` is nullable on `engagements` and a null is a fully supported permanent state, not a
migration artifact.

**Consequences.** *Accepted:* two overlapping concepts to explain, and "which one am I looking at" is a real
question for a newcomer. *Accepted:* some cost and progress queries must join across both. *Gained:* the
fast lane survives untouched, which is what protects Principle 1 at scale. *Gained:* the v2 compatibility
contract holds — no event kind removed, no column redefined, a v1 Engagement replays unchanged. *Gained:*
the Orchestrator needs no knowledge of Missions to execute a Dispatch. *Reversal cost:* low.

---

## Appendix A — Glossary additions

Additive to `/docs/00-vision/03-glossary.md` and `/docs-v2/00-overview/02-v2-principles.md` §4. No existing
term changes meaning.

| Term | Definition |
|---|---|
| **Mission** | A durable intention with a plan attached: Objectives, Tasks, a dependency graph, policies, and a verification specification. |
| **Charter** | The Mission's constraint envelope. v1's Mandate, preserved and extended. |
| **Objective** | An outcome that can be verified. Falsifiable, weighted, owned by a department. |
| **Task** | The unit of delegatable work and the planning floor. Becomes a Work Order at dispatch. |
| **Subtask** | A department's internal decomposition of a Task. Telemetry, never instruction. |
| **Plan Version** | An immutable snapshot of Objectives, Tasks, and graph. Superseded, never edited. |
| **Dispatch** | The envelope the Mission Engine emits to the Orchestrator. A Work Order plus five fields. |
| **Outcome** | The envelope the Orchestrator returns. The only write from execution into planning. |
| **Verification** | Mechanical evaluation of evidence against an Objective's criteria. Distinct from review. |
| **Evidence** | An immutable, hash-referenced artifact or record supporting a verification method. |
| **Failure Class** | One of eight categories determining retry eligibility and response. |
| **Risk Band** | Low / Moderate / High / Severe. Determines verification depth, checkpointing, retry, review, and autonomy. |
| **Priority Tier** | P0–P3. Declared by a human or Kai; ordering within a tier is computed. |
| **Ready Set** | Tasks whose incoming dependency edges are all satisfied. |
| **Blocking Factor** | The count of Tasks a given Task transitively unblocks. |
| **Slack** | Latest start minus earliest start. Drives deadline pressure. |
| **Outcome Record** | The post-conclusion comparison of plan against reality, written to procedural memory. |
| **Divergence** | Executed progress substantially exceeding verified progress. The busy-but-ineffective detector. |

## Appendix B — Repository placement

```
services/
└── mission/                    NEW — crate sidra-mission
    ├── planner
    ├── graph
    ├── risk
    ├── verifier
    ├── scheduler
    ├── recovery
    └── repository

agents/
└── missions/                   NEW — mission templates and objective patterns (data only)

infrastructure/testing/
├── mission/                    NEW — graph property tests, scheduler determinism, failure taxonomy
└── chaos/                      EXTENDED — kill at every Mission state transition
```

Dependency direction (ADR-0011) is preserved: `packages/domain ← services/mission ← apps/*`.
`services/mission` depends on `services/store`, `services/memory`, and `services/security`. It does **not**
depend on `services/orchestrator` — the two communicate through domain types, and the absence of that edge is
what makes G3 a compile-time property rather than a promise.

## Appendix C — Implementation position

The Mission Engine is **M15**, after the v2 enterprise milestones M11–M14.

It depends on: the event log (M2), the Permission Broker (M3), memory (M5), the Orchestrator (M6), the
Workflow Engine (M7), and the department substrate (M11–M13). Building it earlier would mean building a
planner for an organisation that does not yet exist.

**Exit criterion.** A Mission spanning three departments, twelve Tasks, and two days runs to conclusion with:
every Objective verified by evidence, one Principal approval total, one Brief, zero self-reported progress
figures presented as fact, at least one deliberate failure classified and handled correctly, one successful
replan, and a `kill -9` at every state transition recovered with no duplicated effect.
