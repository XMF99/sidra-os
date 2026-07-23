# App Shell Specification

The persistent chrome that hosts every page. It mounts once and survives
navigation. All behavior below is renderer-only and reads/writes exclusively
through the IPC contract (`01-architecture.md §6`).

---

## 1. Window layout

Single Tauri window, custom title bar (frameless with OS controls), organized as
a fixed grid:

```
┌───────────────────────────────────────────────────────────────────────┐
│ TITLE BAR  · app menu · workspace name · window controls               │  36px
├──────────┬────────────────────────────────────────────────────────────┤
│          │ TOP BAR · breadcrumb · global search · quick actions · avatar│ 52px
│ SIDEBAR  ├────────────────────────────────────────────────────────────┤
│  240px   │                                                            │
│ (collaps.│                     PAGE CONTENT                           │
│  to 64px)│                  (RouteOutlet, scrolls)                    │
│          │                                                            │
├──────────┴────────────────────────────────────────────────────────────┤
│ STATUS BAR · vault/health · event-tail · running missions · sync · env │ 28px
└───────────────────────────────────────────────────────────────────────┘
```

Grid: `[sidebar] [main]` columns; `[titlebar] [topbar] [content] [statusbar]`
rows. Only **content** scrolls; chrome is fixed. Overlays (command palette,
search, notification center, dialogs, sheets) render above via a portal layer.

Min window size 960×640; below that, responsive rules (§10) engage.

---

## 2. Navigation model

- **Primary navigation** = the sidebar (the 11 destinations, `03`).
- **Contextual navigation** = in-page tabs and breadcrumbs (top bar).
- **Ambient navigation** = command palette (⌘K), global search (⌘/), deep links,
  notification "open" actions.
- **History** = intra-app back/forward stack (`09-routing.md §4`); overlays
  participate (Esc/Back closes the top overlay first).

One selected primary destination at a time; the sidebar reflects the active
route. Navigation never unmounts the shell.

---

## 3. Sidebar

- **Structure:** brand/workspace header → primary nav list (11 items, grouped) →
  spacer → pinned projects → footer (user, theme toggle, collapse toggle).
- **Groups:**
  1. *Overview* — Dashboard
  2. *Work* — Mission Center, Projects
  3. *Organization* — Organization, Departments, Agents
  4. *Knowledge* — Knowledge, Connectors
  5. *Insight* — Analytics, Event Log
  6. *System* — Settings
- **Item anatomy:** icon + label + optional count badge (e.g. running missions,
  unread notifications) + active indicator (inset bar). Collapsed mode (64px)
  shows icon only with tooltip.
- **State:** collapsed/expanded persisted in preferences; active item bound to
  route; badges bound to read models (`missions.list` running count, etc.).
- **Permissions:** items whose entire domain is structurally unavailable to the
  actor are **hidden** (ADR-0085). Never render a dead-end page a user can't use.
- **Keyboard:** `g` then a letter jumps to a destination (`g d` Dashboard, `g m`
  Mission Center, …); arrow keys move focus within the list.

---

## 4. Top bar

- **Left:** breadcrumb reflecting the route hierarchy (e.g. `Missions ›
  M-123 › Timeline`); clickable segments.
- **Center:** global search entry (opens the search overlay, §7).
- **Right:** quick-action button (context-aware primary action, e.g. "New
  Mission" on Mission Center), notification bell (unread count → opens center,
  §6), theme quick-toggle, current seat/actor avatar with menu (switch seat,
  lock, sign out).
- Quick actions and the primary action are **permission-aware** (§ADR-0085).

---

## 5. Status bar

Live system strip, all values from read models / the event tail:

| Segment | Source | Behavior |
|---|---|---|
| Vault & health dot | `system.health` | green/amber/red; click → Dashboard System Health |
| Event tail state | tail connection | "live" / "reconnecting…"; click → Event Log |
| Running missions | `missions.list` (running) | count; click → Mission Center filtered to running |
| Running agents | `agents.list` (active) | count; click → Agents |
| Sync state | `system.health.sync` | idle/syncing/conflict; click → relevant surface |
| Environment | `system.info` | e.g. "Local · v4.0-alpha"; static |

The status bar is the always-visible proof that the UI is a live follower of the
log; when the tail drops it is the first place the user sees it.

---

## 6. Notification Center

- **Trigger:** bell in top bar (unread count badge) or ⌘⇧N.
- **Surface:** right-side sheet, list of notifications grouped by *Needs action*
  / *Recent*, from `notifications.list`; unread count from
  `notifications.unreadCount`.
- **Item types:** approval requested, mission completed/failed, guard blocked a
  request, connector grant expiring, structure proposal awaiting Principal,
  delegation requested. Each carries a deep link and, where applicable, an inline
  **action** (`notifications.act`, which dispatches the underlying broker-gated
  command).
- **Actions:** mark read / mark all read (`notifications.markRead[All]`), open
  (deep link), act (approve/deny inline where permitted).
- **Source of truth:** notifications are **projections of events** — the center
  never invents one; acting on one dispatches a normal command.
- **No push telemetry**; local only.

---

## 7. Global Search

- **Trigger:** ⌘/ or the top-bar entry.
- **Surface:** centered overlay with a single input and grouped results from
  `search.global` (a host-side federated query across missions, projects,
  departments, agents, documents/memory, events, connectors).
- **Result groups:** Missions, Projects, Organization, Agents, Knowledge/Docs,
  Events, Connectors, Actions (see below). Each result is a deep link.
- **Scoping:** results respect the actor's visibility (host filters by
  permission); the UI shows only what the actor may see.
- **Keyboard:** type to filter; ↑/↓ to move; ↵ to open; ⌘↵ opens in a new
  overlay/detail without leaving context.

**Command Palette vs Global Search:** two overlays, one input pattern.
- **Command Palette (⌘K)** = *do things* (actions/navigation): "New Mission",
  "Go to Departments", "Toggle theme", "Approve M-123". Actions are
  permission-aware and dispatch commands.
- **Global Search (⌘/)** = *find things* (data): entities and documents.
- Each can pivot to the other (a leading `>` in search switches to commands; a
  leading `?` in the palette switches to search), so the muscle memory is
  forgiving.

---

## 8. Command Palette

- **Trigger:** ⌘K.
- **Contents:** navigation commands (jump to any page/entity), action commands
  (context + global), recent destinations, and quick settings (theme, density).
- **Registration:** a `ShortcutRegistry`/command registry (`01 §8`) that pages
  contribute to on mount (e.g. Mission Center registers "New Mission",
  "Filter: running").
- **Permission-aware:** disallowed actions are hidden or shown-disabled with a
  reason (ADR-0085). Selecting an action dispatches the corresponding command.
- **Fuzzy match**, grouped, keyboard-first, closes on Esc/Back.

---

## 9. Theme system

- **Modes:** Light, Dark, System (follows OS). Persisted in preferences.
- **Mechanism:** `data-theme` attribute flip over the token layer (ADR-0084); no
  logic re-render. Optional **high-contrast** variant and **density** (comfortable
  / compact) are additional root attributes.
- **Direction:** `dir=ltr|rtl`, defaulting from locale; logical CSS so RTL is
  first-class (Arabic-first context).
- **Live switching:** toggling theme/density/direction updates instantly with no
  reload; charts and canvases subscribe to the theme token set.

---

## 10. Keyboard shortcuts (global map)

| Shortcut | Action |
|---|---|
| ⌘K | Command palette |
| ⌘/ | Global search |
| ⌘⇧N | Notification center |
| ⌘, | Settings |
| ⌘B | Toggle sidebar |
| ⌘\ | Toggle theme |
| g then d/m/o/e/p/k/c/a/l/s | Go to Dashboard/Missions/Organization/dEpartments/Projects/Knowledge/Connectors/Analytics/event Log/Settings |
| n | Context "new" (New Mission on Mission Center, etc.) |
| ⌘↵ | Confirm primary in dialogs |
| Esc | Close top overlay / cancel |
| ⌘F | Find within current page |
| ⌘R | Revalidate current page's data (manual refresh) |
| ? | Shortcut cheat-sheet overlay |

Shortcuts are registered centrally and shown in the `?` cheat sheet; page-local
shortcuts register/deregister with the page. Conflicts resolve to the most
specific (focused element) handler. All shortcuts have a pointer equivalent
(no keyboard-only actions) for accessibility.

---

## 11. Responsive behavior

Desktop-first, but the single window resizes:

| Width | Behavior |
|---|---|
| ≥ 1280px | Full layout; sidebar expanded; multi-column dashboards & detail split-panes |
| 1024–1279px | Sidebar auto-collapses to icons; detail panes stack to tabs |
| 768–1023px | Sidebar becomes an overlay drawer (⌘B); grids drop to single column; top-bar search collapses to an icon |
| < 768px (rare; small window) | Compact mode: drawer nav, single-column everything, status bar condenses to a health dot + tail dot |

Breakpoints are token-driven (`--sd-bp-*`). No layout requires horizontal
scrolling of the whole page. Data grids scroll internally with sticky headers.

---

## 12. Cross-cutting UI states (loading / empty / error)

Every data surface implements the same three-state contract so the shell feels
coherent. Components take a `state` derived from the query (`loading | empty |
error | ready | degraded`).

### 12.1 Loading states
- **Skeletons** matching the final layout (not spinners) for first load;
  themed via tokens. Cards, grids, timelines each have a skeleton variant.
- **Inline refresh**: on background revalidation, keep stale content with a
  subtle "updating" affordance (never blank the screen on refetch).
- **Progressive**: chrome renders immediately; each widget resolves
  independently (per-widget suspense boundaries) so one slow query never blocks
  the shell.

### 12.2 Empty states
- Distinguish **"nothing yet"** (first-run, no missions ever) from **"nothing
  matches"** (filter/search empty). Each has: an illustration slot, a one-line
  explanation, and a **primary next action** where the actor is permitted
  (e.g. "Create your first mission"). If not permitted, explain who can.
- First-run empty states double as **onboarding hints** for Opening Sidra
  (`10-ux-flows.md §1`).

### 12.3 Error states
- **Scope-isolated:** a widget error shows an inline error card with **Retry**
  and a copyable `correlationId`; siblings stay live (per-widget error
  boundaries).
- **Page error:** a page-level boundary renders a recoverable page-error view
  (retry, go back, open Event Log) without killing chrome.
- **Permission denial** is *not* an error state — it renders as an explainable
  dialog/inline note (ADR-0085).
- **Degraded (MISSING read model):** a neutral "not available in this build"
  panel with a note, never a crash.
- **Fatal (Vault unreachable at boot):** full-screen recoverable error with
  diagnostics and a "retry / open logs" affordance.

### 12.4 State-selection rule
`error → degraded → loading(first) → empty → ready`, evaluated in that
precedence, so a surface never shows two states at once.

---

## 13. Acceptance criteria (App Shell)

1. Chrome (title/side/top/status bars) mounts once and does not unmount across
   any navigation; only the page outlet changes.
2. Sidebar reflects active route, collapses/expands with persistence, hides
   structurally-unavailable destinations, and exposes `g`-jump shortcuts.
3. Status bar shows live vault health, event-tail state, running mission/agent
   counts, and sync state, each updating from the tail without polling.
4. ⌘K, ⌘/, ⌘⇧N open command palette, search, and notification center
   respectively; Esc/Back closes the top overlay before navigating.
5. Theme (light/dark/system), density, and direction (LTR/RTL) switch live with
   no reload and correct contrast in both themes.
6. Every data surface renders the five-state contract; a single widget failure
   never blanks the shell.
7. All global shortcuts have pointer equivalents; the `?` sheet lists them.
8. No credential or secret value is ever present in any shell surface.
