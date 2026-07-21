# Component Library

Forty-eight components in five tiers. Every one specifies props, states, keyboard behaviour, and
accessibility. Nothing ships without all four.

Convention: all components consume tokens only; none accepts a raw color, size, or duration.

---

## Tier 1 — Primitives (13)

| # | Component | Props | States | Keyboard | Notes |
|---|---|---|---|---|---|
| 1 | `Button` | `variant: primary\|secondary\|ghost\|danger`, `size: sm\|md`, `icon`, `loading`, `disabled` | default, hover, active, focus, loading, disabled | Enter/Space | Primary is brass fill + inverse text. Loading keeps its width to prevent layout shift |
| 2 | `IconButton` | `icon`, `label` (required), `variant` | as Button | Enter/Space | `label` is required — enforced by types, not convention |
| 3 | `TextField` | `value`, `label`, `hint`, `error`, `prefix`, `suffix`, `mono` | default, focus, invalid, disabled, readonly | standard | Error text replaces hint, never stacks |
| 4 | `TextArea` | + `autoGrow`, `maxRows` | as TextField | ⌘Enter submits | Grows to maxRows then scrolls |
| 5 | `Select` | `options`, `value`, `searchable` | + open | ↑↓ Enter Esc, type-ahead | Radix Select |
| 6 | `Checkbox` / `Radio` / `Switch` | `checked`, `label`, `indeterminate` | + focus-visible | Space | Switch is for immediate effects only |
| 7 | `Menu` | `items`, `trigger`, `align` | + open, submenu | ↑↓ → ← Enter Esc | Radix DropdownMenu; shortcuts shown right-aligned |
| 8 | `Tooltip` | `content`, `shortcut`, `delay=600` | — | shows on focus too | Never carries information available nowhere else |
| 9 | `Dialog` | `title`, `description`, `size` | open, closing | Esc, focus trap | Used sparingly; blocking interactions only |
| 10 | `Popover` | `anchor`, `placement` | open | Esc, click-outside | Glass surface |
| 11 | `Tabs` | `items`, `value`, `orientation` | + active | ←→ Home End | Underline in brass, 2 px |
| 12 | `Badge` | `tone: neutral\|ok\|warn\|danger\|live\|dissent`, `glyph` | — | — | Always glyph + label, never color alone |
| 13 | `Kbd` | `keys[]` | — | — | Renders platform-correct glyphs (⌘/Ctrl) |

## Tier 2 — Surfaces (8)

| # | Component | Props | Behaviour |
|---|---|---|---|
| 14 | `Panel` | `min`, `max`, `defaultSize`, `collapsible`, `side`, `persistKey` | Resizable with an 8 px hit target; double-click divider resets; size persists per room; collapse animates to 0 with a re-open affordance |
| 15 | `GlassCard` | `elevation`, `interactive` | The glass recipe; interactive adds a hairline-strong border on hover |
| 16 | `Sheet` | `side: right\|bottom`, `size`, `dismissible` | Slides from its edge; used for Approvals and Mandate previews |
| 17 | `Drawer` | `side: left` | Sidebar overlay on narrow windows |
| 18 | `Inspector` | `subject` | Right panel; renders provenance for any selectable subject; ⌘I toggles |
| 19 | `EmptyState` | `title`, `body`, `action` | One sentence, one action. Never an illustration |
| 20 | `ErrorState` | `code`, `message`, `action`, `traceRef` | Code is copyable; action is the suggested fix |
| 21 | `Skeleton` | `variant` | Mirrors the real layout it replaces, not generic bars |

## Tier 3 — Data display (12)

| # | Component | Props | Behaviour |
|---|---|---|---|
| 22 | `Table` | `columns`, `rows`, `sort`, `density`, `virtualized`, `selection` | Sticky header, resizable columns, tabular numerals, row selection with ↑↓, ⌘A, Shift-range |
| 23 | `Tree` | `nodes`, `expanded`, `onSelect` | Vault file tree; ←→ collapse/expand, type-ahead |
| 24 | `Timeline` | `events`, `groupBy` | The Engagement event log; virtualized, grouped by hour |
| 25 | `DiffView` | `left`, `right`, `mode: structural\|line` | Structural diff for Markdown by heading; line diff for code |
| 26 | `MarkdownView` | `source`, `citations`, `typography: ui\|prose` | Sanitized; `prose` sets Newsreader at 16/26; citations render as superscript chips that open the Inspector |
| 27 | `CodeBlock` | `lang`, `source`, `wrap` | Shiki highlighting with theme tokens; copy button |
| 28 | `CostMeter` | `spent`, `budget`, `live` | Horizontal hairline bar; brass fill; turns amber at 80%, danger at 100%; ticks up live during a Turn |
| 29 | `ConfidenceChip` | `value`, `basis` | `0.78 · 12 sources`. Tooltip explains the basis. Never a bare percentage |
| 30 | `SourceChip` | `sourceRef` | Document title + locator; click opens the source at that page |
| 31 | `Sparkline` | `points`, `tone` | 40×14, no axes, for cost and KPI trends |
| 32 | `KeyValue` | `pairs`, `columns` | Label in `micro` uppercase, value in body or mono |
| 33 | `StatusDot` | `status` | 6 px, paired with a label; the only place color is near-alone, and it always has a text sibling |

## Tier 4 — Agentic (10)

The components that make this product what it is.

| # | Component | Props | Behaviour |
|---|---|---|---|
| 34 | `AgentAvatar` | `agentId`, `size`, `state: idle\|running\|blocked` | Monogram in the agent's hue inside a 1.5 px ring. Running: the ring traces at 1 rev/2 s. Blocked: static amber. Reduced motion: a static filled ring |
| 35 | `AgentCard` | `agentId`, `load`, `kpis` | Name, title, current Work Order, live cost, "Address directly" action |
| 36 | `ProgressSpine` | `steps`, `criticalPath` | The vertical plan view. One node per step with avatar, title, state, elapsed, cost. The critical path is drawn in brass; parallel branches are hairline. Nodes expand in place to show the trace. **This component satisfies UI-06 and replaces every spinner in the product** |
| 37 | `TurnCard` | `turnId`, `expanded` | Model, class, tokens, cost, latency, routing rule number, tool calls. Expands to the full prompt/completion |
| 38 | `TraceView` | `subjectRef` | The provenance tree from §2 of the observability doc. Lazily loaded, virtualized |
| 39 | `BriefView` | `briefId` | The executive document. Newsreader, 72ch, fixed section order, per-finding confidence chips, the single Ask rendered as a distinct block at the bottom with its action inline |
| 40 | `MandatePreview` | `mandate`, `editable` | Every field editable in place; ⌘Enter authorizes; recomputes the plan on objective change |
| 41 | `MeetingTable` | `meetingId` | Attendee cards in an arc, live stance chips, the criteria matrix filling in as scoring proceeds, round indicator. Watchable, never required |
| 42 | `DecisionRecord` | `decisionId` | Question, criteria with weights, options with evidence, choice, rationale, dissents (in the dissent hue), reversibility, review date, supersession chain |
| 43 | `ApprovalSheet` | `requests[]` | Batched. Each: who, what, why, cost/consequence, and what happens if you say no. Actions: Once / This session / Always (class ≤2) / No. `1`–`9` select, ⌘Enter grants all |

## Tier 5 — Overlays and shell (5)

| # | Component | Props | Behaviour |
|---|---|---|---|
| 44 | `CommandPalette` | — | ⌘K. Verb-first, fuzzy, scored by recency and frequency. Sections: Do, Go, Find, Ask. Inline arguments. See [05-command-palette-and-search.md](05-command-palette-and-search.md) |
| 45 | `SearchEverywhere` | — | ⌘⇧F. Federated, two-wave results, grouped by type, inline preview with ⌘I |
| 46 | `DirectiveBar` | `context` | ⌘Return from anywhere. A single field over a dimmed Stage. Accepts `@agent` for direct address, `#room` for context, and drag-dropped files. Esc preserves the draft |
| 47 | `Dock` | — | Bottom strip: live agent avatars with their current step, running cost, and pending approvals. Click an avatar to open its work. Collapses to 24 px when idle |
| 48 | `LedgerLine` | — | The signature. 2 px, top of the Shell, always present. See design system §8 |

---

## Composition rules

1. **No component fetches its own data.** Data comes from feature-level hooks over TanStack Query; components
   receive props. This keeps them testable in Storybook without a kernel.
2. **Every component has a story per state**, including error and empty. A component without a loading story
   does not merge.
3. **Interactive components accept a `ref`** and are keyboard-operable in isolation.
4. **Feature components live with their feature**; only components used by two or more features live in
   `components/`.
5. **Virtualize any list that can exceed 100 rows.** Timeline, Table, Tree, TraceView, and SearchEverywhere
   are virtualized by default.

## States checklist

Every component ships with: default · hover · focus-visible · active · disabled · loading · empty · error ·
selected (if selectable) · reduced-motion. This is the definition of done for a component PR, and Mira
enforces it at review.
