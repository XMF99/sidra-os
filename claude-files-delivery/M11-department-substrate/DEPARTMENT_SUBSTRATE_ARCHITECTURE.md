# Department Substrate — Architecture

**Milestone M11 · Release 2.0 "Concourse" · Layer 1 (Core Platform)**

| | |
|---|---|
| Milestone | M11 — Department substrate (`/MILESTONE_REGISTRY.md` §4, 2.0 "Concourse") |
| Release | 2.0 "Concourse" — the Firm becomes a company (first milestone) |
| Layer | 1 — Core Platform (`/docs-v2/02-layer-model.md` §1); the substrate is kernel machinery |
| New crate | `sidra-departments` at `services/departments/` |
| Depends on | M2 (event log, hash chain), M3 (Permission Broker, capability model), M4 (Model Gateway budget ceilings), M5 (memory namespaces), M6 (orchestrator, Work Orders) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | The **replay-equivalence test is green** — a recorded v1 Engagement produces a **byte-identical Brief** after the substrate lands, with model calls stubbed; nothing visible to the Principal changes (`/docs-v2/01-migration-strategy.md` §6) |

> **Authoritative precedence.** Where this document disagrees with a v1 document (`/docs/*`), the v1 document
> governs and this document is a defect to be reported (`/MASTER_IMPLEMENTATION_GUIDE.md` §2). The only
> exceptions are the ten claims v2 explicitly supersedes, each carrying an ADR. Where this document concerns
> **layer semantics** — what a department may and may not do, and which layer owns which mechanism — the layer
> model (`/docs-v2/02-layer-model.md`) governs. Where it concerns **what a department is, mechanically**,
> `/docs-v2/03-department-architecture.md` governs. This architecture *operationalises* those documents into a
> buildable milestone; it re-decides nothing in them. The milestone's meaning is fixed by
> `/MILESTONE_REGISTRY.md` §4, which is authoritative over `/MASTER_IMPLEMENTATION_GUIDE.md` §5 where they differ.

---

## 1. Why this substrate exists

### 1.1 The problem

Through M10 the Firm is one flat organisation: one Executive, four departments in the loose v1 sense, eleven
agents, one machine (`/docs-v2/01-enterprise-architecture.md` §1). Nothing in v1 is a **boundary**. An agent's
memory, its capability grant, its budget, and its filesystem writes are governed by firm-wide rules with no
intermediate scope between the agent and the Firm. "Department" in v1 is a `charter` string on an `agents`
row (`/docs/04-database-design.md` §3, `departments` table) — a **label**, not an enforced isolation surface.

Principle 11 states that a department is a boundary, not a label (`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 10,
ADR-0013). v2 rests everything above it — Divisions (M12), installable Department Packs (M13), the Game Studio
and Marketplace (M14), the Mission Engine (M15), and the connector grant model (M16) — on that boundary being
real and mechanical. **None of those milestones can be built correctly until the boundary primitive exists in
the kernel.** M16, for example, cannot grant a connector "to exactly one department" if a department is not yet
a thing the kernel can name (`/docs-v2/03-department-architecture.md` §4; M16 architecture §16.2 assumption 1).

The requirement is therefore not "add departments to the UI." Building visible structure first is the single
ordering mistake that turns the migration into a rewrite (`/docs-v2/02-implementation-changes.md` §2;
`/MASTER_IMPLEMENTATION_GUIDE.md` §5 critical path). The requirement is: **introduce the boundary primitive
into the kernel invisibly, express the entire running v1 Firm as one implicit department that behaves
byte-for-byte as it did before, and prove that equivalence with a test — so that every later milestone can add
visible structure on top of a substrate already known to change nothing.**

### 1.2 The stance

Three v1 decisions, made before there was any v2 to design for, make an invisible substrate possible
(`/docs-v2/01-migration-strategy.md` §1):

1. **The event log is the source of truth (ADR-0002).** Tables are projections. Adding a department adds
   columns and rebuilds projections; it migrates no state, because there is no state to migrate.
2. **Work Orders are typed and durable (ADR-0010).** The routing envelope already carries budget and fences
   and already survives restart. The substrate adds two optional fields, nothing structural.
3. **The kernel is a library, not app logic (`/docs/01-technical-architecture.md` §1, §6).** Departments load
   into a kernel that does not know what a department is until it reads a manifest.

The substrate is the machinery that turns those three properties into a boundary primitive, under the binding
compatibility contract (`/docs-v2/01-migration-strategy.md` §2): no event kind removed or redefined, no column
dropped or repurposed, every new field optional with a v1-equivalent default, no Principal-facing behaviour
changed without a setting, migrations forward-only and idempotent. A change that cannot be made under those
rules is not made in M11.

### 1.3 What the substrate is, mechanically

The substrate is **the five faces of the department boundary made enforceable in the kernel, plus the implicit
default department that lets a v1 record participate in the boundary while behaving exactly as v1**. The five
faces are the checklist an install must satisfy (`/docs-v2/03-department-architecture.md` §4;
`/docs-v2/01-enterprise-architecture.md` §5; `/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 10):

```
Layer 1  sidra-departments   ← the boundary primitive: DepartmentId, the five faces, the implicit    (M11, THIS DOC)
                               default department, org-graph skeleton, replay harness
Layer 3  a Department Pack    ← a signed, installable department.toml + roles/playbooks/standards/…   (M13 installs them)
```

At M11 there is exactly **one** department — the implicit default — and it is invisible. The Registrar's
instantiation UI, the Exchange carrying real cross-department traffic, the Standards Engine resolving real
standards, and installable Packs are all M12–M13 (`/docs-v2/01-migration-strategy.md` §4 steps 5–7). M11 lays
the seam they attach to and proves the seam changed nothing.

### 1.4 What the substrate must never become

- **A visible reorganisation.** The exit criterion is byte-identical behaviour and zero Principal-facing
  change (`/docs-v2/02-implementation-changes.md` §1 M11: "Nothing is visible to the Principal at the end of
  M11. That is the exit criterion, not a shortcoming"). The Rail does not change; ⌘-bindings do not rebind;
  the Brief does not gain a field. That is M12 (`/docs-v2/01-migration-strategy.md` §7, step 5).
- **A kernel that knows department names.** No `if department == "backend"`, no hardcoded list of the
  twenty-one (`/docs-v2/02-layer-model.md` §1; `/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 12). The kernel knows
  what a department *is* — a scope conforming to the boundary contract — and nothing about which ones exist.
  Enforced by a CI grep that fails the build on any department identifier in a kernel crate (§6).
- **A migration event.** There is no cut-over, no data migration, no outage (`/docs-v2/01-migration-strategy.md`
  §preamble). The substrate is a sequence of additive, independently shippable schema and service changes,
  each leaving a working Firm and each reversible by a feature flag (steps 1–4 of the sequence are invisible).
- **A place where the boundary is enforced by a participant.** Isolation enforced by a department is not
  isolation (`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 5; `/docs-v2/01-enterprise-architecture.md` §3). Every
  face is enforced by an existing kernel choke point — the Permission Broker, the Memory Service, the Model
  Gateway — parameterised by department, never by a new self-checking component.

### 1.5 Relationship to existing concepts

| Existing concept | How M11 relates |
|---|---|
| Permission Broker (M3) | Capability and filesystem faces are enforced here. M11 makes the department grant an intermediate ceiling between the Principal's approval and the agent's grant — "three nested subsets, checked at issue time" (`/docs-v2/03-department-architecture.md` §4.2). The Broker remains the only choke point; M11 adds no side-door. |
| Memory Service (M5) | The memory-namespace face. Writes go to `dept.<id>.*`; a null namespace is the global v1 namespace (`/docs-v2/02-implementation-changes.md` §3). M11 adds namespace scoping to retrieval, not a new store. |
| Model Gateway (M4) | The budget face. The department sub-ceiling is the **fourth** nested ceiling inserted between engagement and month (ADR-0020). The three v1 ceilings keep their semantics and defaults exactly; the fourth is inserted, not substituted. |
| Event log (M2) | Department scoping is additive columns on projections rebuilt from the log. A replayed v1 Engagement fires the same events it always did (§9); new department lifecycle events fire only at substrate seed time, outside any replayed Engagement. |
| Work Order (M6, ADR-0010) | Gains `department_id` and `application_id`, both nullable — a Work Order with no `department_id` behaves exactly as v1 (`/docs-v2/01-migration-strategy.md` §2). |
| Department Pack (M13) | The Pack is the Layer-3 artifact this Layer-1 substrate will load. M11 defines the boundary the Pack manifest declares against; M13 freezes the Pack format and installs the first real ones. The implicit default department is a substrate-generated department with no Pack. |
| Exchange (M13) | M11 defines the **communication face** as a compile-time boundary — a department may not name another department, only a capability contract (ADR-0013). The routing engine that resolves contracts and carries traffic is M13; at M11, with one department, it is unused (`/docs-v2/01-migration-strategy.md` §4 step 4). |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | The running v1 Firm behaves byte-for-byte identically after the substrate lands | §9 replay-equivalence harness; the exit criterion (AC1); implicit default department (§4.2, ADR-0040) |
| G2 | A department is a boundary with five enforced faces, not a label | §3; each face enforced by an existing kernel choke point (§5–§8); property tests I-12–I-14 |
| G3 | The kernel contains no department-specific logic | §6; CI kernel-neutrality grep (`/MASTER_IMPLEMENTATION_GUIDE.md` §7); AC6 |
| G4 | A cross-department request names a contract, never a department | §8; compile-time refusal of a manifest naming a department (ADR-0013); AC5 |
| G5 | The fourth budget ceiling contains a runaway department without stopping the Firm | §5; ADR-0020; exhaustion pauses one department and raises one Approval Request; AC4 |
| G6 | Everything is additive and forward-only | §Persistence; migrations `0002`–`0006`, all-nullable columns, null = v1 behaviour; `/docs-v2/01-migration-strategy.md` §2; AC7 |
| G7 | Nothing is visible to the Principal | §1.4; no Rail, keymap, Brief, or notification change; AC2 |
| G8 | Isolation is a compile/test property, not a claim | §9, §Acceptance; invariants I-12–I-17 are property tests shipped **with** M11, not after (`/docs-v2/01-risk-analysis.md` R-02 residual) |
| G9 | The boundary is reversible at every step | §Failure; feature flag for steps 1–4; a null scoping restores v1 (`/docs-v2/01-migration-strategy.md` §5) |

---

## 3. The department boundary model

Principle 11 says a department is a boundary. `/docs-v2/01-enterprise-architecture.md` §5 and
`/docs-v2/03-department-architecture.md` §4 write that boundary down as **five faces**, each enforced by an
existing kernel component. The substrate's whole job is to make these five faces real and to make the sixth
row — the implicit default department — behave as the absence of a boundary.

### 3.1 The five faces

| # | Face | Isolation mechanism | Enforced by | v1-equivalent default (implicit dept) |
|---|---|---|---|---|
| F-mem | **Memory namespace** | Episodic, Semantic, Procedural writes go to `dept.<id>.*`. Reads outside the namespace require a granted, scoped, expiring read. Canon is global, read-only to departments. | Memory Service (M5) | `namespace = NULL` → global v1 namespace; every agent reads/writes as v1 |
| F-cap | **Capability ceiling** | Every agent grant ⊆ the department grant ⊆ what the Principal approved. Three nested subsets, checked at issue time. | Permission Broker (M3) | `department_id = NULL` → no intermediate ceiling; agent grant ⊆ Principal approval, exactly as v1 |
| F-bud | **Budget sub-ceiling** | The fourth nested ceiling (turn → engagement → **department** → month). Exhaustion pauses the department, not the Firm. | Model Gateway (M4) | `department_id = NULL` on `budgets` → the three v1 ceilings apply unchanged (ADR-0020 reversal: share 1.0, no cap = v1) |
| F-fs | **Filesystem scope** | Writes confined to `Artifacts/<dept>/**`. A Deliverable that must land elsewhere is moved by the orchestrator after review, not written across the boundary. | Permission Broker (M3) | No `write_scope` → v1 unscoped Artifacts writes |
| F-comm | **Exchange-only communication** | No direct invocation of another department's agents, memory, or tools. Only a typed `department.request` naming a **contract**, resolved by the Registrar. | Exchange (M13; boundary defined here) | One department → no cross-department request is ever formed; the face is a no-op |

The sixth and seventh isolation items in `/docs-v2/03-department-architecture.md` §4 — Standards precedence and
Quarantine — are **not** M11 faces of the substrate. Standards ship as an empty set at M11 ("No standards means
no change", `/docs-v2/01-migration-strategy.md` §4 step 3) and are resolved by the Standards Engine (M13);
Quarantine is a Registrar behaviour meaningful only with more than one department (M13). The substrate reserves
their seams (§Persistence) and enforces nothing for them at M11.

### 3.2 Containment diagram

```
                         PRINCIPAL APPROVAL  (the outermost ceiling — what the Principal granted)
   ┌───────────────────────────────────────────────────────────────────────────────────┐
   │  DEPARTMENT  (a boundary)                                                          │
   │  ┌────────────────────────────────────────────────────────────────────────────┐   │
   │  │  F-mem   namespace  dept.<id>.*        │  F-bud  share × Division  ≤ ceiling │   │
   │  │  F-cap   grant ⊆ department grant      │  F-fs   Artifacts/<id>/**           │   │
   │  │  ┌──────────────┐  ┌──────────────┐                                          │   │
   │  │  │ Agent Inst.  │  │ Agent Inst.  │   each grant ⊆ department grant (F-cap)  │   │
   │  │  └──────────────┘  └──────────────┘   each write ∈ Artifacts/<id> (F-fs)     │   │
   │  └────────────────────────────────────────────────────────────────────────────┘   │
   │                    │  F-comm: the ONLY egress from the boundary                    │
   │                    ▼                                                                │
   │        department.request → to_contract (a contract name, never a department)      │
   └───────────────────────────────────────────────────────────────────────────────────┘

   THE IMPLICIT DEFAULT DEPARTMENT (M11):  every face set to its v1-equivalent null →
   the boundary is present in the schema but transparent in behaviour  (ADR-0040)
```

At M11 the whole Firm runs inside the single implicit default department. Every face is present as a column and
a code path, and every face is set to its null value, so the boundary is structurally installed and behaviourally
absent. That is precisely the state the replay test asserts (§9).

---

## 4. Domain model

### 4.1 Core types (in `packages/domain`, pure, no I/O — `/docs/01-technical-architecture.md` §6)

```
DepartmentId(String)          // stable id, e.g. "backend"; the implicit default has a reserved id (§4.2)
DivisionId(Option<String>)    // the department's Division; None at M11 (Divisions are M12)
MemoryNamespace(Option<String>)   // "dept.<id>"; None = the global v1 namespace (F-mem)
CapabilityCeiling(Set<Capability>)// the department grant; the F-cap intermediate subset
BudgetSubCeiling { share: f64, ceiling_hard: Cents }  // the fourth ceiling (F-bud, ADR-0020)
FsScope { write: [Glob], read: [Glob] }               // F-fs; empty = v1 unscoped
ContractName(String)          // "capability.code-review"; what a request names (F-comm, ADR-0013)
ApplicationId(Option<String>) // Layer-5 join key; None at M11 (Applications are M13)
```

`DepartmentId`, `EffectClass`, and `Capability` are the vocabulary later milestones type against; M16's grant
record carries a `DepartmentId` from here (M16 architecture §4.1). This crate is where `DepartmentId` is first
exported; the substrate confirms no earlier crate already defines it before introducing it.

### 4.2 The implicit default department

```
Department {
    id:            DepartmentId,        // reserved "__default__" (never collides with a Pack id — install check)
    division:      DivisionId,          // None
    namespace:     MemoryNamespace,     // None  → global v1 namespace (F-mem)
    ceiling:       CapabilityCeiling,   // = the Principal-approved firm capability set (no narrowing; F-cap)
    budget:        BudgetSubCeiling,    // { share: 1.0, ceiling_hard: <the v1 monthly ceiling> }  (F-bud)
    fs_scope:      FsScope,             // empty → v1 unscoped Artifacts writes (F-fs)
    provides:      [ContractName],      // empty
    requires:      [ContractName],      // empty  → no request is ever formed (F-comm)
    pack:          None,                // substrate-generated; it has no Department Pack
    state:         Operating,
}
```

The implicit default department is **the migration bridge** (ADR-0040). It is a real `Department` row so that
every code path that consults a department finds one, but every face carries its null value so behaviour is
identical to v1. A v1 `agents` row with `department_id = NULL` resolves to `__default__` at read time; nothing
about the row is rewritten (`/docs-v2/01-migration-strategy.md` §3: "Every v1 agent keeps its ID, its memory,
its history, and its KPI record"). This is the single mechanism by which the entire v1 Firm participates in the
boundary substrate while the replay test stays green.

### 4.3 Aggregates and relationships

```
Department        1 ──── * AgentInstance          (an instance exists in exactly one department — layer-model §4)
Department        1 ──── 0..1 MemoryNamespace      (None on the implicit default)
Department        1 ──── 1 CapabilityCeiling       (F-cap intermediate subset)
Department        1 ──── 1 BudgetSubCeiling        (the fourth ceiling, F-bud)
Department        1 ──── 1 FsScope                  (empty on the implicit default)
Department        * ──── * ContractName             (provides / requires — never a DepartmentId, ADR-0013)
AgentInstance     * ──── 1 Department               (the boundary it lives in; NULL → __default__)
WorkOrder         * ──── 0..1 Department            (nullable; NULL → __default__ → v1 behaviour)
Engagement        * ──── 0..1 DivisionId            (nullable; NULL → unscoped, M12 fills it)
```

An `AgentInstance` inherits its department's ceiling as its own upper bound and cannot be promoted, borrowed,
or shared (`/docs-v2/02-layer-model.md` §4). At M11 every instance lives in `__default__`, so this constraint
is present but never binds. The `Department`/`AgentInstance` distinction is the archetype-vs-instance model
(ADR-0014); M11 introduces the boundary the instance lives in, not the archetype resolution machinery, which
is M13.

---

## 5. The four nested budget ceilings (ADR-0020)

v1 has three nested ceilings — **turn → engagement → month** ($150 default) — each checked before a model call,
exhaustion pausing the work and raising an Approval Request rather than degrading silently (ADR-0020 Context;
`/docs/04-database-design.md` §4 `budget_ledger`). The substrate inserts a fourth:

```
   turn  ⊂  engagement  ⊂  DEPARTMENT  ⊂  month
                          └── NEW (F-bud): share of the Division's allocation + ceiling_hard
```

- The department ceiling is declared in the manifest as a `share` of the Division's allocation plus a
  `ceiling_hard` absolute cap; Division allocations are set by Kai within the monthly ceiling (ADR-0020
  Decision). At M11 there is one department and no Division, so its share is `1.0` and its `ceiling_hard` is
  the v1 monthly ceiling — the fourth ceiling collapses onto the third, which is exactly the ADR-0020 reversal
  condition ("Setting every share to 1.0 with no hard cap restores v1 behaviour").
- **The three v1 ceilings keep their semantics and defaults exactly.** The fourth is *inserted, not
  substituted* (ADR-0020 Decision). This is what keeps the replay test green: a replayed v1 Engagement hits
  the same turn/engagement/month checks it always did, plus a department check that never triggers because the
  implicit department's share is 1.0.
- Exhaustion **pauses the department** and raises one Approval Request. It does not stop the Firm and it does
  not silently downgrade the Model Class (ADR-0020 Decision; v1 rule unchanged). At M11 this path exists but is
  unreachable, because pausing the only department would pause the Firm — so the substrate ships the check and
  the property test (I-14) but the behaviour first becomes observable at M12, when a second department exists.
- **Autoscaling never raises spend** (ADR-0020). Out of M11 scope (autoscale is M12–M13), but the ceiling that
  makes the rule enforceable is laid here.

The Model Gateway is parameterised by an optional `department_id`; a null `department_id` means "no fourth
ceiling," which is v1. No Gateway code names a department (§6).

---

## 6. Kernel neutrality

**The defining constraint of Layer 1: the kernel contains no department-specific logic**
(`/docs-v2/02-layer-model.md` §1; `/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 12). No `if department ==
"game-studio"`, no hardcoded list of the twenty-one. The kernel knows what a department *is* — a scope
conforming to the boundary contract of §3 — and nothing about which ones exist.

### 6.1 The rule as a build gate

A CI check greps every kernel crate for any department identifier and fails the build on a hit
(`/docs-v2/02-layer-model.md` §1; `/MASTER_IMPLEMENTATION_GUIDE.md` §7 "Kernel neutrality — Any kernel crate
contains a department identifier *(from M11)*"). M11 is the milestone that introduces this gate. The corpus of
forbidden identifiers is the set of Pack ids (backend, cybersecurity, game-development, …) plus the reserved
`__default__` used anywhere it would branch behaviour. The reserved id may appear only in the substrate's own
default-construction path, which is data, not a behavioural branch — the check allowlists exactly that one
construction site and nothing else.

### 6.2 Refactoring existing kernel code to be department-parametric

The substrate touches four existing kernel components (Permission Broker, Memory Service, Model Gateway,
orchestrator). Each is refactored to accept an **optional `DepartmentId`** and to derive the relevant face from
the `Department` record, never from a name:

| Component | Before (v1) | After (M11) — department-parametric, no branch on identity |
|---|---|---|
| Permission Broker (M3) | grant ⊆ Principal approval | grant ⊆ `department.ceiling` ⊆ Principal approval, where `department` is resolved by id; `NULL` → the implicit default, whose ceiling *is* the Principal approval (no narrowing) |
| Memory Service (M5) | global namespace | writes prefixed by `department.namespace`; `None` → the global prefix (unchanged bytes) |
| Model Gateway (M4) | three ceilings | four ceilings, the fourth read from `department.budget`; `NULL` → share 1.0 → no fourth check |
| Orchestrator (M6) | Work Orders unscoped | Work Order carries an optional `department_id`; scheduling and audit read it as data; `NULL` → unscoped |

None of these introduces `if department == …`. Each reads a field off a `Department` value resolved by id. The
difference is the whole point of ADR-0011's dependency-direction rule applied to the organisation
(`/docs-v2/02-layer-model.md` preamble): the kernel depends on the *shape* of a department, never on the
*catalogue* of them, which is what keeps layers 3–8 replaceable.

---

## 7. Memory-namespace isolation and filesystem scoping

### 7.1 Memory (F-mem)

The five memory layers, hybrid retrieval, Night-Shift consolidation, and Canon trust levels are v1 verbatim
(`/docs-v2/01-enterprise-architecture.md` §7). The substrate adds one thing: a `namespace` column on
`memory_chunks` (`/docs-v2/02-implementation-changes.md` §3). Writes go to `dept.<id>.*`; retrieval is scoped
to the caller's namespace plus any granted, scoped, expiring read; Canon is global and read-only to departments
(`/docs-v2/03-department-architecture.md` §4.1). A `NULL` namespace is the global v1 namespace, so every v1
chunk remains retrievable exactly as before and every v1 retrieval returns the same set — which the replay test
depends on (§9). Property test **I-13**: an agent never reads another department's namespace without a granted,
scoped, expiring read (`/docs-v2/02-implementation-changes.md` §5). At M11, with one namespace, the property
holds vacuously and the test asserts the mechanism, not a scenario — the scenario arrives at M13.

### 7.2 Filesystem (F-fs)

Writes are confined to `Artifacts/<dept>/**`; reads outside require a grant
(`/docs-v2/01-enterprise-architecture.md` §5). A Deliverable that must land elsewhere is *moved by the
orchestrator after review*, never written across the boundary by the agent
(`/docs-v2/03-department-architecture.md` §4.4). Enforced by the Permission Broker as an effect-class check on
the write path, not by the filesystem. The implicit default department has an empty `write_scope`, meaning v1
unscoped Artifacts writes — identical bytes on identical paths. Property test **I-12**: an agent never writes
outside its department's filesystem scope (`/docs-v2/02-implementation-changes.md` §5), vacuous at M11, binding
at M13.

---

## 8. Exchange-only communication as the substrate contract (ADR-0013)

Cross-department work is a typed, budgeted, logged `department.request` — a Work Order with two extra fields,
not a new mechanism, which is why v1's ADR-0010 does most of the work (`/docs-v2/03-department-architecture.md`
§5). The substrate's contribution at M11 is to make the **communication face a compile-time boundary**, even
though no request will ever be formed while there is one department:

- **A request names a contract, never a department** (`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 11, ADR-0013).
  `requires.contracts` may name only a capability contract (`capability.code-review`), resolved at install by
  the Registrar; naming a department is a hard install refusal (`/docs-v2/03-department-architecture.md` §2
  manifest rule; §8 install check 3; `/docs-v2/02-layer-model.md` §3). M11 introduces and enforces this check
  so that the very first Pack authored (M13) cannot name a department by construction.
- **Cost follows the requester.** Backend asking Cybersecurity for a review spends Backend's budget, or a
  useful department is punished for being useful and the budget signal inverts (ADR-0020; §5). The rule is
  encoded in the request envelope's budget attribution field, defined here, exercised at M13.
- **Depth limit of 2; cycles refused at compile time** (`/docs-v2/03-department-architecture.md` §5). The
  Exchange builds the request graph per Engagement and rejects a cycle immediately, mirroring the workflow
  engine's DAG validation. Property test **I-15**: the Exchange refuses cycles and depth > 2
  (`/docs-v2/02-implementation-changes.md` §5). At M11 the graph is always empty, so the test asserts the
  validator on synthetic graphs.

At M11 the Exchange "ships, unused while there is one department" (`/docs-v2/01-migration-strategy.md` §4 step
4). The substrate therefore delivers the *contract* — the type, the manifest rule, the compile-time refusals,
and the property tests — while the routing engine that carries real traffic is M13. This is the faithful reading
of "M11 lays the substrate and runs the whole Firm as one implicit department."

---

## 9. The migration and replay-equivalence strategy

### 9.1 The acceptance test, exactly (ADR-0041; `/docs-v2/01-migration-strategy.md` §6)

> Take a complete v1 Engagement from the event log — a Directive, its Mandate, its Work Orders, its
> Deliverables, its Brief. Replay it against a v2 kernel with the implicit-default-department manifest, with
> model calls stubbed by recorded responses. **The Brief must be byte-identical.**

If it is, the substrate is an extension. If it is not, the substrate changed something it claimed not to
change, and the byte-level difference identifies exactly what (`/docs-v2/01-migration-strategy.md` §6).

### 9.2 What "byte-identical Brief" means precisely

- **The compared artifact is the `briefs` projection row** (`/docs/04-database-design.md` §2), serialised
  canonically — `situation`, `actions`, `findings`, `recommendation`, `the_ask`, `confidence` — for the
  replayed Engagement. Byte-identical means the canonical serialisation of the v2-produced Brief equals that of
  the recorded v1 Brief, octet for octet.
- **Model calls are stubbed by recorded responses** (`/docs-v2/01-migration-strategy.md` §6). The test asks
  whether the *machinery* is equivalent, not whether models produce identical text — which they would not do
  twice in a row anyway. Anything involving a *live* model call is explicitly out of the test's scope and is
  covered by the evaluation sets, the right instrument for it (`/docs-v2/01-migration-strategy.md` §6).
- **The event stream of the replayed Engagement is unchanged.** Because the Brief is a projection of the event
  log (ADR-0002), byte-identity of the Brief implies the substrate introduced no new event into the replayed
  Engagement's stream and reordered none. New department lifecycle events (§Persistence) fire only at substrate
  **seed** time — creating the implicit default department at upgrade — which is outside any replayed
  Engagement. This is the architectural reason the substrate can add event kinds and still replay byte-identically.

### 9.3 The harness

```
recorded v1 Engagement (events)  ──► REPLAY  ──►  v2 kernel + __default__ manifest + stubbed models
                                                        │
                                                        ▼
                                            produced Brief (briefs projection)
                                                        │
   recorded v1 Brief ──────────────────────────────────┴──► assert canonical(A) == canonical(B)  byte-for-byte
```

The harness runs on a **corpus** of recorded Engagements, on every commit to M11–M14
(`/docs-v2/02-implementation-changes.md` §5 "Replay equivalence"; `/MASTER_IMPLEMENTATION_GUIDE.md` §7). It is
the same technique v1 specified for charter regressions, applied to the architecture itself
(`/docs-v2/01-migration-strategy.md` §6). It is the **gate on every step** of the migration sequence
(`/docs-v2/01-migration-strategy.md` §4), and it is M11's exit criterion.

---

## Persistence — migrations `0002`–`0006` (additive, forward-only)

All changes are additive; `/docs/04-database-design.md` remains authoritative for everything existing, and its
§10 migration policy governs (forward-only, numbered, one transaction, each shipping a test against a
prior-release fixture Vault). Every new column is **nullable with a v1-equivalent default**, so a Firm with no
department scoping behaves exactly as it did before M11 (`/docs-v2/01-migration-strategy.md` §2).

> **Migration-band note.** This package uses band **`0002`–`0006`** per the milestone facts governing M11.
> `/docs-v2/02-implementation-changes.md` §3 names an older band (`0012_departments.sql`–`0018_applications.sql`)
> that predates the single-global-numbering reconciliation (ADR-0032) and additionally folds M12–M14 tables
> (standards, guards, registries, applications, exchange_requests) into the same list. The substrate scope of
> M11 needs only the five migrations below; the deferred tables land in their owning milestones. The older
> numbering is a non-blocking documentation discrepancy to reconcile on integration (see `00-M10-AUDIT.md` §2).

| Migration | Adds | v1 behaviour when null / absent |
|---|---|---|
| `0002_departments.sql` | `departments` table extended to the boundary record: `division_id`, `namespace`, `capability_ceiling` (JSON), `budget_share` REAL, `ceiling_hard_cents` INTEGER, `fs_write_scope` (JSON), `fs_read_scope` (JSON), `provides` (JSON contracts), `requires` (JSON contracts), `pack_id` nullable, `state`. Seeds the **implicit default department** row (`__default__`, all faces null). | The seed row is the only department; every existing agent resolves to it |
| `0003_agent_department_scoping.sql` | `agents`: `department_id`, `archetype_id`, `archetype_version`, `instance_number` — all nullable (`/docs-v2/02-implementation-changes.md` §3) | `NULL` → the implicit department; the agent is a v1 agent unchanged |
| `0004_memory_fs_scoping.sql` | `memory_chunks`: `namespace` (nullable); records the F-fs scope projection for departments | `NULL namespace` → global v1 namespace; empty fs scope → v1 unscoped |
| `0005_budget_department_ceiling.sql` | `budgets` / `budget_ledger`: `department_id` (nullable); the fourth-ceiling bookkeeping | `NULL` → the three v1 ceilings apply unchanged (ADR-0020) |
| `0006_workorder_engagement_scoping.sql` | `work_orders`: `department_id`, `application_id`; `engagements`: `division_id`, `application_id`; `deliverables`: `department_id` — all nullable (`/docs-v2/02-implementation-changes.md` §3); registers the replay-fixture corpus schema | `NULL` → unscoped, exactly as v1 |

Additive columns only; **no existing column's meaning changes** (`/docs-v2/01-migration-strategy.md` §2). Each
migration is independently deployable and reversible while unread (feature flag off; `/docs-v2/01-migration-strategy.md`
§5 steps 1–4).

### Domain events on the hash chain

The substrate defines department-lifecycle event kinds — a minimal subset of the M11–M14 set in
`/docs-v2/02-implementation-changes.md` §3, restricted to what the substrate itself produces:
`department.installed` and `agent.instantiated`. **These fire only at substrate seed time** (creating and
staffing the implicit default department at upgrade), never inside a replayed v1 Engagement — which is why the
Brief stays byte-identical (§9.2). Both carry `actor`, `department_id`, and land on the append-only hash chain
(ADR-0002; `/docs/04-database-design.md` §4 `events`). No event kind is removed or redefined
(`/docs-v2/01-migration-strategy.md` §2). The message-kind count (12 → 14, adding `department.request` and
`standard.violation`, ADR-0016) is reserved by the substrate but neither kind is *sent* at M11: one department
sends no `department.request`, and an empty standards set raises no `standard.violation`.

### Public commands and queries touched

| Surface | Change | Rule preserved |
|---|---|---|
| `engagement.create`, `mandate.authorize` (M6) | accept an optional `department_id` / `division_id`; default to the implicit department | No command removed; v1 commands work identically (`/docs-v2/01-migration-strategy.md` §2) |
| Query: agent → department resolution | `resolve_department(agent) -> DepartmentId` (returns `__default__` for a null scoping) | Read-only; a projection query, rebuildable from the log |
| Query: `department_budget(department)` | month-to-date spend vs the fourth ceiling | Reads `budget_ledger`; null department → the firm ceiling, i.e. v1 |
| No new Principal-facing command | — | G7 / AC2: nothing visible changes |

---

## Sequence diagrams

### S1 — An Engagement running through the implicit department (the invisible path)

```
Principal      Orchestrator(M6)     Registrar(substrate)   Broker(M3)   Memory(M5)   Gateway(M4)
   │ Directive       │                     │                  │            │            │
   ├────────────────►│ engagement.create   │                  │            │            │
   │                 │ resolve_department(agent) ────────────►│            │            │
   │                 │◄───────────── __default__ (dept_id NULL)│            │            │
   │                 │ Work Order (department_id = __default__)│            │            │
   │                 ├── authorize_action ────────────────────►│ grant ⊆ __default__     │
   │                 │◄──────────── Allow (ceiling = Principal approval, no narrowing) ──┤
   │                 ├── retrieve (namespace = None → global) ─────────────►│            │
   │                 │◄──────────── same chunks as v1 ────────────────────  │            │
   │                 ├── model call (ceilings: turn⊂eng⊂__default__(share 1.0)⊂month) ──►│
   │                 │◄──────────── same routing, fourth ceiling never triggers ────────┤
   │                 │ … Deliverables · Review (author≠reviewer) · Brief …              │
   │◄─── Brief ──────┤  (byte-identical to v1 — every face resolved to its null)        │
```

### S2 — The replay-equivalence assertion (the exit criterion)

```
CI            ReplayHarness            v2 Kernel(+__default__)        Comparator
 │ run corpus      │                          │                          │
 ├────────────────►│ load recorded Engagement │                          │
 │                 ├── replay events ─────────►│ stub model calls with    │
 │                 │                          │ recorded responses       │
 │                 │                          ├── produce Brief ─────────►│
 │                 │  load recorded v1 Brief ─┼──────────────────────────►│
 │                 │                          │      assert canonical(v2) │
 │                 │                          │      == canonical(v1)     │
 │◄─── GREEN if byte-identical for every Engagement in the corpus; RED names the diff ──┤
```

---

## Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | A replayed Engagement's Brief differs by one byte | The substrate changed something it claimed not to; RED build; the diff localises the offending face (`/docs-v2/01-migration-strategy.md` §6). Not overridable — it is the exit criterion. |
| F2 | A kernel crate gains a department identifier | CI kernel-neutrality grep fails the build (§6; `/MASTER_IMPLEMENTATION_GUIDE.md` §7). |
| F3 | A migration is applied twice | Idempotent by the v1 store rule; the second application is a no-op (`/docs/04-database-design.md` §10). |
| F4 | The implicit-department feature flag is turned off | Steps 1–4 are behind a flag; off restores the pre-substrate kernel with unused columns (`/docs-v2/01-migration-strategy.md` §5). No data loss (Principle 3). |
| F5 | A Pack (future) declares its id as `__default__` | Hard install refusal — the reserved id is not registrable (§4.2 install check). |
| F6 | A future manifest names a department in `requires.contracts` | Hard install refusal at the compile-time boundary (§8; `/docs-v2/03-department-architecture.md` §8 check 3). |
| F7 | A department exhausts its sub-ceiling | Pauses that department and raises one Approval Request; the Firm continues (§5, ADR-0020). Unreachable at M11 (one department); the mechanism and I-14 ship regardless. |
| F8 | A cross-namespace read without a grant | Denied by the Memory Service (F-mem, I-13). Vacuous at M11; the mechanism is tested on synthetic scopes. |

---

## Performance and offline

- **The idle-memory budget is the one at risk.** The v1 budgets hold and are re-verified: cold start ≤1.2 s,
  60 fps, idle ≤400 MB, and these are CI gates from M1 (`/docs-v2/02-implementation-changes.md` §5;
  `/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 16, §7). At M11 there is one department and the v1 agent set, so the
  footprint is v1's; the substrate adds columns and resolution logic, not resident agents. Lazy instantiation
  (ADR-0014) is what protects the idle budget as departments arrive later, and if the budget is exceeded the
  correct response is to instantiate less, not to raise the number (`/docs-v2/02-implementation-changes.md` §5).
- **Latency and token count are release gates.** Median Directive-to-Brief latency and Principal-facing token
  count are measured against the v1 baseline; a regression is a blocker, not a note (`/docs-v2/01-risk-analysis.md`
  R-01). The substrate adds no hop and no review, so at M11 both are v1's by construction — which the replay
  test's byte-identity also implies.
- **Offline is v1 offline, unchanged.** The substrate touches no outbound path; the Layer-6 replaceability test
  (disconnect everything, local work continues) is unaffected (`/docs-v2/02-layer-model.md` §9).

---

## Dependencies, assumptions, risks

### Dependencies

| On | For |
|---|---|
| M2 — event log, hash chain | department events on the chain; the Brief-as-projection property the replay test relies on (ADR-0002) |
| M3 — Permission Broker, capability model | the F-cap and F-fs faces; the single choke point parameterised by department |
| M4 — Model Gateway, three ceilings | the F-bud fourth ceiling inserted between engagement and month (ADR-0020) |
| M5 — memory namespaces | the F-mem face; a `namespace` column on the existing store |
| M6 — orchestrator, Work Orders (ADR-0010) | the routing envelope that gains two optional fields |

### Assumptions

1. **The three enabling v1 decisions hold** (event log as source of truth, typed Work Orders, kernel as
   library). If any had gone the other way, the substrate would be a rewrite (`/docs-v2/01-migration-strategy.md`
   §1). They hold; this is the strongest argument for the v1 documents that looked over-engineered at the time.
2. **A corpus of recorded v1 Engagements exists to replay against.** The substrate's exit criterion is a test
   over that corpus; without recordings there is nothing to assert byte-identity against. Recording is a v1
   capability (the event log is complete); the substrate assumes the corpus is captured before the harness runs.
3. **The Registrar/Exchange/Standards/Guard machinery lands empty in this band.** `/docs-v2/01-migration-strategy.md`
   §4 steps 3–4 ship Standards and Guards with an empty set and the Exchange unused. The substrate assumes those
   components exist as no-ops (empty projections), which is consistent with M11 delivering the seam and M12–M13
   delivering the behaviour.

### Risks

| # | Risk | Mitigation |
|---|---|---|
| R-01 (release-defining) | **The organisation becomes the product** — machinery whose purpose is one page with one ask makes the Firm impressive to describe and slow to use (`/docs-v2/01-risk-analysis.md` R-01) | **Invisibility mitigates it at M11 directly:** the substrate adds no hop, no review, no token, and the exit criterion is byte-identity — so there is *nothing* to regress at M11 by construction. The risk becomes live at M12 when structure appears; M11's job is to hold the baseline the later gates measure against (`/docs-v2/01-risk-analysis.md` R-01 residual "cannot be designed away, only measured"). |
| R-02 | **Isolation claimed but not enforced** — a boundary that erodes one reasonable exception at a time (`/docs-v2/01-risk-analysis.md` R-02) | Faces enforced by the existing Broker/Memory/Gateway, one enforcement point not many; invariants I-12–I-17 are property tests shipped **with** M11, not after — the residual is low only if they ship on time (R-02 residual). |
| R-03 | The substrate's added columns/logic regress the idle or latency budget | CI performance gates from M1; the substrate adds no resident agent (lazy instantiation, ADR-0014); AC7 asserts additivity |
| M11-R1 | A new event kind leaks into a replayed Engagement and breaks byte-identity | Department events fire only at seed time, outside any replayed Engagement (§9.2); audit-coverage test asserts the replayed stream is unchanged |
| M11-R2 | The reserved `__default__` id becomes a behavioural branch, quietly re-introducing department-specific logic | The kernel-neutrality grep allowlists exactly one construction site; any other occurrence fails the build (§6.1) |

---

## Acceptance criteria

The exit criterion decomposed into testable claims. **These are the contract with AntiGravity.** The exit
criterion is AC1; the remaining criteria are the conditions under which AC1 is meaningful.

| # | Claim | Proven by |
|---|---|---|
| AC1 | **A recorded v1 Engagement replayed against the v2 substrate produces a byte-identical Brief**, with model calls stubbed, for every Engagement in the corpus | the replay-equivalence harness (§9; ADR-0041); the CI replay gate |
| AC2 | **Nothing is visible to the Principal** — no Rail change, no keymap rebind, no Brief field, no new notification | zero-diff UI assertion; the corpus Briefs are byte-identical (AC1 implies the Principal-facing surface is unchanged) |
| AC3 | **The kernel-neutrality grep passes** — no kernel crate contains a department identifier outside the one allowlisted default-construction site | CI kernel-neutrality check (§6; `/MASTER_IMPLEMENTATION_GUIDE.md` §7) |
| AC4 | **F-bud enforced & tested** — the fourth ceiling exists between engagement and month; exhaustion pauses a department and raises one Approval Request; the three v1 ceilings are unchanged | I-14 property test (budget exhaustion pauses one department, Firm continues); ADR-0020 reversal check (share 1.0 = v1) |
| AC5 | **F-comm enforced & tested** — a manifest naming a department in `requires.contracts` is refused at install; the Exchange refuses cycles and depth > 2 | install-refusal test (§8, check 3); I-15 on synthetic request graphs |
| AC6 | **F-cap enforced & tested** — an agent grant is a subset of its department ceiling, which is a subset of the Principal approval; the implicit default's ceiling equals the Principal approval | Permission Broker property test over nested subsets; a replayed grant resolves identically |
| AC7 | **F-mem & F-fs enforced & tested** — writes are namespaced and fs-scoped per department; a null namespace/scope is v1 behaviour; no cross-namespace read without a grant | I-12 (no cross-scope write), I-13 (no cross-namespace read) property tests (`/docs-v2/02-implementation-changes.md` §5) |
| AC8 | **Everything is additive & forward-only** — migrations `0002`–`0006` are forward-only, idempotent, independently deployable; a null-scoped Firm is byte-for-byte pre-M11 | migration tests against a prior-release fixture Vault (`/docs/04-database-design.md` §10); AC1 is the end-to-end proof |
| AC9 | **Department lifecycle events land on the hash chain and none enters a replayed Engagement** | `audit.verify` over a seed-then-replay fixture; asserts the replayed stream is unchanged (§9.2) |

---

## Appendix A — Glossary additions

- **Department substrate** — the Layer-1 kernel machinery (`sidra-departments`) that makes the department
  boundary enforceable: the five faces, the implicit default department, and the replay harness. It installs
  the boundary; it ships no visible structure.
- **The five faces** — memory namespace, capability ceiling, budget sub-ceiling, filesystem scope, and
  Exchange-only communication: the mechanical content of "a department is a boundary" (`/docs-v2/03-department-architecture.md`
  §4; `/docs-v2/01-enterprise-architecture.md` §5).
- **Implicit default department** — the single, invisible, substrate-generated department (`__default__`) in
  which the entire v1 Firm runs at M11, every face set to its v1-equivalent null. The migration bridge (ADR-0040).
- **Fourth ceiling** — the department budget sub-ceiling inserted between the engagement and month ceilings
  (ADR-0020). At M11 its share is 1.0 and it collapses onto the monthly ceiling.
- **Replay equivalence** — the property that a recorded v1 Engagement produces a byte-identical Brief when
  replayed against the substrate with model calls stubbed; M11's exit criterion and a permanent CI gate on
  M11–M14 (ADR-0041; `/docs-v2/01-migration-strategy.md` §6).
- **Kernel neutrality** — the Layer-1 rule that the kernel contains no department-specific logic, enforced by a
  CI grep (`/docs-v2/02-layer-model.md` §1).

## Appendix B — Repository placement

```
services/
└── departments/                NEW — crate sidra-departments
    ├── domain          (Department, DepartmentId, the five-face value types, the implicit default)
    ├── boundary        (the five faces as parameterisation of Broker / Memory / Gateway / orchestrator)
    ├── registrar       (department resolution: agent → DepartmentId; __default__ seed)  — instantiation UI is M13
    ├── exchange        (the department.request contract type + compile-time refusals)   — routing engine is M13
    └── replay          (the replay-equivalence harness — the exit criterion)

packages/domain/                EXTENDED — DepartmentId, MemoryNamespace, CapabilityCeiling, BudgetSubCeiling,
                                           FsScope, ContractName, ApplicationId

services/security/              REFACTORED — Broker parameterised by optional DepartmentId (no name branch)
services/memory/                REFACTORED — namespace-scoped retrieval (None = global)
services/models/                REFACTORED — the fourth ceiling (null = three v1 ceilings)
services/orchestrator/          REFACTORED — Work Orders carry optional department_id/application_id

services/store/migrations/      EXTENDED — 0002_departments.sql … 0006_workorder_engagement_scoping.sql
infrastructure/ci/              EXTENDED — kernel-neutrality grep (new); replay-equivalence gate (new)
infrastructure/testing/
└── departments/                NEW — replay corpus harness, I-12…I-15 property tests, seed/replay audit fixture
```

Dependency direction (ADR-0011; `/docs/01-technical-architecture.md` §6): `packages/domain ← services/departments
← apps/*`. `sidra-departments` depends on `sidra-domain`, `sidra-store`, `sidra-security`; it is depended upon
by `sidra-orchestrator` and (from M16) `sidra-connectors`. It does **not** depend on `apps/*`. Cycles are a
build failure.

## Appendix C — Implementation position (why M11 must precede M12–M14)

M11 is the first milestone of 2.0 "Concourse" (`/MILESTONE_REGISTRY.md` §4). **It gates M12–M14 absolutely**
(`/MASTER_IMPLEMENTATION_GUIDE.md` §5 critical path; `/docs-v2/02-implementation-changes.md` §2). Building M12's
visible structure before M11's invisible substrate means shipping an interface change before the equivalence
test exists to prove nothing else moved — the single ordering mistake that converts this migration into a
rewrite. The substrate must be **implemented, integrated, and green on the replay-equivalence test** before any
visible structure is built on it, because the whole architecture's claim — that v2 is an extension, not a
rewrite — is exactly what that one test decides (`/docs-v2/01-enterprise-architecture.md` §7).

**Exit criterion.** The replay-equivalence test is green — a recorded v1 Engagement produces a byte-identical
Brief after the substrate lands — and nothing is visible to the Principal (AC1, AC2).
