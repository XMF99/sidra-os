# System Design

How the kernel actually runs. This document specifies state machines, the event bus, scheduling, and the
durability contract.

## 1. Kernel responsibilities

The kernel is the only component permitted to mutate state. It exposes three surfaces:

- **Commands** — intent that mutates. Always: validate → authorize → persist → emit.
- **Queries** — read-only, cacheable, never trigger work.
- **Events** — facts that already happened, pushed to subscribers.

Everything else — agents, engines, plugins — is a *service* invoked by the kernel or a *subscriber* of its
events. No service writes to the database directly except through `sidra-store` repositories inside a
kernel-owned transaction.

## 2. Event bus

An in-process broadcast bus with a durable tail.

| Property | Design |
|---|---|
| Ordering | Global monotonic `seq` assigned inside the write transaction. Total order, no ambiguity |
| Durability | Every event is a row in `events` before it is broadcast. The bus replays from `seq` on reconnect |
| Delivery | At-least-once to in-process subscribers; renderer subscribes with a `since_seq` cursor so a webview reload loses nothing |
| Backpressure | Slow subscribers get a bounded channel; on overflow they are dropped and told to re-sync from `seq`, never blocking the writer |
| Schema | `{seq, ts, engagement_id?, actor, kind, subject_type, subject_id, payload, prev_hash, hash}` |

Event kinds are namespaced and closed (an enum, not free strings): `engagement.*`, `mandate.*`,
`work_order.*`, `turn.*`, `tool.*`, `review.*`, `decision.*`, `meeting.*`, `memory.*`, `budget.*`,
`approval.*`, `notification.*`, `system.*`.

**The event log is the source of truth for history.** All other tables are projections that could, in
principle, be rebuilt from it. This is what makes the Archive trustworthy and the audit chain meaningful.

## 3. State machines

### 3.1 Engagement

```
draft ──authorize──► planning ──plan_ok──► executing ──all_done──► synthesizing ──► delivered
  │                     │                      │                        │
  │                     │                      ├─blocked──► awaiting_approval ──┐
  │                     │                      │                                │
  │                     └─insufficient_info──► clarifying ◄────────────────────┘
  │                                                │
  └──────────────abandon────────────────────────► abandoned    (terminal)
                                                   │
executing/synthesizing ──fatal──► failed (terminal, with reason + partials retained)
```

Invariants:
- Only `draft` and `clarifying` accept edits to the Mandate.
- `delivered` requires exactly one `brief` row.
- `failed` and `abandoned` retain all partial Deliverables; nothing is deleted on failure.

### 3.2 Work Order

```
queued ──dispatch──► running ──output──► in_review ──pass──► accepted
   │                    │                    │
   │                    │                    ├─pass_with_notes──► accepted (notes attached)
   │                    │                    └─block──► rework (max 2) ──► running
   │                    │                                    │
   │                    ├─fence_hit──► awaiting_approval ─────┘
   │                    ├─timeout/error──► retrying (max 3, backoff) ──exhausted──► escalated
   │                    └─out_of_scope──► escalated
   └─cancel──► cancelled
```

`escalated` orders go to the assignee's department head, then to the Executive, then to the Principal.
Escalation never silently drops.

### 3.3 Turn

`prepared → context_assembled → model_calling → tool_calling* → validating → committed | failed`

A Turn is the unit of cost, tracing, and idempotency. Each Turn has a deterministic `idempotency_key` =
hash(work_order_id, attempt, context_frame_digest). Re-running a Turn with the same key returns the stored
result instead of re-spending.

## 4. Scheduler

A single-threaded scheduler loop over ready steps.

```
loop:
  ready = steps where status=queued AND all dependencies satisfied
  ready = filter(ready, budget_allows AND capabilities_grantable AND agent_not_saturated)
  ready = sort(ready, by (priority DESC, deadline ASC, cost_estimate ASC))
  while permit = turn_pool.try_acquire():
      dispatch(next(ready))
  await any(step_completion, new_step, timer, cancel)
```

Rules:
- **Priority** comes from the Mandate (`urgent | normal | background`). Principal-initiated work always
  outranks automation.
- **Agent saturation**: an agent runs at most 2 concurrent Turns, so its Working Memory stays coherent.
- **Fairness**: background automation is capped at 25% of the pool when interactive work is queued.
- **Deadlock detection**: a dependency cycle at compile time is a workflow validation error; at runtime, a
  step blocked >T with no running dependency raises `workflow.stalled` and escalates.

## 5. Concurrency and consistency

- **Writes** are serialized through a single writer connection with `WAL` and `busy_timeout=5000`. Reads use
  a pool of read-only connections. SQLite gives us snapshot reads during writes.
- **Transaction boundary** = one kernel command. A command either fully applies (state + events) or not at
  all. Model calls happen *outside* transactions; their results are applied in a short commit.
- **Optimistic concurrency** on user-editable rows via a `version` column; a stale write returns
  `ConflictError` with both versions, and the UI offers a merge, never a silent overwrite.
- **Idempotency**: all externally-visible side effects (model spend, file write, tool call) carry an
  idempotency key persisted before the effect and checked after restart.

## 6. Durability and crash recovery

The recovery contract: **a `kill -9` at any instant loses at most one in-flight model call, never committed
state.**

On startup:
1. `integrity_check`; if it fails, refuse to open and offer the last snapshot.
2. Replay: find Engagements in non-terminal states.
3. For each, reconcile step statuses: any step in `running` whose Turn has no committed result is reset to
   `queued` with `attempt+1`, unless `attempt >= 3` in which case it is `escalated`.
4. Any tool call with a persisted intent but no result is re-checked for idempotency: side-effect-free tools
   re-run; effectful tools become an Approval Request ("this may have already happened").
5. Emit `system.recovered` with a summary; the Lobby shows what was resumed. Recovery is visible, not silent.

Backups: a snapshot of the DB file is taken before every migration and daily by the Night Shift, retained
7 daily / 4 weekly, stored in `vault/.snapshots`, and verified by opening and running `integrity_check`.

## 7. Context assembly pipeline

Called before every model call. Deterministic, budgeted, and traceable.

```
ContextFrame::build(agent, work_order, budget_tokens) →
  1. Identity block      — charter, personality, refusals, decision boundaries   (fixed, cached)
  2. Situation block     — Mandate, this Work Order, acceptance criteria, deadline
  3. Canon block         — firm facts filtered by relevance to the objective
  4. Retrieved block     — hybrid search over Semantic memory, top-k with citations
  5. Episodic block      — last N relevant events in this Engagement, summarized if long
  6. Procedural block    — matching Playbook, if any
  7. Tool block          — only tools this agent is granted for this Work Order
  8. Output contract     — JSON Schema the response must satisfy
```

Budget allocation is proportional and enforced: identity 8%, situation 12%, canon 10%, retrieved 40%,
episodic 20%, procedural 10%, with unused shares redistributed. Every included item carries a source id, so
the Inspector can show exactly what the agent saw. Frames are hashed; identical frames hit the Turn cache.

## 8. Extension points

| Point | Contract | Consumed by |
|---|---|---|
| `Tool` | name, JSON Schema in/out, required capabilities, effect class | Plugins, built-ins |
| `Ingestor` | mime types → extracted document | Plugins |
| `Retriever` | query → scored chunks | Alternate memory strategies |
| `ModelProvider` | class → completion/stream/embed | New vendors, local models |
| `WorkflowTemplate` | named DAG with typed inputs | Playbooks, plugins |
| `Panel` | renderer surface with a scoped query API | Plugins |
| `NotificationChannel` | delivery of an alert | OS notifications, future channels |

All extension points are versioned interfaces. Breaking one requires a major version and an ADR.

## 9. What is deliberately *not* in the design

- **No microservices.** One process. Distribution is a 3.0 concern and the crate boundaries already draw the
  seams (kernel ↔ services).
- **No message broker.** The in-process bus with a durable tail is sufficient for one machine, and its
  semantics are stronger (total order) than most brokers give.
- **No ORM.** Hand-written SQL in repositories. The schema is small, the queries are hot, and generated SQL
  hides cost.
- **No LLM in the control plane.** Routing, retries, permissions, and scheduling are deterministic code
  (Principle 8). Models fill nodes; they never choose the graph.
