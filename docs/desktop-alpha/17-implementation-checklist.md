# Deliverable 9 — Implementation Checklist

A running checklist for Antigravity. Ordered to match the Implementation Plan
(`11`). Check an item only when its acceptance criteria (`16`, IDs referenced)
are demonstrably met. Nothing here authorizes backend changes; MISSING read
models become degraded UI + a filed follow-up (`20`).

## Epic 0 — IPC contract & baseline
- [ ] Host IPC inventoried; Contract Register reconciled (EXISTS/PARTIAL/MISSING). [A1,A8]
- [ ] Stack versions pinned; ADR-0080/82/83/84 amended to any pre-existing choice.
- [ ] Bindings audited; `// TEMP` shims tracked to follow-ups. [A1]
- [ ] `events.tail` + `EventEnvelope` confirmed or interval-fallback-first path built. [A4]
- [ ] CSP + IPC allow-list notes drafted for `tauri.conf.json`. [A6,A7]
- [ ] Backend follow-up tickets filed for every MISSING row. [F3]

## Epic 1 — Design system & tokens
- [ ] Primitive→semantic→component token layers authored (light/dark/high-contrast). [D1]
- [ ] Type/spacing/elevation/radius/icon/motion tokens + reduced-motion. [D5]
- [ ] Contrast validator green (AA) both themes. [D2]
- [ ] ThemeProvider + toggles; live switch + persistence; RTL logical properties. [B5,D6]

## Epic 2 — Component library
- [ ] Primitives complete, keyboard-complete, token-only. [D1,D3]
- [ ] Composite incl. shared Skeleton/EmptyState/ErrorState + DataGrid/Timeline/ActivityFeed. [B6]
- [ ] PermissionGate + uniform `permission` prop. [A2]
- [ ] Dev component gallery exercises every state/variant. [D1..D6]

## Epic 3 — App shell & chrome
- [ ] AppShell grid persistent across navigation. [B1]
- [ ] Sidebar (groups/badges/collapse/g-jumps/permission-hide). [B2]
- [ ] TopBar (breadcrumb/search/quick-actions/avatar). [B4]
- [ ] StatusBar live segments. [B3]
- [ ] Provider stack in normative order + error boundaries. [B6,F2,F5]

## Epic 4 — Data plane
- [ ] ipc.query/command wrappers + correlationId. [A1,A2]
- [ ] QueryClient + key conventions + cache policy. [E1]
- [ ] Tail subscriber + affects→key invalidation map + interval fallback + reconnect sweep. [A4,E4]
- [ ] PermissionProvider + useCan. [A2,F6]
- [ ] Mutation helpers: optimistic + rollback + tail reconcile. [E2,F1,F4]

## Epic 5 — Routing
- [ ] Hash router + typed route table + typed navigate helpers. [E5]
- [ ] Overlay routing with back-first dismissal. [B4,E5]
- [ ] Guards + deep-link resolution (+ sidra:// + unauthorized explanation). [E6]
- [ ] Back/forward stack + filter preservation + unsaved-draft prompt. [E5]

## Epic 6 — Ambient surfaces
- [ ] Command Palette + registry (permission-aware). [B4,A2]
- [ ] Global Search overlay (scoped). [B4]
- [ ] Notification Center + toasts + inline act (broker-gated) + unread badge. [B3,B4,F1]
- [ ] Shortcut registry + `?` cheat sheet + pointer equivalents. [B7]

## Epic 7 — Organization / Departments / Agents
- [ ] Organization: 8 divisions/4 offices; veto non-downgradable; propose-only. [C3]
- [ ] Departments: standards/guards/exchange/agents; install/uninstall/exchange; guard-block display. [C4]
- [ ] Agents: read-only list/detail/activity; real status. [C5]

## Epic 8 — Knowledge / Connectors / Analytics / Event Log / Projects / Settings
- [ ] Knowledge: engine-ranked + provenance; no client re-rank. [C7]
- [ ] Connectors: no credential in renderer; scoped grants; egress read-only; grant/revoke gated. [C8,A7]
- [ ] Analytics: local projections only; no telemetry; themed charts. [C9,A6]
- [ ] Event Log: read-only + integrity badge + correlation-follow + live + export-view. [C10,A5]
- [ ] Projects: counts + pin; degrade to tag-composition if MISSING. [C6,F3]
- [ ] Settings: appearance live+persist; identity read-only; diagnostics no secrets. [C11]

## Epic 9 — Mission Center
- [ ] List + URL-synced filters. [C2,E5]
- [ ] Create wizard → mission.create (broker-gated). [C2,A2]
- [ ] Detail tabs (overview/timeline/progress). [C2]
- [ ] Approval with SoD (author disabled+reason) + delegation. [C2,G2]
- [ ] Replay player (read-only driver output). [C2,A5]
- [ ] Completion view + outcomes/artifacts links. [C2]

## Epic 10 — Dashboard
- [ ] Widget shells + independent boundaries. [B6,C1]
- [ ] 13 modules wired to read models. [C1]
- [ ] Drill-downs + live tail + needs-action prominence. [C1]

## Epic 11 — A11y, degradation, errors, perf, exit
- [ ] Full a11y pass (keyboard/focus/contrast/ARIA/RTL/reduced-motion). [D2,D3,D4,D5,D6]
- [ ] Degradation pass: every MISSING read model degrades, none crash. [F3]
- [ ] Error/recovery pass (10 §8–§9). [F1–F6]
- [ ] Performance pass vs budgets (19). [C1]
- [ ] Architecture Audit (18) green. [G5]
- [ ] Sprint-1 exit criteria G1–G5 met. [G1–G5]

## Global "definition of done" gates (apply to every task)
- [ ] Consumes real IPC read models or a documented degraded fallback + filed ticket.
- [ ] Renders the five-state contract.
- [ ] Permission-aware where it mutates; broker still gates server-side.
- [ ] Keyboard-complete + AA in light/dark/RTL.
- [ ] Adds no authoritative client state; no crate/migration/ADR change.
