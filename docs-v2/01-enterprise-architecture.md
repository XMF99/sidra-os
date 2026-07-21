# Enterprise Architecture

How Sidra OS 1.0 becomes the internal operating system of Sidra Systems without becoming a different system.

## 1. The shape of the change

v1 is a Firm: one Executive, four departments, eleven agents, one machine. v2 is the same Firm with an
organisational layer inserted between the Executive and the work, and a modularity layer wrapped around every
unit of capability.

```
                 VERSION 1.0                              VERSION 2.0
                 ───────────                              ───────────
                  Principal                                Principal
                      │                                        │
                     Kai                                      Kai            + Offices (Quality,
                      │                                        │               Security, Cost,
        ┌──────┬──────┼──────┬──────┐                     8 Divisions          Architecture)
        │      │      │      │      │                          │               — cross-cutting vetoes
      Tech  Product Comm  Ops                            21 Departments
        │                                                      │
    6 specialists                                      N Agent Instances
                                                    (lazily instantiated from
                                                       Role Archetypes)
```

Everything below the Department line is v1 verbatim: an agent is still an agent, a Turn is still eight
phases, a Work Order is still a typed durable record, a Brief is still one page with one ask.

## 2. Whole-system view

```
┌───────────────────────────────────────────────────────────────────────────────┐
│  PRINCIPAL                                        Directives ▲ Briefs         │
├───────────────────────────────────────────────────────────────────────────────┤
│  SURFACE — Night Atrium shell (v1, unchanged)                                 │
│  Rail(8 Divisions) · Stage · Inspector · Dock · ⌘K · Ledger Line              │
├───────────────────────────────────────────────────────────────────────────────┤
│  EXECUTIVE LAYER                                                              │
│  Kai (agent.exec — five tools, ADR-0004)                                      │
│  Cabinet: 8 Division executives · 4 Offices with scoped vetoes                │
├───────────────────────────────────────────────────────────────────────────────┤
│  DEPARTMENT LAYER — 21 isolated Packs                                         │
│  ┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐   each owning:  │
│  │ Backend  ││ Game     ││ Cyber    ││ Finance  ││   …      │   agents        │
│  │          ││ Studio   ││ security ││          ││          │   memory ns     │
│  └──────────┘└──────────┘└──────────┘└──────────┘└──────────┘   playbooks     │
│         ▲            ▲          ▲          ▲                     standards    │
│         └────────────┴──────────┴──────────┘                     guards       │
│                    THE EXCHANGE                                  registries   │
│      typed, budgeted, logged inter-department requests           dashboards   │
├───────────────────────────────────────────────────────────────────────────────┤
│  CORE PLATFORM — the v1 kernel, unchanged in kind                             │
│  Orchestrator · Memory(5 layers) · Model Gateway(5 classes) · Permission      │
│  Broker · Event Log(hash-chained) · Store(SQLite+SQLCipher) · Workflow ·      │
│  Meeting · Decision · Automation · Knowledge · Notification · Plugin Host     │
│  NEW: Department Registrar · Exchange · Standards Engine · Guard Runner       │
├───────────────────────────────────────────────────────────────────────────────┤
│  INTEGRATIONS (connectors) · PLUGINS (Wasm, ADR-0006) · MARKETPLACE (Packs)   │
├───────────────────────────────────────────────────────────────────────────────┤
│  THE VAULT — one encrypted local directory, ~/Sidra/ (v1, unchanged)          │
└───────────────────────────────────────────────────────────────────────────────┘
```

Four new kernel services. Everything else in the Core Platform row is v1 as written.

## 3. The four new kernel services

| Service | Crate | Responsibility | Why it is kernel and not a plugin |
|---|---|---|---|
| **Department Registrar** | `sidra-departments` | Loads Pack manifests, resolves archetypes, instantiates and retires agents, enforces per-department budget sub-ceilings, holds the org graph | It decides what the Firm *is*. A plugin cannot be trusted to define the trust boundaries it lives inside. |
| **Exchange** | `sidra-orchestrator` (extension) | Routes typed requests between departments; enforces isolation; attributes cost across the boundary | Isolation enforced by a participant is not isolation. Same argument as the Permission Broker. |
| **Standards Engine** | `sidra-registry` | Resolves which Standards apply to a given artifact path or type; supplies them to the Turn frame; records violations | Standards constrain agents; an agent-adjacent component cannot be the one applying them. |
| **Guard Runner** | `sidra-security` (extension) | Executes declarative Guards at lifecycle points; blocks or warns | Guards can block effects. That is the Permission Broker's neighbourhood by definition. |

None of these replaces an existing service. Each extends the boundary of one that already exists, which is
why `04-migration/02-implementation-changes.md` can describe the change as additive.

## 4. Request flow at v2

A Directive at v2 traverses two more steps than at v1. Both are cheap and one is often skipped.

```
Directive
   │
   ├─▶ [Kai: Analyze]  ── fast-lane check ──▶ single department, one Turn ──▶ Brief   (target: 65%)
   │
   ├─▶ [Kai: Strategize] Mandate: objective, budget, effect ceiling, fences
   │
   ├─▶ [ROUTE] Directive → Division(s)                    ◀── NEW, deterministic
   │       Division executive selects Departments          ◀── NEW, model-assisted
   │
   ├─▶ [Department Registrar] instantiate needed agents from archetypes  ◀── NEW, lazy
   │
   ├─▶ [Kai/Division: Assign] typed Work Orders (v1 contract + 2 fields)
   │       │
   │       ├─▶ Department A ──▶ Turns ──▶ Deliverables ──┐
   │       ├─▶ Department B ──▶ Turns ──▶ Deliverables ──┤
   │       └─▶ Exchange requests between A and B ────────┤   ◀── NEW, typed + budgeted
   │                                                      │
   ├─▶ [Offices] Quality / Security / Cost / Architecture review, scoped vetoes  ◀── NEW placement
   │       (this is v1's ADR-0008 reviewer requirement, relocated outside the delivery line)
   │
   ├─▶ [Kai: Collect + Report] one Brief, one ask, ≤600 words
   │
   └─▶ Principal
```

The routing step is deterministic where it can be: a Directive naming a known department, artifact path, or
project routes by table without a model call. Only ambiguous Directives cost a `fast`-class classification.
This is v1's Principle 8 applied to the new layer.

## 5. Isolation: what a department cannot do

Principle 11 says a department is a boundary. Here is the boundary, mechanically:

| Dimension | Isolation mechanism | Enforced by |
|---|---|---|
| Memory | Episodic, Semantic, and Procedural layers are namespaced `dept.<id>.*`. Retrieval outside the namespace requires a granted read scope. Canon is global and read-only to departments. | Memory service |
| Capability | Capabilities are granted to the Department, then to Role Archetypes within it. A department's grant is the ceiling for every agent in it. | Permission Broker |
| Budget | A fourth nested ceiling between engagement and month. Overrun pauses the department, not the Firm. | Model Gateway |
| Filesystem | Write scope confined to `Artifacts/<dept>/`. Reads outside require a grant. | Permission Broker |
| Communication | No direct invocation. Only `department.request` through the Exchange, which is typed, budgeted, and logged. | Exchange |
| Standards | A department's Standards apply within its scope and cannot be relaxed by another department. Firm-wide Standards are set by Offices and cannot be relaxed by any department. | Standards Engine |
| Tools | A department declares its tools in its Pack manifest. Tools are not shared implicitly. | Department Registrar |
| Failure | A department that crashes, exceeds budget, or fails a Guard is quarantined. Other departments continue. | Registrar + Orchestrator |

**What is deliberately shared:** Canon (the Firm's constitution), the event log, the Vault, the model
gateway, the notification ladder, and the Principal's attention. Those are shared because duplicating them
would produce twenty-one Firms rather than one.

## 6. Expansion: how a department grows

Independently expandable means four distinct things, in increasing cost:

1. **Instantiate a declared role.** Zero design work: the archetype exists in the Pack; the Registrar creates
   an instance. Triggered manually or automatically when the department's queue depth sustains above target.
2. **Add a playbook.** A new workflow inside the department. Requires the department's own review, no
   firm-level approval, because it cannot cross the boundary.
3. **Add a role archetype.** A new charter in the Pack. Requires an evaluation set (v1's charter-regression
   rule) and Division approval.
4. **Fork the Pack.** Version the department, change its manifest, keep history. This is how a Firm
   specialises "Backend" into "Backend — Payments" without editing the shipped Pack.

None of these touches the kernel, another department, or the shell. That is the test of whether the isolation
is real: **adding a capability to one department must require zero changes anywhere else.**

## 7. What did not change, restated

Because the value of this architecture is mostly in what it left alone:

- The Turn lifecycle, the Work Order contract, the Brief format, the six CEO-protocol phases.
- The five memory layers, hybrid retrieval, Night Shift consolidation, Canon trust levels.
- The five Model Classes and the deterministic routing table (ADR-0005).
- The capability model, effect classes 0–3, Fences, the Permission Broker as sole choke point.
- The hash-chained event log and every projection derived from it (ADR-0002).
- The single-file encrypted Vault and the Markdown mirror (ADR-0003).
- The Wasmtime Component Model plugin host (ADR-0006).
- Night Atrium: every token, all 48 components, the Ledger Line, the keymap.
- All ten Principles, the notification budget, the one-Brief-one-ask contract.

A v1 Engagement replayed against a v2 kernel produces the same Brief. That is the acceptance test for this
entire architecture, and it is specified in `04-migration/01-migration-strategy.md` §6.
