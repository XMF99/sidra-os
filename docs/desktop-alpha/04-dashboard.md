# Dashboard Specification

The Dashboard (`#/`) is the landing surface and the Firm's operating picture. It
is a **composition of read-only widgets**; it owns no state, computes no truth,
and drills every element into its owning page. It renders the thirteen modules
below. Each module: **what it shows · data source · interactions · states.**

Layout: a responsive 12-column grid. Priority order top-to-bottom is
**needs-action first** (approvals surface within Notifications and Mission
Overview), then live status, then trailing history. Grid collapses per `02 §11`.

```
┌────────────── System Health ─────────────┬──── Daily Summary ────┐
├── Running Missions ──┬── Running Agents ──┼──── Notifications ────┤
├───── Mission Overview ─────┬── Performance┤   (needs action)      │
├──── Recent Activity ───────┴──────────────┼──── Quick Actions ────┤
├──── Pinned Projects ──┬─ Recent Documents ┼──── Memory Overview ──┤
└───────────────────────┴───────────────────┴───────────────────────┘
```

---

## 1. System Health
- **Shows.** Overall health (green/amber/red), Vault status (open/persistent),
  event-tail state, sync state, storage headroom, last chain-verification result.
- **Data.** `system.health`, `events.verifyChain` (verdict only), `system.info`.
- **Interactions.** Click a sub-indicator → the relevant surface (tail → Event
  Log; sync → Departments/relevant; chain → Event Log integrity).
- **States.** Loading skeleton; degraded if a health field is unavailable; error
  card if `system.health` fails (this is the one widget whose red state is
  itself the signal).

## 2. Running Missions
- **Shows.** Count + compact list of in-progress missions with status chip,
  owning department, progress bar, and elapsed time.
- **Data.** `missions.list` filtered to running; `missions.progress` per item.
- **Interactions.** Item → `#/missions/:id`; header count → `#/missions?filter=running`.
- **States.** Empty = "No missions running" + (permitted) "New Mission" CTA.

## 3. Running Agents
- **Shows.** Count + list of active agents with role, department, and the mission
  they're on.
- **Data.** `agents.list` filtered to active; joined to `missions.get` for
  current work (host-side join in the read model).
- **Interactions.** Item → `#/agents/:id`; count → `#/agents?filter=active`.
- **States.** Empty = "No agents active right now."

## 4. Recent Activity
- **Shows.** A reverse-chronological feed of recent significant events (mission
  state changes, approvals, guard blocks, connector egress, structure proposals),
  humanized.
- **Data.** `events.query` (recent, significant kinds) + live `events.tail` to
  prepend.
- **Interactions.** Item → deep link to its entity and to Event Log with the
  correlation preselected.
- **States.** Live-updating; skeleton on first load; empty on a brand-new Firm.

## 5. Performance
- **Shows.** Compact trend tiles: missions completed (period), median mission
  latency, agent utilization, spend vs budget (from model accounting).
- **Data.** `analytics.performance`.
- **Interactions.** Any tile → `#/analytics` scoped to that metric.
- **States.** Degraded per-tile if a metric isn't available in this build.

## 6. Quick Actions
- **Shows.** Permission-aware primary actions: New Mission, Search Knowledge,
  Request Connector Grant, Open Command Palette, plus contextual suggestions
  (e.g. "Resume last mission").
- **Data.** `permissions.forActor` to decide which actions render (ADR-0085).
- **Interactions.** Each dispatches its command / opens its flow; disallowed
  actions are hidden or shown-disabled with a reason.
- **States.** Always present; at minimum shows navigation actions.

## 7. Pinned Projects
- **Shows.** The user's pinned projects with mission/document counts and last
  activity.
- **Data.** `projects.list` filtered to pinned (preference-driven).
- **Interactions.** Item → `#/projects/:id`; "manage pins" → `#/projects`.
- **States.** Empty = "Pin a project to keep it here" + link to Projects.

## 8. Notifications (needs-action)
- **Shows.** The top unresolved items that need the actor: approvals requested,
  delegations, guard blocks, expiring grants, structure proposals awaiting
  Principal.
- **Data.** `notifications.list` (needs-action group), `notifications.unreadCount`.
- **Interactions.** Inline **act** (approve/deny where permitted, broker-gated
  via `notifications.act`), open (deep link), mark read. "See all" → Notification
  Center.
- **States.** Empty = "You're all caught up." Highest visual priority on the page.

## 9. Recent Documents
- **Shows.** Recently produced/ingested documents with source and producing
  mission/agent.
- **Data.** `memory.recentDocuments`.
- **Interactions.** Item → `#/knowledge/:docId`; source chip → its connector/mission.
- **States.** Empty on a new Firm; degraded if memory browse is limited.

## 10. Memory Overview
- **Shows.** Knowledge footprint: document/chunk counts, sources breakdown, last
  ingest, and a search entry that hands off to Knowledge.
- **Data.** `memory.recentDocuments` summary + `analytics.performance` (memory
  facet) if available.
- **Interactions.** Search entry → `#/knowledge?q=…`; source → filtered Knowledge.
- **States.** Degraded if memory metrics aren't exposed; still offers search.

## 11. Mission Overview
- **Shows.** Portfolio view of missions by lifecycle state (draft, awaiting
  approval, running, blocked, completed, failed) as a status distribution, plus
  the count awaiting *this actor's* approval.
- **Data.** `analytics.missionStats`, `missions.list` (awaiting-approval for
  actor).
- **Interactions.** Any state segment → `#/missions?filter=<state>`; awaiting-
  approval → filtered list.
- **States.** Empty = first-run "Create your first mission."

## 12. Daily Summary
- **Shows.** A narrative, local, non-telemetry recap: what completed today, what
  needs attention, notable events, spend today. Generated by the analytics read
  model (host-side), rendered as prose.
- **Data.** `analytics.dailySummary`.
- **Interactions.** Inline links from summary phrases to their entities.
- **States.** Degraded to a metrics list if the narrative summary isn't available
  in this build. **No content leaves the device** (ADR-0009).

## 13. Notifications count / attention badge
- **Shows.** Aggregate unread + needs-action count reflected in the top-bar bell
  and the Dashboard Notifications header (single source: `notifications.unreadCount`).
- **Data.** `notifications.unreadCount` (live via tail).
- **Interactions.** → Notification Center.
- **States.** Zero-state hides the badge.

---

## Dashboard-wide rules

- **All modules are read-only** except the *actions embedded in* Quick Actions
  and the Notifications widget, which dispatch normal broker-gated commands.
- **Independent resolution.** Each module has its own query + suspense/error
  boundary; one slow or failing module never blocks the others (`02 §12.1`).
- **Live by tail.** Modules subscribe to relevant `affects` tags so the Dashboard
  updates without polling.
- **Personalization is preference-level** (which optional modules show, their
  order/density) — persisted as non-authoritative preferences; the default layout
  above ships in Sprint 1, with reordering as a stretch item.
- **Acceptance (page-level).** The Dashboard reaches interactive within the perf
  budget with chrome first and modules filling in; every drill-down lands on the
  correct filtered page; approvals appear within one tail cycle; no module
  computes authoritative state; no telemetry call is made.
