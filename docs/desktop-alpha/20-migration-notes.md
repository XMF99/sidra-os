# Deliverable 12 — Migration Notes

How Sprint 1 lands on the existing tree **without a breaking change**, and how the
gaps it cannot fix itself are handed back to the backend. Two audiences: the
Principal (what changes, what's deferred) and Antigravity (how to migrate the
existing `apps/desktop/src` safely).

---

## 1. What changes, and where (scope of change)

| Area | Change | Breaking? |
|---|---|---|
| `apps/desktop/src` | New `app/`, `pages/`, `components/`, `data/`, `state/`, `design/`, `routes/`, `i18n/`; existing `rooms/` retired incrementally | No — additive, then swap |
| `apps/desktop/src-tauri/src/ipc.rs` | **Reconciled** (Epic 0), not rewritten; possibly small additive query/command handlers *only if a follow-up is approved separately* | No (Sprint 1 assumes no new handler; see §4) |
| `apps/desktop/tauri.conf.json` | Tightened CSP + IPC allow-list | No (hardening; validate on all engines) |
| `packages/bindings` | **Consumed**, not edited by Sprint 1; new DTOs are a backend follow-up | No |
| Any `services/*`, migration, `Cargo.toml` members, CI gates | **None** | — |

**Nothing** outside `apps/desktop/` is modified by Sprint 1. That is the hard
line the STEP-1 gate (`00`) enforces.

---

## 2. Migrating the existing "rooms" shell (incremental, always-buildable)

1. **Stand up the new foundation alongside the old.** Add `design/tokens`,
   `components/`, `data/`, `state/`, `routes/`, and `app/AppShell` while `rooms/`
   still renders. The app stays buildable and runnable throughout.
2. **Introduce the router** (`routes/`) mounting `AppShell`; route the first page
   (Dashboard) into it while remaining rooms stay reachable via a temporary
   fallback route.
3. **Port page by page** in the plan's order (Epics 7–10). As each page lands in
   `pages/`, delete its `rooms/` predecessor. Keep the temporary fallback until
   the last room is ported.
4. **Remove the fallback** and any dead `rooms/` code once all 11 pages exist.
5. **Reconcile the shell entry** (`main.tsx`) to the provider stack order
   (`01 §8`).

No big-bang rewrite; the working tree stays green (matching the repo's current
BUILD GREEN / TESTS GREEN posture per `final-verification-audit.md`).

---

## 3. Data & persistence migration

- **No schema/migration change.** Sprint 1 reads existing projections and writes
  existing events via existing commands.
- **New local preference file** (theme/density/pins/last-route) is created on
  first run; absence → defaults. This is *not* a platform migration — it is a UI
  preference store (`08 §8`), safe to delete.
- **Query cache** is disposable; no migration concerns.

---

## 4. Backend follow-up tickets (the honest gap list)

Where a page needs a read model or capability that the current backend does not
expose, Sprint 1 ships a **labeled degraded state** and files a follow-up. These
are **not** part of Sprint 1's code (no crate change here); they are the ordered
backlog that lifts the UX ceiling in later sprints. Epic 0 confirms which are
actually needed.

| ID | Follow-up (backend) | Blocks (UI degrades to) | Priority |
|---|---|---|---|
| BE-1 | `events.tail` push channel + `EventEnvelope` | live updates → interval polling | High |
| BE-2 | `permissions.forActor` / batch `permissions.check` | rich affordance → explain-on-attempt | High |
| BE-3 | `missions.replay` read model from the replay driver | Replay tab → degraded panel | High |
| BE-4 | `projects.*` aggregate read model | Projects → tag-composition of missions+docs | Medium |
| BE-5 | `analytics.performance/missionStats/dailySummary` projections | Analytics/Daily Summary → partial/degraded | Medium |
| BE-6 | `search.global` federated query | Global Search → per-domain search only | Medium |
| BE-7 | `notifications.*` projection + `notifications.act` | Notification Center → derived-from-events read-only | Medium |
| BE-8 | Capability annotations on DTOs (inline `canX` flags) | per-item affordance → page-level checks | Low |
| BE-9 | `memory.recentDocuments` / provenance fields | Recent Docs / provenance → degraded | Low |

**Rule:** a follow-up is never silently pre-implemented in the UI. Each MISSING
row is visible to the user (degraded state) and to the team (this table).

---

## 5. Configuration & security migration

- **CSP:** move `tauri.conf.json` to a strict policy — local assets only, no
  remote script, no `eval`. Validate the app still loads on WebView2/WKWebView/
  WebKitGTK (R5). Deliver as a reviewed config change, not a code change.
- **IPC allow-list:** expose only the commands/queries in the Contract Register;
  reject anything else at the host boundary.
- **No new network egress** is introduced; the only egress remains connector
  custody (server-side) and the existing signed-update channel (ADR-0009 intact).

---

## 6. Rollback

Because Sprint 1 is additive under `apps/desktop/` and touches no crate/migration:

- **Rollback = revert the `apps/desktop` UI commits.** The backend is untouched,
  so there is nothing to un-migrate. The preference file can be deleted with no
  effect on platform state.
- **Partial rollback** (per page) is possible during the incremental migration
  because the temporary fallback route keeps prior surfaces reachable until the
  last page is ported.

---

## 7. Post-Sprint-1 handoff

On Sprint-1 completion: mark the Desktop Alpha shell milestone status per the
registry rules; copy ADR-0080–0086 into `docs-v2/adr/` and mark them Accepted
(numbering assumed contiguous after 0079 — **confirm against the live ADR index
in Epic 0** and renumber if the repo has already consumed 0080+); and open the
BE-1…BE-9 follow-ups as the first backlog of the next sprint. **The next step
after this package is implementation only.**
