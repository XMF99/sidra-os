# Mission Center Specification

The Mission Center (`#/missions`) is where missions are **created, observed,
steered, approved, delegated, replayed, and completed**. It is the UI over the
**existing Mission Engine** (`services/mission`, ADR-0032, M15). The UI computes
**no** lifecycle transitions and **no** progress — it renders the engine's state
and dispatches broker-gated commands. Replay is the engine's replay, rendered
(ADR-0086).

---

## 1. Surfaces

| Surface | Route | Purpose |
|---|---|---|
| Mission list | `#/missions` | Browse/filter all missions |
| Mission detail | `#/missions/:id` | Single mission, tabbed |
| — Overview tab | `?tab=overview` | Summary, participants, current state, actions |
| — Timeline tab | `?tab=timeline` | Event timeline of the mission |
| — Progress tab | `?tab=progress` | Task/subtask progress & assignments |
| — Replay tab | `?tab=replay` | Read-only replay player |
| — Approvals tab | `?tab=approvals` | Approval/delegation history & pending gates |
| Create wizard | `#/missions/new` (overlay) | Guided mission creation |

---

## 2. Mission creation

- **Entry.** "New Mission" (top-bar quick action, Dashboard Quick Actions,
  command palette, `n` shortcut). Opens the **create wizard** overlay
  (deep-linkable `#/missions/new`).
- **Wizard steps.** (1) *Intent* — title + directive/objective; (2) *Scope* —
  owning department/division, target project (optional); (3) *Plan preview* — the
  engine's proposed decomposition (read-only preview from a dry-run/plan query if
  available; otherwise "plan will be generated on start"); (4) *Review & submit*.
- **Submit.** Dispatches `mission.create` (broker-gated). On allow, the engine
  appends the mission-created event; the wizard closes and routes to
  `#/missions/:id`. The new mission appears in the list within one tail cycle.
- **Permissions.** `mission.create`; if denied, the submit control is
  shown-disabled with the reason, or the denial dialog explains it (ADR-0085).
- **The UI never fabricates a plan.** Decomposition is the engine's; the wizard
  previews or defers to it.

---

## 3. Mission lifecycle (rendered, not computed)

The UI displays the engine's lifecycle states and renders **only the transitions
the engine exposes as commands**. Indicative state set (Epic 0 reconciles to the
engine's actual states):

```
 Draft ─create─▶ AwaitingApproval ─approve─▶ Running ─▶ Completed
   │                    │                       │           ▲
   │                    └───deny───▶ Rejected   ├─block─▶ Blocked ─resolve─┘
   └───────────────────────────────────────────┴─fail──▶ Failed ─retry─▶ Running
                                                 └─cancel─▶ Cancelled
```

- Each transition shown corresponds to a command: `mission.approve`,
  `mission.cancel`, `mission.retry`, `mission.delegate`. **Blocked/resolve** and
  **fail** are engine-driven; the UI reflects them from the timeline and offers
  `retry` where the engine allows.
- The state chip, allowed actions, and progress all derive from
  `missions.get`/`missions.progress`; the UI shows a control only when the engine
  reports that transition is currently valid **and** the broker would allow it.

---

## 4. Mission visualization

- **Overview** renders: state chip, owning department/division, participating
  agents (with live status), objective, current blocking item (if any), key
  metrics (elapsed, tasks done/total, spend), and the permission-aware action row
  (Approve / Delegate / Cancel / Retry).
- **Graph view (optional in Overview):** a read-only node graph of tasks →
  subtasks → assigned agents, laid out from `missions.progress`. Purely a
  rendering of engine data; nodes deep-link to agents/events.
- All visual state is theme-tokened and reduced-motion-aware.

---

## 5. Mission timeline

- **Source.** `missions.timeline` — the ordered events of this mission (a
  projection of the Event Log filtered to the mission's correlation).
- **Rendering.** A vertical, grouped, filterable timeline: each entry shows kind,
  actor/agent, timestamp, and a humanized description; entries deep-link to the
  full event in the Event Log (`#/events?correlation=…`).
- **Live.** New mission events prepend via the tail.
- **Read-only** (ADR-0086): the timeline never edits or reorders; it is a view.

---

## 6. Mission progress

- **Source.** `missions.progress` — tasks/subtasks with status, assignee,
  evidence/outputs, and completion.
- **Rendering.** A task tree or kanban-by-status; each task shows assigned agent,
  state, and links to produced artifacts/documents (Knowledge) and evidence.
- **No client computation** of "percent done" beyond arithmetic over the engine's
  task states; the engine's own progress figure is preferred when present.

---

## 7. Mission replay

- **Source.** `missions.replay` — the timeline produced by the existing replay
  driver (`services/departments/src/replay/*`).
- **Rendering.** A **player**: play/pause/step/scrub over the driver-produced
  sequence, showing state at each step **as the driver reports it**. The UI does
  **not** fold events into state itself (ADR-0086); it advances a cursor over the
  driver's output.
- **Integrity.** A badge shows that replay is derived from the hash-chained log;
  if the host reports a chain issue, replay surfaces it rather than hiding it.
- **Degraded.** If `missions.replay` is not available in this build, the Replay
  tab shows a degraded state and a backend follow-up is filed (`20`) — the UI
  never rolls its own replay.

---

## 8. Mission approval

- **Where.** Overview action row, Approvals tab, Dashboard Notifications, and the
  Notification Center — all dispatch the same `mission.approve` (or deny) command.
- **Separation of duties (hard rule).** The **author of a mission cannot approve
  their own work** (ADR-0008/0018/0060). The UI renders the Approve control
  **shown-disabled with the reason** "You created this mission; approval requires
  a different approver" when the actor is the author. Enforcement is still
  server-side; the UI merely predicts and explains.
- **Approval as a Decision.** Approvals reference the platform's decision/seat
  model; the UI passes `decisionId`/seat context the host requires. The approval
  and its outcome become events shown in the Approvals tab and timeline.
- **Permission states** per ADR-0085: enabled (eligible approver), disabled+reason
  (author / lacks seat / SoD), hidden (irrelevant), explain-on-attempt.

---

## 9. Mission delegation

- **Purpose.** Hand a mission (or an approval authority) to another seat within
  SoD rules.
- **Action.** `mission.delegate` (broker + `services/delegation`-gated). The UI
  collects target seat and scope; the delegation service enforces SoD
  (self-approval refusal, ADR-0060) server-side.
- **UI behavior.** Shows current delegations and pending delegation requests in
  the Approvals tab; a delegation request denied for SoD renders explainably.
- **The UI never grants authority itself** — it requests; delegation service +
  broker decide.

---

## 10. Mission completion

- **Trigger.** Completion is **engine-driven** (all tasks satisfied + evidence
  verified). The UI reflects the Completed state; it does not "mark complete" as
  a user action in Sprint 1 (no client-side completion).
- **Completion view.** Overview shows outcome summary, produced artifacts/
  documents (links to Knowledge), evidence, final metrics (duration, spend), and
  a link to full Replay.
- **Post-completion.** Completed missions are read-only except for allowed
  follow-ups (e.g. start a related mission); their record and replay remain
  available.
- **Outcome → calibration.** Completion outcomes feed the existing outcome
  calibration service locally (ADR-0009); the UI surfaces that a mission
  contributed to calibration but performs no calibration itself.

---

## 11. Filtering, list & bulk

- **List** (`#/missions`) supports filters: state (running/awaiting/blocked/
  completed/failed), department/division, project, owner, date range, and text.
  Filters are URL params (deep-linkable). Sort by recency/priority/state.
- **Bulk** actions in Sprint 1 are limited to non-mutating (multi-select →
  export view) or clearly broker-gated per-item confirmations; no silent bulk
  mutation.
- **Saved views** are a preference-level convenience (stretch).

---

## 12. Acceptance criteria (Mission Center)

1. A mission created via the wizard dispatches `mission.create`, appears in the
   list within one tail cycle, and routes to its detail.
2. The lifecycle state and allowed actions shown are exactly the engine's; the UI
   offers no transition the engine doesn't currently permit.
3. The **author cannot approve their own mission**: the Approve control is
   shown-disabled with the SoD reason, and a server attempt would be denied.
4. Timeline and Replay are strictly read-only and derived from the log / replay
   driver; the UI never folds events or edits history.
5. Replay plays the driver-produced sequence with play/pause/step/scrub and
   surfaces any chain-integrity issue.
6. Delegation and approval dispatch broker/delegation-gated commands and reflect
   denials explainably (never silently succeed).
7. Completion is engine-driven; the UI reflects it and links to outcomes,
   artifacts, and replay.
8. Every mission surface renders the five-state contract and degrades gracefully
   where a read model is missing.
