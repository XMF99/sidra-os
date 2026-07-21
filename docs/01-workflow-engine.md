# Workflow Engine

Durable execution of multi-agent plans. The workflow engine is what makes an Engagement survive a crash, a
network outage, and a two-day gap.

## 1. Model

A **Workflow** is a directed acyclic graph of **Steps**, compiled from a Mandate (or instantiated from a
Playbook) and then frozen. Freezing matters: the graph cannot be rewritten mid-run by a model. Changing the
plan means *re-planning*, which produces a new workflow version with an explicit link and a note in the
Brief that the plan changed.

```
Step kinds:
  work_order   dispatch a Work Order to an agent
  meeting      convene a Meeting
  gate         evaluate a deterministic predicate (budget, criterion, approval)
  fanout       expand a collection into N parallel steps
  join         wait for dependencies; reduce their outputs
  compensate   undo a prior step's effects on failure
  checkpoint   persist a resumable milestone in long-running programs
```

## 2. Compilation

```
Mandate → StagingPlan → validate → Workflow(frozen) → persisted with a definition digest
```

Validation is deterministic and runs before any spend:

| Check | Failure mode prevented |
|---|---|
| Acyclic | Deadlock |
| Every step reachable from a root | Orphaned work |
| Every acceptance criterion covered by at least one step | Silent incompleteness |
| Every work_order has a reviewer ≠ assignee | Self-approval |
| Sum of step budgets ≤ engagement budget | Budget overrun |
| All grants ⊆ agent standing fences | Privilege escalation |
| No step depends on a step it also feeds | Circular dependency |

A validation failure returns to Kai for re-planning; it never runs a partially valid graph.

## 3. Execution

The scheduler (system design §4) dispatches ready steps. Each step transitions:

```
pending → ready → running → (succeeded | failed | fenced | cancelled)
                     │
                     └─ retrying (backoff) ──► running
```

**Dependency kinds.** `finish_to_start` is the default. `section_ready` allows a downstream step to begin
when a named section of an upstream deliverable commits — this is what lets Vega start on technical
feasibility while Iris is still writing requirements, and it is a meaningful latency win on `deep` work.

**Parallelism** is the default; serialization must be justified in the Mandate.

**Fanout** expands at runtime over a collection produced by a prior step (e.g. "one review per document"),
bounded by a declared maximum so a model cannot produce a thousand children.

## 4. Durability

Every state transition is a committed transaction plus an event. The invariant from
[../02-architecture/02-system-design.md](../02-architecture/02-system-design.md) §6 holds: `kill -9` loses at
most one in-flight model call.

Resume algorithm:

```
for each workflow in non-terminal state:
    for each step in {running}:
        if turn committed  → mark succeeded, continue graph
        else if attempt < 3 → reset to ready, attempt += 1
        else                → escalate
    for each effectful tool call with intent but no result:
        if idempotent → re-run
        else          → ApprovalRequest("this may have already happened")
    recompute ready set, resume dispatch
```

## 5. Retry, timeout, and compensation

| Concern | Policy |
|---|---|
| Retry | Max 3 attempts; exponential backoff 2 s / 8 s / 30 s with ±20% jitter; only for transient classes (timeout, 429, 5xx, schema violation) |
| Non-retryable | Fence hits, budget exhaustion, refusal, invalid inputs — these escalate immediately |
| Step timeout | Default 3 min for a work_order Turn, 10 min for a meeting; configurable per template |
| Workflow timeout | The Mandate deadline. On expiry: stop dispatching, collect what exists, and produce a Brief marked partial with what is missing |
| Compensation | Only effect-class ≥2 steps register compensations. `vault.write` compensates by reverting to the prior version. Class-3 steps have no automatic compensation by definition — which is precisely why they require approval first |

Compensation runs in reverse topological order and is itself durable and resumable.

## 6. Gates

Gates are deterministic predicates that keep judgement out of control flow:

```yaml
- kind: gate
  key: budget_check
  predicate: "engagement.spent_cents < engagement.budget_cents * 0.8"
  on_false: escalate_for_budget
- kind: gate
  key: quality_gate
  predicate: "review.verdict != 'block'"
  on_false: rework
- kind: gate
  key: approval_gate
  predicate: "approval('publish').granted"
  on_false: halt
```

No model evaluates a gate. This is Principle 8 in its most concrete form.

## 7. Long-running programs

`complexity = program` Engagements span days. They use `checkpoint` steps: a durable milestone with a
summary, a Brief, and an explicit continuation condition (a date, an approval, or an external event). Between
checkpoints the workflow is dormant — it holds no resources and costs nothing. The Lobby shows dormant
programs with their next wake condition, so nothing goes quietly cold.

## 8. Observability

Every workflow exposes: the graph with live step states, per-step elapsed and cost, the critical path, the
current bottleneck, and projected completion. The UI renders this as the **Progress Spine** (see
[../05-experience/03-component-library.md](../05-experience/03-component-library.md)). Requirement UI-06 —
never a bare spinner — is satisfied by this data existing at all times.

## 9. Templates

Workflow templates are YAML, versioned, and shipped in `config/workflows/`. Playbooks are templates learned
from experience. Both are data, so a new procedure needs no code.

```yaml
name: research_and_recommend
version: 3
inputs: [question, depth]
steps:
  - {key: frame,    kind: work_order, agent: agent.pm,      acceptance: [criteria_defined]}
  - {key: gather,   kind: fanout,     over: "frame.subquestions", max: 5,
     template: {kind: work_order, agent: agent.eng, budget_cents: 20}}
  - {key: costs,    kind: work_order, agent: agent.finance, depends_on: [frame]}
  - {key: forum,    kind: meeting,    meeting_kind: decision_forum,
     depends_on: [gather, costs], attendees: [agent.pm, agent.eng, agent.finance, agent.qa]}
  - {key: verify,   kind: work_order, agent: agent.qa,      depends_on: [forum]}
  - {key: gate,     kind: gate,       predicate: "verify.verdict != 'block'", on_false: rework}
```
