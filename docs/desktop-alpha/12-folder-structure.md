# Deliverable 3 — Folder Structure

All new work lives under **`apps/desktop/`**. Nothing outside it is added or
changed. The layout below extends the existing Tauri app; the current `rooms/`
skeleton is superseded by `app/` + `pages/` (migration in `20`).

```
apps/desktop/
├─ src-tauri/                      # Rust host — IPC surface only (no new crate)
│  ├─ src/
│  │  ├─ ipc.rs                    # (existing) command/query handlers — reconciled in Epic 0
│  │  ├─ main.rs                   # (existing) app bootstrap, persistent Vault
│  │  └─ …                         # unchanged host modules
│  └─ tauri.conf.json              # CSP + IPC allow-list tightened (notes in 20-migration-notes)
│
└─ src/                            # Renderer — React/TS (all Sprint-1 UI)
   ├─ app/                         # shell composition & providers
   │  ├─ AppShell.tsx              # persistent chrome (grid + outlet)
   │  ├─ providers/                # provider stack (01 §8)
   │  │  ├─ TauriBridgeProvider.tsx
   │  │  ├─ I18nRtlProvider.tsx
   │  │  ├─ ThemeProvider.tsx
   │  │  ├─ QueryProvider.tsx
   │  │  ├─ PermissionProvider.tsx
   │  │  ├─ ShortcutRegistryProvider.tsx
   │  │  └─ NotificationProvider.tsx
   │  ├─ boundaries/               # AppErrorBoundary / RouteErrorBoundary / WidgetErrorBoundary
   │  └─ shell/                    # Sidebar, TopBar, StatusBar, CommandPalette,
   │                               #   GlobalSearchOverlay, NotificationCenter, ShortcutCheatSheet
   │
   ├─ routes/                      # routing (ADR-0082)
   │  ├─ router.tsx                # hash router + RouteOutlet
   │  ├─ routeTable.ts             # typed route table (single source for Nav Tree)
   │  ├─ navigate.ts               # typed navigation helpers
   │  ├─ guards.ts                 # authed + capability guards
   │  └─ deepLink.ts               # sidra:// → hash mapping
   │
   ├─ pages/                       # one folder per page (containers + local views)
   │  ├─ dashboard/                # + widgets/ (13 modules)
   │  ├─ missions/                 # list, detail(tabs), wizard, replay
   │  ├─ organization/
   │  ├─ departments/
   │  ├─ agents/
   │  ├─ projects/
   │  ├─ knowledge/
   │  ├─ connectors/
   │  ├─ analytics/
   │  ├─ events/                   # Event Log viewer (read-only)
   │  ├─ settings/
   │  └─ dev/gallery/              # dev-only component gallery
   │
   ├─ components/                  # presentational library (07)
   │  ├─ primitives/
   │  ├─ composite/
   │  └─ domain/                   # MissionCard, AgentCard, DepartmentCard, EventRow, …
   │
   ├─ data/                        # data plane (08)
   │  ├─ ipc.ts                    # ipc.query / ipc.command wrappers
   │  ├─ queryClient.ts            # TanStack Query config + key conventions
   │  ├─ keys.ts                   # query-key factories
   │  ├─ tail.ts                   # events.tail subscriber
   │  ├─ invalidationMap.ts        # affects → query-key map (08 §4)
   │  ├─ permissions.ts            # useCan / permission cache
   │  └─ mutations.ts              # optimistic + rollback helpers
   │
   ├─ state/                       # UI state (Zustand, 08)
   │  ├─ uiStore.ts
   │  ├─ commandStore.ts
   │  ├─ notificationStore.ts
   │  ├─ selectionStore.ts
   │  └─ preferences.ts            # persisted (settings.get/set)
   │
   ├─ design/                      # design system (06)
   │  ├─ tokens/                   # primitive.css, semantic.light.css, semantic.dark.css, component.css
   │  ├─ theme.ts                  # theme/density/direction switching
   │  ├─ icons.ts                  # icon set wrapper
   │  └─ chartTheme.ts             # theme-aware categorical series tokens
   │
   ├─ types/                       # DTO types (re-exported from packages/bindings) + view models
   ├─ lib/                         # pure helpers (formatting, dates, humanize-event)
   ├─ i18n/                        # locale resources (en, ar), RTL config
   └─ styles/                      # global.css (token roots, resets, base)
```

**Rules.** (1) `components/` is presentational — no IPC imports (`07 §5`).
(2) `pages/` containers wire `data/` → `components/`. (3) `data/` is the only
place IPC is called. (4) `design/tokens` is the only place raw colors/sizes
appear. (5) Nothing here imports from `services/*` — the only inbound edge is the
IPC contract at `src-tauri/src/ipc.rs`. (6) No file is added outside
`apps/desktop/`.
