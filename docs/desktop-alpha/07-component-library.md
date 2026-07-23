# Component Library

Reusable components for Sprint 1. Each is specified as **purpose · key props ·
states · a11y · notes**. Components are **presentational and data-agnostic**:
they receive DTO-shaped props and emit intent callbacks; they never call IPC
directly (containers/pages wire data → components). This keeps them testable and
keeps the "UI owns no truth" rule intact.

Organized as **Primitives → Composite → Domain → Shell** layers. A component in a
lower layer never imports a higher one.

Convention: all interactive components accept `permission?: PermissionState`
(`enabled | disabled | hidden | explain`) so permission-aware rendering (ADR-0085)
is uniform.

---

## 1. Primitives

| Component | Purpose | Key props | States | A11y |
|---|---|---|---|---|
| `Button` | actions | `variant(primary/secondary/ghost/danger/link)`, `size`, `icon`, `loading`, `disabled`, `permission`, `onClick` | default/hover/active/focus/loading/disabled | role=button; label; disabled reason via `aria-describedby` |
| `IconButton` | icon-only action | `icon`, `label(required)`, `size`, `variant`, `permission` | as Button | `aria-label` required |
| `Input` / `Textarea` | text entry | `value`, `onChange`, `invalid`, `hint`, `prefix/suffix`, `size` | default/focus/invalid/disabled/readonly | label association; `aria-invalid`; hint via `aria-describedby` |
| `Select` / `Combobox` | choice | `options`, `value`, `searchable`, `multi` | +open/typeahead | listbox roles; keyboard nav |
| `Checkbox` / `Radio` / `Switch` | toggles | `checked`, `onChange`, `label` | +indeterminate | proper roles; label |
| `Badge` | status/count label | `tone(neutral/success/warning/danger/info)`, `variant(soft/solid/outline)` | — | not focusable; text or `aria-label` |
| `Chip` / `Tag` | removable label / filter | `onRemove`, `selected`, `interactive` | selected/hover | button semantics if interactive |
| `Avatar` | seat/agent identity | `name`, `image?`, `status?` | +status dot | `alt`/label |
| `Tooltip` | hover/focus hint | `content`, `placement` | — | `aria-describedby`; keyboard-triggerable |
| `Spinner` / `ProgressBar` / `Skeleton` | loading | `value?`, `indeterminate` | — | `aria-busy`; `role=progressbar` |
| `Icon` | glyph | `name`, `size` | — | decorative by default; labeled when standalone |
| `Kbd` | keyboard hint | `keys` | — | — |
| `Divider`, `Spacer`, `Stack`, `Grid`, `ScrollArea` | layout | tokenized gaps | — | — |

---

## 2. Composite

| Component | Purpose | Key props | States | Notes |
|---|---|---|---|---|
| `Card` | surface container | `header`, `footer`, `padding`, `interactive`, `elevation` | hover(if interactive)/selected | base for all domain cards |
| `MetricWidget` | KPI tile | `label`, `value`, `delta?`, `trend?`, `icon`, `onClick`, `state` | loading/empty/error/ready | used across Dashboard/Analytics |
| `StatusBadge` | lifecycle/health chip | `status`, `pulse?` | — | maps status → tone+icon consistently |
| `Tabs` | in-page sections | `tabs`, `active`, `onChange`, `urlParam` | — | syncs to route param (ADR-0082) |
| `Table` / `DataGrid` | tabular data | `columns`, `rows`, `sort`, `selection`, `virtualized`, `state`, `onRowOpen` | loading/empty/error/ready | sticky header; keyboard rows; virtualized for large sets; internal scroll |
| `Timeline` | ordered events | `items`, `groupBy`, `onItemOpen`, `live` | loading/empty | read-only; deep-links to Event Log |
| `ActivityFeed` | reverse-chron feed | `items`, `live`, `onItemOpen` | loading/empty | prepends via tail |
| `Dialog` | modal decision | `title`, `body`, `actions`, `onClose`, `size` | open/closing | focus trap + restore; Esc closes; `role=dialog` |
| `Sheet` | edge panel | `side`, `open`, `onClose`, `size` | open/closing | used by Notification Center, detail panels |
| `Toast` | transient notice | `tone`, `message`, `action?`, `duration` | — | `aria-live`; stack; pause on hover |
| `EmptyState` | zero-data | `variant(first-run/no-match/degraded)`, `title`, `hint`, `action?` | — | primary action is permission-aware |
| `ErrorState` | failure | `scope(widget/page/fatal)`, `error`, `correlationId`, `onRetry` | — | copyable correlationId |
| `SearchInput` | search entry | `value`, `onChange`, `scope`, `onSubmit` | — | opens overlay from top bar |
| `FilterBar` | list filters | `filters`, `value`, `onChange`, `urlSync` | — | writes URL params |
| `Breadcrumb` | path nav | `segments` | — | nav landmark |
| `Pagination` / `LoadMore` | paging | `page`, `total`, `onChange` | — | keyboard operable |
| `CommandList` | ⌘K/search results | `groups`, `onSelect`, `query` | loading/empty | shared by palette + search |

---

## 3. Domain components

Data-agnostic renderers of platform entities (fed DTOs by containers):

| Component | Renders | Key props | Deep-links to |
|---|---|---|---|
| `MissionCard` | a mission summary | `mission: MissionSummaryDTO`, `actions`, `permission` | `#/missions/:id` |
| `MissionStateChip` | lifecycle state | `state` | — |
| `MissionTimeline` | mission events | `items`, `live` | Event Log |
| `MissionProgress` | tasks/subtasks | `progress: MissionProgressDTO` | agents/artifacts |
| `MissionReplayPlayer` | replay | `replay: ReplayDTO` (driver output) | events |
| `ApprovalPanel` | approve/delegate | `mission`, `actorIsAuthor`, `permission`, `onApprove/onDelegate` | — |
| `AgentCard` | agent summary | `agent: AgentSummaryDTO` | `#/agents/:id` |
| `AgentStatusDot` | live status | `status` | — |
| `DepartmentCard` | department summary | `department: DepartmentSummaryDTO` | `#/departments/:id` |
| `DivisionNode` / `OrgChart` | org structure | `structure: OrgStructureDTO` | divisions/offices |
| `VetoIndicator` | firm-wide veto | `veto: VetoDTO` | — |
| `StandardsList` / `GuardsList` | dept standards/guards | `items` | events |
| `ConnectorCard` | connector + status | `connector: ConnectorDTO` | `#/connectors/:id` |
| `GrantRow` | connector grant | `grant: GrantDTO`, `permission`, `onRevoke` | department |
| `EgressRow` | egress record | `egress: EgressDTO` | Event Log |
| `DocumentCard` / `MemoryResult` | knowledge item + provenance | `doc`, `provenance` | source/event |
| `EventRow` | one event | `event: EventDTO`, `onFollowCorrelation` | related entity |
| `ChainIntegrityBadge` | log integrity | `verdict` (from host) | — |
| `NotificationItem` | one notification | `notification`, `onAct/onOpen/onRead`, `permission` | deep link |
| `ProjectCard` | project summary | `project`, `pinned`, `onPin` | `#/projects/:id` |
| `PermissionGate` | wraps gated affordances | `check`, `children`, `fallback` | — |

> Every domain card is **generic over its DTO** and carries no
> department-specific logic (kernel neutrality, `01` Appendix A §3).

---

## 4. Shell components

| Component | Purpose |
|---|---|
| `AppShell` | the persistent frame (title/side/top/status + outlet) |
| `Sidebar` / `SidebarItem` / `SidebarGroup` | primary navigation (`02 §3`) |
| `TopBar` / `QuickActions` | top bar (`02 §4`) |
| `StatusBar` / `StatusSegment` | live system strip (`02 §5`) |
| `CommandPalette` | ⌘K actions (`02 §8`) |
| `GlobalSearchOverlay` | ⌘/ find (`02 §7`) |
| `NotificationCenter` | notifications sheet (`02 §6`) |
| `ThemeToggle` / `DensityToggle` | appearance switches |
| `Toolbar` | page/section action bar (title + actions + filters) |
| `AppErrorBoundary` / `RouteErrorBoundary` / `WidgetErrorBoundary` | error isolation (`02 §12`) |
| `ShortcutCheatSheet` | `?` overlay |

---

## 5. Component contract rules

1. **Presentational purity.** Components receive data + callbacks; they do not
   call IPC, the query client, or Zustand stores directly. Containers do that.
   (Shell components may read UI stores for chrome state — the one exception.)
2. **Uniform states.** Any data-bearing component accepts a `state` prop and
   renders the five-state contract via shared `Skeleton`/`EmptyState`/`ErrorState`.
3. **Permission-aware by prop.** Interactive components accept `permission` and
   render the four affordance states (ADR-0085); they never make authorization
   decisions.
4. **Token-only styling.** No hard-coded colors/sizes; only design tokens
   (`06`). Every component looks correct in light, dark, and RTL.
5. **Accessible by default.** Each ships correct roles, labels, focus behavior,
   and keyboard operation (`06 §9`); a component that isn't keyboard-operable is
   not "done".
6. **Documented variants.** Each component ships a stories/catalog entry (Sprint 1
   uses a lightweight in-app component gallery route, dev-only) showing every
   state and variant for review.
