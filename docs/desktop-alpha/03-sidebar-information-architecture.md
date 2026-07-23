# Sidebar Information Architecture — The 11 Pages

Each page below is specified with the required seven facets: **Purpose,
Responsibilities, Navigation behavior, Required services, Permissions, Data
sources, Acceptance criteria.** "Required services" names existing `services/*`
crates reached *only* through IPC (`01 §6`); "Data sources" names the query DTOs;
"Permissions" names the capability the broker checks (names indicative — Epic 0
reconciles to real capability strings).

Route column uses the hash router (ADR-0082).

| Order | Page | Route | Group |
|---|---|---|---|
| 1 | Dashboard | `#/` | Overview |
| 2 | Mission Center | `#/missions` | Work |
| 3 | Organization | `#/org` | Organization |
| 4 | Departments | `#/departments` | Organization |
| 5 | Agents | `#/agents` | Organization |
| 6 | Projects | `#/projects` | Work |
| 7 | Knowledge | `#/knowledge` | Knowledge |
| 8 | Connectors | `#/connectors` | Knowledge |
| 9 | Analytics | `#/analytics` | Insight |
| 10 | Event Log | `#/events` | Insight |
| 11 | Settings | `#/settings` | System |

---

## 1. Dashboard — `#/`

- **Purpose.** The at-a-glance operating picture of the Firm: health, what's
  running, what needs attention, what happened. Full spec in `04-dashboard.md`.
- **Responsibilities.** Compose read-only widgets; route the user to the right
  page on any drill-down; surface items needing action (approvals) prominently;
  host quick actions.
- **Navigation behavior.** Landing route on open (Opening Sidra flow). Every
  widget deep-links into its owning page (e.g. Running Missions → `#/missions`).
  Back returns to Dashboard.
- **Required services.** `store` (health/events), `mission`, `agents`,
  `orchestrator`, `memory`, `departments`, `security` (permission annotations).
- **Permissions.** `dashboard.view` (default for any authenticated seat); each
  widget additionally scoped to what the seat may see; unauthorized widgets are
  hidden.
- **Data sources.** `system.health`, `missions.list`, `agents.list`,
  `events.query` (recent), `analytics.performance`, `analytics.dailySummary`,
  `projects.list` (pinned), `notifications.list`, `memory.recentDocuments`,
  `analytics.missionStats`.
- **Acceptance criteria.** (a) Loads to interactive < the perf budget
  (`19-risk-analysis.md`), each widget resolving independently; (b) every widget
  drill-down lands on the correct filtered page; (c) approvals appear here within
  one event-tail cycle of being requested; (d) all thirteen modules render their
  five-state contract.

---

## 2. Mission Center — `#/missions`

- **Purpose.** Create, observe, steer, approve, delegate, and replay missions.
  Full spec in `05-mission-center.md`.
- **Responsibilities.** List/filter missions; open a mission's detail
  (overview/timeline/progress/replay/approvals); host mission creation; surface
  approval and delegation actions (broker-gated).
- **Navigation behavior.** `#/missions` (list) → `#/missions/:id` (detail) with
  tabs `?tab=overview|timeline|progress|replay|approvals`. Deep-linkable from
  notifications, search, dashboard, and status bar. Back returns list→detail
  stack correctly.
- **Required services.** `mission` (engine), `orchestrator`, `departments`
  (assignment/exchange), `delegation` (delegation), `security` (approvals gate),
  `store` (timeline/replay via departments replay driver).
- **Permissions.** `mission.view`; `mission.create`; `mission.approve` (seat +
  SoD: author cannot approve own — ADR-0008/0018/0060); `mission.delegate`;
  `mission.cancel`. Actions render per ADR-0085.
- **Data sources.** `missions.list`, `missions.get`, `missions.timeline`,
  `missions.progress`, `missions.replay`; commands `mission.create/approve/
  delegate/cancel/retry`.
- **Acceptance criteria.** (a) A mission can be created through the wizard and
  appears in the list within one tail cycle; (b) lifecycle state shown is exactly
  the engine's state (no client-computed transitions); (c) the "approve"
  affordance is disabled with a reason when the actor is the author (SoD);
  (d) replay plays the driver-produced timeline read-only; (e) delegation
  requests dispatch broker-gated commands and reflect denial explainably.

---

## 3. Organization — `#/org`

- **Purpose.** Visualize and steward the Firm's structure: Divisions (8),
  Offices (4), executives, firm-wide vetoes, and pending **structure proposals**.
- **Responsibilities.** Render the org chart / rail; show veto scope; list
  structure proposals and their status; allow *proposing* a change (propose-only,
  never enacting) where permitted.
- **Navigation behavior.** `#/org` (chart) → `#/org/divisions/:id`,
  `#/org/offices/:id`, `#/org/proposals/:id`. Cross-links to Departments and
  Agents that belong to a division.
- **Required services.** `departments` (structure), `self-review`/`evolution`
  (structure proposals — propose-never-enact), `security` (veto enforcement is
  server-side), `store`.
- **Permissions.** `org.view`; `org.propose` (create a structure proposal).
  Enactment is **Principal-only via a Decision** and is *not* an in-UI action in
  Sprint 1 — the UI shows proposal status and, at most, surfaces the Principal's
  decision affordance if the actor is the Principal.
- **Data sources.** `org.structure`, `org.divisions`, `org.offices`,
  `org.vetoes`, `departments.list`; command `org.proposeStructureChange`.
- **Acceptance criteria.** (a) Shows exactly eight Divisions and four Offices
  from the read model; (b) a firm-wide veto is visibly indicated as a blocking
  guard and is never presented as user-downgradable; (c) proposals are clearly
  "proposed / awaiting Principal / enacted / rejected"; (d) no UI path enacts a
  structure change without a Principal Decision (author-never-enacts preserved).

---

## 4. Departments — `#/departments`

- **Purpose.** Browse installed departments (Packs), their Standards and Guards,
  and cross-department Exchange activity; install/uninstall Packs where permitted.
- **Responsibilities.** List departments with status; show a department's
  Standards, Guards, connectors, and agents; show Exchange requests
  in/out; drive Pack install/uninstall through existing paths.
- **Navigation behavior.** `#/departments` (grid) → `#/departments/:id` with
  tabs `?tab=overview|standards|guards|exchange|agents`. Cross-links to
  Connectors (grants) and Agents.
- **Required services.** `departments` (Registrar/Standards/Guards/Exchange),
  `orchestrator` (Exchange = Work Order, ADR-0011), `connectors`, `security`.
- **Permissions.** `departments.view`; `departments.install` /
  `departments.uninstall` (typically Principal/admin seat);
  `departments.requestExchange`. Guard blocks are server-enforced; UI shows the
  block reason.
- **Data sources.** `departments.list`, `departments.get`,
  `departments.standards`, `departments.guards`, `departments.exchange`; commands
  `departments.install/uninstall/requestExchange`.
- **Acceptance criteria.** (a) Installed departments render with real
  standards/guards from read models; (b) an Exchange request can be initiated and
  its deterministic resolution/refusal (ADR-0043) is shown; (c) uninstall is
  clearly guarded and the UI communicates "uninstall leaves the Firm working"
  (M14 exit intent) — it never implies data loss beyond the pack; (d) guard-
  blocked actions display the guard and reason.

---

## 5. Agents — `#/agents`

- **Purpose.** See the Firm's agents, their roles/departments, live status, and
  recent activity.
- **Responsibilities.** List agents grouped by department/division; show an
  agent's profile (role, tools/five-tool model, department, current
  assignment) and its activity feed; surface which mission an agent is working.
- **Navigation behavior.** `#/agents` (list) → `#/agents/:id`
  (`?tab=overview|activity|tools`). Cross-links to the mission an agent is on and
  the department it belongs to.
- **Required services.** `agents`, `orchestrator` (status/assignment), `mission`
  (current work), `security`.
- **Permissions.** `agents.view`. Sprint 1 is **read-only for agents** — the UI
  does not spawn/schedule agents (that is orchestration, not a user action);
  agent lifecycle is driven by the engine.
- **Data sources.** `agents.list`, `agents.get`, `agents.activity`.
- **Acceptance criteria.** (a) Agent status shown is the orchestrator's status,
  never fabricated; (b) an idle/offline agent is visibly distinguished from an
  active one; (c) activity items deep-link to their originating event/mission;
  (d) no UI affordance creates or destroys an agent in Sprint 1.

---

## 6. Projects — `#/projects`

- **Purpose.** The user's book of work: projects (bodies of related missions and
  documents), with pinning for quick access.
- **Responsibilities.** List projects; show a project's missions, documents,
  members/agents, and activity; pin/unpin (pinned surface on Dashboard and
  sidebar).
- **Navigation behavior.** `#/projects` (list) → `#/projects/:id`
  (`?tab=overview|missions|documents|activity`). Cross-links to Mission Center
  (filtered to the project) and Knowledge (project documents).
- **Required services.** `mission`, `memory` (documents), `departments`
  (ownership), `store`.
- **Permissions.** `projects.view`; `projects.pin` (preference-level, always
  allowed for own pins). Project membership scopes visibility server-side.
- **Data sources.** `projects.list`, `projects.get`; commands
  `projects.pin/unpin`.
- **Acceptance criteria.** (a) Projects list from the read model with real
  mission/document counts; (b) pin/unpin persists and reflects on Dashboard +
  sidebar within one interaction; (c) a project deep-links to its missions
  filtered in Mission Center; (d) empty state offers the permitted next action.

> **Epic 0 note.** "Projects" as a first-class read model may be **PARTIAL** in
> the current backend (missions/documents exist; a project aggregate may not).
> If MISSING, Projects ships as a **degraded** page that composes missions +
> documents by tag, and a backend follow-up ticket is filed (`20`). It never
> invents a projects table.

---

## 7. Knowledge — `#/knowledge`

- **Purpose.** Search and browse the Firm's memory/knowledge with provenance:
  documents, memory chunks, and their sources.
- **Responsibilities.** Provide hybrid search (the engine's retrieval) with
  result provenance; browse recent documents; open a document/memory item with
  its source and the events that produced it.
- **Navigation behavior.** `#/knowledge` (search + recent) →
  `#/knowledge/:docId`. Cross-links to the mission/agent/connector that produced
  an item and to the Event Log for its provenance events.
- **Required services.** `memory` (hybrid retrieval), `ingest` (sources),
  `connectors` (source connectors), `store` (provenance), `security`.
- **Permissions.** `knowledge.view`, `memory.search`. Visibility scoped by
  department/project server-side.
- **Data sources.** `memory.search`, `memory.get`, `memory.recentDocuments`.
- **Acceptance criteria.** (a) Search returns the engine's ranked results (the
  UI never re-ranks and presents it as the answer — ADR/architecture §5);
  (b) every result shows provenance (source + producing event) or an explicit
  "provenance unavailable"; (c) results respect the actor's visibility;
  (d) degrades gracefully if memory retrieval is limited in the current build.

---

## 8. Connectors — `#/connectors`

- **Purpose.** Manage external connectors: what's connected, what it's granted
  to, and its egress history — with credentials never exposed.
- **Responsibilities.** List connectors and status; show grants (which
  department/mission a connector serves), egress log (broker/custody records),
  and request/revoke grants where permitted.
- **Navigation behavior.** `#/connectors` (list) → `#/connectors/:id`
  (`?tab=overview|grants|egress`). Cross-links to the granted department and to
  the Event Log for egress events.
- **Required services.** `connectors` (manifest/grants/egress/custody),
  `security` (grant is broker-gated), `departments` (grant target), `store`.
- **Permissions.** `connectors.view`; `connectors.grant` / `connectors.revoke`
  (admin/Principal seat). Credential material is **never** sent to the renderer
  (ADR-0034); the UI shows scope, status, last-used only.
- **Data sources.** `connectors.list`, `connectors.get`, `connectors.grants`,
  `connectors.egressLog`; commands `connectors.requestGrant/revokeGrant`.
- **Acceptance criteria.** (a) No credential value appears in any connector view
  (verified by inspection); (b) a grant is scoped to exactly one department/target
  and isolation is visible; (c) egress entries are read-only projections of
  custody events; (d) grant/revoke dispatch broker-gated commands and reflect
  denial explainably.

---

## 9. Analytics — `#/analytics`

- **Purpose.** Performance and outcome insight: mission throughput/latency,
  agent utilization, cost/budget, calibration outcomes — local only.
- **Responsibilities.** Render charts and summaries from analytics read models;
  offer time-range and department/division filters; expose the Daily Summary in
  depth.
- **Navigation behavior.** `#/analytics` with `?range=…&scope=…`. Chart
  drill-downs deep-link to the underlying missions/agents/events.
- **Required services.** `store` (projections), `mission`, `agents`,
  `calibration` (outcome calibration — local, ADR-0009), `models` (cost
  accounting).
- **Permissions.** `analytics.view` (may be scoped to leadership seats;
  otherwise a personal/limited view). No data leaves the device (ADR-0009).
- **Data sources.** `analytics.performance`, `analytics.missionStats`,
  `analytics.dailySummary`.
- **Acceptance criteria.** (a) All series come from local projections; no network
  analytics call exists; (b) charts honor theme tokens and reduced-motion;
  (c) filters change the query, not client-side truth; (d) empty/degraded states
  when a metric isn't available in this build.

---

## 10. Event Log — `#/events`

- **Purpose.** The read-only window onto the source of truth: the append-only,
  hash-chained event stream, with integrity status.
- **Responsibilities.** Query/filter events (by kind, correlation, entity, time);
  follow a correlation chain; show chain-integrity verdict; export the current
  view. Strictly read-only (ADR-0086).
- **Navigation behavior.** `#/events` with `?kind=&correlation=&entity=&from=&to=`.
  Every other page's items deep-link here ("open in Event Log"). Selecting an
  event reveals its envelope and links to related entities.
- **Required services.** `store` (event log + `verify_chain`), `security`
  (visibility scoping).
- **Permissions.** `events.view` (scoped: an actor sees events they're permitted
  to see; the host filters). No edit/delete capability exists anywhere in the UI.
- **Data sources.** `events.query`, `events.get`, `events.verifyChain`; live
  `events.tail`.
- **Acceptance criteria.** (a) The log is read-only — no edit/delete/reorder
  affordance exists; (b) the integrity indicator reflects the host's
  `verify_chain` result, not a client computation; (c) correlation-follow shows
  a coherent chain; (d) new events appear live via the tail; (e) export produces
  the current filtered view only.

---

## 11. Settings — `#/settings`

- **Purpose.** Configure the shell (appearance, shortcuts, behavior), view seat/
  identity, and access diagnostics — all non-authoritative preferences plus
  read-only identity.
- **Responsibilities.** Appearance (theme/density/direction/contrast); keyboard
  shortcuts reference; notifications preferences; seat/identity info (read-only);
  local diagnostics (UI logs, correlation lookup); about/version.
- **Navigation behavior.** `#/settings` with sections
  `?section=appearance|shortcuts|notifications|identity|diagnostics|about`.
  Reachable via ⌘, and the sidebar footer.
- **Required services.** `settings` (preferences store — non-authoritative),
  `seats` (identity, read-only), `system` (version/diagnostics).
- **Permissions.** `settings.view` (always). Seat/identity is read-only in
  Sprint 1; managing seats (invite/suspend) is **out of scope** for the Alpha
  and, if surfaced at all, links to a permitted flow — it does not implement seat
  lifecycle in Sprint 1.
- **Data sources.** `settings.get`, `system.info`, seat identity via
  `permissions.forActor`; commands `settings.set` (preferences only).
- **Acceptance criteria.** (a) Every appearance change applies live and persists;
  (b) no setting here writes authoritative platform state (only preferences);
  (c) identity is shown read-only; (d) diagnostics never expose secrets.

---

## 12. Cross-page invariants

- Every page implements the five-state contract (`02 §12`).
- Every page's mutating action is broker-gated server-side and permission-aware
  in the UI (ADR-0085).
- Every list/detail is a projection; no page computes authoritative state.
- Every page is deep-linkable and back/forward-correct (ADR-0082).
- Every page hides destinations/actions structurally unavailable to the actor and
  explains recoverable denials.
