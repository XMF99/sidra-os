# Structure — Architecture

**Milestone M12 · Release 2.0 "Concourse" · Layer 2 (Executive)**

| | |
|---|---|
| Milestone | M12 — Structure (`/MILESTONE_REGISTRY.md` §4, 2.0 "Concourse") |
| Release | 2.0 "Concourse" — the Firm becomes a company; M12 is its first *visible* enterprise structure |
| Layer | 2 — Executive (`/docs-v2/02-layer-model.md` §2) |
| New crate | **None.** Divisions and Offices are organisational structure over the M11 substrate; M12 extends `sidra-departments` (org graph), `sidra-security` (veto enforcement), `sidra-orchestrator` (routing), `sidra-agents` (executive charters), and the renderer (the Rail). See §Appendix B. |
| Depends on | **M11** (department substrate: Registrar with one implicit department, Guard Runner, Standards Engine, Exchange, replay-equivalence test), M3 (Permission Broker), M2 (event log) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | **Eight Divisions, four Offices, the Rail shows Divisions, and vetoes work firm-wide** (`/MILESTONE_REGISTRY.md` §4, M12) |

> **Authoritative precedence.** Where this document disagrees with `/docs-v2/01-org-chart-v2.md`, the org
> chart governs the org model and §3's veto placement. Where it disagrees with
> `/docs-v2/adr/0012-divisions-between-executive-and-departments.md` or
> `/docs-v2/adr/0015-offices-hold-vetoes-departments-hold-delivery.md`, those ADRs govern. Where it disagrees
> with `/docs/04-database-design.md` about the migration policy, that document governs. This architecture
> *consolidates and operationalises* those decisions; it never re-decides them. Where a v2 claim appears to
> contradict a v1 document, the v1 document is correct (`/MASTER_IMPLEMENTATION_GUIDE.md` §2).

---

## 1. Why this subsystem exists

### 1.1 The problem

M11 shipped the department substrate and made it invisible on purpose: the Firm runs as *one implicit
department* containing all eleven v1 agents, and a recorded v1 Engagement replays byte-identically against the
v2 kernel (`/docs-v2/01-migration-strategy.md` §6). That is the correct place to stop, and it is also a Firm
whose enterprise structure exists only in machinery no Principal can see. The Registrar holds an org graph of
one node. The Guard Runner runs with an empty Standards set. The Exchange carries no traffic. Argus and Cass
still veto from *inside* the delivery line, exactly as in v1 (`/docs-v2/01-migration-strategy.md` §3).

M12 is the milestone that makes the structure legible. It re-expresses the Firm as the manifest in
`/docs-v2/01-migration-strategy.md` §3 — but grown to the full skeleton — establishing **eight Divisions**
between Kai and the departments (ADR-0012), lifting the four cross-cutting **Offices** out of every delivery
line (ADR-0015), showing the Divisions on the Rail, and making the vetoes work firm-wide rather than
department-wide. This is migration steps 5 and 6 (`/docs-v2/01-migration-strategy.md` §4), which are the only
two steps in the whole v1→v2 sequence the Principal is meant to notice.

The requirement is not "add an org chart to the UI." A structure that is only drawn is decoration. The
requirement is: **give the Firm a legible, enforced organisational shape — Divisions that route and arbitrate,
Offices that hold firm-wide blocking vetoes outside every delivery line — such that the shape is real in the
event log and at the choke point, without the organisation becoming the product it is meant to run.**

### 1.2 The stance

Four commitments define M12, and each is already an accepted ADR. M12 originates none of them; it makes them
mechanical.

1. **Divisions sit between the Executive and Departments.** (ADR-0012) Kai supervises eight Divisions, never
   twenty-one departments. A Division routes, arbitrates, and holds budget; it performs no domain work.
   Autonomous delegation depth rises from 2 to 3 (Kai → Division → Department → specialist), and the fast-lane
   target rises 50% → 65% to compensate.
2. **Offices hold vetoes; Departments hold delivery.** (ADR-0015) Four Offices — Quality (Argus), Cost (Cass),
   Architecture (Rune), Security (Corvus) — sit outside every delivery line, each holding a narrow scoped veto
   not overridable by a Division executive, each performing no delivery work, ever.
3. **Every executive holds exactly five tools.** (ADR-0004, `/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 7) The
   five-tool rule — retrieve, delegate, convene, decide, report — extends from Kai to every Division executive.
   An executive that writes code, edits a design, or calls an external API has become a specialist and the
   Division has lost its purpose (`/docs-v2/02-layer-model.md` §2).
4. **Structure is data, and changing it is a Decision.** The org graph is manifest data in the Registrar
   (`/docs-v2/01-enterprise-architecture.md` §3); applying the structure manifest is a Principal Decision, not
   a background migration (`/docs-v2/01-migration-strategy.md` §3, Principle 14).

### 1.3 What Structure is, mechanically

**Structure is Layer-2 (Executive) organisation over the Layer-1 kernel and the Layer-3 department substrate
M11 shipped.** A Division is a node in the Registrar's org graph with a named executive and zero-to-four
member departments. An Office is a node outside every Division, holding one scoped veto, with a head and
zero-to-three reviewer instances. A veto is a firm-wide, non-downgradable **block** enforced at the choke
point by the Guard Runner (an extension of the Permission Broker, `/docs-v2/01-enterprise-architecture.md`
§3). None of this introduces a new trust mechanism: it reuses the Registrar's org graph (M11), the Permission
Broker and Guard Runner (M3/M11), and the hash-chained event log (M2).

```
Layer 1  kernel                    ← Registrar, Broker, Guard Runner, event log      (M3, M11)
Layer 2  Executive: Kai · 8 Divisions · 4 Offices                                    (M12, THIS DOC)
Layer 3  Departments               ← 1 implicit today; populated per Division in M13  (M11 substrate, M13 packs)
```

### 1.4 What Structure must never become

- **A ceremonial review structure.** An Office that approves everything is the defining failure mode of the
  review layer (`/MASTER_IMPLEMENTATION_GUIDE.md` §10 failure mode 3). A veto must **block**, not warn
  (agent-architecture-v2 §6). Veto rate has a floor: an Office approving above 95% is a *defect in the Office*,
  not evidence of a healthy Firm (ADR-0015; `/docs-v2/02-agent-architecture-v2.md` §7). M12 ships the
  instrument that measures this.
- **Latency and token bloat — "the organisation becomes the product."** Four hops, three reviews, nine minutes
  for a Brief v1 produced in ninety seconds is R-01, the defining risk of 2.0
  (`/MASTER_IMPLEMENTATION_GUIDE.md` §10 failure mode 4). The Division hop and the Office vetoes must not
  regress median Directive-to-Brief latency or Principal-facing token count against the v1 baseline. Both are
  release blockers, enforced as CI gates (§9).
- **An executive with more than five tools.** The moment a Division executive holds a sixth tool it can do
  domain work, and a Division that does domain work has stopped being a routing-and-arbitration layer
  (ADR-0004, `/docs-v2/02-layer-model.md` §2). CI fails the build on a sixth tool.
- **A thick Rail.** The Rail is a read-only projection of the org graph. It renders eight fixed Divisions and
  nothing more; it holds no logic, so swapping all eight Division charters leaves every layer above untouched
  (Layer-2 replaceability, `/docs-v2/02-layer-model.md` §9).
- **A meta-layer that edits the Firm silently.** There is no admin path that changes the Firm's shape without
  producing a Decision on the log (Principle 14, `/MASTER_IMPLEMENTATION_GUIDE.md` §10 failure mode 8).

### 1.5 Relationship to existing concepts

| Existing concept | How M12 relates |
|---|---|
| Department Registrar (M11) | Holds the org graph (`/docs-v2/01-enterprise-architecture.md` §3). M12 grows that graph from one implicit department to eight Divisions + four Offices. No new service. |
| Permission Broker (M3) | The only choke point (`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 5). A veto is enforced *at* the Broker's neighbourhood via the Guard Runner; M12 adds a blocking veto Guard, it never adds a side-door. |
| Guard Runner (M11) | Extends the Broker, executing declarative Guards at lifecycle points that block or warn (`/docs-v2/01-enterprise-architecture.md` §3). M11 shipped it with an empty Standards set; M12 wires the first firm-wide blocking vetoes through it (ADR-0042). |
| Reviews / author≠reviewer (ADR-0008) | A review block is a per-Deliverable reviewer verdict (`/docs/04-database-design.md` §2, `reviews.verdict='block'`). A veto is broader (§5.3). M12 extends `reviewer_id != author_id` to `reviewer_division != author_division` for Office reviews (`/docs-v2/01-org-chart-v2.md` §3). |
| Role Archetype / Instance (ADR-0014) | Division executives are *named, eager* instances with stable v1 IDs; Office reviewer instances are lazily instantiated to satisfy the dual-hat boundary (§7). |
| The Rail (v1 surface) | v1's Rail showed rooms; M12's Rail shows the eight Divisions and ⌘1–⌘8 rebind (`/docs-v2/01-migration-strategy.md` §7). Department rooms move *inside* their Division room (`/docs-v2/03-department-architecture.md` §6). |
| Exchange (M11) | Unaffected. M12 establishes the Divisions the Exchange's requests are arbitrated within; cross-department conflict within a Division resolves at the Division executive (`/docs-v2/01-org-chart-v2.md` §5). |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | Kai's frame stays constant as the Firm grows — eight Divisions whether the Firm runs one department or twenty-one | ADR-0012; the Registrar's org graph caps Kai's span at eight Divisions + four Offices (`/docs-v2/01-org-chart-v2.md` §7) |
| G2 | A veto is a firm-wide **block**, not a warning, and not overridable by a Division executive | ADR-0015; ADR-0042; the Guard Runner enforces a non-downgradable blocking veto at the choke point (§5) |
| G3 | Independence is structural: an Office reviews from outside every delivery line | ADR-0015; Offices belong to no Division; `reviewer_division != author_division` for dual-hat Offices (§5.4) |
| G4 | No executive can do domain work | ADR-0004; every Division executive holds exactly five tools; CI fails on a sixth (§8) |
| G5 | The added routing hop and the vetoes do not regress Principal-facing latency or token count | §9; fast-lane 50%→65%; deterministic routing; latency/token CI gate against the v1 baseline (R-01) |
| G6 | The Rail is a thin projection; Layer 2 stays replaceable | §6; the Rail renders the org graph and holds no logic (`/docs-v2/02-layer-model.md` §9) |
| G7 | One Brief, one ask, ≤600 words, regardless of org size | Principle 1; §9; the Brief budget does not scale with the number of Divisions, Offices, or hops |
| G8 | Veto rate has a measurable floor — ceremonial review is detectable | ADR-0015; `veto_records` projection powers the Office-approval-rate instrument (§5.5) |
| G9 | Everything is additive; the structure is a Decision, and a null structure is exactly M11 behaviour | §Persistence; migrations 0007–0010 additive and forward-only; the pre-M12 one-implicit-department Firm is a fully supported state (`/docs-v2/01-migration-strategy.md` §2) |

---

## 3. The org model

### 3.1 Eight Divisions, four Offices, one Executive

The full skeleton M12 establishes. Eight Divisions between Kai and the departments (ADR-0012); four Offices
outside every delivery line (ADR-0015); thirteen named agents in total — Kai, eight Division executives, and
four Office heads, two of whom are also Division executives (`/docs-v2/03-executive-cabinet.md`).

| Division | Executive | Agent ID | Member departments (populated M13) |
|---|---|---|---|
| Engineering | Rune | `agent.cto` | Software Engineering, Backend, Frontend, Mobile |
| Platform | Atlas | `agent.devops` | Cloud, Infrastructure, Automation |
| Intelligence | Orin | `agent.ai` | AI Engineering, Data Engineering, Research |
| Security | Corvus **(new)** | `agent.ciso` | Cybersecurity (a Division of one — §3.4) |
| Product | Iris | `agent.pm` | Product Design, UI/UX, Business Analysis |
| Game Studio | Lyra **(new)** | `agent.studio` | Game Development |
| Commercial | Sable | `agent.marketing` | Marketing, Sales, Customer Success |
| Corporate | Quill | `agent.docs` | Finance, Legal, HR |

| Office | Head | Agent ID | Scoped veto | Precedence |
|---|---|---|---|---|
| Security | Corvus | `agent.office.security` | Any class-3 effect; any egress change; any capability widening | 1 (highest) |
| Quality | Argus | `agent.office.quality` | Any Deliverable failing acceptance criteria or a Standard | 2 |
| Architecture | Rune | `agent.office.architecture` | Any change to a contract, interface, or registered architectural stance | 3 |
| Cost | Cass | `agent.office.cost` | Any spend exceeding an approved ceiling; any Engagement projected above its Mandate | 4 (lowest) |

Precedence when Offices conflict and Kai cannot resolve: **Security > Quality > Architecture > Cost** — safety
before correctness before elegance before money (`/docs-v2/01-org-chart-v2.md` §5; ADR-0015).

Two Offices are held by Division executives: Rune (Engineering Division + Architecture Office) and Corvus
(Security Division + Security Office). This is legitimate *only* because a Division executive performs no
delivery work — the same five-tool constraint as Kai — so neither reviews work they authored
(`/docs-v2/01-org-chart-v2.md` §3). Argus and Cass hold no Division and head no department; Cass in particular
does **not** head the Finance department, because an authority that vetoes spend cannot be the department
producing the spend analysis (ADR-0015; `/docs-v2/03-executive-cabinet.md`).

**A Division may be established with zero installed departments.** The eight-Division skeleton is the Executive
Layer M12 builds; departments (Layer 3) populate the Divisions in M13. A Division of one is legitimate when
independence requires it — Security — and a Division momentarily empty of departments is a routing structure
awaiting its M13 packs, not a defect (`/docs-v2/01-org-chart-v2.md` §7). The eight Division records and their
named executives exist regardless.

### 3.2 The chart

```
                                  ┌──────────────┐
                                  │  PRINCIPAL   │  sole source of ultimate authority
                                  └──────┬───────┘
                                Directives │ ▲ one Brief, one ask (≤600 words, Principle 1)
                                  ┌──────▼───────┐
                                  │  KAI  exec   │  five tools only (ADR-0004)
                                  └──────┬───────┘   routes to Divisions, not departments (ADR-0012)
       ┌───────────┬───────────┬─────────┼─────────┬───────────┬───────────┬──────────┐
       │           │           │         │         │           │           │          │
  ┌────▼────┐ ┌────▼────┐ ┌────▼────┐ ┌──▼───┐ ┌───▼────┐ ┌────▼─────┐ ┌───▼────┐ ┌───▼────┐
  │ENGINEER-│ │PLATFORM │ │INTELLI- │ │SECUR-│ │PRODUCT │ │  GAME    │ │COMMER- │ │CORPOR- │
  │  ING    │ │  Atlas  │ │ GENCE   │ │ ITY  │ │  Iris  │ │  STUDIO  │ │ CIAL   │ │  ATE   │
  │  Rune   │ │         │ │  Orin   │ │Corvus│ │        │ │   Lyra   │ │ Sable  │ │ Quill  │
  │ (5 tool)│ │ (5 tool)│ │ (5 tool)│ │(5 tl)│ │ (5 tl) │ │  (5 tl)  │ │ (5 tl) │ │ (5 tl) │
  └────┬────┘ └────┬────┘ └────┬────┘ └──┬───┘ └───┬────┘ └────┬─────┘ └───┬────┘ └───┬────┘
       │           │           │         │         │           │           │          │
   departments  departments  ...       one     departments  one dept   departments  departments
   (M13 packs)                       (of one)                                          
       ▲           ▲           ▲         ▲         ▲           ▲           ▲          ▲
       └───────────┴───────────┴─────────┴────┬────┴───────────┴───────────┴──────────┘
                                              │ every delivery line is subject to
                        ┌─────────────────────┴──────────────────────┐
                        │  OFFICES — cross-cutting, outside the line, │  report to Kai directly
                        │  no delivery work, firm-wide blocking veto  │
                        ├─────────────────────────────────────────────┤
                        │  SECURITY      Corvus   class-3/egress/cap   │  precedence 1
                        │  QUALITY       Argus    acceptance/Standards │  precedence 2
                        │  ARCHITECTURE  Rune     contracts/interfaces │  precedence 3
                        │  COST          Cass     spend/ceilings       │  precedence 4
                        └─────────────────────────────────────────────┘
```

Adapted from `/docs-v2/01-org-chart-v2.md` §1, drawn with the five-tool constraint marked on every executive
and the Office precedence ranks made explicit.

### 3.3 How Divisions sit between the Executive and Departments (ADR-0012)

A Directive at v2 traverses two more steps than at v1, both cheap and one often skipped
(`/docs-v2/01-enterprise-architecture.md` §4):

- **Fast lane (target 65%).** A Directive that resolves to one department, one Turn, class ≤1: Kai delegates
  directly, skipping the Division hop. The target *rises* from v1's 50% precisely because more structure means
  more work must bypass it (`/docs-v2/03-executive-cabinet.md`, Kai).
- **Routed (the rest).** Kai routes the Directive to a Division; the Division executive selects departments;
  the Registrar instantiates needed agents from archetypes lazily. Routing is deterministic where the Directive
  names a known department, artifact path, or Application — Principle 8 — costing no model call
  (`/docs-v2/01-enterprise-architecture.md` §4). Only an ambiguous Directive costs a `fast`-class
  classification.

A Division routes, arbitrates, and holds budget; it performs no domain work (ADR-0012). Cross-department
conflict *within* a Division resolves at the Division executive; only cross-Division conflict reaches Kai
(`/docs-v2/01-org-chart-v2.md` §5).

### 3.4 How Offices hold vetoes and Departments hold delivery (ADR-0015)

An Office is a cross-cutting authority that (`/docs-v2/01-org-chart-v2.md` §3):

- sits outside every delivery line and belongs to no Division;
- holds a **scoped veto** — narrow, specific, and not overridable by a Division executive;
- can be invoked by any department, and *must* be invoked when a department's manifest says so
  (`/docs-v2/03-department-architecture.md` §2, `[review]`);
- **performs no delivery work of its own, ever.** An Office that produces Deliverables has become a department
  and has lost the independence that made its veto meaningful.

**Security is a Division of one** for the same reason (`/docs-v2/01-org-chart-v2.md` §4): a security function
that reports through the organisation it audits has a structural conflict — the executive who owns delivery
velocity would also own the budget and escalation path of the function whose job is to slow delivery when it
is unsafe. So Corvus reports to Kai directly, holds an independent budget line, and can be overruled only by
the Principal, explicitly, with the override recorded as a Decision (`/docs-v2/03-executive-cabinet.md`,
Corvus).

---

## 4. Domain model

### 4.1 Core types

```
DivisionId(String)             // stable id, e.g. "engineering"
OfficeId(String)               // stable id, e.g. "quality"
AgentId(String)                // existing v1 id, e.g. "agent.cto" (unchanged, ADR-0002)
DepartmentId(String)           // from the department substrate (M11)
VetoScope(Enum)                // Quality | Cost | Architecture | Security — one per Office
ToolName(String)               // one of exactly five for an executive (ADR-0004)
Precedence(u8)                 // 1 Security … 4 Cost (ADR-0015)
```

### 4.2 `Division`

A node in the org graph between the Executive and the Departments.

| Field | Type | Meaning |
|---|---|---|
| `id`, `name` | ids | identity, e.g. `engineering` / "Engineering" |
| `executive` | `AgentId` | the named Division executive (five tools, ADR-0004) |
| `departments` | `Set<DepartmentId>` | member departments, 0–4; populated in M13 |
| `budget_share` | fraction | Division allocation within the monthly ceiling (`/docs-v2/03-department-architecture.md` §2) |
| `established_at` | Timestamp | when the establishing Decision committed |

**Invariants.** `executive` resolves to an agent holding exactly five tools (ADR-0004). `departments` never
exceeds five without a split (`/docs-v2/01-org-chart-v2.md` §7 growth rule). A Division performs no domain
work — it owns no Deliverable.

### 4.3 `Office`

A cross-cutting authority outside every delivery line, holding one scoped veto.

| Field | Type | Meaning |
|---|---|---|
| `id`, `name` | ids | identity, e.g. `security` / "Security" |
| `head` | `AgentId` | the Office head (Argus, Cass, Rune, Corvus) |
| `veto_scope` | `VetoScope` | the one thing this Office may block |
| `precedence` | `Precedence` | 1–4 for conflict resolution (ADR-0015) |
| `home_division` | `Option<DivisionId>` | set only for dual-hat Offices (Architecture→Engineering, Security→Security); `None` for Quality and Cost |
| `established_at` | Timestamp | when the establishing Decision committed |

**Invariants.** An Office owns no department and no Deliverable (ADR-0015). It reports to Kai directly. Where
`home_division` is set, Office reviews of artifacts originating in that Division are conducted by a reviewer
instance, not the head (§5.4).

### 4.4 `Veto` — the firm-wide block

```
Veto {
    office_id:        OfficeId,          // which Office is exercising it
    scope:            VetoScope,         // narrow, matched to office_id (ADR-0015)
    subject_type:     SubjectType,       // deliverable | effect | spend | contract-change | ...
    subject_id:       String,            // what is being blocked
    author_division:  Option<DivisionId>,// where the subject originated (for the dual-hat check)
    reviewer:         AgentId,           // the Office head, or a reviewer instance (§5.4)
    verdict:          Verdict,           // Upheld (blocked) | Overridden (Principal only)
    dissent_id:       Option<DissentId>, // the department's recorded dissent, if any
    overridden_by:    Option<Actor>,     // the Principal — a Decision — Security only
    invoked_at:       Timestamp,
}
```

The veto is the entire authority of an Office compressed into one record: *who* (Office), *what scope*, *over
which subject*, *upheld or overridden by whom*. A veto is **not overridable by a Division executive**; a
`Overridden` verdict can be set only by the Principal, explicitly, and only for the Security Office, recorded
as a Decision with the accepted risk named (`/docs-v2/03-executive-cabinet.md`, Corvus; ADR-0015).

### 4.5 `DivisionExecutive` — the five-tool constraint

```
DivisionExecutive {
    division_id: DivisionId,
    agent_id:    AgentId,                // a named agent with stable v1 id (ADR-0002)
    tools:       Set<ToolName>,          // == { retrieve, delegate, convene, decide, report } — EXACTLY 5
    appointed_at: Timestamp,
}
```

The type carries the five-tool invariant as a construction precondition: `DivisionExecutive` cannot be built
with a tool set of any size but five, and those five are fixed (ADR-0004; `/docs-v2/02-layer-model.md` §2).
There is no path — no manifest field, no runtime grant — by which a Division executive acquires a sixth tool.
A CI check greps for a sixth (§8).

### 4.6 Relationships

```
Division      1 ──── 1 DivisionExecutive        (each Division has exactly one executive)
Division      1 ──── 0..4 DepartmentId          (member departments, populated M13)
Office        1 ──── 1 VetoScope                (each Office holds exactly one scope)
Office        0..1 ── 1 DivisionId              (home_division; only for dual-hat Offices)
Office        1 ──── * Veto                     (every invocation is a record on the hash chain)
Veto          0..1 ── 1 DissentId               (a department's recorded dissent, if filed)
DivisionExecutive 1 ── {5} ToolName             (exactly five, fixed — ADR-0004)
Kai(agent.exec) 1 ─── 8 Division + 4 Office     (span of control, ADR-0012 / §7)
```

---

## 5. The veto mechanism

### 5.1 What a firm-wide veto is, mechanically

A veto is a **non-downgradable block** an Office places on a subject that falls within its scope, enforced at
the choke point, effective anywhere in the Firm. It differs from v1's department-scoped veto in one dimension
only — reach: Argus and Cass vetoed within their department at v1; at v2 the same vetoes are widened to the
whole Firm, and two more (Architecture, Security) join them (`/docs-v2/01-migration-strategy.md` §7 step 6;
ADR-0015). The *decision* to widen them is ADR-0015; M12 is the mechanism.

### 5.2 How it is enforced at the choke point (ADR-0042)

The Permission Broker is the only choke point (`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 5), and the Guard
Runner extends it (`/docs-v2/01-enterprise-architecture.md` §3). A veto is enforced as a **blocking Guard**
the Guard Runner executes at the relevant lifecycle point:

| Office | Lifecycle point the veto Guard runs at | Trigger |
|---|---|---|
| Security | pre-effect | any effect at class 3; any egress change; any capability widening (`/docs-v2/01-org-chart-v2.md` §3) |
| Quality | pre-deliverable | any Deliverable above the department's declared review threshold (`/docs-v2/03-department-architecture.md` §2, `[review].office_quality`) |
| Architecture | pre-deliverable / pre-commit | a cross-department contract change or a new `provides.contracts` entry (`/docs-v2/03-department-architecture.md` §2, `[review].office_architecture`) |
| Cost | pre-effect | any Work Order above $5; any budget-ceiling change (`/docs-v2/01-org-chart-v2.md` §3) |

Two properties are load-bearing and are what ADR-0042 records:

1. **The veto blocks; it never warns.** A Guard may warn or block (`/docs-v2/02-agent-architecture-v2.md` §6);
   a veto Guard is configured as blocking and its verdict cannot be downgraded to a warning by any setting,
   Review Intensity level, or Division executive. Conflating "you may not" with "you did it badly" is exactly
   the failure the Guard/Fence distinction exists to prevent; a veto is on the Fence side of that line for its
   scope (`/docs-v2/02-agent-architecture-v2.md` §6; `/MASTER_IMPLEMENTATION_GUIDE.md` §10 failure mode 3).
2. **A Division executive cannot override a veto.** The override path is the Principal only, and only for
   Security, recorded as a Decision (ADR-0015; `/docs-v2/03-executive-cabinet.md`, Corvus). The Guard Runner
   refuses an override actor that is not `principal`.

### 5.3 How a veto differs from a review block

Both are "no", and they are different mechanisms:

| | Review block (ADR-0008) | Office veto (ADR-0015 / ADR-0042) |
|---|---|---|
| Who issues it | a reviewer (author≠reviewer) on a specific Deliverable | an Office, on any subject in its scope, firm-wide |
| Scope | that Deliverable, that Engagement | any effect/deliverable/spend/contract across the Firm |
| Record | `reviews.verdict='block'` (`/docs/04-database-design.md` §2) | a `Veto` record on the hash chain (`veto_records`) |
| Resolution | rework and re-review | the veto stands; the department may file a **dissent** (recorded, surfaced in the Brief), but the work does not proceed (`/docs-v2/01-org-chart-v2.md` §5) |
| Override | not applicable — it is resolved by fixing the work | Principal only, Security only, as a Decision |
| Enforced by | the orchestrator's review step | the Guard Runner at the choke point |

A department confronted with a veto may file a dissent — the v1 decision engine's mechanism
(`/docs-v2/01-org-chart-v2.md` §5) — which is recorded verbatim (`/docs/04-database-design.md` §5, `dissents`)
and surfaced to the Principal in the Brief. **The work does not proceed** while the veto stands. A conflict
unresolved after two rounds becomes an Approval Request in the next Brief with both positions in one sentence
each (`/docs-v2/01-org-chart-v2.md` §5 deadlock rule).

### 5.4 The dual-hat boundary (`reviewer_division != author_division`)

Rune holds the Architecture Office and the Engineering Division; Corvus holds the Security Office and the
Security Division. When an artifact under review originates *inside* the reviewer's own Division, the Office
head must not be the reviewer. In that case the Office's review is performed by an Office reviewer instance
(`agent.office.<office>.reviewer.<nn>`), not by the head personally
(`/docs-v2/01-org-chart-v2.md` §3). The orchestrator enforces this exactly as it enforces ADR-0008: the rule
`reviewer_id != author_id` extends to `reviewer_division != author_division` for Office reviews. Argus and
Cass have no Division and therefore never hit this case.

### 5.5 Which Office holds which veto, and the veto-rate floor

The scopes and mandatory-review triggers, from `/docs-v2/01-org-chart-v2.md` §3:

| Office | Head | Veto scope | Must review |
|---|---|---|---|
| Security | Corvus | any class-3 effect; any egress change; any capability widening | every class-2+ effect; every Integration grant; every Pack install |
| Quality | Argus | any Deliverable failing acceptance criteria or a Standard | every Deliverable above the department's declared threshold |
| Architecture | Rune | any change to a contract, interface, or registered architectural stance | cross-department contract changes; new `provides.contracts` entries |
| Cost | Cass | any spend exceeding an approved ceiling; any Engagement projected above its Mandate | any Work Order above $5; any budget-ceiling change |

**Veto rate has a floor.** An Office approving above 95% is a defect, not a success signal — the single
instrument that distinguishes a working review structure from a ceremonial one (ADR-0015;
`/docs-v2/02-agent-architecture-v2.md` §7; `/docs-v2/03-executive-cabinet.md`, Argus/Corvus). M12 ships the
`veto_records` projection precisely so this rate is computable, surfaced in the weekly Office Review
(`/docs-v2/03-executive-cabinet.md`, Cabinet meetings), and flaggable in CI as a conformance concern. This is
the row most likely to be quietly dropped during implementation, and it is the one that determines whether the
entire review structure is real (`/docs-v2/02-agent-architecture-v2.md` §7).

---

## 6. The Rail

The Rail is the visible surface of M12 and the only interface change the Principal is meant to notice
(`/docs-v2/01-migration-strategy.md` §7).

- **What it shows.** The eight Divisions, drawn from the org graph (`/docs-v2/01-enterprise-architecture.md`
  §2, "Rail(8 Divisions)"). ⌘1–⌘8 bind to the eight Divisions and rebind from v1's room bindings
  (`/docs-v2/01-migration-strategy.md` §7 step 5). A department room is reached *inside* its Division room, not
  from the Rail (`/docs-v2/03-department-architecture.md` §6).
- **It is a thin projection.** The Rail renders the org graph and holds no logic. This is the Layer-2
  replaceability test (`/docs-v2/02-layer-model.md` §9): swap all eight Division charters and the Rail still
  renders eight Divisions; departments and the kernel are unaffected. A Rail that accreted routing or veto
  logic would turn a "yes" into a "no" on that test and is an architectural regression.
- **It never becomes the product.** The Rail shows eight fixed Divisions regardless of how many departments
  are installed. It does not grow a control per department, per Office, or per hop. The visible surface of the
  organisation must not expand with the organisation — that is the shape of failure mode 4
  (`/MASTER_IMPLEMENTATION_GUIDE.md` §10).
- **The change is announced.** The Rail-shows-Divisions change is announced in the Brief with a one-line
  explanation and a link to the new shape, because it is a real change and the one most likely to be mildly
  annoying for a week (`/docs-v2/01-migration-strategy.md` §7).

---

## 7. Archetype vs instance, as it bears on staffing Divisions (ADR-0014)

The Archetype/Instance split (ADR-0014; `/docs-v2/02-agent-architecture-v2.md` §1) governs how the structure
is staffed:

- **Division executives are named, eager instances.** The thirteen named agents keep their v1 IDs forever
  (`/docs-v2/02-agent-architecture-v2.md` §3); `agent.cto` is still Rune even though Rune now heads a Division
  and an Office. Two are new — Corvus (`agent.ciso`) and Lyra (`agent.studio`) — and both are justified in the
  org chart (`/docs-v2/01-org-chart-v2.md` §3–§4). Division executives are instantiated when the structure is
  established, not lazily; they are the standing cabinet the Principal converses with
  (`/docs-v2/03-executive-cabinet.md`).
- **Office reviewer instances are lazy.** `agent.office.<office>.reviewer.<nn>` instances are instantiated on
  demand to satisfy the dual-hat boundary (§5.4) — when an artifact originates inside Rune's or Corvus's own
  Division and the head cannot be the reviewer. Offices stay small by construction: 0–3 reviewer instances
  (`/docs-v2/01-org-chart-v2.md` §7).
- **Department roles are not M12's concern.** The archetypes inside departments instantiate lazily in M13; M12
  establishes the Divisions and Offices those departments will later populate. An instance's charter is frozen
  at instantiation (ADR-0014), so a Division executive appointed in M12 is reproducible in every later replay.

M12 does not multiply charters: it adds two named executive charters (Corvus, Lyra) and reassigns Argus and
Cass out of the delivery line (`/docs-v2/01-org-chart-v2.md` §2). The 400 MB idle budget survives because the
structure is manifest data, not resident agents (ADR-0014).

---

## 8. The five-tool invariant, extended to every Division executive (ADR-0004)

The Executive holds five tools: retrieve, delegate, convene, decide, report. This extends to every Division
executive (`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 7; ADR-0004; `/docs-v2/02-layer-model.md` §2). M12 makes
the extension mechanical:

1. **Construction.** `DivisionExecutive` (§4.5) cannot be constructed with any tool set but the fixed five.
   There is no manifest field and no runtime grant that adds a sixth.
2. **CI enforcement.** A CI check asserts that every Division executive charter declares exactly the five tools
   and no more — the same style of check as the kernel-neutrality grep
   (`/MASTER_IMPLEMENTATION_GUIDE.md` §7, "Kernel neutrality"). The build fails on a sixth tool on any
   executive.
3. **Why it is non-negotiable.** A Division executive with a sixth tool can do domain work; a Division that
   does domain work has become a specialist and the Division has lost its purpose
   (`/docs-v2/02-layer-model.md` §2). This is the property that lets the Executive Layer stay replaceable
   (`/docs-v2/02-layer-model.md` §9).

The Office heads that are not Division executives (Argus, Cass) perform no delivery work either — they own
nothing and author no Deliverable (§3.1; ADR-0015) — so the same "no domain work" discipline holds across the
whole Executive Layer.

---

## 9. Guarding against failure mode 4 — the organisation must not become the product

R-01 is the defining risk of 2.0: four hops, three reviews, five Guards, nine minutes for a Brief v1 produced
in ninety seconds (`/MASTER_IMPLEMENTATION_GUIDE.md` §10 failure mode 4; `/docs-v2/01-risk-analysis.md`). M12
is the milestone that introduces the extra hop (ADR-0012) and the firm-wide vetoes (ADR-0015), so M12 is where
this risk is priced and gated.

**The budgets, as CI gates against the v1 baseline:**

| Budget | Gate | Source |
|---|---|---|
| Median Directive-to-Brief **latency** | must not regress against the recorded v1 baseline | `/MASTER_IMPLEMENTATION_GUIDE.md` §10 failure mode 4 (R-01) — a release blocker |
| Principal-facing **token count** per Brief | must not regress against the v1 baseline | same |
| Brief length | ≤600 words regardless of org size | Principle 1; `/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 13 |
| Notification budget | five things may interrupt; does not scale with the org | `/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 14 |

**The mitigations M12 must implement, not merely assert:**

- **Fast-lane target rises 50% → 65%.** Most Directives resolve to one department and never see the Division
  layer (`/docs-v2/03-executive-cabinet.md`, Kai; ADR-0012). The routing step is deterministic where the
  Directive names a known department, artifact path, or Application — Principle 8 — so it costs no model call
  in the common case (`/docs-v2/01-enterprise-architecture.md` §4).
- **The veto is a Guard at an existing lifecycle point, not an extra model call** where the effect already
  passes through the Broker (§5.2). Class-3 effects, egress changes, and capability widenings already traverse
  the choke point (`/docs-v2/02-layer-model.md` §6); the veto Guard runs there.
- **One Brief, one ask, ≤600 words** — the Brief budget does not scale with the number of Divisions or Offices
  (Principle 1). Kai's Collect+Report phase caps at ≤600 words whether one agent or forty contributed
  (`/docs-v2/01-enterprise-architecture.md` §4).
- **The Cabinet Standup has a one-paragraph output cap and is cancelled when nothing crosses a Division
  boundary** — twelve executives in a room is exactly the meeting that expands to fill available time
  (`/docs-v2/03-executive-cabinet.md`, Cabinet meetings).

The latency/token gate is decomposed into acceptance criteria AC6 and is one of the two things the final epic
proves. It is a release blocker: if a budget is exceeded, do less work — do not raise the number
(`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 16).

---

## Persistence, events, and the public surface

### P.1 New tables — all projections (forward-only migrations, band `0007`–`0010`)

M12 owns migration band `0007`–`0010`, additive and forward-only (`/docs/04-database-design.md` §10; band
assigned to M12 by the milestone plan). Migrations 0001 (M2 baseline) and 0002–0006 (M11 substrate) are not
touched; bands 0019+ belong to M15/M16.

| Migration | Table | Purpose |
|---|---|---|
| `0007_divisions.sql` | `divisions` | id, name, executive_agent_id, budget_share, established_at. Adds nullable `departments.division_id` (additive FK; populated in M13). |
| `0008_offices.sql` | `offices` | id, name, head_agent_id, veto_scope, precedence, home_division_id (nullable), established_at |
| `0009_veto_records.sql` | `veto_records` | the audit projection: id, office_id, scope, subject_type, subject_id, author_division_id, reviewer_id, verdict, dissent_id, overridden_by, invoked_at |
| `0010_division_executives.sql` | `division_executives` | division_id, agent_id, tool_count `CHECK (tool_count = 5)`, appointed_at |

Every table is a projection rebuildable from the event log (`/docs/04-database-design.md` §1 rule 2). Additive
columns only elsewhere; no existing column's meaning changes (`/docs-v2/01-migration-strategy.md` §2). **A Firm
with no established structure behaves exactly as the M11 one-implicit-department Firm** — a null structure is a
fully supported state, not a migration artifact (`/docs-v2/01-migration-strategy.md` §4 steps 1–4). Each
migration ships with a test that runs it against a fixture Vault from the previous release
(`/docs/04-database-design.md` §10). The `division_executives.tool_count` CHECK is the schema-level echo of the
five-tool invariant (§8).

### P.2 Domain events

Every event carries `actor`, the relevant structural id, and (where applicable) `division_id`/`office_id`, and
lands on the hash chain (`/docs/04-database-design.md` §4, `events`; ADR-0002). No v1 or M11 event kind is
removed or redefined (`/docs-v2/01-migration-strategy.md` §2):

`StructureManifestApplied` · `DivisionEstablished` · `DivisionExecutiveAppointed` · `OfficeEstablished` ·
`OfficeHeadAppointed` · `DirectiveRoutedToDivision` · `VetoInvoked` · `VetoUpheld` · `VetoOverridden` ·
`DissentFiled` · `OfficeReviewerInstantiated` · `DivisionBudgetAllocated`.

`StructureManifestApplied` is the event backing the migration-strategy step-5 Decision
(`/docs-v2/01-migration-strategy.md` §3): applying the structure is a Decision the Principal makes, recorded on
the log, reversible by re-applying the previous manifest.

### P.3 Vault Markdown mirror (v1 rule — the archive outlives the software)

```
~/Sidra/
└── organisation/
    ├── divisions.md        the eight Divisions, their executives, member departments — human-readable
    ├── offices.md          the four Offices, their veto scopes, their heads, precedence — plain language
    └── vetoes/             per-day veto log: office, subject, verdict, dissent — for audit
```

Written on structural transitions and veto invocations, not continuously (mirrors
`/docs/04-database-design.md` and the M16 Vault-mirror pattern). A Principal who abandons Sidra OS keeps a
readable record of the Firm's shape and every veto ever exercised.

### P.4 Public commands

| Command | Effect | Notes |
|---|---|---|
| `apply_structure_manifest(manifest)` | Divisions + Offices established | a Principal **Decision** (`/docs-v2/01-migration-strategy.md` §3); reversible by re-applying the prior manifest |
| `establish_division(id, executive)` | `DivisionEstablished` | executive must hold exactly five tools (ADR-0004); refused otherwise |
| `establish_office(id, head, scope, precedence)` | `OfficeEstablished` | head owns no department and no Deliverable (ADR-0015) |
| `route_directive(directive)` → `Division` | `DirectiveRoutedToDivision` | deterministic where the Directive names a known department/path/Application (Principle 8); skipped on the fast lane |
| `invoke_veto(office, subject)` → `Veto` | `VetoInvoked` + `VetoUpheld` | the §5 path; blocks at the choke point; not overridable by a Division executive |
| `override_veto(veto, principal, risk)` | `VetoOverridden` | **Principal only, Security Office only**, recorded as a Decision with the accepted risk named (ADR-0015) |
| `file_dissent(veto, department, position)` | `DissentFiled` | recorded verbatim; surfaced in the Brief; work does not proceed (`/docs-v2/01-org-chart-v2.md` §5) |

### P.5 Public queries

| Query | Returns |
|---|---|
| `list_divisions()` | the eight Divisions and their executives — powers the Rail (§6) |
| `list_offices()` | the four Offices, their scopes, and precedence |
| `office_veto_rate(office, window)` | approval/veto rate — the ceremonial-review instrument (§5.5) |
| `division_of(department)` | which Division a department belongs to |
| `structure_snapshot()` | the current org graph, for the Vault mirror and the Inspector |

### P.6 API rules

1. **Applying, re-expressing, or reversing the structure is a Decision** — logged, shown to the Principal as
   the manifest before it applies (`/docs-v2/01-migration-strategy.md` §3; Principle 14).
2. **No query returns a mutable org graph** — the Rail and Inspector receive a read-only snapshot (§6).
3. **`override_veto` accepts only `principal` as the overriding actor**, and only for the Security Office
   (ADR-0015); the Guard Runner refuses any other actor.
4. **Every structural change and every veto is an event on the hash chain** before any projection updates
   (`/docs/04-database-design.md` §1 rule 2).

---

## Sequence diagrams

### S.1 A firm-wide veto blocking an action (the exit criterion)

```
Agent(deptX)   Orchestrator   GuardRunner(Security Office)   Broker      Effect
  │ produce class-3 effect │             │                     │           │
  ├───────────────────────►│ pre-effect Guard ───────────────► │           │
  │                        │             │ scope match? class-3 → YES       │
  │                        │             │ VetoInvoked (hash chain)         │
  │                        │             │ verdict = Upheld (BLOCK)         │
  │◄─── Blocked{veto} ─────┤◄────────────┤ (not a warning; not downgradable)│
  │  (nothing dispatched — the veto blocks at the choke point, firm-wide, ADR-0042)
  │                        │             │
  │ file_dissent(position) │             │
  ├───────────────────────►│ DissentFiled (recorded verbatim, surfaced in the Brief)
  │  work does NOT proceed; a Division executive CANNOT override (ADR-0015)
  │  (override path: Principal only, Security only, recorded as a Decision)
```

### S.2 A Directive flowing Executive → Division → Department

```
Principal   Kai(exec)        Registrar/Division exec     Department        Offices
   │ Directive │                    │                        │                │
   ├──────────►│ Analyze — fast-lane check                   │                │
   │           │  ├─ resolves to one dept, class ≤1? ─► delegate direct (65%) ─► Brief
   │           │  └─ else: Strategize → Mandate              │                │
   │           │ route_directive ──► Division(Engineering)   │                │
   │           │                     │ select departments ──►│ Turns          │
   │           │                     │ Registrar instantiates archetypes (lazy, M13)
   │           │                     │                        │ Deliverables ─►│ Quality/Arch review
   │           │                     │                        │                │ (veto or pass)
   │           │◄──────────── Collect ───────────────────────┤◄───────────────┤
   │◄─ one Brief, one ask, ≤600 words ─┤ (latency/tokens within v1 baseline — R-01 gate)
```

Depth 3: Kai → Division → Department → specialist (ADR-0012). The Division hop is skipped on the fast lane and
deterministic when the Directive names a known target (Principle 8).

---

## Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | An Office approves everything (ceremonial review) | Detectable: `office_veto_rate` above 95% is flagged as an Office defect, surfaced in the weekly Office Review and in CI conformance (§5.5; ADR-0015). Not a silent state. |
| F2 | A veto adds latency that regresses the Brief | The latency/token CI gate blocks the release; the veto runs as a Guard at an existing choke point, not an extra model call, and the fast lane bypasses the layer entirely (§9; R-01). |
| F3 | A Division executive is granted a sixth tool | Impossible at construction (§4.5) and caught by the CI five-tool check (§8); the build fails (ADR-0004). |
| F4 | A Division executive tries to override a veto | Refused: `override_veto` accepts only `principal`, only for Security (§P.6 rule 3; ADR-0015). The veto stands; the department may file a dissent. |
| F5 | Rune reviews an artifact from his own Engineering Division | A reviewer instance conducts the review, not Rune; enforced by `reviewer_division != author_division` (§5.4; `/docs-v2/01-org-chart-v2.md` §3). |
| F6 | Two Offices conflict and Kai cannot resolve | Precedence applies: Security > Quality > Architecture > Cost (§3.1; ADR-0015). Unresolved after two rounds → Approval Request in the next Brief (`/docs-v2/01-org-chart-v2.md` §5). |
| F7 | The structure manifest is applied silently | Impossible: `apply_structure_manifest` is a Principal Decision shown before it applies (§P.6 rule 1; Principle 14). No admin side-door exists. |
| F8 | A Division is established with zero departments | Legitimate — the Division skeleton exists before M13 populates it; a Division of one (Security) is legitimate by design (§3.1; `/docs-v2/01-org-chart-v2.md` §4, §7). |
| F9 | An Office head authors a Deliverable | Refused: an Office owns no Deliverable (§4.3; ADR-0015). An Office that produces work has become a department and is a structural error. |

---

## Performance and offline

- **The fast lane is the performance strategy.** 65% of Directives skip the Division layer entirely
  (`/docs-v2/03-executive-cabinet.md`, Kai); the routing step is deterministic (no model call) when the
  Directive names a known target (Principle 8). The added hop is priced and gated, not assumed away (§9).
- **The veto is off the model hot path.** Veto Guards run at existing lifecycle points against structural
  facts (effect class, spend, contract change), not via a model call, so a veto costs a policy check, not a
  Turn (§5.2).
- **Structure is resident but tiny.** The eight Division and four Office records are manifest data; the 400 MB
  idle budget survives because structure is data, not resident agents (ADR-0014; §7). Office reviewer
  instances are lazy (§7).
- **Offline is unaffected.** M12 adds no outbound path; local work continues offline exactly as at v1
  (`/docs-v2/02-layer-model.md` §9, Layer-6 test is unchanged because M12 touches Layers 1–3 only).

---

## Dependencies, assumptions, risks

### D.1 Dependencies

| On | For |
|---|---|
| **M11 — department substrate** | the Registrar's org graph, the Guard Runner, the Standards Engine, the Exchange, and the replay-equivalence test M12 builds visible structure on top of (`/docs-v2/01-enterprise-architecture.md` §3; `/docs-v2/01-migration-strategy.md` §4 steps 1–4) |
| M3 — Permission Broker | the choke point the veto Guard extends (`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 5) |
| M2 — event log | structural and veto events on the hash chain (`/docs/04-database-design.md` §4; ADR-0002) |
| v1 surface (Rail) | the projection surface the Rail extends to show Divisions (`/docs-v2/01-enterprise-architecture.md` §2) |

### D.2 Assumptions

1. **M11 is architecturally complete** — the one-implicit-department Firm replays byte-identically, the Guard
   Runner and Exchange are shipped (dormant), and the schema additions of migration steps 1–4 are in place
   (`/docs-v2/01-migration-strategy.md` §4). This is the STEP-1 gate; see `00-M11-AUDIT.md`.
2. **The thirteen named charters exist or are added by M12.** Kai, Rune, Iris, Orin, Atlas, Sable, Argus,
   Cass, Quill are v1 charters carried forward; Corvus and Lyra are added by M12
   (`/docs-v2/03-executive-cabinet.md`; `/docs-v2/01-org-chart-v2.md` §2).
3. **Departments arrive in M13, not M12.** M12 establishes empty-to-sparse Divisions; the member departments
   populate in M13 (`/MILESTONE_REGISTRY.md` §4, M13). A Division with no departments is a valid M12 end state.

### D.3 Risks

| # | Risk | Mitigation |
|---|---|---|
| SR-1 | The organisation becomes the product — latency/token regression (R-01) | Latency and token CI gates against the v1 baseline; fast-lane 50%→65%; veto as a choke-point Guard, not a model call; Brief ≤600 words (§9) |
| SR-2 | Ceremonial review — Offices approve everything (failure mode 3) | `office_veto_rate` instrument; the 95%-approval-is-a-defect floor surfaced in the Office Review and CI (§5.5; ADR-0015) |
| SR-3 | A Division executive accretes a sixth tool | Construction precondition + `tool_count = 5` CHECK + CI five-tool grep (§8; ADR-0004) |
| SR-4 | The dual-hat boundary is implemented wrong (Rune reviews his own Division) | `reviewer_division != author_division` enforced mechanically, not by documentation (§5.4; `/docs-v2/01-org-chart-v2.md` §3) |
| SR-5 | A structural change bypasses the log (silent meta-layer, failure mode 8) | `apply_structure_manifest` is a Decision; no admin side-door; every change is an event (§P.6; Principle 14) |
| SR-6 | Migration breaks the M11 Firm | Additive, forward-only 0007–0010; null structure = M11 behaviour; replay equivalence still green (§P.1; `/docs-v2/01-migration-strategy.md` §2) |

---

## Acceptance criteria

The exit criterion — *eight Divisions, four Offices, the Rail shows Divisions, and vetoes work firm-wide* —
decomposed into testable claims. **These are the contract with AntiGravity.**

| # | Claim | Proven by |
|---|---|---|
| AC1 | **Eight Divisions** are established, each with a named executive; the org graph holds exactly eight Division nodes (Engineering, Platform, Intelligence, Security, Product, Game Studio, Commercial, Corporate) | structure-establishment test asserting eight `divisions` rows with executives (§3.1) |
| AC2 | **Four Offices** are established (Quality, Cost, Architecture, Security), each holding exactly one scoped veto, each owning no department and no Deliverable | office-establishment test; an Office authoring a Deliverable is refused (§3.1, §4.3; ADR-0015) |
| AC3 | **The Rail shows the eight Divisions**, ⌘1–⌘8 bind to them, and the Rail is a read-only projection holding no logic | Rail projection/snapshot test; a Layer-2 replaceability test swapping charters leaves the Rail rendering eight Divisions (§6; `/docs-v2/02-layer-model.md` §9) |
| AC4 | **A veto blocks firm-wide, proven by test** — an Office veto blocks an effect anywhere in the Firm at the choke point, is not overridable by a Division executive, and the block is a `VetoUpheld` event on the hash chain | **the exit-criterion veto test (§S.1)**, asserting the effect is blocked, no Division-executive override succeeds, and the event is on the chain (ADR-0015, ADR-0042) |
| AC5 | **No executive exceeds five tools** — every Division executive holds exactly {retrieve, delegate, convene, decide, report} | the CI five-tool check + `division_executives.tool_count = 5` CHECK; a sixth tool fails the build (§8; ADR-0004) |
| AC6 | **Principal-facing latency and token count are not regressed** against the v1 baseline; the Brief stays ≤600 words | latency/token CI gate replaying the v1 baseline corpus; Brief-length assertion (§9; R-01, Principle 1) |
| AC7 | Divisions sit between the Executive and Departments — a routed Directive traverses Kai → Division → Department (depth 3); the fast lane skips the Division hop | routing test asserting depth-3 for a routed Directive and depth-1 for a fast-lane Directive (§3.3; ADR-0012) |
| AC8 | The dual-hat boundary holds — an artifact originating in Rune's or Corvus's own Division is reviewed by a reviewer instance, not the head | `reviewer_division != author_division` test over a dual-hat Office review (§5.4; `/docs-v2/01-org-chart-v2.md` §3) |
| AC9 | A department confronted with a veto may file a dissent that is recorded verbatim and surfaced in the Brief; the work does not proceed | dissent test asserting the record, the Brief surfacing, and the halted work (§5.3; `/docs-v2/01-org-chart-v2.md` §5) |
| AC10 | Office precedence resolves conflicts — Security > Quality > Architecture > Cost | precedence property test over conflicting Office vetoes (§3.1; ADR-0015) |
| AC11 | The veto-rate instrument exists — `office_veto_rate` is computable and an above-95% approval rate is flaggable as a defect | veto-rate query test over a `veto_records` fixture (§5.5; ADR-0015) |
| AC12 | Everything is additive — a Firm with no established structure behaves exactly as the M11 one-implicit-department Firm, and the replay-equivalence test stays green | replay-equivalence test on a null-structure Firm; forward-only migration test against a prior-release fixture (§P.1; `/docs-v2/01-migration-strategy.md` §2, §6) |
| AC13 | Every structural change and every veto is an audited event on the hash chain | `audit.verify` over a structure-and-veto lifecycle fixture (§P.2; ADR-0002) |

---

## Appendix A — Glossary additions

- **Division** — a node in the org graph between the Executive and the Departments; a named executive, 0–4
  member departments, a budget share. Routes, arbitrates, holds budget; performs no domain work (ADR-0012).
- **Office** — a cross-cutting authority outside every delivery line, belonging to no Division, holding one
  scoped firm-wide veto, performing no delivery work (ADR-0015).
- **Veto** — a non-downgradable block an Office places on a subject within its scope, enforced at the choke
  point, effective firm-wide, overridable only by the Principal and only for Security (ADR-0015, ADR-0042).
- **Division executive** — the named agent heading a Division; holds exactly five tools (ADR-0004).
- **Dissent** — a department's recorded objection to a veto; surfaced in the Brief; does not make the work
  proceed (`/docs-v2/01-org-chart-v2.md` §5).
- **The Rail** — the shell surface showing the eight Divisions; a thin read-only projection of the org graph
  (§6).

## Appendix B — Repository placement

**No new crate.** M12 is organisational structure over the M11 substrate and the existing kernel crates. It
extends:

```
services/departments/           EXTENDED (sidra-departments — the Registrar holds the org graph)
    org_graph/                    Division and Office nodes; division_executives; membership
services/security/              EXTENDED (sidra-security — Guard Runner + Broker)
    veto/                         the blocking veto Guard; precedence; override-actor gate; dual-hat check
services/orchestrator/          EXTENDED (sidra-orchestrator)
    routing/                      Kai → Division → Department routing; fast-lane; dissent recording
services/agents/                EXTENDED (sidra-agents)
    executive/                    Corvus + Lyra charters (new); Argus/Cass reassignment; five-tool constraint
packages/domain/                EXTENDED (sidra-domain)
    structure/                    Division, Office, Veto, DivisionExecutive value objects + invariants
services/store/migrations/      EXTENDED — 0007_divisions.sql … 0010_division_executives.sql (forward-only)
apps/*                          EXTENDED — the Rail projection (renderer) + list_divisions query
infrastructure/testing/
    structure/                    NEW — firm-wide-veto proof, five-tool check, latency/token gate, replay
infrastructure/ci/              EXTENDED — five-tool executive check; latency/token gate
```

**Dependency direction (ADR-0011; `/docs/01-technical-architecture.md` §6).**
`packages/domain ← services/* ← apps/*`. The veto logic lives in `sidra-security` (the Broker's neighbourhood,
`/docs-v2/01-enterprise-architecture.md` §3); the org graph lives in `sidra-departments` (which "holds the org
graph", same source). No crate gains an edge it did not have; `packages/domain` gains no I/O dependency
(`/MASTER_IMPLEMENTATION_GUIDE.md` §7). No new crate is warranted, and adding one would violate the guidance
that a Division/Office is structure over the substrate, not a new subsystem.

## Appendix C — Implementation position

M12 is the second milestone of 2.0 "Concourse" and the first *visible* enterprise structure
(`/MILESTONE_REGISTRY.md` §4). **M11 gates M12 absolutely** (`/MASTER_IMPLEMENTATION_GUIDE.md` §5): building
M12's visible structure before M11's invisible substrate means shipping an interface change before the
equivalence test exists to prove nothing else moved — the single ordering mistake that converts this migration
into a rewrite. M12 is migration steps 5 and 6 (`/docs-v2/01-migration-strategy.md` §4): re-express the Firm as
the structure manifest (the Rail changes) and formalise the Offices (veto scopes widen firm-wide). Both are
Decisions the Principal makes, both are reversible, both are announced in the Brief
(`/docs-v2/01-migration-strategy.md` §7).

**Exit criterion.** Eight Divisions, four Offices, the Rail shows Divisions, and vetoes work firm-wide — the
veto proven by test, not by configuration (AC4).
</content>
</invoke>
