# Organization Chart — Version 2.0

Extends `/docs/03-agents/02-org-chart.md`. Every one of v1's eleven named agents is retained with an
explicit continuity path. Two names are added.

## 1. Structure

```
                                  ┌──────────────┐
                                  │  PRINCIPAL   │  sole source of ultimate authority
                                  └──────┬───────┘
                                Directives │ ▲ one Brief, one ask
                                  ┌──────▼───────┐
                                  │  KAI  exec   │  five tools only (ADR-0004, unchanged)
                                  └──────┬───────┘
       ┌───────────┬───────────┬─────────┼─────────┬───────────┬───────────┬──────────┐
       │           │           │         │         │           │           │          │
  ┌────▼────┐ ┌────▼────┐ ┌────▼────┐ ┌──▼───┐ ┌───▼────┐ ┌────▼─────┐ ┌───▼────┐ ┌───▼────┐
  │ENGINEER-│ │PLATFORM │ │INTELLI- │ │SECUR-│ │PRODUCT │ │  GAME    │ │COMMER- │ │CORPOR- │
  │  ING    │ │         │ │ GENCE   │ │ ITY  │ │        │ │  STUDIO  │ │ CIAL   │ │  ATE   │
  │  Rune   │ │  Atlas  │ │  Orin   │ │Corvus│ │  Iris  │ │   Lyra   │ │ Sable  │ │ Quill  │
  ├─────────┤ ├─────────┤ ├─────────┤ ├──────┤ ├────────┤ ├──────────┤ ├────────┤ ├────────┤
  │Software │ │Cloud    │ │AI Eng   │ │Cyber-│ │Product │ │Game      │ │Market- │ │Finance │
  │  (Vega) │ │Infra-   │ │Data Eng │ │secur-│ │ Design │ │ Develop- │ │  ing   │ │Legal   │
  │Backend  │ │ structure│ │Research │ │ ity  │ │UI/UX   │ │ ment     │ │Sales   │ │HR      │
  │Frontend │ │Automation│ │         │ │      │ │ (Mira) │ │          │ │Customer│ │        │
  │Mobile   │ │         │ │         │ │      │ │Business│ │          │ │ Success│ │        │
  │         │ │         │ │         │ │      │ │ Analysis│ │          │ │        │ │        │
  └─────────┘ └─────────┘ └─────────┘ └──────┘ └────────┘ └──────────┘ └────────┘ └────────┘
       ▲           ▲           ▲         ▲         ▲           ▲           ▲          ▲
       └───────────┴───────────┴─────────┴────┬────┴───────────┴───────────┴──────────┘
                                              │
                        ┌─────────────────────┴──────────────────────┐
                        │  OFFICES — cross-cutting, outside the line │
                        ├────────────────────────────────────────────┤
                        │  QUALITY       Argus    quality veto        │
                        │  COST          Cass     spend veto          │
                        │  ARCHITECTURE  Rune     architecture veto   │
                        │  SECURITY      Corvus   security veto       │
                        └────────────────────────────────────────────┘
```

## 2. Continuity from v1

Nothing was discarded. Every v1 agent has a v2 position.

| v1 agent | v1 role | v2 position | Change |
|---|---|---|---|
| **Kai** `agent.exec` | Executive | Executive — unchanged | Routes to Divisions instead of departments. Still five tools. |
| **Rune** `agent.cto` | CTO, Technology head, architecture veto | Engineering Division executive + **Architecture Office** | Veto retained exactly. Span grows from 3 to 4 departments. |
| **Iris** `agent.pm` | Product Manager, Product head | Product Division executive | Span grows from 1 to 3 departments. |
| **Vega** `agent.eng` | Software Engineer | Head, Software Engineering department | Promoted from specialist to department head. |
| **Orin** `agent.ai` | AI Engineer | Intelligence Division executive | Promoted from specialist to Division executive. |
| **Mira** `agent.design` | UI/UX Designer | Head, UI/UX department | Promoted from specialist to department head. |
| **Argus** `agent.qa` | QA Engineer, quality veto | **Quality Office** head | Moved *out* of the delivery line. Veto retained and widened firm-wide. |
| **Atlas** `agent.devops` | DevOps | Platform Division executive | Promoted from specialist to Division executive. |
| **Sable** `agent.marketing` | Marketing Manager, Commercial head | Commercial Division executive | Span grows from 1 to 3 departments. |
| **Cass** `agent.finance` | Finance Manager, spend veto | **Cost Office** head | Moved *out* of the delivery line; does not head the Finance department. Veto retained and widened. |
| **Quill** `agent.docs` | Documentation Manager, Operations head | Corporate Division executive | Documentation becomes a firm-wide Standard set rather than one agent's job — see §6. |

**New:** **Corvus** `agent.ciso` (Security Division + Security Office) and **Lyra** `agent.studio` (Game
Studio Division). Two names, both justified in §3 and §4.

Agent IDs are stable. `agent.qa` is still Argus even though Argus now heads an Office; v1's rule that an ID
never changes on a rename or a role change is what makes the history survive this reorganisation.

## 3. Why Offices exist

At eleven agents, ADR-0008's "the author never reviews" was satisfiable inside the org chart: Argus reviewed
Vega's work and they were peers under Rune. At twenty-one departments the question becomes structural — if
the Backend department reviews Backend's work, Principle 5 is a slogan.

An **Office** is a cross-cutting authority that:

- sits outside every delivery line and belongs to no Division;
- holds a **scoped veto** — narrow, specific, and not overridable by a Division executive;
- can be invoked by any department, and *must* be invoked when a department's manifest says so;
- performs no delivery work of its own, ever. An Office that produces Deliverables has become a department
  and has lost the independence that made its veto meaningful.

| Office | Head | Veto scope | Must review |
|---|---|---|---|
| **Quality** | Argus | Any Deliverable failing acceptance criteria or Standards | Every Deliverable in an Engagement above the department's declared threshold |
| **Cost** | Cass | Any spend exceeding an approved ceiling; any Engagement whose projected cost exceeds its Mandate | Any Work Order above $5; any budget-ceiling change |
| **Architecture** | Rune | Any change to a contract, interface, or registered architectural stance | Cross-department contract changes; new `provides.contracts` entries |
| **Security** | Corvus | Any effect at class 3; any egress change; any capability widening | Every class-2+ effect; every Integration grant; every Pack install |

**The dual-hat problem, and its resolution.** Rune holds both the Engineering Division and the Architecture
Office; Corvus holds both the Security Division and the Security Office. Both are legitimate only because a
Division executive performs no delivery work — the same five-tool constraint as Kai (ADR-0004) — so neither
is reviewing work they authored.

But the boundary case is real: when an artifact originates *inside* Rune's own Division, Rune must not be the
architecture reviewer. In that case the Office's review is performed by an Office reviewer instance
(`agent.office.architecture.reviewer.NN`), not by Rune personally. The orchestrator enforces this the same
way it enforces ADR-0008: `reviewer_id != author_id` extends to `reviewer_division != author_division` for
Office reviews. Argus and Cass have no Division and therefore no such case.

## 4. Why Security is a Division of one

Cybersecurity could have been a department under Engineering or Platform. It is neither, and the reason is
Principle 5 rather than importance.

A security function that reports through the organisation it audits has a structural conflict: the executive
who owns delivery velocity also owns the budget and the escalation path of the function whose job is to slow
delivery down when it is unsafe. Every real incident post-mortem in the industry contains some version of
this sentence.

So Corvus reports to Kai directly, holds an independent budget line, and cannot be overruled by any Division
executive — only by the Principal, explicitly, with the override recorded as a Decision. A Division of one is
an unusual shape, and it is the correct one.

The same argument applies, in weaker form, to the Quality and Cost Offices, which is why they too report to
Kai rather than sitting inside Operations or Corporate.

## 5. Escalation and conflict resolution

Extends v1's rule (escalate to the shared parent) with the cases v1 could not have:

| Conflict | Resolution |
|---|---|
| Two agents in one department | Department head |
| Two departments in one Division | Division executive |
| Two departments across Divisions | Kai |
| A department vs. an Office veto | The veto stands. The department may file a **dissent** (v1 decision engine), which is recorded and surfaced to the Principal in the Brief — but the work does not proceed. |
| Two Offices in conflict | Kai arbitrates. Precedence when Kai cannot resolve: **Security > Quality > Architecture > Cost**. Safety before correctness before elegance before money. |
| A Division executive vs. Kai | Kai decides; the executive's dissent is recorded. |
| Anything vs. the Principal | The Principal. Always, immediately, without ceremony. |

**Deadlock rule.** Any conflict unresolved after two rounds becomes an Approval Request in the next Brief
with both positions stated in one sentence each. The system never loops, and it never resolves a genuine
disagreement by picking the more fluent argument.

## 6. What happened to Documentation

Quill was the Documentation Manager. In v2 there is no Documentation department, and this is a deliberate
demotion of an agent into a rule — the good kind.

Documentation is not a domain; it is a property that every Deliverable must have. Making it a department
produces the failure mode every engineering organisation knows: work ships undocumented and a separate team
is perpetually behind. So v2 makes it a **firm-wide Standard set**, owned by the Records Office function of
the Corporate Division and enforced by Guards at the pre-Deliverable lifecycle point:

- Every Deliverable declares its documentation obligation from its type.
- A Guard blocks a Deliverable that fails to meet it.
- The Quality Office's veto covers documentation completeness.

Quill, now Corporate Division executive, owns the Firm's records and obligations broadly — Finance, Legal,
HR are all record-and-obligation shaped, which is why they are the Division Quill got. The specific
documentation duty scales better as a Standard than as an agent, and that is exactly the test Principle 13
sets.

## 7. Span of control

| Level | Reports | Note |
|---|---|---|
| Principal | 1 (Kai) | Unchanged, and the entire point |
| Kai | 8 Divisions + 4 Offices = 12 | At the upper edge of workable; the Offices are mostly self-invoking |
| Division executive | 1–4 departments | Security is 1 (§4); Engineering is 4 |
| Department head | 3–6 archetypes, 0–N instances | Autoscale bounded in the manifest |
| Office head | 0–3 reviewer instances | Offices stay small by construction |

**Growth rule.** A Division that exceeds five departments splits or delegates; it does not grow. A Kai with
more than eight Divisions means a Division is missing. These are hard bounds because span of control is the
variable that silently converts an organisation into a queue, and by the time it is visible in the KPIs the
Principal has already been waiting for weeks.
