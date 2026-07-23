# Deliverable 2 — Implementation Plan

Epics → tasks → subtasks for Antigravity. **Architecture-only package; this plan
sequences implementation but produces no code here.** All work is confined to
`apps/desktop/` (renderer + host IPC surface). **No crate, migration, schema, or
existing ADR changes.** Where a needed read model is absent, the task closes as a
**degraded UI + a backend follow-up ticket** (`20-migration-notes.md`), never a
bypass.

Ordering principle: **foundation before pages; Dashboard and Mission Center last**
because they compose everything. The last epic's final task is the Sprint-1 exit
criterion (`16`).

---

## Epic 0 — Reconcile the IPC contract & baseline (must precede all UI work)

- **T0.1 Inventory host IPC.** Enumerate real commands/queries in
  `apps/desktop/src-tauri/src/ipc.rs`; map each to the Contract Register
  (`01 §6.2`). Mark every row `EXISTS / PARTIAL / MISSING`.
  - Subtasks: list handlers; diff against register; produce the reconciled
    register table; open backend follow-up tickets for MISSING rows.
- **T0.2 Pin the stack.** Record exact React/TS/Tauri/Vite versions from
  `package.json`; adopt as baseline; confirm any already-present router/store/CSS
  choice and amend ADR-0080/0082/0083/0084 to match reality if it diverges.
- **T0.3 Bindings check.** Confirm `packages/bindings` generation; list DTOs that
  exist vs the register; add `// TEMP` shims only where bindings are missing,
  each tied to a follow-up.
- **T0.4 Event tail.** Confirm/define the `events.tail` channel + `EventEnvelope`
  shape; if absent, file a backend follow-up and implement the interval-fallback
  path first so the UI works without the tail.
- **T0.5 CSP & IPC allow-list.** Draft the tightened `tauri.conf.json` CSP and
  the exposed command allow-list (delivered as config change notes in `20`, not
  applied to crates).
- **Exit:** a reconciled Contract Register with degradation decisions recorded;
  no UI task starts against an unverified assumption.

## Epic 1 — Design system & tokens

- **T1.1** Author the token layer (primitive→semantic→component) as CSS custom
  properties; light/dark/high-contrast; density; RTL logical properties (`06`).
- **T1.2** Typography, spacing, elevation, radius, icon set selection, motion
  tokens + reduced-motion.
- **T1.3** Contrast validator (build/lint check) proving AA in both themes.
- **T1.4** `ThemeProvider` + toggles; live switching, persistence.
- **Exit:** tokens drive everything; a demo screen passes AA in light+dark+RTL.

## Epic 2 — Component library

- **T2.1** Primitives (`07 §1`).
- **T2.2** Composite (`07 §2`), including the shared five-state renderers
  (`Skeleton/EmptyState/ErrorState`) and `DataGrid`/`Timeline`/`ActivityFeed`.
- **T2.3** `PermissionGate` + the uniform `permission` prop contract (ADR-0085).
- **T2.4** Dev-only component gallery route (`#/dev/gallery`) exercising every
  state/variant.
- **Exit:** every component renders all states in light/dark/RTL, keyboard-
  complete, token-only.

## Epic 3 — App shell & chrome

- **T3.1** `AppShell` grid (title/side/top/status + outlet); persistent mount.
- **T3.2** `Sidebar` (groups, badges, collapse, `g`-jumps, permission-hide).
- **T3.3** `TopBar` (breadcrumb, search entry, quick actions, avatar menu).
- **T3.4** `StatusBar` (live segments from tail).
- **T3.5** Provider stack in the normative order (`01 §8`); error boundaries.
- **Exit:** chrome persists across navigation; `02` acceptance criteria pass with
  mock data.

## Epic 4 — Data plane

- **T4.1** IPC client wrappers (`ipc.query/command`) with typed DTOs + correlationId.
- **T4.2** `QueryClient` setup; key conventions; cache policy defaults.
- **T4.3** Event-tail subscriber + the `affects`→query-key invalidation map
  (`08 §4`), with interval fallback + reconnect sweep.
- **T4.4** `PermissionProvider` (`permissions.forActor`, `useCan`).
- **T4.5** Mutation helpers with optimistic patch + rollback + tail reconciliation.
- **Exit:** a sample page reads live and updates via the tail without polling;
  denial and rollback behave per `08 §5`.

## Epic 5 — Routing

- **T5.1** Hash router + typed route table (`09 §2`) + typed navigation helpers.
- **T5.2** Overlay routing (palette/search/notifications/wizard/sheets) with
  back-first dismissal.
- **T5.3** Guards (authed + capability), deep-link resolution incl. external
  `sidra://` mapping and unauthorized-target explanation.
- **T5.4** Back/forward stack, filter-preservation, unsaved-draft prompt.
- **Exit:** `09` acceptance criteria pass.

## Epic 6 — Ambient surfaces

- **T6.1** Command Palette (⌘K) + command registry (page contributions,
  permission-aware).
- **T6.2** Global Search overlay (⌘/) → `search.global`, grouped, scoped.
- **T6.3** Notification Center + toast bus; `notifications.*`; inline act
  (broker-gated); unread badge wired to top bar + Dashboard.
- **T6.4** Shortcut registry + `?` cheat sheet; ensure pointer equivalents.
- **Exit:** `02 §6–§10` acceptance criteria pass.

## Epic 7 — Pages: Organization, Departments, Agents

- **T7.1** Organization (org chart, divisions/offices, vetoes, proposals —
  propose-only). 
- **T7.2** Departments (grid, detail tabs: standards/guards/exchange/agents;
  install/uninstall/exchange requests, guard-block display).
- **T7.3** Agents (list, detail, activity; read-only).
- **Exit:** `03 §3–§5` acceptance criteria pass; author-never-enacts preserved.

## Epic 8 — Pages: Knowledge, Connectors, Analytics, Event Log, Projects, Settings

- **T8.1** Knowledge (search + provenance + doc detail; no client re-rank).
- **T8.2** Connectors (list/detail/grants/egress; grant/revoke; **no credential
  in renderer**).
- **T8.3** Analytics (charts from local projections; no telemetry).
- **T8.4** Event Log (read-only viewer; chain-integrity badge; correlation
  follow; live tail; export-of-view).
- **T8.5** Projects (list/detail/pin; degrade to tag-composition if aggregate
  MISSING).
- **T8.6** Settings (appearance/shortcuts/notifications/identity/diagnostics/about).
- **Exit:** `03 §6–§11` acceptance criteria pass; ADR-0034/0086/0009 upheld.

## Epic 9 — Mission Center (composes everything)

- **T9.1** Mission list + filters (URL-synced).
- **T9.2** Create wizard → `mission.create` (broker-gated).
- **T9.3** Detail tabs: overview (state+actions), timeline, progress.
- **T9.4** Approval (SoD: author-cannot-approve shown-disabled + reason),
  delegation.
- **T9.5** Replay player over `missions.replay` (read-only, driver output).
- **T9.6** Completion view + outcomes/artifacts links.
- **Exit:** `05 §12` acceptance criteria pass.

## Epic 10 — Dashboard (composes everything)

- **T10.1** Widget shells + independent resolution/boundaries.
- **T10.2** The 13 modules wired to their read models (`04`).
- **T10.3** Drill-downs, live tail updates, needs-action prominence.
- **Exit:** `04` page-level acceptance criteria pass.

## Epic 11 — Accessibility, polish, hardening & Sprint exit

- **T11.1** Full a11y pass (keyboard, focus, contrast, ARIA, RTL, reduced motion)
  against `06 §9`.
- **T11.2** Degradation pass: verify every MISSING read model degrades, never
  crashes; confirm all follow-up tickets filed.
- **T11.3** Error/recovery pass: exercise `10 §8–§9`.
- **T11.4** Performance pass against budgets (`19`).
- **T11.5** **Architecture Audit** (`18`) green; **Implementation Checklist**
  (`17`) complete.
- **Exit (Sprint-1 exit criterion):** the shell renders all 11 pages from IPC
  read models, every mutation is broker-gated, the tail drives invalidation, no
  UI-local authoritative state exists, degradation/error/recovery all work, and
  `18` is green.

---

## Sequencing & parallelism

```
Epic 0 ─► Epic 1 ─► Epic 2 ─┬─► Epic 3 ─► Epic 5 ─► Epic 6 ─┐
                            └─► Epic 4 ──────────────────────┼─► Epic 7 ─┐
                                                             │           ├─► Epic 9 ─► Epic 10 ─► Epic 11
                                                             └─► Epic 8 ─┘
```

Epics 1–2 gate all UI. Epics 3–6 (shell+data+routing+ambient) can partly overlap
once tokens/components exist. Pages (7–8) parallelize across developers. Mission
Center (9) and Dashboard (10) come last because they consume pages, components,
and the data plane. Epic 11 is the exit gate.

## Definition of Done (every task)

A task is done only when: it consumes real IPC read models (or a documented
degraded fallback + filed ticket); renders the five-state contract; is
permission-aware where it mutates; is keyboard-complete and AA in light/dark/RTL;
adds no authoritative client state; and its slice of `16-acceptance-criteria.md`
and `17-implementation-checklist.md` is checked.
