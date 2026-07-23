# Deliverable 1 — Desktop Alpha Sprint 1 Architecture

**Scope.** The architecture of the desktop *shell* — the frame that hosts every
page, the contract by which it reads and writes, and the rules that keep it a
faithful projection of the platform. This document is normative; every other
spec in the package refines a section here.

---

## 1. Architectural stance

The shell is a **thin, event-sourced client**. It has three responsibilities and
no others:

1. **Reflect** the state of the Firm by rendering read models derived from the
   Event Log.
2. **Request** change by dispatching commands that pass through the Permission
   Broker and, if allowed, append events.
3. **Stay current** by subscribing to an event tail that tells it which read
   models to re-fetch.

Everything else — authority, enforcement, business rules, lifecycle transitions,
replay — lives in `services/*` behind the IPC boundary and is *never*
reconstructed in the renderer.

```
┌─────────────────────────────────────────────────────────────────────┐
│  RENDERER  (apps/desktop/src — React/TS)                            │
│                                                                     │
│  Presentation      → components, pages, shell chrome               │
│  Client state      → Zustand (UI/nav)  ·  TanStack Query (server)  │
│  Query cache       → read-model DTOs (disposable, reconstructable) │
│         ▲  reads (query DTOs)            │  writes (commands)       │
└─────────┼────────────────────────────────┼─────────────────────────┘
          │            Tauri IPC (typed contract, §6)                 │
┌─────────┼────────────────────────────────┼─────────────────────────┐
│  HOST  (apps/desktop/src-tauri — Rust)                              │
│  ipc.rs → query handlers (read projections)                        │
│         → command handlers (→ Permission Broker → append event)    │
└─────────┼────────────────────────────────┼─────────────────────────┘
          │                                │
┌─────────▼────────────────────────────────▼─────────────────────────┐
│  services/*  (store, security, mission, departments, agents,       │
│               memory, connectors, seats, delegation, …)            │
│  packages/domain  (pure types)                                     │
│  Vault  ▸  Event Log (append-only, hash-chained)  ◀ source of truth│
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. The four planes of the shell

| Plane | Contents | Owns |
|---|---|---|
| **Chrome plane** | Title bar, sidebar, top bar, status bar, command palette, notification center, global search overlay, theme root | Layout, navigation intent, global affordances |
| **Page plane** | The 11 routed pages | Page-scoped composition and local view state |
| **Data plane** | Query client, read-model DTO types, event-tail subscriber, IPC client wrappers | Fetching, caching, cache invalidation |
| **System plane** | Permission gate, error boundary, toast/notification bus, theme provider, keyboard-shortcut registry, i18n/RTL provider | Cross-cutting behavior every page inherits |

The chrome plane is **persistent** (mounts once, survives navigation). The page
plane is **swapped** by the router. The data and system planes are **ambient**
(providers wrapping the whole tree).

---

## 3. Read path (queries)

```
Component
  → useQuery(key, () => ipc.query('missions.list', params))   // TanStack Query
      → invoke('query_missions_list', params)                 // Tauri IPC
          → host query handler
              → read projection over Vault (read model)
          ← MissionSummaryDTO[]
      ← cached under key ['missions','list',params]
```

Rules:

- **DTOs are read models, not domain types.** The host maps domain/projection
  rows to stable, versioned DTOs (`01 §6.3`). The renderer never imports a
  domain type; it imports generated TypeScript DTO types (bindings).
- **Reads are pure.** A query handler must not mutate, must not append events,
  must not call the broker for enforcement (it may call the broker read-only to
  *annotate* a DTO with the caller's capability, see §5).
- **Caching is disposable.** Any cache entry can be dropped and rebuilt by
  re-querying. Cache is never persisted as truth (it *may* be persisted as an
  offline convenience, clearly marked stale — see `08-state-management.md`).

---

## 4. Write path (commands)

```
Component action (e.g. "Approve mission")
  → ipc.command('mission.approve', {missionId, decisionId})
      → invoke('command_mission_approve', …)
          → host command handler
              → Permission Broker.check(actor, capability, resource)   // default-deny
                  ├─ DENY → structured PermissionDenied error → surfaced as explainable UI
                  └─ ALLOW → service performs effect → appends event(s) to Event Log
          ← CommandResult { ok | denied | error, correlationId }
  → on ok: invalidate affected query keys (or wait for event-tail, §7)
```

Rules:

- **Every mutation is a command; every command is broker-gated server-side.** The
  UI's own permission check (§5) is advisory and must never be the only gate.
- **Commands are the only way the UI changes anything.** No query handler mutates.
- **Optimistic UI is opt-in and reversible.** A component may optimistically
  reflect a command, but must reconcile against the authoritative event-tail
  result and roll back on denial/error (`08-state-management.md §5`).
- **Idempotency & correlation.** Commands carry a client-generated
  `correlationId` so the UI can match the resulting event(s) on the tail and so
  double-submits are safe (dedupe is the host's responsibility; the UI supplies
  the id).

---

## 5. Permission-aware rendering (affordance, not enforcement)

The UI renders one of four states per gated affordance, decided by a **read-only
capability annotation** the host attaches to DTOs or answers via a dedicated
`permissions.check` query:

| UI state | When | Example |
|---|---|---|
| **Shown & enabled** | broker would allow | "Approve" button active |
| **Shown & disabled + reason** | broker would deny for a *recoverable* reason (needs delegation, needs a seat) | greyed "Approve" with tooltip "Requires Finance approver seat" |
| **Hidden** | capability is structurally irrelevant to this actor/context | connector-admin actions for a read-only seat |
| **Explain-on-attempt** | ambiguous or expensive to pre-check | action visible; on click, broker denial renders an explainable dialog |

**Enforcement is always server-side.** The four states above are UX quality, not
security. Even a "shown & enabled" button results in a broker check on dispatch.
This is ADR-0085.

---

## 6. The IPC Contract Register (the load-bearing interface)

The contract between renderer and host is the **only** coupling point and is
governed as a first-class artifact. Antigravity reconciles it against the real
`ipc.rs` in **Epic 0** before building pages.

### 6.1 Command/query naming

- Queries: `query_<domain>_<name>` (host) ↔ `ipc.query('<domain>.<name>')` (client).
- Commands: `command_<domain>_<action>` (host) ↔ `ipc.command('<domain>.<action>')`.
- Domains map 1:1 to services: `missions`, `departments`, `org`, `agents`,
  `projects`, `memory`, `connectors`, `analytics`, `events`, `permissions`,
  `system`, `settings`, `notifications`, `search`.

### 6.2 Contract register (Sprint-1 surface)

This is the **assumed** surface. Epic 0 marks each row `EXISTS` / `PARTIAL` /
`MISSING`; MISSING rows become degraded UI + a backend follow-up ticket in
`20-migration-notes.md`. **No row here authorizes new backend work in Sprint 1**
— it authorizes *graceful degradation* where the backend is not ready.

| Domain | Query DTOs (read) | Commands (write) |
|---|---|---|
| `system` | `system.health` → `SystemHealthDTO`; `system.info` → `SystemInfoDTO` | — |
| `missions` | `missions.list`, `missions.get`, `missions.timeline`, `missions.progress`, `missions.replay` | `mission.create`, `mission.approve`, `mission.delegate`, `mission.cancel`, `mission.retry` |
| `org` | `org.structure`, `org.divisions`, `org.offices`, `org.vetoes` | `org.proposeStructureChange` (propose-only) |
| `departments` | `departments.list`, `departments.get`, `departments.standards`, `departments.guards`, `departments.exchange` | `departments.install` (Pack), `departments.uninstall`, `departments.requestExchange` |
| `agents` | `agents.list`, `agents.get`, `agents.activity` | — (agents are orchestrated, not user-spawned) |
| `projects` | `projects.list`, `projects.get`, `projects.pin` | `projects.pin`, `projects.unpin` |
| `memory` | `memory.search`, `memory.get`, `memory.recentDocuments` | — |
| `connectors` | `connectors.list`, `connectors.get`, `connectors.grants`, `connectors.egressLog` | `connectors.requestGrant`, `connectors.revokeGrant` |
| `analytics` | `analytics.performance`, `analytics.missionStats`, `analytics.dailySummary` | — |
| `events` | `events.tail` (subscription), `events.query`, `events.get`, `events.verifyChain` | — (append-only; UI never edits) |
| `permissions` | `permissions.check`, `permissions.forActor` | — |
| `notifications` | `notifications.list`, `notifications.unreadCount` | `notifications.markRead`, `notifications.markAllRead`, `notifications.act` |
| `search` | `search.global` | — |
| `settings` | `settings.get` | `settings.set` (UI preferences only; non-authoritative) |

### 6.3 DTO governance

- DTOs live in `packages/bindings` (generated, never hand-edited — existing ADR
  on bindings). Sprint 1 **consumes** bindings; if a DTO is missing, it is a
  backend follow-up ticket, and the UI uses a local `Partial<DTO>` shim marked
  `// TEMP: awaiting bindings for <name>` that is deleted when bindings land.
- Every DTO is **versioned** and **additive**; the renderer tolerates unknown
  fields and absent optional fields (forward/backward compatible).

### 6.4 Event tail

`events.tail` is a Tauri **event channel** (host → renderer push) emitting a
compact `EventEnvelope { seq, kind, correlationId, affects: string[] }` as the
Vault appends. The renderer uses `affects` to invalidate query keys (§7). The
tail carries **metadata only**, not payloads; the UI re-fetches read models it
cares about. This keeps the log the source of truth and the UI a follower.

---

## 7. Cache invalidation = event-tail projection

The shell keeps itself fresh **without polling** by treating the event tail as
the invalidation signal:

```
events.tail → EventEnvelope{ affects: ['missions:M-123','dashboard:running'] }
  → queryClient.invalidateQueries matching those keys
  → affected components re-query → re-render
```

- Mapping from `affects` tags to query keys is a static table
  (`08-state-management.md §4`).
- If the tail disconnects, the shell falls back to **interval revalidation** and
  shows a "reconnecting" status-bar indicator; on reconnect it does a full
  invalidation sweep. The UI is *eventually consistent with the log by
  construction*, never authoritative.

---

## 8. Shell composition (provider order)

```
<TauriBridgeProvider>            // IPC client, event-tail subscriber
 <I18nRtlProvider>               // locale + LTR/RTL direction
  <ThemeProvider>               // data-theme, tokens (ADR-0084)
   <QueryClientProvider>        // TanStack Query (ADR-0083)
    <PermissionProvider>        // caches permissions.forActor (ADR-0085)
     <ShortcutRegistryProvider> // global keyboard map
      <NotificationProvider>    // toast + center bus
       <AppErrorBoundary>       // top-level error state
        <RouterProvider>        // hash router (ADR-0082)
         <AppShell>             // chrome plane: sidebar/topbar/statusbar
          <RouteOutlet/>       // page plane
         </AppShell>
        </AppErrorBoundary>
       …
```

Provider order is normative: theme before query (themed skeletons), permission
before router (guards), error boundary outside router (a page crash never kills
chrome).

---

## 9. Failure & degradation model (architectural)

The shell must remain usable when parts of the platform are unavailable. Each
data domain declares a **degradation contract**:

| Failure | Shell behavior |
|---|---|
| A query handler errors | That widget/page shows an **error state** with retry; the rest of the shell stays live (isolation via per-widget error boundaries). |
| A read model is MISSING (Epic 0) | Widget shows a **degraded/empty state** with an explanatory note; no crash. |
| Event tail down | Status bar shows "reconnecting"; interval revalidation; no data loss (log is intact). |
| Command denied by broker | Explainable **permission dialog**; no state change; nothing logged as an error. |
| Command errors (service fault) | Toast + inline error; optimistic UI rolls back; correlationId shown for support. |
| Vault unreachable at startup | **Full-screen recoverable error** ("Cannot open the Vault") with diagnostics, never a white screen. |

This model is elaborated per-state in `02-app-shell.md §12` and per-flow in
`10-ux-flows.md`.

---

## 10. Security & privacy posture of the renderer

- **No secret material in the renderer.** Connector credentials are injected
  server-side at egress (ADR-0034); the UI shows only non-sensitive metadata
  (grant scope, last-used, status). Credential fields never cross IPC to the
  renderer.
- **CSP locked down.** The Tauri webview runs with a strict content-security
  policy: no remote script, no `eval`, assets local-only. (Config lives in
  `tauri.conf.json` — Sprint 1 tightens allowed-list; see `20-migration-notes.md`.)
- **IPC allow-list.** Only the commands/queries in §6 are exposed; the renderer
  cannot call arbitrary host functions.
- **No telemetry** (ADR-0009). Local logs only, user-visible in the Event Log
  and (for UI faults) a local diagnostics panel.

---

## 11. What "done" means for the architecture

Sprint 1's architecture is satisfied when: the shell renders every page from
IPC read models; every mutation flows through a broker-gated command; the event
tail drives invalidation; no UI-local authoritative state exists; the four
degradation behaviors work; and the Architecture Audit (`18`) is green. The ADRs
that make these choices binding are recorded in **Appendix B** below.

---

## 12. Hard boundaries (what Sprint 1 will NOT do)

- **No new Rust crate, no crate edit, no migration, no schema change.** If the
  shell needs a read model that no projection exposes, the gap is recorded in
  `20-migration-notes.md` as a **backend follow-up ticket**, and the UI degrades
  gracefully (empty/degraded state) until that ticket lands. Sprint 1 ships
  against the read models that exist today.
- **No new ADR for any existing service.** New ADRs (0080–0086, Appendix B)
  govern the frontend only.
- **No redesign** of Event Log, Replay, Permission Broker, Mission Engine,
  Departments, Agents, Memory, Connectors, or the workspace layout.
- **No telemetry, no network beacon, no auto-update phone-home** beyond the
  existing signed-release channel.
- **No enforcement in the UI.** The UI may *hide* a button the broker would deny,
  but the broker is still asked on every action.

## 13. Technology decisions at a glance (ratification note)

These are net-new frontend decisions for a surface that did not previously exist
as a product. They introduce no breaking change to any crate and are confined to
`apps/desktop`. Each is justified in full in Appendix B.

| Area | Decision | ADR |
|---|---|---|
| Frontend stack | Keep the existing **Tauri v2 + React 18 + TypeScript + Vite**. | ADR-0080 |
| Read path | Typed **IPC query** read-model DTOs; **TanStack Query** cache; **event-tail** invalidation. | ADR-0081 |
| Routing | **In-app hash router**, typed, deep-linkable. | ADR-0082 |
| State | **Zustand** (UI/nav) + **TanStack Query** (server); no global mutable "app truth". | ADR-0083 |
| Design tokens | **CSS custom properties**; light/dark via `data-theme`; RTL logical properties. | ADR-0084 |
| Permission UX | UI decides show/enable/disable/explain; enforcement stays server-side. | ADR-0085 |
| Event Log & Replay | Strictly **read-only** projections; replay reuses the existing driver. | ADR-0086 |

> **Ratification rule.** Where the existing `apps/desktop/src` already fixes a
> library (router, store, styling), **that existing choice governs** and the
> corresponding ADR is amended to match reality rather than the code being
> changed. Antigravity resolves this in Epic 0 (`11-implementation-plan.md`).

---

## Appendix A — STEP-1 Preservation Gate

**Purpose.** Prove the design **preserves** every non-negotiable and introduces
**no architectural breaking change**. This gate constrains the specification.

### A.1 The nine non-negotiables + ADRs — preservation table

| # | Primitive | The shell's *only* permitted relationship | Forbidden | Guarding ADR/doc |
|---|---|---|---|---|
| 1 | **Event Log** | Read via projection DTOs over IPC; write by dispatching commands that append events. | Any UI-local authoritative store; any write that isn't an event. | ADR-0002 |
| 2 | **Replay** | Display replay results from the `services/departments` driver via read-only IPC. | UI re-implementing replay or editing history. | ADR-0086 |
| 3 | **Permission Broker** | Ask the broker (read-only) for affordance; every mutation still passes the broker server-side. | UI deciding "allowed" and skipping the broker. | ADR-0006, 0085 |
| 4 | **Mission Engine** | Create/observe/approve/delegate via existing mission IPC; render engine state. | UI computing lifecycle/progress; bypassing the engine. | ADR-0032 |
| 5 | **Departments** | Render org from read models; trigger structure *proposals* only. | UI enacting structure changes; author-reviews-own-work. | M11–M14, ADR-0008/0018/0040–0045 |
| 6 | **Agents** | List/inspect agents + status from read models. | UI spawning/scheduling agents; fabricating status. | orchestrator |
| 7 | **Memory** | Query hybrid retrieval via IPC; render results + provenance. | UI re-ranking client-side and presenting it as the answer. | memory |
| 8 | **Connectors** | List connectors/grants/egress; trigger grant/revoke *requests*. | UI injecting credentials or performing egress; secrets in renderer. | ADR-0034 |
| 9 | **Current ADRs** | Consume ADR-0001…0079 as constraints. | Contradicting any accepted ADR. | docs/, docs-v2/adr/ |
| 10 | **Workspace structure** | Add only under `apps/desktop/`. | Touching domain, services, migrations, members, or CI gates. | ADR-0011 |

### A.2 Dependency-direction check
The shell is an `apps/*` member whose **only inbound edge is the typed IPC
contract** (`§6`); it has no outbound edge into any crate. `packages/domain ←
services/* ← apps/*` holds. **PASS by construction.**

### A.3 Kernel neutrality
No department-specific logic is added to any kernel path; department content is
rendered **as data** by generic components (e.g. `DepartmentCard`). **PASS.**

### A.4 No new authoritative state
Only two client-persisted categories, both non-authoritative and allowed:
UI preferences (theme, sidebar, pins, density) and a disposable query cache
(reconstructable from the log). No table, no migration. **PASS.**

### A.5 Telemetry check
No analytics SDK, crash-beacon, usage ping, or remote logging. The only egress
remains connector custody (server-side, broker-gated) and the signed-release
channel. **PASS (ADR-0009 honored).**

### A.6 Gate verdict
Nine non-negotiables preserved · no crate/migration/schema/ADR change · dependency
direction respected · kernel neutrality · no new authoritative state · no
telemetry → **STEP-1: PASS.**

---

## Appendix B — Architecture Decision Records (0080–0086)

All are **Proposed → Accepted on Principal approval**, scoped to `apps/desktop`,
with no effect on any crate. Numbering assumed contiguous after ADR-0079;
Antigravity confirms against the live ADR index in Epic 0 and renumbers if 0080+
is already consumed.

### ADR-0080 — Keep Tauri v2 + React 18 + TypeScript + Vite
**Context.** The assembled surface already exists as a Tauri app with a React/TS
renderer. Sprint 1 must productionize it without an architectural breaking change.
**Decision.** Keep the existing stack unchanged; add no alternative framework, no
Electron, no SSR. All Sprint-1 UI is added under `apps/desktop/src`.
**Consequences.** Build on the current toolchain (Epic 0 pins versions); validate
visuals on the WebView2/WebKitGTK/WKWebView engines; no Node runtime ships to
users. **Rejected:** Electron (second runtime, larger footprint); swapping React;
a web app (goal is a local-first desktop shell).

### ADR-0081 — Reads via typed IPC query read-models, cached, event-tail-invalidated
**Context.** The shell must display data without becoming an authoritative store
or reaching into service internals, and stay current as the log grows.
**Decision.** (1) All reads are typed IPC queries returning versioned read-model
DTOs from `packages/bindings`; (2) query handlers are pure; (3) the renderer
caches DTOs with TanStack Query keyed by `(domain,name,params)`; (4) invalidation
is driven by the event tail via a static `affects`→key map, with interval
fallback on tail loss.
**Consequences.** The UI is eventually consistent with the log by construction and
rebuildable from it; `ipc.rs` is the single testable coupling point; missing read
models degrade gracefully. **Rejected:** direct service calls; polling; exposing
domain types.

### ADR-0082 — In-app hash router with a typed, deep-linkable route table
**Context.** A single Tauri window hosting 11 pages + overlays needs stable
navigation, history, and deep links with no server round-trips.
**Decision.** In-app hash-history router (`#/route`) with a typed route table;
typed navigation helpers only; overlays routed as params/nested routes so they are
deep-linkable and back-dismissible; the router mounts inside the persistent shell.
**Consequences.** Deep links work identically from notifications/search/handoff;
back/forward is an intra-app stack with overlay-first dismissal; the route table
is the single source for the Navigation Tree. **Rejected:** browser/path history
(base-path/protocol handling); ad-hoc "rooms"; multiple native windows.

### ADR-0083 — Zustand for UI/nav, TanStack Query for server state; no global "app truth"
**Context.** Three kinds of state (server, UI, navigation); a single global
mutable store would recreate authoritative client state (against ADR-0002's spirit).
**Decision.** Server state → TanStack Query only; UI state → small scoped Zustand
stores; persisted UI state → a `preferences` slice (local, non-authoritative);
**no god-store** of domain truth.
**Consequences.** Cache correctness is solved by the library; UI stores can't
become shadow truth; optimistic updates are Query mutations with rollback.
**Rejected:** Redux for everything; context-only; a single server+UI store.

### ADR-0084 — Design tokens as CSS custom properties; `data-theme`; CSS Modules
**Context.** A coherent visual system with light/dark, full a11y, and RTL
(Arabic-first) without a heavy styling dependency.
**Decision.** Single token source in CSS custom properties (`--sd-*`),
primitive→semantic tiers; theming via a `data-theme` attribute flip; direction via
`dir` + logical properties; consumption via CSS Modules; motion respects
`prefers-reduced-motion`.
**Consequences.** Themes/density/contrast are cheap token flips; tokens are the
contract with every component; if Tailwind is already wired, tokens feed its theme
config (source stays CSS variables). **Rejected:** runtime CSS-in-JS; hard-coded
per-component colors; mirrored LTR/RTL stylesheets.

### ADR-0085 — Permission-aware rendering is affordance only; the broker remains sole enforcement
**Context.** Good UX hides/explains actions a user can't take, but the UI must
never become an authorization authority (ADR-0006).
**Decision.** Render four affordance states (shown+enabled / shown+disabled+reason
/ hidden / explain-on-attempt) from a **read-only** capability annotation;
enforcement is always server-side — every mutating command re-checks the broker;
the UI never stores or derives a grant.
**Consequences.** The broker stays the single choke point; permission answers
cache like any read model and refresh on seat/delegation events; security review
only needs "every command hits the broker server-side". **Rejected:** client-side
authorization; showing everything and letting the server reject.

### ADR-0086 — Event Log and Replay surfaces are strictly read-only; the UI never re-implements replay
**Context.** The Event Log page and mission replay tempt raw event-folding or
history "correction", both violating ADR-0002 and the M11 replay-equivalence
guarantee.
**Decision.** The Event Log page is a read-only viewer (`events.query/get`) with
an integrity indicator from the host's `verify_chain`; mission replay renders the
existing driver's output as a player (no client-side event folding); any
point-in-time reconstruction is a host capability the UI requests, degrading if
absent.
**Consequences.** Log integrity is surfaced, not endangered; UI replay is always
equivalent to the engine's; the viewer is safe to ship in Alpha. **Rejected:**
client-side event folding/reconstruction; an editable log / "admin correction".
