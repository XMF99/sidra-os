# State Management

Per ADR-0083, state splits into **server state** (TanStack Query, derived from
the Event Log via IPC) and **UI/navigation state** (Zustand + router). There is
**no global mutable object that claims to be the Firm's truth** — the log is the
truth; the client holds a disposable cache plus its own view preferences.

---

## 1. State taxonomy

| Kind | Owner | Persisted? | Authoritative? |
|---|---|---|---|
| **Server state** (missions, org, agents, memory, connectors, events, analytics, permissions, notifications) | TanStack Query cache | optionally, as *stale offline snapshot* only | **No** — projection of the log |
| **UI state** (overlays open, selection, drafts, filters-in-flight, expanded nodes) | Zustand (scoped stores) | no | No |
| **Navigation state** (route, params, history) | Router (ADR-0082) | last route only (preference) | No |
| **Preferences** (theme, density, direction, sidebar, pins, layout) | `preferences` slice → local via `settings.get/set` | yes | No (presentation only) |
| **Session/actor** (current seat, permission map) | `PermissionProvider` (Query-backed) | no (re-fetched) | No — reflects broker |

---

## 2. Global state

"Global" here means *ambient providers*, not a god-store:

- `QueryClient` — server-state cache + invalidation (the closest thing to
  "global data", but it is a cache).
- `PermissionProvider` — caches `permissions.forActor`; exposes `useCan(cap,
  resource?)`; invalidated when seat/delegation events arrive.
- `useUiStore` (Zustand) — theme mode, density, direction, sidebar collapsed,
  active overlay, command-palette open, global busy count.
- `useNotificationStore` — toast queue + center open state (list data itself is
  server state via Query).
- `useSelectionStore` — cross-page transient selection (e.g. multi-select in a
  grid) that shouldn't live in the URL.

Each store is small, typed, and independently testable. No store holds domain
entity data.

---

## 3. UI state

- **Overlay stack** — command palette, search, notification center, dialogs,
  sheets are tracked as an ordered stack so Esc/Back closes the top one first
  (`02 §2`). The stack lives partly in the router (deep-linkable overlays) and
  partly in `useUiStore` (transient ones).
- **Drafts** — form drafts (e.g. mission wizard) live in local component state or
  a scoped store, never in server cache; on submit they become a command.
- **Filters** — the *applied* filter set lives in the **URL** (deep-linkable);
  in-flight edits before "apply" live in local state.
- **Expansion/selection** — tree expansion, selected rows: `useSelectionStore` or
  local, keyed by page.

---

## 4. Server state, caching & the tail→key invalidation map

- **Query keys** are structured: `[domain, name, params]`, e.g.
  `['missions','list',{filter:'running'}]`, `['missions','get','M-123']`.
- **Cache policy** (defaults; per-query overridable): `staleTime` short for live
  data (missions/agents/events ~5–10s) so the tail is the real freshness driver;
  `gcTime` moderate; `refetchOnWindowFocus` off (desktop) in favor of the tail.
- **Invalidation is event-driven** (ADR-0081). The tail emits
  `EventEnvelope{ affects[] }`; a **static map** turns `affects` tags into query
  keys to invalidate:

| `affects` tag (example) | Invalidates query keys |
|---|---|
| `missions:*` | `['missions','list',*]`, `['analytics','missionStats']`, dashboard mission widgets |
| `missions:M-123` | `['missions','get','M-123']`, `['missions','timeline','M-123']`, `['missions','progress','M-123']` |
| `org:*` / `org:proposal:*` | `['org',*]`, `['departments','list']` |
| `departments:D-x` | `['departments','get','D-x']`, `['departments','standards','D-x']`, … |
| `agents:*` | `['agents','list']`, dashboard running-agents |
| `connectors:*` / `egress:*` | `['connectors',*]` |
| `seats:*` / `delegation:*` | `permissions.forActor`, approval affordances |
| `notifications:*` | `['notifications','list']`, `unreadCount` |
| `events:*` | activity feed, event log live rows |

- **Tail loss fallback:** switch affected queries to interval `refetchInterval`,
  show status-bar "reconnecting", and run a full `invalidateQueries()` sweep on
  reconnect.

---

## 5. Mutations, optimistic updates & rollback

- Mutations dispatch commands (`01 §4`) and carry a `correlationId`.
- **Optimistic (opt-in):** `onMutate` snapshots the affected cache and applies an
  optimistic patch; `onError` rolls back to the snapshot and surfaces the error;
  `onSettled` invalidates. The **authoritative reconciliation** is the tail event
  matching `correlationId` — the optimistic patch is provisional until then.
- **Permission denials are not errors:** a `PermissionDenied` result rolls back
  the optimistic patch and renders the explainable dialog (ADR-0085), not an
  error toast.
- **No fire-and-forget mutation** silently changes cache without a command result
  or a tail confirmation.

---

## 6. Mission state (worked example)

Mission state is **entirely server state**; the UI never models the lifecycle:

- `['missions','get',id]` → `MissionDTO` (state, participants, metrics).
- `['missions','timeline',id]`, `['missions','progress',id]`,
  `['missions','replay',id]` → their DTOs.
- Actions (`approve/delegate/cancel/retry/create`) are mutations; results and the
  tail drive re-fetch.
- The **allowed actions** shown come from the DTO (engine-reported valid
  transitions) ∩ the permission annotation — computed in a selector, not stored.
- See `15-state-diagrams.md` for the full diagram; the UI *renders* that machine,
  the engine *is* that machine.

---

## 7. Navigation state

Owned by the router (ADR-0082): current route, params, and an intra-app history
stack including deep-linkable overlays. The only persisted piece is "last route"
(a preference) so re-opening Sidra can optionally restore where the user was
(`10-ux-flows.md §1`).

---

## 8. Persistence

Exactly two things persist, both non-authoritative:

1. **Preferences** (`preferences` slice) via `settings.get/set` (host-side local
   store) or a local JSON file — theme, density, direction, sidebar, pins,
   dashboard layout, last route. Schema-versioned; unknown keys ignored; loss ⇒
   defaults, never a broken app.
2. **Offline query snapshot (optional, stretch):** a persisted TanStack Query
   cache marked **stale**, shown behind an explicit "offline / last synced at …"
   banner and never treated as current until re-validated against the log. If
   omitted in Sprint 1, the app simply shows loading/degraded states offline.

Nothing else is written. No domain table, no authoritative record — that is the
platform's job.

---

## 9. Synchronization

- **Intra-app sync** = the event tail (`01 §7`): the single mechanism keeping the
  cache aligned with the log. Multi-view consistency (e.g. Dashboard + Mission
  Center showing the same mission) is automatic because both read the same query
  keys and both invalidate on the same tail tags.
- **Platform sync/conflict** (the `services/sync` domain — multi-node
  convergence) is **surfaced, not implemented** by the UI: the status bar shows
  sync/conflict state from `system.health`, and conflicts deep-link to the
  relevant surface. The UI never resolves a platform-level conflict itself; it
  reflects the sync service's state and offers the permitted action.
- **Optimistic-vs-authoritative** reconciliation is §5.

---

## 10. Acceptance criteria (state)

1. No global store holds domain entity data; all such data flows through the
   query cache.
2. The tail→key map invalidates the correct queries on each event kind; two views
   of the same entity update together.
3. Optimistic mutations roll back correctly on error/denial and reconcile on the
   tail.
4. Preferences persist and survive restart; deleting the preferences file yields
   defaults, not a crash.
5. On tail loss, the app switches to interval fallback, signals it, and fully
   re-syncs on reconnect.
6. Permission answers refresh when seat/delegation events arrive.
