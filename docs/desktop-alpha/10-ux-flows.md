# UX Flow Documentation

Nine end-to-end flows. Each: **trigger → steps → data/commands → states →
success & failure.** Every write is a broker-gated command; every read is a
query; nothing bypasses the log. Diagrams are Mermaid sequence sketches
(renderer ↔ host ↔ services).

---

## 1. Opening Sidra

**Trigger.** User launches the desktop app.

Steps: splash/shell mounts → host opens the **persistent Vault** → providers
initialize (theme, query, permissions, tail) → route restored (last route or
Dashboard) → Dashboard widgets resolve independently.

```mermaid
sequenceDiagram
  participant U as User
  participant R as Renderer (Shell)
  participant H as Host (ipc.rs)
  participant S as services/*
  U->>R: launch
  R->>H: system.info / system.health
  H->>S: open Vault (persistent), read health
  S-->>H: healthy
  H-->>R: SystemHealthDTO, SystemInfoDTO
  R->>H: subscribe events.tail
  R->>H: permissions.forActor
  R->>R: restore last route (or Dashboard)
  R->>H: dashboard queries (missions.list, agents.list, …)
  H-->>R: DTOs (each independently)
  R-->>U: chrome first, widgets fill in
```

States: chrome renders immediately; each widget shows skeleton→ready/empty/error.
**Success:** interactive Dashboard within the perf budget. **Failure:** Vault
unreachable → full-screen recoverable error with retry/diagnostics (`§8`), never
a blank window.

---

## 2. Creating a Mission

**Trigger.** "New Mission" (quick action / palette / `n`).

Steps: open wizard (`#/missions/new`) → Intent → Scope → Plan preview (engine
dry-run if available) → Review → submit `mission.create` → broker check → engine
appends event → route to `#/missions/:id`; list updates via tail.

```mermaid
sequenceDiagram
  participant U as User
  participant R as Renderer
  participant H as Host
  participant B as Permission Broker
  participant M as Mission Engine
  U->>R: New Mission → fill wizard → Submit
  R->>H: command mission.create {intent,scope,correlationId}
  H->>B: check(actor, mission.create, scope)
  alt allowed
    B-->>H: allow
    H->>M: create mission
    M->>M: append mission-created event(s) to Vault
    M-->>H: MissionDTO
    H-->>R: ok {missionId, correlationId}
    R->>R: close wizard → navigate mission detail
    Note over R,H: events.tail(affects:missions:*) → invalidate list
  else denied
    B-->>H: deny(reason)
    H-->>R: PermissionDenied(reason)
    R-->>U: explainable dialog (ADR-0085)
  end
```

States: submit shows loading; optimistic list insert (opt-in) reconciled by tail.
**Success:** mission visible + detail open within one tail cycle. **Failure:**
denial → dialog; engine error → toast + correlationId, no partial state.

---

## 3. Viewing Agents

**Trigger.** Sidebar → Agents (`g a`) or an `AgentCard`/mission link.

Steps: `agents.list` (grouped by department) → open `#/agents/:id` → `agents.get`
+ `agents.activity`; status is the orchestrator's live status via the tail;
activity items deep-link to events/missions. **Read-only** (no spawn in Sprint 1).

```mermaid
sequenceDiagram
  participant U as User
  participant R as Renderer
  participant H as Host
  U->>R: open Agents
  R->>H: agents.list
  H-->>R: AgentSummaryDTO[]
  U->>R: open agent :id
  R->>H: agents.get(id) + agents.activity(id)
  H-->>R: AgentDTO, ActivityDTO[]
  Note over R,H: tail(affects:agents:*) keeps status live
  U->>R: click activity → navigate.events{correlation}
```

**Success:** accurate live status, activity deep-links resolve. **Failure:** a
failed query → widget error + retry; agent offline is a normal state, not an
error.

---

## 4. Opening Projects

**Trigger.** Sidebar → Projects (`g p`), a pinned project, or a project deep link.

Steps: `projects.list` → open `#/projects/:id` → tabs (overview/missions/
documents/activity); missions cross-link to Mission Center filtered to the
project; pin/unpin persists to preferences and reflects on Dashboard + sidebar.

```mermaid
sequenceDiagram
  participant U as User
  participant R as Renderer
  participant H as Host
  U->>R: open Projects
  R->>H: projects.list
  H-->>R: ProjectSummaryDTO[]  (or degraded: composed by tag — Epic 0)
  U->>R: open project → Missions tab
  R->>R: navigate.missions{project:id}
  U->>R: Pin
  R->>H: command projects.pin(id)  (preference)
  H-->>R: ok → Dashboard/sidebar update
```

**Success:** project detail with real counts; pin reflects immediately.
**Failure/degraded:** if the projects aggregate is MISSING, Projects composes
missions+documents by tag and shows a degraded note (`03 §6`).

---

## 5. Viewing Memory (Knowledge)

**Trigger.** Sidebar → Knowledge (`g k`), Dashboard Memory Overview, or a
document deep link.

Steps: enter a query → `memory.search` (engine hybrid retrieval) → results with
**provenance** → open `#/knowledge/:docId` → `memory.get` with source + producing
event; the UI renders the engine's ranking (never re-ranks as the answer).

```mermaid
sequenceDiagram
  participant U as User
  participant R as Renderer
  participant H as Host
  participant Mem as services/memory
  U->>R: type query
  R->>H: memory.search{q, scope}
  H->>Mem: hybrid retrieval
  Mem-->>H: ranked results + provenance
  H-->>R: MemoryResultDTO[]
  U->>R: open doc
  R->>H: memory.get(docId)
  H-->>R: DocumentDTO {source, producingEvent}
  U->>R: click provenance → navigate.events{correlation}
```

**Success:** ranked results with provenance, respecting visibility. **Failure:**
retrieval limited in build → degraded state + still-usable browse; no client-side
fabricated ranking.

---

## 6. Searching (global) & commands

**Trigger.** ⌘/ (search) or ⌘K (commands).

Steps: overlay opens → type → `search.global` (federated, permission-scoped)
grouped results, or command registry matches → ↵ opens/deep-links, or dispatches
an action command (permission-aware).

```mermaid
sequenceDiagram
  participant U as User
  participant R as Renderer
  participant H as Host
  U->>R: ⌘/ then type
  R->>H: search.global{q}
  H-->>R: grouped results (visibility-scoped)
  U->>R: ↵ on a result
  R->>R: navigate.deepLink(result)
  Note over R: ⌘K path uses local command registry; actions dispatch commands
```

**Success:** relevant, scoped results; keyboard-complete; palette actions respect
permissions. **Failure:** search error → inline error in overlay + retry; empty →
"no matches" with a pivot to command palette.

---

## 7. Opening Settings

**Trigger.** ⌘, / sidebar footer.

Steps: `#/settings` → sections (appearance/shortcuts/notifications/identity/
diagnostics/about); appearance changes apply live and persist as preferences;
identity is read-only; `settings.set` writes preferences only (never
authoritative state).

```mermaid
sequenceDiagram
  participant U as User
  participant R as Renderer
  participant H as Host
  U->>R: ⌘, → Appearance → Dark
  R->>R: data-theme=dark (instant)
  R->>H: settings.set{theme:dark}   (preference)
  H-->>R: ok (persisted locally)
  U->>R: Identity section
  R->>H: permissions.forActor / seat identity (read-only)
  H-->>R: identity DTO
```

**Success:** every appearance change is live + persisted; no setting mutates
platform truth. **Failure:** preference write failure → non-blocking notice;
change still applies for the session.

---

## 8. Handling Errors

**Trigger.** Any query/command failure, permission denial, degraded read model,
or fatal boot error.

Decision tree the shell applies (matches `02 §12`):

```mermaid
flowchart TD
  A[Failure occurs] --> B{Kind?}
  B -->|Permission denied| C[Explainable dialog/inline\nno error, no state change]
  B -->|Widget query error| D[Inline error card + Retry\nsiblings stay live]
  B -->|Read model MISSING| E[Degraded panel + note\nbackend follow-up filed]
  B -->|Command/service error| F[Toast + inline + correlationId\noptimistic rollback]
  B -->|Page render crash| G[Route error boundary\nretry / back / open Event Log]
  B -->|Vault unreachable at boot| H[Full-screen recoverable\nretry + diagnostics]
```

Rules: errors are **scope-isolated** (a widget never takes down chrome); denials
are **not** errors; every service error surfaces a copyable `correlationId` that
resolves in the Event Log; nothing is silently swallowed.

**Success:** the user always understands what failed, why, and the next step, and
the rest of the app stays usable.

---

## 9. Recovering Failures

**Trigger.** A recoverable condition: tail disconnect, transient service error, a
denied action that becomes allowable (after delegation/seat change), or a failed
mission.

Steps:

- **Tail disconnect →** status bar "reconnecting"; interval revalidation keeps
  data usable; on reconnect a full invalidation sweep restores live sync — **no
  data loss** because the log is intact.
- **Transient query/command error →** Retry (manual or automatic backoff for
  idempotent reads); correlationId available for support.
- **Denied → later allowed →** the denial dialog explains *what would make it
  allowable* (e.g. "needs Finance approver seat"); once a seat/delegation event
  arrives, the tail invalidates `permissions.forActor` and the affordance becomes
  enabled without a reload.
- **Failed mission →** the mission shows the failure and (if the engine permits)
  a `mission.retry` affordance; retry dispatches a broker-gated command; replay
  remains available to diagnose.

```mermaid
sequenceDiagram
  participant R as Renderer
  participant H as Host
  Note over R,H: tail drops
  R->>R: status: reconnecting; interval revalidate
  R->>H: reconnect events.tail
  H-->>R: tail live
  R->>R: invalidateQueries() full sweep → live again
```

**Success:** the app self-heals to a live, log-consistent state; the user is
never stranded and never loses data; every recovery path is visible and
actionable.
