# Deliverable 4 — Component Tree

The runtime composition. Providers wrap once; `AppShell` is persistent; the
`RouteOutlet` swaps pages. Domain/composite/primitive components compose within
pages. (Names match `07-component-library.md` and `12-folder-structure.md`.)

```mermaid
graph TD
  Root["main.tsx"] --> Bridge["TauriBridgeProvider (IPC + tail)"]
  Bridge --> I18n["I18nRtlProvider"]
  I18n --> Theme["ThemeProvider"]
  Theme --> Query["QueryProvider"]
  Query --> Perm["PermissionProvider"]
  Perm --> Short["ShortcutRegistryProvider"]
  Short --> Notif["NotificationProvider"]
  Notif --> AEB["AppErrorBoundary"]
  AEB --> RouterP["RouterProvider (hash)"]
  RouterP --> Shell["AppShell (persistent)"]

  Shell --> TitleBar
  Shell --> Sidebar
  Shell --> TopBar
  Shell --> StatusBar
  Shell --> Portals["Portal layer"]
  Shell --> Outlet["RouteOutlet (page plane)"]

  Sidebar --> SGroup["SidebarGroup"] --> SItem["SidebarItem (badge, active, g-jump)"]
  TopBar --> Breadcrumb
  TopBar --> SearchEntry["SearchInput → GlobalSearchOverlay"]
  TopBar --> QuickActions["QuickActions (permission-aware)"]
  TopBar --> AvatarMenu["Avatar + seat menu"]
  StatusBar --> Seg["StatusSegment ×6 (tail-driven)"]

  Portals --> CmdPalette["CommandPalette (⌘K) → CommandList"]
  Portals --> SearchOv["GlobalSearchOverlay (⌘/) → CommandList"]
  Portals --> NotifCenter["NotificationCenter (Sheet) → NotificationItem*"]
  Portals --> Dialogs["Dialog / Sheet stack"]
  Portals --> Cheat["ShortcutCheatSheet (?)"]
  Portals --> Toasts["Toast stack (aria-live)"]

  Outlet --> REB["RouteErrorBoundary"] --> Page

  Page --> Dashboard
  Page --> MissionCenter
  Page --> Organization
  Page --> Departments
  Page --> Agents
  Page --> Projects
  Page --> Knowledge
  Page --> Connectors
  Page --> Analytics
  Page --> EventLog
  Page --> Settings

  Dashboard --> WEB["WidgetErrorBoundary (per widget)"]
  WEB --> Widgets["13 modules: SystemHealth, RunningMissions,\nRunningAgents, RecentActivity, Performance,\nQuickActions, PinnedProjects, Notifications,\nRecentDocuments, MemoryOverview, MissionOverview,\nDailySummary, AttentionBadge"]
  Widgets --> MetricWidget & MissionCard & AgentCard & ActivityFeed & NotificationItem & ProjectCard & DocumentCard

  MissionCenter --> MList["MissionList → FilterBar + DataGrid(MissionCard rows)"]
  MissionCenter --> MDetail["MissionDetail → Tabs"]
  MDetail --> MOverview["Overview → StatusBadge + ApprovalPanel + MissionProgress(graph)"]
  MDetail --> MTimeline["Timeline → MissionTimeline"]
  MDetail --> MProgressT["Progress → MissionProgress"]
  MDetail --> MReplay["Replay → MissionReplayPlayer"]
  MDetail --> MApprovals["Approvals → ApprovalPanel + delegation list"]
  MissionCenter --> Wizard["CreateMissionWizard (overlay route)"]

  Organization --> OrgChart --> DivisionNode
  Organization --> VetoIndicator
  Organization --> Proposals["ProposalList/Detail (propose-only)"]
  Departments --> DGrid["DepartmentGrid → DepartmentCard*"]
  Departments --> DDetail["DepartmentDetail → Tabs(StandardsList, GuardsList, Exchange, Agents)"]
  Agents --> AGrid["AgentList → AgentCard* (AgentStatusDot)"]
  Agents --> ADetail["AgentDetail → Tabs(overview, ActivityFeed, tools)"]
  Projects --> PGrid["ProjectList → ProjectCard*"]
  Projects --> PDetail["ProjectDetail → Tabs(missions, documents, activity)"]
  Knowledge --> KSearch["KnowledgeSearch → SearchInput + MemoryResult*"]
  Knowledge --> KDoc["DocumentDetail (provenance)"]
  Connectors --> CList["ConnectorList → ConnectorCard*"]
  Connectors --> CDetail["ConnectorDetail → Tabs(overview, GrantRow*, EgressRow*)"]
  Analytics --> Charts["MetricWidget* + theme-aware charts + FilterBar"]
  EventLog --> ELog["FilterBar + DataGrid(EventRow*) + ChainIntegrityBadge (read-only)"]
  Settings --> SSections["Sections: Appearance, Shortcuts, Notifications, Identity(read-only), Diagnostics, About"]

  subgraph Shared["Shared building blocks (used everywhere)"]
    Prim["Primitives: Button, IconButton, Input, Select, Badge, Chip, Avatar,\nTooltip, Spinner, ProgressBar, Skeleton, Icon, Kbd, layout"]
    Comp["Composite: Card, MetricWidget, StatusBadge, Tabs, DataGrid, Timeline,\nActivityFeed, Dialog, Sheet, Toast, EmptyState, ErrorState, FilterBar, Breadcrumb, CommandList"]
    Gate["PermissionGate (ADR-0085)"]
    States["Five-state renderers: Skeleton / EmptyState / ErrorState"]
  end
```

**Reading the tree.**
- **Persistent vs swapped:** everything from `AppShell` down *except* `Outlet →
  Page` is persistent; only `Page` changes on navigation.
- **Error isolation:** `AppErrorBoundary` (outside router) → `RouteErrorBoundary`
  (per page) → `WidgetErrorBoundary` (per dashboard widget). A crash is contained
  at the tightest boundary.
- **Data flow:** pages (containers) call `data/` (IPC + Query) and pass DTOs +
  callbacks into `components/`; components never fetch (`07 §5`). The `Shared`
  block is imported by every page but imports nothing above the primitive layer.
- **Permission-aware nodes:** every mutating leaf (QuickActions, ApprovalPanel,
  GrantRow, NotificationItem action, wizard submit, propose actions) is wrapped by
  or consumes `PermissionGate`.
