# Deliverable 5 — Navigation Tree

The navigable structure of the shell, derived 1:1 from the route table
(`09-routing.md §2`). Primary destinations are sidebar items; nested nodes are
detail routes and tabs; overlays are addressable surfaces layered over any route.

```mermaid
graph LR
  Shell(("Sidra Shell #/"))

  Shell --> Dash["Dashboard  #/"]
  Shell --> Missions["Mission Center  #/missions"]
  Shell --> Org["Organization  #/org"]
  Shell --> Depts["Departments  #/departments"]
  Shell --> Agents["Agents  #/agents"]
  Shell --> Projects["Projects  #/projects"]
  Shell --> Know["Knowledge  #/knowledge"]
  Shell --> Conn["Connectors  #/connectors"]
  Shell --> Ana["Analytics  #/analytics"]
  Shell --> Events["Event Log  #/events"]
  Shell --> Settings["Settings  #/settings"]

  Missions --> MList["List (filters: state/dept/project/date/q)"]
  Missions --> MDetail["Detail  #/missions/:id"]
  MDetail --> Mt1["?tab=overview"] & Mt2["?tab=timeline"] & Mt3["?tab=progress"] & Mt4["?tab=replay"] & Mt5["?tab=approvals"]
  Missions -. overlay .-> Wizard["New Mission  #/missions/new"]

  Org --> ODiv["Division  #/org/divisions/:id"]
  Org --> OOff["Office  #/org/offices/:id"]
  Org --> OProp["Proposal  #/org/proposals/:id"]

  Depts --> DDetail["Detail  #/departments/:id"]
  DDetail --> Dt1["?tab=overview"] & Dt2["?tab=standards"] & Dt3["?tab=guards"] & Dt4["?tab=exchange"] & Dt5["?tab=agents"]

  Agents --> ADetail["Detail  #/agents/:id"]
  ADetail --> At1["?tab=overview"] & At2["?tab=activity"] & At3["?tab=tools"]

  Projects --> PDetail["Detail  #/projects/:id"]
  PDetail --> Pt1["?tab=overview"] & Pt2["?tab=missions"] & Pt3["?tab=documents"] & Pt4["?tab=activity"]

  Know --> KDoc["Document  #/knowledge/:docId"]
  Conn --> CDetail["Detail  #/connectors/:id"]
  CDetail --> Ct1["?tab=overview"] & Ct2["?tab=grants"] & Ct3["?tab=egress"]

  Ana --> AnaP["#/analytics ?range&scope&metric"]
  Events --> Ev["#/events ?kind&correlation&entity&from&to (read-only)"]
  Settings --> St["#/settings ?section=appearance|shortcuts|notifications|identity|diagnostics|about"]

  subgraph Ambient["Ambient overlays (over any route)"]
    Pal["Command Palette  ⌘K  ?overlay=palette"]
    Srch["Global Search  ⌘/  ?overlay=search"]
    NC["Notification Center  ⌘⇧N  ?overlay=notifications"]
    Cheat["Shortcut Cheat Sheet  ?"]
  end
```

## Cross-links (non-hierarchical navigation)

Deep links wire the graph together beyond the tree:

| From | To |
|---|---|
| Dashboard widget | its owning page, filtered |
| Mission timeline entry / any correlationId | `#/events?correlation=…` |
| Agent "current mission" | `#/missions/:id` |
| Department "agents" / "connectors" | `#/agents?dept=…` / `#/connectors?…` |
| Connector grant "target" | `#/departments/:id` |
| Knowledge result "source"/"provenance" | connector/mission/event |
| Notification "open"/"act" | the underlying entity + command |
| Project "missions" | `#/missions?project=…` |
| Search result | any deep link above |

## Navigation rules (summary)

- **Primary** (sidebar) selects a top-level route; **contextual** (tabs,
  breadcrumb) moves within; **ambient** (palette/search/deep links) jumps anywhere.
- **Tabs** update `?tab=` via replace (Back doesn't step through tabs); leaving
  and returning restores the last tab.
- **Overlays** layer over the current route and dismiss Back/Esc-first before the
  page pops.
- **Filters** live in URL params so list state survives detail round-trips.
- Every node here corresponds to exactly one typed route in `routeTable.ts`; the
  tree and the table cannot diverge.
