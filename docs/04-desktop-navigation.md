# Desktop Navigation

The Shell is a building. Rooms are places, not tabs — you go to the Boardroom to decide, the Archive to
remember, the Console to inspect the machinery.

## 1. The Shell

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ▁▁▁▁▁▁▁▁▁▁ LEDGER LINE ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁ │ 2px
├──┬──────────────┬────────────────────────────────────┬────────────────────────┤
│  │              │                                    │                        │
│R │  SIDEBAR     │            STAGE                   │      INSPECTOR         │
│A │  240–400px   │            flex                    │      280–480px         │
│I │              │                                    │      (⌘I toggles)      │
│L │  contextual  │  the work                          │      provenance        │
│  │  to the room │                                    │      cost, trace       │
│56│              │                                    │                        │
├──┴──────────────┴────────────────────────────────────┴────────────────────────┤
│ DOCK  ◉ Vega · drafting API section · 0:42 · $0.03   ◉ Cass · modelling   ⚠1  │ 48px
└────────────────────────────────────────────────────────────────────────────────┘
```

All four panels are resizable and collapsible; sizes persist per room. The Ledger Line and the Dock are
constant across every room — they are the building's vital signs.

## 2. The Rail

56 px, icon-only with tooltips and keyboard bindings. Top to bottom:

| Icon | Room | Key | Purpose |
|---|---|---|---|
| ◇ | **Lobby** | ⌘1 | Today. The Morning Brief, active Engagements, what needs you |
| ⬡ | **Boardroom** | ⌘2 | Meetings live and past, Decisions, review queue |
| ⚙ | **Engineering** | ⌘3 | Rune, Vega, Orin, Argus — technical work and artifacts |
| ◈ | **Product** | ⌘4 | Iris, Mira — specs, designs, scope |
| ◍ | **Commercial** | ⌘5 | Sable, Cass — positioning, money, models |
| ⬢ | **Operations** | ⌘6 | Quill, Atlas — knowledge, automation, system health |
| ▤ | **Archive** | ⌘7 | Everything that happened. Search, Decisions, Minutes, Briefs |
| ▣ | **Vault** | ⌘8 | Files. Tree, preview, versions, provenance |
| ◐ | **Console** | ⌘9 | Machinery: costs, automations, health, traces, limits |
| ⚑ | **Settings** | ⌘, | Preferences, staff, models, security, extensions |

The active room's icon sits on a brass wash with a 2 px brass indicator on the rail's inner edge. An agent
running inside a room puts a live-hued dot on that room's icon — the building shows you which floor is busy.

## 3. Room anatomy

Every room fills the same frame differently.

| Room | Sidebar | Stage | Inspector |
|---|---|---|---|
| **Lobby** | Active Engagements, dormant programs with wake conditions, pinned threads | The Morning Brief, then a compact list of what needs you | Selected item's provenance |
| **Boardroom** | Meetings (live / scheduled / past), Decisions by review date | `MeetingTable` when live; `DecisionRecord` when a Decision is selected | Minutes, dissents, linked orders |
| **Department rooms** | The department's agents with live load; their open Work Orders; recent artifacts | Selected Work Order's progress spine, or an artifact preview | Trace, sources, cost |
| **Archive** | Faceted filters: type, date, agent, engagement, tag | Search results or a selected record; Decision chains render as a chain | Full provenance and links |
| **Vault** | File tree | Preview with version history and diff | Metadata, provenance, "ask about this file" |
| **Console** | Sections: Ledger, Automations, Health, Traces, Limits, Providers | The selected section | Detail of the selected row |
| **Settings** | Setting groups | The group's settings | Explanation of the selected setting and its default |

## 4. The Stage

The Stage shows one of five things, and the transition between them is the core interaction loop:

1. **A Brief** — the resting state after work completes. Newsreader, 72ch, calm.
2. **A Progress Spine** — the state during work. The plan, live.
3. **An artifact preview** — a document, dataset, or design.
4. **A record** — a Decision, Minutes, or a trace.
5. **A room's own view** — the ledger, the file tree, the meeting table.

Transitions between Stage contents cross-fade over 200 ms with an 8 px rise. Room changes are instant — you
do not animate walking through a door you have used a thousand times.

## 5. The Dock

48 px, glass, always present. It shows live agents: avatar, current step, elapsed, running cost. Pending
approvals appear as a brass pip on the right with a count. When nothing is running, the Dock collapses to
24 px and shows the day's totals: Engagements, Turns, spend.

Clicking an agent opens its current Work Order in the Stage. Clicking the approval pip opens the batched
`ApprovalSheet`.

## 6. Directive bar

⌘Return from anywhere dims the Stage 40% and drops a single glass field from the top over 320 ms
(`--sd-motion-emphasis`). It is the one place in the product that performs, because it is where intent
enters the building.

- Plain text → a Directive to Kai.
- `@rune …` → direct address, bypassing the Mandate ceremony.
- `#engineering …` → scoped context.
- Files dragged onto it are attached and ingested.
- Esc closes and **preserves the draft** — reopening restores it.
- ⌘Enter submits. The bar collapses and the Mandate preview rises in its place.

## 7. Window management

- Minimum window 1120 × 720. Below 1280 wide, the Inspector auto-collapses; below 1120, the Sidebar becomes
  a Drawer.
- Multiple windows are supported: ⌘⇧N opens a second window on the same Vault (single kernel, multiple
  views). Useful for watching a meeting while reading an artifact.
- Full screen hides the OS chrome and grows the Stage; the Rail, Dock, and Ledger Line remain.
- Window position, size, and per-room panel sizes are all restored on launch.

## 8. Back, forward, and history

Navigation is a stack, not a browser. ⌘[ and ⌘] move through visited subjects (a Brief, a Decision, an
artifact), preserving scroll position. The stack survives room changes and app restart. There is no URL bar,
no breadcrumbs, and no tabs — the Sidebar and the history stack are sufficient, and tabs would invite the
document-management burden the product exists to remove.
