# Routing

Per ADR-0082: an **in-app hash router** (single Tauri window), typed route table,
deep-linkable, with intra-app back/forward and overlay participation. The route
table is the single source for the Navigation Tree (`14`).

---

## 1. Desktop routing model

- **One window, one router.** The router mounts inside the persistent `AppShell`;
  navigation swaps only the `<RouteOutlet/>` (chrome never unmounts).
- **Hash history:** URLs are `#/path?query`. Robust in the webview; no base-path
  or custom-protocol handling needed; trivially serializable for deep links.
- **Typed routes:** every route has a typed definition `{ path, params, loader?,
  guard?, element }`. Navigation uses typed helpers
  (`navigate.mission(id, {tab})`) — never string building — so refactors are safe
  and the Navigation Tree stays in sync.
- **Route = page or overlay.** Pages render in the outlet; overlays (search,
  palette, notification center, mission wizard, some detail sheets) render in a
  portal layer but are *addressable* as routes/params so they deep-link and
  participate in history.

---

## 2. Route table (Sprint 1)

| Route | Params | Element | Guard |
|---|---|---|---|
| `#/` | — | Dashboard | authed |
| `#/missions` | `filter,sort,q,dept,project,from,to` | MissionList | `mission.view` |
| `#/missions/new` | (overlay) | CreateMissionWizard | `mission.create`* |
| `#/missions/:id` | `tab` | MissionDetail | `mission.view` |
| `#/org` | — | OrgChart | `org.view` |
| `#/org/divisions/:id` | — | DivisionDetail | `org.view` |
| `#/org/offices/:id` | — | OfficeDetail | `org.view` |
| `#/org/proposals/:id` | — | ProposalDetail | `org.view` |
| `#/departments` | `q` | DepartmentGrid | `departments.view` |
| `#/departments/:id` | `tab` | DepartmentDetail | `departments.view` |
| `#/agents` | `filter,q,dept` | AgentList | `agents.view` |
| `#/agents/:id` | `tab` | AgentDetail | `agents.view` |
| `#/projects` | `q` | ProjectList | `projects.view` |
| `#/projects/:id` | `tab` | ProjectDetail | `projects.view` |
| `#/knowledge` | `q,source` | KnowledgeSearch | `knowledge.view` |
| `#/knowledge/:docId` | — | DocumentDetail | `knowledge.view` |
| `#/connectors` | `q,status` | ConnectorList | `connectors.view` |
| `#/connectors/:id` | `tab` | ConnectorDetail | `connectors.view` |
| `#/analytics` | `range,scope,metric` | Analytics | `analytics.view` |
| `#/events` | `kind,correlation,entity,from,to` | EventLog | `events.view` |
| `#/settings` | `section` | Settings | authed |
| `#/dev/gallery` | — | Component gallery (dev-only) | dev |
| `*` | — | NotFound (in-shell) | — |

\* Wizard opens regardless; the **submit** is broker-gated (a user may draft, the
create command may still be denied — ADR-0085).

**Overlay routes** (rendered above the current page, back-dismissible):
`#/missions/new`, `?overlay=search`, `?overlay=palette`,
`?overlay=notifications`, and `?section=` sheets. These layer on top of the
current route so closing them returns to the underlying page.

---

## 3. Deep linking

- Every entity and filtered view is a URL: `#/missions/M-123?tab=timeline`,
  `#/events?correlation=abc123`, `#/connectors/C-9?tab=egress`,
  `#/knowledge?q=policy&source=git`.
- **Producers of deep links:** notifications (`notifications.act`/open),
  global search results, dashboard drill-downs, "open in Event Log" affordances,
  and cross-page cross-links.
- **External deep links:** the Tauri deep-link handler maps an incoming
  `sidra://…` (or OS handoff from the companion app) to a hash route in Epic 0;
  unknown/unauthorized targets resolve to a safe page with an explanation, never
  a crash.
- **Guarded links:** a deep link to a route the actor can't view resolves to a
  permission-explanation view (not a blank), preserving the intended target so
  access can be requested.

---

## 4. Back / forward behavior

- **Intra-app history stack.** Back/forward move through the app's own visited
  routes and overlays, not the browser.
- **Overlay-first dismissal.** If an overlay is open, Back/Esc closes the top
  overlay before popping the page stack (`02 §2`).
- **Detail↔list.** Navigating list→detail→back returns to the list *with its
  filters intact* (filters are URL params, so state is preserved for free).
- **Tab memory.** Within a detail page, switching tabs updates the `tab` param
  (a replace, not a push, so Back doesn't step through tabs); leaving and
  returning restores the last tab via the param.
- **Forward** re-applies a popped route/overlay symmetrically.
- **Guard on navigation.** Leaving a page with an unsaved draft (e.g. mission
  wizard with content) prompts a discard confirmation before navigating.

---

## 5. Workspace navigation

- **Primary** (sidebar) sets the top-level route; **contextual** (tabs,
  breadcrumb) moves within it; **ambient** (palette, search, deep links) jumps
  anywhere.
- **Restore-on-open:** opening Sidra optionally restores the last route
  (preference); default is Dashboard (`10 §1`).
- **Cross-links are routes:** e.g. an `AgentCard`'s "current mission" link is a
  typed `navigate.mission(id)`; a mission timeline entry's "open event" is
  `navigate.events({correlation})`. No ad-hoc navigation.

---

## 6. Acceptance criteria (routing)

1. Every page and addressable overlay has a typed, deep-linkable route; chrome
   never unmounts on navigation.
2. Back/forward traverse the intra-app stack; overlays dismiss before pages;
   list filters survive a detail round-trip.
3. A deep link to a permitted entity opens it directly; to an unpermitted one,
   an explanation view (never a crash/blank).
4. External `sidra://` handoff maps to the correct route or a safe fallback.
5. Unsaved-draft navigation prompts before discarding.
6. The route table matches the Navigation Tree (`14`) exactly.
