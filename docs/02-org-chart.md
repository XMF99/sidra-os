# Organization Chart

## 1. Structure

```
                              ┌──────────────────┐
                              │    PRINCIPAL     │   (the human; sole source of ultimate authority)
                              └────────┬─────────┘
                                       │ Directives ▲ Briefs
                              ┌────────▼─────────┐
                              │   KAI — Executive │  agent.exec
                              │   strategy, delegation, synthesis, one voice
                              └───┬────┬────┬────┬┘
             ┌────────────────────┘    │    │    └────────────────────┐
             │                         │    │                         │
   ┌─────────▼─────────┐   ┌───────────▼─┐  │  ┌──────────▼───────┐  ┌▼──────────────┐
   │ TECHNOLOGY        │   │ PRODUCT     │  │  │ COMMERCIAL       │  │ OPERATIONS    │
   │ head: Rune (CTO)  │   │ head: Iris  │  │  │ head: Sable      │  │ head: Quill   │
   ├───────────────────┤   ├─────────────┤  │  ├──────────────────┤  ├───────────────┤
   │ Vega  Engineer    │   │ Iris  PM    │  │  │ Sable Marketing  │  │ Quill Docs    │
   │ Orin  AI Engineer │   │ Mira  Design│  │  │ Cass  Finance    │  │ Atlas DevOps  │
   │ Argus QA          │   │             │  │  │                  │  │               │
   └───────────────────┘   └─────────────┘  │  └──────────────────┘  └───────────────┘
                                            │
                                   ┌────────▼─────────┐
                                   │ Cross-cutting    │
                                   │ Argus may block  │  quality veto
                                   │ Cass may block   │  spend veto
                                   └──────────────────┘
```

Eleven agents: one Executive, four department heads (three of whom are also individual contributors), and
six specialists.

## 2. Roster

| Agent | Name | Title | Department | Reports to | Model class default |
|---|---|---|---|---|---|
| `agent.exec` | **Kai** | Executive | — | Principal | `reasoner` |
| `agent.cto` | **Rune** | Chief Technology Officer | Technology (head) | Kai | `reasoner` |
| `agent.pm` | **Iris** | Product Manager | Product (head) | Kai | `worker` |
| `agent.eng` | **Vega** | Software Engineer | Technology | Rune | `worker` |
| `agent.ai` | **Orin** | AI Engineer | Technology | Rune | `worker` |
| `agent.design` | **Mira** | UI/UX Designer | Product | Iris | `worker` |
| `agent.qa` | **Argus** | QA Engineer | Technology | Rune | `reasoner` |
| `agent.devops` | **Atlas** | DevOps Engineer | Operations | Quill | `worker` |
| `agent.marketing` | **Sable** | Marketing Manager | Commercial (head) | Kai | `worker` |
| `agent.finance` | **Cass** | Finance Manager | Commercial | Sable | `worker` |
| `agent.docs` | **Quill** | Documentation Manager | Operations (head) | Kai | `worker` |

## 3. Reporting rules

1. **One voice to the Principal.** Kai is the default interlocutor. Others speak to the Principal only when
   directly addressed (`@rune`), when escalating past Kai (rare, logged), or as attributed sections inside a
   Brief.
2. **Delegation flows down, one level at a time.** Kai issues Work Orders to heads and to specialists.
   Heads may sub-delegate within their department. A specialist may not delegate.
3. **Escalation flows up, one level at a time.** Specialist → head → Kai → Principal. Each level must
   attempt resolution before passing up, and must state what it tried.
4. **Cross-department work goes through Kai.** Vega cannot task Cass. Kai issues both orders and owns the
   join. This keeps the dependency graph legible and prevents hidden coupling.

## 4. Vetoes and separation of powers

| Agent | Veto | Scope | Override |
|---|---|---|---|
| **Argus** (QA) | `block` on any Deliverable | Correctness, completeness, contradiction | Kai may override with a recorded Decision and rationale; the block is preserved in the record |
| **Cass** (Finance) | `block` on spend above the Engagement budget | Money | Principal only |
| **Rune** (CTO) | `block` on architectural changes that create lock-in or irreversibility | Technical direction | Kai, with recorded rationale |
| **Kai** | May override Argus and Rune | — | Principal |
| **Principal** | Overrides everything | — | — |

Every override is a Decision row with a rationale. The point of the veto is not to stop work; it is to make
the override *visible and attributable*.

## 5. Standing meetings

| Meeting | Cadence | Chair | Attendees | Output |
|---|---|---|---|---|
| Standup | Daily 06:45 | Kai | Heads | Morning Brief |
| Design Review | On demand, per artifact | Iris | Mira, Argus, relevant specialist | Findings + revision orders |
| Decision Forum | When a Decision has stakes ≥ medium | Kai | Position-holders + Argus as devil's advocate | Decision + Dissents |
| Post-Mortem | After any failed Engagement or incident | Rune | Involved agents | Findings + Playbook update |
| Retrospective | Monthly | Kai | All | Agent KPI review, routing report, org proposals |
| Night Shift | Nightly 02:00 | Quill | Quill, Orin | Consolidation digest, index maintenance |

## 6. Load and cost distribution (design targets)

| Department | Expected share of Turns | Expected share of spend | Note |
|---|---|---|---|
| Executive | 20% | 30% | Fewer Turns, expensive class (planning + synthesis) |
| Technology | 40% | 35% | The bulk of production work |
| Product | 20% | 15% | |
| Commercial | 10% | 10% | |
| Operations | 10% | 10% | Mostly cheap classes; Night Shift is batched |

Deviation greater than 1.5× from these targets for two consecutive months is a signal reviewed in the
Retrospective — either the org shape or the routing is wrong.
